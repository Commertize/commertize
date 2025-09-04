import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { DropResult } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Trash2,
  Upload,
  LogOut,
  X,
  Plus,
  Minus,
  GripVertical,
  Download,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AdminReports } from "@/components/AdminReports";
import { AdminUsers } from "@/components/AdminUsers";
import { PROPERTY_TYPES, PropertyType } from "@/lib/propertyTypes";
import { AdminInvestments } from "@/components/AdminInvestments";
import { AdminInvestors } from "@/components/AdminInvestors";
import { AdminSponsors } from "@/components/AdminSponsors";
import { AdminNews } from "@/components/AdminNews";
import XManagement from "@/components/XManagement";
import { AdminTransactions } from "@/components/AdminTransactions";
import { AdminOwners } from "@/components/AdminOwners";
import { AdminDashboardStats } from "@/components/AdminDashboardStats";
import { AdminSettings } from "@/components/AdminSettings";
import { AdminPropertyManagement } from "@/components/AdminPropertyManagement";
import AdminSmartContract from "@/components/AdminSmartContract";
import { EnhancedAdminDashboard } from "@/components/EnhancedAdminDashboard";
import { SupportDashboard } from "@/components/SupportDashboard";
import { AdminPlaidBanking } from "@/components/AdminPlaidBanking";
import AdminVoiceCalling from "@/components/AdminVoiceCalling";
import { PROPERTY_STATUS } from "@/lib/propertyStatus";
import LinkedInCollector from "./LinkedInCollector";
import LeadDashboard from "./LeadDashboard";
import LinkedInManagement from "@/components/LinkedInManagement";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Add cellphone fields to the Property interface
export interface Property {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  location: string;
  type: PropertyType;
  imageUrl: string;
  imageUrls?: string[];
  minInvestment: number;
  targetedIRR: number;
  targetedYield: number;
  equityMultiple: number;
  description?: string;
  propertyClass?: string;
  netOperatingIncome?: number;
  squareFeet?: number;
  units?: number;
  targetEquity?: number;
  yearBuilt?: number;
  closingDate?: string;
  pricePerToken?: number;
  targetPeriod?: string;
  featured?: boolean;
  active?: boolean;
  documents?: Array<{
    title: string;
    url: string;
    uploadedAt?: string;
  }>;
  investmentHighlights?: Array<{
    title: string;
    description: string;
  }>;
  mapUrl?: string;
  brochureUrl?: string;
  email?: string;
  countryCode?: string;
  phoneNumber?: string;
  cellCountryCode?: string; // Added cell phone country code
  cellPhoneNumber?: string; // Added cell phone number
  companyName?: string;
  status?: string;
  riskFactor?: "low" | "moderate" | "high";
  symbol?: string;
  walletAddress?: string;
  masterWallet?: string;
  contractData?: string;
  githubSmartContractUrl?: string;
  usdcPayment?: boolean;
  usdPayment?: boolean;
  propertyValue?: number;
  totalTokens?: number;
  tokensAvailable?: number;
  daysLeft?: number;
  // New missing fields
  slug?: string;
  unitLocation?: string;
  searchOnMap?: string;
  typeLocation?: string;
  bedrooms?: number;
  bathrooms?: number;
  totalArea?: number;
  measure?: string;
  propertyType?: string;
  receivingWallet?: string;
  acceptedCurrencies?: string[];
  claimWallet?: string;
  valueGrowth?: number;
  underlyingAssetPrice?: number;
  // New financial fields
  unitCurrency?: string;
  investmentReturn?: number;
  rentalIncomeProjection?: number;
  expectedAnnualReturn?: number;
  estimatedTotalReturnIRR?: number;
  legalCosts?: number;
  registrationTax?: number;
  initialDaoLlcSetupFees?: number;
  realEstateManagement?: number;
  repairReplacementReserve?: number;
  utilities?: number;
  yearlyDaoLlcComplianceFees?: number;
  yearlyDaoFinancialReportingServices?: number;
  propertyInsurance?: number;
  annualDaoAccountingService?: number;
  annualDaoLlcAdministrationFilingFees?: number;
  maintenanceReserve?: number;
  propertyManagement?: number;
  upfrontDaoLlcFees?: number;
  legalFees?: number;
  projectedRentalIncome?: number;
  projectedAnnualIncomeApr?: number;
  // New rental income fields
  projectedGrossRentsAnnual?: number;
  grossRentalIncomeMonthly?: number;
  netMonthlyRentalEarnings?: number;
  annualAdjustedRentalIncome?: number;
  compoundAnnualGrowthRateCAGR?: number;
}

const propertyClasses = ["Class A", "Class B", "Class C"];

// Property types for dropdown
const specificPropertyTypes = [
  "House",
  "Apartment",
  "Condo",
  "Townhouse",
  "Villa",
  "Studio",
  "Loft",
  "Duplex",
  "Penthouse",
  "Office Building",
  "Datacenter",
  "Retail Space",
  "Warehouse",
  "Industrial Building",
  "Shopping Center",
  "Hotel",
  "Resort",
  "Mixed Use",
  "Land",
  "Commercial Complex",
];

