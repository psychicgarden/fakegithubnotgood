// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract VillageCitizenship is Ownable, ReentrancyGuard, Pausable {
    
    // Citizenship structure
    struct Citizenship {
        uint256 citizenshipId;
        address citizen;
        uint256 membershipFee;
        uint256 joinDate;
        bool isActive;
        uint256 monthlyYield;
        uint256 totalYieldEarned;
        uint256 lastYieldClaim;
    }

    // Village structure
    struct Village {
        uint256 villageId;
        string name;
        uint256 membershipFee;
        uint256 maxCitizens;
        uint256 currentCitizens;
        bool isActive;
        uint256 monthlyYieldPerCitizen;
    }

    // State variables
    mapping(uint256 => Village) public villages;
    mapping(address => mapping(uint256 => Citizenship)) public citizenships;
    mapping(address => uint256[]) public userVillages;
    mapping(uint256 => address[]) public villageCitizens;
    
    uint256 public nextVillageId = 1;
    uint256 public nextCitizenshipId = 1;
    
    // Events
    event VillageCreated(uint256 indexed villageId, string name, uint256 membershipFee, uint256 maxCitizens);
    event CitizenshipPurchased(uint256 indexed citizenshipId, address indexed citizen, uint256 indexed villageId, uint256 membershipFee);
    event YieldClaimed(address indexed citizen, uint256 indexed villageId, uint256 amount);
    event VillageUpdated(uint256 indexed villageId, string name, uint256 membershipFee);

    constructor() {
        // Initialize default village
        villages[1] = Village({
            villageId: 1,
            name: "Ancient Village",
            membershipFee: 0.1 ether, // 0.1 AVAX
            maxCitizens: 1000,
            currentCitizens: 0,
            isActive: true,
            monthlyYieldPerCitizen: 0.01 ether // 0.01 AVAX per month
        });
    }

    // Village Management (Owner only)
    function createVillage(
        string memory name,
        uint256 membershipFee,
        uint256 maxCitizens,
        uint256 monthlyYieldPerCitizen
    ) external onlyOwner {
        require(bytes(name).length > 0, "Village name cannot be empty");
        require(membershipFee > 0, "Membership fee must be greater than 0");
        require(maxCitizens > 0, "Max citizens must be greater than 0");
        
        villages[nextVillageId] = Village({
            villageId: nextVillageId,
            name: name,
            membershipFee: membershipFee,
            maxCitizens: maxCitizens,
            currentCitizens: 0,
            isActive: true,
            monthlyYieldPerCitizen: monthlyYieldPerCitizen
        });
        
        emit VillageCreated(nextVillageId, name, membershipFee, maxCitizens);
        nextVillageId++;
    }

    function updateVillage(
        uint256 villageId,
        string memory name,
        uint256 membershipFee,
        uint256 maxCitizens,
        uint256 monthlyYieldPerCitizen
    ) external onlyOwner {
        require(villages[villageId].villageId != 0, "Village does not exist");
        require(bytes(name).length > 0, "Village name cannot be empty");
        
        villages[villageId].name = name;
        villages[villageId].membershipFee = membershipFee;
        villages[villageId].maxCitizens = maxCitizens;
        villages[villageId].monthlyYieldPerCitizen = monthlyYieldPerCitizen;
        
        emit VillageUpdated(villageId, name, membershipFee);
    }

    function toggleVillage(uint256 villageId) external onlyOwner {
        require(villages[villageId].villageId != 0, "Village does not exist");
        villages[villageId].isActive = !villages[villageId].isActive;
    }

    // Citizenship Functions
    function purchaseCitizenship(uint256 villageId) external payable nonReentrant whenNotPaused {
        Village storage village = villages[villageId];
        require(village.villageId != 0, "Village does not exist");
        require(village.isActive, "Village is not active");
        require(village.currentCitizens < village.maxCitizens, "Village is full");
        require(msg.value >= village.membershipFee, "Insufficient payment");
        require(!citizenships[msg.sender][villageId].isActive, "Already a citizen of this village");
        
        // Create citizenship
        citizenships[msg.sender][villageId] = Citizenship({
            citizenshipId: nextCitizenshipId,
            citizen: msg.sender,
            membershipFee: village.membershipFee,
            joinDate: block.timestamp,
            isActive: true,
            monthlyYield: village.monthlyYieldPerCitizen,
            totalYieldEarned: 0,
            lastYieldClaim: block.timestamp
        });
        
        // Update village
        village.currentCitizens++;
        villageCitizens[villageId].push(msg.sender);
        userVillages[msg.sender].push(villageId);
        
        emit CitizenshipPurchased(nextCitizenshipId, msg.sender, villageId, village.membershipFee);
        nextCitizenshipId++;
    }

    function claimYield(uint256 villageId) external nonReentrant {
        Citizenship storage citizenship = citizenships[msg.sender][villageId];
        require(citizenship.isActive, "Citizenship not active");
        
        uint256 timeSinceLastClaim = block.timestamp - citizenship.lastYieldClaim;
        uint256 monthsSinceLastClaim = timeSinceLastClaim / 30 days;
        
        require(monthsSinceLastClaim >= 1, "Must wait at least 1 month between claims");
        
        uint256 yieldAmount = citizenship.monthlyYield * monthsSinceLastClaim;
        citizenship.totalYieldEarned += yieldAmount;
        citizenship.lastYieldClaim = block.timestamp;
        
        // Transfer yield to citizen
        (bool success, ) = msg.sender.call{value: yieldAmount}("");
        require(success, "Yield transfer failed");
        
        emit YieldClaimed(msg.sender, villageId, yieldAmount);
    }

    // View Functions
    function getVillage(uint256 villageId) external view returns (
        uint256 id,
        string memory name,
        uint256 membershipFee,
        uint256 maxCitizens,
        uint256 currentCitizens,
        bool isActive,
        uint256 monthlyYieldPerCitizen
    ) {
        Village memory village = villages[villageId];
        return (
            village.villageId,
            village.name,
            village.membershipFee,
            village.maxCitizens,
            village.currentCitizens,
            village.isActive,
            village.monthlyYieldPerCitizen
        );
    }

    function getCitizenship(address citizen, uint256 villageId) external view returns (
        uint256 citizenshipId,
        address citizenAddress,
        uint256 membershipFee,
        uint256 joinDate,
        bool isActive,
        uint256 monthlyYield,
        uint256 totalYieldEarned,
        uint256 lastYieldClaim
    ) {
        Citizenship memory citizenship = citizenships[citizen][villageId];
        return (
            citizenship.citizenshipId,
            citizenship.citizen,
            citizenship.membershipFee,
            citizenship.joinDate,
            citizenship.isActive,
            citizenship.monthlyYield,
            citizenship.totalYieldEarned,
            citizenship.lastYieldClaim
        );
    }

    function getUserVillages(address user) external view returns (uint256[] memory) {
        return userVillages[user];
    }

    function getVillageCitizens(uint256 villageId) external view returns (address[] memory) {
        return villageCitizens[villageId];
    }

    function isCitizen(address user, uint256 villageId) external view returns (bool) {
        return citizenships[user][villageId].isActive;
    }

    // Emergency Functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawFunds() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // Receive function to accept AVAX
    receive() external payable {}
}
