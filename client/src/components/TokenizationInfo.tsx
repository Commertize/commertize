import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface InfoSection {
  title: string;
  description: string;
  details: string[];
}

const tokenizationSections: InfoSection[] = [
  {
    title: "Real Estate Companies",
    description: "",
    details: [
      "Expand Digital Investor Access",
      "Lower Investment Barriers",
      "24/7 Secondary Market Liquidity",
      "Real-Time Transaction Finality",
    ],
  },
  {
    title: "Real Estate Developers",
    description: "",
    details: [
      "Accelerate Capital Acquisition",
      "Raise Funds at Record Speed",
      "Lower Entry Thresholds",
      "Monetize Future Projects",
    ],
  },
  {
    title: "REITs & Real Estate Funds",
    description: "",
    details: [
      "Expand Global Investor Reach",
      "Preserve Operational Flexibility",
      "Fractionalized Ownership",
      "Blockchain-Enabled Reporting",
    ],
  },
  {
    title: "High-Net-Worth Investors (HNWIs)",
    description: "",
    details: [
      "Tokenize Exclusive Assets",
      "Retain Full Ownership Authority",
      "Seamless Intergenerational Transfers",
      "Off-Market Asset Portfolios",
    ],
  },
];

const TokenizationInfo = () => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(),
  );

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-secondary to-accent">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-logo font-light text-center mb-4 text-foreground"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            From Concrete to Capital — Who Wins
          </motion.h2>
          <motion.p 
            className="text-center text-muted-foreground mb-12 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            From unlocking liquidity to global investor access, tokenization changes the game for everyone in CRE.
          </motion.p>

          <div className="grid gap-6">
            {tokenizationSections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.1, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100
                }}
              >
                <Card
                  className="border-2 border-[#d4a017] shadow-lg hover:shadow-xl transition-all duration-300 bg-card hover:scale-[1.02] cursor-pointer"
                >
                <CardHeader className="pb-4">
                  <motion.div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection(index)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex-1">
                      <CardTitle className="text-xl text-primary mb-2 font-logo font-light">
                        {section.title}
                      </CardTitle>
                      <p className="text-card-foreground font-medium font-logo">
                        {section.description}
                      </p>
                    </div>
                    <motion.div 
                      className="ml-4 text-primary"
                      animate={{ 
                        rotate: expandedSections.has(index) ? 0 : -90 
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown className="h-6 w-6" />
                    </motion.div>
                  </motion.div>
                </CardHeader>

                <AnimatePresence>
                  {expandedSections.has(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: "easeInOut",
                        opacity: { duration: 0.2 }
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <CardContent className="pt-0">
                        <div className="border-t border-border pt-4">
                          <ul className="space-y-3">
                            {section.details.map((detail, detailIndex) => (
                              <motion.li
                                key={detailIndex}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ 
                                  delay: detailIndex * 0.1,
                                  duration: 0.4,
                                  ease: "easeOut"
                                }}
                                className="flex items-start"
                              >
                                <motion.div 
                                  className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ 
                                    delay: detailIndex * 0.1 + 0.2,
                                    duration: 0.3,
                                    type: "spring",
                                    stiffness: 200
                                  }}
                                />
                                <span className="text-card-foreground leading-relaxed font-logo">
                                  {detail}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenizationInfo;
