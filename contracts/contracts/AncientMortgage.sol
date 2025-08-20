// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AncientMortgage is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    // USDT Token Interface
    IERC20 public usdtToken;
    
    // Treasury wallet for platform fees
    address public treasuryWallet;
    
    // Staking pool for yield distribution
    address public stakingPool;
    
    // Property structure
    struct Property {
        uint256 propertyId;
        uint256 propertyPrice;      // $129,000
        uint256 downPayment;        // $25,800 (20%)
        uint256 mortgageAmount;     // $103,200 (80%)
        uint256 monthlyPayment;     // $1,205
        uint256 interestRate;       // 8% APR
        uint256 termMonths;         // 120 months
        uint256 startDate;
        address buyer;
        bool isActive;
        bool isPaidOff;
        uint256 totalPaid;
        uint256 paymentsMade;
        uint256 lastPaymentDate;
        uint256 appraisedValue;     // For year-10 appreciation
        bool appreciationDistributed;
    }

    // State variables
    Counters.Counter private _propertyIds;
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public userProperties;
    mapping(uint256 => uint256) public propertyToTokenId;
    
    // Constants
    uint256 public constant PLATFORM_FEE_PERCENT = 3; // 3%
    uint256 public constant DOWN_PAYMENT_PERCENT = 20; // 20%
    uint256 public constant INTEREST_RATE = 800; // 8% in basis points
    uint256 public constant TERM_MONTHS = 120;
    uint256 public constant PAYMENTS_FOR_APPRECIATION = 120; // Year 10
    
    // Events
    event PropertyPurchased(uint256 indexed propertyId, address indexed buyer, uint256 propertyPrice, uint256 downPayment, uint256 platformFee);
    event MortgagePaymentMade(uint256 indexed propertyId, address indexed buyer, uint256 amount, uint256 paymentNumber);
    event PropertyPaidOff(uint256 indexed propertyId, address indexed buyer);
    event AppreciationDistributed(uint256 indexed propertyId, uint256 appraisedValue, uint256 buyerShare, uint256 ancientShare, uint256 lenderShare);
    event PlatformFeeCollected(uint256 indexed propertyId, uint256 amount);

    constructor(address _usdtToken, address _treasuryWallet, address _stakingPool) ERC721("Ancient Property Deed", "APD") {
        require(_usdtToken != address(0), "Invalid USDT address");
        require(_treasuryWallet != address(0), "Invalid treasury address");
        require(_stakingPool != address(0), "Invalid staking pool address");
        
        usdtToken = IERC20(_usdtToken);
        treasuryWallet = _treasuryWallet;
        stakingPool = _stakingPool;
    }

    // Purchase property with down payment
    function purchaseProperty(uint256 propertyPrice, uint256 downPayment) external nonReentrant {
        require(propertyPrice > 0, "Invalid property price");
        require(downPayment == (propertyPrice * DOWN_PAYMENT_PERCENT) / 100, "Down payment must be 20%");
        
        uint256 platformFee = (propertyPrice * PLATFORM_FEE_PERCENT) / 100;
        uint256 totalRequired = downPayment + platformFee;
        
        // Check USDT balance and allowance
        require(usdtToken.balanceOf(msg.sender) >= totalRequired, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= totalRequired, "Insufficient USDT allowance");
        
        // Transfer down payment and platform fee
        require(usdtToken.transferFrom(msg.sender, address(this), downPayment), "Down payment transfer failed");
        require(usdtToken.transferFrom(msg.sender, treasuryWallet, platformFee), "Platform fee transfer failed");
        
        // Calculate mortgage details
        uint256 mortgageAmount = propertyPrice.sub(downPayment);
        uint256 monthlyPayment = calculateMonthlyPayment(mortgageAmount);
        
        // Create property
        _propertyIds.increment();
        uint256 propertyId = _propertyIds.current();
        
        properties[propertyId] = Property({
            propertyId: propertyId,
            propertyPrice: propertyPrice,
            downPayment: downPayment,
            mortgageAmount: mortgageAmount,
            monthlyPayment: monthlyPayment,
            interestRate: INTEREST_RATE,
            termMonths: TERM_MONTHS,
            startDate: block.timestamp,
            buyer: msg.sender,
            isActive: true,
            isPaidOff: false,
            totalPaid: downPayment,
            paymentsMade: 0,
            lastPaymentDate: block.timestamp,
            appraisedValue: 0,
            appreciationDistributed: false
        });
        
        // Mint NFT deed
        _mint(msg.sender, propertyId);
        propertyToTokenId[propertyId] = propertyId;
        userProperties[msg.sender].push(propertyId);
        
        emit PropertyPurchased(propertyId, msg.sender, propertyPrice, downPayment, platformFee);
        emit PlatformFeeCollected(propertyId, platformFee);
    }

    // Make mortgage payment
    function makePayment(uint256 propertyId) external nonReentrant {
        Property storage property = properties[propertyId];
        require(property.buyer == msg.sender, "Not property owner");
        require(property.isActive, "Property not active");
        require(!property.isPaidOff, "Property already paid off");
        
        uint256 paymentAmount = property.monthlyPayment;
        
        // Check USDT balance and allowance
        require(usdtToken.balanceOf(msg.sender) >= paymentAmount, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= paymentAmount, "Insufficient USDT allowance");
        
        // Transfer payment
        require(usdtToken.transferFrom(msg.sender, address(this), paymentAmount), "Payment transfer failed");
        
        // Update property state
        property.totalPaid = property.totalPaid.add(paymentAmount);
        property.paymentsMade = property.paymentsMade.add(1);
        property.lastPaymentDate = block.timestamp;
        
        // Calculate and distribute interest (8% APR split)
        uint256 interestAmount = calculateInterestPayment(property.mortgageAmount, property.paymentsMade);
        if (interestAmount > 0) {
            // 7.5% goes to staking pool (lenders)
            uint256 stakingPoolShare = (interestAmount * 75) / 80; // 7.5% of 8%
            // 0.5% goes to Ancient treasury
            uint256 treasuryShare = (interestAmount * 5) / 80; // 0.5% of 8%
            
            require(usdtToken.transfer(stakingPool, stakingPoolShare), "Staking pool interest transfer failed");
            require(usdtToken.transfer(treasuryWallet, treasuryShare), "Treasury interest transfer failed");
        }
        
        emit MortgagePaymentMade(propertyId, msg.sender, paymentAmount, property.paymentsMade);
        
        // Check if property is paid off
        if (property.paymentsMade >= TERM_MONTHS) {
            property.isPaidOff = true;
            property.isActive = false;
            emit PropertyPaidOff(propertyId, msg.sender);
        }
    }

    // Trigger year-10 appreciation (only after 120 payments)
    function triggerYear10Appraisal(uint256 propertyId, uint256 appraisedValue) external onlyOwner {
        Property storage property = properties[propertyId];
        require(property.paymentsMade >= PAYMENTS_FOR_APPRECIATION, "Property not fully paid");
        require(!property.appreciationDistributed, "Appreciation already distributed");
        require(appraisedValue > property.propertyPrice, "Appraisal must be higher than purchase price");
        
        property.appraisedValue = appraisedValue;
        property.appreciationDistributed = true;
        
        // Calculate appreciation shares
        uint256 appreciation = appraisedValue.sub(property.propertyPrice);
        uint256 buyerShare = (appreciation * 50) / 100;    // 50% to buyer
        uint256 ancientShare = (appreciation * 40) / 100;   // 40% to Ancient
        uint256 lenderShare = (appreciation * 10) / 100;    // 10% to lenders
        
        // Transfer appreciation shares
        if (buyerShare > 0) {
            require(usdtToken.transfer(property.buyer, buyerShare), "Buyer share transfer failed");
        }
        if (ancientShare > 0) {
            require(usdtToken.transfer(treasuryWallet, ancientShare), "Ancient share transfer failed");
        }
        if (lenderShare > 0) {
            require(usdtToken.transfer(stakingPool, lenderShare), "Lender share transfer failed");
        }
        
        emit AppreciationDistributed(propertyId, appraisedValue, buyerShare, ancientShare, lenderShare);
    }

    // Calculate monthly payment using compound interest formula
    function calculateMonthlyPayment(uint256 principal) public pure returns (uint256) {
        // Monthly interest rate = 8% / 12 = 0.6667%
        uint256 monthlyRate = 667; // 0.6667% in basis points
        uint256 numPayments = TERM_MONTHS;
        
        // P = L[c(1 + c)^n]/[(1 + c)^n - 1]
        // Where P = payment, L = loan amount, c = monthly interest rate, n = number of payments
        
        uint256 numerator = principal.mul(monthlyRate).mul(power(1000 + monthlyRate, numPayments));
        uint256 denominator = power(1000 + monthlyRate, numPayments).sub(power(1000, numPayments));
        
        return numerator.div(denominator);
    }

    // Calculate interest portion of payment
    function calculateInterestPayment(uint256 principal, uint256 paymentNumber) public pure returns (uint256) {
        uint256 monthlyRate = 667; // 0.6667% in basis points
        uint256 remainingBalance = principal;
        
        for (uint256 i = 0; i < paymentNumber; i++) {
            uint256 interest = remainingBalance.mul(monthlyRate).div(100000);
            uint256 principalPaid = calculateMonthlyPayment(principal).sub(interest);
            remainingBalance = remainingBalance.sub(principalPaid);
        }
        
        return remainingBalance.mul(monthlyRate).div(100000);
    }

    // Power function for calculations
    function power(uint256 base, uint256 exponent) internal pure returns (uint256) {
        uint256 result = 1000; // Start with 1.000 (1000 basis points)
        for (uint256 i = 0; i < exponent; i++) {
            result = result.mul(base).div(1000);
        }
        return result;
    }

    // Get user's properties
    function getUserProperties(address user) external view returns (uint256[] memory) {
        return userProperties[user];
    }

    // Get property details
    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }

    // Emergency functions (owner only)
    function setTreasuryWallet(address _treasuryWallet) external onlyOwner {
        treasuryWallet = _treasuryWallet;
    }

    function setStakingPool(address _stakingPool) external onlyOwner {
        stakingPool = _stakingPool;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        if (balance > 0) {
            require(usdtToken.transfer(owner(), balance), "Emergency withdrawal failed");
        }
    }
}
