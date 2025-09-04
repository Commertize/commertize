import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, Crown, PieChart, CheckCircle } from "lucide-react";

const WhoUsesTokenization = () => {
  const [activeTab, setActiveTab] = useState(0);

  const userTypes = [
    {
      title: "Real Estate Developers",
      subtitle: "Tokenize Your Projects. Raise Capital Faster",
      benefits: [
        "Offer fractional ownership to reduce funding time",
        "Attract global investors with lower entry points",
        "Increase liquidity for illiquid or early-stage assets",
        "Monetize rental income or future developments"
      ],
      icon: Building2,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Real Estate Firms",
      subtitle: "Expand Access. Go Digital",
      benefits: [
        "Lower the barrier for investors ($100–$1,000 instead of $100K+)",
        "Diversify portfolio with global tokenized assets",
        "Benefit from 24/7 trading, instant settlement & lower fees",
        "Access broader investor base through digital platforms"
      ],
      icon: TrendingUp,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "High-Net-Worth Individuals",
      subtitle: "Turn Private Assets Into Digital Investment Vehicles",
      benefits: [
        "Tokenize personal property or portfolios",
        "Sell fractional ownership while retaining control",
        "Create family trusts or inheritance flows via tokens",
        "Unlock capital without traditional sales processes"
      ],
      icon: Crown,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Real Estate Investment Funds",
      subtitle: "Reach More Investors. Stay Flexible",
      benefits: [
        "Expand beyond institutional investors without going public",
        "Offer fractional shares with global accessibility",
        "Improve transparency with on-chain reporting",
        "Reduce operational costs through automation"
      ],
      icon: PieChart,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            From Concrete to Capital — Who Wins
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {userTypes.map((userType, index) => {
            const IconComponent = userType.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === index
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{userType.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white border-0 shadow-xl">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left Side - Visual */}
                <div className={`relative bg-gradient-to-br ${userTypes[activeTab].color} p-12 flex items-center justify-center`}>
                  <div className="text-center text-white">
                    <div className="mb-6 flex justify-center">
                      {(() => {
                        const IconComponent = userTypes[activeTab].icon;
                        return <IconComponent className="w-20 h-20" />;
                      })()}
                    </div>
                    <h3 className="text-3xl font-bold mb-4">
                      {userTypes[activeTab].title}
                    </h3>
                    <p className="text-xl opacity-90">
                      {userTypes[activeTab].subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="p-12">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {userTypes[activeTab].title}
                    </h3>
                    <p className="text-xl text-blue-600 font-medium mb-6">
                      {userTypes[activeTab].subtitle}
                    </p>
                  </div>

                  <ul className="space-y-4">
                    {userTypes[activeTab].benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quote Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <blockquote className="text-2xl font-medium text-gray-900 mb-4">
              "Traditional real estate investment is costly, slow, and limited by borders. 
              Tokenization makes property digital, liquid, and global — accessible from $100."
            </blockquote>
            <cite className="text-lg text-gray-600 font-medium">
              — Commertize Platform
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoUsesTokenization;