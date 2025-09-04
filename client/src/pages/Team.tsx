
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

interface TeamMember {
  name: string;
  title: string;
  image: string;
  linkedin?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Cameron Razaghi",
    title: "Founder & CEO",
    image: "/team/image3.png",
    linkedin: "https://www.linkedin.com/in/cameron-razaghi-07322226a"
  },
  {
    name: "Ethan Shokrian",
    title: "Vice President of Capital Markets & Sales",
    image: "/team/image4.png",
    linkedin: "https://www.linkedin.com/in/ethanshokrian/"
  },
  {
    name: "Daniel Soufer",
    title: "Chief Product & Innovation Officer (CPIO)",
    image: "/team/image2.png",
    linkedin: "https://www.linkedin.com/in/daniel-soufer/"
  },
  {
    name: "Abba Wada",
    title: "Head of RWA Strategy",
    image: "/team/image5.png",
    linkedin: "https://www.linkedin.com/in/abba-wada-63b999266/"
  },
  {
    name: "Iman Reihanian",
    title: "Chief Technology Officer (CTO)",
    image: "/team/image0.png",
    linkedin: "https://www.linkedin.com/in/imanreih/"
  },
  {
    name: "Hector Garcia",
    title: "Vice President of Acquisitions",
    image: "/team/image1.png",
    linkedin: "https://www.linkedin.com/in/hector-garcia-297a682b0/"
  },
];

const Team = () => {



  return (
    <div className="min-h-screen bg-background">
      {/* Animated Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="container mx-auto max-w-6xl text-center relative z-10"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-light text-black mb-6"
          >
            Meet Our{" "}
            <motion.span 
              className="text-primary bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Visionary Team
            </motion.span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-black font-light max-w-3xl mx-auto"
          >
            We're a team of innovators, deal-makers, and technologists with one mission: 
            to make commercial real estate investment faster, more transparent, and accessible 
            to more people through blockchain tokenization.
          </motion.p>
        </motion.div>

        {/* Floating background elements */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 left-10 w-24 h-24 bg-primary/20 rounded-full blur-lg"
        />
      </section>

      {/* Team Grid - Simple Format */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                {/* Profile Image */}
                <div className="mb-6">
                  <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gray-100 border-4 border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-contain scale-90"
                      onLoad={() => console.log(`Displayed: ${member.name} - ${member.image}`)}
                      onError={() => console.error(`Failed: ${member.name} - ${member.image}`)}
                    />
                  </div>
                </div>

                {/* Member Details */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-light text-black">
                    {member.name}
                  </h3>
                  <p className="text-primary text-lg font-light">
                    {member.title}
                  </p>

                  {/* LinkedIn Contact */}
                  <div className="flex justify-center pt-2">
                    <a
                      href={member.linkedin || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors shadow-md"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Enhanced Call to Action */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 bg-gradient-to-r from-primary/5 to-primary/10 relative overflow-hidden"
      >
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-light text-black mb-6"
          >
            Ready to Join Our{" "}
            <span className="text-primary">Mission?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-black font-light mb-8"
          >
            Be part of the future of real estate investment with our innovative
            tokenization platform.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href="/waitlist"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-lg"
            >
              Join Waitlist
            </motion.a>
            <motion.a
              href="/marketplace"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-white px-8 py-4 text-sm font-medium text-primary hover:bg-primary/5 transition-colors shadow-lg"
            >
              Explore Properties
            </motion.a>
          </motion.div>
        </div>

        {/* Background Animation */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl"
        />
      </motion.section>
    </div>
  );
};

export default Team;
