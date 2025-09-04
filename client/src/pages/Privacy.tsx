import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import DOMPurify from 'dompurify';

const Privacy = () => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const docRef = doc(db, "legal_documents", "privacy");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content || "");
        }
      } catch (error) {
        console.error("Error loading privacy policy:", error);
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
              <span className="ml-2">Loading Privacy Policy...</span>
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
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-sm text-gray-600 mb-6">Last updated: July 23, 2025</p>

                <p className="mb-6">Welcome to www.commertize.com, owned by Commertize, Inc. We are committed to protecting your privacy. This Privacy Policy details how we collect, use, disclose, and otherwise process your Personal Information when you use our Website and services ("Service").</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
            <p className="mb-2">We collect Personal Information as detailed below:</p>
            
            <p className="mb-2"><strong>Personal Identification Information:</strong> Name, address, date of birth, nationality, contact details (email, phone), government-issued IDs for KYC/AML purposes.</p>
            
            <p className="mb-2"><strong>Financial Information:</strong> Bank account details, net worth, income sources, transaction details.</p>
            
            <p className="mb-2"><strong>Business Information (KYB, if applicable):</strong> Company details, registration documents, beneficial ownership.</p>
            
            <p className="mb-2"><strong>Technical Information:</strong> IP address, browser, device type, OS, referring pages, time/date stamps.</p>
            
            <p className="mb-2"><strong>Usage Information:</strong> User interactions, pages visited, session duration.</p>
            
            <p className="mb-4"><strong>Communication Information:</strong> Customer support communications, feedback, correspondence.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Collect Information</h2>
            <p className="mb-2"><strong>Directly:</strong> Information you provide (account registration, investment processing, customer support).</p>
            
            <p className="mb-2"><strong>Automatically:</strong> Through cookies, web analytics, and tracking technologies as you interact with our Service.</p>
            
            <p className="mb-4"><strong>Third-party Sources:</strong> Verification providers used for identity checks and compliance with KYC/AML/KYB requirements.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. How We Use Your Information</h2>
            <p className="mb-2">We process your data for specific purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Providing, operating, and improving our Service.</li>
              <li>Identity verification, compliance with regulatory requirements (AML/KYC/KYB).</li>
              <li>Transaction processing, investor accreditation, and account management.</li>
              <li>Communication, customer support, responding to your requests.</li>
              <li>Security monitoring, fraud detection/prevention, resolving technical issues.</li>
              <li>Marketing and promotional purposes (with your explicit consent where required).</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Disclosure of Your Information</h2>
            <p className="mb-2">We may disclose your information to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Our affiliates and subsidiaries.</li>
              <li>Third-party service providers (identity verification services, payment processors, hosting providers).</li>
              <li>Regulatory bodies or law enforcement agencies to comply with legal obligations.</li>
              <li>Parties involved in business transactions (e.g., mergers, acquisitions, asset sales).</li>
              <li>Third parties when necessary to protect our rights, safety, property, or users.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Data Security</h2>
            <p className="mb-4">Commertize employs commercially reasonable safeguards (secure servers, encryption, firewalls) designed to protect your Personal Information against unauthorized access, disclosure, alteration, or destruction. However, no internet transmission is fully secure; thus, we cannot guarantee absolute security.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Data Retention</h2>
            <p className="mb-4">We retain your Personal Information only for as long as necessary to fulfill the purposes for which it was collected, or as required by law or regulation, including legal, accounting, or reporting obligations.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Your Rights & Choices</h2>
            <p className="mb-2">Depending on your jurisdiction, you may have rights regarding your Personal Information, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Right to access your data</li>
              <li>Right to correct inaccuracies</li>
              <li>Right to delete or restrict data processing</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent at any time</li>
            </ul>
            <p className="mb-4">To exercise these rights, contact us at support@commertize.com.</p>
            
            <p className="mb-4"><strong>Marketing Communications:</strong> You may opt out anytime via the unsubscribe link provided in our marketing emails.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Children's Privacy</h2>
            <p className="mb-4">We do not knowingly collect Personal Information from individuals under the age of 16. If we become aware of such collection, we will promptly delete the information.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">9. Links to Other Websites</h2>
            <p className="mb-4">Our Website may link to third-party sites. We are not responsible for their privacy practices; please review their privacy policies separately.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">10. Changes to this Privacy Policy</h2>
            <p className="mb-4">We reserve the right to update or modify this Privacy Policy at any time. If we make material changes, we will notify you prominently through our Website or via email.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">11. How to Contact Us</h2>
            <p className="mb-2">For questions regarding this Privacy Policy or our privacy practices, contact us at:</p>
            <address className="not-italic mb-4">
              Commertize, Inc.<br />
              Attn: Legal – Privacy Policy<br />
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

export default Privacy;