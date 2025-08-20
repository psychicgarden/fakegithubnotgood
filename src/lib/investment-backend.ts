import { ethers } from 'ethers';
import { MortgageProtocol } from './contracts';

// Investment Journey Types
export interface InvestmentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'current' | 'failed';
  required: boolean;
  data?: any;
}

export interface InvestmentJourney {
  id: string;
  investorAddress: string;
  propertyId: string;
  steps: InvestmentStep[];
  currentStep: number;
  totalSteps: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyInvestment {
  id: string;
  propertyId: string;
  investorAddress: string;
  investmentAmount: number;
  tokensOwned: number;
  percentageOwnership: number;
  monthlyYield: number;
  totalYieldEarned: number;
  investmentDate: Date;
  status: 'active' | 'sold' | 'pending';
}

export interface InvestmentAnalytics {
  totalInvested: number;
  totalValue: number;
  totalYield: number;
  portfolioDiversity: number;
  averageReturn: number;
  properties: PropertyInvestment[];
}

// Investment Backend Class
export class InvestmentBackend {
  private mortgageProtocol: MortgageProtocol;
  private supabase: any; // Will be initialized with Supabase client

  constructor(mortgageProtocol: MortgageProtocol) {
    this.mortgageProtocol = mortgageProtocol;
  }

  // Step 1: Investment Discovery & Education
  async startInvestmentJourney(investorAddress: string, propertyId: string): Promise<InvestmentJourney> {
    const journey: InvestmentJourney = {
      id: `journey_${Date.now()}`,
      investorAddress,
      propertyId,
      steps: [
        {
          id: 'discovery',
          title: 'Property Discovery',
          description: 'Learn about the property and investment opportunity',
          status: 'completed',
          required: true
        },
        {
          id: 'education',
          title: 'Investment Education',
          description: 'Understand tokenization and yield mechanics',
          status: 'completed',
          required: true
        },
        {
          id: 'kyc',
          title: 'Identity Verification',
          description: 'Complete KYC/AML verification',
          status: 'pending',
          required: true
        },
        {
          id: 'wallet',
          title: 'Wallet Connection',
          description: 'Connect your Web3 wallet',
          status: 'pending',
          required: true
        },
        {
          id: 'analysis',
          title: 'Investment Analysis',
          description: 'Review projected returns and risks',
          status: 'pending',
          required: true
        },
        {
          id: 'investment',
          title: 'Token Purchase',
          description: 'Purchase property tokens',
          status: 'pending',
          required: true
        },
        {
          id: 'confirmation',
          title: 'Investment Confirmed',
          description: 'Receive tokens and start earning yields',
          status: 'pending',
          required: true
        }
      ],
      currentStep: 0,
      totalSteps: 7,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return journey;
  }

  // Step 2: KYC/AML Verification
  async completeKYC(investorAddress: string, kycData: any): Promise<boolean> {
    // Simulate KYC verification
    const verificationResult = await this.verifyIdentity(kycData);
    
    if (verificationResult.success) {
      // Update journey step
      await this.updateJourneyStep(investorAddress, 'kyc', 'completed', kycData);
      return true;
    }
    
    return false;
  }

  // Step 3: Wallet Connection & Balance Check
  async connectWalletAndVerifyBalance(investorAddress: string, requiredAmount: number): Promise<boolean> {
    try {
      // Check wallet connection
      const balance = await this.mortgageProtocol.provider.getBalance(investorAddress);
      const balanceInEth = ethers.utils.formatEther(balance);
      
      // Check if balance is sufficient (convert USD to AVAX)
      const requiredAvax = requiredAmount / 1000; // Assuming 1 AVAX = $1000
      
      if (parseFloat(balanceInEth) >= requiredAvax) {
        await this.updateJourneyStep(investorAddress, 'wallet', 'completed', { balance: balanceInEth });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Wallet verification failed:', error);
      return false;
    }
  }

  // Step 4: Investment Analysis & Projections
  async generateInvestmentAnalysis(propertyId: string, investmentAmount: number): Promise<any> {
    const analysis = {
      propertyValue: 150000,
      investmentAmount,
      tokensToReceive: investmentAmount, // 1:1 ratio
      percentageOwnership: (investmentAmount / 150000) * 100,
      monthlyRent: 2050,
      monthlyYield: Math.round(((investmentAmount / 150000) * 2050)),
      annualYield: Math.round(((investmentAmount / 150000) * 2050) * 12),
      annualReturn: Math.round(((investmentAmount / 150000) * 2050) * 12 / investmentAmount * 100),
      projectedValue: Math.round(150000 * Math.pow(1.04, 10)), // 4% annual appreciation
      riskLevel: 'Low',
      liquidityScore: 'High',
      marketTrends: {
        rentalDemand: 'Increasing',
        propertyAppreciation: '4% annually',
        marketVolatility: 'Low'
      }
    };

    return analysis;
  }

  // Step 5: Token Purchase
  async purchaseTokens(investorAddress: string, propertyId: string, investmentAmount: number): Promise<any> {
    try {
      // Calculate AVAX amount needed
      const avaxAmount = ethers.utils.parseEther((investmentAmount / 1000).toString());
      
      // Purchase tokens through smart contract
      const tx = await this.mortgageProtocol.mintMortgageTokens(
        parseInt(propertyId),
        investmentAmount,
        avaxAmount
      );
      
      const receipt = await tx.wait();
      
      // Create investment record
      const investment: PropertyInvestment = {
        id: `inv_${Date.now()}`,
        propertyId,
        investorAddress,
        investmentAmount,
        tokensOwned: investmentAmount,
        percentageOwnership: (investmentAmount / 150000) * 100,
        monthlyYield: Math.round(((investmentAmount / 150000) * 2050)),
        totalYieldEarned: 0,
        investmentDate: new Date(),
        status: 'active'
      };

      // Update journey
      await this.updateJourneyStep(investorAddress, 'investment', 'completed', { 
        transactionHash: receipt.transactionHash,
        investment 
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        investment
      };
    } catch (error) {
      console.error('Token purchase failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Step 6: Investment Confirmation & Portfolio Update
  async confirmInvestment(investorAddress: string, propertyId: string): Promise<boolean> {
    try {
      // Verify tokens were received
      const tokensOwned = await this.mortgageProtocol.getMortgageTokens(investorAddress, parseInt(propertyId));
      
      if (tokensOwned.gt(0)) {
        await this.updateJourneyStep(investorAddress, 'confirmation', 'completed', { tokensOwned: tokensOwned.toString() });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Investment confirmation failed:', error);
      return false;
    }
  }

  // Portfolio Analytics
  async getInvestmentAnalytics(investorAddress: string): Promise<InvestmentAnalytics> {
    // Get all investments for the investor
    const investments = await this.getInvestorInvestments(investorAddress);
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    const totalYield = investments.reduce((sum, inv) => sum + inv.totalYieldEarned, 0);
    const totalValue = totalInvested + totalYield;
    const averageReturn = totalInvested > 0 ? (totalYield / totalInvested) * 100 : 0;
    
    return {
      totalInvested,
      totalValue,
      totalYield,
      portfolioDiversity: investments.length,
      averageReturn,
      properties: investments
    };
  }

  // Yield Distribution
  async distributeMonthlyYields(): Promise<void> {
    // This would be called by a cron job or smart contract event
    const allInvestments = await this.getAllActiveInvestments();
    
    for (const investment of allInvestments) {
      const monthlyYield = investment.monthlyYield;
      
      // Update yield earned
      investment.totalYieldEarned += monthlyYield;
      
      // In a real implementation, this would transfer AVAX to the investor
      // await this.transferYieldToInvestor(investment.investorAddress, monthlyYield);
    }
  }

  // Helper Methods
  private async verifyIdentity(kycData: any): Promise<{ success: boolean }> {
    // Simulate KYC verification
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  }

  private async updateJourneyStep(investorAddress: string, stepId: string, status: 'completed' | 'failed', data?: any): Promise<void> {
    // Update journey step in database
    console.log(`Updated step ${stepId} to ${status} for ${investorAddress}`, data);
  }

  private async getInvestorInvestments(investorAddress: string): Promise<PropertyInvestment[]> {
    // Get investments from database
    return [
      {
        id: 'inv_1',
        propertyId: '1',
        investorAddress,
        investmentAmount: 30000,
        tokensOwned: 30000,
        percentageOwnership: 20,
        monthlyYield: 594,
        totalYieldEarned: 1188,
        investmentDate: new Date('2024-01-01'),
        status: 'active'
      }
    ];
  }

  private async getAllActiveInvestments(): Promise<PropertyInvestment[]> {
    // Get all active investments from database
    return [];
  }
}

// Investment Journey Manager
export class InvestmentJourneyManager {
  private backend: InvestmentBackend;

  constructor(backend: InvestmentBackend) {
    this.backend = backend;
  }

  async startNewInvestment(investorAddress: string, propertyId: string): Promise<InvestmentJourney> {
    return await this.backend.startInvestmentJourney(investorAddress, propertyId);
  }

  async completeStep(journey: InvestmentJourney, stepId: string, data?: any): Promise<InvestmentJourney> {
    const stepIndex = journey.steps.findIndex(step => step.id === stepId);
    
    if (stepIndex !== -1) {
      journey.steps[stepIndex].status = 'completed';
      journey.steps[stepIndex].data = data;
      journey.currentStep = stepIndex + 1;
      journey.updatedAt = new Date();
      
      if (journey.currentStep >= journey.totalSteps) {
        journey.status = 'completed';
      }
    }
    
    return journey;
  }

  getCurrentStep(journey: InvestmentJourney): InvestmentStep | null {
    return journey.steps[journey.currentStep] || null;
  }

  getProgressPercentage(journey: InvestmentJourney): number {
    return (journey.currentStep / journey.totalSteps) * 100;
  }
} 