import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User, Star, Building2, Target, CheckCircle2, Upload, Briefcase, UserPlus, ArrowRight, DollarSign, MapPin, Phone, Mail, Calendar, FileText, Building } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Investor Schema
const investorSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  country: z.string().min(2, "Please select your country"),
  city: z.string().min(2, "City is required"),
  investmentAmount: z.string().min(1, "Please specify your investment amount"),
  investmentTimeframe: z.string().min(1, "Please select your investment timeframe"),
  propertyTypes: z.string().min(1, "Please select property types you're interested in"),
  experience: z.string().min(1, "Please select your investment experience"),
  hearAboutUs: z.string().min(1, "Please let us know how you heard about us"),
  message: z.string().optional(),
});

// Sponsor Schema
const sponsorSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  company: z.string().min(2, "Company/Ownership Entity is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  propertyName: z.string().min(2, "Property name is required"),
  propertyLocation: z.string().min(2, "Property location is required"),
  assetType: z.string().min(1, "Please select an asset type"),
  estimatedValue: z.string().min(1, "Please enter estimated property value"),
  capitalNeeded: z.string().min(1, "Please enter capital needed"),
  financingStatus: z.array(z.string()).min(1, "Please select at least one financing status"),
  timeline: z.string().min(1, "Please select a timeline"),
  hearAboutUs: z.string().min(1, "Please let us know how you heard about us"),
  additionalInfo: z.string().optional(),
});

type InvestorFormData = z.infer<typeof investorSchema>;
type SponsorFormData = z.infer<typeof sponsorSchema>;
type FormType = 'investor' | 'sponsor' | null;

