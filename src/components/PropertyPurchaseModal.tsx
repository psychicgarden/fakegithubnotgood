import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { CheckCircle, AlertCircle, DollarSign, Calendar, FileText, Shield, TrendingUp, Download, Loader2 } from "lucide-react";
import { upsertPropertyPurchase, createPurchasePayload } from "@/lib/api";
import { PROPERTY_IDS, PROPERTY_DETAILS } from "@/lib/constants";
import { fmtUSD, toBase, validateDownPayment } from "@/lib/money";

interface PropertyPurchaseModalProps {
  property: {
    id: string;
    name: string;
    location: string;
    value: number;
    image: string;
    description: string;
    deedLink?: string;
    legalOwner: string;
    expectedAppreciation: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: (propertyId: number, transactionHash: string) => void;
}

const PropertyPurchaseModal = ({ property, isOpen, onClose, onPurchaseComplete }: PropertyPurchaseModalProps) => {
  const { isConnected, account, mortgageProtocol } = useWallet();
  const [purchaseStep, setPurchaseStep] = useState<'kyc' | 'approval' | 'purchase' | 'complete'>('kyc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycData, setKycData] = useState({
    fullName: '',
    email: '',
    phone: '',
    amount: 500
  });
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [downPayment, setDownPayment] = useState(property.value * 0.2); // 20% down payment
  const [transactionHash, setTransactionHash] = useState('');
  const [isKYCVerified, setIsKYCVerified] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      // Check if user already has this property
      checkExistingProperty();
    }
  }, [isConnected, account]);

  const checkExistingProperty = async () => {
    // This would check if user already owns this property
    // For now, we'll assume they don't
    setIsKYCVerified(true); // Skip KYC for demo
    setPurchaseStep('approval');
  };

  const handleKYCSubmit = async () => {
    if (!account) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      // Simulate KYC verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsKYCVerified(true);
      setPurchaseStep('approval');
    } catch (error) {
      console.error('KYC verification failed:', error);
      setError('KYC verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePropertyPurchase = async () => {
    if (!account) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      // Validate down payment (20% minimum)
      const downPaymentBase = toBase(downPayment);
      const purchasePriceBase = toBase(property.value);
      
      if (!validateDownPayment(downPaymentBase, purchasePriceBase)) {
        throw new Error('Down payment must be at least 20% of property value');
      }

      // Map property to database ID
      const propertyId = PROPERTY_IDS.BAHIA_OCEAN_VILLA; // Default for now
      
      // Create purchase payload
      const payload = createPurchasePayload(
        account,
        propertyId,
        property.value,
        downPayment,
        8.0, // 8% APR
        120 // 10 years
      );

      // Save to database
      await upsertPropertyPurchase(payload);
      
      // Simulate transaction hash for demo
      const mockHash = '0x' + Math.random().toString(16).substr(2, 64);
      setTransactionHash(mockHash);
      setPurchaseStep('complete');
      
      onPurchaseComplete?.(propertyId, mockHash);
    } catch (error: any) {
      console.error('Property purchase failed:', error);
      setError(error.message || 'Property purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateMonthlyPayment = (principal: number, rate: number = 8, years: number = 10) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const monthlyPayment = calculateMonthlyPayment(property.value - downPayment);

  const resetModal = () => {
    setPurchaseStep('kyc');
    setError(null);
    setTransactionHash('');
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {property.name} - Property Purchase
          </DialogTitle>
          <DialogDescription>
            Complete the purchase process to become a Founding Citizen
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-cover bg-center rounded-lg" 
                     style={{ backgroundImage: `url(${property.image})` }}></div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Property Value:</span>
                    <span className="font-semibold">${property.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Down Payment (20%):</span>
                    <span className="font-semibold text-gold">${downPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mortgage Amount:</span>
                    <span className="font-semibold">${(property.value - downPayment).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Payment:</span>
                    <span className="font-semibold text-green-600">${monthlyPayment.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Interest Rate:</span>
                    <span className="font-semibold">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Term:</span>
                    <span className="font-semibold">10 years</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Legal Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Legal Owner:</span>
                  <Badge variant="outline">{property.legalOwner}</Badge>
                </div>
                {property.deedLink && (
                  <Button variant="outline" className="w-full" onClick={() => window.open(property.deedLink, '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    View Property Deed
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Investment Agreement
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Legal Structure
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Process */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Investment Projections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Expected Appreciation:</span>
                  <span className="font-semibold text-green-600">{property.expectedAppreciation}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Appreciation Cap:</span>
                  <span className="font-semibold">110%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Your Share:</span>
                  <span className="font-semibold text-gold">50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ancient Share:</span>
                  <span className="font-semibold">40%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lenders Share:</span>
                  <span className="font-semibold">10%</span>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* KYC Step */}
                {purchaseStep === 'kyc' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Step 1: KYC Verification</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName"
                          value={kycData.fullName}
                          onChange={(e) => setKycData({...kycData, fullName: e.target.value})}
                          placeholder="Enter your full name"
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={kycData.email}
                          onChange={(e) => setKycData({...kycData, email: e.target.value})}
                          placeholder="Enter your email"
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone"
                          value={kycData.phone}
                          onChange={(e) => setKycData({...kycData, phone: e.target.value})}
                          placeholder="Enter your phone number"
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">KYC Amount (USDT)</Label>
                        <Input 
                          id="amount"
                          type="number"
                          value={kycData.amount}
                          onChange={(e) => setKycData({...kycData, amount: Number(e.target.value)})}
                          placeholder="500"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleKYCSubmit}
                      disabled={isProcessing || !kycData.fullName || !kycData.email || !kycData.phone}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Complete KYC Verification"
                      )}
                    </Button>
                  </div>
                )}

                {/* USDT Approval Step */}
                {purchaseStep === 'approval' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Step 2: USDT Approval</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Your USDT Balance:</span>
                        <span className="font-semibold">${(usdtBalance / 10**6).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Required for Down Payment:</span>
                        <span className="font-semibold text-gold">${(downPayment / 10**6).toFixed(2)}</span>
                      </div>
                      {usdtBalance < downPayment && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <span className="text-yellow-700 text-sm">
                            ⚠️ Insufficient USDT balance. Please add more USDT to your wallet.
                          </span>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={() => setPurchaseStep('purchase')}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Continue to Purchase
                    </Button>
                  </div>
                )}

                {/* Purchase Step */}
                {purchaseStep === 'purchase' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Step 3: Complete Purchase</span>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Purchase Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Property:</span>
                          <span>{property.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Purchase Price:</span>
                          <span>${property.value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Down Payment:</span>
                          <span className="text-gold">${downPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Payment:</span>
                          <span className="text-green-600">${monthlyPayment.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handlePropertyPurchase}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing Purchase...
                        </>
                      ) : (
                        "Complete Purchase"
                      )}
                    </Button>
                  </div>
                )}

                {/* Completion Step */}
                {purchaseStep === 'complete' && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-700 mb-2">Purchase Successful!</h3>
                      <p className="text-green-600 mb-4">
                        You are now a Founding Citizen of {property.name}
                      </p>
                      {transactionHash && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Transaction Hash:</span>
                          <p className="font-mono text-xs break-all">{transactionHash}</p>
                        </div>
                      )}
                    </div>
                    <Button onClick={handleClose} className="w-full">
                      View Portfolio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyPurchaseModal; 