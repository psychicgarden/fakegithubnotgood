import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/contexts/WalletContext";
import { getUserProperties, updatePayment } from "@/lib/api";
import { PROPERTY_NAMES } from "@/lib/constants";
import { fmtUSD, fromBase, toBase } from "@/lib/money";
import { 
  Home, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  ExternalLink
} from "lucide-react";

interface PropertyDetails {
  id: string;
  user_address: string;
  property_id: number;
  purchase_price_base: number;
  down_payment_base: number;
  loan_amount_base: number;
  remaining_balance_base: number;
  principal_paid_base: number;
  interest_paid_base: number;
  apr_bps: number;
  term_months: number;
  created_at: string;
  updated_at: string;
}

interface PaymentHistory {
  amount: number;
  timestamp: string;
  paymentNumber: number;
  isLate: boolean;
}

const InvestorPortfolio = () => {
  const { isConnected, account } = useWallet();
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<{ [key: number]: PaymentHistory[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadPortfolio();
    }
  }, [isConnected, account]);

  const loadPortfolio = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Get user's properties from database
      const userProperties = await getUserProperties(account);
      setProperties(userProperties);
      
      // For now, we'll create mock payment history
      // In a real implementation, this would come from a payments table
      const mockPaymentData: { [key: number]: PaymentHistory[] } = {};
      userProperties.forEach(property => {
        mockPaymentData[property.property_id] = [
          {
            amount: fromBase(BigInt(property.principal_paid_base)),
            timestamp: new Date().toISOString(),
            paymentNumber: 1,
            isLate: false
          }
        ];
      });
      setPaymentHistory(mockPaymentData);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const makePayment = async (propertyId: number) => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Calculate payment amounts (simplified for demo)
      const property = properties.find(p => p.property_id === propertyId);
      if (!property) return;
      
      const monthlyPayment = fromBase(BigInt(property.loan_amount_base)) * 0.008; // 8% APR / 12 months
      const principalPayment = monthlyPayment * 0.7; // 70% to principal
      const interestPayment = monthlyPayment * 0.3; // 30% to interest
      
      // Update payment in database
      await updatePayment(
        account,
        propertyId,
        toBase(principalPayment),
        toBase(interestPayment)
      );
      
      // Refresh portfolio data
      loadPortfolio();
    } catch (error) {
      console.error('Error making payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilNextPayment = (lastPaymentDate: string) => {
    const daysSinceLastPayment = Math.floor((Date.now() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysSinceLastPayment);
  };

  const getDefaultStatus = (property: PropertyDetails) => {
    // For now, assume all properties are current
    // In a real implementation, this would check payment history
    return 'current';
  };

  const getDefaultBadge = (status: string) => {
    switch (status) {
      case 'defaulted':
        return <Badge variant="destructive">Defaulted</Badge>;
      case 'warning':
        return <Badge variant="destructive">Warning: 3/4 missed</Badge>;
      case 'late':
        return <Badge variant="secondary">Late Payment</Badge>;
      default:
        return <Badge variant="default">Current</Badge>;
    }
  };

  const calculateAppreciationValue = (purchasePriceBase: number) => {
    return fromBase(BigInt(purchasePriceBase)) * 1.1; // 110% cap
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
            <p className="text-muted-foreground">
              Connect your wallet to view your property portfolio
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your portfolio...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't purchased any properties yet. Start your investment journey!
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Browse Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{properties.length}</div>
              <div className="text-sm text-muted-foreground">Properties Owned</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {fmtUSD(BigInt(properties.reduce((sum, p) => sum + p.principal_paid_base + p.interest_paid_base, 0)))}
              </div>
              <div className="text-sm text-muted-foreground">Total Paid</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-gold">
                {fmtUSD(BigInt(properties.reduce((sum, p) => sum + p.remaining_balance_base, 0)))}
              </div>
              <div className="text-sm text-muted-foreground">Remaining Balance</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {fmtUSD(BigInt(properties.reduce((sum, p) => sum + (p.loan_amount_base * 8 / 100 / 12), 0)))}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Payments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((property) => {
          const defaultStatus = getDefaultStatus(property);
          const daysUntilPayment = getDaysUntilNextPayment(property.updated_at);
          const appreciationValue = calculateAppreciationValue(property.purchase_price_base);
          const history = paymentHistory[property.property_id] || [];

          return (
            <Card key={property.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      {PROPERTY_NAMES[property.property_id as keyof typeof PROPERTY_NAMES] || `Property #${property.property_id}`}
                    </CardTitle>
                    <CardDescription>
                      Property Investment
                    </CardDescription>
                  </div>
                  {getDefaultBadge(defaultStatus)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Property Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchase Price:</span>
                      <span className="font-semibold">{fmtUSD(BigInt(property.purchase_price_base))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Down Payment:</span>
                      <span className="font-semibold text-gold">{fmtUSD(BigInt(property.down_payment_base))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Loan Amount:</span>
                      <span className="font-semibold text-blue-600">{fmtUSD(BigInt(property.loan_amount_base))}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining Balance:</span>
                      <span className="font-semibold">{fmtUSD(BigInt(property.remaining_balance_base))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Principal Paid:</span>
                      <span className="font-semibold text-green-600">{fmtUSD(BigInt(property.principal_paid_base))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Interest Paid:</span>
                      <span className="font-semibold text-orange-600">{fmtUSD(BigInt(property.interest_paid_base))}</span>
                    </div>
                  </div>
                </div>

                                {/* Payment Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Payment Progress</span>
                    <span>{Math.round((property.principal_paid_base / property.loan_amount_base) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(property.principal_paid_base / property.loan_amount_base) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Next Payment */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Next Payment:</span>
                  </div>
                  <span className="text-sm font-semibold">{daysUntilPayment} days</span>
                </div>

                {/* Appreciation Projection */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">Appreciation Projection</span>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Current Value:</span>
                      <span>{fmtUSD(BigInt(property.purchase_price_base))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Value (10yr):</span>
                      <span className="text-green-600">{fmtUSD(BigInt(Math.round(appreciationValue * 1_000_000)))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Share (50%):</span>
                      <span className="text-gold">{fmtUSD(BigInt(Math.round(appreciationValue * 0.5 * 1_000_000)))}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => makePayment(property.property_id)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Processing..." : "Make Payment"}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    View Deed
                  </Button>
                </div>

                {/* Payment History */}
                {history.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Recent Payments</h4>
                    <div className="space-y-2">
                      {history.slice(-3).map((payment, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${payment.isLate ? 'text-red-500' : 'text-green-500'}`} />
                            <span>Payment #{payment.paymentNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{fmtUSD(BigInt(Math.round(payment.amount * 1_000_000)))}</span>
                            <span className="text-muted-foreground">
                              {new Date(payment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InvestorPortfolio; 