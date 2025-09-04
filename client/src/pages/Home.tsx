import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Steps from "@/components/Steps";
import ContactForm from "@/components/ContactForm";
import SubmitProperty from "@/components/SubmitProperty";
import InvestmentBenefits from "@/components/InvestmentBenefits";
import RealTimeIntelligence from "@/components/RealTimeIntelligence";
import AboutUs from "@/components/AboutUs";
import LatestNews from "@/components/LatestNews";


import TokenizationInfo from "@/components/TokenizationInfo";
import PropertyCard, { Property } from "@/components/PropertyCard";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

const Home = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const q = query(
        collection(db, "properties"),
        where("featured", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const fetchedProperties = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          location: data.location || "",
          type: data.type || "",
          imageUrl: data.imageUrls?.[0] || "",
          imageUrls: data.imageUrls || [],
          minInvestment: Number(data.minInvestment) || 0,
          targetedIRR: Number(data.targetedIRR) || 0,
          targetedYield: Number(data.targetedYield) || 0,
          equityMultiple: Number(data.equityMultiple) || 0,
          propertyValue: Number(data.propertyValue) || 0,
          pricePerToken: Number(data.pricePerToken) || 0,
          totalTokens: Number(data.totalTokens) || 0,
          tokensAvailable: Number(data.tokensAvailable) || 0,
          status: data.status || "",
          symbol: data.symbol || "",
          riskFactor: data.riskFactor || undefined,
          daysLeft: data.daysLeft || undefined,
          propertyClass: data.propertyClass || "",
          walletAddress: data.walletAddress || "",
          squareFeet: Number(data.squareFeet) || 0,
          propertyType: data.propertyType || "",
          totalArea: Number(data.totalArea) || 0,
          measure: data.measure || "",
          projectedRentalIncome: Number(data.projectedRentalIncome) || 0,
          valueGrowth: Number(data.valueGrowth) || 0
        };
      }) as Property[];

      return fetchedProperties;
    }
  });

  return (
    <div>
      <Hero />
      <AboutUs />
      <InvestmentBenefits />
      <RealTimeIntelligence />
      <TokenizationInfo />
      <Benefits />

      <section id="properties" className="section bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <div className="relative h-12 sm:h-16 md:h-20 flex items-center overflow-hidden mb-4 sm:mb-6">
              <motion.div
                animate={{ x: [-800, 0] }}
                transition={{
                  duration: 16,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop"
                }}
                className="flex items-center space-x-24"
                style={{ minWidth: "1600px" }}
              >
                {/* Multiple complete sets to ensure seamless looping */}
                {["The Commertize Collection", "The Commertize Collection", 
                  "The Commertize Collection", "The Commertize Collection"].map((text, index) => (
                  <motion.h2 
                    key={`${text}-${index}`}
                    className="display-2 text-foreground flex-shrink-0"
                    style={{ minWidth: "400px", textAlign: "center" }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    The Commertize <span className="text-primary">Collection</span>
                  </motion.h2>
                ))}
              </motion.div>
            </div>
            <p className="body-large max-w-2xl mx-auto text-black px-4">
              Explore a curated selection of commercial real estate opportunities across multiple sectors, sourced and vetted for quality and performance potential.
            </p>
          </motion.div>
          
          {isLoading ? (
            <div className="property-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[500px] bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="property-grid">
              {properties?.length > 0 ? (
                properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))
              ) : (
                <div className="col-span-full text-center">
                  <div className="py-20">
                    <h3 className="text-xl font-medium text-muted-foreground mb-2">
                      No properties available in The Commertize Collection
                    </h3>
                    <p className="text-muted-foreground">
                      Check back soon for exciting new opportunities.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <SubmitProperty />
      <LatestNews />
      <ContactForm />

      <section className="section-sm bg-muted/50">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <h3 className="text-lg font-logo font-light text-black mb-6">Investment Notice</h3>
            <div className="space-y-4">
              <p className="text-sm font-logo font-light text-black leading-relaxed">
                Commertize provides a technology platform for tokenizing and offering commercial real estate investments to qualified investors. All investments carry inherent risks, including potential loss of principal. Past performance and projected returns are not guarantees of future results.
              </p>
              <p className="text-sm font-logo font-light text-black leading-relaxed">
                Please note that there is currently limited liquidity for tokenized real estate assets. The ability to sell or transfer tokens depends on market conditions and available buyers. Before investing, please consult with qualified financial and tax advisors to understand the risks and implications. For complete details, please review our full disclaimer documentation.
              </p>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
};

export default Home;