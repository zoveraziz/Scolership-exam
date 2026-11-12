"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Sparkles, MessageCircle } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function FAQSection() {
  const { settings } = useSettings();
  const fee = settings.RegistrationFee || "২০০";
  const bkash = settings.bKashNumber || "01721838990";
  const hotline = settings.Hotline || "০১৯৭৯৫১৩৯৯০";

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "বৃত্তি পরীক্ষায় কোন কোন শ্রেণীর শিক্ষার্থীরা অংশগ্রহণ করতে পারবে?",
      a: "প্রাথমিক ও মাধ্যমিক স্তরের ৪র্থ শ্রেণী, ৫ম শ্রেণী, ৬ষ্ঠ শ্রেণী, ৭ম শ্রেণী এবং ৮ম শ্রেণীর সকল সাধারণ স্কুল, কিন্ডারগার্টেন ও মাদ্রাসার নিয়মিত ছাত্র-ছাত্রীরা এই পরীক্ষায় অংশ নিতে পারবে।",
    },
    {
      q: `রেজিস্ট্রেশন ফি কত এবং কীভাবে পরিশোধ করতে হবে?`,
      a: `রেজিস্ট্রেশন ফি জনপ্রতি মাত্র ${fee} টাকা। বিকাশ নম্বর ${bkash}-এ Send Money অথবা Payment করে ট্রানজেকশন আইডি (TrxID) সংগ্রহ করে অনলাইন ফর্মে বসিয়ে দিতে হবে।`,
    },
    {
      q: "TrxID (ট্রানজেকশন আইডি) কী এবং এটি কোথায় পাওয়া যাবে?",
      a: "বিকাশে টাকা সফলভাবে পাঠানোর পর বিকাশ থেকে ফিরতি একটি এসএমএস (SMS) আসে। সেই এসএমএসে অথবা বিকাশ অ্যাপের কনফার্মেশন স্ক্রিনে ৮ থেকে ১০ অক্ষরের একটি ইউনিক কোড (যেমন: BL79XK8Q2P) থাকে। এটিই ট্রানজেকশন আইডি বা TrxID।",
    },
    {
      q: "অনলাইনে আবেদনের পর প্রমাণপত্র ও এডমিট কার্ড কীভাবে পাব?",
      a: "আবেদন সাবমিট করার সাথে সাথেই আপনি কম্পিউটার বা মোবাইলেই একক পেজের আন্তর্জাতিক স্ট্যান্ডার্ড A4 সাইজের অফিসিয়াল আবেদন কপি পিডিএফ ডাউনলোড করতে পারবেন। পরবর্তীতে পরীক্ষার পূর্বে রোল বা রেজিস্ট্রেশন আইডি দিয়ে ওয়েবসাইট থেকেই এডমিট কার্ড ডাউনলোড করা যাবে।",
    },
    {
      q: "পরীক্ষার প্রশ্নপদ্ধতি, সময় ও মানবন্টন কেমন হবে?",
      a: "পরীক্ষাটি ১০০ নম্বরের হবে। বিষয়ভিত্তিক মানবন্টন: বাংলা (২৫), ইংরেজি (২৫), গণিত (৩০), এবং সাধারণ জ্ঞান ও বিজ্ঞান (২০)। বহুনির্বাচনী (MCQ) ও সংক্ষিপ্ত প্রশ্ন থাকবে। মোট সময় থাকবে ২ ঘণ্টা থেকে ২ ঘণ্টা ৩০ মিনিট।",
    },
    {
      q: "আবেদনে কোনো ভুল তথ্য দিলে তা কীভাবে সংশোধন করব?",
      a: `আবেদনে কোনো ভুল হলে ঘাবড়ানোর কিছু নেই। আপনি সরাসরি আমাদের কেন্দ্রীয় হেল্পলাইন নম্বর ${hotline}-এ ফোন করে অথবা হোয়াটসঅ্যাপে বার্তা পাঠিয়ে আপনার রেজিস্ট্রেশন আইডি জানালেই আমাদের প্রতিনিধি তথ্য সংশোধন করে দেবেন।`,
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>সাধারণ জিজ্ঞাসা ও উত্তর</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
          সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          অভিভাবক ও শিক্ষার্থীদের বহুল জিজ্ঞাসিত প্রশ্নের উত্তর এক নজরে জেনে নিন
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition hover:border-emerald-300"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-800 hover:text-emerald-800 transition"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 text-xs flex items-center justify-center font-black shrink-0">
                    {index + 1}
                  </span>
                  <span>{item.q}</span>
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                    isOpen ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help box */}
      <div className="mt-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs sm:text-sm text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-medium">
          <MessageCircle className="w-4 h-4 text-emerald-700" />
          <span>আপনার কি অন্য কোনো প্রশ্ন আছে যা এখানে নেই?</span>
        </span>
        <a
          href={`tel:${hotline.replace(/\s+/g, "")}`}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-xl shadow-sm transition text-xs shrink-0"
        >
          সরাসরি হেল্পলাইনে কল করুন
        </a>
      </div>
    </section>
  );
}
