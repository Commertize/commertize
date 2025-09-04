import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PROPERTY_TYPES, PropertyType } from "@/lib/propertyTypes";
import { PROPERTY_STATUS, PropertyStatus } from "@/lib/propertyStatus";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Coins, Shield, Award } from "lucide-react";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { createPropertyWithImages } from "@/lib/firebase-storage";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];
const MAX_IMAGES = 100;
const MAX_DOCUMENTS = 20;
const CURRENT_YEAR = new Date().getFullYear();

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company name is required"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number")
    .refine((val) => {
      const cleaned = val.replace(/\D/g, "");
      return cleaned.length >= 10;
    }, "Please enter a valid phone number"),
  cellPhoneNumber: z.string().min(10, "Please enter a valid cell phone number")
    .refine((val) => {
      const cleaned = val.replace(/\D/g, "");
      return cleaned.length >= 10;
    }, "Please enter a valid cell phone number"),
  name: z.string().min(2),
  email: z.string().email(),
  countryCode: z.string().min(1, "Country code is required"),
  cellCountryCode: z.string().min(1, "Cell phone country code is required"),
  type: z.enum(
    Object.values(PROPERTY_TYPES) as [PropertyType, ...PropertyType[]],
  ),
  propertyClass: z.string().min(1, "Property class is required"),
  status: z.enum(
    Object.values(PROPERTY_STATUS) as [PropertyStatus, ...PropertyStatus[]],
  ),
  location: z.string(),
  description: z.string(),
  minInvestment: z.coerce.number().min(0, "Minimum investment must be a positive number"),
  targetedIRR: z.coerce.number().min(0, "IRR must be a positive number"),
  targetedYield: z.coerce.number().min(0, "Yield must be a positive number"),
  equityMultiple: z.coerce.number().min(0, "Equity multiple must be a positive number"),
  netOperatingIncome: z.coerce.number().min(0, "Net Operating Income must be a positive number"),
  squareFeet: z.coerce.number().min(0, "Square footage must be a positive number"),
  riskFactor: z.enum(["low", "moderate", "high"]),
  daysLeft: z.coerce.number().min(1, "Days left must be at least 1"),
  units: z.coerce.number().min(1, "Number of units must be at least 1"),
  targetEquity: z.coerce.number().min(0, "Target equity must be a positive number"),
  yearBuilt: z.coerce.number().min(1800).max(CURRENT_YEAR, "Year built cannot be in the future"),
  closingDate: z.string().min(1, "Closing date is required"),
  pricePerToken: z.coerce.number().min(0, "Price per token must be a positive number"),
  targetPeriod: z.string().min(1, "Target period is required"),
});

