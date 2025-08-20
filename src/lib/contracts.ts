import { ethers } from 'ethers';

// Ancient Mortgage Protocol Smart Contract ABI
export const ANCIENT_MORTGAGE_PROTOCOL_ABI = [
  // KYC & Verification
  "function verifyKYC(address user, uint256 amount) external",
  "function kycVerified(address user) external view returns (bool)",
  "function kycAmount(address user) external view returns (uint256)",
  
  // Property Purchase
  "function purchaseProperty(uint256 purchasePrice, uint256 downPayment) external returns (uint256)",
  "function getPropertyDetails(uint256 propertyId) external view returns (uint256 purchasePrice, uint256 downPayment, uint256 mortgageAmount, uint256 monthlyPayment, address buyer, bool isActive, bool isDefaulted, uint256 missedPayments, uint256 totalPaid, uint256 remainingBalance)",
  
  // Mortgage Payments
  "function makePayment(uint256 propertyId) external",
  "function getRemainingBalance(uint256 propertyId) external view returns (uint256)",
  "function getPaymentHistory(uint256 propertyId) external view returns (tuple(uint256 amount, uint256 timestamp, uint256 paymentNumber, bool isLate)[])",
  
  // User Properties
  "function getUserProperties(address user) external view returns (uint256[])",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  
  // Appreciation
  "function calculateAppreciation(uint256 propertyId) external",
  
  // USDT Interface
  "function usdtToken() external view returns (address)",
  
  // Events
  "event PropertyPurchased(uint256 indexed propertyId, address indexed buyer, uint256 purchasePrice, uint256 downPayment)",
  "event MortgagePaymentMade(uint256 indexed propertyId, address indexed buyer, uint256 amount, uint256 paymentNumber)",
  "event PropertyDefaulted(uint256 indexed propertyId, address indexed buyer, uint256 missedPayments)",
  "event AppreciationCalculated(uint256 indexed propertyId, uint256 appreciationValue, uint256 buyerShare, uint256 ancientShare, uint256 lendersShare)",
  "event KYCVerified(address indexed user, bool verified)"
];

// USDT Token ABI
export const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)"
];

// Legacy Mortgage Protocol ABI (keeping for backward compatibility)
export const MORTGAGE_PROTOCOL_ABI = [
  // Property Management
  "function createProperty(uint256 propertyId, uint256 totalValue, uint256 downPayment, uint256 monthlyPayment) external",
  "function getProperty(uint256 propertyId) external view returns (uint256 totalValue, uint256 downPayment, uint256 monthlyPayment, bool isActive)",
  
  // Mortgage Token Management
  "function mintMortgageTokens(uint256 propertyId, uint256 amount) external payable",
  "function getMortgageTokens(address owner, uint256 propertyId) external view returns (uint256)",
  "function calculateMonthlyYield(uint256 propertyId, uint256 tokenAmount) external view returns (uint256)",
  
  // Village/Network Management
  "function joinVillage(uint256 villageId, uint256 membershipFee) external payable",
  "function getVillageMembership(address user, uint256 villageId) external view returns (bool)",
  "function calculateVillageYield(uint256 villageId, uint256 membershipFee) external view returns (uint256)",
  
  // Events
  "event PropertyCreated(uint256 indexed propertyId, uint256 totalValue, uint256 downPayment)",
  "event MortgageTokensMinted(address indexed owner, uint256 indexed propertyId, uint256 amount)",
  "event VillageJoined(address indexed member, uint256 indexed villageId, uint256 membershipFee)"
];

