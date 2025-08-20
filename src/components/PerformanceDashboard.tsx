import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { analytics, UserAnalytics } from "@/lib/analytics";
import { useWallet } from "@/contexts/WalletContext";
import { 
  TrendingUp, 
  DollarSign, 
  Home, 
  Calendar, 
  Users, 
  BarChart3, 
  PieChart,
  Activity,
  Target,
  Award,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface PerformanceMetrics {
  totalProperties: number;
  totalInvested: number;
  activeUsers: number;
  successRate: number;
  averageMonthlyPayment: number;
  kycCompletionRate: number;
  recentActivity: any[];
}

const PerformanceDashboard = () => {
  const { account } = useWallet();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalProperties: 0,
    totalInvested: 0,
    activeUsers: 0,
    successRate: 0,
    averageMonthlyPayment: 0,
    kycCompletionRate: 0,
    recentActivity: []
  });
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadMetrics();
    if (account) {
      const userData = analytics.getUserAnalytics(account);
      setUserAnalytics(userData);
    }
  }, [account]);

  const loadMetrics = () => {
    const analyticsData = analytics.getInvestmentMetrics();
    
    // Simulate real metrics for demo
    setMetrics({
      totalProperties: 12,
      totalInvested: 2500000, // $2.5M
      activeUsers: 156,
      successRate: 94.2,
      averageMonthlyPayment: 2800,
      kycCompletionRate: 87.5,
      recentActivity: [
        { type: 'purchase', user: '0x1234...', amount: 150000, time: '2h ago' },
        { type: 'payment', user: '0x5678...', amount: 2800, time: '4h ago' },
        { type: 'kyc', user: '0x9abc...', amount: 500, time: '6h ago' },
        { type: 'purchase', user: '0xdef0...', amount: 200000, time: '8h ago' }
      ]
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time metrics and analytics for Ancient Mortgage Protocol</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period as any)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              +8.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Investment Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Monthly Payment</span>
                <span className="font-semibold">{formatCurrency(metrics.averageMonthlyPayment)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">KYC Completion Rate</span>
                <span className="font-semibold">{metrics.kycCompletionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Default Rate</span>
                <span className="font-semibold text-green-600">0.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Appreciation Realized</span>
                <span className="font-semibold text-gold">$450,000</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment Success Rate</span>
                <span>96.8%</span>
              </div>
              <Progress value={96.8} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* User Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              User Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userAnalytics ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Your Total Invested</span>
                  <span className="font-semibold">{formatCurrency(userAnalytics.totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Properties Owned</span>
                  <span className="font-semibold">{userAnalytics.propertiesOwned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Payments</span>
                  <span className="font-semibold">{userAnalytics.totalPayments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">KYC Status</span>
                  <Badge variant={userAnalytics.kycStatus ? 'default' : 'secondary'}>
                    {userAnalytics.kycStatus ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Connect your wallet to view personal analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.type === 'purchase' && <Home className="w-4 h-4 text-green-600" />}
                  {activity.type === 'payment' && <DollarSign className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'kyc' && <CheckCircle className="w-4 h-4 text-purple-600" />}
                  
                  <div>
                    <p className="font-medium">
                      {activity.type === 'purchase' && 'Property Purchase'}
                      {activity.type === 'payment' && 'Mortgage Payment'}
                      {activity.type === 'kyc' && 'KYC Verification'}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(activity.amount)}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Smart Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">USDT Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">KYC System</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Payment Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Analytics Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Security Monitoring</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard; 