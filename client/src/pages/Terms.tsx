import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen w-full bg-background py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6 prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold mb-2">TERMS & CONDITIONS</h1>
            <p className="text-sm text-gray-600 mb-6">Last updated: July 23, 2025</p>

            <p className="mb-6">Welcome to Commertize, Inc. ("Commertize"). By accessing or using our website at www.commertize.com (the "Service"), you agree to be bound by these Terms & Conditions (the "Terms") and all referenced policies including our Privacy Policy, KYC/AML Policy, and Cookie Policy.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance and Modification of Terms</h2>
            <p className="mb-4">By creating an account, accessing, or using our Service, you confirm that you have read, understood, and agree to these Terms. Commertize reserves the right to modify these Terms at any time. Your continued use constitutes acceptance of updated Terms.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Eligibility and Account Registration</h2>
            <p className="mb-4">You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Service. You agree to provide accurate, current, and complete information upon account creation and to promptly update this information.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. User Verification (KYC/AML Compliance)</h2>
            <p className="mb-4">All users are required to complete Commertize's mandatory Know Your Customer (KYC) and Anti-Money Laundering (AML) verification procedures. Failure to comply may result in account suspension or termination.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Platform Role and User Responsibilities</h2>
            <p className="mb-4">Commertize provides a technology platform facilitating connections between investors and asset issuers. Commertize does not act as a financial advisor or broker-dealer and does not provide investment advice. Investment decisions are the sole responsibility of the user.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Investment Risks</h2>
            <p className="mb-4">Investments available via the Service involve significant risks including market volatility, illiquidity, regulatory changes, and potential loss of principal. Users must perform their own due diligence.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. User Obligations & Prohibited Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Violate applicable local, state, national, or international laws.</li>
              <li>Engage in fraudulent, deceptive, or manipulative activities.</li>
              <li>Interfere with or disrupt Commertize or other users' access to the Service.</li>
              <li>Attempt unauthorized access to any aspect of the Service or its systems.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Intellectual Property Rights</h2>
            <p className="mb-4">All content on Commertize, including text, graphics, images, software, logos, and trademarks, is the property of Commertize or its licensors, protected by intellectual property laws. You are granted a limited, non-exclusive, revocable license to use the Service strictly for personal or internal business purposes.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Confidentiality and Data Security</h2>
            <p className="mb-4">Commertize implements industry-standard safeguards but cannot guarantee absolute security. By using the Service, you acknowledge these limitations. Please refer to our Privacy Policy for detailed data practices.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">9. Third-Party Content & Services</h2>
            <p className="mb-4">Commertize is not responsible or liable for any third-party services, linked websites, or external content accessed through the Service.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">10. Disclaimers and Limitation of Liability</h2>
            <p className="mb-4">The Service is provided "as-is" and "as-available" without warranties of any kind. Commertize shall not be liable for direct, indirect, incidental, consequential, punitive, special damages, or losses including but not limited to loss of profits, revenue, goodwill, or data.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">11. Indemnification</h2>
            <p className="mb-4">You agree to indemnify and hold harmless Commertize, its affiliates, directors, officers, employees, and agents from claims, damages, obligations, losses, liabilities, costs, and expenses arising from your use of or access to the Service, violation of these Terms, or violation of third-party rights.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">12. Termination</h2>
            <p className="mb-4">Commertize may terminate or suspend your account and Service access without prior notice at its sole discretion. Upon termination, your rights to access and use the Service will immediately cease.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">13. Governing Law and Dispute Resolution</h2>
            <p className="mb-4">These Terms shall be governed by and interpreted under the laws of the State of Texas, without regard to its conflict-of-law provisions. Any disputes or claims related to these Terms will be exclusively adjudicated by the courts located in Houston, Texas. Both parties waive objections to jurisdiction or venue.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">14. Miscellaneous</h2>
            <p className="mb-2"><strong>Entire Agreement:</strong> These Terms represent the complete agreement between Commertize and users.</p>
            <p className="mb-2"><strong>Severability:</strong> If any provision is invalid or unenforceable, remaining provisions will remain effective.</p>
            <p className="mb-2"><strong>Assignment:</strong> Rights and obligations under these Terms may not be assigned without Commertize's consent.</p>
            <p className="mb-4"><strong>No Waiver:</strong> Commertize's failure to enforce a term shall not constitute a waiver.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">15. Contact Us</h2>
            <p className="mb-2">For questions or concerns regarding these Terms, please contact us at:</p>
            <address className="not-italic mb-4">
              Commertize, Inc.<br />
              Attn: Legal – Terms of Service<br />
              20250 SW Acacia St. #130<br />
              Newport Beach, California 92660<br />
              Email: support@commertize.com
            </address>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
