# 🏠 Boho Shares - Smart Contract Integration

## Overview

This project integrates a complete mortgage protocol with smart contracts on Avalanche Fuji testnet. The system allows users to:

- **Invest in properties** through mortgage tokens
- **Join villages** with membership fees
- **Earn monthly yields** from property rentals
- **Manage investments** through blockchain transactions

## 🏗️ Architecture

### Smart Contracts

#### `MortgageProtocol.sol`
- **ERC20 Token**: Mortgage Protocol Token (MPT)
- **Property Management**: Create and manage real estate properties
- **Token Minting**: Purchase mortgage tokens for property investment
- **Village System**: Join exclusive village memberships
- **Yield Calculation**: Calculate monthly rental yields

### Key Features

1. **Property Investment**
   - Purchase mortgage tokens for specific properties
   - Earn monthly rental yields based on token ownership
   - Track investment performance on-chain

2. **Village Membership**
   - Join exclusive village communities
   - Access to premium properties and amenities
   - Network benefits and shared resources

3. **Yield Distribution**
   - Automatic monthly yield calculations
   - Transparent on-chain tracking
   - Real-time investment performance

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask wallet
- Avalanche Fuji testnet AVAX

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Smart Contract Deployment

```bash
# Navigate to contracts directory
cd contracts

# Install contract dependencies
npm install

# Compile contracts
npm run compile

# Deploy to Avalanche Fuji testnet
npm run deploy:fuji
```

## 🔧 Smart Contract Functions

### Property Management

```solidity
// Create a new property
function createProperty(uint256 propertyId, uint256 totalValue, uint256 downPayment, uint256 monthlyPayment)

// Get property details
function getProperty(uint256 propertyId) returns (uint256 totalValue, uint256 downPayment, uint256 monthlyPayment, bool isActive)
```

### Token Management

```solidity
// Purchase mortgage tokens
function mintMortgageTokens(uint256 propertyId, uint256 amount) payable

// Get user's tokens for a property
function getMortgageTokens(address owner, uint256 propertyId) returns (uint256)

// Calculate monthly yield
function calculateMonthlyYield(uint256 propertyId, uint256 tokenAmount) returns (uint256)
```

### Village System

```solidity
// Join a village
function joinVillage(uint256 villageId, uint256 membershipFee) payable

// Check village membership
function getVillageMembership(address user, uint256 villageId) returns (bool)

// Calculate village yield
function calculateVillageYield(uint256 villageId, uint256 membershipFee) returns (uint256)
```

## 🧪 Testing

### Frontend Testing

Visit `http://localhost:5173/test` to access the smart contract testing interface:

1. **Connect Wallet**: Connect MetaMask to Avalanche Fuji testnet
2. **Run Contract Tests**: Test all smart contract functions
3. **Purchase Tokens**: Test mortgage token purchases
4. **Join Village**: Test village membership functionality

### Contract Testing

```bash
# Run contract tests
cd contracts
npm run test
```

## 📊 Contract Addresses

### Avalanche Fuji Testnet

- **AncientMortgageProtocol**: `0x65F94D3F0f8E631f6053b9F4c56BaE9517EE08e7` (DEPLOYED ✅)
- **MockUSDT**: `0x0752217fdd32290cb832dd0AA91EBDd5E1A47199` (DEPLOYED ✅)
- **MortgageProtocol**: `0x1234567890123456789012345678901234567890` (Legacy - Replace with actual deployed address)
- **Mazunte Village**: `0x0987654321098765432109876543210987654321` (Replace with actual deployed address)

## 🔗 Network Configuration

### Avalanche Fuji Testnet
- **Chain ID**: 43113 (0xa869)
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io
- **Currency**: AVAX

## 💰 Token Economics

### Mortgage Tokens (MPT)
- **1:1 Ratio**: 1 token = $1 USD value
- **Yield Distribution**: Monthly rental income distributed proportionally
- **Liquidity**: Tokens can be traded on DEXs

### Village Memberships
- **Founding Member Rate**: $30,000 USD
- **Monthly Yield**: $594 USD
- **Network Access**: Full access to Ancient archipelago

## 🛡️ Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Admin functions restricted to contract owner
- **Input Validation**: All inputs validated before processing
- **Event Logging**: All transactions logged for transparency

## 🔄 Integration Flow

1. **User connects wallet** to Avalanche Fuji testnet
2. **Smart contract initialized** with provider and signer
3. **Property data fetched** from blockchain
4. **Token purchases** processed through smart contracts
5. **Yield calculations** performed on-chain
6. **Village memberships** managed through contracts

## 📈 Investment Examples

### Property Investment
- **Property Value**: $150,000
- **Down Payment**: $30,000 (20%)
- **Monthly Payment**: $1,456
- **Monthly Rent**: $2,050
- **Monthly Profit**: $594
- **Annual Return**: 23.8%

### Village Membership
- **Membership Fee**: $30,000
- **Monthly Yield**: $594
- **Annual Return**: 23.8%
- **Network Benefits**: Access to entire Ancient archipelago

## 🚨 Important Notes

1. **Testnet Only**: Currently deployed on Avalanche Fuji testnet
2. **Demo Mode**: Smart contract interactions are simulated for demo purposes
3. **Real Deployment**: Replace contract addresses with actual deployed contracts
4. **Gas Fees**: All transactions require AVAX for gas fees

## 🔮 Future Enhancements

- **Liquidity Pools**: DEX integration for token trading
- **Governance**: DAO voting for protocol decisions
- **Insurance**: Smart contract insurance for property protection
- **Cross-chain**: Multi-chain property investments
- **NFT Integration**: Property NFTs for fractional ownership

## 📞 Support

For technical support or questions about the smart contract integration:

1. Check the testing interface at `/test`
2. Review contract logs on Snowtrace
3. Verify wallet connection and network settings
4. Ensure sufficient AVAX for gas fees

---

**Built with ❤️ for the decentralized future of real estate investment** 