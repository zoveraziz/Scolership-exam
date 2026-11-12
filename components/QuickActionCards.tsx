"use client";

import React from "react";
import { UserPlus, CreditCard, Award, BookOpen } from "lucide-react";

interface QuickActionCardsProps {
  onRegister: () => void;
  onAdmit: () => void;
  onResult: () => void;
  onRules: () => void;
}

export default function QuickActionCards({
  onRegister,
  onAdmit,
  onResult,
  onRules,
}: QuickActionCardsProps) {
  const cards = [
    {
      title: "অনলাইন রেজিস্ট্রেশন",
      desc: "সহজ ৪টি ধাপে ঘরে বসেই বৃত্তি পরীক্ষার ফর্ম পূরণ করুন",
      icon: UserPlus,
      color: "emerald",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:border-emerald-500",
      iconBg: "bg-emerald-600 text-white",
      onClick: onRegister,
    },
    {
      title: "এডমিট কার্ড ডাউনলোড",
      desc: "রেজিস্ট্রেশন বা রোল নম্বর দিয়ে পরীক্ষার প্রবেশপত্র সংগ্রহ করুন",
      icon: CreditCard,
      color: "amber",
      bg: "bg-amber-50 text-amber-700 border-amber-200 group-hover:border-amber-500",
      iconBg: "bg-amber-500 text-gray-950",
      onClick: onAdmit,
    },
    {
      title: "ফলাফল অনুসন্ধান",
      desc: "মেধা তালিকার ফলাফল, জিপিএ ও প্রাপ্ত নম্বরের বিবরণী দেখুন",
      icon: Award,
      color: "purple",
      bg: "bg-purple-50 text-purple-700 border-purple-200 group-hover:border-purple-500",
      iconBg: "bg-purple-600 text-white",
      onClick: onResult,
    },
    {
      title: "সিলেবাস ও মানবন্টন",
      desc: "৪র্থ থেকে ৮ম শ্রেণীর বিষয়ভিত্তিক বিস্তারিত সিলেবাস দেখুন",
      icon: BookOpen,
      color: "teal",
      bg: "bg-teal-50 text-teal-700 border-teal-200 group-hover:border-teal-500",
      iconBg: "bg-teal-600 text-white",
      onClick: onRules,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className={`p-6 rounded-2xl bg-white border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between ${card.bg}`}
            >
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform ${card.iconBg}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-800 transition">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                <span>প্রবেশ করুন</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
