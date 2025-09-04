import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import DOMPurify from 'dompurify';

const AMLPolicy = () => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const docRef = doc(db, "legal_documents", "aml");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content || "");
        }
      } catch (error) {
        console.error("Error loading AML policy:", error);
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
              <span className="ml-2">Loading AML Policy...</span>
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
                <h1 className="text-3xl font-bold mb-2">AML Policy</h1>
                <p className="text-sm text-gray-600 mb-6">Last updated: July 23, 2025</p>

                <p className="mb-6">This Anti-Money Laundering (AML) Policy outlines the procedures, controls, and standards implemented by Commertize, Inc. ("Commertize") to prevent money laundering, terrorist financing, and other illicit financial activities through our platform, www.commertize.com (the "Platform"). Commertize is dedicated to strict compliance with applicable AML laws, regulations, and international best practices.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. AML Compliance Officer</h2>
            <p className="mb-4">Commertize has appointed an AML Compliance Officer who is responsible for overseeing the implementation, enforcement, and regular updating of this AML Policy. The Compliance Officer ensures ongoing adherence to AML standards and evolving regulatory requirements.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Know Your Customer (KYC) and Know Your Business (KYB) Procedures</h2>
            <p className="mb-4">Robust KYC/KYB procedures form the core of our AML framework. All users, both individual investors and businesses, must undergo comprehensive identity verification prior to transacting on our Platform.</p>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Individual Users:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Full name, residential address, date of birth, nationality, and contact details.</li>
              <li>Government-issued identification (passport, driver's license, national ID).</li>
              <li>Proof of address (utility bills, bank statements).</li>
              <li>Verification conducted via reputable third-party services.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Business Users:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Company name, registration details, business address.</li>
              <li>Beneficial ownership details and supporting documentation.</li>
              <li>Corporate governance documents.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD)</h2>
            <p className="mb-4">We implement ongoing CDD measures throughout customer relationships. Enhanced Due Diligence procedures apply to high-risk users or transactions, including politically exposed persons (PEPs), high-value transactions, and users from higher-risk jurisdictions.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Transaction Monitoring</h2>
            <p className="mb-2">Commertize utilizes automated and manual monitoring systems designed to identify and investigate suspicious or unusual transaction patterns, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Unusually large or frequent transactions.</li>
              <li>Transactions involving jurisdictions known for financial crime risks.</li>
              <li>Significant deviations from normal user activity.</li>
              <li>Alerts reviewed promptly by the AML Compliance Officer or authorized personnel.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Suspicious Activity Reporting (SAR)</h2>
            <p className="mb-2">If suspicious activities indicative of money laundering or terrorist financing are detected, Commertize will:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Conduct a thorough investigation.</li>
              <li>Report findings through a Suspicious Activity Report (SAR) to appropriate financial intelligence units (FIUs) in accordance with applicable laws.</li>
              <li>Maintain strict confidentiality; customers will not be informed of SAR filings.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Sanctions Screening</h2>
            <p className="mb-4">All users and related entities are screened against international sanctions and watchlists (including OFAC, UN, EU) to ensure prohibited individuals and entities cannot access Commertize's services.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Record Keeping</h2>
            <p className="mb-4">Commertize retains comprehensive records of all customer identification documents, transaction details, and SAR filings for at least five (5) years following transaction completion or account closure, as mandated by applicable regulations.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Employee Training</h2>
            <p className="mb-4">Relevant staff members receive regular AML training to maintain awareness and proficiency in detecting and reporting suspicious activities. Training covers AML laws, responsibilities, KYC/KYB processes, and internal policies.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">9. Internal Controls and Independent Audit</h2>
            <p className="mb-4">Commertize maintains rigorous internal controls to ensure compliance with AML policies. The effectiveness of these measures is regularly assessed through independent audits and reviews, with recommendations implemented promptly to enhance compliance.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">10. Policy Review and Updates</h2>
            <p className="mb-4">This AML Policy is subject to regular review and updates to reflect regulatory developments, emerging industry standards, and changes in Commertize's operational activities.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">11. Contact Information</h2>
            <p className="mb-2">For questions, comments, or concerns regarding this AML Policy, please contact our AML Compliance Officer:</p>
            <address className="not-italic mb-4">
              Commertize, Inc.<br />
              Attn: AML Compliance Officer<br />
              20250 SW Acacia St. #130<br />
              Newport Beach, California 92660<br />
              Email: compliance@commertize.com
            </address>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AMLPolicy;