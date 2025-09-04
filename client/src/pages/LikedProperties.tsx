import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import PropertyCard from "@/components/PropertyCard";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  imageUrl: string;
  imageUrls?: string[];
  minInvestment: number;
  targetedIRR: number;
  targetedYield: number;
  equityMultiple: number;
  riskFactor?: "low" | "moderate" | "high";
  daysLeft?: number;
  status?: string;
  propertyClass?: string;
  walletAddress?: string;
  squareFeet?: number;
  propertyType?: string;
  totalArea?: number;
  measure?: string;
  pricePerToken?: number;
  totalTokens?: number;
  tokensAvailable?: number;
  propertyValue?: number;
  projectedRentalIncome?: number;
  valueGrowth?: number;
}

export default function LikedProperties() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Save current path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', '/liked-properties');
        setLocation("/account");
        return;
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  const { data: likedProperties = [], isLoading } = useQuery({
    queryKey: ["likedProperties"],
    queryFn: async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        // Get user's liked property IDs from their document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) return [];

        const userData = userDoc.data();
        const likedPropertyIds = userData.likedProperties || [];

        // If there are no liked properties, return empty array
        if (likedPropertyIds.length === 0) return [];

        // Fetch full property details for each liked property ID
        const properties = await Promise.all(
          likedPropertyIds.map(async (propertyId: string) => {
            const propertyDoc = await getDoc(doc(db, "properties", propertyId));
            if (!propertyDoc.exists()) return null;

            const data = propertyDoc.data();
            return {
              id: propertyDoc.id,
              name: data.name || "",
              location: data.location || "",
              type: data.propertyType || "",
              imageUrl: data.imageUrls?.[0] || "",
              imageUrls: data.imageUrls || [],
              minInvestment: Number(data.minInvestment) || 0,
              targetedIRR: Number(data.targetedIRR) || 0,
              targetedYield: Number(data.targetedYield) || 0,
              equityMultiple: Number(data.equityMultiple) || 0,
              riskFactor: data.riskFactor || "moderate",
              daysLeft: Number(data.daysLeft) || 30,
              status: data.status || "Coming Soon",
              propertyClass: data.propertyClass || "A",
              squareFeet: Number(data.squareFeet) || 0,
              propertyType: data.propertyType || "",
              totalArea: Number(data.totalArea) || 0,
              measure: data.measure || "",
              pricePerToken: Number(data.pricePerToken) || 0,
              totalTokens: Number(data.totalTokens) || 0,
              tokensAvailable: Number(data.tokensAvailable) || 0,
              propertyValue: Number(data.propertyValue) || 0,
              walletAddress: data.walletAddress || "",
              projectedRentalIncome: Number(data.projectedRentalIncome) || 0,
              valueGrowth: Number(data.valueGrowth) || 0,
            };
          })
        );

        return properties.filter((p): p is Property => p !== null);
      } catch (error) {
        console.error("Error fetching liked properties:", error);
        throw error;
      }
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Liked Properties</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : likedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {likedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              You haven't liked any properties yet. Browse the marketplace to find properties you're interested in.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}