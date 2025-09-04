import { useState, useEffect } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AppSettings {
  companyName: string;
  address: string;
  copyright: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  discord: string;
  telegram: string;
}

const defaultSettings: AppSettings = {
  companyName: "Commertize",
  address: "Digital Real Estate Investment Platform",
  copyright: "© 2025 Commertize. All rights reserved.",
  linkedin: "https://www.linkedin.com/",
  twitter: "https://x.com/",
  youtube: "https://www.youtube.com/",
  instagram: "",
  facebook: "",
  tiktok: "",
  discord: "",
  telegram: ""
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const settingsDocRef = doc(db, "settings", "general");
    
    // Set up real-time listener for settings changes
    const unsubscribe = onSnapshot(settingsDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setSettings({ ...defaultSettings, ...docSnapshot.data() as AppSettings });
      } else {
        setSettings(defaultSettings);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading settings:", error);
      setSettings(defaultSettings);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, isLoading };
};

// Utility function to get settings for one-time use
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "general"));
    if (settingsDoc.exists()) {
      return { ...defaultSettings, ...settingsDoc.data() as AppSettings };
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return defaultSettings;
  }
};