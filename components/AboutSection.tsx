"use client";

import React, { useState, useEffect } from "react";
import {
  Info,
  Target,
  Heart,
  Award,
  CheckCircle2,
  Users,
  User,
  Shield,
  Sparkles,
} from "lucide-react";
import { INITIAL_ADVISORS } from "@/lib/initialData";
import { AdvisorItem } from "@/lib/types";
import { formatImageUrl } from "@/lib/imageUtils";
import { useSettings } from "@/context/SettingsContext";

export default function AboutSection() {
  const { settings } = useSettings();
  const [advisors, setAdvisors] = useState<AdvisorItem[]>(INITIAL_ADVISORS);
  const [loading, setLoading] = useState(false);

  const logoUrl =
    settings.SiteLogo ||
    settings.LogoUrl ||
    settings.SiteLogoUrl ||
    settings.logo_url ||
    settings["logo_url"] ||
    settings["logo _url"] ||
    settings.Logo ||
    settings["লোগো"] ||
    "";

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/committee?t=" + Date.now(), { cache: "no-store" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAdvisors(json.data);
        }
      } catch (err) {
        console.warn("Could not fetch committee in AboutSection, using fallback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommittee();
  }, []);

  const highlights = [
    {
      title: "আমাদের লক্ষ্য (Mission)",
      desc: "সুবিধাবঞ্চিত ও সাধারণ পরিবারের মেধাবী শিক্ষার্থীদের আর্থিক সহায়তা ও দিকনির্দেশনা প্রদানের মাধ্যমে তাদের মেধার সর্বোত্তম বিকাশ সাধন করা।",
      icon: Target,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      title: "আমাদের দর্শন (Vision)",
      desc: "একটি মেধাভিত্তিক, আলোকিত ও নৈতিক মূল্যবোধসম্পন্ন সমাজ গঠন, যেখানে কোনো শিক্ষার্থী অর্থের অভাবে শিক্ষা থেকে বঞ্চিত হবে না।",
      icon: Heart,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "মূল্যায়ন নীতি (Values)",
      desc: "১০০% স্বচ্ছতা, নিরপেক্ষতা ও আধুনিক প্রযুক্তি ব্যবহারের মাধ্যমে প্রকৃত মেধাবীদের বাছাই করে বৃত্তি ও সম্মাননা প্রদান।",
      icon: Award,
      color: "bg-teal-50 text-teal-800 border-teal-200",
    },
  ];

  // শীর্ষ নেতৃত্ব (চেয়ারম্যান ও মহাপরিচালক)
  const chairman =
    advisors.find(
      (a) => a.role.includes("চেয়ারম্যান") || a.role.includes("Chairman") || a.order === 1
    ) || advisors[0];

  const directorGeneral =
    advisors.find(
      (a) =>
        (a.role.includes("মহাপরিচালক") || a.role.includes("পরিচালনায়")) &&
        a.id !== chairman?.id
    ) || advisors[1];

  const otherMembers = advisors.filter(
    (a) => a.id !== chairman?.id && a.id !== directorGeneral?.id
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-12">
      {/* ======================================================== */}
      {/* ১ নম্বরে (উপরে): উপদেষ্টা ও পরিচালনা পরিষদ (কমিটি)          */}
      {/* ======================================================== */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Users className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-950">
                উপদেষ্টা ও পরিচালনা পরিষদ
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                ফাউন্ডেশনের কেন্দ্রীয় পরিচালনা পরিষদ ও সম্মানিত উপদেষ্টা মণ্ডলী
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>মোট {advisors.length} জন সদস্য অন্তর্ভুক্ত</span>
          </div>
        </div>

        {/* শীর্ষ নেতৃত্ব: চেয়ারম্যান ও মহাপরিচালক (পরিচালনায়) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ১. চেয়ারম্যান */}
          {chairman && (
            <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border-2 border-amber-400 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-emerald-800 border-4 border-amber-400 shrink-0 shadow-md flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                {chairman.photo ? (
                  <img
                    src={formatImageUrl(chairman.photo)}
                    alt={chairman.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-amber-300" />
                )}
              </div>

              <div className="text-center sm:text-left space-y-2">
                <span className="inline-block bg-amber-400 text-emerald-950 font-black text-xs px-3.5 py-1 rounded-full shadow-sm">
                  {chairman.role}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  {chairman.name}
                </h4>
                {chairman.designation && (
                  <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed font-medium">
                    {chairman.designation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ২. মহাপরিচালক (পরিচালনায়) */}
          {directorGeneral && (
            <div className="bg-gradient-to-br from-teal-950 via-emerald-950 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border-2 border-emerald-400 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-teal-800 border-4 border-teal-300 shrink-0 shadow-md flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                {directorGeneral.photo ? (
                  <img
                    src={formatImageUrl(directorGeneral.photo)}
                    alt={directorGeneral.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-teal-200" />
                )}
              </div>

              <div className="text-center sm:text-left space-y-2">
                <span className="inline-block bg-teal-300 text-teal-950 font-black text-xs px-3.5 py-1 rounded-full shadow-sm">
                  {directorGeneral.role}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  {directorGeneral.name}
                </h4>
                {directorGeneral.designation && (
                  <p className="text-xs sm:text-sm text-teal-200 leading-relaxed font-medium">
                    {directorGeneral.designation}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* অন্যান্য পরিষদ সদস্য ও উপদেষ্টাবৃন্দ */}
        {otherMembers.length > 0 && (
          <div className="space-y-4 pt-4">
            <h4 className="text-lg font-bold text-emerald-950 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>পরিচালনা পরিষদ ও সম্মানিত সদস্যবৃন্দ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-50/80 hover:bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 p-5 transition-all duration-300 hover:shadow-lg flex items-center gap-4 group"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-emerald-500 shadow-sm shrink-0 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                    {member.photo ? (
                      <img
                        src={formatImageUrl(member.photo)}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    <span className="inline-block text-[11px] font-extrabold text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                      {member.role}
                    </span>
                    <h5 className="font-bold text-gray-900 text-sm group-hover:text-emerald-800 transition truncate">
                      {member.name}
                    </h5>
                    {member.designation && (
                      <p className="text-[11px] text-gray-500 line-clamp-2">
                        {member.designation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* ২ নম্বরে (নিচে): আমাদের সম্পর্কে সাধারণ পরিচিতি ও দর্শন    */}
      {/* ======================================================== */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
          {logoUrl ? (
            <div className="w-16 h-16 rounded-2xl p-1 bg-white border-2 border-emerald-500 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={formatImageUrl(logoUrl)}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <Info className="w-7 h-7 text-emerald-700" />
            </div>
          )}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
              আমাদের সম্পর্কে (About Us)
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              শিক্ষা, সেবা ও মেধা মূল্যায়নে অগ্রগামী একটি সমাজসেবামূলক প্রতিষ্ঠান
            </p>
          </div>
        </div>

        <div className="text-gray-700 text-sm sm:text-base leading-relaxed space-y-4">
          <p>
            <strong>{settings.SiteName}</strong> একটি সম্পূর্ণ অরাজনৈতিক, অলাভজনক ও সামাজিক শিক্ষা উন্নয়নমূলক প্রতিষ্ঠান। বিগত বহু বছর ধরে বাংলাদেশের প্রত্যন্ত অঞ্চলসহ নগরজীবনের প্রাথমিক ও মাধ্যমিক স্তরের কোমলমতি শিক্ষার্থীদের মেধা বিকাশ, শিক্ষা উপকরণ সহায়তা এবং মেধা বৃত্তি আয়োজনে বিশ্বস্ততার সাথে কাজ করে আসছে।
          </p>
          <p>
            প্রতি বছর ফাউন্ডেশনের তত্ত্বাবধানে অনুষ্ঠিত হয় দেশসেরা মেধা বৃত্তি পরীক্ষা। উক্ত পরীক্ষায় উত্তীর্ণ শিক্ষার্থীদের এককালীন নগদ বৃত্তি, শিক্ষা অনুদান, সনদপত্র এবং মেধা ক্রেস্ট প্রদান করা হয়। এছাড়াও বিভিন্ন সেমিনার ও ক্যারিয়ার গাইডলাইনের মাধ্যমে শিক্ষার্থীদের ভবিষ্যতের যোগ্য নাগরিক হিসেবে গড়ে তুলতে আমরা নিরলস কাজ করছি।
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`p-6 rounded-2xl border ${item.color} space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-800" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Key Achievements */}
        <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200 space-y-3">
          <h4 className="font-bold text-emerald-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>আমাদের মূল কার্যক্রমসমূহ</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700">
            <li className="flex items-center gap-2">✓ প্রাথমিক ও জুনিয়র মেধা বৃত্তি পরীক্ষা আয়োজন</li>
            <li className="flex items-center gap-2">✓ দরিদ্র ও মেধাবী শিক্ষার্থীদের এককালীন শিক্ষা অনুদান</li>
            <li className="flex items-center gap-2">✓ বার্ষিক শিক্ষা মেলা ও কুইজ প্রতিযোগিতা</li>
            <li className="flex items-center gap-2">✓ নৈতিক ও মানবিক মূল্যবোধ বিষয়ক সেমিনার</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
