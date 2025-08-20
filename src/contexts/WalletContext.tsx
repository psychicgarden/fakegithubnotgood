import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { AncientMortgageProtocol, VillageCitizenship, CONTRACT_ADDRESSES, NETWORK_CONFIG } from '@/lib/contracts';

interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  purchaseTokens: (investmentAmount?: number) => Promise<void>;
  joinVillage: (villageId: number, membershipFee: number) => Promise<void>;
  isPurchasing: boolean;
  ancientMortgageProtocol: AncientMortgageProtocol | null;
  villageCitizenship: VillageCitizenship | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

const AVALANCHE_FUJI_CHAIN_ID = '0xa869'; // 43113 in hex
const AVALANCHE_FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [ancientMortgageProtocol, setAncientMortgageProtocol] = useState<AncientMortgageProtocol | null>(null);
  const [villageCitizenship, setVillageCitizenship] = useState<VillageCitizenship | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        })
        .catch(console.error);
    }
  }, []);

  const switchToAvalancheFuji = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        // Switch to Avalanche Fuji
        await switchToAvalancheFuji();
        
        // Initialize contracts with real Fuji testnet addresses
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Initialize Ancient Mortgage Protocol (REAL FUJI ADDRESS)
        console.log('Initializing Ancient Mortgage Protocol with address:', CONTRACT_ADDRESSES.ANCIENT_MORTGAGE_PROTOCOL);
        const ancientMortgageProtocol = new AncientMortgageProtocol(provider);
        setAncientMortgageProtocol(ancientMortgageProtocol);
        
        // Initialize Village Citizenship (REAL FUJI ADDRESS)
        console.log('Initializing Village Citizenship with address:', CONTRACT_ADDRESSES.VILLAGE_CITIZENSHIP);
        const villageCitizenship = new VillageCitizenship(provider);
        setVillageCitizenship(villageCitizenship);
        
        console.log('Contracts initialized successfully');
        console.log('Ancient Mortgage Protocol address:', ancientMortgageProtocol.contractAddress);
        console.log('Village Citizenship address:', villageCitizenship.contractAddress);
        
        setAccount(accounts[0]);
        setIsConnected(true);
        
        toast({
          title: "Wallet Connected",
          description: "Connected to Avalanche Fuji - Smart contract integration enabled",
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setAncientMortgageProtocol(null);
    setVillageCitizenship(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const purchaseTokens = async (investmentAmount: number = 30000) => {
    if (!isConnected || !ancientMortgageProtocol) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    
    try {
      // Calculate token details
      const propertyValue = 150000;
      const monthlyProfit = Math.round(((investmentAmount / propertyValue) * 943));
      const tokens = investmentAmount; // 1 token per $1 invested
      
      toast({
        title: "Processing Transaction",
        description: `Purchasing ${tokens.toLocaleString()} MAZUNTE tokens for $${investmentAmount.toLocaleString()}...`,
      });

      // Use Ancient Mortgage Protocol for token purchase
      const tx = await ancientMortgageProtocol.purchaseProperty(propertyValue, investmentAmount);
      
      toast({
        title: "Success! You are now a Mazunte Village Founding Citizen",
        description: `Investment: $${investmentAmount.toLocaleString()} | Monthly Yield: $${monthlyProfit} | Village Access: Activated`,
        action: (
          <a 
            href={`https://testnet.snowtrace.io/tx/${tx.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm"
          >
            View on Avalanche Explorer
          </a>
        ),
      });
    } catch (error: any) {
      console.error('Error purchasing tokens:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to purchase MAZUNTE village tokens",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const joinVillage = async (villageId: number, membershipFee: number) => {
    if (!isConnected || !villageCitizenship) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    
    try {
      toast({
        title: "Processing Village Membership",
        description: `Joining village ${villageId} with membership fee $${membershipFee.toLocaleString()}...`,
      });

      // Use Village Citizenship contract for village membership
      const value = ethers.utils.parseEther((membershipFee / 1000).toString()); // Convert to AVAX
      const tx = await villageCitizenship.purchaseCitizenship(villageId, { value });
      const receipt = await tx.wait();
      
      toast({
        title: "Village Membership Activated!",
        description: `Successfully joined village ${villageId} | Membership Fee: $${membershipFee.toLocaleString()}`,
        action: (
          <a 
            href={`https://testnet.snowtrace.io/tx/${receipt.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm"
          >
            View on Avalanche Explorer
          </a>
        ),
      });
    } catch (error: any) {
      console.error('Error joining village:', error);
      toast({
        title: "Village Join Failed",
        description: error.message || "Failed to join village",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        account,
        isLoading,
        connectWallet,
        disconnectWallet,
        purchaseTokens,
        joinVillage,
        isPurchasing,
        ancientMortgageProtocol,
        villageCitizenship,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Extend window type for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}