"use client";

import React from "react";
import { Trophy, Medal, Award, Gift, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function ScholarshipRewards() {
  const { settings } = useSettings();

  // Settings থেকে কাস্টম শিরোনাম, ব্যাজ এবং উপ-শিরোনাম
  const sectionBadge = settings.RewardsSectionBadge || "মেধার সর্বোচ্চ মূল্যায়ন";
  const sectionTitle = settings.RewardsSectionTitle || "বৃত্তি ও মেধা পুরস্কারের ক্যাটাগরি";
  const sectionSubtitle =
    settings.RewardsSectionSubtitle ||
    `${settings.SiteName}-এ প্রতিটি কৃতি শিক্ষার্থীর মেধার সঠিক মূল্যায়ন ও উৎসাহ প্রদানে আমরা নিবেদিত`;

  // কার্ডের সাধারণ লেবেল (গুগল শিট থেকে পরিবর্তনযোগ্য)
  const rewardsListLabel = settings.RewardListHeading || "পুরস্কারের অন্তর্ভুক্ত বিষয়সমূহ:";
  const bottomBadgeLeft = settings.RewardBottomLeft || "১০০% শতভাগ স্বচ্ছতা";
  const bottomBadgeRight = settings.RewardBottomRight || "নিশ্চিত পুরস্কার";

  // ক্যাটাগরি ১: ট্যালেন্টপুল বৃত্তি
  const t1Badge = settings.Reward1Badge || "🥇 ১ম সারির মেধা";
  const t1Title = settings.Reward1Title || "ট্যালেন্টপুল বৃত্তি";
  const t1Subtitle = settings.Reward1Subtitle || "সর্বোচ্চ মেধাবীদের জন্য বিশেষ সম্মাননা";
  const t1Rewards = settings.Reward1List
    ? settings.Reward1List.split("\n").map((s: string) => s.trim()).filter(Boolean)
    : [
        "এককালীন নগদ অর্থ বৃত্তি অনুদান",
        "স্বর্ণখচিত বিশেষ মেধা পদক (Gold Medal)",
        "অফিসিয়াল সম্মাননা স্মারক ও ক্রেস্ট",
        "স্বাক্ষরিত জাতীয় মেধা সনদপত্র (Certificate)",
        "পরবর্তী ক্লাসের জন্য বিশেষ শিক্ষা উপহার",
      ];

  // ক্যাটাগরি ২: সাধারণ গ্রেড বৃত্তি
  const t2Badge = settings.Reward2Badge || "🥈 ২য় সারির মেধা";
  const t2Title = settings.Reward2Title || "সাধারণ গ্রেড বৃত্তি";
  const t2Subtitle = settings.Reward2Subtitle || "উচ্চ নম্বর প্রাপ্ত কৃতি শিক্ষার্থীদের জন্য";
  const t2Rewards = settings.Reward2List
    ? settings.Reward2List.split("\n").map((s: string) => s.trim()).filter(Boolean)
    : [
        "নগদ শিক্ষা সহায়তা অর্থ অনুদান",
        "রৌপ্যখচিত মেধা পদক (Silver Medal)",
        "ফাউন্ডেশন কর্তৃক বিশেষ প্রশংসা সনদ",
        "কৃতি শিক্ষার্থী স্মারক ক্রেস্ট",
        "উচ্চশিক্ষায় উৎসাহমূলক শিক্ষা সামগ্রী",
      ];

  // ক্যাটাগরি ৩: বিশেষ মেধা স্বীকৃতি
  const t3Badge = settings.Reward3Badge || "🎖️ বিশেষ সম্মাননা";
  const t3Title = settings.Reward3Title || "বিশেষ মেধা স্বীকৃতি";
  const t3Subtitle = settings.Reward3Subtitle || "প্রতিযোগিতায় উত্তীর্ণ শিক্ষার্থীদের জন্য";
  const t3Rewards = settings.Reward3List
    ? settings.Reward3List.split("\n").map((s: string) => s.trim()).filter(Boolean)
    : [
        "অংশগ্রহণ ও কৃতিত্বের সম্মাননা সনদপত্র",
        "উচ্চমানের স্কুল ব্যাগ ও শিক্ষা উপকরণ",
        "সাধারণ জ্ঞান ও ক্যারিয়ার বিষয়ক সেরা বই",
        "বার্ষিক প্রকাশনায় মেধা তালিকায় নাম প্রকাশ",
        "ভবিষ্যৎ মেধা কর্মশালায় বিনামূল্যে অংশ নেওয়ার সুযোগ",
      ];

  const rewardCards = [
    {
      grade: t1Title,
      subtitle: t1Subtitle,
      icon: Trophy,
      color: "from-amber-500 to-amber-600",
      border: "border-amber-300",
      bgLight: "bg-amber-50/70",
      badgeText: t1Badge,
      rewards: t1Rewards,
    },
    {
      grade: t2Title,
      subtitle: t2Subtitle,
      icon: Medal,
      color: "from-emerald-600 to-teal-700",
      border: "border-emerald-300",
      bgLight: "bg-emerald-50/70",
      badgeText: t2Badge,
      rewards: t2Rewards,
    },
    {
      grade: t3Title,
      subtitle: t3Subtitle,
      icon: Award,
      color: "from-blue-600 to-indigo-700",
      border: "border-blue-300",
      bgLight: "bg-blue-50/70",
      badgeText: t3Badge,
      rewards: t3Rewards,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{sectionBadge}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
          {sectionTitle}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          {sectionSubtitle}
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
                    {rewardsListLabel}
                  </div>
                  <ul className="space-y-2.5">
                    {card.rewards.map((reward: string, rIdx: number) => (
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
                  <span>{bottomBadgeLeft}</span>
                </span>
                <span className="font-bold text-emerald-700">{bottomBadgeRight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
