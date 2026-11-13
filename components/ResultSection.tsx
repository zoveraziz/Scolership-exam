"use client";

import React, { useState } from "react";
import { Search, Trophy, Printer, Award, AlertCircle, Loader2, CheckCircle, BarChart3 } from "lucide-react";
import { ExamResultData } from "../lib/types";
import { useSettings } from "@/context/SettingsContext";
import { formatImageUrl } from "../lib/imageUtils";

export default function ResultSection() {
  const { settings } = useSettings();
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultData, setResultData] = useState<ExamResultData | null>(null);

  const siteName = settings.SiteName || "রেজাউল হাসান কয়েস লোদী বৃত্তি পরীক্ষা";
  const siteShortName = settings.SiteShortName || "SWF";

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setErrorMsg("দয়া করে রোল বা রেজিস্ট্রেশন নম্বর লিখুন।");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/result?id=${encodeURIComponent(searchId.trim())}`);
      const data = await res.json();

      if (data.success && data.found) {
        setResultData(data.data);
      } else {
        setErrorMsg(data.message || "প্রদত্ত নম্বরে কোনো ফলাফল খুঁজে পাওয়া যায়নি।");
        setResultData(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("সার্ভার থেকে ফলাফল আনতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Search Box */}
      <div className="no-print bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            বৃত্তি পরীক্ষার ফলাফল অনুসন্ধান
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            রেজিস্ট্রেশন নম্বর (যেমন: SWF-2026-849201) অথবা রোল নম্বর (যেমন: ১০৫২৪) প্রদান করে ফলাফল দেখুন
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="রোল বা রেজিস্ট্রেশন নম্বর..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-600 focus:outline-none font-medium text-center text-base tracking-wider uppercase"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>ফলাফল অনুসন্ধান করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>ফলাফল খুঁজুন</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Result Display Card */}
      {resultData && (
        <div className="space-y-4 animate-scaleUp">
          <div className="no-print flex justify-between items-center bg-purple-50 border border-purple-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span>ফলাফল বিবরণী প্রস্তুত রয়েছে</span>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2.5 rounded-xl shadow transition text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>রেজাল্ট শীট প্রিন্ট / PDF</span>
            </button>
          </div>

          <div className="print-area bg-white rounded-3xl shadow-xl border-2 border-purple-300 p-6 sm:p-10 space-y-6 relative overflow-hidden">
            {/* Center Circular Logo Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none flex items-center justify-center opacity-[0.05] w-80 h-80 sm:w-96 sm:h-96">
              {settings.SiteLogo || settings.LogoUrl || settings.SiteLogoUrl || settings.Logo || settings["লোগো"] ? (
                <img
                  src={formatImageUrl(settings.SiteLogo || settings.LogoUrl || settings.SiteLogoUrl || settings.Logo || settings["লোগো"])}
                  alt="Watermark Logo"
                  className="w-full h-full object-contain grayscale"
                />
              ) : (
                <span className="text-9xl font-black text-purple-900">{siteShortName}</span>
              )}
            </div>
            {/* Header */}
            <div className="text-center border-b-2 border-purple-800 pb-5">
              <div className="w-16 h-16 bg-purple-800 text-white font-black text-2xl rounded-2xl flex items-center justify-center mx-auto mb-2 shadow overflow-hidden">
                {settings.SiteLogo || settings.LogoUrl || settings.SiteLogoUrl || settings.Logo || settings["লোগো"] ? (
                  <img
                    src={formatImageUrl(settings.SiteLogo || settings.LogoUrl || settings.SiteLogoUrl || settings.Logo || settings["লোগো"])}
                    alt="Logo"
                    className="w-full h-full object-contain bg-white p-1"
                  />
                ) : (
                  siteShortName
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {siteName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                মেধা মূল্যায়ন ও বৃত্তি পরীক্ষা - ২০২৬ এর অফিশিয়াল ফলাফল
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-purple-100 text-purple-900 font-extrabold text-sm px-4 py-1 rounded-full border border-purple-300">
                <Award className="w-4 h-4 text-purple-700" />
                <span>বৃত্তি বিভাগ: {resultData.scholarshipCategory}</span>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-purple-50/60 p-5 rounded-2xl border border-purple-100 text-sm">
              <div>
                <span className="text-xs text-gray-500 block">শিক্ষার্থীর নাম</span>
                <strong className="text-gray-900 text-base">{resultData.name}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">রোল নম্বর</span>
                <strong className="text-purple-900 text-base font-mono font-bold">{resultData.rollNumber}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">শ্রেণী</span>
                <strong className="text-gray-800">{resultData.studentClass}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">মেধা স্থান (Merit Rank)</span>
                <strong className="text-emerald-700 text-lg font-black">{resultData.meritPosition}ম</strong>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-500 block">শিক্ষা প্রতিষ্ঠান</span>
                <strong className="text-gray-800">{resultData.institution}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">প্রাপ্ত জিপিএ</span>
                <strong className="text-purple-800 text-lg font-black">{resultData.gpa}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">মোট প্রাপ্ত নম্বর</span>
                <strong className="text-gray-900 text-lg font-black">{resultData.obtainedMarks} / {resultData.totalMarks}</strong>
              </div>
            </div>

            {/* Subject-wise Marks Table */}
            {resultData.subjects && resultData.subjects.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-700" />
                  <span>বিষয়ভিত্তিক প্রাপ্ত নম্বরের বিবরণী</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-purple-800 text-white font-bold text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4">বিষয়ের নাম</th>
                        <th className="py-3 px-4 text-center">পূর্ণমান</th>
                        <th className="py-3 px-4 text-center">প্রাপ্ত নম্বর</th>
                        <th className="py-3 px-4 text-center">মন্তব্য</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {resultData.subjects.map((sub: any, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-gray-800">{sub.name || sub.subject || "বিষয়"}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{sub.total ?? sub.fullMarks ?? 0}</td>
                          <td className="py-3 px-4 text-center font-bold text-purple-800">{sub.marks ?? sub.obtainedMarks ?? 0}</td>
                          <td className="py-3 px-4 text-center text-xs font-semibold text-emerald-700">চমৎকার</td>
                        </tr>
                      ))}
                      <tr className="bg-purple-50/80 font-bold">
                        <td className="py-3 px-4 text-purple-950">সর্বমোট নম্বর</td>
                        <td className="py-3 px-4 text-center text-purple-950">{resultData.totalMarks}</td>
                        <td className="py-3 px-4 text-center text-purple-950 font-black text-base">{resultData.obtainedMarks}</td>
                        <td className="py-3 px-4 text-center text-purple-950 text-xs">{resultData.scholarshipCategory}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Official Signatures & Seal */}
            <div className="pt-8 flex justify-between items-end text-xs text-gray-600 border-t border-gray-200">
              <div className="text-center flex flex-col items-center">
                <div className="h-14"></div>
                <div className="w-36 border-b border-gray-400 mb-1"></div>
                <span className="font-semibold text-gray-700">প্রধান পরীক্ষক</span>
                <span className="text-[10px] text-gray-500">মূল্যায়ন কমিটি</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-2 border-purple-600 rounded-full flex items-center justify-center text-purple-800 font-black text-[10px] uppercase opacity-60 mb-1">
                  {siteShortName} SEAL
                </div>
                <span className="text-[11px] font-bold text-purple-800">অফিসিয়াল সিল</span>
              </div>

              <div className="text-center flex flex-col items-center min-w-[150px]">
                {resultData.controllerSignature ? (
                  <div className="h-14 flex items-end justify-center mb-1">
                    <img
                      src={formatImageUrl(resultData.controllerSignature)}
                      alt="Signature"
                      className="max-h-14 max-w-[150px] object-contain drop-shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="h-14"></div>
                )}
                <div className="w-44 border-b border-gray-700 mb-1"></div>
                <strong className="text-[11px] font-bold text-gray-900 block leading-tight">
                  {resultData.controllerName || "পরীক্ষা নিয়ন্ত্রক"}
                </strong>
                <span className="text-[10px] text-gray-600 block mt-0.5">
                  {resultData.controllerDesignation || "কেন্দ্রীয় পরীক্ষা কমিটি"}
                </span>
                {resultData.controllerPhone && (
                  <span className="text-[9px] text-gray-500 block font-mono">
                    মোবাইল: {resultData.controllerPhone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
