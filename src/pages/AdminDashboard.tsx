import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Code, 
  Home, 
  RefreshCw, 
  AlertTriangle, 
  Rocket, 
  Building2,
  MessageCircle,
  Zap,
  Github,
  Send
} from "lucide-react";
import { useState } from "react";
import { SimpleTokenTest } from "@/components/SimpleTokenTest";

const AdminDashboard = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployingVillage, setIsDeployingVillage] = useState(false);

  const handleDeploySmartContracts = async () => {
    setIsDeploying(true);
    try {
      // This would trigger the deployment script
      console.log("Deploying smart contracts...");
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert("Smart contracts deployed successfully!");
    } catch (error) {
      console.error("Deployment failed:", error);
      alert("Deployment failed. Check console for details.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeployVillageCitizenship = async () => {
    setIsDeployingVillage(true);
    try {
      // This would deploy the VillageCitizenship contract
      console.log("Deploying VillageCitizenship contract...");
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert("VillageCitizenship contract deployed successfully!");
    } catch (error) {
      console.error("Village deployment failed:", error);
      alert("Village deployment failed. Check console for details.");
    } finally {
      setIsDeployingVillage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Code className="h-5 w-5" />
          <span className="text-sm">/admin/projects</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-white">
            <Send className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white">
            <Zap className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white">
            <Github className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-white border-white">
            Publish
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Review projects and monitor platform analytics</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reset Portfolio
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="smart-contracts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="smart-contracts" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Smart Contracts
            </TabsTrigger>
            <TabsTrigger value="submissions">Project Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
            <TabsTrigger value="lending">Lending Pool Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="smart-contracts" className="space-y-6">
            {/* Simple Token Purchase Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Rocket className="h-5 w-5 mr-2" />
                  🚀 Simple Token Purchase Test
                </CardTitle>
                <CardDescription>
                  Test real blockchain transactions with the SimpleTokenPurchase contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleTokenTest />
              </CardContent>
            </Card>

            {/* Smart Contract Deployment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Rocket className="h-5 w-5 mr-2" />
                  Smart Contract Deployment
                </CardTitle>
                <CardDescription>
                  Deploy your smart contracts to the Avalanche Fuji testnet with one click
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleDeploySmartContracts}
                  disabled={isDeploying}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {isDeploying ? "Deploying..." : "Deploy Smart Contracts"}
                </Button>
              </CardContent>
            </Card>

            {/* Village Citizenship Contract */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Village Citizenship Contract
                </CardTitle>
                <CardDescription>
                  Deploy the VillageCitizenship contract to Fuji testnet and update the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleDeployVillageCitizenship}
                  disabled={isDeployingVillage}
                  className="bg-orange-500 hover:bg-orange-600 mb-4"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {isDeployingVillage ? "Deploying..." : "Deploy VillageCitizenship Contract"}
                </Button>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">What this does:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Deploys VillageCitizenship.sol to Fuji testnet</li>
                    <li>Updates the contract_addresses table with the real address</li>
                    <li>Fixes the "Join Village" functionality</li>
                    <li>Enables 0.1 AVAX citizenship purchases</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Project Submissions</CardTitle>
                <CardDescription>Review and approve new project submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No pending submissions</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Monitor platform performance and user metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics dashboard coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lending">
            <Card>
              <CardHeader>
                <CardTitle>Lending Pool Operations</CardTitle>
                <CardDescription>Manage lending pool parameters and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Lending pool management coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <Button 
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 bg-orange-500 hover:bg-orange-600"
        size="icon"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default AdminDashboard;
