"use client";

import React from "react";
import { Trophy, Medal, Award, Gift, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function ScholarshipRewards() {
  const { settings } = useSettings();

  const rewardCards = [
    {
      grade: "ট্যালেন্টপুল বৃত্তি",
      subtitle: "সর্বোচ্চ মেধাবীদের জন্য বিশেষ সম্মাননা",
      icon: Trophy,
      color: "from-amber-500 to-amber-600",
      border: "border-amber-300",
      bgLight: "bg-amber-50/70",
      badgeText: "🥇 ১ম সারির মেধা",
      rewards: [
        "এককালীন নগদ অর্থ বৃত্তি অনুদান",
        "স্বর্ণখচিত বিশেষ মেধা পদক (Gold Medal)",
        "অফিসিয়াল সম্মাননা স্মারক ও ক্রেস্ট",
        "স্বাক্ষরিত জাতীয় মেধা সনদপত্র (Certificate)",
        "পরবর্তী ক্লাসের জন্য বিশেষ শিক্ষা উপহার",
      ],
    },
    {
      grade: "সাধারণ গ্রেড বৃত্তি",
      subtitle: "উচ্চ নম্বর প্রাপ্ত কৃতি শিক্ষার্থীদের জন্য",
      icon: Medal,
      color: "from-emerald-600 to-teal-700",
      border: "border-emerald-300",
      bgLight: "bg-emerald-50/70",
      badgeText: "🥈 ২য় সারির মেধা",
      rewards: [
        "নগদ শিক্ষা সহায়তা অর্থ অনুদান",
        "রৌপ্যখচিত মেধা পদক (Silver Medal)",
        "ফাউন্ডেশন কর্তৃক বিশেষ প্রশংসা সনদ",
        "কৃতি শিক্ষার্থী স্মারক ক্রেস্ট",
        "উচ্চশিক্ষায় উৎসাহমূলক শিক্ষা সামগ্রী",
      ],
    },
    {
      grade: "বিশেষ মেধা স্বীকৃতি",
      subtitle: "প্রতিযোগিতায় উত্তীর্ণ শিক্ষার্থীদের জন্য",
      icon: Award,
      color: "from-blue-600 to-indigo-700",
      border: "border-blue-300",
      bgLight: "bg-blue-50/70",
      badgeText: "🎖️ বিশেষ সম্মাননা",
      rewards: [
        "অংশগ্রহণ ও কৃতিত্বের সম্মাননা সনদপত্র",
        "উচ্চমানের স্কুল ব্যাগ ও শিক্ষা উপকরণ",
        "সাধারণ জ্ঞান ও ক্যারিয়ার বিষয়ক সেরা বই",
        "বার্ষিক প্রকাশনায় মেধা তালিকায় নাম প্রকাশ",
        "ভবিষ্যৎ মেধা কর্মশালায় বিনামূল্যে অংশ নেওয়ার সুযোগ",
      ],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>মেধার সর্বোচ্চ মূল্যায়ন</span>
        </div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
          বৃত্তি ও মেধা পুরস্কারের ক্যাটাগরি
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          {settings.SiteName}-এ প্রতিটি কৃতি শিক্ষার্থীর মেধার সঠিক মূল্যায়ন ও উৎসাহ প্রদানে আমরা নিবেদিত
        </p>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {rewardCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl bg-white border-2 ${card.border} shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition duration-300 overflow-hidden flex flex-col justify-between`}
            >
              <div>
                {/* Card Top Banner */}
                <div className={`p-6 bg-gradient-to-r ${card.color} text-white space-y-2 relative`}>
                  <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white shadow-sm">
                    {card.badgeText}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black">{card.grade}</h4>
                  <p className="text-xs text-white/90 leading-relaxed">{card.subtitle}</p>
                  <Icon className="w-16 h-16 absolute right-4 bottom-3 text-white/15 pointer-events-none" />
                </div>

                {/* Rewards List */}
                <div className="p-6 space-y-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    পুরস্কারের অন্তর্ভুক্ত বিষয়সমূহ:
                  </div>
                  <ul className="space-y-2.5">
                    {card.rewards.map((reward, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{reward}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Guarantee Badge */}
              <div className="p-4 mx-6 mb-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>১০০% শতভাগ স্বচ্ছতা</span>
                </span>
                <span className="font-bold text-emerald-700">নিশ্চিত পুরস্কার</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
