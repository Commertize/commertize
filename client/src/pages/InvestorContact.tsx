import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, User, Mail, Phone, MapPin, DollarSign, MessageSquare, Star, Shield, TrendingUp, Zap, Building2, Globe } from "lucide-react";
import { motion } from "framer-motion";

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
  message: z.string().optional(),
});

type InvestorFormData = z.infer<typeof investorSchema>;

export default function InvestorContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
  });

  const onSubmit = async (data: InvestorFormData) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "investors"), {
        ...data,
        createdAt: new Date().toISOString(),
        status: "new",
      });

      toast({
        title: "Thank you for your interest!",
        description: "We've received your information and will contact you soon.",
      });

      reset();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-16">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full blur-xl"
        />
      </div>

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        {/* Enhanced Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Exclusive Access
          </div>
          <h1 className="text-5xl md:text-6xl font-logo font-light mb-6 bg-gradient-to-r from-gray-900 via-primary to-gray-900 bg-clip-text text-transparent">
            Get Early Access to the Future of Commercial Real Estate Investing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Become part of an elite community of forward-thinking investors. Secure early access to premium tokenized commercial real estate opportunities built for institutional-grade returns and global reach.
          </p>
          
          {/* How It Works Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-logo font-light text-center mb-10 text-gray-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="bg-primary/5 rounded-full px-4 py-1 text-primary font-medium text-sm mb-4">Step 1</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign up for the waitlist</h3>
                <p className="text-gray-600">Complete your profile to join our exclusive investor community</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <div className="bg-primary/5 rounded-full px-4 py-1 text-primary font-medium text-sm mb-4">Step 2</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Get priority access when we launch</h3>
                <p className="text-gray-600">Be first to access premium properties before public release</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div className="bg-primary/5 rounded-full px-4 py-1 text-primary font-medium text-sm mb-4">Step 3</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start investing in tokenized properties</h3>
                <p className="text-gray-600">Build your portfolio with fractional real estate investments</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-2xl font-logo font-light mb-6">Waitlist Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Access institutional-grade CRE opportunities</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Invest from anywhere in the world</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Fast onboarding — no banks or brokers</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Secure, blockchain-powered transactions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-logo font-light">Investor Registration</CardTitle>
                <p className="text-gray-600">Complete your profile to join our exclusive investor community</p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="Enter your country"
                  />
                  {errors.country && (
                    <p className="text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Enter your city"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Investment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Investment Amount Range
                  </Label>
                  <Select onValueChange={(value) => setValue("investmentAmount", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investment range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$5,000 - $25,000">$5,000 - $25,000</SelectItem>
                      <SelectItem value="$25,000 - $50,000">$25,000 - $50,000</SelectItem>
                      <SelectItem value="$50,000 - $100,000">$50,000 - $100,000</SelectItem>
                      <SelectItem value="$100,000 - $500,000">$100,000 - $500,000</SelectItem>
                      <SelectItem value="$500,000 - $1,000,000">$500,000 - $1,000,000</SelectItem>
                      <SelectItem value="$1,000,000+">$1,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.investmentAmount && (
                    <p className="text-sm text-red-600">{errors.investmentAmount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Investment Timeframe</Label>
                  <Select onValueChange={(value) => setValue("investmentTimeframe", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediately">Immediately (within 1 month)</SelectItem>
                      <SelectItem value="Short-term">Short-term (1-3 months)</SelectItem>
                      <SelectItem value="Medium-term">Medium-term (3-6 months)</SelectItem>
                      <SelectItem value="Long-term">Long-term (6+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.investmentTimeframe && (
                    <p className="text-sm text-red-600">{errors.investmentTimeframe.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Types of Interest</Label>
                  <Select onValueChange={(value) => setValue("propertyTypes", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                      <SelectItem value="Multifamily">Multifamily</SelectItem>
                      <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyTypes && (
                    <p className="text-sm text-red-600">{errors.propertyTypes.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Investment Experience</Label>
                  <Select onValueChange={(value) => setValue("experience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="Intermediate">Intermediate (1-5 years)</SelectItem>
                      <SelectItem value="Experienced">Experienced (5-10 years)</SelectItem>
                      <SelectItem value="Expert">Expert (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience && (
                    <p className="text-sm text-red-600">{errors.experience.message}</p>
                  )}
                </div>
              </div>

              {/* Additional Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Additional Information (Optional)
                </Label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder="Tell us about your investment goals, preferences, or any questions you have..."
                  rows={4}
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Securing Your Position...
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-5 w-5" />
                      Investor Access
                    </>
                  )}
                </Button>
              </motion.div>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Enhanced Footer Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary mr-2" />
              <span className="font-medium text-gray-900">Secure & Confidential</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your information is protected with bank-grade encryption. By submitting this form, you agree to be contacted by our investment team regarding exclusive property opportunities that match your investment criteria. You can unsubscribe at any time.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-gray-500">
              <span>🔒 SSL Encrypted</span>
              <span>📧 No Spam Policy</span>
              <span>🔐 GDPR Compliant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}