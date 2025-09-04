import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import DOMPurify from 'dompurify';

const CookiePolicy = () => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const docRef = doc(db, "legal_documents", "cookie");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content || "");
        }
      } catch (error) {
        console.error("Error loading cookie policy:", error);
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
              <span className="ml-2">Loading Cookie Policy...</span>
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
                <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
                <p className="text-sm text-gray-600 mb-6">Last updated: July 23, 2025</p>

            <p className="mb-6">This Cookie Policy explains how Commertize, Inc. ("Commertize," "we," "us," or "our") uses cookies and similar technologies on our website, www.commertize.com (the "Platform").</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. What Are Cookies?</h2>
            <p className="mb-4">Cookies are small text files placed on your computer or mobile device when you visit a website. Cookies help websites function more efficiently and provide information to website owners.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Cookies</h2>
            <p className="mb-2">We use cookies for several purposes, including:</p>
            
            <p className="mb-2"><strong>Essential Cookies:</strong> These cookies are necessary for our Platform to function properly, enabling core functionalities such as security, network management, and accessibility.</p>
            
            <p className="mb-2"><strong>Performance and Analytics Cookies:</strong> These cookies collect information about how visitors use our Platform, including which pages they visit most frequently and any errors encountered. This information helps us improve the Platform and user experience.</p>
            
            <p className="mb-2"><strong>Functionality Cookies:</strong> These cookies allow our Platform to remember your preferences (such as username, language, or region) to provide enhanced, personalized features. They also remember adjustments you have made to the Platform's layout or text.</p>
            
            <p className="mb-4"><strong>Targeting/Advertising Cookies:</strong> These cookies are used to deliver advertisements relevant to your interests, limit how often you see an ad, and measure advertising effectiveness. Advertising networks typically place these cookies with our consent.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Types of Cookies We Use</h2>
            <p className="mb-2"><strong>First-party Cookies:</strong> Set directly by our Platform (Commertize).</p>
            
            <p className="mb-4"><strong>Third-party Cookies:</strong> Set by domains other than our Platform, such as social media plugins, analytics providers, or advertising partners.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Managing Your Cookie Preferences</h2>
            <p className="mb-4">Most browsers accept cookies automatically. You can adjust your browser settings to decline cookies or notify you before accepting them. Please note that declining cookies may affect your experience on our Platform, limiting access to certain features.</p>
            
            <p className="mb-4">For information on controlling and deleting cookies, visit www.allaboutcookies.org or refer to your browser's help section.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Changes to This Cookie Policy</h2>
            <p className="mb-4">We may update this Cookie Policy periodically to reflect operational, legal, or regulatory changes. Updates will be posted on this page, and significant changes may be communicated via email or prominently displayed notices on our Platform.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Contact Information</h2>
            <p className="mb-2">If you have questions about this Cookie Policy, please contact us:</p>
            <address className="not-italic mb-4">
              Commertize, Inc.<br />
              Attn: Privacy Officer<br />
              20250 SW Acacia St. #130<br />
              Newport Beach, California 92660<br />
              Email: support@commertize.com
            </address>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;