"use client";

import React from "react";
import { Megaphone, ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface MarqueeNoticeProps {
  onViewRules: () => void;
}

export default function MarqueeNotice({ onViewRules }: MarqueeNoticeProps) {
  const { settings } = useSettings();

  const marqueeText =
    settings.MarqueeNotice ||
    `📢 ${settings.SiteName} মেধা বৃত্তি পরীক্ষা ${settings.ExamDate ? `(তারিখ: ${settings.ExamDate})` : "২০২৬"} এর অনলাইন রেজিস্ট্রেশন কার্যক্রম পুরোদমে চলছে। ৪র্থ থেকে ৮ম শ্রেণীর সকল শিক্ষার্থীকে দ্রুত ফর্ম পূরণের জন্য অনুরোধ করা হচ্ছে।`;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-sm overflow-hidden py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-amber-500 text-gray-900 text-xs px-2.5 py-1 rounded-md font-bold shrink-0 shadow-sm">
          <Megaphone className="w-3.5 h-3.5" />
          <span>নোটিশ:</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap text-gray-800 font-medium cursor-pointer" onClick={onViewRules}>
            {marqueeText}
          </div>
        </div>
        <button
          onClick={onViewRules}
          className="shrink-0 hidden sm:flex items-center gap-1 text-xs text-emerald-800 font-semibold hover:text-emerald-950 transition bg-amber-200/70 hover:bg-amber-300 px-2 py-0.5 rounded"
        >
          <span>বিস্তারিত</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
