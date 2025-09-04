import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { navigateToHomeSection } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  SiLinkedin,
  SiDiscord,
  SiInstagram,
  SiX,
  SiFacebook,
  SiTelegram,
  SiYoutube,
  SiTiktok,
} from "react-icons/si";
import { useSettings } from "@/hooks/useSettings";
import { SEOInternalLinks } from "./SEOInternalLinks";

const Footer = () => {
  const { settings } = useSettings();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const handleSectionNavigation =
    (sectionId: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      navigateToHomeSection(setLocation, sectionId);
    };

  const handleLinkClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation(path);
    window.scrollTo({ top: 0, behavior: "auto" }); // Ensure the new page starts at the top
  };

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
      // Check if email already exists
      const subscribersRef = collection(db, "newsletter_subscribers");
      const q = query(subscribersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Already Subscribed",
          description: "This email is already subscribed to our newsletter.",
        });
        return;
      }

      // Save to Firebase
      await addDoc(collection(db, "newsletter_subscribers"), {
        email,
        subscribedAt: new Date().toISOString(),
      });

      // Send welcome email
      const response = await fetch("/api/send-welcome-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: email,
          userName: email.split("@")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send welcome email");
      }

      localStorage.setItem("newsletter-subscribed", "true");

      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter.",
      });

      setEmail("");
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
    <footer className="footer">
      <div className="container py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src="/assets/commertize-logo.png" 
                alt="Commertize Logo" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm mb-6">
              Commercial Real Estate, Revolutionized.<br />
              Liquid. Transparent. Global.
            </p>
            <div className="mb-6">
              <div className="mb-3">
                <a
                  href="tel:+19498688863"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  +1 (949) 868-8863
                </a>
              </div>
              <div className="mb-4">
                <a
                  href="mailto:support@commertize.com"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  support@commertize.com
                </a>
              </div>
            </div>
            
            {/* Social Links Section */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-sm text-primary">Social Links</h4>
              <div className="flex flex-wrap gap-3">
                {settings.linkedin && (
                  <a
                    href={settings.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="LinkedIn"
                  >
                    <SiLinkedin className="h-5 w-5" />
                  </a>
                )}
                {settings.twitter && (
                  <a
                    href={settings.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="X (Twitter)"
                  >
                    <SiX className="h-5 w-5" />
                  </a>
                )}
                {settings.youtube && (
                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="YouTube"
                  >
                    <SiYoutube className="h-5 w-5" />
                  </a>
                )}
                {settings.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Instagram"
                  >
                    <SiInstagram className="h-5 w-5" />
                  </a>
                )}
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Facebook"
                  >
                    <SiFacebook className="h-5 w-5" />
                  </a>
                )}
                {settings.tiktok && (
                  <a
                    href={settings.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="TikTok"
                  >
                    <SiTiktok className="h-5 w-5" />
                  </a>
                )}
                {settings.discord && (
                  <a
                    href={settings.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Discord"
                  >
                    <SiDiscord className="h-5 w-5" />
                  </a>
                )}
                {settings.telegram && (
                  <a
                    href={settings.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Telegram"
                  >
                    <SiTelegram className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  onClick={handleLinkClick("/marketplace")}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Explore Marketplace
                </Link>
              </li>
              <li>
                <Link href="/submit" onClick={handleLinkClick("/submit")} className="text-primary hover:text-primary/80 transition-colors">
                  Submit Property
                </Link>
              </li>
              <li>
                <a href="/#about" onClick={handleSectionNavigation("about")} className="text-primary hover:text-primary/80 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/#contact"
                  onClick={handleSectionNavigation("contact")}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  href="/waitlist"
                  onClick={handleLinkClick("/waitlist")}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Join Waitlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" onClick={handleLinkClick("/privacy")} className="text-primary hover:text-primary/80 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" onClick={handleLinkClick("/terms")} className="text-primary hover:text-primary/80 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  onClick={handleLinkClick("/disclaimer")}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/aml-policy"
                  onClick={handleLinkClick("/aml-policy")}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  AML Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  onClick={handleLinkClick("/cookie-policy")}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/kyb-policy"
                  onClick={handleLinkClick("/kyb-policy")}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  KYB Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Newsletter</h4>
            <p className="text-sm mb-4 text-primary">
              Stay updated with our latest properties and news
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="text-black placeholder:text-black bg-primary/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                style={{ color: "black" }}
              />
              <Button type="submit" disabled={isSubscribing}>
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm">
          <p>{settings.copyright?.includes('2024') ? '© 2025 Commertize. All rights reserved.' : settings.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
