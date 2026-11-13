import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const scriptUrl =
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

  const defaultSettings = {
    SiteName: process.env.NEXT_PUBLIC_SITE_NAME || "দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন",
    SiteShortName: "SWF",
    Hotline: process.env.NEXT_PUBLIC_HOTLINE || "০১৯৭৯৫১৩৯৯০",
    Email: process.env.NEXT_PUBLIC_EMAIL || "swfdhaka@gmail.com",
    bKashNumber: process.env.NEXT_PUBLIC_BKASH_NUMBER || "01721838990",
    RegistrationFee: process.env.NEXT_PUBLIC_REG_FEE || "২০০",
    ExamDate: "২০ নভেম্বর ২০২৬",
    ExamCenterDefault: "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা",
    HeroTitle: "বৃত্তি পরীক্ষা ২০২৬ এর অনলাইন রেজিস্ট্রেশন চলছে",
    HeroSubtitle: "প্রাথমিক ও মাধ্যমিক স্তরের (৪র্থ থেকে ৮ম শ্রেণী) শিক্ষার্থীদের সুপ্ত মেধা বিকাশ, শিক্ষা সহায়তা এবং উৎসাহ প্রদানের লক্ষ্যে প্রতি বছরের ন্যায় এবারও বর্ণাঢ্য মেধা বৃত্তি পরীক্ষার আয়োজন করা হয়েছে।",
    HeroBadge: "মেধা মূল্যায়ন ও বৃত্তি পরীক্ষা ২০২৬",
    ContactTitle: "যোগাযোগের ঠিকানা ও তথ্য",
    ContactSubtitle: "যেকোনো জিজ্ঞাসা, পরামর্শ বা বৃত্তি সংক্রান্ত তথ্যের জন্য সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন।",
    OfficeAddress: "আমতলী, মহাখালী, ঢাকা-১২০৬, বাংলাদেশ।",
    OfficeHours: "সকাল ৯:০০ টা - বিকাল ৫:০০ টা (শুক্রবার বন্ধ)",
    AlternativePhone: "",
    ContactNotice: "",
    ContactExtraInfo: "",
    SiteTagline: "শিক্ষা সেবা ও মূল্যায়ন কর্মসূচি",
    MarqueeNotice: "",
    ApplicantCount: "১",
    ApplicationDeadline: "৩১ আগস্ট ২০২৬",
    AdmitCardStatus: "স্বয়ংক্রিয়", // স্বয়ংক্রিয় (তারিখ অনুযায়ী)
  };

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

          // যদি গুগল শিট থেকে HeroBadge রো-টি মুছে দেওয়া হয়, তাহলে ডিফল্ট ভ্যালু ওভাররাইট করে খালি স্ট্রিং পাঠানো
          const heroBadge = customData.HeroBadge !== undefined ? customData.HeroBadge : "";

          // লোগো URL ম্যাপিং (logo_url, LogoUrl, SiteLogo, etc.)
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
              source: "google_sheet",
              data: {
                ...defaultSettings,
                ...customData,
                SiteLogo: detectedLogo || customData.SiteLogo || "",
                LogoUrl: detectedLogo || customData.LogoUrl || "",
                HeroBadge: heroBadge,
                SiteName: siteName,
                SiteTagline: siteTagline,
                MarqueeNotice: marqueeNotice,
              },
            },
            {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
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
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
