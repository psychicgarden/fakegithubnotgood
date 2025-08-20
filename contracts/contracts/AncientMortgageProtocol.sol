// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AncientMortgageProtocol is ERC721, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    // USDT Token Interface
    IERC20 public usdtToken;
    
    // Property structure
    struct Property {
        uint256 propertyId;
        uint256 purchasePrice;
        uint256 downPayment;
        uint256 mortgageAmount;
        uint256 monthlyPayment;
        uint256 interestRate; // 8% = 800 (basis points)
        uint256 termYears;
        uint256 startDate;
        address buyer;
        bool isActive;
        bool isDefaulted;
        uint256 missedPayments;
        uint256 lastPaymentDate;
        uint256 totalPaid;
        uint256 appreciationValue;
        bool appreciationCalculated;
        string propertyMetadata; // IPFS hash for property details
    }

    // Mortgage payment structure
    struct Payment {
        uint256 amount;
        uint256 timestamp;
        uint256 paymentNumber;
        bool isLate;
        string transactionHash;
    }

    // State variables
    Counters.Counter private _propertyIds;
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Payment[]) public paymentHistory;
    mapping(address => uint256[]) public userProperties;
    mapping(uint256 => uint256) public propertyToTokenId;
    mapping(address => bool) public kycVerified;
    mapping(address => uint256) public kycAmount;
    mapping(address => uint256) public userTotalInvested;
    
    // Constants
    uint256 public constant MINIMUM_DOWN_PAYMENT_PERCENT = 20; // 20%
    uint256 public constant INTEREST_RATE = 800; // 8% in basis points
    uint256 public constant TERM_YEARS = 10;
    uint256 public constant MAX_MISSED_PAYMENTS = 4;
    uint256 public constant APPRECIATION_CAP = 110; // 110% cap
    uint256 public constant BUYER_APPRECIATION_SHARE = 50; // 50%
    uint256 public constant ANCIENT_APPRECIATION_SHARE = 40; // 40%
    uint256 public constant LENDERS_APPRECIATION_SHARE = 10; // 10%
    uint256 public constant KYC_MINIMUM_AMOUNT = 500 * 10**6; // $500 USDT (6 decimals)
    uint256 public constant MAX_PROPERTY_VALUE = 1000000 * 10**6; // $1M max property value

    // Events
    event PropertyPurchased(uint256 indexed propertyId, address indexed buyer, uint256 purchasePrice, uint256 downPayment, string propertyMetadata);
    event MortgagePaymentMade(uint256 indexed propertyId, address indexed buyer, uint256 amount, uint256 paymentNumber, string transactionHash);
    event PropertyDefaulted(uint256 indexed propertyId, address indexed buyer, uint256 missedPayments);
    event AppreciationCalculated(uint256 indexed propertyId, uint256 appreciationValue, uint256 buyerShare, uint256 ancientShare, uint256 lendersShare);
    event KYCVerified(address indexed user, bool verified, uint256 amount);
    event PropertyMetadataUpdated(uint256 indexed propertyId, string metadata);
    event EmergencyPaused(address indexed by, bool paused);

    // Modifiers
    modifier onlyPropertyOwner(uint256 propertyId) {
        require(properties[propertyId].buyer == msg.sender, "Not property owner");
        _;
    }

    modifier propertyExists(uint256 propertyId) {
        require(properties[propertyId].propertyId != 0, "Property does not exist");
        _;
    }

    modifier notPaused() {
        require(!paused(), "Contract is paused");
        _;
    }

    constructor(address _usdtToken) ERC721("Ancient Property Token", "APT") {
        require(_usdtToken != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }

    // KYC verification function
    function verifyKYC(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(amount >= KYC_MINIMUM_AMOUNT, "Minimum $500 USDT required for KYC");
        kycVerified[user] = true;
        kycAmount[user] = amount;
        emit KYCVerified(user, true, amount);
    }

    // Purchase property with down payment
    function purchaseProperty(
        uint256 purchasePrice,
        uint256 downPayment,
        string memory propertyMetadata
    ) external nonReentrant notPaused returns (uint256) {
        require(kycVerified[msg.sender], "KYC verification required");
        require(purchasePrice > 0 && purchasePrice <= MAX_PROPERTY_VALUE, "Invalid property value");
        require(downPayment >= (purchasePrice * MINIMUM_DOWN_PAYMENT_PERCENT) / 100, "Insufficient down payment");
        require(downPayment < purchasePrice, "Down payment must be less than purchase price");
        require(bytes(propertyMetadata).length > 0, "Property metadata required");

        // Check USDT balance and allowance
        uint256 userBalance = usdtToken.balanceOf(msg.sender);
        uint256 userAllowance = usdtToken.allowance(msg.sender, address(this));
        require(userBalance >= downPayment, "Insufficient USDT balance");
        require(userAllowance >= downPayment, "Insufficient USDT allowance");

        require(usdtToken.transferFrom(msg.sender, address(this), downPayment), "Down payment transfer failed");

        _propertyIds.increment();
        uint256 propertyId = _propertyIds.current();

        uint256 mortgageAmount = purchasePrice.sub(downPayment);
        uint256 monthlyPayment = calculateMonthlyPayment(mortgageAmount);

        properties[propertyId] = Property({
            propertyId: propertyId,
            purchasePrice: purchasePrice,
            downPayment: downPayment,
            mortgageAmount: mortgageAmount,
            monthlyPayment: monthlyPayment,
            interestRate: INTEREST_RATE,
            termYears: TERM_YEARS,
            startDate: block.timestamp,
            buyer: msg.sender,
            isActive: true,
            isDefaulted: false,
            missedPayments: 0,
            lastPaymentDate: block.timestamp,
            totalPaid: downPayment,
            appreciationValue: 0,
            appreciationCalculated: false,
            propertyMetadata: propertyMetadata
        });

        // Mint ERC721 token representing property ownership
        _mint(msg.sender, propertyId);
        propertyToTokenId[propertyId] = propertyId;
        userProperties[msg.sender].push(propertyId);
        userTotalInvested[msg.sender] = userTotalInvested[msg.sender].add(downPayment);

        emit PropertyPurchased(propertyId, msg.sender, purchasePrice, downPayment, propertyMetadata);
        return propertyId;
    }

    // Make mortgage payment
    function makePayment(uint256 propertyId) external nonReentrant notPaused propertyExists(propertyId) onlyPropertyOwner(propertyId) {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property not active");
        require(!property.isDefaulted, "Property is in default");

        uint256 paymentAmount = property.monthlyPayment;
        
        // Check USDT balance and allowance
        uint256 userBalance = usdtToken.balanceOf(msg.sender);
        uint256 userAllowance = usdtToken.allowance(msg.sender, address(this));
        require(userBalance >= paymentAmount, "Insufficient USDT balance");
        require(userAllowance >= paymentAmount, "Insufficient USDT allowance");

        require(usdtToken.transferFrom(msg.sender, address(this), paymentAmount), "Payment transfer failed");

        // Calculate if payment is late
        uint256 daysSinceLastPayment = (block.timestamp.sub(property.lastPaymentDate)).div(1 days);
        bool isLate = daysSinceLastPayment > 30;

        if (isLate) {
            property.missedPayments = property.missedPayments.add(1);
            if (property.missedPayments >= MAX_MISSED_PAYMENTS) {
                property.isDefaulted = true;
                property.isActive = false;
                emit PropertyDefaulted(propertyId, msg.sender, property.missedPayments);
            }
        } else {
            property.missedPayments = 0; // Reset missed payments if payment is on time
        }

        property.totalPaid = property.totalPaid.add(paymentAmount);
        property.lastPaymentDate = block.timestamp;

        // Record payment
        Payment memory newPayment = Payment({
            amount: paymentAmount,
            timestamp: block.timestamp,
            paymentNumber: paymentHistory[propertyId].length.add(1),
            isLate: isLate,
            transactionHash: "" // Would be set in a real implementation
        });
        paymentHistory[propertyId].push(newPayment);

        emit MortgagePaymentMade(propertyId, msg.sender, paymentAmount, newPayment.paymentNumber, "");
    }

    // Calculate monthly payment (P&I) - Gas optimized
    function calculateMonthlyPayment(uint256 principal) public pure returns (uint256) {
        require(principal > 0, "Principal must be greater than 0");
        
        // Monthly interest rate = 8% / 12 = 0.6667%
        uint256 monthlyRate = 667; // 0.6667% in basis points
        uint256 numPayments = TERM_YEARS.mul(12); // 120 payments

        // P&I formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
        // Simplified calculation for gas efficiency
        uint256 rate = 1000 + monthlyRate; // 1 + monthly rate in basis points
        uint256 rateToN = rate; // Will be rate^n
        
        // Calculate rate^n using loop (for small n this is gas efficient)
        for (uint256 i = 1; i < numPayments; i++) {
            rateToN = rateToN.mul(rate).div(1000);
        }
        
        uint256 monthlyPayment = principal.mul(monthlyRate).mul(rateToN).div(
            rateToN.sub(1000)
        );
        
        return monthlyPayment.div(1000); // Convert back from basis points
    }

    // Get remaining balance
    function getRemainingBalance(uint256 propertyId) external view propertyExists(propertyId) returns (uint256) {
        Property memory property = properties[propertyId];
        if (!property.isActive || property.isDefaulted) return 0;
        
        uint256 totalPaid = property.totalPaid;
        uint256 totalOwed = property.mortgageAmount;
        
        if (totalPaid >= totalOwed) return 0;
        return totalOwed.sub(totalPaid);
    }

    // Calculate appreciation after 10 years
    function calculateAppreciation(uint256 propertyId) external onlyOwner propertyExists(propertyId) {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property not active");
        require(block.timestamp >= property.startDate.add(TERM_YEARS.mul(365 days)), "10-year term not reached");
        require(!property.appreciationCalculated, "Appreciation already calculated");

        // Calculate appreciation (capped at 110%)
        uint256 appreciationPercentage = 110; // Fixed at 110% cap
        uint256 appreciationAmount = property.purchasePrice.mul(appreciationPercentage).div(100);
        property.appreciationValue = appreciationAmount;

        // Calculate splits
        uint256 buyerShare = appreciationAmount.mul(BUYER_APPRECIATION_SHARE).div(100);
        uint256 ancientShare = appreciationAmount.mul(ANCIENT_APPRECIATION_SHARE).div(100);
        uint256 lendersShare = appreciationAmount.mul(LENDERS_APPRECIATION_SHARE).div(100);

        property.appreciationCalculated = true;

        emit AppreciationCalculated(propertyId, appreciationAmount, buyerShare, ancientShare, lendersShare);
    }

    // Get payment history
    function getPaymentHistory(uint256 propertyId) external view propertyExists(propertyId) returns (Payment[] memory) {
        return paymentHistory[propertyId];
    }

    // Get user properties
    function getUserProperties(address user) external view returns (uint256[] memory) {
        return userProperties[user];
    }

    // Get property details
    function getPropertyDetails(uint256 propertyId) external view propertyExists(propertyId) returns (
        uint256 purchasePrice,
        uint256 downPayment,
        uint256 mortgageAmount,
        uint256 monthlyPayment,
        address buyer,
        bool isActive,
        bool isDefaulted,
        uint256 missedPayments,
        uint256 totalPaid,
        uint256 remainingBalance,
        string memory propertyMetadata
    ) {
        Property memory property = properties[propertyId];
        return (
            property.purchasePrice,
            property.downPayment,
            property.mortgageAmount,
            property.monthlyPayment,
            property.buyer,
            property.isActive,
            property.isDefaulted,
            property.missedPayments,
            property.totalPaid,
            this.getRemainingBalance(propertyId),
            property.propertyMetadata
        );
    }

    // Update property metadata
    function updatePropertyMetadata(uint256 propertyId, string memory metadata) external onlyPropertyOwner(propertyId) {
        require(bytes(metadata).length > 0, "Metadata cannot be empty");
        properties[propertyId].propertyMetadata = metadata;
        emit PropertyMetadataUpdated(propertyId, metadata);
    }

    // Emergency functions for protocol management
    function setUSDTToken(address _usdtToken) external onlyOwner {
        require(_usdtToken != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }

    function withdrawUSDT(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(usdtToken.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        require(usdtToken.transfer(owner(), amount), "USDT transfer failed");
    }

    function pause() external onlyOwner {
        _pause();
        emit EmergencyPaused(msg.sender, true);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyPaused(msg.sender, false);
    }

    // Override transfer functions to prevent transfers during default
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Prevent transfers if property is in default
        if (properties[tokenId].isDefaulted) {
            revert("Property is in default - transfers not allowed");
        }
    }

    // View functions for analytics
    function getUserTotalInvested(address user) external view returns (uint256) {
        return userTotalInvested[user];
    }

    function getContractBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }

    function getTotalProperties() external view returns (uint256) {
        return _propertyIds.current();
    }
} 