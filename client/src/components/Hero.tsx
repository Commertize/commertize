
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

// Flipping text component for the hero section
const FlippingText = () => {
  // Updated prefixes array with Digit -> Digitized and Global -> Globalized
  const prefixes = ["Token", "Digit", "Fractional", "Democrat", "Optim", "Modern", "Global", "Revolution"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1); // Trigger animation
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % prefixes.length);
      }, 100); // Small delay to sync with animation
    }, 2500); // Change every 2.5 seconds for smoother experience
    return () => clearInterval(interval);
  }, [prefixes.length]);

  return (
    <div className="relative h-12 sm:h-16 md:h-20 lg:h-24 flex items-center justify-center mt-4">
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 drop-shadow-sm font-logo font-light flex items-baseline justify-center">
        <span 
          key={animationKey}
          className="text-flip inline-block"
        >
          {prefixes[currentIndex]}
        </span>
        <span>ized.</span>
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background Image with slow upward parallax */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: `url(/building-hd.jpg?v=${Date.now()})`,
            imageRendering: 'crisp-edges',
            filter: 'contrast(1.0) brightness(1.0) saturate(1.0)',
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
          animate={{
            scale: [1.0, 1.4]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />
        {/* Optimized gradient overlay for your new background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/75 to-gray-50/65"></div>
        {/* Additional subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/10 via-transparent to-transparent"></div>
      </div>

      {/* Content Overlay */}
      <div className="container relative z-10 pt-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline with elegant animations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-gray-900 mb-6 drop-shadow-lg leading-tight font-logo">
                <motion.span 
                  className="block font-extralight tracking-wide text-xl sm:text-2xl md:text-4xl lg:text-5xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Commercial Real Estate
                </motion.span>
                <FlippingText />
              </h1>
          </motion.div>

          {/* Subtitle with enhanced readability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-20"
          >
              <p className="max-w-3xl mx-auto text-gray-800 drop-shadow-sm text-base sm:text-lg md:text-xl font-logo font-light px-4">
                Your Gateway to Commercial Real Estate's Digital Future. 

                <motion.span 
                  className="block mt-4 text-gray-700 font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  Welcome to<img 
                    src="/assets/commertize-logo.png" 
                    alt="Commertize" 
                    className="inline h-4 sm:h-5 w-auto"
                    style={{
                      verticalAlign: "baseline",
                      clipPath: "inset(0 0 0 20%)",
                      transform: "translateY(4px) translateX(-22px)"
                    }}
                  />
                </motion.span>
              </p>
          </motion.div>



          {/* Futuristic CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
          >
            <Link href="/marketplace">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 sm:px-8 py-3 bg-white text-primary rounded-lg font-logo font-light text-base sm:text-lg hover:bg-white/90 transition-colors duration-200 w-full sm:w-auto text-center border-2 border-[#be8d00] shadow-lg"
              >
                Explore Marketplace
              </motion.button>
            </Link>
            
            <Link href="/waitlist">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 sm:px-8 py-3 bg-primary text-white rounded-lg font-logo font-light text-base sm:text-lg hover:bg-primary/90 transition-colors duration-200 w-full sm:w-auto text-center"
              >
                Join Waitlist
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>


    </section>
  );
};

export default Hero;
