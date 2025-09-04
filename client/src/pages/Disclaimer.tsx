import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import DOMPurify from 'dompurify';
import { useSettings } from "@/hooks/useSettings";

const Disclaimer = () => {
  const { settings } = useSettings();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const docRef = doc(db, "legal_documents", "disclaimer");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content || "");
        }
      } catch (error) {
        console.error("Error loading disclaimer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading Disclaimer...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6 prose prose-slate max-w-none">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
                <p className="text-lg mb-6">Last updated: July 23, 2025</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Investment Risks</h2>
                <p className="mb-4">
                  Investing in commercial real estate involves substantial risks, including illiquidity, market volatility, and potential loss of principal. Investment values can fluctuate significantly, and investors may lose their entire investment. Carefully consider your financial situation and risk tolerance before investing.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">No Investment Advice & User Responsibility</h2>
                <p className="mb-4">
                  {settings.companyName} does not provide investment, legal, financial, or tax advice. All information on our platform is for informational purposes only. Users are solely responsible for conducting their own thorough due diligence and should consult qualified professionals before making investment decisions.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Forward-Looking Statements</h2>
                <p className="mb-4">
                  Any projections, estimates, or forward-looking statements provided are based on current expectations and assumptions which may prove incorrect or imprecise. Actual outcomes may differ significantly from expectations.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Information & Links</h2>
                <p className="mb-4">
                  Information from third-party sources is believed reliable but has not been independently verified. {settings.companyName} makes no representation regarding its accuracy, completeness, or reliability. The platform may include links to external third-party websites, for which {settings.companyName} accepts no responsibility or liability concerning content, accuracy, or security.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Performance Data</h2>
                <p className="mb-4">
                  Past performance data is provided for informational purposes only and does not guarantee future performance. Investments may perform differently from past results, and there is no assurance of returns or profits.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Compliance and Jurisdictional Restrictions</h2>
                <p className="mb-4">
                  All users must comply with {settings.companyName}'s verification procedures (including KYC/AML). Services may be jurisdictionally restricted; users must ensure their use of {settings.companyName} complies with applicable local regulations. {settings.companyName} reserves the right to restrict or deny access at its discretion, consistent with applicable laws.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Indemnification</h2>
                <p className="mb-4">
                  By using {settings.companyName}, you agree to indemnify and hold harmless {settings.companyName}, its affiliates, directors, employees, and agents from any and all claims, damages, losses, or liabilities arising from your use of or reliance upon the platform.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Disclaimer;
