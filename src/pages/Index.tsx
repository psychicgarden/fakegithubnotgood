import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedInvestments from "@/components/FeaturedInvestments";
import TwoWaysToInvest from "@/components/TwoWaysToInvest";
import SmartContractTest from "@/components/SmartContractTest";
import DatabaseTest from "@/components/DatabaseTest";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedInvestments />
      <TwoWaysToInvest />
      <SmartContractTest />
      <DatabaseTest />
    </div>
  );
};

export default Index;
