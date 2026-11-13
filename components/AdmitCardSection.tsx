"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Printer,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  RefreshCw,
  Calendar,
  Lock,
  Sparkles,
  FileText,
} from "lucide-react";
import { AdmitCardData } from "../lib/types";
import { useSettings } from "@/context/SettingsContext";
import { isApplicationDeadlinePassed } from "@/lib/dateUtils";
import { formatImageUrl } from "../lib/imageUtils";

interface AdmitCardSectionProps {
  initialSearchId?: string;
}

export default function AdmitCardSection({ initialSearchId = "" }: AdmitCardSectionProps) {
  const { settings } = useSettings();
  const [searchId, setSearchId] = useState(initialSearchId);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [admitData, setAdmitData] = useState<AdmitCardData | null>(null);
  const [isDemoPreview, setIsDemoPreview] = useState(false);
  const [statusInfo, setStatusInfo] = useState<{
    status: "pending" | "cancelled";
    message: string;
    searchedId?: string;
  } | null>(null);

  const siteName = settings.SiteName || "রেজাউল হাসান কয়েস লোディー বৃত্তি পরীক্ষা";
  const siteShortName = settings.SiteShortName || "SWF";
  const hotline = settings.Hotline || "০১৯৭৯৫১৩৯৯০";
  const rawExamDate = settings.ExamDate || "১৫ নভেম্বর ২০২৬";
  const applicationDeadline = settings.ApplicationDeadline || "৩১ আগস্ট ২০২৬";

  // এডমিট কার্ড ডাউনলোড লজিক:
  // ১. ম্যানুয়ালি Settings-এ AdmitCardStatus: "চালু" বা "open" থাকলে -> সরাসরি উন্মুক্ত
  // ২. ম্যানুয়ালি "বন্ধ" বা "closed" থাকলে -> লক থাকবে
  // ৩. অন্যথায় (স্বয়ংক্রিয়) -> আবেদনের শেষ তারিখ পার হয়েছে কিনা যাচাই করবে
  const admitCardStatus = (settings.AdmitCardStatus || "স্বয়ংক্রিয়").trim().toLowerCase();
  const isManuallyOpen =
    admitCardStatus === "চালু" ||
    admitCardStatus === "open" ||
    admitCardStatus === "উন্মুক্ত";
  const isManuallyClosed =
    admitCardStatus === "বন্ধ" || admitCardStatus === "closed";
  const isDeadlinePassed = isApplicationDeadlinePassed(applicationDeadline);

  const isDownloadPermitted = isManuallyOpen || (!isManuallyClosed && isDeadlinePassed);

  useEffect(() => {
    if (initialSearchId) {
      setSearchId(initialSearchId);
      handleSearch(initialSearchId);
    }
  }, [initialSearchId]);

  const handleSearch = async (overrideId?: string, isDemoClick: boolean = false) => {
    const idToSearch = (overrideId || searchId).trim();
    if (!idToSearch) {
      setErrorMsg("দয়া করে রেজিস্ট্রেশন বা রোল নম্বর লিখুন।");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setStatusInfo(null);
    setAdmitData(null);
    setIsDemoPreview(isDemoClick);

    try {
      const res = await fetch(`/api/admit?id=${encodeURIComponent(idToSearch)}`);
      const data = await res.json();

      if (data.status === "pending" || data.status === "cancelled") {
        setAdmitData(null);
        setStatusInfo({
          status: data.status,
          message:
            data.message ||
            (data.status === "pending"
              ? "আপনার আবেদন ও বিকাশ পেমেন্ট যাচাইকরণ প্রক্রিয়াধীন রয়েছে। কর্তৃপক্ষ অনুমোদন করার পর এডমিট কার্ড ডাউনলোড করতে পারবেন।"
              : "পেমেন্ট জটিলতা বা তথ্যের অমিলের কারণে আবেদনটি স্থগিত বা বাতিল করা হয়েছে।"),
          searchedId: idToSearch,
        });
      } else if (data.success && data.found && data.data) {
        setAdmitData(data.data);
        setStatusInfo(null);
      } else {
        setAdmitData(null);
        setStatusInfo(null);
        setErrorMsg(data.message || "প্রদত্ত রেজিস্ট্রেশন বা রোল নম্বরে কোনো তথ্য পাওয়া যায়নি।");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("সার্ভার থেকে তথ্য আনতে ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const loadDemoCard = () => {
    setSearchId("10524");
    handleSearch("10524", true);
  };

  return (
    <section className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Search Box */}
      <div className="no-print bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 max-w-xl mx-auto text-center space-y-4">
        {/* Status Indicator Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border shadow-xs">
          {isDownloadPermitted ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>প্রবেশপত্র বিতরণ চলমান (ডাউনলোড উন্মুক্ত)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-900 bg-amber-50 border-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>আবেদনের শেষ সময়: {applicationDeadline} (এরপর ডাউনলোড শুরু)</span>
            </span>
          )}
        </div>

        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CreditCard className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
            প্রবেশপত্র (Admit Card) সংগ্রহ
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            আপনার রেজিস্ট্রেশন আইডি (যেমন: SWF-2026-849201) অথবা রোল নম্বর দিয়ে অনুসন্ধান করুন
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="রেজিস্ট্রেশন নম্বর বা রোল লিখুন..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none font-medium text-center text-base tracking-wider uppercase"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>অনুসন্ধান করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>অ্যাডমিট কার্ড খুঁজুন</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!admitData && !statusInfo && !errorMsg && (
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>পরীক্ষামূলক দেখতে চান?</span>
            <button
              type="button"
              onClick={loadDemoCard}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              নমুনা এডমিট কার্ড প্রিভিউ (Demo)
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* অবস্থা ১: আবেদন পেন্ডিং (পেমেন্ট যাচাই চলছে)                 */}
      {/* ======================================================== */}
      {statusInfo && statusInfo.status === "pending" && (
        <div className="no-print bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/70 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto text-center space-y-5 animate-scaleUp">
          <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Clock className="w-9 h-9 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-900 border border-amber-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
              <span>স্ট্যাটাস: পেন্ডিং (পেমেন্ট যাচাইকরণ চলছে)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 pt-2">
              আবেদন ও পেমেন্ট যাচাইকরণ প্রক্রিয়াধীন
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 max-w-lg mx-auto leading-relaxed pt-1">
              আইডি: <strong className="font-mono text-amber-900 font-black">{statusInfo.searchedId}</strong>
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-amber-300 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm text-gray-700 space-y-2.5 shadow-sm">
            <p className="font-semibold text-gray-900">
              📌 {statusInfo.message}
            </p>
            <p className="text-gray-600 leading-relaxed text-xs">
              কর্তৃপক্ষ বিকাশ ট্রানজেকশন আইডি এবং পেমেন্টের স্ক্রিনশট মিলিয়ে দেখছেন। অনুমোদন (Approved) সম্পন্ন হওয়া এবং আবেদনের শেষ সময়সীমা (<strong>{applicationDeadline}</strong>) সমাপ্তির পর এখান থেকে প্রবেশপত্র ডাউনলোড করতে পারবেন।
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={() => handleSearch(statusInfo.searchedId)}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition text-xs sm:text-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>স্ট্যাটাস পুনরায় চেক করুন</span>
            </button>

            <a
              href={`tel:${hotline}`}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm transition text-xs sm:text-sm"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>হেল্পলাইন: {hotline}</span>
            </a>

            <a
              href={`https://wa.me/880${hotline.replace(/^0+/, "")}?text=${encodeURIComponent(
                `আসসালামু আলাইকুম, আমি রেজিস্ট্রেশন আইডি ${statusInfo.searchedId} এর পেমেন্ট অনুমোদন সংক্রান্ত তথ্যের জন্য যোগাযোগ করছি।`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-4 py-2.5 rounded-xl shadow transition text-xs sm:text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
            </a>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* অবস্থা ২: আবেদন বাতিল বা স্থগিত (Cancelled)                 */}
      {/* ======================================================== */}
      {statusInfo && statusInfo.status === "cancelled" && (
        <div className="no-print bg-gradient-to-br from-red-50 via-rose-50 to-red-100/70 border-2 border-red-400 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto text-center space-y-5 animate-scaleUp">
          <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-red-600/15 text-red-900 border border-red-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>স্ট্যাটাস: আবেদন স্থগিত / বাতিল</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-red-950 pt-2">
              আবেদনটি স্থগিত বা বাতিল করা হয়েছে
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 max-w-lg mx-auto leading-relaxed pt-1">
              আইডি: <strong className="font-mono text-red-900 font-black">{statusInfo.searchedId}</strong>
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-red-300 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm text-gray-700 space-y-2.5 shadow-sm">
            <p className="font-bold text-red-900">
              ⚠️ {statusInfo.message}
            </p>
            <p className="text-gray-600 leading-relaxed text-xs">
              বিকাশ পেমেন্টের সাথে প্রেরিত নম্বরের অমিল, ফি অসম্পূর্ণ থাকা অথবা ভুল তথ্যের কারণে আবেদনটি স্থগিত রাখা হয়েছে। অনুগ্রহ করে আপনার পেমেন্টের সঠিক তথ্য নিয়ে কেন্দ্রীয় হেল্পলাইনে অবিলম্বে যোগাযোগ করুন।
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href={`tel:${hotline}`}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-5 py-2.5 rounded-xl shadow transition text-xs sm:text-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>হেল্পলাইনে কল করুন ({hotline})</span>
            </a>

            <a
              href={`https://wa.me/880${hotline.replace(/^0+/, "")}?text=${encodeURIComponent(
                `জরুরি: আমার রেজিস্ট্রেশন আইডি ${statusInfo.searchedId} বাতিল/স্থগিত অবস্থায় রয়েছে। পেমেন্ট তথ্য সংশোধন করতে সহায়তা চাই।`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-4 py-2.5 rounded-xl shadow transition text-xs sm:text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে জানান</span>
            </a>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* অবস্থা ৩ (ক): আবেদন অনুমোদিত কিন্তু ডাউনলোডের সময় হয়নি      */}
      {/* (আবেদনের শেষ তারিখের পূর্বে লক রাখার মোড)                   */}
      {/* ======================================================== */}
      {admitData && !isDownloadPermitted && !isDemoPreview && (
        <div className="no-print bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 border-2 border-emerald-500 rounded-3xl p-6 sm:p-9 shadow-xl max-w-2xl mx-auto text-center space-y-6 animate-scaleUp">
          <div className="w-16 h-16 bg-emerald-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Calendar className="w-8 h-8 text-amber-300" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>আবেদন ও পেমেন্ট অনুমোদিত (Approved)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950 pt-1">
              প্রবেশপত্র ডাউনলোডের সময় এখনো শুরু হয়নি
            </h3>
            <p className="text-xs sm:text-sm text-gray-700">
              আবেদনের শেষ সময়: <strong className="text-emerald-900 font-bold">{applicationDeadline}</strong>
            </p>
          </div>

          {/* Applicant Info Summary Box */}
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-gray-500 text-xs">পরীক্ষার্থীর নাম:</span>
              <strong className="text-gray-900 text-sm font-bold">{admitData.name}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-gray-500 text-xs">রেজিস্ট্রেশন নম্বর:</span>
              <strong className="text-emerald-800 font-mono font-black">{admitData.regNo}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-gray-500 text-xs">শ্রেণী ও প্রতিষ্ঠান:</span>
              <span className="text-gray-800 font-medium text-xs">{admitData.studentClass} | {admitData.institution}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">অনুমোদন স্ট্যাটাস:</span>
              <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
                ✓ কর্তৃপক্ষ কর্তৃক অনুমোদিত (Verified)
              </span>
            </div>
          </div>

          {/* Official Rule Notice */}
          <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 sm:p-5 text-left text-xs text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                আপনার আবেদনপত্র ও পেমেন্ট সফলভাবে অনুমোদিত হয়েছে। নিয়ম অনুযায়ী আগামী <strong>{applicationDeadline}</strong> পর্যন্ত দেশব্যাপী নতুন আবেদন গ্রহণ কার্যক্রম চলবে। আবেদনের সময়সীমা সমাপ্ত হওয়ার পর সকল পরীক্ষার্থীর আসন বিন্যাস ও কেন্দ্র তালিকা চূড়ান্ত করে প্রবেশপত্র ডাউনলোডের জন্য উন্মুক্ত করা হবে।
              </p>
            </div>
            <p className="text-[11px] text-amber-900 font-bold pl-6">
              💡 <strong>{applicationDeadline}</strong> তারিখের পর এই পেজে এসে রেজিস্ট্রেশন নম্বর দিলেই আপনার মূল প্রবেশপত্র (Admit Card) প্রিন্ট ও PDF ডাউনলোড করতে পারবেন।
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href={`tel:${hotline}`}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm transition text-xs sm:text-sm"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>হেল্পলাইন: {hotline}</span>
            </a>

            <a
              href={`https://wa.me/880${hotline.replace(/^0+/, "")}?text=${encodeURIComponent(
                `আসসালামু আলাইকুম, আমি রেজিস্ট্রেশন আইডি ${admitData.regNo} এর প্রবেশপত্র ডাউনলোডের সময়সূচী জানতে যোগাযোগ করছি।`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-4 py-2.5 rounded-xl shadow transition text-xs sm:text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে তথ্য জানুন</span>
            </a>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* অবস্থা ৩ (খ): অনুমোদিত প্রবেশপত্র ডাউনলোড (Open State)     */}
      {/* (আবেদনের শেষ তারিখের পরে অথবা ডেমো প্রিভিউ)                  */}
      {/* ======================================================== */}
      {admitData && (isDownloadPermitted || isDemoPreview) && (
        <div className="space-y-4">
          <div className="no-print flex flex-col sm:flex-row justify-between items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                {isDemoPreview
                  ? "নমুনা প্রবেশপত্র প্রিভিউ (Demo Preview)"
                  : "আবেদন অনুমোদিত — প্রবেশপত্র প্রস্তুত রয়েছে"}
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow transition text-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / PDF ডাউনলোড</span>
            </button>
          </div>

          {/* Printable Official Admit Card */}
          <div className="print-area bg-white rounded-3xl shadow-xl border-4 border-emerald-800 p-6 sm:p-10 relative overflow-hidden">
            {/* Center Circular Logo Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none flex items-center justify-center opacity-[0.06] w-80 h-80 sm:w-96 sm:h-96">
              {settings.SiteLogo || settings.LogoUrl || settings.SiteLogoUrl || settings.Logo || settings["লোগো"] ? (
                <img
                  src={formatImageUrl(settings.SiteLogo || settings.LogoUrl || settings.SiteLogoUrl || settings.Logo || settings["লোগো"])}
                  alt="Watermark Logo"
                  className="w-full h-full object-contain grayscale"
                />
              ) : (
                <span className="text-9xl font-black text-emerald-900">{siteShortName}</span>
              )}
            </div>

            {/* Admit Card Top Header */}
            <div className="flex justify-between items-start gap-4 border-b-2 border-emerald-800 pb-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-800 text-white font-black text-2xl sm:text-3xl rounded-2xl flex items-center justify-center shadow-md shrink-0 overflow-hidden">
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
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 leading-tight">
                    {siteName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                    মেধা মূল্যায়ন ও বৃত্তি পরীক্ষা - ২০২৬
                  </p>
                  <span className="inline-block bg-emerald-800 text-white font-bold text-xs px-3 py-1 rounded-full mt-1 uppercase tracking-wider">
                    প্রবেশপত্র (Admit Card)
                  </span>
                </div>
              </div>

              {/* Student Photo Holder */}
              <div className="w-24 h-28 sm:w-28 sm:h-32 border-2 border-dashed border-gray-400 bg-gray-50 flex items-center justify-center text-gray-400 text-xs text-center p-2 font-bold shrink-0 rounded-xl overflow-hidden shadow-sm">
                {admitData.photoUrl ? (
                  <img src={admitData.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <span>পরীক্ষার্থীর পাসপোর্ট সাইজ ছবি</span>
                )}
              </div>
            </div>

            {/* Admit Card Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 mb-6">
              <div>
                <span className="text-gray-500 block text-xs">রেজিস্ট্রেশন আইডি:</span>
                <strong className="text-emerald-900 font-black text-base sm:text-lg font-mono tracking-wider">
                  {admitData.regNo}
                </strong>
              </div>

              <div>
                <span className="text-gray-500 block text-xs">পরীক্ষার্থীর রোল নম্বর:</span>
                <strong className="text-gray-900 font-black text-base sm:text-lg">
                  {admitData.rollNumber}
                </strong>
              </div>

              <div>
                <span className="text-gray-500 block text-xs">শ্রেণী:</span>
                <strong className="text-emerald-800 font-extrabold text-base">
                  {admitData.studentClass}
                </strong>
              </div>

              <div className="col-span-2 md:col-span-1">
                <span className="text-gray-500 block text-xs">পরীক্ষার্থীর নাম:</span>
                <strong className="text-gray-900 font-bold text-base">
                  {admitData.name}
                </strong>
              </div>

              <div>
                <span className="text-gray-500 block text-xs">পিতার নাম:</span>
                <strong className="text-gray-800 font-semibold">
                  {admitData.fatherName}
                </strong>
              </div>

              <div>
                <span className="text-gray-500 block text-xs">মাতার নাম:</span>
                <strong className="text-gray-800 font-semibold">
                  {admitData.motherName || "মোছা: সুফিয়া খাতুন"}
                </strong>
              </div>

              <div className="col-span-2">
                <span className="text-gray-500 block text-xs">শিক্ষা প্রতিষ্ঠানের নাম:</span>
                <strong className="text-gray-900 font-semibold">
                  {admitData.institution}
                </strong>
              </div>

              <div className="col-span-2 md:col-span-3">
                <span className="text-gray-500 block text-xs">পরীক্ষার কেন্দ্র:</span>
                <strong className="text-emerald-900 font-bold text-base">
                  {admitData.examCenter || "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা"}
                </strong>
              </div>

              <div className="col-span-2 md:col-span-3">
                <span className="text-gray-500 block text-xs">পরীক্ষার তারিখ ও সময়:</span>
                <strong className="text-emerald-700 font-bold text-base">
                  {admitData.examDate || rawExamDate} {admitData.examTime ? `(${admitData.examTime})` : ""}
                </strong>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-600 space-y-1 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="font-bold text-gray-800 mb-1">পরীক্ষার্থীদের জন্য বিশেষ নির্দেশাবলী:</p>
              <p>১. পরীক্ষার হলে অবশ্যই এই প্রবেশপত্রটি সঙ্গে নিয়ে আসতে হবে।</p>
              <p>২. পরীক্ষা শুরুর ন্যূনতম ৩০ মিনিট পূর্বে নির্ধারিত আসনে বসতে হবে।</p>
              <p>৩. উত্তরপত্রে রোল নম্বর ও প্রয়োজনীয় তথ্য কালো বলপেন দিয়ে সঠিকভাবে ভরাট করতে হবে।</p>
            </div>

            {/* Official Signatures & Seal */}
            <div className="pt-6 flex justify-between items-end text-xs text-gray-600 border-t border-gray-200">
              <div className="text-center">
                <div className="w-36 border-b border-gray-400 mb-1"></div>
                <span className="font-medium">পরীক্ষার্থীর স্বাক্ষর</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-2 border-emerald-600 rounded-full flex items-center justify-center text-emerald-800 font-black text-[10px] uppercase opacity-60 mb-1">
                  {siteShortName} SEAL
                </div>
                <span className="text-[11px] font-bold text-emerald-800">অফিসিয়াল সিল</span>
              </div>

              <div className="text-center flex flex-col items-center min-w-[150px]">
                {admitData.controllerSignature ? (
                  <div className="h-14 flex items-end justify-center mb-1">
                    <img
                      src={formatImageUrl(admitData.controllerSignature)}
                      alt="Signature"
                      className="max-h-14 max-w-[150px] object-contain drop-shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="h-14"></div>
                )}
                <div className="w-44 border-b border-gray-700 mb-1"></div>
                <strong className="text-[11px] font-bold text-gray-900 block leading-tight">
                  {admitData.controllerName || "পরীক্ষা নিয়ন্ত্রক"}
                </strong>
                <span className="text-[10px] text-gray-600 block mt-0.5">
                  {admitData.controllerDesignation || "কেন্দ্রীয় পরীক্ষা কমিটি"}
                </span>
                {admitData.controllerPhone && (
                  <span className="text-[9px] text-gray-500 block font-mono">
                    মোবাইল: {admitData.controllerPhone}
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
