import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import DOMPurify from "dompurify";
import { addDoc, collection } from "firebase/firestore";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle, InfoIcon, DollarSign, Coins, TrendingUp, Users, FileText, BarChart3, Shield, CheckCircle, Wallet, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPropertyTypeForDisplay } from "@/lib/propertyTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RobustImage } from "@/components/RobustImage";
import FinanceCalculator from "@/components/FinanceCalculator";
import DealQualityIndex from "@/components/DealQualityIndex";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRuneQuery, useRuneScenarios, useRuneDocumentQA } from "@/hooks/useRune";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import LeaseAnalysis from "@/components/LeaseAnalysis";
import ExpenseBenchmarking from "@/components/ExpenseBenchmarking";
import MarketLocationIntelligence from "@/components/MarketLocationIntelligence";
import InvestmentCalculator from "@/components/InvestmentCalculator";
import PlaidLink from "@/components/PlaidLink";
import PropertyChatbot from "@/components/PropertyChatbot";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

interface ExtendedProperty {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  location: string;
  type: string;
  propertyClass: string;
  imageUrl: string;
  imageUrls?: string[];
  minInvestment: number;
  targetedIRR: number;
  targetedYield: number;
  equityMultiple: number;
  netOperatingIncome: number;
  squareFeet: number;
  description?: string;
  units?: number;
  targetEquity?: number;
  yearBuilt?: number;
  closingDate?: string;
  pricePerToken?: number;
  targetPeriod?: string;
  documents?: Array<{
    title: string;
    url: string;
  }>;
  investmentHighlights?: Array<{
    title: string;
    description: string;
  }>;
  mapUrl?: string;
  brochureUrl?: string;
  status?: string;
  propertyValue?: number;
  totalTokens?: number;
  tokensAvailable?: number;
  walletAddress?: string;
  masterWallet?: string;
  contractData?: string;
  githubSmartContractUrl?: string;
  usdcPayment?: boolean;
  usdPayment?: boolean;
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
  // Missing properties causing TypeScript errors
  originalPropertyValue?: number;
  capRate?: string | number;
  holdPeriod?: string | number;
  constructionYear?: number;
  totalUnits?: number;
  numberOfUnits?: number;
  buildingSize?: number;
  squareFootage?: number;
  expectedClosingDate?: string;
}

const formatPropertyType = (type: string): string => {
  return formatPropertyTypeForDisplay(type);
};

const formatMeasurementUnit = (unit: string): string => {
  const unitMap: { [key: string]: string } = {
    'sqft': 'sq ft',
    'sqm': 'sq m',
    'ft': 'ft',
    'm': 'm',
    'acres': 'acres',
    'hectares': 'hectares',
    'sqin': 'sq in',
    'sqcm': 'sq cm',
    'sqkm': 'sq km',
    'sqyd': 'sq yd'
  };
  return unitMap[unit] || unit;
};

