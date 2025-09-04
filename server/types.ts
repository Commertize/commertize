export interface Property {
  id?: string;
  name: string;
  location: string;
  propertyType: string;
  description?: string;
  minInvestment: number;
  targetedIRR: number;
  targetedYield: number;
  equityMultiple: number;
  imageUrls?: string[];
  createdAt?: Date;
  email: string;
  countryCode: string;
  phoneNumber: string;
  featured?: boolean; // Added featured flag
  status?: string; // Added status field
}