export default function Waitlist() {
  const [selectedForm, setSelectedForm] = useState<FormType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sponsorFinancingStatus, setSponsorFinancingStatus] = useState<string[]>([]);
  const { toast } = useToast();

  const investorForm = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
  });

  const sponsorForm = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
  });

  const onInvestorSubmit = async (data: InvestorFormData) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "investors"), {
        ...data,
        type: "investor",
        createdAt: new Date().toISOString(),
        status: "new",
      });

      toast({
        title: "Welcome to the Investor Waitlist!",
        description: "We've received your information and will contact you with exclusive investment opportunities.",
      });

      investorForm.reset();
    } catch (error) {
      console.error("Error submitting investor form:", error);
      toast({
        title: "Error",
        description: "Failed to submit your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSponsorSubmit = async (data: SponsorFormData) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "sponsors"), {
        ...data,
        financingStatus: sponsorFinancingStatus,
        type: "sponsor",
        createdAt: new Date().toISOString(),
        status: "new",
      });

      toast({
        title: "Welcome to the Sponsor Waitlist!",
        description: "We've received your property information and will contact you about tokenization opportunities.",
      });

      sponsorForm.reset();
      setSponsorFinancingStatus([]);
    } catch (error) {
      console.error("Error submitting sponsor form:", error);
      toast({
        title: "Error",
        description: "Failed to submit your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinancingStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSponsorFinancingStatus([...sponsorFinancingStatus, status]);
    } else {
      setSponsorFinancingStatus(sponsorFinancingStatus.filter(s => s !== status));
    }
    sponsorForm.setValue('financingStatus', 
      checked ? [...sponsorFinancingStatus, status] : sponsorFinancingStatus.filter(s => s !== status)
    );
  };

  if (selectedForm === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Subtle Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-32 right-32 w-48 h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-32 left-32 w-56 h-56 bg-gradient-to-br from-primary/5 to-primary/15 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <section className="py-20 px-4">
            <div className="container max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-20"
              >
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/20 text-primary px-6 py-3 rounded-full text-sm font-medium mb-8 border border-primary/20">
                  <Star className="w-4 h-4" />
                  Join Commertize — Investors & Sponsors Welcome
                </div>
                <h1 className="text-3xl md:text-5xl font-light mb-6 bg-gradient-to-r from-slate-900 via-primary to-slate-900 bg-clip-text text-transparent leading-tight">
                  Join the Future of Commercial Real Estate<br />
                  <span className="font-medium">Tokenize. Invest. Grow.</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12 font-light">
                  Whether you're an investor seeking exclusive opportunities or a property owner ready to unlock liquidity, Commertize puts you at the center of the tokenized CRE revolution.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Why Join Early Section */}
          <section className="py-20 bg-slate-50/50">
            <div className="container max-w-6xl mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center"
              >
                <h2 className="text-4xl font-light text-slate-800 mb-4">Why Join Early?</h2>
                <p className="text-xl text-slate-600 mb-16 font-light">Secure your place in the next era of real estate investing.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="text-center group">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Exclusive Access</h3>
                    <p className="text-slate-600 leading-relaxed">Get first entry into premium tokenized commercial real estate deals before they reach the public marketplace.</p>
                  </div>
                  <div className="text-center group">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Institutional Quality</h3>
                    <p className="text-slate-600 leading-relaxed">Invest in top-tier commercial properties once reserved only for major funds and institutions.</p>
                  </div>
                  <div className="text-center group">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Star className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Priority Benefits</h3>
                    <p className="text-slate-600 leading-relaxed">Unlock reduced fees, early deal access, and proprietary market insights from our AI research team.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="py-20 px-4">
            <div className="container max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-20"
              >
                {/* Selection Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <Card className="group h-full cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 hover:border-primary/50 bg-white/80 backdrop-blur-sm hover:bg-white"
                          onClick={() => {
                            setSelectedForm('investor');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}>
                      <CardHeader className="text-center pb-6 pt-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <UserPlus className="w-10 h-10 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-slate-800 mb-3">I'm an Investor</CardTitle>
                        <CardDescription className="text-slate-600 text-base leading-relaxed">
                          Unlock access to premium tokenized commercial real estate with institutional-grade structures.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center px-8 pb-8">
                        <div className="space-y-3 mb-8">
                          <div className="flex items-center justify-center gap-3 text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Early access to prime properties</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Fractional ownership from $1,000</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">AI-powered insights & global diversification</span>
                          </div>
                        </div>
                        <Button className="w-full h-12 text-base font-medium" size="lg">
                          Join Investor Waitlist
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  >
                    <Card className="group h-full cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 hover:border-primary/50 bg-white/80 backdrop-blur-sm hover:bg-white"
                          onClick={() => {
                            setSelectedForm('sponsor');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}>
                      <CardHeader className="text-center pb-6 pt-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Building className="w-10 h-10 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-slate-800 mb-3">I'm a Sponsor / Property Owner</CardTitle>
                        <CardDescription className="text-slate-600 text-base leading-relaxed">
                          Raise capital faster by tokenizing your property on Commertize's marketplace.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center px-8 pb-8">
                        <div className="space-y-3 mb-8">
                          <div className="flex items-center justify-center gap-3 text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Access a global pool of accredited investors</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Flexible liquidity solutions without losing ownership</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Streamlined onboarding with AI-driven deal analysis</span>
                          </div>
                        </div>
                        <Button className="w-full h-12 text-base font-medium border-2 border-primary hover:bg-primary hover:text-white" size="lg" variant="outline">
                          Join Sponsor Waitlist
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>


        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedForm(null)}
            className="mb-8 text-slate-600 hover:text-slate-800"
          >
            ← Back to Options
          </Button>
        </div>

        {selectedForm === 'investor' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-8 pt-12">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-light text-slate-800 mb-3">Investor Waitlist</CardTitle>
                <CardDescription className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
                  Join our exclusive investor community and get early access to premium tokenized commercial real estate opportunities with institutional-grade returns.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-12 pb-12">
                <form onSubmit={investorForm.handleSubmit(onInvestorSubmit)} className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-3">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="text-slate-700 font-medium">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          {...investorForm.register("firstName")}
                          className={`h-12 ${investorForm.formState.errors.firstName ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {investorForm.formState.errors.firstName && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter your last name"
                          {...investorForm.register("lastName")}
                          className={`h-12 ${investorForm.formState.errors.lastName ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {investorForm.formState.errors.lastName && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-slate-700 font-medium">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          {...investorForm.register("email")}
                          className={`h-12 ${investorForm.formState.errors.email ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {investorForm.formState.errors.email && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...investorForm.register("phone")}
                          className={`h-12 ${investorForm.formState.errors.phone ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {investorForm.formState.errors.phone && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="country" className="text-slate-700 font-medium">Country *</Label>
                        <Select onValueChange={(value) => investorForm.setValue("country", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">🇺🇸 United States</SelectItem>
                            <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                            <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                            <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                            <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                            <SelectItem value="FR">🇫🇷 France</SelectItem>
                            <SelectItem value="other">🌍 Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {investorForm.formState.errors.country && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.country.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="city" className="text-slate-700 font-medium">City *</Label>
                        <Input
                          id="city"
                          placeholder="Enter your city"
                          {...investorForm.register("city")}
                          className={`h-12 ${investorForm.formState.errors.city ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {investorForm.formState.errors.city && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Investment Preferences Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-3">Investment Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="investmentAmount" className="text-slate-700 font-medium">Investment Amount *</Label>
                        <Select onValueChange={(value) => investorForm.setValue("investmentAmount", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                            <SelectValue placeholder="Select your investment range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1000-5000">💰 $1,000 - $5,000</SelectItem>
                            <SelectItem value="5000-25000">💰 $5,000 - $25,000</SelectItem>
                            <SelectItem value="25000-100000">💰 $25,000 - $100,000</SelectItem>
                            <SelectItem value="100000-500000">💎 $100,000 - $500,000</SelectItem>
                            <SelectItem value="500000+">🏆 $500,000+</SelectItem>
                          </SelectContent>
                        </Select>
                        {investorForm.formState.errors.investmentAmount && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.investmentAmount.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="investmentTimeframe" className="text-slate-700 font-medium">Investment Timeframe *</Label>
                        <Select onValueChange={(value) => investorForm.setValue("investmentTimeframe", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                            <SelectValue placeholder="When are you looking to invest?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediately">⚡ Immediately</SelectItem>
                            <SelectItem value="1-3months">📅 1-3 months</SelectItem>
                            <SelectItem value="3-6months">📅 3-6 months</SelectItem>
                            <SelectItem value="6-12months">📅 6-12 months</SelectItem>
                            <SelectItem value="researching">🔍 Just researching</SelectItem>
                          </SelectContent>
                        </Select>
                        {investorForm.formState.errors.investmentTimeframe && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.investmentTimeframe.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="propertyTypes" className="text-slate-700 font-medium">Property Types of Interest *</Label>
                        <Select onValueChange={(value) => investorForm.setValue("propertyTypes", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                            <SelectValue placeholder="Which property types interest you?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="office">🏢 Office Buildings</SelectItem>
                            <SelectItem value="datacenters">💾 Datacenters</SelectItem>
                            <SelectItem value="multifamily">🏠 Multifamily/Apartments</SelectItem>
                            <SelectItem value="retail">🛍️ Retail Centers</SelectItem>
                            <SelectItem value="industrial">🏭 Industrial/Warehouses</SelectItem>
                            <SelectItem value="hotel">🏨 Hotels</SelectItem>
                            <SelectItem value="mixed-use">🏘️ Mixed-Use</SelectItem>
                            <SelectItem value="all">🌟 All Property Types</SelectItem>
                          </SelectContent>
                        </Select>
                        {investorForm.formState.errors.propertyTypes && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.propertyTypes.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="experience" className="text-slate-700 font-medium">Investment Experience *</Label>
                        <Select onValueChange={(value) => investorForm.setValue("experience", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                            <SelectValue placeholder="What's your real estate investment experience?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">🌱 New to real estate investing</SelectItem>
                            <SelectItem value="some">📈 Some real estate experience</SelectItem>
                            <SelectItem value="experienced">🎯 Experienced real estate investor</SelectItem>
                            <SelectItem value="professional">🏆 Professional/Institutional investor</SelectItem>
                          </SelectContent>
                        </Select>
                        {investorForm.formState.errors.experience && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.experience.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-3">Additional Information</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="hearAboutUs" className="text-slate-700 font-medium">How did you hear about us? *</Label>
                        <Select onValueChange={(value) => investorForm.setValue("hearAboutUs", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                            <SelectValue placeholder="How did you discover Commertize?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">🔍 Google Search</SelectItem>
                            <SelectItem value="social-media">📱 Social Media</SelectItem>
                            <SelectItem value="referral">👥 Friend/Colleague Referral</SelectItem>
                            <SelectItem value="news">📰 News Article/Blog</SelectItem>
                            <SelectItem value="event">🎪 Conference/Event</SelectItem>
                            <SelectItem value="other">📋 Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {investorForm.formState.errors.hearAboutUs && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {investorForm.formState.errors.hearAboutUs.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="message" className="text-slate-700 font-medium">Additional Message (Optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your investment goals, specific interests, or any questions you might have..."
                          className="min-h-[120px] border-slate-300 focus:border-primary resize-none"
                          {...investorForm.register("message")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Join Investor Waitlist
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedForm === 'sponsor' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-8 pt-12">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-light text-slate-800 mb-3">Sponsor / Property Owner Waitlist</CardTitle>
                <CardDescription className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
                  Transform your commercial property into a tokenized investment opportunity and access global capital markets through blockchain technology.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-12 pb-12">
                <form onSubmit={sponsorForm.handleSubmit(onSponsorSubmit)} className="space-y-8">
                  {/* Contact Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="text-slate-700 font-medium">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          {...sponsorForm.register("fullName")}
                          className={`h-12 ${sponsorForm.formState.errors.fullName ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {sponsorForm.formState.errors.fullName && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="company" className="text-slate-700 font-medium">Company / Ownership Entity *</Label>
                        <Input
                          id="company"
                          placeholder="Company or LLC name"
                          {...sponsorForm.register("company")}
                          className={`h-12 ${sponsorForm.formState.errors.company ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {sponsorForm.formState.errors.company && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.company.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-slate-700 font-medium">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          {...sponsorForm.register("email")}
                          className={`h-12 ${sponsorForm.formState.errors.email ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {sponsorForm.formState.errors.email && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...sponsorForm.register("phone")}
                          className={`h-12 ${sponsorForm.formState.errors.phone ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {sponsorForm.formState.errors.phone && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Property Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-3">Property Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="propertyName" className="text-slate-700 font-medium">Property Name *</Label>
                        <Input
                          id="propertyName"
                          placeholder="e.g., SkyTower Office Complex"
                          {...sponsorForm.register("propertyName")}
                          className={`h-12 ${sponsorForm.formState.errors.propertyName ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {sponsorForm.formState.errors.propertyName && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.propertyName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="propertyLocation" className="text-slate-700 font-medium">Property Location *</Label>
                        <Input
                          id="propertyLocation"
                          placeholder="e.g., Los Angeles, CA"
                          {...sponsorForm.register("propertyLocation")}
                          className={`h-12 ${sponsorForm.formState.errors.propertyLocation ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {sponsorForm.formState.errors.propertyLocation && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.propertyLocation.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="assetType" className="text-slate-700 font-medium">Asset Type *</Label>
                      <Select onValueChange={(value) => sponsorForm.setValue("assetType", value)}>
                        <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hotel">🏨 Hotel</SelectItem>
                          <SelectItem value="office">🏢 Office</SelectItem>
                          <SelectItem value="datacenters">💾 Datacenters</SelectItem>
                          <SelectItem value="multifamily">🏠 Multifamily</SelectItem>
                          <SelectItem value="retail">🛍️ Retail</SelectItem>
                          <SelectItem value="industrial">🏭 Industrial</SelectItem>
                          <SelectItem value="mixed-use">🏘️ Mixed-Use</SelectItem>
                          <SelectItem value="other">📋 Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {sponsorForm.formState.errors.assetType && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {sponsorForm.formState.errors.assetType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financial Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-3">Financial Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="estimatedValue" className="text-slate-700 font-medium">Estimated Property Value *</Label>
                        <Input
                          id="estimatedValue"
                          placeholder="e.g., $5,000,000"
                          {...sponsorForm.register("estimatedValue")}
                          className={`h-12 ${sponsorForm.formState.errors.estimatedValue ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {sponsorForm.formState.errors.estimatedValue && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.estimatedValue.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="capitalNeeded" className="text-slate-700 font-medium">Capital Needed *</Label>
                        <Input
                          id="capitalNeeded"
                          placeholder="e.g., $2,000,000"
                          {...sponsorForm.register("capitalNeeded")}
                          className={`h-12 ${sponsorForm.formState.errors.capitalNeeded ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-primary"}`}
                        />
                        {sponsorForm.formState.errors.capitalNeeded && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.capitalNeeded.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-700 font-medium">Current Financing Status *</Label>
                      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                        {[
                          { id: "free-clear", label: "Free & Clear" },
                          { id: "has-mortgage", label: "Has Mortgage" },
                          { id: "refinancing", label: "Refinancing" },
                          { id: "acquisition", label: "Acquisition" }
                        ].map((option) => (
                          <div key={option.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={option.id}
                              checked={sponsorFinancingStatus.includes(option.id)}
                              onCheckedChange={(checked) => handleFinancingStatusChange(option.id, checked as boolean)}
                              className="border-slate-400"
                            />
                            <Label htmlFor={option.id} className="text-sm text-slate-700 cursor-pointer">{option.label}</Label>
                          </div>
                        ))}
                      </div>
                      {sponsorForm.formState.errors.financingStatus && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {sponsorForm.formState.errors.financingStatus.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timeline & Discovery Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-3">Timeline & Discovery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="timeline" className="text-slate-700 font-medium">Timeline to Raise Capital *</Label>
                        <Select onValueChange={(value) => sponsorForm.setValue("timeline", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                            <SelectValue placeholder="Select your timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">🚨 Urgent (&lt; 1 month)</SelectItem>
                            <SelectItem value="1-3months">📅 1–3 months</SelectItem>
                            <SelectItem value="3-6months">📅 3–6 months</SelectItem>
                            <SelectItem value="flexible">⏰ Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        {sponsorForm.formState.errors.timeline && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.timeline.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="hearAboutUs" className="text-slate-700 font-medium">How did you hear about us? *</Label>
                        <Select onValueChange={(value) => sponsorForm.setValue("hearAboutUs", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-primary">
                            <SelectValue placeholder="How did you discover Commertize?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">🔍 Google Search</SelectItem>
                            <SelectItem value="social-media">📱 Social Media</SelectItem>
                            <SelectItem value="referral">🤝 Industry Referral</SelectItem>
                            <SelectItem value="conference">🎪 Real Estate Conference</SelectItem>
                            <SelectItem value="news">📰 Industry Publication</SelectItem>
                            <SelectItem value="broker">🏢 Commercial Broker</SelectItem>
                            <SelectItem value="other">📋 Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {sponsorForm.formState.errors.hearAboutUs && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {sponsorForm.formState.errors.hearAboutUs.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="additionalInfo" className="text-slate-700 font-medium">Additional Information (Optional)</Label>
                      <Textarea
                        id="additionalInfo"
                        placeholder="Tell us more about your property, investment goals, current occupancy, rental income, or any supporting documents you can provide..."
                        className="min-h-[120px] border-slate-300 focus:border-primary resize-none"
                        {...sponsorForm.register("additionalInfo")}
                      />
                      <p className="text-sm text-slate-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        📄 <strong>Note:</strong> You'll be able to upload supporting documents (OM, rent roll, appraisal) during our follow-up consultation after submitting this form.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg border-2 border-primary" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Apply as a Sponsor
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}