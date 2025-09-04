import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { handleEmailVerificationSuccess } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function EmailVerificationSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");

    if (!oobCode) {
      setLocation("/");
      return;
    }

    // Send welcome email
    handleEmailVerificationSuccess(oobCode)
      .then(() => {
        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation("/account");
        }, 3000);
      })
      .catch(console.error);
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-4">
              Email Verified Successfully!
            </h1>
            <p className="text-muted-foreground mb-4">
              Thank you for verifying your email. You will be redirected to the
              login page shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
