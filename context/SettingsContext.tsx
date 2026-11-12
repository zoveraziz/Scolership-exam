"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface SiteSettings {
  SiteName: string;
  SiteLogo?: string;
  LogoUrl?: string;
  SiteLogoUrl?: string;
  Hotline: string;
  Email: string;
  bKashNumber: string;
  RegistrationFee: string;
  ExamDate: string;
  ExamCenterDefault: string;
  HeroTitle?: string;
  HeroSubtitle?: string;
  HeroBadge?: string;
  HeroTitleSize?: string;
  HeroSubtitleSize?: string;
  HeroBadgeSize?: string;
  ContactTitle?: string;
  ContactSubtitle?: string;
  OfficeAddress?: string;
  OfficeHours?: string;
  AlternativePhone?: string;
  ContactNotice?: string;
  ContactExtraInfo?: string;
  MarqueeNotice?: string;
  SiteTagline?: string;
  SiteSubtitle?: string;
  SiteShortName?: string;
  SiteNameSize?: string;
  SiteTaglineSize?: string;
  ApplicantCount?: string;
  ApplicationDeadline?: string;
  AdmitCardStatus?: string;
  [key: string]: any;
}

const defaultSettings: SiteSettings = {
  SiteName: "দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন",
  SiteShortName: "SWF",
  SiteTagline: "শিক্ষা সেবা ও মূল্যায়ন কর্মসূচি",
  Hotline: "০১৯৭৯৫১৩৯৯০",
  Email: "swfdhaka@gmail.com",
  bKashNumber: "01721838990",
  RegistrationFee: "২০০",
  ExamDate: "২০ নভেম্বর ২০২৬",
  ExamCenterDefault: "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা",
  HeroTitle: "বৃত্তি পরীক্ষা ২০২৬ এর অনলাইন রেজিস্ট্রেশন চলছে",
  HeroSubtitle: "প্রাথমিক ও মাধ্যমিক স্তরের (৪র্থ থেকে ৮ম শ্রেণী) শিক্ষার্থীদের সুপ্ত মেধা বিকাশ, শিক্ষা সহায়তা এবং উৎসাহ প্রদানের লক্ষ্যে প্রতি বছরের ন্যায় এবারও বর্ণাঢ্য মেধা বৃত্তি পরীক্ষার আয়োজন করা হয়েছে।",
  HeroBadge: "মেধা মূল্যায়ন ও বৃত্তি পরীক্ষা ২০২৬",
  ApplicantCount: "১",
  ApplicationDeadline: "৩১ আগস্ট ২০২৬",
  AdmitCardStatus: "স্বয়ংক্রিয়",
  ContactTitle: "যোগাযোগের ঠিকানা ও তথ্য",
  ContactSubtitle: "যেকোনো জিজ্ঞাসা, পরামর্শ বা বৃত্তি সংক্রান্ত তথ্যের জন্য সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন।",
  OfficeAddress: "আমতলী, মহাখালী, ঢাকা-১২০৬, বাংলাদেশ।",
  OfficeHours: "সকাল ৯:০০ টা - বিকাল ৫:০০ টা (শুক্রবার বন্ধ)",
  AlternativePhone: "",
  ContactNotice: "",
  ContactExtraInfo: "",
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings?t=" + Date.now(), { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        // লোগো কি (logo _url, LogoUrl, SiteLogo, etc.) স্বয়ংক্রিয় শনাক্ত ও ম্যাপিং
        let detectedLogo = "";
        Object.keys(json.data).forEach((key) => {
          const cleanKey = key.toLowerCase().replace(/[\s_-]/g, "");
          if (cleanKey === "logourl" || cleanKey === "sitelogo" || cleanKey === "logo") {
            detectedLogo = json.data[key];
          }
        });

        if (detectedLogo) {
          json.data.SiteLogo = detectedLogo;
          json.data.LogoUrl = detectedLogo;
        }

        setSettings((prev) => ({
          ...prev,
          ...json.data,
        }));
      }
    } catch (err) {
      console.warn("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
