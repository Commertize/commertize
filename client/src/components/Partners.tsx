import { 
  SiEthereum, 
  SiBinance, 
  SiCoinbase, 
  SiChase, 
  SiVisa 
} from "react-icons/si";

const partners = [
  { icon: SiEthereum, name: "Ethereum" },
  { icon: SiBinance, name: "Binance" },
  { icon: SiCoinbase, name: "Coinbase" },
  { icon: SiChase, name: "Chase Bank" },
  { icon: SiVisa, name: "Visa" },
];

const Partners = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Our Strategic Partners
        </h2>
        <div className="flex flex-wrap justify-center gap-12 items-center">
          {partners.map((partner, index) => (
            <partner.icon
              key={index}
              className="w-12 h-12 text-gray-400 hover:text-gray-600 transition-colors"
              title={partner.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;