import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const scriptUrl =
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

  const defaultSettings = {
    SiteName: process.env.NEXT_PUBLIC_SITE_NAME || "রেজাউল হাসান কয়েস লোদী বৃত্তি পরীক্ষা",
    SiteShortName: "SWF",
    Hotline: process.env.NEXT_PUBLIC_HOTLINE || "০১৮২২৮৬২৯৩৯",
    Email: process.env.NEXT_PUBLIC_EMAIL || "mabadshasyl@gmail.com",
    bKashNumber: process.env.NEXT_PUBLIC_BKASH_NUMBER || "০১৮২২৮৬২৯৩৯",
    RegistrationFee: process.env.NEXT_PUBLIC_REG_FEE || "২০০",
    ExamDate: "২০ নভেম্বর ২০২৭",
    ExamCenterDefault: "আম্বরখানা গার্লস স্কুল এন্ড কলেজ",
    HeroTitle: "বৃত্তি পরীক্ষা ২০২৭ এর অনলাইন রেজিস্ট্রেশন চলছে",
    HeroSubtitle: "প্রাথমিক ও মাধ্যমিক স্তরের (৪র্থ থেকে ৮ম শ্রেণী) শিক্ষার্থীদের সুপ্ত মেধা বিকাশ, শিক্ষা সহায়তা এবং উৎসাহ প্রদানের লক্ষ্যে এই মেধা বৃত্তি পরীক্ষার আয়োজন করা হয়েছে।",
    HeroBadge: "",
    ContactTitle: "যোগাযোগের ঠিকানা ও তথ্য",
    ContactSubtitle: "যেকোনো জিজ্ঞাসা, পরামর্শ বা বৃত্তি সংক্রান্ত তথ্যের জন্য সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন।",
    OfficeAddress: "সম্পাদकीय কার্যালয়, হাউসিং এস্টেট, সিলেট",
    OfficeHours: "সকাল ৯:০০ টা - বিকাল ৫:০০ টা (শুক্রবার বন্ধ)",
    AlternativePhone: "০১৭২১৮৩৮৯৯০",
    ContactNotice: "বিশেষ ঘোষণা: সরকারি ছুটির দিনে অফিস বন্ধ থাকে।",
    ContactExtraInfo: "",
    SiteTagline: "শিক্ষা, সেবা ও মেধা মূল্যায়নে অগ্রগামী",
    MarqueeNotice: "",
    ApplicantCount: "১০০০",
    ApplicationDeadline: "৩১ আগস্ট ২০২৬",
    AdmitCardStatus: "স্বয়ংক্রিয়",
    SiteLogo: "https://drive.google.com/file/d/1aHAO6U3PzfFv9eTtH5kjmasOgdCldv8Z/view?usp=sharing",
    LogoUrl: "https://drive.google.com/file/d/1aHAO6U3PzfFv9eTtH5kjmasOgdCldv8Z/view?usp=sharing",
  };

  // 1. Try Direct Google Sheets API via Service Account (Instant, No Timeout)
  try {
    const rows = await getSheetData("Settings");
    if (rows && rows.length > 0) {
      const customData: Record<string, any> = {};
      rows.forEach((row) => {
        if (row && row[0] !== undefined) {
          const key = String(row[0]).trim();
          const val = row[1] !== undefined ? String(row[1]).trim() : "";
          if (key && key !== "সেটিংস_নাম" && key !== "Key" && key !== "কী (Key)") {
            customData[key] = val;
          }
        }
      });

      if (Object.keys(customData).length > 0) {
        const siteName = (customData.SiteName || defaultSettings.SiteName || "")
          .replace(/\)+$/, "")
          .trim();

        const siteTagline =
          customData.SiteTagline ||
          customData.SiteSubtitle ||
          customData.Tagline ||
          customData["লোগো_স্লোগান"] ||
          defaultSettings.SiteTagline;

        const marqueeNotice =
          customData.MarqueeNotice ||
          customData.RunningNotice ||
          customData.NoticeTicker ||
          customData["চলমান_নোটিশ"] ||
          "";

        const heroBadge = customData.HeroBadge !== undefined ? customData.HeroBadge : "";

        let detectedLogo = "";
        Object.keys(customData).forEach((key) => {
          const cleanKey = key.toLowerCase().replace(/[\s_-]/g, "");
          if (cleanKey === "logourl" || cleanKey === "sitelogo" || cleanKey === "logo") {
            detectedLogo = customData[key];
          }
        });

        return NextResponse.json(
          {
            success: true,
            source: "google_sheets_service_account",
            data: {
              ...defaultSettings,
              ...customData,
              SiteLogo: detectedLogo || customData.SiteLogo || defaultSettings.SiteLogo,
              LogoUrl: detectedLogo || customData.LogoUrl || defaultSettings.LogoUrl,
              HeroBadge: heroBadge,
              SiteName: siteName,
              SiteTagline: siteTagline,
              MarqueeNotice: marqueeNotice,
            },
          },
          {
            headers: {
              "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
            },
          }
        );
      }
    }
  } catch (sheetApiError) {
    console.warn("Direct Google Sheets API fetch failed, trying Apps Script fallback:", sheetApiError);
  }

  // 2. Fallback to Google Apps Script Web App
  if (scriptUrl && scriptUrl.startsWith("http")) {
    try {
      const response = await fetch(`${scriptUrl}?action=getSettings`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && Object.keys(result.data).length > 0) {
          const customData = result.data;
          const siteName = (customData.SiteName || defaultSettings.SiteName || "")
            .replace(/\)+$/, "")
            .trim();

          const siteTagline =
            customData.SiteTagline ||
            customData.SiteSubtitle ||
            customData.Tagline ||
            customData["লোগো_স্লোগান"] ||
            defaultSettings.SiteTagline;
          const marqueeNotice =
            customData.MarqueeNotice ||
            customData.RunningNotice ||
            customData.NoticeTicker ||
            customData["চলমান_নোটিশ"] ||
            "";

          const heroBadge = customData.HeroBadge !== undefined ? customData.HeroBadge : "";

          let detectedLogo = "";
          Object.keys(customData).forEach((key) => {
            const cleanKey = key.toLowerCase().replace(/[\s_-]/g, "");
            if (cleanKey === "logourl" || cleanKey === "sitelogo" || cleanKey === "logo") {
              detectedLogo = customData[key];
            }
          });

          return NextResponse.json(
            {
              success: true,
              source: "google_sheet_apps_script",
              data: {
                ...defaultSettings,
                ...customData,
                SiteLogo: detectedLogo || customData.SiteLogo || defaultSettings.SiteLogo,
                LogoUrl: detectedLogo || customData.LogoUrl || defaultSettings.LogoUrl,
                HeroBadge: heroBadge,
                SiteName: siteName,
                SiteTagline: siteTagline,
                MarqueeNotice: marqueeNotice,
              },
            },
            {
              headers: {
                "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
              },
            }
          );
        }
      }
    } catch (err) {
      console.warn("Google Sheet settings fetch error, falling back to local:", err);
    }
  }

  return NextResponse.json(
    {
      success: true,
      source: "local_default",
      data: defaultSettings,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    }
  );
}