const Submit = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedBrochure, setSelectedBrochure] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      phoneNumber: "",
      cellPhoneNumber: "",
      name: "",
      email: "",
      countryCode: "+1",
      cellCountryCode: "+1",
      type: "" as PropertyType,
      propertyClass: "",
      status: "Construction" as PropertyStatus,
      location: "",
      description: "",
      minInvestment: 0,
      targetedIRR: 0,
      targetedYield: 0,
      equityMultiple: 0,
      netOperatingIncome: 0,
      squareFeet: 0,
      riskFactor: "moderate",
      daysLeft: 30,
      units: 0,
      targetEquity: 0,
      yearBuilt: CURRENT_YEAR,
      closingDate: new Date().toISOString().split("T")[0],
      pricePerToken: 1,
      targetPeriod: "5 years*",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError(null);

    if (selectedFiles.length + files.length > MAX_IMAGES) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `You can only upload up to ${MAX_IMAGES} images.`,
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `${file.name} is not a valid image type.`,
        });
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `${file.name} is larger than 5MB.`,
        });
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadError(null);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError(null);

    if (selectedDocuments.length + files.length > MAX_DOCUMENTS) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `You can only upload up to ${MAX_DOCUMENTS} documents.`,
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `${file.name} is not a valid document type.`,
        });
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `${file.name} is larger than 5MB.`,
        });
        return false;
      }
      return true;
    });

    setSelectedDocuments((prev) => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setSelectedDocuments((prev) => prev.filter((_, i) => i !== index));
    setUploadError(null);
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `${file.name} is not a valid document type.`,
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `${file.name} is larger than 5MB.`,
      });
      return;
    }

    setSelectedBrochure(file);
  };

  const removeBrochure = () => {
    setSelectedBrochure(null);
    setUploadError(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (selectedFiles.length === 0) {
        setUploadError("Please select at least one image");
        return;
      }

      setUploading(true);
      setUploadError(null);

      console.log("Starting property submission...");
      console.log(
        "Uploading",
        selectedFiles.length,
        "images,",
        selectedDocuments.length,
        "documents, and",
        selectedBrochure ? "1 brochure" : "no brochure",
      );

      try {
        const propertyData = {
          ...values,
        };

        const propertyId = await createPropertyWithImages(propertyData, {
          images: selectedFiles,
          documents: selectedDocuments,
          brochure: selectedBrochure ? [selectedBrochure] : undefined,
        });
        console.log("Property created successfully with ID:", propertyId);

        setSubmitted(true);
        toast({
          title: "Success",
          description: "Your property has been submitted successfully!",
        });

        // Reset form and files
        form.reset();
        setSelectedFiles([]);
        setSelectedDocuments([]);
        setSelectedBrochure(null);
        setPreviews([]);
      } catch (error) {
        console.error("Firebase error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to upload to Firebase";
        setUploadError(errorMessage);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error("Error submitting property:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit property";
      setUploadError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Property Submitted Successfully!
            </CardTitle>
            <p className="text-muted-foreground">
              Thank you for submitting your property. Our team will review your
              submission shortly.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="prose max-w-none">
              <p>
                Our team at Commertize is prepared to transform your asset on
                our CRE Marketplace. We proudly accept commercial properties
                from around the globe—including the U.S.—and we're dedicated to
                helping sponsors leverage our broad network to raise capital.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>
                    Our team will review your property details and contact you
                    within 2 business days.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>
                    You'll receive an email confirmation with your submission
                    details and tracking number.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>
                    Once approved, your property will be listed on our
                    marketplace.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/marketplace">View Marketplace</Link>
              </Button>
              <Button onClick={() => setSubmitted(false)}>
                Submit Another Property
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, "");
    let formatted = "";

    if (cleaned.length > 0) {
      formatted = `(${cleaned.slice(0, 3)}`;
      if (cleaned.length > 3) {
        formatted += `) ${cleaned.slice(3, 6)}`;
      }
      if (cleaned.length > 6) {
        formatted += `-${cleaned.slice(6)}`;
      }
    }
    return formatted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="container relative py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-logo font-light text-foreground tracking-tight">
                Transform Your Property into a 
                <span className="block text-primary bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                  Digital Asset
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Elevate your real estate investment strategy with Commertize.
                Our platform connects commercial property owners to a global network
                of accredited investors, helping you raise capital without
                sacrificing control of your property.
              </p>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                <span>SEC Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                <span>Blockchain Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                <span>Global Reach</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container py-20">
        <div className="max-w-6xl mx-auto space-y-16">

          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-logo font-light text-foreground">
              Why Tokenize with Commertize?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unlock the power of blockchain technology to revolutionize your real estate portfolio
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  Recapitalize Up to 90% of Your Equity
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gain significant liquidity while maintaining majority
                  ownership and control of your property.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Stay in Control</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Keep your GP status and continue running daily operations
                  with full decision-making authority.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  Retain Fee Income
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Preserve your existing management fees as you broaden your
                  investor base globally.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-yellow-600/10 p-8 text-center">
              <h2 className="text-3xl font-logo font-light text-foreground mb-4">Property Submission Form</h2>
              <p className="text-muted-foreground">
                Our team thoroughly reviews each property submission to ensure it meets our marketplace standards
              </p>
            </div>

            <div className="p-8 md:p-12">

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                  {/* Contact Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">1</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Contact Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                {/* Phone number fields */}
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem className="w-1/4">
                        <FormLabel>Country Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1"
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (!value.startsWith("+")) {
                                value = "+" + value;
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(555) 000-0000"
                            {...field}
                            value={formatPhoneNumber(field.value)}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cell Phone number fields */}
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="cellCountryCode"
                    render={({ field }) => (
                      <FormItem className="w-1/4">
                        <FormLabel>Cell Country Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1"
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (!value.startsWith("+")) {
                                value = "+" + value;
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cellPhoneNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Cell Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(555) 000-0000"
                            {...field}
                            value={formatPhoneNumber(field.value)}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Property Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Property Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">2</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Property Details</h3>
                    </div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PROPERTY_TYPES).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Class A">Class A</SelectItem>
                          <SelectItem value="Class B">Class B</SelectItem>
                          <SelectItem value="Class C">Class C</SelectItem>
                          <SelectItem value="Class D">Class D</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Description</FormLabel>
                      <FormControl>
                        <div className="min-h-[300px]">
                          <ReactQuill
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Tell us about your property..."
                            style={{ height: '250px', marginBottom: '50px' }}
                            modules={{
                              toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                [{ 'indent': '-1'}, { 'indent': '+1' }],
                                ['link', 'image'],
                                ['clean']
                              ]
                            }}
                            formats={[
                              'header', 'bold', 'italic', 'underline', 'strike',
                              'color', 'background', 'list', 'bullet', 'indent',
                              'link', 'image'
                            ]}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                    />
                  </div>

                  {/* Financial Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">4</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Financial Information</h3>
                    </div>
              <FormField
                control={form.control}
                name="minInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Investment ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetedIRR"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Targeted IRR (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetedYield"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Targeted Yield (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equityMultiple"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equity Multiple</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* New Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Additional Property Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Units</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetEquity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Equity ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1800"
                          max={CURRENT_YEAR}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="closingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Class A">Class A</SelectItem>
                          <SelectItem value="Class B">Class B</SelectItem>
                          <SelectItem value="Class C">Class C</SelectItem>
                          <SelectItem value="Class D">Class D</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PROPERTY_STATUS).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="netOperatingIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Operating Income ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="100000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                    <FormField
                      control={form.control}
                      name="squareFeet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Footage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="5000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Media Upload Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">3</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Property Media & Documents</h3>
                    </div>
                    
                    <div>
                      <FormLabel>Property Images</FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload up to 100 images (max 5MB each, JPG, PNG or WebP)
                      </p>
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleFileChange}
                        className="cursor-pointer"
                        disabled={uploading}
                      />
                      {uploadError && (
                        <p className="text-sm text-destructive mt-2">{uploadError}</p>
                      )}
                    </div>

                    {/* Image Previews */}
                    {previews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={uploading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <FormLabel>Property Documents</FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload up to 20 documents (max 5MB each, PDF, DOC, DOCX, XLS,
                        XLSX, or TXT)
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                        multiple
                        onChange={handleDocumentChange}
                        className="cursor-pointer"
                        disabled={uploading}
                      />
                      {uploadError && (
                        <p className="text-sm text-destructive mt-2">{uploadError}</p>
                      )}
                    </div>

                    {/* Document List */}
                    {selectedDocuments.length > 0 && (
                      <div className="space-y-2">
                        {selectedDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                          >
                            <span className="truncate max-w-[80%]">{doc.name}</span>
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeDocument(index)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <FormLabel>Property Brochure</FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a brochure (max 5MB, PDF, DOC, DOCX)
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleBrochureChange}
                        className="cursor-pointer"
                        disabled={uploading}
                      />
                      {uploadError && (
                        <p className="text-sm text-destructive mt-2">{uploadError}</p>
                      )}
                    </div>

                    {/* Brochure Preview */}
                    {selectedBrochure && (
                      <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <span className="truncate max-w-[80%]">
                          {selectedBrochure.name}
                        </span>
                        <button
                          type="button"
                          onClick={removeBrochure}
                          className="text-destructive hover:text-destructive/90"
                          disabled={uploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={uploading}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      "Submit Property"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;