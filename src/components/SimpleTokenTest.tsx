import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { SimpleTokenPurchase } from '@/lib/simple-contracts';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const SimpleTokenTest: React.FC = () => {
  const { isConnected, account } = useWallet();
  const [simpleContract, setSimpleContract] = useState<SimpleTokenPurchase | null>(null);
  const [avaxAmount, setAvaxAmount] = useState('0.1');
  const [userTokens, setUserTokens] = useState<number[]>([]);
  const [totalInvested, setTotalInvested] = useState('0');
  const [contractBalance, setContractBalance] = useState('0');
  const [tokenPrice, setTokenPrice] = useState('0.1');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isConnected && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new SimpleTokenPurchase(provider);
      setSimpleContract(contract);
      loadContractData(contract);
    }
  }, [isConnected]);

  const loadContractData = async (contract: SimpleTokenPurchase) => {
    try {
      const [price, balance] = await Promise.all([
        contract.getTokenPrice(),
        contract.getContractBalance()
      ]);
      setTokenPrice(price);
      setContractBalance(balance);

      if (account) {
        const [tokens, invested] = await Promise.all([
          contract.getUserTokens(account),
          contract.getUserTotalInvested(account)
        ]);
        setUserTokens(tokens);
        setTotalInvested(invested);
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  const handlePurchaseTokens = async () => {
    if (!simpleContract || !account) return;

    setIsLoading(true);
    try {
      toast({
        title: "Processing Transaction",
        description: `Purchasing tokens for ${avaxAmount} AVAX...`,
      });

      const tx = await simpleContract.purchaseTokens(avaxAmount);
      
      toast({
        title: "Success!",
        description: `Purchased tokens! Transaction: ${tx.transactionHash}`,
        action: (
          <a 
            href={`https://testnet.snowtrace.io/tx/${tx.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm"
          >
            View on Explorer
          </a>
        ),
      });

      // Reload data
      await loadContractData(simpleContract);
    } catch (error: any) {
      console.error('Error purchasing tokens:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to purchase tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (simpleContract) {
      await loadContractData(simpleContract);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Simple Token Purchase Test</CardTitle>
          <CardDescription>Connect your wallet to test token purchases</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 Simple Token Purchase Test</CardTitle>
          <CardDescription>Real blockchain transactions - no KYC required!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="avaxAmount">AVAX Amount</Label>
              <Input
                id="avaxAmount"
                type="number"
                step="0.1"
                min="0.1"
                value={avaxAmount}
                onChange={(e) => setAvaxAmount(e.target.value)}
                placeholder="0.1"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum: 0.1 AVAX</p>
            </div>
            <div>
              <Label>Token Price</Label>
              <Input value={tokenPrice} readOnly />
              <p className="text-sm text-gray-500 mt-1">AVAX per token</p>
            </div>
          </div>

          <Button 
            onClick={handlePurchaseTokens} 
            disabled={isLoading || parseFloat(avaxAmount) < 0.1}
            className="w-full"
          >
            {isLoading ? "Processing..." : `Purchase Tokens (${avaxAmount} AVAX)`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Contract Information</CardTitle>
          <CardDescription>Real-time blockchain data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Contract Address</Label>
              <Input value={simpleContract?.contractAddress || 'Loading...'} readOnly />
            </div>
            <div>
              <Label>Contract Balance</Label>
              <Input value={`${contractBalance} AVAX`} readOnly />
            </div>
            <div>
              <Label>Your Total Invested</Label>
              <Input value={`${totalInvested} AVAX`} readOnly />
            </div>
            <div>
              <Label>Your Tokens</Label>
              <Input value={userTokens.length.toString()} readOnly />
            </div>
          </div>

          <Button onClick={handleRefresh} variant="outline" className="w-full">
            Refresh Data
          </Button>
        </CardContent>
      </Card>

      {userTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎫 Your Tokens</CardTitle>
            <CardDescription>Token IDs you own</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userTokens.map((tokenId) => (
                <div key={tokenId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Token #{tokenId}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
