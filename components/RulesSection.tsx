"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Clock, Sparkles, Layers, RefreshCw } from "lucide-react";
import { INITIAL_SYLLABUS, DEFAULT_RULES } from "@/lib/initialData";
import { SyllabusItem } from "@/lib/types";

export default function RulesSection() {
  const [rules, setRules] = useState<string[]>(DEFAULT_RULES);
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>(INITIAL_SYLLABUS);
  const [selectedClass, setSelectedClass] = useState<string>("৫ম শ্রেণী");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>("local");

  const fetchRulesAndSyllabus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rules-syllabus?t=" + Date.now(), { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        if (Array.isArray(json.rules) && json.rules.length > 0) {
          setRules(json.rules);
        }
        if (Array.isArray(json.syllabus) && json.syllabus.length > 0) {
          setSyllabusList(json.syllabus);
          // যদি নির্বাচিত শ্রেণী লিস্টে না থাকে, তবে প্রথমটি নির্বাচন করব
          if (!json.syllabus.some((s: SyllabusItem) => s.studentClass === selectedClass)) {
            setSelectedClass(json.syllabus[0].studentClass);
          }
        }
        if (json.source === "google_sheet") {
          setDataSource("google_sheet");
        }
      }
    } catch (err) {
      console.warn("Rules/Syllabus fetch failed, using defaults:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesAndSyllabus();
  }, []);

  const currentSyllabus =
    syllabusList.find((s) => s.studentClass === selectedClass) || syllabusList[0];

  return (
    <section className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      {/* Header with live sync indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            বৃত্তি পরীক্ষা ২০২৬ নির্দেশিকা
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
            নিয়মাবলী ও শ্রেণীভিত্তিক সিলেবাস
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {dataSource === "google_sheet" && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              গুগল শিট থেকে লাইভ সিঙ্ককৃত
            </span>
          )}
          <button
            type="button"
            onClick={fetchRulesAndSyllabus}
            disabled={loading}
            title="সিলেবাস রিফ্রেশ করুন"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-700" : ""}`} />
          </button>
        </div>
      </div>

      {/* Rules Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
              পরীক্ষার সাধারণ নিয়মাবলী ও নির্দেশিকা
            </h3>
            <p className="text-xs text-gray-500">সকল পরীক্ষার্থীর জন্য এই নিয়মাবলী অবশ্য পালনীয়</p>
          </div>
        </div>

        <div className="space-y-3">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-emerald-50/50 transition border border-gray-100"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {idx + 1}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Class-wise Syllabus & Marks Distribution with interactive tabs */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                শ্রেণীভিত্তিক সিলেবাস ও মানবন্টন
              </h3>
              <p className="text-xs text-gray-500">বিষয়ভিত্তিক নম্বর বিভাজন ও মূল পাঠ্যসূচি</p>
            </div>
          </div>

          {currentSyllabus?.examDuration && (
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-50 px-3.5 py-1.5 rounded-xl border border-teal-200 self-start sm:self-auto">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>পরীক্ষার সময়: {currentSyllabus.examDuration}</span>
            </div>
          )}
        </div>

        {/* Class Selection Tabs */}
        <div className="flex flex-wrap gap-2">
          {syllabusList.map((item) => (
            <button
              key={item.id || item.studentClass}
              onClick={() => setSelectedClass(item.studentClass)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                selectedClass === item.studentClass
                  ? "bg-emerald-700 text-white shadow-md scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              {item.studentClass}
            </button>
          ))}
        </div>

        {/* Syllabus Subject Breakdown */}
        {currentSyllabus && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm font-bold text-gray-700 bg-[#f0fdf4] p-3.5 rounded-xl border border-[#86efac]">
              <span>
                নির্বাচিত শ্রেণী:{" "}
                <strong className="text-emerald-950 text-base">{currentSyllabus.studentClass}</strong>
              </span>
              <span>
                মোট পূর্ণমান:{" "}
                <strong className="text-emerald-950 text-base">{currentSyllabus.totalMarks} নম্বর</strong>
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-800 text-white font-bold text-xs uppercase">
                  <tr>
                    <th className="py-3.5 px-5">বিষয়</th>
                    <th className="py-3.5 px-5">সিলেবাস ও মূল বিষয়বস্তু</th>
                    <th className="py-3.5 px-5 text-center">নম্বর</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {currentSyllabus.subjects.map((sub, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="py-3.5 px-5 font-bold text-gray-900 whitespace-nowrap">{sub.name}</td>
                      <td className="py-3.5 px-5 text-gray-600 text-xs sm:text-sm leading-relaxed">{sub.topics}</td>
                      <td className="py-3.5 px-5 text-center font-bold text-emerald-800 whitespace-nowrap">{sub.marks}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/80 font-bold">
                    <td className="py-3.5 px-5 text-emerald-950" colSpan={2}>
                      সর্বমোট মানবন্টন
                    </td>
                    <td className="py-3.5 px-5 text-center text-emerald-950 font-black text-base whitespace-nowrap">
                      {currentSyllabus.totalMarks} নম্বর
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
