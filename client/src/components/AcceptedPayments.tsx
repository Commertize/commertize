import { Card, CardContent } from "@/components/ui/card";

const AcceptedPayments = () => {
  const payments = [
    {
      name: "USD",
      imageSrc: "/assets/USD.webp",
      alt: "US Dollar",
    },
    {
      name: "USDC",
      imageSrc: "/assets/usdc.webp",
      alt: "USD Coin",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">We Accept</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {payments.map((payment) => (
            <Card key={payment.name} className="text-center">
              <CardContent className="pt-6">
                <div className="aspect-square relative w-48 mx-auto mb-4">
                  <img
                    src={payment.imageSrc}
                    alt={payment.alt}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-2xl font-semibold">{payment.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AcceptedPayments;