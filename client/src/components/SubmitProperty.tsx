import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Users, Shield, DollarSign, Coins, Factory, Store, Home, GraduationCap, Hotel, Building, Layers, Server, Database, Zap } from "lucide-react";
import blockchainNetwork from '@/assets/blockchain-network.png';

// Enhanced Datacenter Building Icon Component
const DatacenterIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <Database className="w-full h-full" />
    <Zap className="absolute -top-0.5 -right-0.5 w-2 h-2 text-primary opacity-75" />
  </div>
);

const propertyTypes = [
  { id: "multifamily", name: "Multifamily", icon: Building2 },
  { id: "office", name: "Office", icon: Building },
  { id: "datacenters", name: "Datacenters", icon: DatacenterIcon },
  { id: "industrial", name: "Industrial", icon: Factory },
  { id: "retail", name: "Retail", icon: Store },
  { id: "mixed-use", name: "Mixed Use", icon: Layers },
  { id: "condominium", name: "Condominium", icon: Home },
  { id: "student-housing", name: "Student Housing", icon: GraduationCap },
  { id: "hospitality", name: "Hospitality", icon: Hotel },
];

const paymentMethods = [
  { name: "USD", icon: DollarSign, description: "Traditional payments" },
  { name: "USDC", icon: Coins, description: "Digital currency" },
];

const SubmitProperty = () => {
  return (
    <section className="py-20 bg-white">
      
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-logo font-light text-foreground mb-3">
                List Your Property on <span className="text-primary bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">Commertize</span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-yellow-600 rounded-full"></div>
            </div>
            <p className="text-foreground/80 mb-6 leading-relaxed">
              Commertize connects your commercial property to a worldwide network of qualified investors. Whether you're an owner, developer, or asset manager, our platform makes it simple to tokenize your CRE and open it to fractional investment. Reach a broader audience, secure capital faster, and retain control — all with blockchain-powered transparency and efficiency.
            </p>
            
            <div className="mb-8">
              <h3 className="text-2xl font-light font-logo mb-6 text-foreground">
                Your Property, Our Global Marketplace
              </h3>
              
              {/* Property Types Grid */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-3">
                  {propertyTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div key={type.id} className="group">
                        <div className={`flex items-center space-x-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:bg-white/80 transition-all duration-300 hover:shadow-md ${
                          type.id === "datacenters" ? "hover:shadow-lg hover:border-primary/60" : ""
                        }`}>
                          <IconComponent className={`w-5 h-5 text-primary ${
                            type.id === "datacenters" ? "drop-shadow-sm" : ""
                          }`} />
                          <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                            {type.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h4 className="text-lg font-light font-logo text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Accepted Payment Methods
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <div key={method.name} className="group">
                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:scale-105">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{method.name}</div>
                            <div className="text-xs text-foreground/60">{method.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-foreground/80 mb-8 leading-relaxed">
              Take advantage of Commertize's global reach—submit your property today 
              and discover new opportunities for growth and success.
            </p>

            <Link href="/submit">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
                Submit Your Property
              </Button>
            </Link>
          </div>

          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <img
              src={blockchainNetwork}
              alt="Blockchain Network with Connected Buildings"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubmitProperty;