const generateGoogleMapsUrl = (location: string): string => {
  const encodedAddress = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

export default function PropertyDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [numShares, setNumShares] = useState<number>(1);
  const [dollarAmount, setDollarAmount] = useState<number>(0);
  const [inputMode, setInputMode] = useState<'shares' | 'amount'>('shares');
  const [paymentMethod, setPaymentMethod] = useState<'usd' | 'stablecoin'>('usd');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  // User profile dialog states
  
  // Sticky bar token quantity state
  const [stickyTokenQuantity, setStickyTokenQuantity] = useState<number>(100);
  
  // Investment success dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successInvestmentData, setSuccessInvestmentData] = useState<{
    tokens: number;
    amount: number;
    paymentMethod: string;
  } | null>(null);

  // KYC verification dialog state
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [isKycVerifying, setIsKycVerifying] = useState(false);
  
  // Payment method selection dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // USD/Plaid payment dialog state
  const [showUsdPaymentDialog, setShowUsdPaymentDialog] = useState(false);
  const [plaidAccountData, setPlaidAccountData] = useState<any>(null);
  const [isPlaidConnected, setIsPlaidConnected] = useState(false);
  
  // Commertizer X AI Assistant state
  const [runeQuery, setRuneQuery] = useState<string>('');
  const [runeResponse, setRuneResponse] = useState<string>('');
  const [runeScenarios, setRuneScenarios] = useState<any>(null);
  const [calculatorInputs, setCalculatorInputs] = useState<any>({});

  // Commertizer X hooks
  const runeQueryMutation = useRuneQuery();
  const runeScenariosMutation = useRuneScenarios();
  const runeDocumentMutation = useRuneDocumentQA();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      if (!id) throw new Error("No property ID");
      const docRef = doc(db, "properties", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Property not found");

      const data = docSnap.data();
      
      // Debug log for propertyValue
      console.log(`PropertyDetails - ${data.name}: propertyValue from DB = ${data.propertyValue}, type = ${typeof data.propertyValue}`);
      
      return {
        id: docSnap.id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        name: data.name || "Unnamed Property",
        location: data.location || "Location not specified",
        type: data.type || "Not specified",
        propertyClass: data.propertyClass || "Class A",
        imageUrl: data.imageUrl || "/placeholder-property.jpg",
        imageUrls: data.imageUrls || [],
        minInvestment: data.minInvestment || 0,
        targetedIRR: data.targetedIRR,
        targetedYield: data.targetedYield,
        equityMultiple: data.equityMultiple || 1,
        netOperatingIncome: data.netOperatingIncome || 0,
        squareFeet: data.squareFeet || 0,
        description: data.description || "",
        units: data.units || 0,
        targetEquity: data.targetEquity || 0,
        yearBuilt: data.yearBuilt || new Date().getFullYear(),
        closingDate: data.closingDate || "2024-12-31",
        pricePerToken: data.pricePerToken || 1,
        targetPeriod: data.targetPeriod || "5 years",
        documents: data.documents || [],
        investmentHighlights: data.investmentHighlights || [],
        mapUrl: data.mapUrl || "",
        brochureUrl: data.brochureUrl || "",
        status: data.status || "Express Interest",
        propertyValue: data.propertyValue || 0,
        totalTokens: data.totalTokens || 0,
        tokensAvailable: data.tokensAvailable || 0,
        walletAddress: data.walletAddress || '',
        // New financial fields
        unitCurrency: data.unitCurrency || 'USD',
        investmentReturn: data.investmentReturn || 0,
        rentalIncomeProjection: data.rentalIncomeProjection || 0,
        expectedAnnualReturn: data.expectedAnnualReturn || 0,
        estimatedTotalReturnIRR: data.estimatedTotalReturnIRR,
        legalCosts: data.legalCosts || 0,
        registrationTax: data.registrationTax || 0,
        initialDaoLlcSetupFees: data.initialDaoLlcSetupFees || 0,
        realEstateManagement: data.realEstateManagement || 0,
        repairReplacementReserve: data.repairReplacementReserve || 0,
        utilities: data.utilities || 0,
        yearlyDaoLlcComplianceFees: data.yearlyDaoLlcComplianceFees || 0,
        yearlyDaoFinancialReportingServices: data.yearlyDaoFinancialReportingServices || 0,
        propertyInsurance: data.propertyInsurance || 0,
        annualDaoAccountingService: data.annualDaoAccountingService || 0,
        annualDaoLlcAdministrationFilingFees: data.annualDaoLlcAdministrationFilingFees || 0,
        maintenanceReserve: data.maintenanceReserve || 0,
        propertyManagement: data.propertyManagement || 0,
        upfrontDaoLlcFees: data.upfrontDaoLlcFees || 0,
        legalFees: data.legalFees || 0,
        projectedRentalIncome: data.projectedRentalIncome || 0,
        projectedAnnualIncomeApr: data.projectedAnnualIncomeApr,
        valueGrowth: data.valueGrowth,
      } as ExtendedProperty;
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if MetaMask is already connected on page load
    const checkExistingConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
          }
        } catch (error) {
          console.log("No existing MetaMask connection found");
        }
      }
    };
    
    checkExistingConnection();
    
    // Listen for account changes in MetaMask
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsWalletConnected(false);
        setWalletAddress('');
      } else {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
      }
    };
    
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Cleanup listener on unmount
      return () => {
        if (typeof window.ethereum !== 'undefined') {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  // Update sticky token quantity when property loads
  useEffect(() => {
    if (property) {
      const minTokens = Math.ceil((property.minInvestment || 10000) / (property.pricePerToken || 100));
      setStickyTokenQuantity(minTokens);
    }
  }, [property]);

  useEffect(() => {
    if (property) {
      const minShares = Math.ceil(
        property.minInvestment / (property.pricePerToken || 1),
      );
      setNumShares(minShares);
      setDollarAmount(property.minInvestment);
      setValidationError(null);
    }
  }, [property]);

  // MetaMask wallet connection with enhanced error handling
  const connectWallet = async (): Promise<boolean> => {
    console.log("Attempting to connect wallet...");
    
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      console.log("MetaMask not detected");
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask extension to use cryptocurrency payments",
        variant: "destructive",
      });
      return false;
    }

    // Check if it's actually MetaMask
    if (!window.ethereum.isMetaMask) {
      console.log("Ethereum provider found but not MetaMask");
      toast({
        title: "MetaMask Required",
        description: "Please use MetaMask as your Ethereum wallet provider",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log("Requesting MetaMask account access...");
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      console.log("Accounts returned:", accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from MetaMask");
      }

      // Check network (optional - ensure user is on the right network)
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log("Current chain ID:", chainId);
        
        // You can add network validation here if needed
        // For now, we'll just log it
      } catch (networkError) {
        console.warn("Could not detect network:", networkError);
        // Don't fail the connection for network detection issues
      }

      const walletAddress = accounts[0];
      setWalletAddress(walletAddress);
      setIsWalletConnected(true);
      
      console.log("Wallet connected successfully:", walletAddress);
      
      toast({
        title: "Wallet Connected Successfully",
        description: `Connected to ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
      });
      
      return true;
      
    } catch (error: any) {
      console.error("MetaMask connection error:", error);
      
      let errorMessage = "Failed to connect to MetaMask wallet";
      
      if (error.code === 4001) {
        errorMessage = "User rejected the connection request";
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending. Check MetaMask.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Sync inputs based on mode
  useEffect(() => {
    if (!property) return;
    
    if (inputMode === 'shares') {
      setDollarAmount(numShares * (property.pricePerToken || 0));
    } else {
      setNumShares(Math.floor(dollarAmount / (property.pricePerToken || 1)));
    }
  }, [inputMode, numShares, dollarAmount, property]);

  const validateInvestment = (): boolean => {
    if (!property) {
      setValidationError("Property information not available");
      return false;
    }

    if (paymentMethod === 'stablecoin' && !isWalletConnected) {
      setValidationError("Please connect your MetaMask wallet for stablecoin payments");
      return false;
    }

    if (inputMode === 'shares') {
      if (!Number.isInteger(numShares)) {
        setValidationError("Please enter a whole number of tokens");
        return false;
      }

      if (numShares <= 0) {
        setValidationError("Number of tokens must be greater than zero");
        return false;
      }

      const minRequiredTokens = Math.ceil(
        property.minInvestment / (property.pricePerToken || 1),
      );
      if (numShares < minRequiredTokens) {
        setValidationError(
          `Minimum investment requirement not met. Please enter at least ${minRequiredTokens} tokens ($${property.minInvestment.toLocaleString()} USD)`,
        );
        return false;
      }
    } else {
      if (dollarAmount <= 0) {
        setValidationError("Investment amount must be greater than zero");
        return false;
      }

      if (dollarAmount < property.minInvestment) {
        setValidationError(
          `Minimum investment requirement not met. Please enter at least $${property.minInvestment.toLocaleString()}`,
        );
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const calculateEquityShare = (): string => {
    if (
      !property ||
      !numShares ||
      !property.targetEquity ||
      !property.pricePerToken
    ) {
      return "0.00";
    }
    const totalInvestment = numShares * property.pricePerToken;
    const percentage = (totalInvestment / property.targetEquity) * 100;
    return percentage.toFixed(2);
  };

  const calculateAvailableIncrements = (): string => {
    if (!property || !property.targetEquity || !property.minInvestment) {
      return "0";
    }
    const increments = Math.floor(
      property.targetEquity / property.minInvestment,
    );
    return increments.toLocaleString();
  };

  // Plaid integration handlers
  const handlePlaidSuccess = (accountData: any) => {
    setPlaidAccountData(accountData);
    setIsPlaidConnected(true);
    setShowUsdPaymentDialog(false);
    
    toast({
      title: "Bank Account Connected",
      description: "Your bank account has been successfully linked for investment.",
    });
    
    // Proceed with investment
    handleInvestmentConfirmed();
  };

  const handlePlaidExit = (error?: any) => {
    if (error) {
      toast({
        title: "Connection Failed",
        description: "There was an issue connecting your bank account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInvestmentConfirmed = async () => {
    try {
      setIsSubmitting(true);

      const finalTokens = inputMode === 'shares' ? numShares : Math.floor(dollarAmount / (property?.pricePerToken || 1));
      const finalAmount = inputMode === 'shares' ? numShares * (property?.pricePerToken || 0) : dollarAmount;

      const investmentData = {
        userId: auth.currentUser?.uid,
        propertyId: id,
        propertyName: property?.name,
        propertyLocation: property?.location,
        tokens: finalTokens,
        pricePerToken: property?.pricePerToken || 0,
        totalInvestment: finalAmount,
        paymentMethod: paymentMethod,
        walletAddress: paymentMethod === 'stablecoin' ? walletAddress : null,
        plaidAccountData: paymentMethod === 'usd' ? plaidAccountData : null,
        inputMode: inputMode,
        timestamp: new Date().toISOString(),
        status: "pending",
      };

      await addDoc(collection(db, "investments"), investmentData);

      // Update property tokens available count
      if (property?.totalTokens && property?.tokensAvailable) {
        const propertyRef = doc(db, "properties", id!);
        const newTokensAvailable = property.tokensAvailable - finalTokens;
        await updateDoc(propertyRef, {
          tokensAvailable: Math.max(0, newTokensAvailable)
        });
      }

      // Store investment data for success dialog
      setSuccessInvestmentData({
        tokens: finalTokens,
        amount: finalAmount,
        paymentMethod: paymentMethod
      });
      
      // Show success dialog instead of navigating away
      setShowSuccessDialog(true);
      
      // Clear form inputs
      setNumShares(1);
      setDollarAmount(0);
      setStickyTokenQuantity(100);
    } catch (error) {
      console.error("Investment error:", error);
      toast({
        title: "Investment Failed",
        description:
          "There was an error processing your investment. Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvestment = () => {
    if (!auth.currentUser) {
      sessionStorage.setItem("redirectAfterLogin", `/property/${id}`);
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your investment",
        variant: "default",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        ),
      });
      navigate("/login");
      return;
    }

    if (!validateInvestment()) {
      return;
    }

    // Show KYC verification dialog
    setShowKycDialog(true);
  };

  // Sticky bar investment handler
  const handleStickyInvestment = () => {
    if (!auth.currentUser) {
      sessionStorage.setItem("redirectAfterLogin", `/property/${id}`);
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your investment",
        variant: "default",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        ),
      });
      navigate("/login");
      return;
    }

    if (!property) return;

    // Validate sticky token quantity
    const minTokens = Math.ceil(property.minInvestment / (property.pricePerToken || 1));
    const maxTokens = property.tokensAvailable || Math.floor((property.targetEquity || property.propertyValue || 1000000) / property.minInvestment);

    if (stickyTokenQuantity < minTokens) {
      toast({
        title: "Investment Too Small",
        description: `Minimum investment: ${minTokens} tokens ($${property.minInvestment.toLocaleString()})`,
        variant: "destructive",
      });
      return;
    }

    if (stickyTokenQuantity > maxTokens) {
      toast({
        title: "Insufficient Tokens",
        description: `Only ${maxTokens} tokens available for purchase`,
        variant: "destructive",
      });
      return;
    }

    // Set the main investment form values for later processing
    setNumShares(stickyTokenQuantity);
    setInputMode('shares');
    
    // Show payment method selection dialog first
    setShowPaymentDialog(true);
  };

  // KYC verification handlers

  const handleStartKycVerification = async () => {
    setIsKycVerifying(true);
    
    try {
      // If paying with stablecoin, connect MetaMask wallet first
      if (paymentMethod === 'stablecoin') {
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
            toast({
              title: "Wallet Connected",
              description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
            });
          }
        } else {
          setIsKycVerifying(false);
          toast({
            title: "MetaMask Not Found",
            description: "Please install MetaMask to use cryptocurrency payments",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Simulate KYC verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Close KYC dialog
      setShowKycDialog(false);
      setIsKycVerifying(false);
      
      // Route to appropriate payment method
      if (paymentMethod === 'usd') {
        // For USD payments, show Plaid Link dialog
        setShowUsdPaymentDialog(true);
      } else {
        // For USDC payments, proceed directly to investment
        handleInvestmentConfirmed();
      }
      
    } catch (error) {
      setIsKycVerifying(false);
      toast({
        title: "Verification Error",
        description: "There was an issue starting the verification process. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleCancelKyc = () => {
    setShowKycDialog(false);
    setIsKycVerifying(false);
  };

  // Payment method selection handlers
  const handlePaymentMethodSelect = async (selectedMethod: 'usd' | 'stablecoin') => {
    console.log("Payment method selected:", selectedMethod);
    setPaymentMethod(selectedMethod);
    
    // If stablecoin is selected, connect MetaMask wallet first
    if (selectedMethod === 'stablecoin') {
      if (!isWalletConnected) {
        console.log("Wallet not connected, attempting connection...");
        const connectionSuccess = await connectWallet();
        console.log("Connection result:", connectionSuccess);
        
        // Only proceed to KYC if wallet connection was successful
        if (connectionSuccess) {
          setShowPaymentDialog(false);
          setShowKycDialog(true);
        } else {
          console.log("Wallet connection failed, staying in payment dialog");
          // Stay in payment dialog if connection failed
        }
        return;
      } else {
        console.log("Wallet already connected, proceeding to KYC");
      }
    }
    
    // For USD or if wallet is already connected, proceed to KYC
    console.log("Proceeding to KYC dialog");
    setShowPaymentDialog(false);
    setShowKycDialog(true);
  };

  const handleCancelPayment = () => {
    setShowPaymentDialog(false);
    // Reset payment method to default
    setPaymentMethod('usd');
  };

  const handleShareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (!/^\d*$/.test(rawValue)) {
      setValidationError("Please enter only whole numbers");
      return;
    }

    const value = parseInt(rawValue, 10);
    setNumShares(value);

    if (!rawValue) {
      setValidationError(null);
      return;
    }

    if (property) {
      const minRequiredTokens = Math.ceil(
        property.minInvestment / (property.pricePerToken || 1),
      );
      if (value < minRequiredTokens) {
        setValidationError(
          `Minimum investment requirement: ${minRequiredTokens} tokens ($${property.minInvestment.toLocaleString()} USD)`,
        );
      } else {
        setValidationError(null);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (!/^\d*\.?\d*$/.test(rawValue)) {
      setValidationError("Please enter a valid dollar amount");
      return;
    }

    const value = parseFloat(rawValue);
    setDollarAmount(value);

    if (!rawValue) {
      setValidationError(null);
      return;
    }

    if (property) {
      if (value < property.minInvestment) {
        setValidationError(
          `Minimum investment requirement: $${property.minInvestment.toLocaleString()} USD`,
        );
      } else {
        setValidationError(null);
      }
    }
  };

  const formatMetric = (
    value: number,
    type: "currency" | "percentage" | "multiple",
  ) => {
    switch (type) {
      case "currency":
        return `$${value.toLocaleString()} USD`;
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "multiple":
        return `${value.toFixed(2)}x`;
      default:
        return value.toString();
    }
  };

  const sanitizeHTML = (html: string) => {
    return {
      __html: DOMPurify.sanitize(html, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
      }),
    };
  };

  // Commertizer X AI Handler Functions
  const handleRuneQuery = async () => {
    if (!runeQuery.trim() || !property) return;

    const propertyData = {
      targetedIRR: property.targetedIRR,
      projectedAnnualIncomeApr: property.projectedAnnualIncomeApr,
      equityMultiple: property.equityMultiple?.toString(),
      pricePerToken: property.pricePerToken,
      minInvestment: property.minInvestment,
      propertyValue: property.propertyValue,
      netOperatingIncome: property.netOperatingIncome
    };

    runeQueryMutation.mutate({
      query: runeQuery,
      currentInputs: calculatorInputs,
      propertyData
    }, {
      onSuccess: (data) => {
        if (data.result.type === 'calculator_update' && data.result.inputs) {
          setCalculatorInputs((prev: any) => ({ ...prev, ...data.result.inputs }));
        }
        setRuneResponse(data.result.explanation || data.result.summary || 'Analysis complete');
        setRuneQuery('');
      },
      onError: () => {
        setRuneResponse('Unable to process query. Please try again.');
      }
    });
  };

  const handleScenarioGeneration = (scenario: 'base' | 'conservative' | 'aggressive') => {
    if (!property) return;

    const propertyData = {
      targetedIRR: property.targetedIRR,
      projectedAnnualIncomeApr: property.projectedAnnualIncomeApr,
      equityMultiple: property.equityMultiple?.toString(),
      pricePerToken: property.pricePerToken,
      minInvestment: property.minInvestment,
      propertyValue: property.propertyValue,
      netOperatingIncome: property.netOperatingIncome
    };

    runeScenariosMutation.mutate({ propertyData }, {
      onSuccess: (data) => {
        setRuneScenarios(data.scenarios);
        const selectedScenario = data.scenarios[scenario === 'base' ? 'base' : scenario === 'conservative' ? 'downside' : 'upside'];
        setRuneResponse(`${scenario.charAt(0).toUpperCase() + scenario.slice(1)} scenario: ${selectedScenario.irr}% IRR, ${selectedScenario.multiple}x multiple. ${selectedScenario.adjustments}`);
      }
    });
  };

  const handleDocumentQuestion = (question: string) => {
    if (!property) return;

    const propertyData = {
      targetedIRR: property.targetedIRR,
      projectedAnnualIncomeApr: property.projectedAnnualIncomeApr,
      equityMultiple: property.equityMultiple?.toString(),
      pricePerToken: property.pricePerToken,
      minInvestment: property.minInvestment,
      propertyValue: property.propertyValue,
      netOperatingIncome: property.netOperatingIncome
    };

    runeDocumentMutation.mutate({ question, propertyData }, {
      onSuccess: (data) => {
        setRuneResponse(data.answer);
      }
    });
  };

  // Chart configuration
  const [selectedRange, setSelectedRange] = useState<'1Y' | '3Y' | '5Y' | 'Full'>('Full');
  const [showPercentage, setShowPercentage] = useState(true);

  // Chart data generation functions
  const generateProjectedReturnsData = () => {
    if (!property) return [];
    const baseReturn = property.targetedIRR || property.estimatedTotalReturnIRR || 8;
    const initialInvestment = 100000;
    const maxYear = selectedRange === '1Y' ? 1 : selectedRange === '3Y' ? 3 : selectedRange === '5Y' ? 5 : 10;
    const data = [];
    
    // Generate monthly data points for smoother curve
    for (let month = 0; month <= maxYear * 12; month++) {
      const year = month / 12;
      const totalValue = initialInvestment * Math.pow(1 + baseReturn / 100, year);
      const cumulativeReturn = ((totalValue - initialInvestment) / initialInvestment) * 100;
      
      data.push({
        year: year,
        month: month,
        totalValue: Math.round(totalValue),
        cumulativeReturn: Math.round(cumulativeReturn * 100) / 100,
        displayValue: showPercentage ? cumulativeReturn : totalValue,
        formattedDate: year === 0 ? 'Start' : year < 1 ? `${month}M` : `${Math.floor(year)}Y${month % 12 ? ` ${month % 12}M` : ''}`
      });
    }
    return data;
  };



  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-[400px] bg-gray-100 rounded-lg mb-8" />
          <div className="h-8 bg-gray-100 w-1/2 mb-4" />
          <div className="h-4 bg-gray-100 w-1/4 mb-8" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-light mb-4">Property not found</h1>
        <Link href="/marketplace">
          <Button>Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 py-4 md:py-8 pb-20 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-4 md:mb-6">
          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-black hover:text-black font-light"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
        </div>

        <div className="mb-6 md:mb-8 p-4 md:p-6 bg-card/50 backdrop-blur-sm rounded-lg border-0 shadow-xl">
          <div className="text-base md:text-lg text-foreground">
            <h3 className="text-lg md:text-xl font-light text-primary font-sans mb-3">Be First in Line for This Opportunity</h3>
            <p className="font-light font-sans leading-relaxed">Join our exclusive network of qualified investors for this premium property. As soon as this investment opens, you'll receive priority access to secure your share in the ownership structure.</p>
            <p className="font-light font-sans mt-2 leading-relaxed">No commitment required today — we'll notify you in advance so you can confirm your allocation.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div>
            {/* Property Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-3xl font-light text-foreground mb-2 leading-relaxed">{property.name}</h1>
              <p className="text-base text-black leading-relaxed font-light">
                {property.location}
              </p>
            </div>

            {/* Property Price Card */}
            <Card className="mb-6 lg:mb-8 border-2 border-primary rounded-lg ring-1 ring-primary/30 shadow-lg shadow-primary/10">
              <CardContent className="p-5 md:p-6 text-center">
                <p className="text-sm text-black mb-2 font-light">Property Price</p>
                <p className="text-3xl font-light text-foreground leading-relaxed">
                  {property.propertyValue ? `$${property.propertyValue.toLocaleString()}` : 'TBD'}
                </p>
              </CardContent>
            </Card>

            {/* Property Images */}
            <Card className="mb-6 lg:mb-8 border rounded-lg">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-light">Property Images</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm"
                      aria-label="View property on map"
                      asChild
                    >
                      <a
                        href={generateGoogleMapsUrl(property.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Map
                      </a>
                    </Button>
                  </div>
                </div>

                <img
                  src={property.imageUrls?.[currentImageIndex] || property.imageUrl}
                  alt={property.name}
                  className="w-full h-[300px] object-cover rounded-lg border"
                />

                {property.imageUrls && property.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                    {property.imageUrls.slice(0, 6).map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-full h-16 object-cover rounded cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-black/10 ${
                          currentImageIndex === index ? "ring-2 ring-gold-600" : "hover:scale-105"
                        }`}
                        aria-label={`View image ${index + 1} of ${property.name}`}
                      >
                        <img 
                          src={url} 
                          alt={`${property.name} view ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Performance Chart */}
            <Card className="mb-6 lg:mb-8 border rounded-lg">
              <CardContent className="p-5 md:p-6">
                {/* Chart Header */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <div>
                      <h2 className="text-lg font-light text-black mb-1">
                        Property Value Growth
                      </h2>
                      <p className="text-sm text-black leading-relaxed font-light">
                        {showPercentage ? 'Property Return Performance' : 'Property Investment Value'}
                      </p>
                    </div>
                    
                    {/* Toggle between % and $ */}
                    <div className="flex gap-2">
                      <Button
                        variant={showPercentage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowPercentage(true)}
                        className="h-8 px-3 text-sm focus:ring-2 focus:ring-black/10"
                        aria-label="Show percentage view"
                      >
                        %
                      </Button>
                      <Button
                        variant={!showPercentage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowPercentage(false)}
                        className="h-8 px-3 text-sm focus:ring-2 focus:ring-black/10"
                        aria-label="Show dollar view"
                      >
                        $
                      </Button>
                    </div>
                  </div>

                  {/* Range Selection Buttons */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {(['1Y', '3Y', '5Y', 'Full'] as const).map((range) => (
                      <Button
                        key={range}
                        variant={selectedRange === range ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedRange(range)}
                        className="h-8 px-3 text-sm focus:ring-2 focus:ring-black/10"
                        aria-label={`Show ${range} range`}
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Chart Container */}
                <div className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart 
                      data={generateProjectedReturnsData()}
                      margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#be8d00" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#be8d00" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      
                      <XAxis 
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 300 }}
                        tickFormatter={(value) => {
                          if (selectedRange === '1Y') return `${Math.round(value * 12)}M`;
                          return value === 0 ? 'Start' : `${Math.round(value)}Y`;
                        }}
                        interval="preserveStartEnd"
                      />
                      
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 300 }}
                        tickFormatter={(value) => 
                          showPercentage ? `${value}%` : `$${(value / 1000).toFixed(0)}k`
                        }
                        domain={['dataMin', 'dataMax']}
                      />
                      
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const currentValue = showPercentage ? data.cumulativeReturn : data.totalValue;
                            const startValue = showPercentage ? 0 : 100000;
                            const changeValue = showPercentage 
                              ? data.cumulativeReturn 
                              : ((data.totalValue - 100000) / 100000) * 100;
                            
                            return (
                              <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
                                <p className="text-sm font-light text-black mb-1">
                                  {data.formattedDate}
                                </p>
                                <p className="text-lg font-light text-black">
                                  {showPercentage 
                                    ? `+${currentValue.toFixed(2)}%` 
                                    : `$${currentValue.toLocaleString()}`
                                  }
                                </p>
                                <p className="text-xs text-black font-light">
                                  {changeValue >= 0 ? '+' : ''}{changeValue.toFixed(2)}% property growth
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{
                          stroke: '#be8d00',
                          strokeWidth: 1,
                          strokeDasharray: '4 4'
                        }}
                      />
                      
                      <Area
                        type="monotone"
                        dataKey="displayValue"
                        stroke="#be8d00"
                        strokeWidth={2}
                        fill="url(#valueGradient)"
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: '#be8d00',
                          stroke: '#fff',
                          strokeWidth: 2
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* KPI Cards */}
                <div className="mt-6 space-y-4">
                  {/* Featured Price Per Token */}
                  <div className="text-center p-6 bg-primary/10 border-2 border-primary/30 rounded-lg">
                    <p className="text-sm font-light text-primary uppercase tracking-wide mb-3">
                      Price Per Token
                    </p>
                    <p className="text-3xl font-light text-black">
                      ${(property.pricePerToken || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Other KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/50 border border-border rounded-lg">
                      <p className="text-xs font-light text-black uppercase tracking-wide mb-2">
                        Target IRR
                      </p>
                      <p className="text-lg font-light text-black">
                        {property.targetedIRR || property.estimatedTotalReturnIRR || 8}%
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 border border-border rounded-lg">
                      <p className="text-xs font-light text-black uppercase tracking-wide mb-2">
                        Target Cash Yield
                      </p>
                      <p className="text-lg font-light text-black">
                        {property.projectedAnnualIncomeApr || 6.5}%
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 border border-border rounded-lg">
                      <p className="text-xs font-light text-black uppercase tracking-wide mb-2">
                        Equity Multiple
                      </p>
                      <p className="text-lg font-light text-black">
                        {property.equityMultiple || '1.8x'}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 border border-border rounded-lg">
                      <p className="text-xs font-light text-black uppercase tracking-wide mb-2">
                        Min Investment
                      </p>
                      <p className="text-lg font-light text-black">
                        ${property.minInvestment.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 border border-border rounded-lg">
                      <p className="text-xs font-light text-black uppercase tracking-wide mb-2">
                        Available Tokens
                      </p>
                      <p className="text-lg font-light text-black">
                        {property.totalTokens ? 
                          `${Math.round(((property.tokensAvailable || 0) / property.totalTokens) * 100)}% (${(property.tokensAvailable || 0).toLocaleString()})` :
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>















            {/* Property Description */}
            <Card className="mb-6 lg:mb-8 border rounded-lg">
              <CardContent className="p-5 md:p-6">
                <h2 className="text-lg font-light text-black mb-4">Description</h2>
                {property.description ? (
                  <div
                    dangerouslySetInnerHTML={sanitizeHTML(property.description)}
                    className="prose prose-sm max-w-none text-black leading-relaxed font-light"
                  />
                ) : (
                  <div className="text-center py-8 text-black">
                    <p className="text-sm leading-relaxed font-light">No description yet—property details will be populated once available.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Property Facts */}
            <Card className="mb-6 lg:mb-8 border rounded-lg">
              <CardContent className="p-5 md:p-6">
                <h2 className="text-lg font-light text-black mb-4">Key Property Facts</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 text-black font-light">Property Type & Class</td>
                        <td className="py-3 text-black font-light text-right">
                          {formatPropertyTypeForDisplay(property.propertyType || 'Office')} - {property.propertyClass || 'Class A'}
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 text-black font-light">Year Built</td>
                        <td className="py-3 text-black font-light text-right">
                          {property.yearBuilt || property.constructionYear || 'N/A'}
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 text-black font-light">Total Units</td>
                        <td className="py-3 text-black font-light text-right">
                          {property.totalUnits || property.numberOfUnits || 'N/A'}
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 text-black font-light">Building Size</td>
                        <td className="py-3 text-black font-light text-right">
                          {property.buildingSize || property.squareFootage 
                            ? `${Number(property.buildingSize || property.squareFootage).toLocaleString()} sq ft`
                            : 'N/A'
                          }
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 text-black font-light">Closing Date</td>
                        <td className="py-3 text-black font-light text-right">
                          {property.closingDate 
                            ? new Date(property.closingDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : property.expectedClosingDate 
                              ? `Expected: ${new Date(property.expectedClosingDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}`
                              : 'TBD'
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>



            {/* Investment, Analysis, Calculator, and Documents Tabs */}
            <div className="mb-6 lg:mb-8">
              <Tabs defaultValue="investment" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="investment" className="text-xs data-[state=active]:bg-[#be8d00] data-[state=active]:text-white">Investment</TabsTrigger>
                  <TabsTrigger value="analysis" className="text-xs data-[state=active]:bg-[#be8d00] data-[state=active]:text-white">Analysis</TabsTrigger>
                  <TabsTrigger value="calculator" className="text-xs data-[state=active]:bg-[#be8d00] data-[state=active]:text-white">Calculator</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs data-[state=active]:bg-[#be8d00] data-[state=active]:text-white">Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="investment" className="p-0">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg">
                    <div className="text-center space-y-2 mb-6">
                      <h3 className="text-xl font-light text-black">Investment Opportunity</h3>
                      <p className="text-sm text-black font-light">Key metrics and investment details</p>
                    </div>

                    {/* Investment Details - Main Metrics */}
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur mb-6">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Price Per Token */}
                          <div className="text-center">
                            <div className="text-xs text-black font-light mb-2">Price Per Token</div>
                            <div className="text-2xl font-light text-black">
                              ${(property.pricePerToken || 1).toLocaleString()}
                            </div>
                          </div>

                          {/* Target IRR */}
                          <div className="text-center">
                            <div className="text-xs text-black font-light mb-2">Target IRR</div>
                            <div className="text-2xl font-light text-black">
                              {property.targetedIRR || property.estimatedTotalReturnIRR || 12}%
                            </div>
                          </div>

                          {/* Target Cash Yield */}
                          <div className="text-center">
                            <div className="text-xs text-black font-light mb-2">Target Cash Yield</div>
                            <div className="text-2xl font-light text-black">
                              {property.projectedAnnualIncomeApr || property.targetedYield || 6.5}%
                            </div>
                          </div>

                          {/* Equity Multiple */}
                          <div className="text-center">
                            <div className="text-xs text-black font-light mb-2">Equity Multiple</div>
                            <div className="text-2xl font-light text-black">
                              {property.equityMultiple || 2}x
                            </div>
                          </div>

                          {/* Min Investment */}
                          <div className="text-center">
                            <div className="text-xs text-black font-light mb-2">Min Investment</div>
                            <div className="text-2xl font-light text-black">
                              ${property.minInvestment?.toLocaleString() || '1,000'}
                            </div>
                          </div>

                          {/* Available Tokens */}
                          <div className="text-center">
                            <div className="text-xs text-black font-light mb-2">Available Tokens</div>
                            <div className="text-2xl font-light text-black">
                              41% ({(calculateAvailableIncrements() || 41000).toLocaleString()})
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Property Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex justify-between p-3 bg-white/60 rounded border">
                        <span className="text-xs text-black font-light">Property Value</span>
                        <span className="text-sm font-medium text-black">
                          ${(property.propertyValue || property.originalPropertyValue || 10000000).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/60 rounded border">
                        <span className="text-xs text-black font-light">Total Equity</span>
                        <span className="text-sm font-medium text-black">
                          ${((property.propertyValue || property.originalPropertyValue || 10000000) * 0.25).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Important Notice */}
                    <Alert className="border-primary/20 bg-primary/5">
                      <InfoIcon className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-xs text-black font-light">
                        Investment opportunities are subject to availability and regulatory approval. Past performance does not guarantee future results.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="p-6 space-y-6">
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-light text-black mb-2">Comprehensive Property Analysis</h3>
                      <p className="text-sm text-black font-light">Deal Quality Index, Performance Forecasting, and Market Intelligence</p>
                    </div>

                    {/* Deal Quality Index */}
                    <DealQualityIndex propertyId={property.id} />

                    {/* Market & Location Intelligence */}
                    <MarketLocationIntelligence propertyId={property.id} location={property.location} />

                    {/* Property Performance & Forecasting */}
                    <div className="space-y-6">
                      <div className="text-center py-4">
                        <h4 className="text-lg font-light text-black mb-2">Property Performance & Forecasting</h4>
                        <p className="text-sm text-black font-light">Advanced AI-powered scenario modeling, lease analysis, and expense benchmarking</p>
                        <p className="text-xs text-primary font-light mt-2">All analysis powered by Commertizer X</p>
                      </div>

                      {/* Scenario Simulator */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-light text-black flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                            Scenario Simulator
                          </CardTitle>
                          <CardDescription className="text-sm text-black font-light">
                            Interactive modeling of different investment scenarios and market conditions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScenarioSimulator propertyId={property.id} />
                        </CardContent>
                      </Card>

                      {/* Lease Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-light text-black flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-primary" />
                            Lease Analysis
                          </CardTitle>
                          <CardDescription className="text-sm text-black font-light">
                            Detailed lease structure analysis and tenant risk assessment
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <LeaseAnalysis propertyId={property.id} />
                        </CardContent>
                      </Card>

                      {/* Expense Benchmarking */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-light text-black flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                            Expense Benchmarking
                          </CardTitle>
                          <CardDescription className="text-sm text-black font-light">
                            Market-based expense analysis and operational cost optimization recommendations
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ExpenseBenchmarking propertyId={property.id} />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-light tracking-tight">Documents & Due Diligence</h3>
                    <p className="text-sm text-black font-light">
                      Access comprehensive property documentation and legal materials
                    </p>
                  </div>

                  {/* Document Categories */}
                  <div className="space-y-6">
                    {/* Investment Documents */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-light text-black uppercase tracking-wide">Investment Documents</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-muted/50 border border-border rounded-lg">
                          <div>
                            <div className="text-sm font-light text-black">Offering Memorandum</div>
                            <div className="text-xs text-black font-light">Complete investment overview and terms</div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Document
                          </Button>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-muted/50 border border-border rounded-lg">
                          <div>
                            <div className="text-sm font-light text-black">Financial Model</div>
                            <div className="text-xs text-black font-light">Detailed financial projections</div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Document
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Legal Documents */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-light text-black uppercase tracking-wide">Legal Documentation</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-muted/50 border border-border rounded-lg">
                          <div>
                            <div className="text-sm font-light text-black">Operating Agreement</div>
                            <div className="text-xs text-black font-light">LLC operating agreement</div>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Document
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="calculator" className="p-0">
                  <InvestmentCalculator 
                    property={{
                      propertyValue: property.propertyValue,
                      netOperatingIncome: property.netOperatingIncome,
                      capRate: typeof property.capRate === 'string' ? parseFloat(property.capRate) : property.capRate,
                      targetedIRR: property.targetedIRR,
                      estimatedTotalReturnIRR: property.estimatedTotalReturnIRR,
                      type: property.type,
                      location: property.location
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
          </div>
        </div>
      </div>

      {/* Sticky Investment Bar - Compact Circular Design */}
      <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-[70]">
        <div className="bg-gradient-to-r from-primary via-primary to-primary/90 shadow-lg rounded-full border border-primary/20 backdrop-blur max-w-4xl mx-auto">
          {/* Mobile Layout */}
          <div className="md:hidden px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-white text-xs font-light min-w-0">
                <span className="truncate">{property ? calculateAvailableIncrements().toLocaleString() : '0'}</span>
                <span className="opacity-70">tokens</span>
                <span className="opacity-50">•</span>
                <span>${(property?.pricePerToken || 100)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-white/10 rounded-full px-2 py-1">
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-10 h-6 bg-transparent border-none text-white placeholder-white/70 text-xs text-center p-0 focus:ring-0"
                    value={stickyTokenQuantity || ''}
                    onChange={(e) => setStickyTokenQuantity(Number(e.target.value) || 0)}
                    min={property ? Math.ceil((property.minInvestment || 10000) / (property.pricePerToken || 100)) : 1}
                    max={property ? (property.tokensAvailable || Math.floor(((property.targetEquity || 0) as number) / (property.minInvestment || 1))) : 1000}
                  />
                </div>
                <Button 
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 font-medium px-4 py-2 text-xs rounded-full h-8 shadow-md whitespace-nowrap min-w-[80px]"
                  onClick={handleStickyInvestment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Buy Tokens'}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center px-4 py-3">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-white text-sm font-light">
                <span className="opacity-90">{property ? calculateAvailableIncrements().toLocaleString() : '0'}</span>
                <span className="opacity-70">tokens</span>
                <span className="opacity-50 mx-1">•</span>
                <span className="opacity-90">${(property?.pricePerToken || 100).toLocaleString()}</span>
                <span className="opacity-70">each</span>
                <span className="opacity-50 mx-1">•</span>
                <span className="opacity-90">${(property?.minInvestment || 10000).toLocaleString()}</span>
                <span className="opacity-70">min</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white/10 rounded-full px-3 py-1">
                <span className="text-white text-sm font-light mr-2">Qty:</span>
                <Input
                  type="number"
                  placeholder="0"
                  className="w-12 h-6 bg-transparent border-none text-white placeholder-white/70 text-sm text-center font-medium p-0 focus:ring-0"
                  value={stickyTokenQuantity || ''}
                  onChange={(e) => setStickyTokenQuantity(Number(e.target.value) || 0)}
                  min={property ? Math.ceil((property.minInvestment || 10000) / (property.pricePerToken || 100)) : 1}
                  max={property ? (property.tokensAvailable || Math.floor(((property.targetEquity || 0) as number) / (property.minInvestment || 1))) : 1000}
                />
              </div>
              <Button 
                className="bg-white text-primary hover:bg-white/90 font-medium px-4 py-1.5 text-sm rounded-full shadow-md transition-all duration-200 hover:shadow-lg whitespace-nowrap"
                onClick={handleStickyInvestment}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Buy Tokens'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom padding to account for sticky bar */}
      <div className="h-20"></div>

      {/* Payment Method Selection Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg mx-2 h-auto max-h-[70vh] overflow-y-auto border-0 shadow-2xl p-3 my-4">
          {/* Header */}
          <DialogHeader className="text-center space-y-1 pb-2">
            <DialogTitle className="text-base text-black font-normal font-sans">
              Choose Your Payment Method
            </DialogTitle>
            <DialogDescription className="text-black text-xs font-light font-sans">
              Select how you'd like to invest in this property.
            </DialogDescription>
          </DialogHeader>
          
          {/* Investment Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 rounded-lg border-2 border-yellow-600 mb-2">
            <div className="flex justify-between items-center">
              <div className="text-xs text-black font-light font-sans">
                <span className="font-normal font-sans">{property?.name}</span> • {stickyTokenQuantity.toLocaleString()} tokens
              </div>
              <div className="text-base font-normal text-black font-sans">
                ${(stickyTokenQuantity * (property?.pricePerToken || 100)).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-2 mb-2">
            {/* USD Payment Card */}
            <div className={`relative p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              paymentMethod === 'usd' 
                ? 'border-yellow-600 bg-white shadow-md' 
                : 'border-yellow-500 hover:border-yellow-600 hover:bg-yellow-50/20'
            }`}
                 onClick={() => setPaymentMethod('usd')}>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-white border border-yellow-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.58.69 4.18 1.76 4.18 3.84 0 1.77-1.35 2.96-3.12 3.2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-normal text-black font-sans">Pay with USD</h3>
                  <p className="text-xs text-black font-light font-sans">Bank / Card</p>
                </div>
              </div>
              
              <div className="space-y-1 mb-1">
                <div className="flex items-center space-x-1 text-xs text-black font-light font-sans">
                  <CheckCircle className="h-2 w-2 text-black" />
                  <span>Secure ACH or debit/credit checkout</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-black font-light font-sans">
                  <CheckCircle className="h-2 w-2 text-black" />
                  <span>Funds held in USD escrow</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-black font-light font-sans">
                  <CheckCircle className="h-2 w-2 text-black" />
                  <span>Works with any U.S. bank account</span>
                </div>
              </div>

              <div className="text-xs text-black mb-1 font-light font-sans">
                💡 2-3 day settlement, no crypto required.
              </div>

              <Button
                className={`w-full h-7 text-xs font-sans border-2 ${
                  paymentMethod === 'usd'
                    ? 'bg-white hover:bg-yellow-50 border-yellow-600 text-yellow-700'
                    : 'bg-white hover:bg-slate-50 border-slate-400 text-black'
                } font-normal`}
                onClick={() => handlePaymentMethodSelect('usd')}
              >
                Continue with USD
              </Button>
            </div>

            {/* USDC Payment Card */}
            <div className={`relative p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              paymentMethod === 'stablecoin'
                ? 'border-yellow-600 bg-white shadow-md'
                : 'border-yellow-500 hover:border-yellow-600 hover:bg-yellow-50/20'
            }`}
                 onClick={() => setPaymentMethod('stablecoin')}>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-white border border-yellow-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#2775CA"/>
                    <text x="16" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">$</text>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-normal text-black font-sans">Pay with USDC</h3>
                  <p className="text-xs text-black font-light font-sans">MetaMask</p>
                </div>
              </div>
              
              <div className="space-y-1 mb-1">
                <div className="flex items-center space-x-1 text-xs text-black font-light font-sans">
                  <CheckCircle className="h-2 w-2 text-black" />
                  <span>Connect MetaMask wallet</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-black font-light font-sans">
                  <CheckCircle className="h-2 w-2 text-black" />
                  <span>Pay directly with USDC stablecoins</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-black font-light font-sans">
                  <CheckCircle className="h-2 w-2 text-black" />
                  <span>Fast settlement on blockchain</span>
                </div>
              </div>

              <div className="text-xs text-black mb-1 font-light font-sans">
                💡 Instant settlement, blockchain fees may apply. Global option.
              </div>

              {!isWalletConnected ? (
                <Button
                  className="w-full h-7 text-xs bg-white hover:bg-yellow-50 border-2 border-yellow-600 text-yellow-700 font-normal font-sans flex items-center justify-center space-x-1"
                  onClick={() => handlePaymentMethodSelect('stablecoin')}
                >
                  <RobustImage
                    src="/metamask-logo.png"
                    alt="MetaMask"
                    className="w-2 h-2 object-contain"
                    fallbackSrc="data:image/svg+xml,%3csvg width='8' height='8' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%23b45309'%3e%3cpath d='M11.85 1.1L7.1 4.7l.88-2.08L11.85 1.1z'/%3e%3cpath d='M0.15 1.1l4.7 3.65L4 2.62L0.15 1.1z'/%3e%3cpath d='M10.1 8.7l-1.28 1.95l2.75 0.75L12.05 8.8L10.1 8.7z'/%3e%3cpath d='M0.48 8.8L0.95 11.4l2.75-0.75L2.42 8.7L0.48 8.8z'/%3e%3cpath d='M3.58 5.1l-0.8 1.2l2.72 0.12L5.4 4.8L3.58 5.1z'/%3e%3cpath d='M8.42 5.1L6.55 4.75L6.65 6.42l2.72-0.12L8.42 5.1z'/%3e%3c/g%3e%3c/svg%3e"
                  />
                  <span>Connect MetaMask</span>
                </Button>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 p-1 bg-yellow-100 rounded-md">
                    <RobustImage
                      src="/metamask-logo.png"
                      alt="MetaMask"
                      className="w-2 h-2 object-contain"
                      fallbackSrc="data:image/svg+xml,%3csvg width='8' height='8' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%23f59e0b'%3e%3cpath d='M11.85 1.1L7.1 4.7l.88-2.08L11.85 1.1z'/%3e%3cpath d='M0.15 1.1l4.7 3.65L4 2.62L0.15 1.1z'/%3e%3cpath d='M10.1 8.7l-1.28 1.95l2.75 0.75L12.05 8.8L10.1 8.7z'/%3e%3cpath d='M0.48 8.8L0.95 11.4l2.75-0.75L2.42 8.7L0.48 8.8z'/%3e%3cpath d='M3.58 5.1l-0.8 1.2l2.72 0.12L5.4 4.8L3.58 5.1z'/%3e%3cpath d='M8.42 5.1L6.55 4.75L6.65 6.42l2.72-0.12L8.42 5.1z'/%3e%3c/g%3e%3c/svg%3e"
                    />
                    <span className="text-xs text-black font-normal font-sans">
                      Connected: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
                    </span>
                  </div>
                  <Button
                    className="w-full h-7 text-xs bg-white hover:bg-yellow-50 border-2 border-yellow-600 text-yellow-700 font-normal font-sans flex items-center justify-center space-x-1"
                    onClick={() => handlePaymentMethodSelect('stablecoin')}
                  >
                    <RobustImage
                      src="/metamask-logo.png"
                      alt="MetaMask"
                      className="w-2 h-2 object-contain"
                      fallbackSrc="data:image/svg+xml,%3csvg width='8' height='8' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%23b45309'%3e%3cpath d='M11.85 1.1L7.1 4.7l.88-2.08L11.85 1.1z'/%3e%3cpath d='M0.15 1.1l4.7 3.65L4 2.62L0.15 1.1z'/%3e%3cpath d='M10.1 8.7l-1.28 1.95l2.75 0.75L12.05 8.8L10.1 8.7z'/%3e%3cpath d='M0.48 8.8L0.95 11.4l2.75-0.75L2.42 8.7L0.48 8.8z'/%3e%3cpath d='M3.58 5.1l-0.8 1.2l2.72 0.12L5.4 4.8L3.58 5.1z'/%3e%3cpath d='M8.42 5.1L6.55 4.75L6.65 6.42l2.72-0.12L8.42 5.1z'/%3e%3c/g%3e%3c/svg%3e"
                    />
                    <span>Continue with MetaMask</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelPayment}
              className="flex-1 border-2 border-yellow-600 text-black hover:bg-slate-50 font-normal font-sans"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KYC Verification Dialog */}
      <Dialog open={showKycDialog} onOpenChange={setShowKycDialog}>
        <DialogContent className="max-w-md mx-4 max-h-[70vh] flex flex-col top-[10%] translate-y-0">
          <DialogHeader className="text-center space-y-2 flex-shrink-0">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-lg text-black font-medium">
              Before you invest, we need to verify your identity
            </DialogTitle>
            <DialogDescription className="text-black font-light text-xs leading-relaxed">
              This quick verification takes 2–3 minutes and is required to comply with KYC/AML regulations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            <div className="bg-primary/5 p-3 rounded-lg">
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-black font-light">Government-issued photo ID verification</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-black font-light">Address confirmation</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-black font-light">Secure bank account linking</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-600 font-light">
                Your information is encrypted and protected by industry-standard security protocols.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col gap-2 pt-3 flex-shrink-0">
            <Button
              onClick={handleStartKycVerification}
              disabled={isKycVerifying}
              className="w-full bg-primary hover:bg-primary/90 text-sm h-9"
            >
              {isKycVerifying ? 'Verifying...' : 'Start Verification'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowKycDialog(false)}
              className="w-full text-sm h-8"
            >
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* USD Payment Dialog with Plaid Link */}
      <Dialog open={showUsdPaymentDialog} onOpenChange={setShowUsdPaymentDialog}>
        <DialogContent className="max-w-md mx-4 max-h-[80vh] flex flex-col top-[5%] translate-y-0">
          <DialogHeader className="text-center space-y-3 flex-shrink-0">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-xl text-black font-medium">
              Connect Your Bank Account
            </DialogTitle>
            <DialogDescription className="text-black font-light text-sm leading-relaxed">
              Link your bank account securely to invest with USD. All transactions are protected by bank-grade security.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-black font-light">Secure connection via Plaid</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-black font-light">Bank-grade encryption and security</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-black font-light">ACH transfer for your investment</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-black font-light">Works with 11,000+ banks</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-black">Investment Details</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens:</span>
                  <span className="font-medium text-black">{inputMode === 'shares' ? numShares.toLocaleString() : Math.floor(dollarAmount / (property?.pricePerToken || 1)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-black">${(inputMode === 'shares' ? (numShares * (property?.pricePerToken || 0)) : dollarAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property:</span>
                  <span className="font-medium text-black">{property?.name}</span>
                </div>
              </div>
            </div>
            
            <PlaidLink 
              userId={auth.currentUser?.uid || ''}
              onSuccess={handlePlaidSuccess}
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Connect Bank Account
            </PlaidLink>
          </div>
          
          <DialogFooter className="flex-col gap-2 pt-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowUsdPaymentDialog(false)}
              className="w-full text-sm h-9 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Investment Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-xl text-black font-medium">
              Investment Successful!
            </DialogTitle>
            <DialogDescription className="text-black font-light text-sm leading-relaxed">
              Your investment has been processed successfully. You can view it in your portfolio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-black font-light">Investment Amount:</span>
                  <span className="text-black font-medium">
                    ${(stickyTokenQuantity * (property?.pricePerToken || 100)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-light">Tokens Purchased:</span>
                  <span className="text-black font-medium">{stickyTokenQuantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-light">Property:</span>
                  <span className="text-black font-medium">{property?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-light">Payment Method:</span>
                  <span className="text-black font-medium">
                    {successInvestmentData?.paymentMethod === 'stablecoin' ? 'USDC (Cryptocurrency)' : 'USD Bank Transfer'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
              className="w-full sm:flex-1 text-sm"
            >
              Stay on Property
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                navigate("/portfolio");
              }}
              className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-sm"
            >
              View Portfolio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CommertizerX Property Chatbot */}
      {property && (
        <PropertyChatbot
          properties={[property]}
          selectedProperty={property}
        />
      )}
    </div>
  );
}
