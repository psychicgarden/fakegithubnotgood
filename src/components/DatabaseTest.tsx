import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { upsertPropertyPurchase, createPurchasePayload, getUserProperties } from "@/lib/api";
import { PROPERTY_IDS } from "@/lib/constants";
import { toBase } from "@/lib/money";
import { useToast } from "@/hooks/use-toast";

const DatabaseTest = () => {
  const { isConnected, account } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  
  const [testData, setTestData] = useState({
    propertyId: 1,
    purchasePrice: 150000,
    downPayment: 30000,
    apr: 8.0,
    termMonths: 120
  });

  const testPurchase = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = createPurchasePayload(
        account,
        testData.propertyId,
        testData.purchasePrice,
        testData.downPayment,
        testData.apr,
        testData.termMonths
      );

      await upsertPropertyPurchase(payload);
      
      toast({
        title: "Success!",
        description: "Property purchase recorded in database",
      });

      // Refresh properties
      loadProperties();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record purchase",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProperties = async () => {
    if (!account) return;
    
    try {
      const userProperties = await getUserProperties(account);
      setProperties(userProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyId">Property ID</Label>
              <Input
                id="propertyId"
                type="number"
                value={testData.propertyId}
                onChange={(e) => setTestData(prev => ({ ...prev, propertyId: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={testData.purchasePrice}
                onChange={(e) => setTestData(prev => ({ ...prev, purchasePrice: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="downPayment">Down Payment ($)</Label>
              <Input
                id="downPayment"
                type="number"
                value={testData.downPayment}
                onChange={(e) => setTestData(prev => ({ ...prev, downPayment: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="apr">APR (%)</Label>
              <Input
                id="apr"
                type="number"
                step="0.1"
                value={testData.apr}
                onChange={(e) => setTestData(prev => ({ ...prev, apr: parseFloat(e.target.value) }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={testPurchase} 
            disabled={!isConnected || isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Test Property Purchase"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadProperties} className="mb-4">
            Load Properties
          </Button>
          
          {properties.length === 0 ? (
            <p className="text-muted-foreground">No properties found</p>
          ) : (
            <div className="space-y-2">
              {properties.map((property) => (
                <div key={property.id} className="p-3 border rounded-lg">
                  <div className="font-semibold">Property #{property.property_id}</div>
                  <div className="text-sm text-muted-foreground">
                    Purchase Price: ${(property.purchase_price_base / 1_000_000).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Down Payment: ${(property.down_payment_base / 1_000_000).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Loan Amount: ${(property.loan_amount_base / 1_000_000).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Remaining Balance: ${(property.remaining_balance_base / 1_000_000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseTest; 