// Village Citizenship ABI
export const VILLAGE_CITIZENSHIP_ABI = [
  // Village Management
  "function createVillage(string memory name, uint256 membershipFee, uint256 maxCitizens, uint256 monthlyYieldPerCitizen) external",
  "function updateVillage(uint256 villageId, string memory name, uint256 membershipFee, uint256 maxCitizens, uint256 monthlyYieldPerCitizen) external",
  "function toggleVillage(uint256 villageId) external",
  "function getVillage(uint256 villageId) external view returns (uint256 id, string memory name, uint256 membershipFee, uint256 maxCitizens, uint256 currentCitizens, bool isActive, uint256 monthlyYieldPerCitizen)",
  
  // Citizenship Functions
  "function purchaseCitizenship(uint256 villageId) external payable",
  "function claimYield(uint256 villageId) external",
  "function getCitizenship(address citizen, uint256 villageId) external view returns (uint256 citizenshipId, address citizenAddress, uint256 membershipFee, uint256 joinDate, bool isActive, uint256 monthlyYield, uint256 totalYieldEarned, uint256 lastYieldClaim)",
  
  // View Functions
  "function getUserVillages(address user) external view returns (uint256[] memory)",
  "function getVillageCitizens(uint256 villageId) external view returns (address[] memory)",
  "function isCitizen(address user, uint256 villageId) external view returns (bool)",
  
  // Events
  "event VillageCreated(uint256 indexed villageId, string name, uint256 membershipFee, uint256 maxCitizens)",
  "event CitizenshipPurchased(uint256 indexed citizenshipId, address indexed citizen, uint256 indexed villageId, uint256 membershipFee)",
  "event YieldClaimed(address indexed citizen, uint256 indexed villageId, uint256 amount)",
  "event VillageUpdated(uint256 indexed villageId, string name, uint256 membershipFee)"
];

// TODO: Debug Internal JSON-RPC error - Bugbot analysis needed
// Current issue: Contract addresses updated but still getting JSON-RPC errors
// Need to investigate contract verification and interaction patterns

export const CONTRACT_ADDRESSES = {
  // Legacy contracts (UPDATED WITH REAL FUJI ADDRESSES)
  MORTGAGE_PROTOCOL: '0x65F94D3F0f8E631f6053b9F4c56BaE9517EE08e7', // Updated to use AncientMortgageProtocol address
  MAZUNTE_VILLAGE: '0x2f89095302C43D4142fF80607ba0CFe475f3d21a', // Updated to use new VillageCitizenship address
  
  // Ancient Mortgage Protocol contracts (DEPLOYED TO FUJI TESTNET)
  ANCIENT_MORTGAGE_PROTOCOL: '0x65F94D3F0f8E631f6053b9F4c56BaE9517EE08e7', // Deployed to Fuji testnet
  MOCK_USDT: '0x0752217fdd32290cb832dd0AA91EBDd5E1A47199', // Deployed to Fuji testnet
  
  // Village Citizenship contract (DEPLOYED TO FUJI TESTNET)
  VILLAGE_CITIZENSHIP: '0x2f89095302C43D4142fF80607ba0CFe475f3d21a', // Deployed to Fuji testnet
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: '0xa869', // Avalanche Fuji Testnet
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

// Ancient Mortgage Protocol interaction functions
export class AncientMortgageProtocol {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private contract: ethers.Contract;
  private usdtContract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ANCIENT_MORTGAGE_PROTOCOL,
      ANCIENT_MORTGAGE_PROTOCOL_ABI,
      this.signer
    );
    this.usdtContract = new ethers.Contract(
      CONTRACT_ADDRESSES.MOCK_USDT,
      USDT_ABI,
      this.signer
    );
  }

  // Public getter for contract address
  get contractAddress(): string {
    return this.contract.address.toString();
  }

  // Public getter for contract instance
  get contractInstance(): ethers.Contract {
    return this.contract;
  }

  // KYC & Verification
  async verifyKYC(user: string, amount: number) {
    const tx = await this.contract.verifyKYC(user, amount);
    return await tx.wait();
  }

  async isKYCVerified(user: string): Promise<boolean> {
    return await this.contract.kycVerified(user);
  }

  // Property Purchase
  async purchaseProperty(purchasePrice: number, downPayment: number) {
    // First approve USDT spending
    await this.approveUSDT(downPayment);
    
    const tx = await this.contract.purchaseProperty(purchasePrice, downPayment);
    const receipt = await tx.wait();
    return receipt;
  }

  // Mortgage Payments
  async makePayment(propertyId: number) {
    const propertyDetails = await this.getPropertyDetails(propertyId);
    const monthlyPayment = propertyDetails.monthlyPayment;
    
    // Approve USDT for payment
    await this.approveUSDT(monthlyPayment);
    
    const tx = await this.contract.makePayment(propertyId);
    return await tx.wait();
  }

  async getRemainingBalance(propertyId: number): Promise<number> {
    return await this.contract.getRemainingBalance(propertyId);
  }

  async getPaymentHistory(propertyId: number) {
    return await this.contract.getPaymentHistory(propertyId);
  }

  // Property Details
  async getPropertyDetails(propertyId: number) {
    return await this.contract.getPropertyDetails(propertyId);
  }

  async getUserProperties(user: string) {
    return await this.contract.getUserProperties(user);
  }

  // USDT Functions
  async approveUSDT(amount: number) {
    const tx = await this.usdtContract.approve(this.contract.address, amount);
    return await tx.wait();
  }

  async getUSDTBalance(user: string): Promise<number> {
    return await this.usdtContract.balanceOf(user);
  }

  async getUSDTAllowance(owner: string, spender: string): Promise<number> {
    return await this.usdtContract.allowance(owner, spender);
  }

  // Appreciation
  async calculateAppreciation(propertyId: number) {
    const tx = await this.contract.calculateAppreciation(propertyId);
    return await tx.wait();
  }
}

