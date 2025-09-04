import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  investorType: z.enum(["1", "2"], {
    required_error: "Please select investor type",
  }),
  investorReg: z.enum(["1", "2"], {
    required_error: "Please select regulation type",
  }),
  institutionKind: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], {
    required_error: "Please select institution type",
  }).optional(),
  propertyTypes: z.array(z.string()).min(1, "Please select at least one property type"),
  propertyClass: z.array(z.string()).min(1, "Please select at least one property class"),
  estateOwned: z.enum(["1", "2", "3", "4"], {
    required_error: "Please select estate ownership range",
  }),
  investmentRisk: z.enum(["1", "2", "3", "4", "5"], {
    required_error: "Please select investment risk tolerance",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function InvestorQuestionnaire() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyTypes: [],
      propertyClass: [],
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        sessionStorage.setItem('redirectAfterLogin', '/questionnaire');
        setLocation("/account");
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      // Prepare email content
      const emailContent = `
        New Questionnaire Submission
        
        User: ${user.email}
        
        Investor Type: ${data.investorType === "1" ? "Individual" : "Institutional"}
        Regulation Type: ${data.investorReg === "1" ? "Regulation D" : "Regulation S"}
        ${data.institutionKind ? `Institution Type: ${getInstitutionType(data.institutionKind)}` : ""}
        
        Property Types: ${data.propertyTypes.map(getPropertyType).join(", ")}
        Property Classes: ${data.propertyClass.map(getPropertyClass).join(", ")}
        Estate Owned: ${getEstateOwnedRange(data.estateOwned)}
        Investment Risk: ${getRiskLevel(data.investmentRisk)}
      `;

      // Send email
      const response = await fetch("/api/send-questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "cameron@commertize.com",
          subject: "New Investor Questionnaire Submission",
          content: emailContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit questionnaire");
      }

      toast({
        title: "Success",
        description: "Your questionnaire has been submitted successfully",
      });

      // Redirect to dashboard or home
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Error submitting questionnaire:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit questionnaire",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Investment Profile Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-muted-foreground">
              Complete your profile so we can alert you on properties that matches
              your investment needs
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="investorType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Are you an individual or institutional investor?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="individual" />
                          <Label htmlFor="individual">Individual</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="institutional" />
                          <Label htmlFor="institutional">Institutional</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investorReg"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Are you a Regulation D or Regulation S investor?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="regD" />
                            <Label htmlFor="regD">Regulation D (U.S. Accredited Investor)</Label>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            In the U.S., the term Accredited Investor is used by the Securities and Exchange Commission (SEC) under Regulation D to refer to investors who are financially sophisticated and have a reduced need for the protection provided by regulatory disclosure filings.
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="regS" />
                            <Label htmlFor="regS">Regulation S (Investors outside the U.S.)</Label>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            Regulation S provides an SEC compliant way for US companies to raise capital from investors who are outside the U.S.
                          </p>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("investorType") === "2" && (
                <FormField
                  control={form.control}
                  name="institutionKind"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>What kind of institution do you represent?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="family" />
                            <Label htmlFor="family">Family Office/Trust</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="pe" />
                            <Label htmlFor="pe">Private Equity</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="hedge" />
                            <Label htmlFor="hedge">Hedge Fund</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="bank" />
                            <Label htmlFor="bank">Bank or Insurance Company</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5" id="broker" />
                            <Label htmlFor="broker">Broker-Dealer</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="6" id="ria" />
                            <Label htmlFor="ria">Registered Investment Advisor</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="7" id="mutual" />
                            <Label htmlFor="mutual">Mutual Fund</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="8" id="sovereign" />
                            <Label htmlFor="sovereign">Sovereign Wealth Fund</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="9" id="pension" />
                            <Label htmlFor="pension">Pension/Retirement Plan</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="10" id="endowment" />
                            <Label htmlFor="endowment">Endowment or Non-Profit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="11" id="reit" />
                            <Label htmlFor="reit">Corporation or Real Estate Investment Trust</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="12" id="vc" />
                            <Label htmlFor="vc">Venture Capital</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="13" id="other" />
                            <Label htmlFor="other">Other Business Partnership</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="propertyTypes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>What property types are you most interested in?</FormLabel>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: "1", label: "Apartments" },
                        { id: "2", label: "Commercial" },
                        { id: "3", label: "Retail" },
                        { id: "4", label: "Student housing" },
                        { id: "5", label: "Hospitality" },
                        { id: "6", label: "Industrial" },
                        { id: "7", label: "Mixed use" },
                        { id: "8", label: "Condominium" },
                      ].map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="propertyTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyClass"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>What property class you're interested in?</FormLabel>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: "1", label: "Class A" },
                        { id: "2", label: "Class B" },
                        { id: "3", label: "Class C" },
                        { id: "4", label: "Mixed Class" },
                      ].map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="propertyClass"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estateOwned"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>How much Commercial Real Estate do you currently own?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="under1m" />
                          <Label htmlFor="under1m">Under $1,000,000</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="1m-1.5m" />
                          <Label htmlFor="1m-1.5m">$1,000,000 - $1,500,000</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="1.5m-3m" />
                          <Label htmlFor="1.5m-3m">$1,500,000 - $3,000,000</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4" id="over3m" />
                          <Label htmlFor="over3m">$3,000,000 and Over</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investmentRisk"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Please indicate which of the following most closely matches your investment risk tolerance level.</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="conservative" />
                            <Label htmlFor="conservative" className="font-semibold">Conservative</Label>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            I want to preserve my initial investment, with minimum risk, even if that means the investments do not generate significant income or returns and may not keep pace with inflation.
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="modCons" />
                            <Label htmlFor="modCons" className="font-semibold">Moderately Conservative</Label>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            I am willing to accept a low risk to my initial investment, including low volatility, to seek a modest level of return on my investment.
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="moderate" />
                            <Label htmlFor="moderate" className="font-semibold">Moderate</Label>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            I am willing to accept some risk to my initial investment and tolerate some volatility to seek higher returns and understand I could lose a portion of the money invested.
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="modAgg" />
                            <Label htmlFor="modAgg" className="font-semibold">Moderately Aggressive</Label>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            I am willing to accept high risk to my initial investment, including high volatility, to seek high returns over time, and understand I could lose a substantial amount of the money invested.
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5" id="significant" />
                            <Label htmlFor="significant" className="font-semibold">Significant Risk</Label>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            I am willing to accept maximum risk to my initial investment to aggressively seek maximum returns, and understand I could lose most, or all, of the money invested.
                          </p>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function getInstitutionType(value: string): string {
  const types: Record<string, string> = {
    "1": "Family Office/Trust",
    "2": "Private Equity",
    "3": "Hedge Fund",
    "4": "Bank or Insurance Company",
    "5": "Broker-Dealer",
    "6": "Registered Investment Advisor",
    "7": "Mutual Fund",
    "8": "Sovereign Wealth Fund",
    "9": "Pension/Retirement Plan",
    "10": "Endowment or Non-Profit",
    "11": "Corporation or Real Estate Investment Trust",
    "12": "Venture Capital",
    "13": "Other Business Partnership",
  };
  return types[value] || value;
}

function getPropertyType(value: string): string {
  const types: Record<string, string> = {
    "1": "Apartments",
    "2": "Commercial",
    "3": "Retail",
    "4": "Student housing",
    "5": "Hospitality",
    "6": "Industrial",
    "7": "Mixed use",
    "8": "Condominium",
  };
  return types[value] || value;
}

function getPropertyClass(value: string): string {
  const classes: Record<string, string> = {
    "1": "Class A",
    "2": "Class B",
    "3": "Class C",
    "4": "Mixed Class",
  };
  return classes[value] || value;
}

function getEstateOwnedRange(value: string): string {
  const ranges: Record<string, string> = {
    "1": "Under $1,000,000",
    "2": "$1,000,000 - $1,500,000",
    "3": "$1,500,000 - $3,000,000",
    "4": "$3,000,000 and Over",
  };
  return ranges[value] || value;
}

function getRiskLevel(value: string): string {
  const levels: Record<string, string> = {
    "1": "Conservative",
    "2": "Moderately Conservative",
    "3": "Moderate",
    "4": "Moderately Aggressive",
    "5": "Significant Risk",
  };
  return levels[value] || value;
}