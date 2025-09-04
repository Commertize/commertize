import { ClipboardCheck, Search, Wallet, LucideIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface Step {
  icon: LucideIcon | "metamask";
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: ClipboardCheck,
    title: "Create Account",
    description: "Sign up and complete your investor verification",
  },
  {
    icon: Search,
    title: "Select Property",
    description: "Browse and choose from our curated properties",
  },
  {
    icon: "metamask",
    title: "Connect Wallet",
    description: "Link your MetaMask wallet for secure transactions",
  },
  {
    icon: Wallet,
    title: "Start Investing",
    description: "Purchase tokens and manage your portfolio",
  },
];

const Steps = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-logo font-light text-black mb-6">
            How It <span className="text-primary">Works</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-yellow-600 rounded-full mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-logo font-light max-w-3xl mx-auto">
            Start your tokenized real estate investment journey in four simple steps
          </p>
        </motion.div>

        {/* Enhanced Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                ease: "easeOut" 
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="relative group"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                {index + 1}
              </div>
              
              {/* Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Icon */}
                <motion.div 
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                  className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-yellow-600/10 flex items-center justify-center mb-6 group-hover:from-primary/20 group-hover:to-yellow-600/20 transition-all duration-300"
                >
                  {step.icon === "metamask" ? (
                    <img 
                      src="/metamask-logo.png" 
                      alt="MetaMask" 
                      className="w-12 h-12"
                    />
                  ) : (
                    <step.icon className="w-10 h-10 text-primary group-hover:text-yellow-600 transition-colors duration-300" />
                  )}
                </motion.div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-logo font-light text-black mb-3 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 font-logo font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Arrow between steps (hidden on mobile and last step) */}
              {index < steps.length - 1 && (
                <motion.div 
                  animate={{ 
                    x: [0, 10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20"
                >
                  <div className="w-12 h-12 bg-white rounded-full shadow-lg border-2 border-primary/20 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 font-logo font-light mb-8">
            Ready to start your real estate investment journey?
          </p>
          <Link href="/marketplace">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(190, 141, 0, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-yellow-600 text-white px-8 py-4 rounded-xl font-logo font-light text-lg hover:from-yellow-600 hover:to-primary transition-all duration-300 shadow-lg"
            >
              Explore Marketplace
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Steps;
