import { Building2, Coins, Clock, Bot } from "lucide-react";

const InvestmentBenefits = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 slow-moving-background"
        style={{
          backgroundImage: "url('/assets/building-modern.jpg')",
          backgroundSize: "120%",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
          opacity: 0.3,
        }}
      />
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-logo font-light mb-8 sm:mb-12 text-black px-4">
            The King of Real-World Assets
          </h2>

          <div className="space-y-6 sm:space-y-8 text-left mb-12 sm:mb-16 px-4">
            <div className="mb-4 sm:mb-6">
              <p className="text-base sm:text-lg leading-relaxed text-black font-logo font-light">
                For decades, commercial real estate has reigned supreme — delivering unmatched stability, 
                cash flow, and long-term appreciation. It's the asset class that outperforms through market 
                cycles, hedges against inflation, and anchors the portfolios of the world's wealthiest investors.
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-base sm:text-lg leading-relaxed text-black font-logo font-light">
                Now, Commertize is bringing the king into the digital age. By tokenizing commercial real 
                estate on the blockchain, we're transforming it from an exclusive, illiquid market into a 
                borderless, accessible, and transparent investment class.
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-base sm:text-lg leading-relaxed text-black font-logo font-light">
                Whether you're an individual investor, a family office, or an institution, you can now 
                claim your share of the most powerful asset in the RWA kingdom — with just a few clicks.
              </p>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};

export default InvestmentBenefits;