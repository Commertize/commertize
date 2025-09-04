import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const sampleNewsArticle = {
  title: "How Real World Assets (RWAs) and AI Are Reshaping the Future of Investing",
  description: "The future of investing is here — and it's powered by both blockchain and artificial intelligence. Real World Assets (RWAs) — physical assets like real estate, infrastructure, and commodities — are being digitized and brought onto the blockchain.",
  imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80",
  content: `
    <div class="space-y-6">
      <p class="text-lg leading-relaxed">The future of investing is here — and it's powered by both blockchain and artificial intelligence.</p>
      
      <p>Real World Assets (RWAs) — physical assets like real estate, infrastructure, and commodities — are being digitized and brought onto the blockchain. At the same time, artificial intelligence (AI) is transforming how we analyze, access, and invest in these opportunities.</p>
      
      <p>At Commertize, we're leading this transformation by combining RWA tokenization with AI-powered insights, helping both investors and property owners make smarter decisions.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">What Are Real World Assets (RWAs)?</h2>
      
      <p>Real World Assets are physical, off-chain assets that can be tokenized — meaning their ownership is digitally represented on a blockchain. Examples include:</p>
      
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Commercial and residential real estate</li>
        <li>Energy infrastructure and farmland</li>
        <li>Collectibles, art, and precious metals</li>
      </ul>
      
      <p>Tokenizing RWAs unlocks benefits like fractional ownership, global access, increased liquidity, and automated income distribution— all while being backed by tangible, real-world value.</p>
      
      <p>According to Boston Consulting Group, the RWA tokenization market could reach $16 trillion by 2030.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">How Commertize Uses AI to Unlock Smarter Investing</h2>
      
      <p>What makes Commertize different is how we integrate artificial intelligence into every layer of the platform — bringing speed, clarity, and data-driven intelligence to tokenized investing.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">AI-Powered Property Valuations</h3>
      <p>We use machine learning models to quickly and accurately assess the value of submitted properties using location, comps, historical trends, and economic data.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">Personalized Deal Matching</h3>
      <p>Our AI engine helps investors discover RWA opportunities tailored to their interests, risk profile, and goals — reducing research time and increasing engagement.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">Predictive Market Analytics</h3>
      <p>Commertize forecasts potential returns and market dynamics using AI trained on real estate trends, macroeconomic data, and blockchain activity.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">Automation with AI + Smart Contracts</h3>
      <p>We streamline the investor journey by automating income distributions, compliance checks, and deal execution through smart contracts and AI tools.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Why RWAs + AI Are the Future</h2>
      
      <p>Real World Assets offer stability and intrinsic value, especially in volatile markets. When combined with AI, they become:</p>
      
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>More accessible through fractional investing</li>
        <li>Smarter to invest in with real-time insights</li>
        <li>More efficient with fewer intermediaries and faster execution</li>
        <li>Globally scalable via tokenized markets and smart algorithms</li>
      </ul>
      
      <p>Whether you're a seasoned investor or a first-time property owner, Commertize makes it easier to participate in this next-generation asset class.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Meet the Commertize AI Agents</h2>
      
      <p>Our platform is powered by a team of specialized AI agents, each designed to perform distinct tasks in the investment pipeline — from onboarding to ongoing asset management.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">AI Agent Roles at Commertize:</h3>
      
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Valuation Agent:</strong> Analyzes comps, location data, and predictive trends to price assets in real-time.</li>
        <li><strong>Underwriting Agent:</strong> Evaluates risk profiles, cash flows, and legal compliance of each property submission.</li>
        <li><strong>Investor Matchmaker Agent:</strong> Connects tokenized assets with suitable investors based on preferences, budget, and behavior.</li>
        <li><strong>Market Insights Agent:</strong> Generates analytics, forecasts, and reports for both investors and asset owners.</li>
        <li><strong>Compliance Agent:</strong> Scans deals for KYC/AML compliance and regional regulatory fit before activation.</li>
      </ul>
      
      <p>These agents work in harmony, continuously learning from new data to improve performance, reduce manual errors, and deliver seamless investing experiences at scale.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">AI-Driven Underwriting & Price Valuation</h2>
      
      <p>At Commertize, our AI tools play a critical role in underwriting properties and setting accurate, data-backed valuations — both key to ensuring transparency and investor confidence.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">AI for Property Valuation:</h3>
      
      <p>We use machine learning to analyze:</p>
      
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Historical sales and rental comps</li>
        <li>Neighborhood trends and market cycles</li>
        <li>Supply/demand dynamics and economic indicators</li>
        <li>Satellite imagery, GIS data, and zoning</li>
      </ul>
      
      <p>This enables instant, intelligent pricing models for commercial properties — replacing the slow, manual appraisal process with fast, consistent, and auditable outcomes.</p>
      
      <h3 class="text-xl font-semibold mt-6 mb-3">AI for Underwriting:</h3>
      
      <p>Our AI-powered underwriting engine evaluates properties against a wide range of financial and operational metrics, including:</p>
      
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Net operating income (NOI)</li>
        <li>Cap rates and ROI projections</li>
        <li>Lease structures and tenant mix</li>
        <li>Risk scores based on location, property type, and macroeconomic trends</li>
      </ul>
      
      <p>This helps us pre-screen and de-risk listings, so investors can move forward with confidence.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Invest Smarter. Build the Future.</h2>
      
      <p>At Commertize, we're building a more intelligent investment platform — one that merges the reliability of real assets with the speed and power of artificial intelligence.</p>
      
      <p class="text-center mt-8">
        <strong>Ready to list your property?</strong> Submit your deal today<br/>
        <strong>Want early access to new tokenized assets?</strong> Join our investor waitlist
      </p>
    </div>
  `,
  category: "Technology",
  featured: true,
  published: true,
  readTime: "8 min read",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
};

export const seedNewsData = async () => {
  try {
    await addDoc(collection(db, "news"), sampleNewsArticle);
    console.log("Sample news article added successfully");
  } catch (error) {
    console.error("Error adding sample news article:", error);
    throw error;
  }
};