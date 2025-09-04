import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants for blockchain nodes
const nodeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 }
};

// Animation variants for connection lines
const lineVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 0.5 }
};

const BlockchainAnimation = () => {
  return (
    <motion.div 
      className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden opacity-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.2 }}
      transition={{ duration: 1 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 400 400">
        <motion.path
          d="M 50,200 L 350,200"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          variants={lineVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M 200,50 L 200,350"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          variants={lineVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        />
        {[
          [200, 200],
          [150, 150],
          [250, 250],
          [150, 250],
          [250, 150]
        ].map(([cx, cy], index) => (
          <motion.circle
            key={index}
            cx={cx}
            cy={cy}
            r="20"
            fill="currentColor"
            variants={nodeVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.2, duration: 0.5 }}
          />
        ))}
      </svg>
    </motion.div>
  );
};

export default function NewsletterReminder() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show if user hasn't subscribed yet
      if (!localStorage.getItem('newsletter-subscribed')) {
        e.preventDefault();
        e.returnValue = '';
        setOpen(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    setIsSubscribing(true);
    try {
      // Save to Firebase
      await addDoc(collection(db, "newsletter_subscribers"), {
        email,
        subscribedAt: new Date().toISOString(),
      });

      // Send welcome email
      const response = await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: email,
          userName: email.split('@')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send welcome email');
      }

      localStorage.setItem('newsletter-subscribed', 'true');

      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter.",
      });

      setEmail("");
      setOpen(false);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-md overflow-hidden">
            <BlockchainAnimation />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DialogHeader>
                <DialogTitle>Real Estate. Reinvented.</DialogTitle>
                <DialogDescription>
                  Subscribe for insider updates on blockchain-powered property markets and investment strategies.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubscribe} className="space-y-4 pt-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubscribing}
                    className="backdrop-blur-sm bg-opacity-50"
                  />
                </motion.div>
                <div className="flex justify-end gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Maybe Later
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button type="submit" disabled={isSubscribing}>
                      {isSubscribing ? "Subscribing..." : "Subscribe"}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}