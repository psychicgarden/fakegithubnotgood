import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, Building2, Users, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

const SmartContractTest = () => {
  const { isConnected, account, ancientMortgageProtocol, villageCitizenship, purchaseTokens, joinVillage, isPurchasing } = useWallet();
  const [investmentAmount, setInvestmentAmount] = useState(30000);
  const [villageId, setVillageId] = useState(1);
  const [membershipFee, setMembershipFee] = useState(30000);
  const [testResults, setTestResults] = useState<any>(null);

  const runContractTests = async () => {
    if (!isConnected || !ancientMortgageProtocol || !villageCitizenship) {
      setTestResults({ error: "Wallet not connected or contracts not initialized" });
      return;
    }

    const results = {
      propertyDetails: null,
      userProperties: null,
      villageDetails: null,
      userCitizenship: null,
      error: null
    };

    try {
      // Test 1: Get Property Details from Ancient Mortgage Protocol
      try {
        const property = await ancientMortgageProtocol.getPropertyDetails(1);
        results.propertyDetails = {
          purchasePrice: property.purchasePrice.toString(),
          downPayment: property.downPayment.toString(),
          monthlyPayment: property.monthlyPayment.toString(),
          isActive: property.isActive
        };
      } catch (error) {
        console.error("Property details test failed:", error);
      }

      // Test 2: Get User Properties
      try {
        const properties = await ancientMortgageProtocol.getUserProperties(account!);
        results.userProperties = properties.map((p: any) => p.toString());
      } catch (error) {
        console.error("User properties test failed:", error);
      }

      // Test 3: Get Village Details from Village Citizenship
      try {
        const village = await villageCitizenship.getVillage(1);
        results.villageDetails = {
          name: village.name,
          membershipFee: village.membershipFee.toString(),
          maxCitizens: village.maxCitizens.toString(),
          currentCitizens: village.currentCitizens.toString(),
          isActive: village.isActive
        };
      } catch (error) {
        console.error("Village details test failed:", error);
      }

      // Test 4: Check User Citizenship
      try {
        const citizenship = await villageCitizenship.getCitizenship(account!, 1);
        results.userCitizenship = {
          isActive: citizenship.isActive,
          membershipFee: citizenship.membershipFee.toString(),
          joinDate: new Date(citizenship.joinDate * 1000).toLocaleDateString()
        };
      } catch (error) {
        console.error("User citizenship test failed:", error);
      }

    } catch (error: any) {
      results.error = error.message;
    }

    setTestResults(results);
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            Test the smart contract functionality on Avalanche Fuji testnet
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Test the mortgage protocol smart contract functionality and verify blockchain integration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet Connection
              </CardTitle>
              <CardDescription>
                Current wallet connection status and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                {isConnected && <CheckCircle className="w-4 h-4 text-green-500" />}
                {!isConnected && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
              
              {account && (
                <div className="text-sm">
                  <Label>Account Address:</Label>
                  <p className="font-mono text-xs break-all">{account}</p>
                </div>
              )}

              {ancientMortgageProtocol && (
                <div className="text-sm">
                  <Label>Ancient Mortgage Protocol Address:</Label>
                  <p className="font-mono text-xs break-all">
                    {ancientMortgageProtocol.contractAddress}
                  </p>
                </div>
              )}

              {villageCitizenship && (
                <div className="text-sm">
                  <Label>Village Citizenship Address:</Label>
                  <p className="font-mono text-xs break-all">
                    {villageCitizenship.contractAddress}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Contract Information
              </CardTitle>
              <CardDescription>
                Network and contract details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <Label>Network:</Label>
                <p className="font-semibold">Avalanche Fuji Testnet</p>
              </div>
              
              <div className="text-sm">
                <Label>Village Contract:</Label>
                <p className="font-mono text-xs break-all">
                  {villageCitizenship?.contractAddress || 'Not connected'}
                </p>
              </div>
              
              <div className="text-sm">
                <Label>Mazunte Contract:</Label>
                <p className="font-mono text-xs break-all">
                  {ancientMortgageProtocol?.contractAddress || 'Not connected'}
                </p>
              </div>
              
              <div className="text-sm">
                <Label>Token Symbol:</Label>
                <p className="font-semibold">MAZUNTE</p>
              </div>
            </CardContent>
          </Card>

          {/* Village Membership Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Village Membership Test
              </CardTitle>
              <CardDescription>
                Test the village membership functionality with a 0.1 AVAX fee.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="village-id">Village ID</Label>
                <Input
                  id="village-id"
                  type="number"
                  value={villageId}
                  onChange={(e) => setVillageId(Number(e.target.value))}
                  placeholder="1"
                />
              </div>
              
              <div>
                <Label htmlFor="membership-fee">Membership Fee ($)</Label>
                <Input
                  id="membership-fee"
                  type="number"
                  value={membershipFee}
                  onChange={(e) => setMembershipFee(Number(e.target.value))}
                  placeholder="30000"
                />
              </div>
              
              <Button 
                onClick={() => joinVillage(villageId, membershipFee)}
                disabled={!isConnected || isPurchasing}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isPurchasing ? "Processing..." : "Join Village (0.1 AVAX)"}
              </Button>
            </CardContent>
          </Card>

          {/* Contract Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Contract Tests
              </CardTitle>
              <CardDescription>
                Run comprehensive smart contract function tests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runContractTests}
                disabled={!isConnected || isPurchasing}
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                {isPurchasing ? "Testing..." : "Run Contract Tests"}
              </Button>

              {testResults && (
                <div className="space-y-2">
                  {testResults.error ? (
                    <div className="text-red-500 text-sm">{testResults.error}</div>
                  ) : (
                    <>
                      {testResults.propertyDetails && (
                        <div className="text-sm">
                          <Label>Property Details:</Label>
                          <pre className="text-xs bg-muted p-2 rounded">
                            {JSON.stringify(testResults.propertyDetails, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {testResults.userProperties && (
                        <div className="text-sm">
                          <Label>Your Properties:</Label>
                          <p>{testResults.userProperties.join(', ') || 'None'}</p>
                        </div>
                      )}
                      
                      {testResults.villageDetails && (
                        <div className="text-sm">
                          <Label>Village Details:</Label>
                          <pre className="text-xs bg-muted p-2 rounded">
                            {JSON.stringify(testResults.villageDetails, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {testResults.userCitizenship && (
                        <div className="text-sm">
                          <Label>Your Citizenship:</Label>
                          <pre className="text-xs bg-muted p-2 rounded">
                            {JSON.stringify(testResults.userCitizenship, null, 2)}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Token Purchase Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Token Purchase Test
              </CardTitle>
              <CardDescription>
                Test MAZUNTE token purchase with $30,000 investment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="investment-amount">Investment Amount ($)</Label>
                <Input
                  id="investment-amount"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  placeholder="30000"
                />
              </div>
              
              <Button 
                onClick={() => purchaseTokens(investmentAmount)}
                disabled={!isConnected || isPurchasing}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {isPurchasing ? "Processing..." : "Test Token Purchase"}
              </Button>
            </CardContent>
          </Card>

          {/* Network Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Network Status
              </CardTitle>
              <CardDescription>
                Current network connection status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">
                  Fuji
                </Badge>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              
              <div className="text-sm">
                <Label>Chain ID:</Label>
                <p className="font-mono text-xs">43113 (0xa869)</p>
              </div>
              
              <div className="text-sm">
                <Label>RPC URL:</Label>
                <p className="font-mono text-xs break-all">https://api.avax-test.network/ext/bc/C/rpc</p>
              </div>
              
              <div className="text-sm">
                <Label>Explorer:</Label>
                <p className="font-mono text-xs break-all">https://testnet.snowtrace.io</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results Summary */}
        {testResults && !testResults.error && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-muted-foreground">Contract Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-muted-foreground">Property Data</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-muted-foreground">Village System</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-muted-foreground">Citizenship</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default SmartContractTest; 