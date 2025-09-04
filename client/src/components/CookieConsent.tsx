import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem("cookie-consent");
    if (!cookieChoice) {
      setShow(true);
    }
  }, []);

  const handleChoice = (accepted: boolean) => {
    localStorage.setItem("cookie-consent", accepted ? "accepted" : "rejected");
    setShow(false);
    
    toast({
      description: accepted 
        ? "Thank you for accepting cookies. Your preferences have been saved."
        : "You've opted out of cookies. Some features may be limited.",
      duration: 3000,
    });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 max-w-sm bg-white rounded-lg shadow-lg p-6 border border-gray-200 animate-in slide-in-from-bottom-2 z-40">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-sans font-light text-foreground">Cookie Settings</h3>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-6 w-6"
          onClick={() => setShow(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm font-sans font-light text-foreground/80 mb-4">
        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. Please choose your preference.
      </p>
      
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => handleChoice(false)}
          className="font-sans font-light"
        >
          Reject All
        </Button>
        <Button
          onClick={() => handleChoice(true)}
          className="font-sans font-light"
        >
          Accept All
        </Button>
      </div>
    </div>
  );
}
