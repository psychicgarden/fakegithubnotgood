// Analytics and tracking for Ancient Mortgage Protocol
export interface InvestmentEvent {
  type: 'property_purchase' | 'payment_made' | 'kyc_completed' | 'portfolio_view' | 'error';
  timestamp: number;
  userId?: string;
  propertyId?: number;
  amount?: number;
  details?: Record<string, any>;
}

export interface UserAnalytics {
  totalInvested: number;
  propertiesOwned: number;
  totalPayments: number;
  averageMonthlyPayment: number;
  kycStatus: boolean;
  lastActivity: number;
}

class AnalyticsService {
  private events: InvestmentEvent[] = [];
  private userData: Map<string, UserAnalytics> = new Map();

  // Track user interaction
  trackEvent(event: InvestmentEvent) {
    this.events.push(event);
    
    // In production, this would send to analytics service
    console.log('Analytics Event:', event);
    
    // Update user analytics
    if (event.userId) {
      this.updateUserAnalytics(event);
    }
  }

  // Track property purchase
  trackPropertyPurchase(userId: string, propertyId: number, amount: number, propertyDetails: any) {
    this.trackEvent({
      type: 'property_purchase',
      timestamp: Date.now(),
      userId,
      propertyId,
      amount,
      details: {
        propertyName: propertyDetails.name,
        location: propertyDetails.location,
        downPayment: propertyDetails.downPayment,
        monthlyPayment: propertyDetails.monthlyPayment
      }
    });
  }

  // Track payment made
  trackPayment(userId: string, propertyId: number, amount: number) {
    this.trackEvent({
      type: 'payment_made',
      timestamp: Date.now(),
      userId,
      propertyId,
      amount
    });
  }

  // Track KYC completion
  trackKYCCompletion(userId: string, amount: number) {
    this.trackEvent({
      type: 'kyc_completed',
      timestamp: Date.now(),
      userId,
      amount
    });
  }

  // Track portfolio view
  trackPortfolioView(userId: string) {
    this.trackEvent({
      type: 'portfolio_view',
      timestamp: Date.now(),
      userId
    });
  }

  // Track errors
  trackError(userId: string, error: string, context?: any) {
    this.trackEvent({
      type: 'error',
      timestamp: Date.now(),
      userId,
      details: {
        error,
        context
      }
    });
  }

  // Update user analytics
  private updateUserAnalytics(event: InvestmentEvent) {
    const userId = event.userId!;
    const current = this.userData.get(userId) || {
      totalInvested: 0,
      propertiesOwned: 0,
      totalPayments: 0,
      averageMonthlyPayment: 0,
      kycStatus: false,
      lastActivity: Date.now()
    };

    switch (event.type) {
      case 'property_purchase':
        current.totalInvested += event.amount || 0;
        current.propertiesOwned += 1;
        break;
      case 'payment_made':
        current.totalPayments += 1;
        current.averageMonthlyPayment = 
          (current.averageMonthlyPayment * (current.totalPayments - 1) + (event.amount || 0)) / current.totalPayments;
        break;
      case 'kyc_completed':
        current.kycStatus = true;
        break;
    }

    current.lastActivity = Date.now();
    this.userData.set(userId, current);
  }

  // Get user analytics
  getUserAnalytics(userId: string): UserAnalytics | null {
    return this.userData.get(userId) || null;
  }

  // Get investment performance metrics
  getInvestmentMetrics() {
    const totalEvents = this.events.length;
    const totalPurchases = this.events.filter(e => e.type === 'property_purchase').length;
    const totalPayments = this.events.filter(e => e.type === 'payment_made').length;
    const totalKYC = this.events.filter(e => e.type === 'kyc_completed').length;
    const totalErrors = this.events.filter(e => e.type === 'error').length;

    const totalInvested = this.events
      .filter(e => e.type === 'property_purchase')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
      totalEvents,
      totalPurchases,
      totalPayments,
      totalKYC,
      totalErrors,
      totalInvested,
      successRate: totalEvents > 0 ? ((totalEvents - totalErrors) / totalEvents) * 100 : 0
    };
  }

  // Export analytics for investor presentation
  exportAnalytics() {
    return {
      events: this.events,
      userData: Object.fromEntries(this.userData),
      metrics: this.getInvestmentMetrics(),
      timestamp: Date.now()
    };
  }

  // Clear analytics (for testing)
  clear() {
    this.events = [];
    this.userData.clear();
  }
}

export const analytics = new AnalyticsService(); 