import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { InvestmentBackend, InvestmentJourneyManager, InvestmentJourney, InvestmentStep } from "@/lib/investment-backend";
import { CheckCircle, Clock, AlertCircle, ArrowRight, Wallet, Calculator, TrendingUp, Shield } from "lucide-react";

interface InvestmentJourneyProps {
  propertyId: string;
  propertyName: string;
  propertyValue: number;
  onJourneyComplete?: (journey: InvestmentJourney) => void;
}

const InvestmentJourney = ({ propertyId, propertyName, propertyValue, onJourneyComplete }: InvestmentJourneyProps) => {
  const { isConnected, account, mortgageProtocol } = useWallet();
  const [journey, setJourney] = useState<InvestmentJourney | null>(null);
  const [currentStep, setCurrentStep] = useState<InvestmentStep | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState(30000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [journeyManager, setJourneyManager] = useState<InvestmentJourneyManager | null>(null);

  useEffect(() => {
    if (isConnected && account && mortgageProtocol) {
      const backend = new InvestmentBackend(mortgageProtocol);
      const manager = new InvestmentJourneyManager(backend);
      setJourneyManager(manager);
      
      // Start investment journey
      startJourney();
    }
  }, [isConnected, account, mortgageProtocol]);

  const startJourney = async () => {
    if (!journeyManager || !account) return;
    
    const newJourney = await journeyManager.startNewInvestment(account, propertyId);
    setJourney(newJourney);
    setCurrentStep(journeyManager.getCurrentStep(newJourney));
  };

  const completeStep = async (stepId: string, data?: any) => {
    if (!journeyManager || !journey) return;
    
    setIsProcessing(true);
    
    try {
      const updatedJourney = await journeyManager.completeStep(journey, stepId, data);
      setJourney(updatedJourney);
      setCurrentStep(journeyManager.getCurrentStep(updatedJourney));
      
      // Handle specific step completions
      if (stepId === 'analysis') {
        await generateAnalysis();
      } else if (stepId === 'investment') {
        await purchaseTokens();
      }
      
      if (updatedJourney.status === 'completed') {
        onJourneyComplete?.(updatedJourney);
      }
    } catch (error) {
      console.error('Error completing step:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAnalysis = async () => {
    if (!journeyManager) return;
    
    const backend = new InvestmentBackend(mortgageProtocol!);
    const analysis = await backend.generateInvestmentAnalysis(propertyId, investmentAmount);
    setAnalysis(analysis);
  };

  const purchaseTokens = async () => {
    if (!journeyManager || !account) return;
    
    const backend = new InvestmentBackend(mortgageProtocol!);
    const result = await backend.purchaseTokens(account, propertyId, investmentAmount);
    
    if (result.success) {
      // Complete the investment step
      await completeStep('investment', result);
    }
  };

  const getStepIcon = (step: InvestmentStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepBadge = (step: InvestmentStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'current':
        return <Badge variant="default" className="bg-blue-500">Current</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!journey) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Initializing investment journey...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Journey Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Investment Journey: {propertyName}
          </CardTitle>
          <CardDescription>
            Complete each step to invest in {propertyName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {journey.currentStep} of {journey.totalSteps} steps
              </span>
            </div>
            <Progress value={(journey.currentStep / journey.totalSteps) * 100} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {journey.steps.map((step, index) => (
              <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStepIcon(step)}
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {getStepBadge(step)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Actions */}
      {currentStep && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStepIcon(currentStep)}
              {currentStep.title}
            </CardTitle>
            <CardDescription>{currentStep.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep.id === 'kyc' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="Enter your full name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
                <Button 
                  onClick={() => completeStep('kyc', { verified: true })}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Verifying..." : "Complete Verification"}
                </Button>
              </div>
            )}

            {currentStep.id === 'wallet' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Wallet className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Wallet Connected: {account}</span>
                </div>
                <div>
                  <Label htmlFor="investmentAmount">Investment Amount ($)</Label>
                  <Input 
                    id="investmentAmount"
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    placeholder="30000"
                  />
                </div>
                <Button 
                  onClick={() => completeStep('wallet', { amount: investmentAmount })}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Verifying..." : "Verify Balance & Continue"}
                </Button>
              </div>
            )}

            {currentStep.id === 'analysis' && (
              <div className="space-y-4">
                {analysis ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Investment Amount:</span>
                        <span className="font-semibold">${investmentAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tokens to Receive:</span>
                        <span className="font-semibold">{analysis.tokensToReceive.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ownership %:</span>
                        <span className="font-semibold">{analysis.percentageOwnership.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Yield:</span>
                        <span className="font-semibold text-green-600">${analysis.monthlyYield}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Return:</span>
                        <span className="font-semibold text-green-600">{analysis.annualReturn}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <Badge variant="outline">{analysis.riskLevel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Liquidity Score:</span>
                        <Badge variant="outline">{analysis.liquidityScore}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Rental Demand: {analysis.marketTrends.rentalDemand}</p>
                        <p>Property Appreciation: {analysis.marketTrends.propertyAppreciation}</p>
                        <p>Market Volatility: {analysis.marketTrends.marketVolatility}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => completeStep('analysis')}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? "Generating..." : "Generate Investment Analysis"}
                  </Button>
                )}
                
                {analysis && (
                  <Button 
                    onClick={() => completeStep('investment')}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? "Processing..." : "Proceed to Investment"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {currentStep.id === 'investment' && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Investment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Property:</span>
                      <span>{propertyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investment Amount:</span>
                      <span>${investmentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tokens to Receive:</span>
                      <span>{investmentAmount.toLocaleString()} MPT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Monthly Yield:</span>
                      <span className="text-green-600">${analysis?.monthlyYield || 0}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => completeStep('investment')}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Processing Transaction..." : "Purchase Tokens"}
                </Button>
              </div>
            )}

            {currentStep.id === 'confirmation' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-700 mb-2">Investment Successful!</h3>
                  <p className="text-green-600">
                    You now own {investmentAmount.toLocaleString()} tokens in {propertyName}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${analysis?.monthlyYield || 0}</div>
                    <div className="text-sm text-muted-foreground">Monthly Yield</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{analysis?.annualReturn || 0}%</div>
                    <div className="text-sm text-muted-foreground">Annual Return</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{analysis?.percentageOwnership?.toFixed(1) || 0}%</div>
                    <div className="text-sm text-muted-foreground">Ownership</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => completeStep('confirmation')}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Confirming..." : "Complete Investment"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestmentJourney; 