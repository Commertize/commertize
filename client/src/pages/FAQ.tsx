import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { HelpCircle, Shield, TrendingUp, Building, DollarSign, RefreshCw, MapPin } from "lucide-react";

const faqSections = [
  {
    category: "About Commertize",
    icon: HelpCircle,
    items: [
      {
        question: "What is Commertize?",
        answer: "Commertize is a digital platform that tokenizes commercial real estate (CRE), enabling fractional ownership and global investor access through blockchain technology."
      },
      {
        question: "How does Commertize differ from traditional CRE investment?",
        answer: "We remove high investment minimums, speed up capital access for property owners, and provide blockchain-secured transparency — all while keeping investments accessible to accredited investors worldwide."
      },
      {
        question: "What types of properties does Commertize work with?",
        answer: "We focus on premium and full-spectrum commercial real estate, including multifamily, office, retail, industrial, hospitality, and mixed-use properties."
      }
    ]
  },
  {
    category: "For Investors",
    icon: TrendingUp,
    items: [
      {
        question: "Who can invest through Commertize?",
        answer: "Currently, investments are open to accredited investors, in compliance with U.S. securities regulations."
      },
      {
        question: "What is fractional ownership?",
        answer: "Fractional ownership allows you to purchase a share of a property rather than the entire asset, giving you access to premium real estate at a lower entry cost."
      },
      {
        question: "How are investments secured?",
        answer: "Each tokenized asset is tied to a legal structure with blockchain-recorded ownership, backed by transparent property documentation and audits."
      },
      {
        question: "How do I receive returns on my investment?",
        answer: "Returns depend on the specific property's income structure (e.g., rental income, profit share, capital appreciation) and are distributed in accordance with the offering terms."
      },
      {
        question: "Can I sell my tokens?",
        answer: "Yes — depending on regulatory guidelines and platform availability, tokens can be sold on secondary marketplaces or back to eligible buyers through Commertize's exchange network."
      }
    ]
  },
  {
    category: "For Property Owners & Developers",
    icon: Building,
    items: [
      {
        question: "How can I tokenize my property with Commertize?",
        answer: "Submit your property through our onboarding process, where we review eligibility, legal documentation, and market potential. Approved properties go through our tokenization process and are listed on our marketplace."
      },
      {
        question: "What are the benefits of tokenizing my property?",
        answer: "Faster capital raising, access to a global investor base, potential liquidity through secondary markets, and no need to take on restrictive debt."
      },
      {
        question: "Is my property eligible for tokenization?",
        answer: "We evaluate properties based on location, asset class, income potential, and legal clarity of ownership."
      }
    ]
  },
  {
    category: "Technology & Security",
    icon: Shield,
    items: [
      {
        question: "What blockchain does Commertize use?",
        answer: "We use a secure, scalable blockchain that supports smart contracts, fractional ownership, and compliance features."
      },
      {
        question: "How does blockchain improve security and transparency?",
        answer: "Blockchain creates an immutable record of ownership and transactions, ensuring transparency and reducing fraud risk."
      },
      {
        question: "What role does AI play in Commertize?",
        answer: "Our AI-driven tools provide property analytics, investment insights, and predictive performance models to help investors make informed decisions."
      }
    ]
  },
  {
    category: "Compliance & Regulation",
    icon: MapPin,
    items: [
      {
        question: "Is tokenized real estate legal?",
        answer: "Yes — Commertize operates under existing securities and real estate regulations, using compliant structures such as Reg D 506(c) offerings for accredited investors."
      },
      {
        question: "Do I need to be U.S.-based to invest?",
        answer: "No — international accredited investors are welcome, subject to their local regulations."
      },
      {
        question: "What investor protections are in place?",
        answer: "All tokenized offerings are backed by legal contracts, due diligence reports, and secure escrow processes for funds."
      }
    ]
  },
  {
    category: "Getting Started",
    icon: DollarSign,
    items: [
      {
        question: "How do I create an account?",
        answer: "Click \"Join Now\" on Commertize.com, complete the onboarding process, verify accreditation, and access our property marketplace."
      },
      {
        question: "What is the minimum investment amount?",
        answer: "This varies per property but is typically much lower than traditional CRE deals — often starting in the low thousands."
      },
      {
        question: "How do I contact Commertize for support?",
        answer: "Email our team at support@commertize.com or use the live chat on our website for quick assistance."
      }
    ]
  }
];

const FAQ = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full mb-6"
          >
            <HelpCircle className="w-8 h-8 text-yellow-600" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-logo font-light mb-6 bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Everything you need to know about tokenized commercial real estate investing
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqSections.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + sectionIndex * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-8">
                  {/* Section Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-logo font-light text-black">
                      {section.category}
                    </h2>
                  </div>

                  {/* Section Questions */}
                  <Accordion type="single" collapsible className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                      >
                        <AccordionItem 
                          value={`section-${sectionIndex}-item-${itemIndex}`}
                          className="border-0 bg-gradient-to-r from-muted/20 to-muted/5 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <AccordionTrigger className="font-logo font-light px-6 py-4 hover:no-underline group">
                            <span className="text-left text-base leading-relaxed text-black">
                              {item.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <p className="text-black leading-relaxed font-logo">
                              {item.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
