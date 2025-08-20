// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleTokenPurchase is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Token structure
    struct Token {
        uint256 tokenId;
        uint256 price;
        uint256 investmentAmount;
        address buyer;
        uint256 purchaseDate;
        bool isActive;
    }
    
    // State variables
    Counters.Counter private _tokenIds;
    mapping(uint256 => Token) public tokens;
    mapping(address => uint256[]) public userTokens;
    mapping(address => uint256) public userTotalInvested;
    
    // Constants
    uint256 public constant TOKEN_PRICE = 0.1 ether; // 0.1 AVAX per token
    uint256 public constant MINIMUM_INVESTMENT = 0.1 ether; // 0.1 AVAX minimum
    
    // Events
    event TokenPurchased(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 price);
    event TokensRedeemed(address indexed user, uint256[] tokenIds);
    
    constructor() {
        // Contract owner is the deployer
    }
    
    // Purchase tokens with AVAX
    function purchaseTokens() external payable nonReentrant {
        require(msg.value >= MINIMUM_INVESTMENT, "Minimum investment is 0.1 AVAX");
        require(msg.value % TOKEN_PRICE == 0, "Investment must be multiple of 0.1 AVAX");
        
        uint256 tokenCount = msg.value / TOKEN_PRICE;
        
        for (uint256 i = 0; i < tokenCount; i++) {
            _tokenIds.increment();
            uint256 tokenId = _tokenIds.current();
            
            tokens[tokenId] = Token({
                tokenId: tokenId,
                price: TOKEN_PRICE,
                investmentAmount: TOKEN_PRICE,
                buyer: msg.sender,
                purchaseDate: block.timestamp,
                isActive: true
            });
            
            userTokens[msg.sender].push(tokenId);
            emit TokenPurchased(tokenId, msg.sender, TOKEN_PRICE, TOKEN_PRICE);
        }
        
        userTotalInvested[msg.sender] += msg.value;
    }
    
    // Get user's tokens
    function getUserTokens(address user) external view returns (uint256[] memory) {
        return userTokens[user];
    }
    
    // Get token details
    function getToken(uint256 tokenId) external view returns (Token memory) {
        require(tokens[tokenId].tokenId != 0, "Token does not exist");
        return tokens[tokenId];
    }
    
    // Get user's total investment
    function getUserTotalInvested(address user) external view returns (uint256) {
        return userTotalInvested[user];
    }
    
    // Withdraw AVAX (owner only)
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No AVAX to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Emergency pause (owner only)
    function pause() external onlyOwner {
        // Implementation for pausing if needed
    }
    
    // Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