// World currencies for dropdown
const worldCurrencies = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "KRW", name: "South Korean Won" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "DKK", name: "Danish Krone" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "ZAR", name: "South African Rand" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "THB", name: "Thai Baht" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "NZD", name: "New Zealand Dollar" },
];

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const { data: properties = [], refetch } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "properties"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Property[];
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      await deleteDoc(doc(db, "properties", propertyId));
      const property = properties.find((p) => p.id === propertyId);
      if (property?.imageUrls) {
        for (const imageUrl of property.imageUrls) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  const updateProperty = useMutation({
    mutationFn: async (property: Property) => {
      const propertyRef = doc(db, "properties", property.id);
      const { id, ...propertyWithoutId } = property;

      // Debug log for propertyValue
      console.log(
        `Updating property ${property.name}: propertyValue = ${property.propertyValue}, type = ${typeof property.propertyValue}`,
      );
      console.log("Full property data being saved:", propertyWithoutId);

      await updateDoc(propertyRef, propertyWithoutId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      setEditingProperty(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (propertyId: string, files: FileList) => {
    setUploadingImages(true);
    try {
      const property = properties.find((p) => p.id === propertyId);
      const newImageUrls = [...(property?.imageUrls || [])];

      for (const file of Array.from(files)) {
        const imageRef = ref(
          storage,
          `properties/${propertyId}/${Date.now()}-${file.name}`,
        );
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);
        newImageUrls.push(imageUrl);
      }

      const propertyRef = doc(db, "properties", propertyId);
      await updateDoc(propertyRef, { imageUrls: newImageUrls });

      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = async (propertyId: string, imageUrl: string) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);

      const property = properties.find((p) => p.id === propertyId);
      if (property) {
        const updatedImageUrls =
          property.imageUrls?.filter((url) => url !== imageUrl) || [];
        const propertyRef = doc(db, "properties", propertyId);
        await updateDoc(propertyRef, { imageUrls: updatedImageUrls });
      }

      toast({
        title: "Success",
        description: "Image removed successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const handleAddDocument = () => {
    if (editingProperty) {
      setEditingProperty({
        ...editingProperty,
        documents: [
          ...(editingProperty.documents || []),
          { title: "", url: "", uploadedAt: new Date().toISOString() },
        ],
      });
    }
  };

  const handleRemoveDocument = (index: number) => {
    if (editingProperty && editingProperty.documents) {
      const newDocs = [...editingProperty.documents];
      newDocs.splice(index, 1);
      setEditingProperty({
        ...editingProperty,
        documents: newDocs,
      });
    }
  };

  const handleAddInvestmentHighlight = () => {
    if (editingProperty) {
      setEditingProperty({
        ...editingProperty,
        investmentHighlights: [
          ...(editingProperty.investmentHighlights || []),
          { title: "", description: "" },
        ],
      });
    }
  };

  const handleRemoveInvestmentHighlight = (index: number) => {
    if (editingProperty && editingProperty.investmentHighlights) {
      const newHighlights = [...editingProperty.investmentHighlights];
      newHighlights.splice(index, 1);
      setEditingProperty({
        ...editingProperty,
        investmentHighlights: newHighlights,
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    setLocation("/admin/login");
  };

  const handleDragEnd = async (propertyId: string, result: DropResult) => {
    if (
      !result.destination ||
      result.source.index === result.destination.index
    ) {
      return;
    }

    const property = properties.find((p) => p.id === propertyId);
    if (!property?.imageUrls) return;

    setReorderingId(propertyId);

    try {
      const newImageUrls = reorder(
        property.imageUrls,
        result.source.index,
        result.destination.index,
      );

      const propertyRef = doc(db, "properties", propertyId);
      await updateDoc(propertyRef, { imageUrls: newImageUrls });

      toast({
        title: "Success",
        description: "Image order updated successfully",
      });

      await refetch();
    } catch (error) {
      console.error("Error reordering images:", error);
      toast({
        title: "Error",
        description: "Failed to update image order",
        variant: "destructive",
      });
    } finally {
      setReorderingId(null);
    }
  };

  const handleDocumentDownload = (url: string, title: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs defaultValue="dashboard" className="flex h-screen font-sans">
        {/* Left Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-600 to-yellow-700">
            <div className="flex items-center space-x-3 mb-3">
              <img 
                src="/assets/commertize-logo.png" 
                alt="Commertize Logo" 
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-200 text-sm mt-1 font-light">Management Portal</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <TabsList className="flex flex-col h-auto p-0 space-y-0 flex-1 bg-transparent">
              
              {/* Dashboard & Analytics Section */}
              <div className="w-full">
                <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Dashboard & Analytics</h3>
                </div>
                <div className="p-3 space-y-2">
                  <TabsTrigger value="enhanced-dashboard" className="w-full justify-start bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-medium shadow-lg hover:from-yellow-700 hover:to-yellow-600 transition-all duration-200 mb-2 rounded-lg px-4 py-3">
                    <span className="mr-3">🚀</span>Enhanced Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">📊</span>Classic Dashboard
                  </TabsTrigger>
                </div>
              </div>

              {/* Property Management Section */}
              <div className="w-full">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Property Management</h3>
                </div>
                <div className="p-3 space-y-2">
                  <TabsTrigger value="properties" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">🏢</span>Properties
                  </TabsTrigger>
                  <TabsTrigger value="property-management" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">⚙️</span>Property Management
                  </TabsTrigger>
                  <TabsTrigger value="smart-contract" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">📋</span>Smart Contract
                  </TabsTrigger>
                </div>
              </div>

              {/* Financial Management Section */}
              <div className="w-full">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Financial Management</h3>
                </div>
                <div className="p-3 space-y-2">
                  <TabsTrigger value="plaid-banking" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">🏦</span>Banking (Plaid)
                  </TabsTrigger>
                  <TabsTrigger value="investments" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">💰</span>Investments
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">💳</span>Transactions
                  </TabsTrigger>
                </div>
              </div>

              {/* User Management Section */}
              <div className="w-full">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">User Management</h3>
                </div>
                <div className="p-3 space-y-2">
                  <TabsTrigger value="users" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">👥</span>Users
                  </TabsTrigger>
                  <TabsTrigger value="investors" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">💼</span>Investors
                  </TabsTrigger>
                  <TabsTrigger value="sponsors" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">🤝</span>Sponsors
                  </TabsTrigger>
                  <TabsTrigger value="owners" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">🏠</span>Owners
                  </TabsTrigger>
                </div>
              </div>

              {/* Content & Marketing Section */}
              <div className="w-full">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Content & Marketing</h3>
                </div>
                <div className="p-3 space-y-2">
                  <TabsTrigger value="news" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">📰</span>News
                  </TabsTrigger>
                  <TabsTrigger value="x-management" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">🐦</span>X Management
                  </TabsTrigger>
                </div>
              </div>

              {/* AI & Automation Section */}
              <div className="w-full">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">AI & Automation</h3>
                </div>
                <div className="p-3 space-y-2">
                  <TabsTrigger value="support-automation" className="w-full justify-start bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-medium shadow-lg hover:from-yellow-700 hover:to-yellow-600 transition-all duration-200 rounded-lg px-4 py-3 mb-2">
                    <span className="mr-3">🎯</span>Support Automation
                  </TabsTrigger>
                  <TabsTrigger value="linkedin-collector" className="w-full justify-start bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium shadow-lg hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 rounded-lg px-4 py-3 mb-2">
                    <span className="mr-3">📧</span>LinkedIn Collector
                  </TabsTrigger>
                  <TabsTrigger value="lead-dashboard" className="w-full justify-start bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium shadow-lg hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 rounded-lg px-4 py-3 mb-2">
                    <span className="mr-3">📞</span>Lead Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="linkedin-management" className="w-full justify-start bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-medium shadow-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200 rounded-lg px-4 py-3">
                    <span className="mr-3">🤖</span>LinkedIn AI
                  </TabsTrigger>
                  <TabsTrigger value="voice-calling" className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium shadow-lg hover:from-purple-600 hover:to-purple-500 transition-all duration-200 rounded-lg px-4 py-3">
                    <span className="mr-3">📞</span>RUNE.CTZ Voice AI
                  </TabsTrigger>
                </div>
              </div>

              {/* System Management Section */}
              <div className="w-full">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">System Management</h3>
                </div>
                <div className="p-3 space-y-2">
                  <TabsTrigger value="reports" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">📈</span>Reports
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="w-full justify-start text-left hover:bg-gray-100 transition-colors rounded-lg px-4 py-3 font-medium">
                    <span className="mr-3">⚙️</span>Settings
                  </TabsTrigger>
                </div>
              </div>

            </TabsList>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="w-full border-gray-300 hover:bg-gray-50 transition-colors rounded-lg py-3 font-medium"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8 max-w-7xl mx-auto">
            <TabsContent value="enhanced-dashboard" className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-50 p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl">
                        <span className="text-white text-xl">🚀</span>
                      </div>
                      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Enhanced Dashboard</h1>
                    </div>
                    <p className="text-gray-600 text-lg font-light">Real-time analytics and comprehensive platform overview</p>
                  </div>
                </div>
                <EnhancedAdminDashboard />
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-50 p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Classic Dashboard</h1>
                    </div>
                    <p className="text-gray-600 text-lg font-light">Traditional dashboard view with key metrics</p>
                  </div>
                </div>
                <AdminDashboardStats />
              </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-50 p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl">
                        <span className="text-white text-xl">🏢</span>
                      </div>
                      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Properties</h1>
                    </div>
                    <p className="text-gray-600 text-lg font-light">Manage your real estate portfolio and property details</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {properties.length} properties total
                  </div>
                </div>
                <DragDropContext
                onDragEnd={(result) => {
                  const propertyId = result.type?.split("-")[1];
                  if (propertyId) {
                    handleDragEnd(propertyId, result);
                  }
                }}
              >
                <div className="grid gap-6">
                  {properties.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <CardTitle>{property.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingProperty?.id === property.id ? (
                      <div className="space-y-6">
                        {/* Property Status Section */}
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold mb-4 text-primary">Property Status</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between space-x-2">
                              <Label
                                htmlFor={`featured-${property.id}`}
                                className={`font-medium ${editingProperty?.featured ? "text-yellow-500" : ""}`}
                              >
                                Featured Property
                              </Label>
                              <Switch
                                id={`featured-${property.id}`}
                                checked={editingProperty.featured || false}
                                onCheckedChange={(checked) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    featured: checked,
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                              <Label
                                htmlFor={`active-${property.id}`}
                                className={`font-medium ${editingProperty?.active ? "text-yellow-500" : ""}`}
                              >
                                Active Property
                              </Label>
                              <Switch
                                id={`active-${property.id}`}
                                checked={editingProperty.active || false}
                                onCheckedChange={(checked) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    active: checked,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contact Information Section */}
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center w-full p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <h3 className="text-lg font-semibold text-primary">Contact Information</h3>
                            <ChevronDown className="h-4 w-4 ml-auto" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                  id="firstName"
                                  value={editingProperty.firstName}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      firstName: e.target.value,
                                    })
                                  }
                                  placeholder="First Name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                  id="lastName"
                                  value={editingProperty.lastName}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      lastName: e.target.value,
                                    })
                                  }
                                  placeholder="Last Name"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="companyName">Company Name</Label>
                              <Input
                                id="companyName"
                                value={editingProperty.companyName || ""}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    companyName: e.target.value,
                                  })
                                }
                                placeholder="Company Name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                value={editingProperty.email || ""}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="Email Address"
                              />
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="countryCode">Country Code</Label>
                                <Input
                                  id="countryCode"
                                  value={editingProperty.countryCode || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      countryCode: e.target.value,
                                    })
                                  }
                                  placeholder="+1"
                                  className="w-20"
                                />
                              </div>
                              <div className="space-y-2 col-span-3">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                  id="phoneNumber"
                                  value={editingProperty.phoneNumber || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      phoneNumber: e.target.value,
                                    })
                                  }
                                  placeholder="Phone Number"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="cellCountryCode">Cell Code</Label>
                                <Input
                                  id="cellCountryCode"
                                  value={editingProperty.cellCountryCode || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      cellCountryCode: e.target.value,
                                    })
                                  }
                                  placeholder="+1"
                                  className="w-20"
                                />
                              </div>
                              <div className="space-y-2 col-span-3">
                                <Label htmlFor="cellPhoneNumber">Cell Phone Number</Label>
                                <Input
                                  id="cellPhoneNumber"
                                  value={editingProperty.cellPhoneNumber || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      cellPhoneNumber: e.target.value,
                                    })
                                  }
                                  placeholder="Cell Phone Number"
                                />
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Property Information Section */}
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center w-full p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <h3 className="text-lg font-semibold text-primary">Property Information</h3>
                            <ChevronDown className="h-4 w-4 ml-auto" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="propertyName">Property Name</Label>
                                <Input
                                  id="propertyName"
                                  value={editingProperty.name}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Property Name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="symbol">Symbol</Label>
                                <Input
                                  id="symbol"
                                  value={editingProperty.symbol || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      symbol: e.target.value,
                                    })
                                  }
                                  placeholder="Property Symbol"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={editingProperty.location}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    location: e.target.value,
                                  })
                                }
                                placeholder="Location"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="slug">Slug (SEO-friendly URL)</Label>
                                <Input
                                  id="slug"
                                  value={editingProperty.slug || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      slug: e.target.value,
                                    })
                                  }
                                  placeholder="property-slug"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="unitLocation">Unit Location</Label>
                                <Input
                                  id="unitLocation"
                                  value={editingProperty.unitLocation || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      unitLocation: e.target.value,
                                    })
                                  }
                                  placeholder="Unit 2A, Building B"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="typeLocation">Type Location</Label>
                                <Input
                                  id="typeLocation"
                                  value={editingProperty.typeLocation || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      typeLocation: e.target.value,
                                    })
                                  }
                                  placeholder="Urban, Suburban, Rural"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="searchOnMap">Search on Map</Label>
                                <Input
                                  id="searchOnMap"
                                  value={editingProperty.searchOnMap || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      searchOnMap: e.target.value,
                                    })
                                  }
                                  placeholder="Exact address for map search"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="propertyType">Property Type</Label>
                                <Select
                                  value={editingProperty.type}
                                  onValueChange={(value) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      type: value as PropertyType,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select property type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.values(PROPERTY_TYPES).map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="propertyClass">Property Class</Label>
                                <Select
                                  value={editingProperty.propertyClass}
                                  onValueChange={(value) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      propertyClass: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select property class" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {propertyClasses.map((cls) => (
                                      <SelectItem key={cls} value={cls}>
                                        {cls}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="propertyStatus">Property Status</Label>
                                <Select
                                  value={editingProperty.status || ""}
                                  onValueChange={(value) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      status: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select property status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.values(PROPERTY_STATUS).map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="riskFactor">Risk Factor</Label>
                                <Select
                                  value={editingProperty.riskFactor || ""}
                                  onValueChange={(value) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      riskFactor: value as
                                        | "low"
                                        | "moderate"
                                        | "high",
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select risk factor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Financial Information Section */}
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center w-full p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <h3 className="text-lg font-semibold text-primary">Financial Information</h3>
                            <ChevronDown className="h-4 w-4 ml-auto" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="minInvestment">Minimum Investment ($)</Label>
                                <Input
                                  id="minInvestment"
                                  type="number"
                                  value={editingProperty.minInvestment}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      minInvestment: Number(e.target.value),
                                    })
                                  }
                                  placeholder="Minimum Investment"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="netOperatingIncome">Net Operating Income ($)</Label>
                                <Input
                                  id="netOperatingIncome"
                                  type="number"
                                  value={editingProperty.netOperatingIncome || 0}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      netOperatingIncome: Number(e.target.value),
                                    })
                                  }
                                  placeholder="Net Operating Income"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="targetedIRR">Targeted IRR (%)</Label>
                                <Input
                                  id="targetedIRR"
                                  type="number"
                                  value={editingProperty.targetedIRR}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      targetedIRR: Number(e.target.value),
                                    })
                                  }
                                  placeholder="12.5"
                                  className="max-w-24"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="targetedYield">Targeted Yield (%)</Label>
                                <Input
                                  id="targetedYield"
                                  type="number"
                                  value={editingProperty.targetedYield}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      targetedYield: Number(e.target.value),
                                    })
                                  }
                                  placeholder="8.5"
                                  className="max-w-24"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="equityMultiple">Equity Multiple</Label>
                                <Input
                                  id="equityMultiple"
                                  type="number"
                                  value={editingProperty.equityMultiple}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      equityMultiple: Number(e.target.value),
                                    })
                                  }
                                  placeholder="1.75"
                                  className="max-w-24"
                                />
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Property Physical Details Section */}
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center w-full p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <h3 className="text-lg font-semibold text-primary">Property Physical Details</h3>
                            <ChevronDown className="h-4 w-4 ml-auto" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                            <div className="space-y-2">
                              <Label>Square Feet (Size)</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  id="squareFeet"
                                  type="number"
                                  value={editingProperty.squareFeet || 0}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      squareFeet: Number(e.target.value),
                                    })
                                  }
                                  placeholder="Size value"
                                />
                                <Select
                                  value={editingProperty.measure || "sqft"}
                                  onValueChange={(value) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      measure: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sqft">Square Feet (sq ft)</SelectItem>
                                    <SelectItem value="sqm">Square Meters (sq m)</SelectItem>
                                    <SelectItem value="ft">Feet (ft)</SelectItem>
                                    <SelectItem value="m">Meters (m)</SelectItem>
                                    <SelectItem value="acres">Acres</SelectItem>
                                    <SelectItem value="hectares">Hectares</SelectItem>
                                    <SelectItem value="sqin">Square Inches (sq in)</SelectItem>
                                    <SelectItem value="sqcm">Square Centimeters (sq cm)</SelectItem>
                                    <SelectItem value="sqkm">Square Kilometers (sq km)</SelectItem>
                                    <SelectItem value="sqyd">Square Yards (sq yd)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="units">Units</Label>
                                <Input
                                  id="units"
                                  type="number"
                                  value={editingProperty.units || 0}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      units: Number(e.target.value),
                                    })
                                  }
                                  placeholder="24"
                                  className="max-w-20"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="yearBuilt">Year Built</Label>
                                <Input
                                  id="yearBuilt"
                                  type="number"
                                  value={editingProperty.yearBuilt || new Date().getFullYear()}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      yearBuilt: Number(e.target.value),
                                    })
                                  }
                                  placeholder="2024"
                                  className="max-w-24"
                                />
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label htmlFor="closingDate">Closing Date</Label>
                                <Input
                                  id="closingDate"
                                  type="date"
                                  value={editingProperty.closingDate || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      closingDate: e.target.value,
                                    })
                                  }
                                  className="max-w-40"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="targetEquity">Target Equity ($)</Label>
                              <Input
                                id="targetEquity"
                                type="number"
                                value={editingProperty.targetEquity || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    targetEquity: Number(e.target.value),
                                  })
                                }
                                placeholder="5,000,000"
                                className="max-w-40"
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Tokenization & Investment Section */}
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center w-full p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <h3 className="text-lg font-semibold text-primary">Tokenization & Investment</h3>
                            <ChevronDown className="h-4 w-4 ml-auto" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="propertyValue">Property Value ($)</Label>
                                <Input
                                  id="propertyValue"
                                  type="number"
                                  value={editingProperty.propertyValue || 0}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      propertyValue: Number(e.target.value),
                                    })
                                  }
                                  placeholder="Property Value"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="pricePerToken">Price Per Token ($)</Label>
                                <Input
                                  id="pricePerToken"
                                  type="number"
                                  value={editingProperty.pricePerToken || 1}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      pricePerToken: Number(e.target.value),
                                    })
                                  }
                                  placeholder="Price Per Token"
                                  step="0.01"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="totalTokens">Total Tokens</Label>
                                <Input
                                  id="totalTokens"
                                  type="number"
                                  value={editingProperty.totalTokens || 0}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      totalTokens: Number(e.target.value),
                                    })
                                  }
                                  placeholder="10000"
                                  className="max-w-32"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="tokensAvailable">Available</Label>
                                <Input
                                  id="tokensAvailable"
                                  type="number"
                                  value={editingProperty.tokensAvailable || 0}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      tokensAvailable: Number(e.target.value),
                                    })
                                  }
                                  placeholder="8500"
                                  className="max-w-32"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="targetPeriod">Target Period</Label>
                                <Input
                                  id="targetPeriod"
                                  value={editingProperty.targetPeriod || ""}
                                  onChange={(e) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      targetPeriod: e.target.value,
                                    })
                                  }
                                  placeholder="5 years"
                                  className="max-w-32"
                                />
                              </div>
                            </div>


                          </CollapsibleContent>
                        </Collapsible>

                        {/* Blockchain Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold border-b pb-2">
                            Blockchain
                          </h3>

                          <div className="space-y-2">
                            <Label htmlFor="walletAddress">
                              Wallet Address (Post-Tokenization)
                            </Label>
                            <Input
                              id="walletAddress"
                              value={editingProperty.walletAddress || ""}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  walletAddress: e.target.value,
                                })
                              }
                              placeholder="Enter blockchain wallet address after tokenization"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="masterWallet">Master Wallet</Label>
                            <Input
                              id="masterWallet"
                              value={editingProperty.masterWallet || ""}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  masterWallet: e.target.value,
                                })
                              }
                              placeholder="Enter master wallet address"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contractData">Contract Data</Label>
                            <Textarea
                              id="contractData"
                              value={editingProperty.contractData || ""}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  contractData: e.target.value,
                                })
                              }
                              placeholder="Enter contract data details"
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="githubSmartContractUrl">
                              Smart Contract GitHub URL
                            </Label>
                            <Input
                              id="githubSmartContractUrl"
                              value={
                                editingProperty.githubSmartContractUrl || ""
                              }
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  githubSmartContractUrl: e.target.value,
                                })
                              }
                              placeholder="https://github.com/..."
                              type="url"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Payment Methods</Label>
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`usdPayment-${property.id}`}
                                  checked={editingProperty.usdPayment || false}
                                  onCheckedChange={(checked) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      usdPayment: checked as boolean,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor={`usdPayment-${property.id}`}
                                  className="text-sm font-medium"
                                >
                                  USD
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`usdcPayment-${property.id}`}
                                  checked={editingProperty.usdcPayment || false}
                                  onCheckedChange={(checked) =>
                                    setEditingProperty({
                                      ...editingProperty,
                                      usdcPayment: checked as boolean,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor={`usdcPayment-${property.id}`}
                                  className="text-sm font-medium"
                                >
                                  USDC
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Residential Details Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold border-b pb-2">
                            Residential Details
                          </h3>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bedrooms">Bedrooms</Label>
                              <Input
                                id="bedrooms"
                                type="number"
                                value={editingProperty.bedrooms || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    bedrooms: Number(e.target.value),
                                  })
                                }
                                placeholder="Number of bedrooms"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="bathrooms">Bathrooms</Label>
                              <Input
                                id="bathrooms"
                                type="number"
                                value={editingProperty.bathrooms || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    bathrooms: Number(e.target.value),
                                  })
                                }
                                placeholder="Number of bathrooms"
                                step="0.5"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="totalArea">Total Area</Label>
                              <Input
                                id="totalArea"
                                type="number"
                                value={editingProperty.totalArea || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    totalArea: Number(e.target.value),
                                  })
                                }
                                placeholder="Total area"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="measure">Measurement Unit</Label>
                              <Select
                                value={editingProperty.measure || "sqft"}
                                onValueChange={(value) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    measure: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select measurement unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sqft">
                                    Square Feet (sqft)
                                  </SelectItem>
                                  <SelectItem value="sqm">
                                    Square Meters (sqm)
                                  </SelectItem>
                                  <SelectItem value="acres">Acres</SelectItem>
                                  <SelectItem value="hectares">
                                    Hectares
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="propertyType">
                              Property Type (House, etc.)
                            </Label>
                            <Select
                              value={editingProperty.propertyType || ""}
                              onValueChange={(value) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  propertyType: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                {specificPropertyTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Blockchain Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold border-b pb-2">
                            Blockchain
                          </h3>

                          <div className="space-y-2">
                            <Label htmlFor="receivingWallet">
                              Receiving Wallet
                            </Label>
                            <Input
                              id="receivingWallet"
                              value={editingProperty.receivingWallet || ""}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  receivingWallet: e.target.value,
                                })
                              }
                              placeholder="0x..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="claimWallet">Claim Wallet</Label>
                            <Input
                              id="claimWallet"
                              value={editingProperty.claimWallet || ""}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  claimWallet: e.target.value,
                                })
                              }
                              placeholder="0x..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Accepted Currencies</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="usdt"
                                  checked={
                                    editingProperty.acceptedCurrencies?.includes(
                                      "USDT",
                                    ) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const currencies =
                                      editingProperty.acceptedCurrencies || [];
                                    if (checked) {
                                      setEditingProperty({
                                        ...editingProperty,
                                        acceptedCurrencies: [
                                          ...currencies.filter(
                                            (c) => c !== "USDT",
                                          ),
                                          "USDT",
                                        ],
                                      });
                                    } else {
                                      setEditingProperty({
                                        ...editingProperty,
                                        acceptedCurrencies: currencies.filter(
                                          (c) => c !== "USDT",
                                        ),
                                      });
                                    }
                                  }}
                                />
                                <Label htmlFor="usdt">USDT</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="usdc"
                                  checked={
                                    editingProperty.acceptedCurrencies?.includes(
                                      "USDC",
                                    ) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const currencies =
                                      editingProperty.acceptedCurrencies || [];
                                    if (checked) {
                                      setEditingProperty({
                                        ...editingProperty,
                                        acceptedCurrencies: [
                                          ...currencies.filter(
                                            (c) => c !== "USDC",
                                          ),
                                          "USDC",
                                        ],
                                      });
                                    } else {
                                      setEditingProperty({
                                        ...editingProperty,
                                        acceptedCurrencies: currencies.filter(
                                          (c) => c !== "USDC",
                                        ),
                                      });
                                    }
                                  }}
                                />
                                <Label htmlFor="usdc">USDC</Label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financial Details Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold border-b pb-2">
                            Financial Details
                          </h3>

                          <div className="space-y-2">
                            <Label htmlFor="unitCurrency">Unit Currency</Label>
                            <Select
                              value={editingProperty.unitCurrency || "USD"}
                              onValueChange={(value) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  unitCurrency: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {worldCurrencies.map((currency) => (
                                  <SelectItem
                                    key={currency.code}
                                    value={currency.code}
                                  >
                                    {currency.code} - {currency.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="valueGrowth">
                                Value Growth (%)
                              </Label>
                              <Input
                                id="valueGrowth"
                                type="number"
                                value={editingProperty.valueGrowth || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    valueGrowth: Number(e.target.value),
                                  })
                                }
                                placeholder="Projected value growth"
                                step="0.01"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="underlyingAssetPrice">
                                Underlying Asset Price ($)
                              </Label>
                              <Input
                                id="underlyingAssetPrice"
                                type="number"
                                value={
                                  editingProperty.underlyingAssetPrice || 0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    underlyingAssetPrice: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Underlying asset price"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="investmentReturn">
                                Investment Return (%)
                              </Label>
                              <Input
                                id="investmentReturn"
                                type="number"
                                value={editingProperty.investmentReturn || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    investmentReturn: Number(e.target.value),
                                  })
                                }
                                placeholder="Investment Return"
                                step="0.01"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="rentalIncomeProjection">
                                Rental Income Projection ($)
                              </Label>
                              <Input
                                id="rentalIncomeProjection"
                                type="number"
                                value={
                                  editingProperty.rentalIncomeProjection || 0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    rentalIncomeProjection: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Rental Income Projection"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expectedAnnualReturn">
                                Expected Annual Return (%)
                              </Label>
                              <Input
                                id="expectedAnnualReturn"
                                type="number"
                                value={
                                  editingProperty.expectedAnnualReturn || 0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    expectedAnnualReturn: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Expected Annual Return"
                                step="0.01"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="estimatedTotalReturnIRR">
                                Estimated Total Return (IRR) (%)
                              </Label>
                              <Input
                                id="estimatedTotalReturnIRR"
                                type="number"
                                value={
                                  editingProperty.estimatedTotalReturnIRR || 0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    estimatedTotalReturnIRR: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Estimated Total Return (IRR)"
                                step="0.01"
                              />
                            </div>
                          </div>

                          <h4 className="text-md font-semibold mt-6 mb-4">
                            Costs & Fees
                          </h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="legalCosts">
                                Legal Costs ($)
                              </Label>
                              <Input
                                id="legalCosts"
                                type="number"
                                value={editingProperty.legalCosts || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    legalCosts: Number(e.target.value),
                                  })
                                }
                                placeholder="Legal Costs"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="registrationTax">
                                Registration Tax ($)
                              </Label>
                              <Input
                                id="registrationTax"
                                type="number"
                                value={editingProperty.registrationTax || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    registrationTax: Number(e.target.value),
                                  })
                                }
                                placeholder="Registration Tax"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="initialDaoLlcSetupFees">
                                Initial DAO LLC Setup Fees ($)
                              </Label>
                              <Input
                                id="initialDaoLlcSetupFees"
                                type="number"
                                value={
                                  editingProperty.initialDaoLlcSetupFees || 0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    initialDaoLlcSetupFees: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Initial DAO LLC Setup Fees"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="realEstateManagement">
                                Real Estate Management ($)
                              </Label>
                              <Input
                                id="realEstateManagement"
                                type="number"
                                value={
                                  editingProperty.realEstateManagement || 0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    realEstateManagement: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Real Estate Management"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="repairReplacementReserve">
                                Repair & Replacement Reserve ($)
                              </Label>
                              <Input
                                id="repairReplacementReserve"
                                type="number"
                                value={
                                  editingProperty.repairReplacementReserve || 0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    repairReplacementReserve: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Repair & Replacement Reserve"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="utilities">Utilities ($)</Label>
                              <Input
                                id="utilities"
                                type="number"
                                value={editingProperty.utilities || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    utilities: Number(e.target.value),
                                  })
                                }
                                placeholder="Utilities"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="yearlyDaoLlcComplianceFees">
                                Yearly DAO LLC Compliance Fees ($)
                              </Label>
                              <Input
                                id="yearlyDaoLlcComplianceFees"
                                type="number"
                                value={
                                  editingProperty.yearlyDaoLlcComplianceFees ||
                                  0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    yearlyDaoLlcComplianceFees: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Yearly DAO LLC Compliance Fees"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="yearlyDaoFinancialReportingServices">
                                Yearly DAO Financial Reporting Services ($)
                              </Label>
                              <Input
                                id="yearlyDaoFinancialReportingServices"
                                type="number"
                                value={
                                  editingProperty.yearlyDaoFinancialReportingServices ||
                                  0
                                }
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    yearlyDaoFinancialReportingServices: Number(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="Yearly DAO Financial Reporting Services"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="propertyInsurance">
                              Property Insurance ($)
                            </Label>
                            <Input
                              id="propertyInsurance"
                              type="number"
                              value={editingProperty.propertyInsurance || 0}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  propertyInsurance: Number(e.target.value),
                                })
                              }
                              placeholder="Property Insurance"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="annualDaoAccountingService">
                              Annual DAO Accounting Service ($)
                            </Label>
                            <Input
                              id="annualDaoAccountingService"
                              type="number"
                              value={
                                editingProperty.annualDaoAccountingService || 0
                              }
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  annualDaoAccountingService: Number(
                                    e.target.value,
                                  ),
                                })
                              }
                              placeholder="Annual DAO Accounting Service"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="annualDaoLlcAdministrationFilingFees">
                              Annual DAO LLC Administration and Filing Fees ($)
                            </Label>
                            <Input
                              id="annualDaoLlcAdministrationFilingFees"
                              type="number"
                              value={
                                editingProperty.annualDaoLlcAdministrationFilingFees ||
                                0
                              }
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  annualDaoLlcAdministrationFilingFees: Number(
                                    e.target.value,
                                  ),
                                })
                              }
                              placeholder="Annual DAO LLC Administration and Filing Fees"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="maintenanceReserve">
                              Maintenance Reserve ($)
                            </Label>
                            <Input
                              id="maintenanceReserve"
                              type="number"
                              value={editingProperty.maintenanceReserve || 0}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  maintenanceReserve: Number(e.target.value),
                                })
                              }
                              placeholder="Maintenance Reserve"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="propertyManagement">
                              Property Management ($)
                            </Label>
                            <Input
                              id="propertyManagement"
                              type="number"
                              value={editingProperty.propertyManagement || 0}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  propertyManagement: Number(e.target.value),
                                })
                              }
                              placeholder="Property Management"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="upfrontDaoLlcFees">
                              Upfront DAO LLC Fees ($)
                            </Label>
                            <Input
                              id="upfrontDaoLlcFees"
                              type="number"
                              value={editingProperty.upfrontDaoLlcFees || 0}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  upfrontDaoLlcFees: Number(e.target.value),
                                })
                              }
                              placeholder="Upfront DAO LLC Fees"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="legalFees">Legal Fees ($)</Label>
                            <Input
                              id="legalFees"
                              type="number"
                              value={editingProperty.legalFees || 0}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  legalFees: Number(e.target.value),
                                })
                              }
                              placeholder="Legal Fees"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="projectedRentalIncome">
                              Projected Rental Income ($)
                            </Label>
                            <Input
                              id="projectedRentalIncome"
                              type="number"
                              value={editingProperty.projectedRentalIncome || 0}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  projectedRentalIncome: Number(e.target.value),
                                })
                              }
                              placeholder="Projected Rental Income"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="projectedAnnualIncomeApr">
                              Projected Annual Income (APR) (%)
                            </Label>
                            <Input
                              id="projectedAnnualIncomeApr"
                              type="number"
                              step="0.01"
                              value={
                                editingProperty.projectedAnnualIncomeApr || 0
                              }
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  projectedAnnualIncomeApr: Number(
                                    e.target.value,
                                  ),
                                })
                              }
                              placeholder="Projected Annual Income (APR)"
                            />
                          </div>

                          <h4 className="text-md font-semibold mt-6 mb-4">
                            Rental Income Details
                          </h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="projectedGrossRentsAnnual">
                                Projected Gross Rents (Annual) ($)
                              </Label>
                              <Input
                                id="projectedGrossRentsAnnual"
                                type="number"
                                value={editingProperty.projectedGrossRentsAnnual || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    projectedGrossRentsAnnual: Number(e.target.value),
                                  })
                                }
                                placeholder="Projected Gross Rents (Annual)"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="grossRentalIncomeMonthly">
                                Gross Rental Income (Monthly) ($)
                              </Label>
                              <Input
                                id="grossRentalIncomeMonthly"
                                type="number"
                                value={editingProperty.grossRentalIncomeMonthly || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    grossRentalIncomeMonthly: Number(e.target.value),
                                  })
                                }
                                placeholder="Gross Rental Income (Monthly)"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="netMonthlyRentalEarnings">
                                Net Monthly Rental Earnings ($)
                              </Label>
                              <Input
                                id="netMonthlyRentalEarnings"
                                type="number"
                                value={editingProperty.netMonthlyRentalEarnings || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    netMonthlyRentalEarnings: Number(e.target.value),
                                  })
                                }
                                placeholder="Net Monthly Rental Earnings"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="annualAdjustedRentalIncome">
                                Annual Adjusted Rental Income ($)
                              </Label>
                              <Input
                                id="annualAdjustedRentalIncome"
                                type="number"
                                value={editingProperty.annualAdjustedRentalIncome || 0}
                                onChange={(e) =>
                                  setEditingProperty({
                                    ...editingProperty,
                                    annualAdjustedRentalIncome: Number(e.target.value),
                                  })
                                }
                                placeholder="Annual Adjusted Rental Income"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="compoundAnnualGrowthRateCAGR">
                              Compound Annual Growth Rate (CAGR) (%)
                            </Label>
                            <Input
                              id="compoundAnnualGrowthRateCAGR"
                              type="number"
                              step="0.01"
                              value={editingProperty.compoundAnnualGrowthRateCAGR || 0}
                              onChange={(e) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  compoundAnnualGrowthRateCAGR: Number(e.target.value),
                                })
                              }
                              placeholder="Compound Annual Growth Rate (CAGR)"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <div className="min-h-[400px]">
                            <ReactQuill
                              value={editingProperty.description || ""}
                              onChange={(content) =>
                                setEditingProperty({
                                  ...editingProperty,
                                  description: content,
                                })
                              }
                              placeholder="Enter rich text description..."
                              style={{ height: "350px", marginBottom: "50px" }}
                              modules={{
                                toolbar: [
                                  [{ header: [1, 2, 3, false] }],
                                  ["bold", "italic", "underline", "strike"],
                                  [{ color: [] }, { background: [] }],
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  [{ indent: "-1" }, { indent: "+1" }],
                                  ["link", "image"],
                                  ["clean"],
                                ],
                              }}
                              formats={[
                                "header",
                                "bold",
                                "italic",
                                "underline",
                                "strike",
                                "color",
                                "background",
                                "list",
                                "bullet",
                                "indent",
                                "link",
                                "image",
                              ]}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mapUrl">Map URL</Label>
                          <Input
                            id="mapUrl"
                            value={editingProperty.mapUrl || ""}
                            onChange={(e) =>
                              setEditingProperty({
                                ...editingProperty,
                                mapUrl: e.target.value,
                              })
                            }
                            placeholder="Map URL"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="brochureUrl">Brochure URL</Label>
                          <Input
                            id="brochureUrl"
                            value={editingProperty.brochureUrl || ""}
                            onChange={(e) =>
                              setEditingProperty({
                                ...editingProperty,
                                brochureUrl: e.target.value,
                              })
                            }
                            placeholder="Brochure URL"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label>Documents</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddDocument}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Document
                            </Button>
                          </div>
                          {editingProperty.documents?.map((doc, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="space-y-2 flex-1">
                                <Label>Document Title</Label>
                                <Input
                                  value={doc.title}
                                  onChange={(e) => {
                                    const newDocs = [
                                      ...(editingProperty.documents || []),
                                    ];
                                    newDocs[index] = {
                                      ...doc,
                                      title: e.target.value,
                                    };
                                    setEditingProperty({
                                      ...editingProperty,
                                      documents: newDocs,
                                    });
                                  }}
                                  placeholder="Document Title"
                                />
                              </div>
                              <div className="space-y-2 flex-1">
                                <Label>Document URL</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={doc.url}
                                    onChange={(e) => {
                                      const newDocs = [
                                        ...(editingProperty.documents || []),
                                      ];
                                      newDocs[index] = {
                                        ...doc,
                                        url: e.target.value,
                                      };
                                      setEditingProperty({
                                        ...editingProperty,
                                        documents: newDocs,
                                      });
                                    }}
                                    placeholder="Document URL"
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                      {doc.uploadedAt
                                        ? new Date(
                                            doc.uploadedAt,
                                          ).toLocaleDateString()
                                        : ""}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDocumentDownload(
                                          doc.url,
                                          doc.title,
                                        )
                                      }
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemoveDocument(index)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label>Investment Highlights</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddInvestmentHighlight}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Highlight
                            </Button>
                          </div>
                          {editingProperty.investmentHighlights?.map(
                            (highlight, index) => (
                              <div key={index} className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                  <Label>Title</Label>
                                  <Input
                                    value={highlight.title}
                                    onChange={(e) => {
                                      const newHighlights = [
                                        ...(editingProperty.investmentHighlights ||
                                          []),
                                      ];
                                      newHighlights[index] = {
                                        ...highlight,
                                        title: e.target.value,
                                      };
                                      setEditingProperty({
                                        ...editingProperty,
                                        investmentHighlights: newHighlights,
                                      });
                                    }}
                                    placeholder="Highlight Title"
                                  />
                                </div>
                                <div className="space-y-2 flex-1">
                                  <Label>Description</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={highlight.description}
                                      onChange={(e) => {
                                        const newHighlights = [
                                          ...(editingProperty.investmentHighlights ||
                                            []),
                                        ];
                                        newHighlights[index] = {
                                          ...highlight,
                                          description: e.target.value,
                                        };
                                        setEditingProperty({
                                          ...editingProperty,
                                          investmentHighlights: newHighlights,
                                        });
                                      }}
                                      placeholder="Highlight Description"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() =>
                                        handleRemoveInvestmentHighlight(index)
                                      }
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => setEditingProperty(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() =>
                              updateProperty.mutate(editingProperty)
                            }
                            disabled={updateProperty.isPending}
                          >
                            {updateProperty.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              'Publish'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Featured:</span>{" "}
                            <span
                              className={
                                property.featured
                                  ? "text-yellow-500"
                                  : "text-muted-foreground"
                              }
                            >
                              {property.featured ? "Yes" : "No"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Active:</span>{" "}
                            <span
                              className={
                                property.active
                                  ? "text-yellow-500"
                                  : "text-muted-foreground"
                              }
                            >
                              {property.active ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                        <p>
                          <strong>Submitter:</strong> {property.firstName}{" "}
                          {property.lastName}
                        </p>
                        <p>
                          <strong>Property Name:</strong> {property.name}
                        </p>
                        <p>
                          <strong>Symbol:</strong> {property.symbol}
                        </p>{" "}
                        {/* Added Symbol */}
                        <p>
                          <strong>Contact Email:</strong> {property.email}
                        </p>
                        <p>
                          <strong>Contact Phone:</strong> {property.countryCode}{" "}
                          {property.phoneNumber}
                        </p>
                        <p>
                          <strong>Cell Phone:</strong>{" "}
                          {property.cellCountryCode} {property.cellPhoneNumber}
                        </p>{" "}
                        {/* Added Cell Phone */}
                        <p>
                          <strong>Company Name:</strong> {property.companyName}
                        </p>{" "}
                        {/* Added Company Name */}
                        <p>
                          <strong>Location:</strong> {property.location}
                        </p>
                        <p>
                          <strong>Slug:</strong> {property.slug || "Not set"}
                        </p>
                        <p>
                          <strong>Unit Location:</strong>{" "}
                          {property.unitLocation || "Not specified"}
                        </p>
                        <p>
                          <strong>Type Location:</strong>{" "}
                          {property.typeLocation || "Not specified"}
                        </p>
                        <p>
                          <strong>Search on Map:</strong>{" "}
                          {property.searchOnMap || "Not set"}
                        </p>
                        <p>
                          <strong>Type:</strong> {property.type}
                        </p>
                        <p>
                          <strong>Property Class:</strong>{" "}
                          {property.propertyClass || "Not specified"}
                        </p>
                        <p>
                          <strong>Property Type:</strong>{" "}
                          {property.propertyType || "Not specified"}
                        </p>
                        <p>
                          <strong>Minimum Investment:</strong> $
                          {property.minInvestment?.toLocaleString()}
                        </p>
                        <p>
                          <strong>Targeted IRR:</strong> {property.targetedIRR}%
                        </p>
                        <p>
                          <strong>Targeted Yield:</strong>{" "}
                          {property.targetedYield}%
                        </p>
                        <p>
                          <strong>Equity Multiple:</strong>{" "}
                          {property.equityMultiple}x
                        </p>
                        <p>
                          <strong>Net Operating Income:</strong> $
                          {property.netOperatingIncome?.toLocaleString()}
                        </p>
                        <p>
                          <strong>Square Feet:</strong>{" "}
                          {property.squareFeet?.toLocaleString()}
                        </p>
                        <p>
                          <strong>Units:</strong> {property.units}
                        </p>
                        <p>
                          <strong>Target Equity:</strong> $
                          {property.targetEquity?.toLocaleString()}
                        </p>
                        <p>
                          <strong>Year Built:</strong> {property.yearBuilt}
                        </p>
                        <p>
                          <strong>Bedrooms:</strong>{" "}
                          {property.bedrooms || "Not specified"}
                        </p>
                        <p>
                          <strong>Bathrooms:</strong>{" "}
                          {property.bathrooms || "Not specified"}
                        </p>
                        <p>
                          <strong>Total Area:</strong>{" "}
                          {property.totalArea
                            ? `${property.totalArea.toLocaleString()} ${property.measure || "sqft"}`
                            : "Not specified"}
                        </p>
                        <p>
                          <strong>Closing Date:</strong>{" "}
                          {property.closingDate
                            ? new Date(
                                property.closingDate,
                              ).toLocaleDateString()
                            : "Not specified"}
                        </p>
                        <p>
                          <strong>Price Per Token:</strong> $
                          {property.pricePerToken}
                        </p>
                        <p>
                          <strong>Target Period:</strong>{" "}
                          {property.targetPeriod}
                        </p>
                        <p>
                          <strong>Property Value:</strong> $
                          {property.propertyValue?.toLocaleString() ||
                            "Not set"}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          {property.status || "Pending"}
                        </p>
                        <p>
                          <strong>Risk Factor:</strong>{" "}
                          {property.riskFactor ? (
                            <span
                              className={
                                property.riskFactor === "high"
                                  ? "text-red-500"
                                  : property.riskFactor === "moderate"
                                    ? "text-yellow-500"
                                    : "text-yellow-500"
                              }
                            >
                              {property.riskFactor.charAt(0).toUpperCase() +
                                property.riskFactor.slice(1)}
                            </span>
                          ) : (
                            "Not specified"
                          )}
                        </p>
                        <p>
                          <strong>Wallet Address:</strong>{" "}
                          {property.walletAddress ? (
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {property.walletAddress}
                            </span>
                          ) : (
                            "Not set"
                          )}
                        </p>
                        <p>
                          <strong>Receiving Wallet:</strong>{" "}
                          {property.receivingWallet ? (
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {property.receivingWallet}
                            </span>
                          ) : (
                            "Not set"
                          )}
                        </p>
                        <p>
                          <strong>Claim Wallet:</strong>{" "}
                          {property.claimWallet ? (
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {property.claimWallet}
                            </span>
                          ) : (
                            "Not set"
                          )}
                        </p>
                        <p>
                          <strong>Accepted Currencies:</strong>{" "}
                          {property.acceptedCurrencies?.length
                            ? property.acceptedCurrencies.join(", ")
                            : "Not set"}
                        </p>
                        {/* Financial Details Display */}
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                          <h3 className="font-semibold mb-4 text-lg">
                            Financial Details
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p>
                                <strong>Unit Currency:</strong>{" "}
                                {property.unitCurrency || "USD"}
                              </p>
                              <p>
                                <strong>Value Growth:</strong>{" "}
                                {property.valueGrowth
                                  ? `${property.valueGrowth}%`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Underlying Asset Price:</strong>{" "}
                                {property.underlyingAssetPrice
                                  ? `$${property.underlyingAssetPrice.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Investment Return:</strong>{" "}
                                {property.investmentReturn
                                  ? `${property.investmentReturn}%`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Rental Income Projection:</strong>{" "}
                                {property.rentalIncomeProjection
                                  ? `$${property.rentalIncomeProjection.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Expected Annual Return:</strong>{" "}
                                {property.expectedAnnualReturn
                                  ? `${property.expectedAnnualReturn}%`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Estimated Total Return (IRR):</strong>{" "}
                                {property.estimatedTotalReturnIRR
                                  ? `${property.estimatedTotalReturnIRR}%`
                                  : "Not set"}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Legal Costs:</strong>{" "}
                                {property.legalCosts
                                  ? `$${property.legalCosts.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Registration Tax:</strong>{" "}
                                {property.registrationTax
                                  ? `$${property.registrationTax.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Initial DAO LLC Setup:</strong>{" "}
                                {property.initialDaoLlcSetupFees
                                  ? `$${property.initialDaoLlcSetupFees.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Real Estate Management:</strong>{" "}
                                {property.realEstateManagement
                                  ? `$${property.realEstateManagement.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Repair & Replacement Reserve:</strong>{" "}
                                {property.repairReplacementReserve
                                  ? `$${property.repairReplacementReserve.toLocaleString()}`
                                  : "Not set"}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p>
                                <strong>Utilities:</strong>{" "}
                                {property.utilities
                                  ? `$${property.utilities.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Yearly DAO LLC Compliance:</strong>{" "}
                                {property.yearlyDaoLlcComplianceFees
                                  ? `$${property.yearlyDaoLlcComplianceFees.toLocaleString()}`
                                  : "Not set"}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Yearly Financial Reporting:</strong>{" "}
                                {property.yearlyDaoFinancialReportingServices
                                  ? `$${property.yearlyDaoFinancialReportingServices.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Property Insurance:</strong>{" "}
                                {property.propertyInsurance
                                  ? `$${property.propertyInsurance.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Annual DAO Accounting Service:</strong>{" "}
                                {property.annualDaoAccountingService
                                  ? `$${property.annualDaoAccountingService.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>
                                  Annual DAO LLC Administration and Filing Fees:
                                </strong>{" "}
                                {property.annualDaoLlcAdministrationFilingFees
                                  ? `$${property.annualDaoLlcAdministrationFilingFees.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Maintenance Reserve:</strong>{" "}
                                {property.maintenanceReserve
                                  ? `$${property.maintenanceReserve.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Property Management:</strong>{" "}
                                {property.propertyManagement
                                  ? `$${property.propertyManagement.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Upfront DAO LLC Fees:</strong>{" "}
                                {property.upfrontDaoLlcFees
                                  ? `$${property.upfrontDaoLlcFees.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Legal Fees:</strong>{" "}
                                {property.legalFees
                                  ? `$${property.legalFees.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Projected Rental Income:</strong>{" "}
                                {property.projectedRentalIncome
                                  ? `$${property.projectedRentalIncome.toLocaleString()}`
                                  : "Not set"}
                              </p>
                              <p>
                                <strong>Projected Annual Income (APR):</strong>{" "}
                                {property.projectedAnnualIncomeApr
                                  ? `${property.projectedAnnualIncomeApr}%`
                                  : "Not set"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-background border rounded-lg">
                            <h4 className="font-semibold mb-3 text-md">
                              Rental Income Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p>
                                  <strong>Projected Gross Rents (Annual):</strong>{" "}
                                  {property.projectedGrossRentsAnnual
                                    ? `$${property.projectedGrossRentsAnnual.toLocaleString()}`
                                    : "Not set"}
                                </p>
                                <p>
                                  <strong>Gross Rental Income (Monthly):</strong>{" "}
                                  {property.grossRentalIncomeMonthly
                                    ? `$${property.grossRentalIncomeMonthly.toLocaleString()}`
                                    : "Not set"}
                                </p>
                                <p>
                                  <strong>Net Monthly Rental Earnings:</strong>{" "}
                                  {property.netMonthlyRentalEarnings
                                    ? `$${property.netMonthlyRentalEarnings.toLocaleString()}`
                                    : "Not set"}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Annual Adjusted Rental Income:</strong>{" "}
                                  {property.annualAdjustedRentalIncome
                                    ? `$${property.annualAdjustedRentalIncome.toLocaleString()}`
                                    : "Not set"}
                                </p>
                                <p>
                                  <strong>Compound Annual Growth Rate (CAGR):</strong>{" "}
                                  {property.compoundAnnualGrowthRateCAGR
                                    ? `${property.compoundAnnualGrowthRateCAGR}%`
                                    : "Not set"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {property.description && (
                          <p>
                            <strong>Description:</strong> {property.description}
                          </p>
                        )}
                        {property.documents &&
                          property.documents.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-semibold">Documents</h3>
                              <div className="grid gap-2">
                                {property.documents.map((doc, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                                  >
                                    <span className="truncate max-w-[60%]">
                                      {doc.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        {doc.uploadedAt
                                          ? new Date(
                                              doc.uploadedAt,
                                            ).toLocaleDateString()
                                          : ""}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDocumentDownload(
                                            doc.url,
                                            doc.title,
                                          )
                                        }
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        {property.imageUrls &&
                          property.imageUrls.length > 0 && (
                            <Droppable
                              droppableId={`images-${property.id}`}
                              direction="horizontal"
                              type={`images-${property.id}`}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="flex flex-wrap gap-4 mt-4 p-4 bg-muted rounded-lg relative min-h-[200px]"
                                >
                                  {reorderingId === property.id && (
                                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
                                      <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                  )}

                                  {property.imageUrls?.map((url, index) => (
                                    <Draggable
                                      key={`${property.id}-${index}`}
                                      draggableId={`${property.id}-${index}`}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`
                                          relative group w-[200px] transition-all duration-200
                                          ${snapshot.isDragging ? "z-50 scale-105 shadow-xl rotate-2" : ""}
                                        `}
                                        >
                                          <div
                                            className="
                                            absolute top-2 left-2 p-2 bg-black/50 rounded-full 
                                            text-white cursor-move z-10 hover:bg-black/70
                                            opacity-100 transition-colors
                                          "
                                          >
                                            <GripVertical className="h-4 w-4" />
                                          </div>

                                          <img
                                            src={url}
                                            alt={`${property.name} ${index + 1}`}
                                            className={`
                                            w-full h-32 object-cover rounded-lg border-2
                                            ${snapshot.isDragging ? "border-primary" : "border-transparent"}
                                          `}
                                          />

                                          <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() =>
                                              handleRemoveImage(
                                                property.id,
                                                url,
                                              )
                                            }
                                          >
                                            <X className="h-4 w-4" />{" "}
                                          </Button>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}
                        <div className="flex gap-2 mt-4">
                          <Button onClick={() => setEditingProperty(property)}>
                            Edit Property
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteProperty.mutate(property.id)}
                            disabled={deleteProperty.isPending}
                          >
                            {deleteProperty.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete Property
                          </Button>
                          <div className="relative">
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                className="w-full"
                                disabled={uploadingImages}
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.multiple = true;
                                  input.accept = "image/*";
                                  input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement)
                                      .files;
                                    if (files) {
                                      handleImageUpload(property.id, files);
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                {uploadingImages ? (
                                  <Loader2 className="mr-2 h-4w-4 animate-spin" />
                                ) : (
                                  <Upload className="mr-2 h-4 w-4" />
                                )}
                                Add Images
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                      ))}
                </div>
              </DragDropContext>
              </div>
            </TabsContent>

            <TabsContent value="property-management">
              <AdminPropertyManagement properties={properties} refetch={refetch} />
            </TabsContent>

            <TabsContent value="smart-contract">
              <AdminSmartContract />
            </TabsContent>


            <TabsContent value="users" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">👥 User Management</h1>
                    <p className="text-gray-600 mt-1">Manage all platform users and their permissions</p>
                  </div>
                </div>
                <AdminUsers />
              </div>
            </TabsContent>

            <TabsContent value="plaid-banking" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">🏦 Banking Management (Plaid)</h1>
                    <p className="text-gray-600 mt-1">Comprehensive banking integration and user account management</p>
                  </div>
                </div>
                <AdminPlaidBanking />
              </div>
            </TabsContent>

            <TabsContent value="investments" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">💰 Investments</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage all investment activities</p>
                  </div>
                </div>
                <AdminInvestments />
              </div>
            </TabsContent>

            <TabsContent value="investors">
              <AdminInvestors />
            </TabsContent>

            <TabsContent value="sponsors">
              <AdminSponsors />
            </TabsContent>

            <TabsContent value="transactions">
              <AdminTransactions />
            </TabsContent>

            <TabsContent value="owners">
              <AdminOwners />
            </TabsContent>

            <TabsContent value="news">
              <AdminNews />
            </TabsContent>

            <TabsContent value="x-management" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">🐦 X Management</h1>
                    <p className="text-gray-600 mt-1">Manage social media presence and content automation</p>
                  </div>
                </div>
                <XManagement />
              </div>
            </TabsContent>

            <TabsContent value="support-automation" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">🎯 Support Automation</h1>
                    <p className="text-gray-600 mt-1">AI-powered customer support and automated assistance</p>
                  </div>
                </div>
                <SupportDashboard />
              </div>
            </TabsContent>

            <TabsContent value="linkedin-collector" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">📧 LinkedIn Collector</h1>
                    <p className="text-gray-600 mt-1">Automated LinkedIn contact collection and lead generation</p>
                  </div>
                </div>
                <LinkedInCollector />
              </div>
            </TabsContent>

            <TabsContent value="lead-dashboard">
              <LeadDashboard />
            </TabsContent>

            <TabsContent value="linkedin-management">
              <LinkedInManagement />
            </TabsContent>

            <TabsContent value="voice-calling">
              <AdminVoiceCalling />
            </TabsContent>

            <TabsContent value="reports">
              <AdminReports properties={properties} />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettings />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
