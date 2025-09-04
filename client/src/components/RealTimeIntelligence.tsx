import { motion } from "framer-motion";
import { useState } from "react";
import { Cpu } from "lucide-react";
import robotsImg from "@/assets/ai/robots.jpg";
import propertyVettingImg from "@/assets/ai/property-vetting.png";
import investmentNetworkImg from "@/assets/ai/investment-network.png";
import tokenizationEdgeImg from "@/assets/ai/tokenization-edge.png";

const RealTimeIntelligence = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const aiTeam = [
    {
      id: 'market',
      title: 'Market Intelligence',
      description: 'Real-time CRE insights',
      image: investmentNetworkImg,
      details: 'Live market data, tokenization trends, and global investment flows at your fingertips.'
    },
    {
      id: 'vetting', 
      title: 'Property Vetting',
      description: 'AI-powered due diligence',
      image: propertyVettingImg,
      details: 'Instant analysis of financials, blockchain data, and token performance metrics.'
    },
    {
      id: 'strategies',
      title: 'Investment Strategies', 
      description: 'Personalized pathways',
      image: robotsImg,
      details: 'Risk-adjusted investment strategies tailored for modern tokenized assets.'
    },
    {
      id: 'tokenization',
      title: 'Tokenization Edge',
      description: 'Blockchain-ready properties',
      image: tokenizationEdgeImg,
      details: 'AI ensures optimal property structuring and tokenization readiness.'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_#be8d00_1px,_transparent_0)] bg-[length:32px_32px]"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-6 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Cpu className="w-8 h-8 md:w-10 md:h-10" style={{ color: '#be8d00' }} />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-logo font-light text-black text-center">
                Real-Time Real Estate
                <span className="block text-primary mt-2">Intelligence</span>
              </h2>
              
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Cpu className="w-8 h-8 md:w-10 md:h-10" style={{ color: '#be8d00' }} />
              </motion.div>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-yellow-600 rounded-full mx-auto"></div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-sm border-2 border-[#d4a017] cursor-pointer"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(212, 160, 23, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-lg md:text-xl leading-relaxed text-black font-logo font-light italic">
                Your AI deal team — analyzing markets, vetting properties, and delivering investment strategies in seconds.
              </p>
            </motion.div>
          </motion.div>

          {/* AI Deal Team Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiTeam.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group cursor-pointer"
                  onMouseEnter={() => setHoveredCard(agent.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <motion.div 
                    className="relative w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-[#d4a017] overflow-hidden"
                    whileHover={{ 
                      scale: 1.1, 
                      rotateY: 10,
                      boxShadow: "0 20px 40px rgba(212, 160, 23, 0.2)" 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="w-20 h-20 rounded-lg overflow-hidden"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img 
                        src={agent.image} 
                        alt={agent.title}
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          hoveredCard === agent.id ? '' : 'filter grayscale'
                        }`}
                      />
                    </motion.div>
                    
                    {/* Pulse animation when hovered */}
                    {hoveredCard === agent.id && (
                      <motion.div
                        className="absolute inset-0 border-2 border-primary rounded-2xl"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.1, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  <motion.h4 
                    className="text-base font-logo font-light text-black mb-1"
                    animate={{ 
                      color: hoveredCard === agent.id ? '#be8d00' : '#000000' 
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {agent.title}
                  </motion.h4>
                  
                  <motion.p 
                    className="text-black/70 font-logo font-light text-sm"
                    initial={{ height: 'auto' }}
                    animate={{ 
                      opacity: hoveredCard === agent.id ? 0 : 1,
                      height: hoveredCard === agent.id ? 0 : 'auto'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {agent.description}
                  </motion.p>
                  
                  {/* Expanded details on hover */}
                  <motion.p 
                    className="text-primary font-logo font-light text-sm absolute z-10 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-primary/20 mt-2"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ 
                      opacity: hoveredCard === agent.id ? 1 : 0,
                      y: hoveredCard === agent.id ? 0 : 10,
                      height: hoveredCard === agent.id ? 'auto' : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {agent.details}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tagline Callout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <motion.div 
              className="bg-gradient-to-r from-primary/10 to-yellow-600/10 rounded-2xl p-6 border-2 border-[#d4a017] cursor-pointer"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(212, 160, 23, 0.15)",
                borderColor: "#be8d00"
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="text-base md:text-lg font-logo font-light text-black leading-relaxed"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-black font-light">Pioneering the future of</span>
                <span className="text-primary font-light bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent drop-shadow-sm ml-2">
                  AI-Driven CRE Tokenization
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RealTimeIntelligence;