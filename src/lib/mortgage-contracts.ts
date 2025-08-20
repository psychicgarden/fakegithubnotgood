import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from './contracts';

// TestUSDT ABI (minimal)
export const TEST_USDT_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function decimals() external view returns (uint8)"
];

// AncientMortgage ABI (minimal)
export const ANCIENT_MORTGAGE_ABI = [
  "function purchaseProperty(uint256 propertyPrice, uint256 downPayment) external",
  "function makePayment(uint256 propertyId) external",
  "function triggerYear10Appraisal(uint256 propertyId, uint256 appraisedValue) external",
  "function getUserProperties(address user) external view returns (uint256[])",
  "function getProperty(uint256 propertyId) external view returns (uint256 propertyId, uint256 propertyPrice, uint256 downPayment, uint256 mortgageAmount, uint256 monthlyPayment, uint256 interestRate, uint256 termMonths, uint256 startDate, address buyer, bool isActive, bool isPaidOff, uint256 totalPaid, uint256 paymentsMade, uint256 lastPaymentDate, uint256 appraisedValue, bool appreciationDistributed)",
  "function calculateMonthlyPayment(uint256 principal) external view returns (uint256)",
  "function calculateInterestPayment(uint256 principal, uint256 paymentNumber) external view returns (uint256)",
  "event PropertyPurchased(uint256 indexed propertyId, address indexed buyer, uint256 propertyPrice, uint256 downPayment, uint256 platformFee)",
  "event MortgagePaymentMade(uint256 indexed propertyId, address indexed buyer, uint256 amount, uint256 paymentNumber)",
  "event PropertyPaidOff(uint256 indexed propertyId, address indexed buyer)",
  "event AppreciationDistributed(uint256 indexed propertyId, uint256 appraisedValue, uint256 buyerShare, uint256 ancientShare, uint256 lenderShare)"
];

// EnhancedStakingPool ABI (minimal)
export const ENHANCED_STAKING_POOL_ABI = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 lpTokens) external",
  "function claimRewards() external",
  "function getUserTotalValue(address user) external view returns (uint256)",
  "function getCurrentAPY() external view returns (uint256)",
  "function totalDeposits() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event Deposited(address indexed user, uint256 amount, uint256 lpTokens)",
  "event Withdrawn(address indexed user, uint256 lpTokens, uint256 usdtAmount)",
  "event RewardsClaimed(address indexed user, uint256 amount)"
];

// TestUSDT Contract Class
export class TestUSDT {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private contract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.TEST_USDT,
      TEST_USDT_ABI,
      this.signer
    );
  }

  get contractAddress(): string {
    return this.contract.address;
  }

  get contractInstance(): ethers.Contract {
    return this.contract;
  }

  async balanceOf(address: string): Promise<string> {
    const balance = await this.contract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 6); // USDT has 6 decimals
  }

  async approve(spender: string, amount: string): Promise<any> {
    const amountWei = ethers.utils.parseUnits(amount, 6);
    const tx = await this.contract.approve(spender, amountWei);
    return await tx.wait();
  }

  async allowance(owner: string, spender: string): Promise<string> {
    const allowance = await this.contract.allowance(owner, spender);
    return ethers.utils.formatUnits(allowance, 6);
  }
}

// AncientMortgage Contract Class
export class AncientMortgage {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private contract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ANCIENT_MORTGAGE,
      ANCIENT_MORTGAGE_ABI,
      this.signer
    );
  }

  get contractAddress(): string {
    return this.contract.address;
  }

  get contractInstance(): ethers.Contract {
    return this.contract;
  }

  // Purchase property with down payment
  async purchaseProperty(propertyPrice: string, downPayment: string): Promise<any> {
    const priceWei = ethers.utils.parseUnits(propertyPrice, 6);
    const downPaymentWei = ethers.utils.parseUnits(downPayment, 6);
    
    const tx = await this.contract.purchaseProperty(priceWei, downPaymentWei);
    return await tx.wait();
  }

  // Make mortgage payment
  async makePayment(propertyId: number): Promise<any> {
    const tx = await this.contract.makePayment(propertyId);
    return await tx.wait();
  }

  // Get user's properties
  async getUserProperties(userAddress: string): Promise<number[]> {
    return await this.contract.getUserProperties(userAddress);
  }

  // Get property details
  async getProperty(propertyId: number): Promise<any> {
    return await this.contract.getProperty(propertyId);
  }

  // Calculate monthly payment
  async calculateMonthlyPayment(principal: string): Promise<string> {
    const principalWei = ethers.utils.parseUnits(principal, 6);
    const payment = await this.contract.calculateMonthlyPayment(principalWei);
    return ethers.utils.formatUnits(payment, 6);
  }

  // Calculate interest payment
  async calculateInterestPayment(principal: string, paymentNumber: number): Promise<string> {
    const principalWei = ethers.utils.parseUnits(principal, 6);
    const interest = await this.contract.calculateInterestPayment(principalWei, paymentNumber);
    return ethers.utils.formatUnits(interest, 6);
  }
}

// EnhancedStakingPool Contract Class
export class EnhancedStakingPool {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private contract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ENHANCED_STAKING_POOL,
      ENHANCED_STAKING_POOL_ABI,
      this.signer
    );
  }

  get contractAddress(): string {
    return this.contract.address;
  }

  get contractInstance(): ethers.Contract {
    return this.contract;
  }

  // Deposit USDT and receive LP tokens
  async deposit(amount: string): Promise<any> {
    const amountWei = ethers.utils.parseUnits(amount, 6);
    const tx = await this.contract.deposit(amountWei);
    return await tx.wait();
  }

  // Withdraw USDT by burning LP tokens
  async withdraw(lpTokens: string): Promise<any> {
    const lpTokensWei = ethers.utils.parseUnits(lpTokens, 18); // LP tokens have 18 decimals
    const tx = await this.contract.withdraw(lpTokensWei);
    return await tx.wait();
  }

  // Claim accumulated rewards
  async claimRewards(): Promise<any> {
    const tx = await this.contract.claimRewards();
    return await tx.wait();
  }

  // Get user's total value
  async getUserTotalValue(userAddress: string): Promise<string> {
    const value = await this.contract.getUserTotalValue(userAddress);
    return ethers.utils.formatUnits(value, 6);
  }

  // Get current APY
  async getCurrentAPY(): Promise<string> {
    const apy = await this.contract.getCurrentAPY();
    return (parseInt(apy.toString()) / 100).toString(); // Convert from basis points to percentage
  }

  // Get total deposits
  async getTotalDeposits(): Promise<string> {
    const deposits = await this.contract.totalDeposits();
    return ethers.utils.formatUnits(deposits, 6);
  }

  // Get LP token balance
  async getLPBalance(userAddress: string): Promise<string> {
    const balance = await this.contract.balanceOf(userAddress);
    return ethers.utils.formatUnits(balance, 18);
  }
}
