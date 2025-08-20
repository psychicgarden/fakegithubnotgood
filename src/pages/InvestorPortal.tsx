import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart, DollarSign, BarChart3, Plus, Eye, Briefcase } from "lucide-react";
import villaBahia from "@/assets/loft-bahia.jpg";
import villaMexico from "@/assets/penthouse-mexico.jpg";
import villaGreece from "@/assets/apartment-greece.jpg";
import InvestmentJourney from "@/components/InvestmentJourney";
import InvestorPortfolio from "@/components/InvestorPortfolio";
import { useState } from "react";

const InvestorPortal = () => {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showJourney, setShowJourney] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'portfolio'>('properties');

  const properties = [
    {
      id: "1",
      name: "Artist Loft Bahia",
      location: "Salvador, Bahia, Brazil",
      value: 165000,
      funded: 82,
      minInvestment: 250,
      annualYield: 11.2,
      image: villaBahia,
      description: "Industrial-chic loft with ocean views in the historic Pelourinho district"
    },
    {
      id: "2", 
      name: "Beach Penthouse Tulum",
      location: "Tulum, Quintana Roo, Mexico",
      value: 152000,
      funded: 75,
      minInvestment: 200,
      annualYield: 13.8,
      image: villaMexico,
      description: "Rooftop penthouse with private terrace and jacuzzi near cenotes"
    },
    {
      id: "3",
      name: "Modern Caldera Apartment", 
      location: "Oia, Santorini, Greece",
      value: 178000,
      funded: 91,
      minInvestment: 300,
      annualYield: 10.5,
      image: villaGreece,
      description: "Minimalist apartment with private balcony overlooking the caldera"
    }
  ];

  const handleStartInvestment = (property: any) => {
    setSelectedProperty(property);
    setShowJourney(true);
  };

  const handleJourneyComplete = (journey: any) => {
    setShowJourney(false);
    setSelectedProperty(null);
    // Could show success message or redirect to portfolio
  };

  if (showJourney && selectedProperty) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-8 px-6">
          <div className="container mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowJourney(false)}
              className="mb-6"
            >
              ← Back to Properties
            </Button>
            <InvestmentJourney
              propertyId={selectedProperty.id}
              propertyName={selectedProperty.name}
              propertyValue={selectedProperty.value}
              onJourneyComplete={handleJourneyComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Investor Portal
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Fractional property ownership through blockchain tokens. Invest in global real estate with AI-driven analytics and instant liquidity.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              variant={activeTab === 'properties' ? 'default' : 'outline'} 
              size="lg"
              onClick={() => setActiveTab('properties')}
            >
              Browse Properties
            </Button>
            <Button 
              variant={activeTab === 'portfolio' ? 'default' : 'outline'} 
              size="lg"
              onClick={() => setActiveTab('portfolio')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              View Portfolio
            </Button>
            <Button variant="outline" size="lg">
              Investment Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Investment Features */}
      <section className="pb-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-card border-accent/20">
              <CardHeader>
                <PieChart className="w-8 h-8 text-gold mb-2" />
                <CardTitle>Fractional Ownership</CardTitle>
                <CardDescription>
                  Own portions of premium properties worldwide
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-card border-accent/20">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-gold mb-2" />
                <CardTitle>AI Analytics</CardTitle>
                <CardDescription>
                  Predictive yield forecasts and portfolio optimization
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-card border-accent/20">
              <CardHeader>
                <DollarSign className="w-8 h-8 text-gold mb-2" />
                <CardTitle>Instant Liquidity</CardTitle>
                <CardDescription>
                  Sell property tokens on secondary markets in minutes
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-card border-accent/20">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-gold mb-2" />
                <CardTitle>Average 12.5% Returns</CardTitle>
                <CardDescription>
                  Consistent returns from rental income and appreciation
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Content based on active tab */}
      {activeTab === 'properties' ? (
        <section className="pb-16 px-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Active Property Campaigns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="bg-gradient-card border-accent/20">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-cover bg-center rounded-lg mb-4" 
                         style={{ backgroundImage: `url(${property.image})` }}></div>
                    <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                    <p className="text-muted-foreground mb-2">{property.location}</p>
                    <p className="text-sm text-muted-foreground mb-4">{property.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Funded: {property.funded}%</span>
                      <span className="text-sm font-semibold">${(property.value / 1000).toFixed(0)}K Target</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Min. Investment:</span>
                      <span className="text-sm font-semibold text-gold">${property.minInvestment}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Est. Annual Yield:</span>
                      <span className="text-sm font-semibold text-green-500">{property.annualYield}%</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="default"
                        onClick={() => handleStartInvestment(property)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Start Investment
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="pb-16 px-6">
          <div className="container mx-auto">
            <InvestorPortfolio />
          </div>
        </section>
      )}
    </div>
  );
};

export default InvestorPortal;