"use client";

import React from "react";
import { UserCheck, Smartphone, FileDown, Award, ArrowRight, Sparkles } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface HowToApplyStepsProps {
  onApplyClick: () => void;
}

export default function HowToApplySteps({ onApplyClick }: HowToApplyStepsProps) {
  const { settings } = useSettings();
  const fee = settings.RegistrationFee || "২০০";
  const bkash = settings.bKashNumber || "01721838990";

  const steps = [
    {
      step: "০১",
      title: "তথ্য পূরণ করুন",
      desc: "শিক্ষার্থীর নাম, শ্রেণী, স্কুলের নাম ও অভিভাবকের সচল মোবাইল নম্বর দিয়ে ফর্ম পূরণ করুন।",
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badge: "২ মিনিট সময়",
    },
    {
      step: "০২",
      title: `বিকাশে ফি (${fee} টাকা)`,
      desc: `বিকাশ নম্বর ${bkash}-এ ফি পাঠিয়ে TrxID অথবা পেমেন্ট স্লিপের ছবি যুক্ত করুন।`,
      icon: Smartphone,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      badge: "নিরাপদ পেমেন্ট",
    },
    {
      step: "০৩",
      title: "আবেদনপত্র ডাউনলোড",
      desc: "আবেদন সম্পন্ন হলেই সাথে সাথে অফিসিয়াল একক কপি A4 পিডিএফ ও আইডি সংরক্ষণ করুন।",
      icon: FileDown,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      badge: "তাৎক্ষণিক পিডিএফ",
    },
    {
      step: "০৪",
      title: "এডমিট কার্ড ও পরীক্ষা",
      desc: "পরীক্ষার পূর্বে অনলাইন থেকে প্রবেশপত্র ডাউনলোড করে নির্ধারিত কেন্দ্রে পরীক্ষায় অংশ নিন।",
      icon: Award,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      badge: "বৃত্তি ও পুরস্কার",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-sm">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>সহজ আবেদন প্রক্রিয়া</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
            কীভাবে অনলাইনে আবেদন করবেন?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            মাত্র ৪টি সহজ ধাপে ঘরে বসেই আপনার সন্তানের মেধা বৃত্তি পরীক্ষার রেজিস্ট্রেশন সম্পন্ন করুন
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between relative group"
              >
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} border flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    ধাপ {item.step}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-emerald-800 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom badge */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                  <span className="text-gray-400 group-hover:text-emerald-600 transition">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-600">
            💡 আবেদন সংক্রান্ত যেকোনো সহায়তার জন্য হেল্পলাইন:{" "}
            <strong className="text-emerald-800 font-bold">{settings.Hotline || "০১৯৭৯৫১৩৯৯০"}</strong>
          </p>
          <button
            onClick={onApplyClick}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition text-xs sm:text-sm shrink-0"
          >
            <span>এখনই আবেদন করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
