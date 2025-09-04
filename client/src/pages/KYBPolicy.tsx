import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import DOMPurify from 'dompurify';

const KYBPolicy = () => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const docRef = doc(db, "legal_documents", "kyb");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content || "");
        }
      } catch (error) {
        console.error("Error loading KYB policy:", error);
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
              <span className="ml-2">Loading KYB Policy...</span>
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
                <h1 className="text-3xl font-bold mb-2">KYB Policy</h1>
                <p className="text-sm text-gray-600 mb-6">Last updated: July 23, 2025</p>

                <p className="mb-6">This Know Your Business (KYB) Policy outlines the procedures and requirements for verifying the identity and legitimacy of corporate and institutional clients ("Entities") seeking to use the Commertize platform, www.commertize.com (the "Platform"). This policy is integral to our Anti-Money Laundering (AML) framework and ensures compliance with applicable laws and regulations.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Purpose of KYB</h2>
            <p className="mb-2">The objectives of our KYB Policy include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Preventing illegal activities such as money laundering, terrorist financing, fraud, and sanctions evasion.</li>
              <li>Verifying the legal existence, structure, and beneficial ownership of Entities.</li>
              <li>Conducting risk assessments and applying appropriate due diligence.</li>
              <li>Complying with AML/CFT regulatory requirements.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. KYB Requirements for Entities</h2>
            <p className="mb-4">Entities must successfully complete our KYB verification process before accessing the Platform's full functionalities. Required documentation typically includes:</p>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.1. Legal Entity Information:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Full legal name and legal form (corporation, partnership, trust, etc.).</li>
              <li>Date and place of incorporation/registration.</li>
              <li>Registered address and principal business address.</li>
              <li>Tax identification number (e.g., VAT number, EIN).</li>
              <li>Company registration number.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.2. Corporate Documents:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Certificate of Incorporation or Formation.</li>
              <li>Articles of Association, Bylaws, or equivalent.</li>
              <li>Shareholder register detailing ownership structure.</li>
              <li>Board resolution authorizing Platform usage and designating authorized signatories.</li>
              <li>Proof of business address (recent utility bill, lease agreement).</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.3. Beneficial Ownership Information:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Identification of individuals owning or controlling 25% or more of Entity shares or voting rights.</li>
              <li>Personal KYC documentation for each beneficial owner, including full name, date of birth, residential address, nationality, and government-issued ID.</li>
              <li>Identification of controlling individuals if no beneficial owner meets the threshold.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.4. Directors and Senior Management:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Full names of directors and senior managing officials.</li>
              <li>Personal KYC documentation for key individuals (CEO, CFO, authorized signatories).</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.5. Source of Funds/Wealth:</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Primary business activities and industry.</li>
              <li>Details of source of funds intended for use on the Platform.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Verification Process</h2>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Document Submission:</strong> Upload scanned or certified true copies of requested documents.</li>
              <li><strong>Document Verification:</strong> Validate authenticity through independent sources.</li>
              <li><strong>Information Cross-Referencing:</strong> Cross-reference provided information with public records and databases.</li>
              <li><strong>Sanctions and PEP Screening:</strong> Screen beneficial owners, directors, and authorized signatories against global sanctions and Politically Exposed Persons (PEP) databases.</li>
              <li><strong>Risk Assessment:</strong> Conduct risk assessments based on jurisdiction, industry, ownership structure, and activities. Enhanced Due Diligence (EDD) applies to high-risk entities.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Ongoing Due Diligence</h2>
            <p className="mb-2">Commertize conducts continuous monitoring of Entity clients, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Periodic review of KYB documentation.</li>
              <li>Monitoring changes in beneficial ownership or control.</li>
              <li>Reviewing transactions for suspicious activity.</li>
              <li>Requesting updated information or documentation as necessary.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Failure to Comply</h2>
            <p className="mb-2">Non-compliance with KYB procedures may result in:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Delays or denial of account activation.</li>
              <li>Suspension or termination of existing accounts.</li>
              <li>Restrictions on Platform access.</li>
              <li>Reporting to authorities if suspicious activities are detected.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Confidentiality</h2>
            <p className="mb-4">All KYB information is confidentially managed in compliance with our Privacy Policy and applicable data protection laws.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Policy Review</h2>
            <p className="mb-4">This KYB Policy will be periodically reviewed and updated to ensure effectiveness and compliance with regulatory developments and best practices.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Contact Information</h2>
            <p className="mb-2">For inquiries related to this KYB Policy, please contact our compliance team:</p>
            <address className="not-italic mb-4">
              Commertize, Inc.<br />
              Attn: KYB Compliance Officer<br />
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

export default KYBPolicy;