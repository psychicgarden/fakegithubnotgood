// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MortgageProtocol is ERC20, Ownable, ReentrancyGuard {
    // Property structure
    struct Property {
        uint256 totalValue;
        uint256 downPayment;
        uint256 monthlyPayment;
        bool isActive;
        uint256 totalTokensMinted;
        uint256 monthlyRent;
    }

    // Village structure
    struct Village {
        uint256 membershipFee;
        bool isActive;
        uint256 totalMembers;
        uint256 monthlyYield;
    }

    // State variables
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Village) public villages;
    mapping(address => mapping(uint256 => uint256)) public userPropertyTokens;
    mapping(address => mapping(uint256 => bool)) public villageMemberships;
    mapping(address => uint256) public userTotalInvestments;

    // Events
    event PropertyCreated(uint256 indexed propertyId, uint256 totalValue, uint256 downPayment);
    event MortgageTokensMinted(address indexed owner, uint256 indexed propertyId, uint256 amount);
    event VillageJoined(address indexed member, uint256 indexed villageId, uint256 membershipFee);
    event MonthlyYieldDistributed(address indexed user, uint256 amount);

    constructor() ERC20("Mortgage Protocol Token", "MPT") {
        // Initialize default properties
        properties[1] = Property({
            totalValue: 150000,
            downPayment: 30000,
            monthlyPayment: 1456,
            isActive: true,
            totalTokensMinted: 0,
            monthlyRent: 2050
        });

        // Initialize default villages
        villages[1] = Village({
            membershipFee: 30000,
            isActive: true,
            totalMembers: 0,
            monthlyYield: 594
        });
    }

    // Property Management
    function createProperty(
        uint256 propertyId,
        uint256 totalValue,
        uint256 downPayment,
        uint256 monthlyPayment
    ) external onlyOwner {
        require(!properties[propertyId].isActive, "Property already exists");
        
        properties[propertyId] = Property({
            totalValue: totalValue,
            downPayment: downPayment,
            monthlyPayment: monthlyPayment,
            isActive: true,
            totalTokensMinted: 0,
            monthlyRent: (totalValue * 12) / 100 // 12% annual rent
        });

        emit PropertyCreated(propertyId, totalValue, downPayment);
    }

    function getProperty(uint256 propertyId) external view returns (
        uint256 totalValue,
        uint256 downPayment,
        uint256 monthlyPayment,
        bool isActive
    ) {
        Property memory property = properties[propertyId];
        return (property.totalValue, property.downPayment, property.monthlyPayment, property.isActive);
    }

    // Mortgage Token Management
    function mintMortgageTokens(uint256 propertyId, uint256 amount) external payable nonReentrant {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property not active");
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate required payment (1 AVAX = $1000 for demo)
        uint256 requiredPayment = (amount * 1 ether) / 1000;
        require(msg.value >= requiredPayment, "Insufficient payment");

        // Mint tokens to user
        _mint(msg.sender, amount);
        userPropertyTokens[msg.sender][propertyId] += amount;
        property.totalTokensMinted += amount;
        userTotalInvestments[msg.sender] += amount;

        emit MortgageTokensMinted(msg.sender, propertyId, amount);
    }

    function getMortgageTokens(address owner, uint256 propertyId) external view returns (uint256) {
        return userPropertyTokens[owner][propertyId];
    }

    function calculateMonthlyYield(uint256 propertyId, uint256 tokenAmount) external view returns (uint256) {
        Property memory property = properties[propertyId];
        require(property.isActive, "Property not active");
        
        // Calculate yield based on token ownership percentage
        uint256 ownershipPercentage = (tokenAmount * 10000) / property.totalValue;
        return (property.monthlyRent * ownershipPercentage) / 10000;
    }

    // Village Management
    function joinVillage(uint256 villageId, uint256 membershipFee) external payable nonReentrant {
        Village storage village = villages[villageId];
        require(village.isActive, "Village not active");
        require(!villageMemberships[msg.sender][villageId], "Already a member");
        
        // Calculate required payment
        uint256 requiredPayment = (membershipFee * 1 ether) / 1000;
        require(msg.value >= requiredPayment, "Insufficient payment");

        villageMemberships[msg.sender][villageId] = true;
        village.totalMembers++;

        emit VillageJoined(msg.sender, villageId, membershipFee);
    }

    function getVillageMembership(address user, uint256 villageId) external view returns (bool) {
        return villageMemberships[user][villageId];
    }

    function calculateVillageYield(uint256 villageId, uint256 membershipFee) external view returns (uint256) {
        Village memory village = villages[villageId];
        require(village.isActive, "Village not active");
        
        // Calculate yield based on membership fee
        return (village.monthlyYield * membershipFee) / village.membershipFee;
    }

    // Utility functions
    function getUserTotalInvestments(address user) external view returns (uint256) {
        return userTotalInvestments[user];
    }

    function getPropertyDetails(uint256 propertyId) external view returns (
        uint256 totalValue,
        uint256 downPayment,
        uint256 monthlyPayment,
        uint256 monthlyRent,
        uint256 totalTokensMinted,
        bool isActive
    ) {
        Property memory property = properties[propertyId];
        return (
            property.totalValue,
            property.downPayment,
            property.monthlyPayment,
            property.monthlyRent,
            property.totalTokensMinted,
            property.isActive
        );
    }

    // Withdraw function for contract owner
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 