"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, Award, Sparkles } from "lucide-react";
import { INITIAL_ADVISORS } from "@/lib/initialData";
import { AdvisorItem } from "@/lib/types";
import { formatImageUrl } from "@/lib/imageUtils";

export default function AdvisorsSection() {
  const [advisors, setAdvisors] = useState<AdvisorItem[]>(INITIAL_ADVISORS);
  const [loading, setLoading] = useState(false);

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
        console.warn("Could not fetch committee members, using fallback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommittee();
  }, []);

  // শীর্ষ নেতৃত্ব (চেয়ারম্যান ও মহাপরিচালক) এবং অন্যান্য সদস্য বিভাজন
  const chairman = advisors.find(
    (a) => a.role.includes("চেয়ারম্যান") || a.role.includes("Chairman") || a.order === 1
  ) || advisors[0];

  const directorGeneral = advisors.find(
    (a) =>
      (a.role.includes("মহাপরিচালক") || a.role.includes("পরিচালনায়")) &&
      a.id !== chairman?.id
  ) || advisors[1];

  const otherMembers = advisors.filter(
    (a) => a.id !== chairman?.id && a.id !== directorGeneral?.id
  );

  return (
    <section className="max-w-7xl mx-auto px-4 pb-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3 border-b border-gray-100 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            সম্মানিত অভিভাবকমণ্ডলী ও দিকনির্দেশক
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-emerald-950 mt-1">
            উপদেষ্টা ও পরিচালনা পর্ষদ
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            ফাউন্ডেশনের সার্বিক ব্যবস্থাপনা, নীতি নির্ধারণ ও শিক্ষা কার্যক্রম পরিচালনায় দায়িত্বপ্রাপ্ত সম্মানিত ব্যক্তিবর্গ
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-200">
          <Award className="w-4 h-4 text-amber-500" />
          <span>মোট {advisors.length} জন সদস্য</span>
        </div>
      </div>

      {/* Top Leadership Cards (Chairman & Director General) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 1. Chairman */}
        {chairman && (
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 border-2 border-amber-400/50 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-emerald-800/80 border-4 border-amber-400 shadow-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform">
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
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-emerald-950 font-black text-[11px] px-3 py-0.5 rounded-full shadow whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-950" />
                শীর্ষ নেতৃত্ব
              </span>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <span className="inline-block bg-emerald-700/80 text-amber-300 font-extrabold text-xs px-3.5 py-1 rounded-full border border-amber-400/30">
                {chairman.role}
              </span>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {chairman.name}
              </h4>
              {chairman.designation && (
                <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                  {chairman.designation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 2. Director General (পরিচালনায়) */}
        {directorGeneral && (
          <div className="bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 border-2 border-emerald-400/40 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-teal-800/80 border-4 border-teal-300 shadow-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform">
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
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-teal-300 text-teal-950 font-black text-[11px] px-3 py-0.5 rounded-full shadow whitespace-nowrap">
                নির্বাহী প্রধান
              </span>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <span className="inline-block bg-teal-800/90 text-teal-200 font-extrabold text-xs px-3.5 py-1 rounded-full border border-teal-300/30">
                {directorGeneral.role}
              </span>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {directorGeneral.name}
              </h4>
              {directorGeneral.designation && (
                <p className="text-xs sm:text-sm text-teal-100 font-medium leading-relaxed">
                  {directorGeneral.designation}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid of Other Governing Body & Advisory Council Members */}
      {otherMembers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 text-center group flex flex-col items-center justify-between"
            >
              <div className="w-full flex flex-col items-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden bg-emerald-50 border-3 border-emerald-500 shadow-md flex items-center justify-center text-3xl font-bold text-emerald-700 group-hover:scale-105 transition-transform">
                  {member.photo ? (
                    <img
                      src={formatImageUrl(member.photo)}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-emerald-700">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-gray-900 text-base group-hover:text-emerald-800 transition">
                  {member.name}
                </h4>

                <span className="inline-block mt-1 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-0.5 rounded-full">
                  {member.role}
                </span>
              </div>

              {member.designation && (
                <p className="text-xs text-gray-500 mt-3 border-t border-gray-100 pt-2.5 w-full">
                  {member.designation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
