import { ethers } from 'ethers';

// Simple Token Purchase Contract ABI (minimal)
export const SIMPLE_TOKEN_PURCHASE_ABI = [
  "function purchaseTokens() external payable",
  "function getUserTokens(address user) external view returns (uint256[])",
  "function getToken(uint256 tokenId) external view returns (uint256 tokenId, uint256 price, uint256 investmentAmount, address buyer, uint256 purchaseDate, bool isActive)",
  "function getUserTotalInvested(address user) external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function TOKEN_PRICE() external view returns (uint256)",
  "function MINIMUM_INVESTMENT() external view returns (uint256)"
];

// Contract addresses
export const SIMPLE_CONTRACT_ADDRESSES = {
  SIMPLE_TOKEN_PURCHASE: '0x53404Eee7fBC8C3Bd175a32a8f36f53Be7006D3D', // Deployed to Fuji testnet
};

// Simple Token Purchase Contract Class
export class SimpleTokenPurchase {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private contract: ethers.Contract;

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(
      SIMPLE_CONTRACT_ADDRESSES.SIMPLE_TOKEN_PURCHASE,
      SIMPLE_TOKEN_PURCHASE_ABI,
      this.signer
    );
  }

  // Public getters
  get contractAddress(): string {
    return this.contract.address;
  }

  get contractInstance(): ethers.Contract {
    return this.contract;
  }

  // Purchase tokens with AVAX
  async purchaseTokens(avaxAmount: string) {
    const value = ethers.utils.parseEther(avaxAmount);
    const tx = await this.contract.purchaseTokens({ value });
    return await tx.wait();
  }

  // Get user's tokens
  async getUserTokens(userAddress: string): Promise<number[]> {
    return await this.contract.getUserTokens(userAddress);
  }

  // Get token details
  async getToken(tokenId: number) {
    return await this.contract.getToken(tokenId);
  }

  // Get user's total investment
  async getUserTotalInvested(userAddress: string): Promise<string> {
    const amount = await this.contract.getUserTotalInvested(userAddress);
    return ethers.utils.formatEther(amount);
  }

  // Get contract balance
  async getContractBalance(): Promise<string> {
    const balance = await this.contract.getContractBalance();
    return ethers.utils.formatEther(balance);
  }

  // Get token price
  async getTokenPrice(): Promise<string> {
    const price = await this.contract.TOKEN_PRICE();
    return ethers.utils.formatEther(price);
  }

  // Get minimum investment
  async getMinimumInvestment(): Promise<string> {
    const min = await this.contract.MINIMUM_INVESTMENT();
    return ethers.utils.formatEther(min);
  }
}
