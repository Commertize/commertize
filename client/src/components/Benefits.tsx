
import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap, Users, Globe, Coins } from "lucide-react";
import heroBg from "../assets/hero-bg.jpg";

const benefits = [
  {
    icon: Coins,
    title: "Fractional Ownership",
    description: "Start building your CRE portfolio from $1,000 and invest in premium properties worldwide."
  },
  {
    icon: TrendingUp,
    title: "High-Yield Returns",
    description: "Target 6–12% annual returns from carefully selected commercial properties with proven income streams and strong growth potential."
  },
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "Blockchain-secured smart contracts protect your investments with unmatched transparency and immutable proof of ownership."
  },
  {
    icon: Zap,
    title: "Instant Liquidity",
    description: "24/7 marketplace access turns real estate into a liquid, tradable asset class."
  },
  {
    icon: Users,
    title: "A Network Redefining Real Estate",
    description: "Join a global network of forward-thinking investors and innovators transforming how commercial real estate is owned, traded, and grown."
  },
  {
    icon: Globe,
    title: "Global Markets, One Platform",
    description: "Access premium commercial real estate opportunities worldwide, all from one secure, blockchain-powered platform."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
};

const Benefits = () => {
  return (
    <section className="section bg-background relative overflow-hidden">
      {/* Your custom background image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroBg})`,
            filter: 'none',
            imageRendering: 'crisp-edges',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Light overlay for text readability while preserving image quality */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        <svg 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a237e" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#3949ab" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#5c6bc0" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#9fa8da" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#263238" />
              <stop offset="50%" stopColor="#37474f" />
              <stop offset="100%" stopColor="#455a64" />
            </linearGradient>
            <pattern id="blockchainGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="none" stroke="rgba(190, 141, 0, 0.15)" strokeWidth="1"/>
              <circle cx="25" cy="25" r="2" fill="rgba(190, 141, 0, 0.3)"/>
            </pattern>
          </defs>
          
          {/* Sky background */}
          <rect width="1920" height="1080" fill="url(#skyGradient)" />
          
          {/* Blockchain grid overlay */}
          <rect width="1920" height="1080" fill="url(#blockchainGrid)" />
          
          {/* City skyline buildings */}
          <g className="buildings" transform="translate(0, 600)">
            {/* Building 1 */}
            <rect x="0" y="0" width="120" height="480" fill="url(#buildingGradient)">
              <animate attributeName="height" values="480;500;480" dur="8s" repeatCount="indefinite" />
            </rect>
            <rect x="20" y="50" width="15" height="20" fill="rgba(255, 215, 0, 0.8)" />
            <rect x="50" y="80" width="15" height="20" fill="rgba(255, 215, 0, 0.6)" />
            <rect x="80" y="120" width="15" height="20" fill="rgba(255, 215, 0, 0.9)" />
            
            {/* Building 2 */}
            <rect x="140" y="-100" width="100" height="580" fill="url(#buildingGradient)">
              <animate attributeName="height" values="580;600;580" dur="10s" repeatCount="indefinite" />
            </rect>
            <rect x="160" y="20" width="12" height="15" fill="rgba(255, 215, 0, 0.7)" />
            <rect x="180" y="60" width="12" height="15" fill="rgba(255, 215, 0, 0.5)" />
            <rect x="200" y="100" width="12" height="15" fill="rgba(255, 215, 0, 0.8)" />
            
            {/* Building 3 */}
            <rect x="260" y="-200" width="140" height="680" fill="url(#buildingGradient)">
              <animate attributeName="height" values="680;720;680" dur="12s" repeatCount="indefinite" />
            </rect>
            <rect x="280" y="50" width="18" height="25" fill="rgba(255, 215, 0, 0.9)" />
            <rect x="320" y="100" width="18" height="25" fill="rgba(255, 215, 0, 0.6)" />
            <rect x="360" y="150" width="18" height="25" fill="rgba(255, 215, 0, 0.8)" />
            
            {/* Building 4 */}
            <rect x="420" y="-50" width="110" height="530" fill="url(#buildingGradient)">
              <animate attributeName="height" values="530;550;530" dur="9s" repeatCount="indefinite" />
            </rect>
            <rect x="440" y="80" width="14" height="18" fill="rgba(255, 215, 0, 0.7)" />
            <rect x="470" y="120" width="14" height="18" fill="rgba(255, 215, 0, 0.5)" />
            <rect x="500" y="160" width="14" height="18" fill="rgba(255, 215, 0, 0.9)" />
            
            {/* Building 5 */}
            <rect x="550" y="-300" width="160" height="780" fill="url(#buildingGradient)">
              <animate attributeName="height" values="780;820;780" dur="11s" repeatCount="indefinite" />
            </rect>
            <rect x="580" y="60" width="20" height="28" fill="rgba(255, 215, 0, 0.8)" />
            <rect x="620" y="120" width="20" height="28" fill="rgba(255, 215, 0, 0.6)" />
            <rect x="660" y="180" width="20" height="28" fill="rgba(255, 215, 0, 0.9)" />
            
            {/* Building 6 */}
            <rect x="730" y="-150" width="130" height="630" fill="url(#buildingGradient)">
              <animate attributeName="height" values="630;660;630" dur="7s" repeatCount="indefinite" />
            </rect>
            <rect x="750" y="70" width="16" height="22" fill="rgba(255, 215, 0, 0.7)" />
            <rect x="780" y="110" width="16" height="22" fill="rgba(255, 215, 0, 0.5)" />
            <rect x="810" y="150" width="16" height="22" fill="rgba(255, 215, 0, 0.8)" />
            
            {/* Building 7 */}
            <rect x="880" y="-80" width="120" height="560" fill="url(#buildingGradient)">
              <animate attributeName="height" values="560;580;560" dur="13s" repeatCount="indefinite" />
            </rect>
            <rect x="900" y="90" width="15" height="20" fill="rgba(255, 215, 0, 0.6)" />
            <rect x="930" y="130" width="15" height="20" fill="rgba(255, 215, 0, 0.8)" />
            <rect x="960" y="170" width="15" height="20" fill="rgba(255, 215, 0, 0.7)" />
            
            {/* Building 8 */}
            <rect x="1020" y="-250" width="150" height="730" fill="url(#buildingGradient)">
              <animate attributeName="height" values="730;770;730" dur="14s" repeatCount="indefinite" />
            </rect>
            <rect x="1050" y="80" width="18" height="24" fill="rgba(255, 215, 0, 0.9)" />
            <rect x="1090" y="140" width="18" height="24" fill="rgba(255, 215, 0, 0.6)" />
            <rect x="1130" y="200" width="18" height="24" fill="rgba(255, 215, 0, 0.8)" />
            
            {/* Building 9 */}
            <rect x="1190" y="-100" width="140" height="580" fill="url(#buildingGradient)">
              <animate attributeName="height" values="580;620;580" dur="10s" repeatCount="indefinite" />
            </rect>
            <rect x="1220" y="100" width="17" height="23" fill="rgba(255, 215, 0, 0.7)" />
            <rect x="1260" y="160" width="17" height="23" fill="rgba(255, 215, 0, 0.5)" />
            <rect x="1300" y="220" width="17" height="23" fill="rgba(255, 215, 0, 0.9)" />
            
            {/* Building 10 */}
            <rect x="1350" y="-180" width="125" height="660" fill="url(#buildingGradient)">
              <animate attributeName="height" values="660;690;660" dur="8s" repeatCount="indefinite" />
            </rect>
            <rect x="1370" y="110" width="16" height="21" fill="rgba(255, 215, 0, 0.8)" />
            <rect x="1400" y="170" width="16" height="21" fill="rgba(255, 215, 0, 0.6)" />
            <rect x="1430" y="230" width="16" height="21" fill="rgba(255, 215, 0, 0.7)" />
            
            {/* Building 11 */}
            <rect x="1495" y="-50" width="110" height="530" fill="url(#buildingGradient)">
              <animate attributeName="height" values="530;560;530" dur="11s" repeatCount="indefinite" />
            </rect>
            <rect x="1515" y="120" width="14" height="19" fill="rgba(255, 215, 0, 0.6)" />
            <rect x="1545" y="180" width="14" height="19" fill="rgba(255, 215, 0, 0.8)" />
            <rect x="1575" y="240" width="14" height="19" fill="rgba(255, 215, 0, 0.7)" />
            
            {/* Building 12 */}
            <rect x="1625" y="-120" width="135" height="600" fill="url(#buildingGradient)">
              <animate attributeName="height" values="600;640;600" dur="9s" repeatCount="indefinite" />
            </rect>
            <rect x="1650" y="130" width="16" height="22" fill="rgba(255, 215, 0, 0.9)" />
            <rect x="1680" y="190" width="16" height="22" fill="rgba(255, 215, 0, 0.5)" />
            <rect x="1710" y="250" width="16" height="22" fill="rgba(255, 215, 0, 0.8)" />
            
            {/* Building 13 */}
            <rect x="1780" y="50" width="100" height="430" fill="url(#buildingGradient)">
              <animate attributeName="height" values="430;450;430" dur="12s" repeatCount="indefinite" />
            </rect>
            <rect x="1800" y="140" width="12" height="16" fill="rgba(255, 215, 0, 0.7)" />
            <rect x="1830" y="200" width="12" height="16" fill="rgba(255, 215, 0, 0.6)" />
            <rect x="1860" y="260" width="12" height="16" fill="rgba(255, 215, 0, 0.8)" />
          </g>
          
          {/* Floating blockchain elements */}
          <g className="blockchain-elements">
            <circle cx="150" cy="200" r="8" fill="rgba(190, 141, 0, 0.6)">
              <animate attributeName="cy" values="200;180;200" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="150" r="6" fill="rgba(190, 141, 0, 0.8)">
              <animate attributeName="cy" values="150;130;150" dur="8s" repeatCount="indefinite" />
            </circle>
            <circle cx="450" cy="180" r="7" fill="rgba(190, 141, 0, 0.7)">
              <animate attributeName="cy" values="180;160;180" dur="7s" repeatCount="indefinite" />
            </circle>
            <circle cx="600" cy="120" r="9" fill="rgba(190, 141, 0, 0.5)">
              <animate attributeName="cy" values="120;100;120" dur="9s" repeatCount="indefinite" />
            </circle>
            <circle cx="750" cy="160" r="5" fill="rgba(190, 141, 0, 0.9)">
              <animate attributeName="cy" values="160;140;160" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="900" cy="140" r="8" fill="rgba(190, 141, 0, 0.6)">
              <animate attributeName="cy" values="140;120;140" dur="10s" repeatCount="indefinite" />
            </circle>
            <circle cx="1050" cy="170" r="6" fill="rgba(190, 141, 0, 0.8)">
              <animate attributeName="cy" values="170;150;170" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="1200" cy="130" r="7" fill="rgba(190, 141, 0, 0.7)">
              <animate attributeName="cy" values="130;110;130" dur="8s" repeatCount="indefinite" />
            </circle>
            <circle cx="1350" cy="190" r="8" fill="rgba(190, 141, 0, 0.5)">
              <animate attributeName="cy" values="190;170;190" dur="7s" repeatCount="indefinite" />
            </circle>
            <circle cx="1500" cy="150" r="6" fill="rgba(190, 141, 0, 0.9)">
              <animate attributeName="cy" values="150;130;150" dur="9s" repeatCount="indefinite" />
            </circle>
          </g>
          
          {/* Connection lines */}
          <g className="connections" stroke="rgba(190, 141, 0, 0.3)" strokeWidth="1" fill="none">
            <line x1="150" y1="200" x2="300" y2="150">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="300" y1="150" x2="450" y2="180">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="5s" repeatCount="indefinite" />
            </line>
            <line x1="450" y1="180" x2="600" y2="120">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="6s" repeatCount="indefinite" />
            </line>
            <line x1="600" y1="120" x2="750" y2="160">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="7s" repeatCount="indefinite" />
            </line>
            <line x1="750" y1="160" x2="900" y2="140">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="8s" repeatCount="indefinite" />
            </line>
            <line x1="900" y1="140" x2="1050" y2="170">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="1050" y1="170" x2="1200" y2="130">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="5s" repeatCount="indefinite" />
            </line>
            <line x1="1200" y1="130" x2="1350" y2="190">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="6s" repeatCount="indefinite" />
            </line>
            <line x1="1350" y1="190" x2="1500" y2="150">
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="7s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
      </div>
      {/* Light white overlay for cleaner appearance */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/75 to-gray-50/60" />
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(190, 141, 0, 0.1) 0%, transparent 70%)"
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.1, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.h2 
            className="display-2 text-foreground mb-6 font-logo font-light"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
          >
            Where Blockchain Meets Buildings
          </motion.h2>
          <motion.p 
            className="body-large max-w-3xl mx-auto text-black font-logo font-light mb-12"
            initial={{ opacity: 0, y: 30, x: -20 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.0, delay: 0.6, ease: "easeOut" }}
          >
            Commertize transforms commercial real estate into secure, tradeable digital assets — combining the stability of property with the speed, transparency, and global reach of blockchain.
          </motion.p>
          

        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mt-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              className="value-tile group relative overflow-hidden border-2 border-[#d4a017] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ 
                scale: 1.02,
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card glow effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
              
              <div className="mb-6 relative z-10">
                <motion.div 
                  className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300"
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                  whileHover={{ 
                    scale: 1.15,
                    rotate: 8,
                    backgroundColor: "rgba(190, 141, 0, 0.3)",
                    boxShadow: "0 0 20px rgba(190, 141, 0, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={
                      benefit.icon === Globe ? {
                        rotate: 360,
                        y: [0, -5, 5, 0],
                        scale: [1, 1.1, 1]
                      } : benefit.icon === Coins ? {
                        y: [0, -6, 0, 6, 0],
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                        x: [0, 2, -2, 0]
                      } : benefit.icon === TrendingUp ? {
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.15, 0.9, 1],
                        y: [0, -4, 4, 0],
                        x: [0, 3, -3, 0]
                      } : benefit.icon === Shield ? {
                        rotate: [0, -8, 8, 0],
                        y: [0, -3, 0, 3, 0],
                        scale: [1, 1.08, 1],
                        x: [0, 2, -2, 0]
                      } : benefit.icon === Zap ? {
                        rotate: [0, 20, -20, 0],
                        x: [0, 4, -4, 0],
                        y: [0, -6, 3, 0],
                        scale: [1, 1.12, 1]
                      } : benefit.icon === Users ? {
                        rotateY: [0, 180, 360],
                        scale: [1, 1.1, 0.95, 1],
                        y: [0, -4, 4, 0],
                        x: [0, 2, -2, 0]
                      } : {
                        rotate: [0, -8, 8, 0],
                        y: [0, -3, 3, 0]
                      }
                    }
                    transition={
                      benefit.icon === Globe ? {
                        rotate: {
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        },
                        y: {
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        },
                        scale: {
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        }
                      } : benefit.icon === Coins ? {
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.25
                      } : benefit.icon === TrendingUp ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.1
                      } : benefit.icon === Shield ? {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      } : benefit.icon === Zap ? {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.1
                      } : benefit.icon === Users ? {
                        rotateY: {
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        },
                        scale: {
                          duration: 2.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        },
                        y: {
                          duration: 2.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        },
                        x: {
                          duration: 2.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        }
                      } : {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }
                    }
                    whileHover={{ 
                      scale: 1.3, 
                      rotate: benefit.icon === Globe ? 360 : benefit.icon === Zap ? 15 : -10,
                      y: -2
                    }}
                  >
                    <benefit.icon className="w-7 h-7 text-primary drop-shadow-sm" />
                  </motion.div>
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-semibold text-foreground mb-3 font-logo font-light"
                  whileHover={{ 
                    color: "#be8d00",
                    transition: { duration: 0.2 }
                  }}
                >
                  {benefit.title}
                </motion.h3>
                
                <motion.p 
                  className="text-black leading-relaxed font-logo font-light"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {benefit.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating elements for visual enhancement */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent"
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent"
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
            scale: [1.1, 1, 1.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </section>
  );
};

export default Benefits;
