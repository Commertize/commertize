import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ConfidentialityAgreement } from "@/components/ConfidentialityAgreement";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ConfidentialityAgreementPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: property } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) throw new Error("No property ID");
      const docRef = doc(db, "properties", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Property not found");

      const data = docSnap.data();
      return {
        id: docSnap.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        name: data.name || 'Unnamed Property',
        location: data.location || 'Location not specified',
        type: data.type || 'Not specified',
        propertyClass: data.propertyClass || 'Class A',
        imageUrl: data.imageUrl || '/placeholder-property.jpg',
        imageUrls: data.imageUrls || [],
        minInvestment: data.minInvestment || 0,
        targetedIRR: data.targetedIRR || 0,
        targetedYield: data.targetedYield || 0,
        equityMultiple: data.equityMultiple || 1,
        netOperatingIncome: data.netOperatingIncome || 0,
        squareFeet: data.squareFeet || 0,
        description: data.description || '',
        units: data.units || 0,
        targetEquity: data.targetEquity || 0,
        yearBuilt: data.yearBuilt || new Date().getFullYear(),
        closingDate: data.closingDate || '2024-12-31',
        pricePerToken: data.pricePerToken || 1,
        targetPeriod: data.targetPeriod || '5 years',
        documents: data.documents || [],
        investmentHighlights: data.investmentHighlights || [],
        mapUrl: data.mapUrl || '',
        brochureUrl: data.brochureUrl || '',
        status: data.status || 'Express Interest'
      };
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/confidentiality-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          propertyId: id,
          propertyDetails: property, // Include all property details in the submission
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      toast({
        title: "Agreement Submitted Successfully",
        description: "You will receive a confirmation email shortly with complete property details.",
      });

      navigate(`/property/${id}`);
    } catch (error) {
      console.error('Error submitting agreement:', error);
      toast({
        title: "Error",
        description: "Failed to submit the agreement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate(`/property/${id}`);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link href={`/property/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Property
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Confidentiality Agreement</h1>
        <ConfidentialityAgreement
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}