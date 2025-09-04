import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  privacyConsent: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy to continue"
  }),
});

const ContactForm = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      privacyConsent: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Here you would typically send the form data to your backend
      console.log("Form submitted:", values);
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: "hello@commertize.com",
      description: "Get a response within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "+1 (555) 123-4567",
      description: "Mon-Fri, 9AM-6PM PST"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: "San Francisco, CA",
      description: "Schedule a meeting"
    }
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-logo font-light text-black mb-6">
            Contact <span className="text-primary">Us</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-yellow-600 rounded-full mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-logo font-light max-w-3xl mx-auto">
            Ready to transform your real estate investment strategy? Our team is here to guide you through tokenized investments.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-yellow-500"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-yellow-600/10 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-logo font-light text-black">
                Send us a <span className="text-primary">Message</span>
              </h3>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-logo font-light text-black">Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            className="h-12 border-gray-200 focus:border-primary font-logo font-light"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-logo font-light text-black">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(555) 123-4567" 
                            type="tel" 
                            className="h-12 border-gray-200 focus:border-primary font-logo font-light"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-logo font-light text-black">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="you@example.com" 
                          type="email" 
                          className="h-12 border-gray-200 focus:border-primary font-logo font-light"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-logo font-light text-black">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your real estate investment goals..."
                          className="min-h-[120px] border-gray-200 focus:border-primary font-logo font-light resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="privacyConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-logo font-light text-gray-600">
                          By continuing, I acknowledge and consent to the collection and processing of my personal data in accordance with the terms set forth in the Privacy Policy.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-yellow-600 hover:from-yellow-600 hover:to-primary text-white font-logo font-light text-lg shadow-lg"
                    disabled={form.formState.isSubmitting || !form.watch('privacyConsent')}
                  >
                    {form.formState.isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
