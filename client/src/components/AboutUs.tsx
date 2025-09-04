import { Building2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { motion } from "framer-motion";

const AboutUs = () => {
  const { settings } = useSettings();

  return (
    <section id="about" className="py-20 relative overflow-hidden min-h-[600px]" style={{ 
      backgroundImage: "url('/building-background.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      {/* Animated background layer */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/building-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
        }}
        animate={{
          scale: [1, 1.03, 1],
          x: [-8, 8, -8],
          y: [-4, 4, -4],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70 z-1" />

      <div className="container relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Fixed title at top */}
          <motion.h2 
            className="text-3xl font-logo font-light text-center mb-8 text-black"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            The {settings.companyName} Vision
          </motion.h2>
          
          <div className="prose max-w-none text-center">
            <motion.p 
              className="text-lg md:text-xl font-logo font-light text-black mb-6 drop-shadow-sm"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            >
              {settings.companyName} is reshaping commercial real estate investing by combining the power of AI and blockchain tokenization. Our platform unlocks institutional-grade opportunities, making them more accessible, liquid, and transparent than ever before.
            </motion.p>
            <motion.p 
              className="text-lg md:text-xl font-logo font-light text-black mb-6 drop-shadow-sm"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
            >
              With AI-driven insights guiding smarter investment decisions and blockchain ensuring trust and security, {settings.companyName} bridges the gap between traditional real estate and the digital future. We empower investors to own fractional shares in high-value properties—backed by data, powered by technology, and designed for tomorrow.
            </motion.p>
          </div>
          
          {/* Scrolling phrases at bottom */}
          <div className="relative h-16 md:h-20 flex items-center overflow-hidden mt-8 bg-white/20 rounded-lg backdrop-blur-sm">
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
              {["Digital Assets, Real-World Value", "Shaping the Future of Ownership", 
                "Digital Assets, Real-World Value", "Shaping the Future of Ownership"].map((phrase, index) => (
                <motion.div
                  key={`${phrase}-${index}`}
                  whileHover={{ 
                    scale: 1.05,
                    color: "#be8d00",
                    transition: { duration: 0.2 }
                  }}
                  className="cursor-pointer group flex-shrink-0"
                  style={{ minWidth: "400px", textAlign: "center" }}
                >
                  <span className="text-2xl md:text-3xl font-logo font-light text-black drop-shadow-sm tracking-wide transition-all duration-300 group-hover:drop-shadow-md">
                    {phrase}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;