import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AppSettings } from "@/hooks/useSettings";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const settingsSchema = z.object({
  // General Settings
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  copyright: z.string().min(1, "Copyright is required"),

  // Social Links - accept empty strings or valid URLs
  linkedin: z.union([z.literal(""), z.string().url()]).default(""),
  twitter: z.union([z.literal(""), z.string().url()]).default(""),
  youtube: z.union([z.literal(""), z.string().url()]).default(""),
  instagram: z.union([z.literal(""), z.string().url()]).default(""),
  facebook: z.union([z.literal(""), z.string().url()]).default(""),
  tiktok: z.union([z.literal(""), z.string().url()]).default(""),
  discord: z.union([z.literal(""), z.string().url()]).default(""),
  telegram: z.union([z.literal(""), z.string().url()]).default("")
});

const legalDocumentSchema = z.object({
  content: z.string().min(1, "Content is required")
});

type SettingsFormData = z.infer<typeof settingsSchema>;
type LegalDocumentData = z.infer<typeof legalDocumentSchema>;

type SettingsSection = 'general' | 'disclaimer' | 'terms' | 'privacy' | 'aml' | 'cookie' | 'kyb';

export const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const { toast } = useToast();
  
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: "",
      address: "",
      copyright: "",
      linkedin: "",
      twitter: "",
      youtube: "",
      instagram: "",
      facebook: "",
      tiktok: "",
      discord: "",
      telegram: ""
    }
  });

  const legalForm = useForm<LegalDocumentData>({
    resolver: zodResolver(legalDocumentSchema),
    defaultValues: {
      content: ""
    }
  });

  // Load existing settings and legal documents
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (activeSection === 'general') {
          const settingsDoc = await getDoc(doc(db, "settings", "general"));
          if (settingsDoc.exists()) {
            const data = settingsDoc.data() as SettingsFormData;
            form.reset(data);
          }
        } else {
          // Load legal document content
          const docRef = doc(db, "legal_documents", activeSection);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            legalForm.reset({ content: data.content || "" });
          } else {
            legalForm.reset({ content: "" });
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeSection, form, legalForm, toast]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      // Clean data to ensure no undefined values (Firebase doesn't accept undefined)
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value ?? ""])
      );
      await setDoc(doc(db, "settings", "general"), cleanData);
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onLegalSubmit = async (data: LegalDocumentData) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "legal_documents", activeSection), {
        content: data.content,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Success",
        description: "Document saved successfully"
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sectionTitles = {
    general: 'General Settings',
    disclaimer: 'Disclaimer',
    terms: 'Terms and Conditions',
    privacy: 'Privacy Policy',
    aml: 'AML Policy',
    cookie: 'Cookie Policy',
    kyb: 'KYB Policy'
  };

  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{sectionTitles[activeSection]}</h2>
        <Button 
          onClick={activeSection === 'general' ? form.handleSubmit(onSubmit) : legalForm.handleSubmit(onLegalSubmit)}
          disabled={isSaving}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-1">
                <div 
                  className={`px-4 py-3 border-l-4 cursor-pointer transition-colors ${
                    activeSection === 'general' 
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-500' 
                      : 'text-muted-foreground hover:bg-muted border-transparent'
                  }`}
                  onClick={() => handleSectionChange('general')}
                >
                  <div className="font-medium">General</div>
                </div>
                <div 
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    activeSection === 'disclaimer' 
                      ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => handleSectionChange('disclaimer')}
                >
                  Disclaimer
                </div>
                <div 
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    activeSection === 'terms' 
                      ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => handleSectionChange('terms')}
                >
                  Terms and Conditions
                </div>
                <div 
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    activeSection === 'privacy' 
                      ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => handleSectionChange('privacy')}
                >
                  Privacy Policy
                </div>
                <div 
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    activeSection === 'aml' 
                      ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => handleSectionChange('aml')}
                >
                  AML Policy
                </div>
                <div 
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    activeSection === 'cookie' 
                      ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => handleSectionChange('cookie')}
                >
                  Cookie Policy
                </div>
                <div 
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    activeSection === 'kyb' 
                      ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => handleSectionChange('kyb')}
                >
                  KYB Policy
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === 'general' ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Details Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Infinity Bytes Software Design L.L.C."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Dubai, UAE"
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
                      name="copyright"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Copyright</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="© 2024 Tokensave Estates. All rights reserved."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Social Links Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Social links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://www.linkedin.com/"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>X (Twitter)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://x.com/"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://www.youtube.com/"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://www.instagram.com/"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://www.facebook.com/"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tiktok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://www.tiktok.com/"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discord"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discord</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://discord.com/"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="telegram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telegram</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://t.me/"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          ) : (
            <Form {...legalForm}>
              <form onSubmit={legalForm.handleSubmit(onLegalSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{sectionTitles[activeSection]} Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={legalForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <ReactQuill
                              theme="snow"
                              value={field.value}
                              onChange={field.onChange}
                              style={{ height: '400px', marginBottom: '50px' }}
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                  [{ 'script': 'sub'}, { 'script': 'super' }],
                                  [{ 'indent': '-1'}, { 'indent': '+1' }],
                                  [{ 'direction': 'rtl' }],
                                  [{ 'color': [] }, { 'background': [] }],
                                  [{ 'align': [] }],
                                  ['link', 'image'],
                                  ['clean']
                                ]
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};