"use client";

import React from "react";
import { GraduationCap, ArrowRight, ShieldCheck, Users, Clock, Calendar } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface HeroBannerProps {
  onApply: () => void;
  onAdmit: () => void;
  onResult: () => void;
}

const banglaDigits: { [key: string]: string } = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
};

function toBanglaNumber(val?: string | number): string {
  if (val === undefined || val === null || val === "") return "১";
  return String(val).replace(/[0-9]/g, (d) => banglaDigits[d] || d);
}

function parseCustomFontSize(val?: string, type: "title" | "subtitle" | "badge" = "title"): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;

  // 1. Check if user typed Bengali/English keywords (even if accompanied by parentheses like 'বড় (অথবা 50px)')
  if (clean.includes("খুব বড়") || clean.includes("extra large") || clean.includes("xl")) {
    if (type === "title") return "4rem";
    if (type === "subtitle") return "1.625rem";
    if (type === "badge") return "1.125rem";
  }
  if (clean.includes("বড়") || clean.includes("large")) {
    if (type === "title") return "3.25rem";
    if (type === "subtitle") return "1.375rem";
    if (type === "badge") return "1rem";
  }
  if (clean.includes("মাঝারি") || clean.includes("medium") || clean.includes("normal")) {
    if (type === "title") return "2.5rem";
    if (type === "subtitle") return "1.125rem";
    if (type === "badge") return "0.875rem";
  }
  if (clean.includes("ছোট") || clean.includes("small")) {
    if (type === "title") return "1.75rem";
    if (type === "subtitle") return "0.875rem";
    if (type === "badge") return "0.75rem";
  }

  // 2. Extract explicit pixel or rem numbers (e.g. "50px", "50", "2.5rem")
  const pxMatch = clean.match(/(\d+(\.\d+)?)\s*(px|rem|em|pt|%)?/);
  if (pxMatch) {
    const num = pxMatch[1];
    const unit = pxMatch[3] || "px";
    return `${num}${unit}`;
  }

  return undefined;
}

export default function HeroBanner({ onApply, onAdmit, onResult }: HeroBannerProps) {
  const { settings } = useSettings();
  const rawBadge = settings.HeroBadge !== undefined ? settings.HeroBadge.trim() : "";
  const heroBadge = rawBadge;
  const heroTitle = settings.HeroTitle || "বৃত্তি পরীক্ষা ২০২৬ এর অনলাইন রেজিস্ট্রেশন চলছে";
  const heroSubtitle =
    settings.HeroSubtitle ||
    "প্রাথমিক ও মাধ্যমিক স্তরের (৪র্থ থেকে ৮ম শ্রেণী) শিক্ষার্থীদের সুপ্ত মেধা বিকাশ, শিক্ষা সহায়তা এবং উৎসাহ প্রদানের লক্ষ্যে প্রতি বছরের ন্যায় এবারও বর্ণাঢ্য মেধা বৃত্তি পরীক্ষার আয়োজন করা হয়েছে।";

  const badgeFontSize = parseCustomFontSize(settings.HeroBadgeSize, "badge");
  const titleFontSize = parseCustomFontSize(settings.HeroTitleSize, "title");
  const subtitleFontSize = parseCustomFontSize(settings.HeroSubtitleSize, "subtitle");

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 text-white py-5 md:py-6 px-4">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10 space-y-3">
        {/* Top Badge (Only renders if HeroBadge is not empty in Google Sheet) */}
        {heroBadge ? (
          <div
            style={badgeFontSize ? { fontSize: badgeFontSize } : undefined}
            className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/40 px-3.5 py-1 rounded-full text-xs md:text-sm font-semibold text-emerald-100 shadow-sm backdrop-blur-sm"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span>{heroBadge}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
        ) : null}

        {/* Heading */}
        <h2
          style={titleFontSize ? { fontSize: titleFontSize, lineHeight: "1.2" } : undefined}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white max-w-4xl mx-auto"
        >
          {heroTitle}
        </h2>

        {/* Subtitle */}
        <p
          style={subtitleFontSize ? { fontSize: subtitleFontSize, lineHeight: "1.5" } : undefined}
          className="text-emerald-100 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed"
        >
          {heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="pt-0.5 flex flex-wrap justify-center gap-3">
          <button
            onClick={onApply}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-sm md:text-base"
          >
            <span>অনলাইনে আবেদন করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onAdmit}
            className="flex items-center gap-2 bg-emerald-700/80 hover:bg-emerald-600/90 text-white font-semibold px-5 py-2 rounded-xl border border-emerald-500/50 shadow-md hover:shadow-lg transition text-sm md:text-base"
          >
            <span>এডমিট কার্ড ডাউনলোড</span>
          </button>
          <button
            onClick={onResult}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2 rounded-xl border border-white/20 shadow-md hover:shadow-lg transition text-sm md:text-base backdrop-blur-sm"
          >
            <span>ফলাফল অনুসন্ধান</span>
          </button>
        </div>

        {/* Statistics Bar - More compact, refined and aesthetic */}
        <div className="pt-3.5 grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-3xl mx-auto border-t border-emerald-700/50">
          {/* Card 1: Live Applicants Count */}
          <div className="py-2 px-2.5 bg-emerald-800/35 hover:bg-emerald-800/50 transition rounded-xl border border-emerald-600/25 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-base sm:text-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <Users className="w-4 h-4 text-emerald-300" />
              <span>{toBanglaNumber(settings.ApplicantCount || "১")} জন</span>
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5 flex items-center justify-center gap-1">
              <span>আবেদনকারী শিক্ষার্থী</span>
              <span className="text-[9px] bg-emerald-600/80 px-1 py-0.2 rounded text-amber-200 font-semibold">লাইভ</span>
            </div>
          </div>

          {/* Card 2: Application Deadline */}
          <div className="py-2 px-2.5 bg-emerald-800/35 hover:bg-emerald-800/50 transition rounded-xl border border-emerald-600/25 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-base sm:text-lg">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{settings.ApplicationDeadline || "৩১ আগস্ট"}</span>
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">আবেদনের শেষ সময়</div>
          </div>

          {/* Card 3: Exam Date */}
          <div className="py-2 px-2.5 bg-emerald-800/35 hover:bg-emerald-800/50 transition rounded-xl border border-emerald-600/25 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-base sm:text-lg">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>{settings.ExamDate || "১৫ নভেম্বর"}</span>
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">পরীক্ষার নির্ধারিত তারিখ</div>
          </div>

          {/* Card 4: 100% Transparent */}
          <div className="py-2 px-2.5 bg-emerald-800/35 hover:bg-emerald-800/50 transition rounded-xl border border-emerald-600/25 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-base sm:text-lg">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>১০০%</span>
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">স্বচ্ছ মূল্যায়ন পদ্ধতি</div>
          </div>
        </div>
      </div>
    </div>
  );
}
