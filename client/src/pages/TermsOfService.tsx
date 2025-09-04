import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import DOMPurify from 'dompurify';

export default function TermsOfService() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const docRef = doc(db, "legal_documents", "terms");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content || "");
        }
      } catch (error) {
        console.error("Error loading terms of service:", error);
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
              <span className="ml-2">Loading Terms of Service...</span>
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
                <h1 className="text-3xl font-bold mb-6">TERMS OF SERVICE</h1>
                <p className="text-sm text-gray-600 mb-6">Effective Date: January 2025</p>

                <p>Welcome to www.Commertize.com, owned by Commertize, Inc.. These Terms of Service govern your use of our Website, products, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms, and you represent that you have read and understood them. If you do not agree, you may not access or use the Service.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of These Terms</h2>
            <p>By creating an account, submitting any information, or otherwise engaging with our Website, you acknowledge and agree that you have read, understood, and agree to be bound by these Terms and all other referenced agreements (including our Privacy Policy). You also agree that you have the authority to enter into these Terms personally, or on behalf of the entity you represent, and to bind that entity to these Terms.</p>
            <p>We reserve the right to modify these Terms at any time. If we do so, we will post the updated Terms and update the "Effective Date" at the top of this document. Your continued use of the Service after any such modification constitutes your acceptance of the revised Terms.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Eligibility and User Conduct</h2>
            <p><strong>Eligibility:</strong> You must be at least 18 years old (or the applicable age of majority in your jurisdiction) to use our Service.</p>
            <p><strong>Accurate Information:</strong> You agree to provide accurate, current, and complete information when creating an account or otherwise interacting with the Service.</p>
            <p><strong>Prohibited Conduct:</strong> You agree not to use the Service in any manner that:</p>
            <ul>
              <li>Violates any applicable local, state, national, or international law or regulation</li>
              <li>Infringes upon the rights of others, including intellectual property rights or privacy rights</li>
              <li>Could harm or attempt to harm our systems or any third party's systems</li>
              <li>Distributes spam, viruses, or other harmful software</li>
              <li>Attempts to gain unauthorized access to any part of the Service or underlying infrastructure</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. User Accounts</h2>
            <p><strong>Account Creation:</strong> You may be required to create an account to access certain features of the Service. You are responsible for maintaining the confidentiality of your login credentials.</p>
            <p><strong>Responsibility:</strong> You are fully responsible for all activities that occur under your account. If you suspect any unauthorized use of your account, you must notify Commertize immediately at support@commertize.com.</p>
            <p><strong>Account Termination:</strong> Commertize reserves the right to suspend or terminate your account or restrict access to the Service at any time, with or without notice, for any or no reason.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Use of Personal Information</h2>
            <p>Commertize may collect, use, and disclose personal information from users as needed to provide the Service and for other lawful purposes. Please review our Privacy Policy for details on how we handle your personal information. By using the Service, you consent to the collection and use of this information in accordance with our Privacy Policy.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Intellectual Property</h2>
            <p><strong>Ownership:</strong> The Service (including text, graphics, logos, images, and software) is owned or licensed by Commertize and is protected by applicable intellectual property laws.</p>
            <p><strong>Limited License:</strong> Subject to your compliance with these Terms, Commertize grants you a non-exclusive, non-transferable, revocable license to access and use the Service for your personal or internal business use.</p>
            <p><strong>Restrictions:</strong> You may not modify, copy, distribute, reproduce, publish, license, create derivative works from, or sell any content obtained from the Service without explicit prior written permission from Commertize.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Transaction Information and Third Parties</h2>
            <p><strong>Transaction Processing:</strong> Certain features of the Service may enable you to invest in or otherwise engage in transactions with issuers through Commertize's technology. You agree that Commertize is not responsible for the actions or omissions of any issuer or third party.</p>
            <p><strong>Broker-Dealers:</strong> Some investment opportunities available via the Service may be offered by a broker-dealer (an affiliate of Commertize or an unaffiliated third party). Any personal or transactional information shared with a broker-dealer is subject to the broker-dealer's own privacy and data handling policies.</p>
            <p><strong>Third-Party Services:</strong> The Service may link to or integrate with third-party websites, products, or services. You acknowledge that Commertize does not endorse nor assume responsibility for any third-party content or practices.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Confidentiality and Security</h2>
            <p><strong>Security Measures:</strong> Commertize employs physical, administrative, and technological safeguards to protect your data. However, no system is completely secure, and Commertize cannot guarantee the absolute security of its systems.</p>
            <p><strong>Children's Privacy:</strong> The Service is not intended for use by individuals under 16 years of age. If you believe we have inadvertently collected information from someone under 16, please contact privacy@commertize.io, and we will take prompt action to delete it.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Disclaimers and Limitation of Liability</h2>
            <p className="uppercase"><strong>Disclaimer of Warranties:</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." COMMERTIZE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
            <p className="uppercase"><strong>No Guarantee:</strong> COMMERTIZE MAKES NO GUARANTEES THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT ANY CONTENT WILL BE ACCURATE OR RELIABLE.</p>
            <p><strong>Investment Risks:</strong> Any investment or financial opportunity listed or referenced on the Service carries inherent risks. Commertize is not responsible for any losses or damages incurred as a result of your investment decisions.</p>
            <p className="uppercase"><strong>Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMMERTIZE AND ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY OTHER DAMAGES OF ANY KIND, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">9. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless Commertize and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorneys' fees) arising out of or related to:</p>
            <ul>
              <li>Your use of or access to the Service</li>
              <li>Your violation of any term in these Terms</li>
              <li>Your violation of any third-party right, including intellectual property or privacy rights</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">10. Governing Law and Dispute Resolution</h2>
            <p><strong>Governing Law:</strong> These Terms are governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law principles.</p>
            <p><strong>Arbitration:</strong> Any dispute or claim arising out of or in connection with these Terms shall be resolved by final and binding arbitration administered by a recognized arbitration center in Houston, Texas, unless otherwise mutually agreed upon in writing by both parties.</p>
            <p><strong>Injunctive Relief:</strong> Nothing in this section prevents either party from seeking injunctive or other equitable relief from a court of competent jurisdiction to prevent or curtail a breach of these Terms.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">11. Miscellaneous</h2>
            <p><strong>Entire Agreement:</strong> These Terms, along with any other agreements or policies referenced herein, constitute the entire agreement between you and Commertize regarding your use of the Service.</p>
            <p><strong>Severability:</strong> If any portion of these Terms is held to be invalid, the remaining provisions shall remain in full force.</p>
            <p><strong>Assignment:</strong> You may not assign or transfer your rights or obligations under these Terms without Commertize's prior written consent.</p>
            <p><strong>No Waiver:</strong> Commertize's failure to enforce any provision of these Terms shall not be deemed a waiver of that provision.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">12. How to Contact Us</h2>
            <p>If you have any questions about these Terms or our data practices, please contact us at:</p>
            <address className="not-italic">
              Commertize, Inc.<br />
              Attn: Legal – Terms of Service<br />
              20250 SW Acacia St. #130<br />
              Newport Beach, California 92660<br />
              Email: support@commertize.com
            </address>

            <h2 className="text-xl font-semibold mt-6 mb-4">13. Changes to These Terms</h2>
            <p>We may modify these Terms at any time. If we make material changes, we will notify you by updating the "Effective Date" above and posting the revised Terms on the Website. We may also provide another method of notification (e.g., email). Any modifications become effective upon posting (or as otherwise indicated), and your continued use of the Service signifies acceptance of the updated Terms.</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
