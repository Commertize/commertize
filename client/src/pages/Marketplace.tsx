import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PropertyCard from "@/components/PropertyCard";
import { Card, CardContent } from "@/components/ui/card";
import PropertyChatbot from "@/components/PropertyChatbot";
import { useLocation } from "wouter";
import { PROPERTY_STATUS } from "@/lib/propertyStatus";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Building2, TrendingUp, DollarSign, Globe, Sparkles, Users, BarChart3 } from "lucide-react";
import type { User } from "firebase/auth";

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  imageUrl: string;
  imageUrls?: string[];
  minInvestment: number;
  targetedIRR: number;
  targetedYield: number;
  equityMultiple: number;
  riskFactor?: "low" | "moderate" | "high";
  daysLeft?: number;
  status?: string;
  propertyClass?: string;
  symbol?: string;
  active?: boolean;
  pricePerToken?: number;
  totalTokens?: number;
  tokensAvailable?: number;
  propertyValue?: number;
  walletAddress?: string;
  squareFeet?: number;
  propertyType?: string;
  totalArea?: number;
  measure?: string;
  projectedRentalIncome?: number;
  valueGrowth?: number;
  holdPeriod?: number;
  ltv?: number;
  assetType?: string;
}

export default function Marketplace() {
  const [status, setStatus] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [propertyClass, setPropertyClass] = useState<string>("all");
  const [riskLevel, setRiskLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [userName, setUserName] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!user) {
        sessionStorage.setItem("redirectAfterLogin", "/marketplace");
        setLocation("/account");
        return;
      }

      // Fetch user's name from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firstName = userData.firstName || "Investor";
          setUserName(firstName);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ["properties", status, propertyType, propertyClass, riskLevel],
    queryFn: async () => {
      try {
        const propertiesRef = collection(db, "properties");
        const querySnapshot = await getDocs(propertiesRef);

        // First filter: Only get active properties
        let fetchedProperties = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const property = {
              id: doc.id,
              name: data.name || "",
              location: data.location || "",
              type: data.propertyType || "",
              imageUrl: data.imageUrls?.[0] || "",
              imageUrls: data.imageUrls || [],
              minInvestment: Number(data.minInvestment) || 0,
              targetedIRR: Number(data.targetedIRR) || 0,
              targetedYield: Number(data.targetedYield) || 0,
              equityMultiple: Number(data.equityMultiple) || 0,
              riskFactor: data.riskFactor || "moderate",
              daysLeft: Number(data.daysLeft) || 30,
              status: data.status || "Coming Soon",
              propertyClass: data.propertyClass || "A",
              symbol: data.symbol || "",
              active: Boolean(data.active),
              pricePerToken: Number(data.pricePerToken) || 0,
              totalTokens: Number(data.totalTokens) || 0,
              tokensAvailable: Number(data.tokensAvailable) || 0,
              propertyValue: Number(data.propertyValue) || 0,
              walletAddress: data.walletAddress || "",
              squareFeet: Number(data.squareFeet) || 0,
              propertyType: data.propertyType || "",
              totalArea: Number(data.totalArea) || 0,
              measure: data.measure || "",
              projectedRentalIncome: Number(data.projectedRentalIncome) || 0,
              valueGrowth: Number(data.valueGrowth) || 0,
              holdPeriod: Number(data.holdPeriod) || 0,
              ltv: Number(data.ltv) || 0,
              assetType: data.assetType || "",
            };
            
            // Debug log for propertyValue
            if (property.name) {
              console.log(`Property ${property.name}: propertyValue from DB = ${data.propertyValue}, converted = ${property.propertyValue}`);
            }
            
            return property;
          })
          .filter((property) => property.active === true);

        // Apply additional filters based on user selection
        if (status !== "all") {
          fetchedProperties = fetchedProperties.filter(
            (property) => property.status === status,
          );
        }

        if (propertyType !== "all") {
          fetchedProperties = fetchedProperties.filter(
            (property) => property.type === propertyType,
          );
        }

        if (propertyClass !== "all") {
          fetchedProperties = fetchedProperties.filter((property) => {
            // Normalize both values to just the letter for comparison
            const normalizedPropertyClass = property.propertyClass?.replace(
              "Class ",
              "",
            );
            const normalizedFilterClass = propertyClass.replace("Class ", "");
            return normalizedPropertyClass === normalizedFilterClass;
          });
        }

        if (riskLevel !== "all") {
          fetchedProperties = fetchedProperties.filter(
            (property) => property.riskFactor === riskLevel.toLowerCase(),
          );
        }

        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          fetchedProperties = fetchedProperties.filter(
            (property) => 
              property.name.toLowerCase().includes(query) ||
              property.location.toLowerCase().includes(query) ||
              property.type.toLowerCase().includes(query)
          );
        }

        // Sort properties with "The Axis" always first
        fetchedProperties.sort((a, b) => {
          // Always put "The Axis" first
          if (a.name === "The Axis") return -1;
          if (b.name === "The Axis") return 1;
          
          switch (sortBy) {
            case "name":
              return a.name.localeCompare(b.name);
            case "price":
              return (a.minInvestment || 0) - (b.minInvestment || 0);
            case "irr":
              return (b.targetedIRR || 0) - (a.targetedIRR || 0);
            case "location":
              return a.location.localeCompare(b.location);
            default:
              return 0;
          }
        });

        return fetchedProperties;
      } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
    },
  });



  const clearAllFilters = () => {
    setStatus("all");
    setPropertyType("all");
    setPropertyClass("all");
    setRiskLevel("all");
    setSearchQuery("");
    setSortBy("name");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-5xl font-logo font-light bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
              Discover Tokenized Properties
            </h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Transform the Way You Invest in Commercial Real Estate
          </motion.p>
        </motion.div>



        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="mb-8 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-yellow-600 mr-3" />
                  <h2 className="text-2xl mb-0">
                    Welcome {userName ? `, ${userName}` : ""}!
                  </h2>
                </div>
                <p className="mb-4 text-black">
                  At Commertize, you're not just a member — you're part of a network shaping the future of commercial real estate. Gain priority access to exclusive investment opportunities, cutting-edge insights, and advanced tools designed to give you an edge. Explore our curated portfolio, harness our powerful analytics, and grow your holdings with confidence.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-black">
                    <motion.div
                      animate={{ 
                        y: [0, -2, 0],
                        rotate: [0, 5, 0, -5, 0] 
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <BarChart3 className="w-4 h-4 text-yellow-600 mr-2" />
                    </motion.div>
                    <span>Proprietary analytics and insights</span>
                  </div>
                  <div className="flex items-center text-sm text-black">
                    <motion.div
                      animate={{ 
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{ 
                        transformOrigin: "center"
                      }}
                    >
                      <Globe className="w-4 h-4 text-yellow-600 mr-2" />
                    </motion.div>
                    <span>Global real estate opportunities</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  Disclaimer: Projected returns are estimates and may be subject to
                  adjustment. Need assistance? Our dedicated sales agents are here to help.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <Card className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200">
            <CardContent className="p-6">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search properties by name, location, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-12 px-6"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="h-12 px-6"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t pt-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {Object.values(PROPERTY_STATUS).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={propertyType} onValueChange={setPropertyType}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Property Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Apartments">Apartments</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Hospitality">Hospitality</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Mixed use">Mixed Use</SelectItem>
                          <SelectItem value="Condominium">Condominium</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={propertyClass} onValueChange={setPropertyClass}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Property Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          <SelectItem value="Class A">Class A</SelectItem>
                          <SelectItem value="Class B">Class B</SelectItem>
                          <SelectItem value="Class C">Class C</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={riskLevel} onValueChange={setRiskLevel}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Risk Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Risk Levels</SelectItem>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="moderate">Moderate Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="irr">IRR (High to Low)</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-4">
            <h2 className="text-xl text-black">
              {isLoading ? "Loading..." : `${properties?.length || 0} Properties Found`}
            </h2>
            {searchQuery && (
              <span className="text-sm text-muted-foreground">
                for "{searchQuery}"
              </span>
            )}
          </div>
        </motion.div>

        {/* Property Grid */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10"
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[500px] bg-muted animate-pulse rounded-2xl" />
            ))}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 mb-2">Error Loading Properties</div>
              <div className="text-red-500 text-sm">{(error as Error).message}</div>
            </div>
          </motion.div>
        )}

        {properties && properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
          >
            {properties.map((property: Property, index: number) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 + index * 0.1, duration: 0.5 }}
                className="flex"
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {properties && properties.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl text-black mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any properties matching your search criteria.
              </p>
              <Button onClick={clearAllFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Disclaimer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
                </div>
                <div>
                  <h4 className="text-black mb-2">Important Investment Notice</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The properties displayed are presented for informational purposes and initial
                    interest gathering. Expressing interest does not constitute a binding
                    commitment or guarantee of investment participation. Commertize is identifying
                    and evaluating select properties for potential tokenization and membership-based
                    investment opportunities. All investments are subject to availability,
                    regulatory requirements, and final property owner agreements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Property Investment Assistant Chatbot */}
      <PropertyChatbot 
        properties={properties}
        selectedProperty={null}
      />
    </div>
  );
}