// Legacy Mortgage Protocol (keeping for backward compatibility)
export class MortgageProtocol {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private contract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.MORTGAGE_PROTOCOL,
      MORTGAGE_PROTOCOL_ABI,
      this.signer
    );
  }

  // Property Management
  async createProperty(propertyId: number, totalValue: number, downPayment: number, monthlyPayment: number) {
    const tx = await this.contract.createProperty(propertyId, totalValue, downPayment, monthlyPayment);
    return await tx.wait();
  }

  async getProperty(propertyId: number) {
    return await this.contract.getProperty(propertyId);
  }

  // Mortgage Token Management
  async mintMortgageTokens(propertyId: number, amount: number, value: string) {
    const tx = await this.contract.mintMortgageTokens(propertyId, amount, { value });
    return await tx.wait();
  }

  async getMortgageTokens(owner: string, propertyId: number) {
    return await this.contract.getMortgageTokens(owner, propertyId);
  }

  async calculateMonthlyYield(propertyId: number, tokenAmount: number) {
    return await this.contract.calculateMonthlyYield(propertyId, tokenAmount);
  }

  // Village Management
  async joinVillage(villageId: number, membershipFee: number, value: string) {
    const tx = await this.contract.joinVillage(villageId, membershipFee, { value });
    return await tx.wait();
  }

  async getVillageMembership(user: string, villageId: number) {
    return await this.contract.getVillageMembership(user, villageId);
  }

  async calculateVillageYield(villageId: number, membershipFee: number) {
    return await this.contract.calculateVillageYield(villageId, membershipFee);
  }
}

// Village Citizenship Contract
export class VillageCitizenship {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private contract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.VILLAGE_CITIZENSHIP,
      VILLAGE_CITIZENSHIP_ABI,
      this.signer
    );
  }

  // Public getter for contract address
  get contractAddress(): string {
    return this.contract.address.toString();
  }

  // Public getter for contract instance
  get contractInstance(): ethers.Contract {
    return this.contract;
  }

  // Village Management
  async createVillage(name: string, membershipFee: number, maxCitizens: number, monthlyYieldPerCitizen: number) {
    const tx = await this.contract.createVillage(name, membershipFee, maxCitizens, monthlyYieldPerCitizen);
    return await tx.wait();
  }

  async updateVillage(villageId: number, name: string, membershipFee: number, maxCitizens: number, monthlyYieldPerCitizen: number) {
    const tx = await this.contract.updateVillage(villageId, name, membershipFee, maxCitizens, monthlyYieldPerCitizen);
    return await tx.wait();
  }

  async toggleVillage(villageId: number) {
    const tx = await this.contract.toggleVillage(villageId);
    return await tx.wait();
  }

  async getVillage(villageId: number) {
    return await this.contract.getVillage(villageId);
  }

  // Citizenship Functions
  async purchaseCitizenship(villageId: number, options?: { value?: string }) {
    const tx = await this.contract.purchaseCitizenship(villageId, options);
    return await tx.wait();
  }

  async claimYield(villageId: number) {
    const tx = await this.contract.claimYield(villageId);
    return await tx.wait();
  }

  async getCitizenship(citizen: string, villageId: number) {
    return await this.contract.getCitizenship(citizen, villageId);
  }

  // View Functions
  async getUserVillages(user: string) {
    return await this.contract.getUserVillages(user);
  }

  async getVillageCitizens(villageId: number) {
    return await this.contract.getVillageCitizens(villageId);
  }

  async isCitizen(user: string, villageId: number) {
    return await this.contract.isCitizen(user, villageId);
  }
}

// Utility functions
export const formatEther = ethers.utils.formatEther;
export const parseEther = ethers.utils.parseEther;
export const formatUnits = ethers.utils.formatUnits;
export const parseUnits = ethers.utils.parseUnits; 