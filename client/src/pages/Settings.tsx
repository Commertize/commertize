import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword, updateEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Enhanced validation schema
const settingsFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().min(6, "Current password is required for email changes").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.email && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to change email",
  path: ["currentPassword"],
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function Settings() {
  const [, setLocation] = useLocation();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Save current path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', '/settings');
        setLocation("/login");
        return;
      }
      loadUserData(user);
    });

    return () => unsubscribe();
  }, [setLocation]);

  const loadUserData = async (user: any) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        form.reset({
          email: user.email || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phoneNumber: userData.phoneNumber || "",
        });
        setAvatarUrl(userData.avatar || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  const validateFile = (file: File) => {
    if (!file) return "Please select a file";
    if (file.size > MAX_FILE_SIZE) return "Max file size is 5MB";
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only .jpg, .jpeg, .png and .webp files are accepted";
    }
    return null;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setIsLoading(true);
      setUploadProgress(0);
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      const storageRef = ref(storage, `avatars/${user.uid}`);

      // Upload file
      const uploadTask = uploadBytes(storageRef, file);

      // Monitor upload progress
      uploadTask.then(async (snapshot) => {
        setUploadProgress(100);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        await updateDoc(doc(db, "users", user.uid), {
          avatar: downloadUrl,
        });

        setAvatarUrl(downloadUrl);
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
      }).catch((error) => {
        console.error("Error uploading avatar:", error);
        toast({
          title: "Error",
          description: "Failed to upload profile picture",
          variant: "destructive",
        });
      }).finally(() => {
        setIsLoading(false);
        setUploadProgress(0);
        URL.revokeObjectURL(objectUrl);
      });
    } catch (error) {
      console.error("Error handling avatar upload:", error);
      toast({
        title: "Error",
        description: "Failed to process profile picture",
        variant: "destructive",
      });
      setIsLoading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      // Verify current password if email is being changed
      if (data.email !== user.email && data.currentPassword) {
        try {
          await signInWithEmailAndPassword(auth, user.email!, data.currentPassword);
        } catch (error) {
          throw new Error("Current password is incorrect");
        }
      }

      if (data.email !== user.email) {
        await updateEmail(user, data.email);
      }

      if (data.password) {
        await updatePassword(user, data.password);
      }

      await updateDoc(doc(db, "users", user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={previewUrl || avatarUrl}
                    alt="Profile"
                  />
                  <AvatarFallback>
                    {auth.currentUser?.email ? auth.currentUser.email.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                {isLoading && uploadProgress > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="text-white text-sm">{uploadProgress}%</div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={handleAvatarUpload}
                  disabled={isLoading}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Change Photo
                </Label>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  disabled={isLoading}
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  disabled={isLoading}
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  disabled={isLoading}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  disabled={isLoading}
                  {...form.register("phoneNumber")}
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  disabled={isLoading}
                  {...form.register("currentPassword")}
                />
                {form.formState.errors.currentPassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={isLoading}
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}