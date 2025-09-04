import { useState } from "react";
import { useLocation, Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Cpu, Zap, Shield, Database } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import citySkylineBg from "@/assets/city-skyline-bg.jpg";
import { motion } from "framer-motion";

const countryCodes = [
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
  // Add other country codes as needed
];

// Function to format phone number
const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const registerFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    country: z.string().min(1, "Country is required"),
    countryCode: z.string().min(1, "Country code is required"),
    phoneNumber: z
      .string()
      .min(14, "Phone number must be complete")
      .regex(
        /^\(\d{3}\) \d{3}-\d{4}$/,
        "Phone number must be in (XXX) XXX-XXXX format",
      ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    retypePassword: z.string(),
  })
  .refine((data) => data.password === data.retypePassword, {
    message: "Passwords don't match",
    path: ["retypePassword"],
  });

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional().default(false),
});

const Account = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState({
    title: "",
    message: "",
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      countryCode: "+1",
      phoneNumber: "",
      password: "",
      retypePassword: "",
    },
  });

  const handleRegister = async (values: z.infer<typeof registerFormSchema>) => {
    try {
      setLoading(true);
      await signUp(values);
      toast({
        title: "Account created",
        description:
          "Please check your email to verify your account before signing in.",
      });
      loginForm.reset();
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      if (loginTab) {
        loginTab.click();
      }
    } catch (error: any) {
      setDialogMessage({ title: "Error", message: error.message });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values: z.infer<typeof loginFormSchema>) => {
    try {
      setLoading(true);
      await signIn(values.email, values.password, values.rememberMe);
      
      // Check for saved redirect path, default to home
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
      if (redirectPath !== '/') {
        sessionStorage.removeItem('redirectAfterLogin');
      }
      setLocation(redirectPath);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      if (error.message.includes("verify your email")) {
        toast({
          variant: "destructive",
          title: "Email Not Verified",
          description:
            "Please check your inbox for the verification link and verify your email before logging in.",
        });
      } else {
        setDialogMessage({ title: "Error", message: error.message });
        setShowDialog(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const user = await signInWithGoogle();
      
      // Check for saved redirect path, default to home
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
      if (redirectPath !== '/') {
        sessionStorage.removeItem('redirectAfterLogin');
      }
      setLocation(redirectPath);
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
    } catch (error: any) {
      setDialogMessage({ title: "Error", message: error.message });
      setShowDialog(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Background image layer with slow zoom-in animation */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${citySkylineBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          imageRendering: 'crisp-edges',
          filter: 'none',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)'
        }}
        animate={{
          y: [20, -20]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      ></motion.div>
      

      
      {/* Content */}
      <div className="relative z-20 container py-4 sm:py-12 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md relative">
        {/* Moving pulse around border */}
        <div className="moving-pulse absolute w-3 h-3 bg-[#d4a017] rounded-full z-30 pointer-events-none" 
             style={{ 
               filter: 'drop-shadow(0 0 8px #d4a017)', 
               boxShadow: '0 0 10px #d4a017, 0 0 20px #d4a017',
               top: '-4px',
               left: '-4px'
             }} />

        <Tabs defaultValue="login" className="border-2 border-[#d4a017] rounded-xl p-3 sm:p-6 bg-white shadow-2xl min-h-[500px] relative z-10">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="login" className="font-light text-sm sm:text-base text-black data-[state=active]:bg-[#d4a017] data-[state=active]:text-black transition-all duration-300">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="font-light text-sm sm:text-base text-black data-[state=active]:bg-[#d4a017] data-[state=active]:text-black transition-all duration-300">
              Create Account
            </TabsTrigger>
          </TabsList>
          <div style={{ height: 'auto', maxHeight: '450px', overflow: 'auto' }} className="sm:h-[450px] gold-scrollbar">
            <TabsContent value="login" className="h-full">
              <Card className="h-full border-0 shadow-none bg-transparent">
                <CardHeader className="text-center pb-2 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-light text-[#d4a017] mb-2 sm:mb-3 tracking-wide">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-black/70 font-light text-sm sm:text-base leading-relaxed">
                    Sign in to access your investment dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-3 sm:space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black font-light text-sm">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email" 
                              disabled={loading}
                              className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                              placeholder="Enter your email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black font-light text-sm">Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              disabled={loading}
                              className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                              placeholder="Enter your password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 py-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={loading}
                              className="border-[#d4a017] data-[state=checked]:bg-[#d4a017] data-[state=checked]:border-[#d4a017]"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-light text-black cursor-pointer">
                            Keep me signed in
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-10 sm:h-11 bg-[#d4a017] hover:bg-yellow-500 text-black font-light text-sm sm:text-base transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing you in...
                        </>
                      ) : (
                        "Sign In to Dashboard"
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-light hover:underline transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-black font-light">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-[#d4a017] text-yellow-600 hover:bg-yellow-50 font-light"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                    >
                      {googleLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting with Google...
                        </>
                      ) : (
                        <>
                          <SiGoogle className="mr-2 h-5 w-5" />
                          Continue with Google
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="register" className="h-full">
              <Card className="h-full border-0 shadow-none bg-transparent">
                <CardHeader className="text-center pb-2 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-light text-[#d4a017] mb-2 sm:mb-3 tracking-wide">
                    Join Commertize
                  </CardTitle>
                  <CardDescription className="text-black/70 font-light text-sm sm:text-base leading-relaxed">
                    Begin your commercial real estate investment journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-4">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black font-light text-sm">First Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={loading}
                                className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                                placeholder="First name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black font-light text-sm">Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={loading}
                                className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                                placeholder="Last name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black font-light text-sm">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email" 
                              disabled={loading}
                              className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                              placeholder="Enter your email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black font-light text-sm">Country</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={loading}
                              className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                              placeholder="Enter your country"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 sm:gap-4">
                      <FormField
                        control={registerForm.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black font-light text-sm">Country Code</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={loading}
                            >
                              <FormControl>
                                <SelectTrigger className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base">
                                  <SelectValue placeholder="Select code" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countryCodes.map((code) => (
                                  <SelectItem
                                    key={code.value}
                                    value={code.value}
                                  >
                                    {code.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black font-light text-sm">Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="(XXX) XXX-XXXX"
                                disabled={loading}
                                className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                                onChange={(e) => {
                                  const formattedValue = formatPhoneNumber(
                                    e.target.value,
                                  );
                                  if (formattedValue.length <= 14) {
                                    field.onChange(formattedValue);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black font-light text-sm">Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              disabled={loading}
                              className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                              placeholder="Create a strong password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="retypePassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black font-light text-sm">Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              disabled={loading}
                              className="border-[#d4a017]/50 focus:border-[#d4a017] bg-white/80 font-light h-9 sm:h-10 text-sm sm:text-base"
                              placeholder="Confirm your password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-10 sm:h-11 bg-[#d4a017] hover:bg-yellow-500 text-black font-light text-sm sm:text-base transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating your account...
                        </>
                      ) : (
                        "Create Investment Account"
                      )}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-black font-light">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 sm:h-11 border-2 border-[#d4a017] text-yellow-600 hover:bg-yellow-50 font-light text-sm sm:text-base"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                    >
                      {googleLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account with Google...
                        </>
                      ) : (
                        <>
                          <SiGoogle className="mr-2 h-5 w-5" />
                          Continue with Google
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Add Dialog for better accessibility */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md mx-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{dialogMessage.title}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">{dialogMessage.message}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Account;
