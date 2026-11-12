"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  School,
  Phone,
  CreditCard,
  CheckCircle,
  Copy,
  Sparkles,
  AlertCircle,
  Loader2,
  FileCheck,
  ShieldCheck,
  GraduationCap,
  Eye,
  Edit3,
  AlertTriangle,
  ArrowRight,
  Download,
} from "lucide-react";
import { StudentApplication } from "../lib/types";
import { useSettings } from "@/context/SettingsContext";

interface RegistrationFormProps {
  onGoToAdmit: (regId: string) => void;
}

export default function RegistrationForm({ onGoToAdmit }: RegistrationFormProps) {
  const [regNo, setRegNo] = useState<string>("");
  const [formData, setFormData] = useState<StudentApplication>({
    regNo: "",
    name: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    institution: "",
    studentClass: "",
    principalPhone: "",
    guardianPhone: "",
    email: "",
    senderBkash: "",
    photoUrl: "",
    payShotUrl: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [payShotPreview, setPayShotPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isPreview, setIsPreview] = useState(false); // প্রিভিউ যাচাই মোড
  const [isSuccess, setIsSuccess] = useState(false); // চূড়ান্ত সাবমিট সফল মোড
  const [submittedData, setSubmittedData] = useState<StudentApplication | null>(null);
  const [copiedBkash, setCopiedBkash] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const { settings, refreshSettings } = useSettings();
  const bkashNumber = settings.bKashNumber || "01721838990";
  const regFee = settings.RegistrationFee || "200";

  // Auto generate random registration number on mount
  useEffect(() => {
    generateNewRegNo();
  }, []);

  const generateNewRegNo = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const newReg = `SWF-2026-${randomCode}`;
    setRegNo(newReg);
    setFormData((prev) => ({ ...prev, regNo: newReg }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Student Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("ছবির সাইজ সর্বোচ্চ ২ MB হতে হবে।");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setFormData((prev) => ({ ...prev, photoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  // Payment Screenshot Upload
  const handlePayShotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("পেমেন্ট স্ক্রিনশটের সাইজ সর্বোচ্চ ২ MB হতে হবে।");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPayShotPreview(result);
      setFormData((prev) => ({ ...prev, payShotUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, type: "bkash" | "reg") => {
    navigator.clipboard.writeText(text);
    if (type === "bkash") {
      setCopiedBkash(true);
      setTimeout(() => setCopiedBkash(false), 2000);
    } else {
      setCopiedReg(true);
      setTimeout(() => setCopiedReg(false), 2000);
    }
  };

  // WhatsApp Share Function
  const shareToWhatsApp = () => {
    const current = submittedData || formData;
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const msg = `*দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন (SWF)*
মেধা মূল্যায়ন ও বৃত্তি পরীক্ষা - ২০২৬

✅ *অনলাইন আবেদনপত্র সফলভাবে জমা হয়েছে!*
━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *রেজিস্ট্রেশন নম্বর:* ${current.regNo}
👤 *শিক্ষার্থীর নাম:* ${current.name}
🏫 *শিক্ষা প্রতিষ্ঠান:* ${current.institution}
📚 *শ্রেণী:* ${current.studentClass}
👨‍👦 *পিতার নাম:* ${current.fatherName}
📱 *অভিভাবকের মোবাইল:* ${current.guardianPhone}
💳 *বিকাশ পেমেন্ট:* ${current.senderBkash}
📅 *আবেদনের তারিখ:* ${current.submissionDate || new Date().toLocaleString("bn-BD")}
━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 *এডমিট কার্ড ও ফলাফল দেখতে এই লিংকে প্রবেশ করুন:*
${siteUrl}/#admit

(আবেদনের কপি ও রেজিস্ট্রেশন নম্বরটি যত্নসহকারে সংরক্ষণ করুন)`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, "_blank");
  };

  // সরাসরি PDF ডাউনলোড (প্রিন্ট উইন্ডো ছাড়াই এক ক্লিকে .pdf সেভ)
  const downloadPdfDirect = async () => {
    const element = document.getElementById("a4-application-document");
    if (!element) return;

    setDownloadingPdf(true);
    try {
      // ফন্ট লোড নিশ্চিত করা যাতে বাংলায় কোনো টেক্সট মিসিং না হয়
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(element, {
        scale: 2, // ক্রিস্প ও শার্প কোয়ালিটি
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1000,
        onclone: (clonedDoc) => {
          const docEl = clonedDoc.getElementById("a4-application-document");
          if (docEl) {
            docEl.style.backgroundColor = "#ffffff";
            docEl.style.color = "#111827";
          }
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // A4 পেজে পারফেক্টলি ফিট করা
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      const regId = submittedData?.regNo || regNo;
      pdf.save(`SWF-Application-${regId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ধাপ ১ -> ধাপ ২: "আবেদনপত্র চূড়ান্তভাবে যাচাই করুন"
  const handleReviewForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!photoPreview) {
      setErrorMsg("দয়া করে শিক্ষার্থীর ছবি আপলোড করুন।");
      return;
    }

    if (!payShotPreview) {
      setErrorMsg("দয়া করে বিকাশ পেমেন্টের স্ক্রিনশট আপলোড করুন।");
      return;
    }

    setIsPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ধাপ ২ -> ধাপ ৩: চূড়ান্ত সাবমিট হ্যান্ডলার
  const handleFinalSubmit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          regNo: regNo,
          submissionDate: new Date().toLocaleString("bn-BD"),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedData({
          ...formData,
          regNo: data.regNo || regNo,
          submissionDate: new Date().toLocaleString("bn-BD"),
        });
        setIsPreview(false);
        setIsSuccess(true);
        refreshSettings();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMsg(data.error || "আবেদন প্রক্রিয়ায় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // প্রিভিউ থেকে ফর্মে ফেরা
  const handleBackToEdit = () => {
    setIsPreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // নতুন আবেদন রিসেট
  const handleResetForNew = () => {
    setIsSuccess(false);
    setIsPreview(false);
    setSubmittedData(null);
    setPhotoPreview("");
    setPayShotPreview("");
    generateNewRegNo();
    setFormData({
      regNo: "",
      name: "",
      fatherName: "",
      motherName: "",
      dob: "",
      gender: "",
      institution: "",
      studentClass: "",
      principalPhone: "",
      guardianPhone: "",
      email: "",
      senderBkash: "",
      photoUrl: "",
      payShotUrl: "",
    });
  };

  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      {/* ======================================================== */}
      {/* অবস্থা ১: চূড়ান্ত সাবমিট সফল (Success & Download State)     */}
      {/* ======================================================== */}
      {isSuccess && submittedData ? (
        <div className="space-y-8 animate-scaleUp">
          {/* Success Banner */}
          <div className="no-print bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-600 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-950">
                আপনার আবেদন সফলভাবে জমা হয়েছে!
              </h3>
              <p className="text-sm text-gray-700">
                শিক্ষার্থী: <strong className="text-emerald-900 font-bold text-base">{submittedData.name}</strong>
              </p>
            </div>

            {/* Registration ID Badge */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-white border-2 border-emerald-600 rounded-2xl px-6 py-3 shadow-md">
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider font-bold">অফিসিয়াল রেজিস্ট্রেশন নম্বর</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-wider font-mono">
                  {submittedData.regNo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(submittedData.regNo, "reg")}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl transition border border-emerald-300"
                title="নম্বর কপি করুন"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedReg ? "কপি হয়েছে ✓" : "নম্বর কপি"}</span>
              </button>
            </div>

            {/* Approval Status Badge */}
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500 text-amber-950 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>আবেদন স্ট্যাটাস: পেন্ডিং (পেমেন্ট ও তথ্য যাচাই চলছে)</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
              আপনার A4 সাইজের অফিসিয়াল আবেদনপত্রটি তৈরি হয়েছে। নিচে থাকা বাটন দিয়ে সরাসরি <strong>PDF ফাইল হিসেবে ডাউনলোড</strong> করতে পারেন অথবা <strong>হোয়াটসঅ্যাপে শেয়ার</strong> করে রাখতে পারেন।
            </p>

            {/* শুধুমাত্র ৩টি বাটন: ১. হোয়াটসঅ্যাপ, ২. পিডিএফ ডাউনলোড, ৩. নতুন আবেদন */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {/* বাটন ১: হোয়াটসঅ্যাপে শেয়ার করুন */}
              <button
                type="button"
                onClick={shareToWhatsApp}
                className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-black px-7 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>হোয়াটসঅ্যাপে শেয়ার করুন</span>
              </button>

              {/* বাটন ২: পিডিএফ ডাউনলোড করুন (সরাসরি .pdf ফাইল হিসেবে সেভ) */}
              <button
                type="button"
                onClick={downloadPdfDirect}
                disabled={downloadingPdf}
                className="flex items-center gap-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black px-7 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-75"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>পিডিএফ তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 text-amber-300" />
                    <span>পিডিএফ ডাউনলোড করুন</span>
                  </>
                )}
              </button>

              {/* বাটন ৩: নতুন আবেদন */}
              <button
                type="button"
                onClick={handleResetForNew}
                className="border-2 border-emerald-700 text-emerald-800 hover:bg-emerald-100 font-bold px-6 py-3.5 rounded-2xl transition text-sm sm:text-base"
              >
                ➕ নতুন আবেদন
              </button>
            </div>
          </div>

          {/* স্ট্যান্ডার্ড A4 সাইজে ডিজাইন করা আবেদনপত্র */}
          <A4ApplicationDocument
            data={submittedData}
            photoPreview={photoPreview}
            payShotPreview={payShotPreview}
            isConfirmed={true}
            siteName={settings.SiteName}
            hotline={settings.Hotline}
          />
        </div>
      ) : isPreview ? (
        /* ======================================================== */
        /* অবস্থা ২: আবেদনপত্র চূড়ান্ত যাচাইকরণ প্রিভিউ (Preview Mode)   */
        /* ======================================================== */
        <div className="space-y-8 animate-scaleUp">
          {/* Verification Banner */}
          <div className="no-print bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-amber-500 text-gray-950 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Eye className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                আবেদনপত্র চূড়ান্তভাবে যাচাই করুন
              </h3>
              <p className="text-sm text-gray-700 max-w-xl mx-auto">
                নিচে A4 পেপারের মাপে আপনার পূরণকৃত আবেদনপত্রটি ভেসে উঠেছে। চূড়ান্ত সাবমিট করার আগে প্রতিটি তথ্য সতর্কতার সাথে মিলিয়ে নিন।
              </p>
            </div>

            {/* Prominent Red Alert Box */}
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 text-left max-w-2xl mx-auto shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-red-900 font-black text-sm sm:text-base">
                    ⚠️ বিশেষ সতর্কবার্তা (Important Notice):
                  </h4>
                  <p className="text-red-700 text-xs sm:text-sm font-bold leading-relaxed">
                    আবেদনপত্র চূড়ান্তভাবে জমা দেওয়ার পর অনলাইনে আর কোনো তথ্য সংশোধন বা পরিবর্তনের সুযোগ থাকবে না। কোনো প্রকার সংশোধনের প্রয়োজন হলে সরাসরি ফাউন্ডেশন কর্তৃপক্ষের সাথে যোগাযোগ করতে হবে।
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons in Review Mode */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleBackToEdit}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold px-6 py-3.5 rounded-2xl border-2 border-gray-400 shadow transition text-sm sm:text-base"
              >
                <Edit3 className="w-5 h-5 text-amber-600" />
                <span>✏️ কোনো ভুল থাকলে সংশোধন করুন</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>জমা প্রক্রিয়াধীন রয়েছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-amber-300" />
                    <span>সব তথ্য ঠিক আছে, চূড়ান্তভাবে জমা দিন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Standard A4 Rendered Document in Preview Mode */}
          <A4ApplicationDocument
            data={formData}
            photoPreview={photoPreview}
            payShotPreview={payShotPreview}
            isConfirmed={false}
            siteName={settings.SiteName}
            hotline={settings.Hotline}
          />

          {/* Bottom Review Action Bar */}
          <div className="no-print bg-white p-6 rounded-2xl border-2 border-amber-300 shadow-md text-center space-y-3">
            <p className="text-xs text-red-600 font-bold">
              * মনে রাখবেন: একবার সাবমিট বাটনে চাপলে আবেদনটি সরাসরি ডাটাবেজে লক হয়ে যাবে।
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={handleBackToEdit}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl transition text-sm"
              >
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>সংশোধন করতে ফর্মে ফিরুন</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black px-8 py-3 rounded-xl shadow-lg transition text-sm disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>জমা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-amber-300" />
                    <span>হ্যাঁ, চূড়ান্তভাবে জমা দিন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* অবস্থা ৩: ইন্টারেক্টিভ আবেদন ফরম (Form Input Mode)         */
        /* ======================================================== */
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white py-8 px-6 sm:px-10 text-center relative overflow-hidden">
            <div className="w-16 h-16 mx-auto mb-3 bg-amber-400/20 rounded-2xl flex items-center justify-center border border-amber-300/40">
              <FileCheck className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              বৃত্তি পরীক্ষা ২০২৬ — অনলাইন আবেদন ফরম
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl mx-auto">
              ৪র্থ থেকে ৮ম শ্রেণীর শিক্ষার্থীরা নিচের সকল তথ্য নির্ভুলভাবে পূরণ করে রেজিস্ট্রেশন সম্পন্ন করুন
            </p>
          </div>

          <form onSubmit={handleReviewForm} className="p-6 sm:p-10 space-y-8">
            {/* Auto Generated Registration Number Badge */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  স্বয়ংক্রিয় রেজিস্ট্রেশন আইডি (Auto Generated)
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-wider font-mono mt-1">
                  {regNo}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  আবেদন শুরু করার সাথে সাথেই এই ইউনিক নম্বরটি তৈরি হয়েছে।
                </p>
              </div>
              <div className="bg-white border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700">
                বৃত্তি পরীক্ষা ২০২৬
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Student Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  ১
                </div>
                <h3 className="text-lg font-bold text-gray-900">শিক্ষার্থীর ব্যক্তিগত তথ্য</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    শিক্ষার্থীর পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="যেমন: আব্দুর রহমান"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    পিতার নাম *
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    required
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder="পিতার নাম লিখুন"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    মাতার নাম *
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    required
                    value={formData.motherName}
                    onChange={handleInputChange}
                    placeholder="মাতার নাম লিখুন"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    জন্ম তারিখ *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    লিঙ্গ *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition bg-white"
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="male">ছাত্র</option>
                    <option value="female">ছাত্রী</option>
                  </select>
                </div>

                {/* Photo Upload with Live Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    শিক্ষার্থীর ছবি আপলোড *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handlePhotoUpload}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-300 rounded-xl"
                    />
                    {photoPreview && (
                      <div className="w-12 h-14 border-2 border-emerald-500 rounded-lg overflow-hidden shrink-0">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">সর্বোচ্চ ২ MB (Passport Size Image)</span>
                </div>
              </div>
            </div>

            {/* Step 2: Educational Institution */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  ২
                </div>
                <h3 className="text-lg font-bold text-gray-900">প্রাতিষ্ঠানিক তথ্য</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    শিক্ষা প্রতিষ্ঠানের নাম *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    required
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="বিদ্যালয় / মাদ্রাসার পুরো নাম"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    শ্রেণী *
                  </label>
                  <select
                    name="studentClass"
                    required
                    value={formData.studentClass}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition bg-white"
                  >
                    <option value="">শ্রেণী নির্বাচন করুন</option>
                    <option value="৪র্থ শ্রেণী">৪র্থ শ্রেণী</option>
                    <option value="৫ম শ্রেণী">৫ম শ্রেণী</option>
                    <option value="৬ষ্ঠ শ্রেণী">৬ষ্ঠ শ্রেণী</option>
                    <option value="৭ম শ্রেণী">৭ম শ্রেণী</option>
                    <option value="৮ম শ্রেণী">৮ম শ্রেণী</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    প্রতিষ্ঠানের প্রধান / প্রিন্সিপালের মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    name="principalPhone"
                    required
                    value={formData.principalPhone}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Contact & Guardian */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  ৩
                </div>
                <h3 className="text-lg font-bold text-gray-900">যোগাযোগ ও অভিভাবকের তথ্য</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    অভিভাবকের মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    required
                    value={formData.guardianPhone}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    ই-মেইল অ্যাড্রেস *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@mail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: bKash Registration Fee Payment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  ৪
                </div>
                <h3 className="text-lg font-bold text-gray-900">রেজিস্ট্রেশন ফি পরিশোধ (bKash Payment)</h3>
              </div>

              <div className="rounded-2xl overflow-hidden border-2 border-pink-500 shadow-sm">
                <div className="bg-pink-600 text-white px-5 py-3.5 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg">bKash পেমেন্ট</span>
                    <span className="bg-pink-800 text-[11px] px-2 py-0.5 rounded font-bold uppercase">Send Money</span>
                  </div>
                  <span className="text-sm font-bold bg-white text-pink-700 px-3 py-1 rounded-full">
                    ফি: {regFee} টাকা
                  </span>
                </div>

                <div className="bg-pink-50/70 p-5 space-y-4">
                  <p className="text-sm text-gray-700">
                    নিচের বিকাশ নম্বরে <strong>Send Money</strong> করে ফি পরিশোধ করুন:
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-pink-700 font-mono tracking-wider bg-white px-4 py-2 rounded-xl border border-pink-200">
                      {bkashNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bkashNumber, "bkash")}
                      className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copiedBkash ? "কপি হয়েছে ✓" : "নম্বর কপি করুন"}</span>
                    </button>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 bg-white p-3.5 rounded-xl border border-pink-100">
                    <p>১. আপনার বিকাশ অ্যাপ বা *247# ডায়াল করে উপরের নম্বরে <b>Send Money</b> করুন।</p>
                    <p>২. রেফারেন্স ঘর চাইলে সেখানে আপনার রেজিস্ট্রেশন নম্বর (<b>{regNo}</b>) লিখুন।</p>
                    <p>৩. পেমেন্ট সম্পন্ন হলে স্ক্রিনশট সংরক্ষণ করুন এবং নিচের ঘরে আপলোড করুন।</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন *
                  </label>
                  <input
                    type="tel"
                    name="senderBkash"
                    required
                    value={formData.senderBkash}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    পেমেন্টের স্ক্রিনশট আপলোড করুন *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handlePayShotUpload}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 border border-gray-300 rounded-xl"
                    />
                    {payShotPreview && (
                      <div className="w-14 h-14 border-2 border-pink-500 rounded-lg overflow-hidden shrink-0">
                        <img src={payShotPreview} alt="Screenshot" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">সর্বোচ্চ ২ MB (JPG / PNG)</span>
                </div>
              </div>
            </div>

            {/* Review Button */}
            <div className="pt-6 border-t border-gray-200 text-center space-y-2">
              <button
                type="submit"
                className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black px-10 py-4 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 text-base sm:text-lg"
              >
                <Eye className="w-5 h-5 text-amber-300" />
                <span>আবেদনপত্র চূড়ান্তভাবে যাচাই করুন</span>
                <ArrowRight className="w-5 h-5 text-amber-300" />
              </button>
              <p className="text-xs text-gray-500">
                বাটনে চাপ দিলে পুরো আবেদনপত্রটি চোখের সামনে আসবে, যাচাই করে নিশ্চিত হয়ে চূড়ান্ত জমা দিতে পারবেন।
              </p>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

// ========================================================
// নিখুঁত আন্তর্জাতিক স্ট্যান্ডার্ড A4 সাইজের আবেদনপত্র ডকুমেন্ট
// (Fixed Standard A4 Dimensions: 210mm x 297mm proportioned)
// ========================================================
interface DocumentProps {
  data: StudentApplication;
  photoPreview: string;
  payShotPreview: string;
  isConfirmed: boolean;
  siteName?: string;
  hotline?: string;
}

function A4ApplicationDocument({
  data,
  photoPreview,
  payShotPreview,
  isConfirmed,
  siteName,
  hotline,
}: DocumentProps) {
  const finalSiteName = siteName || "দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন";
  const finalHotline = hotline || "০১৯৭৯৫১৩৯৯০";

  return (
    <div
      id="a4-application-document"
      className="print-area w-full max-w-[794px] mx-auto min-h-[1080px] bg-white border-4 border-double border-emerald-950 ring-1 ring-amber-400/40 rounded-2xl p-6 sm:p-9 shadow-2xl relative flex flex-col justify-between text-gray-800 leading-snug overflow-hidden"
      style={{
        boxSizing: "border-box",
      }}
    >
      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
        <div className="text-center font-black text-emerald-950">
          <div className="text-8xl tracking-widest">SWF</div>
          <div className="text-3xl mt-2">{finalSiteName}</div>
          <div className="text-xl mt-1 tracking-wider">SCHOLARSHIP EXAM 2026</div>
        </div>
      </div>

      <div>
        {/* Top Header */}
        <div className="border-b-2 border-emerald-900 pb-3 mb-4">
          <div className="flex justify-between items-center gap-4">
            {/* Logo & Foundation Identity */}
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 bg-emerald-800 text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-md border-2 border-amber-400 shrink-0">
                SWF
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950 leading-tight">
                  {finalSiteName}
                </h2>
                <p className="text-[11px] text-gray-600 font-extrabold tracking-wider uppercase mt-0.5">
                  THE STUDENTS WELFARE FOUNDATION (GOVT. REGD.)
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  কেন্দ্রীয় কার্যালয়: আমতলী, মহাখালী, ঢাকা-১২০৬ | হেল্পলাইন: {finalHotline}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-emerald-800 text-white font-bold text-[11px] px-3 py-0.5 rounded-full mt-1.5 shadow-sm">
                  <GraduationCap className="w-3 h-3 text-amber-300" />
                  <span>
                    বৃত্তি পরীক্ষা ২০২৬ — {isConfirmed ? "আবেদনকারীর কপি (Student Application Form)" : "যাচাইকরণ প্রিভিউ কপি (Preview Copy)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo & Barcode Holder */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-24 h-28 border-2 border-emerald-800 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 shadow-sm">
                {photoPreview ? (
                  <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <span className="p-1 text-center font-bold">পাসপোর্ট ছবি</span>
                )}
              </div>
              {/* Barcode representation */}
              <div className="mt-1 text-center min-w-[120px]">
                <svg className="w-28 h-6 mx-auto" viewBox="0 0 100 24" fill="none">
                  <rect width="100" height="24" fill="white" />
                  <line x1="4" y1="2" x2="4" y2="22" stroke="#1f2937" strokeWidth="2" />
                  <line x1="8" y1="2" x2="8" y2="22" stroke="#1f2937" strokeWidth="1" />
                  <line x1="12" y1="2" x2="12" y2="22" stroke="#1f2937" strokeWidth="3" />
                  <line x1="18" y1="2" x2="18" y2="22" stroke="#1f2937" strokeWidth="1.5" />
                  <line x1="22" y1="2" x2="22" y2="22" stroke="#1f2937" strokeWidth="2" />
                  <line x1="26" y1="2" x2="26" y2="22" stroke="#1f2937" strokeWidth="3.5" />
                  <line x1="32" y1="2" x2="32" y2="22" stroke="#1f2937" strokeWidth="1" />
                  <line x1="36" y1="2" x2="36" y2="22" stroke="#1f2937" strokeWidth="2" />
                  <line x1="42" y1="2" x2="42" y2="22" stroke="#1f2937" strokeWidth="3" />
                  <line x1="48" y1="2" x2="48" y2="22" stroke="#1f2937" strokeWidth="1" />
                  <line x1="52" y1="2" x2="52" y2="22" stroke="#1f2937" strokeWidth="2.5" />
                  <line x1="58" y1="2" x2="58" y2="22" stroke="#1f2937" strokeWidth="1" />
                  <line x1="62" y1="2" x2="62" y2="22" stroke="#1f2937" strokeWidth="3" />
                  <line x1="68" y1="2" x2="68" y2="22" stroke="#1f2937" strokeWidth="1.5" />
                  <line x1="72" y1="2" x2="72" y2="22" stroke="#1f2937" strokeWidth="2" />
                  <line x1="78" y1="2" x2="78" y2="22" stroke="#1f2937" strokeWidth="3.5" />
                  <line x1="84" y1="2" x2="84" y2="22" stroke="#1f2937" strokeWidth="1" />
                  <line x1="88" y1="2" x2="88" y2="22" stroke="#1f2937" strokeWidth="2" />
                  <line x1="94" y1="2" x2="94" y2="22" stroke="#1f2937" strokeWidth="2" />
                </svg>
                <div className="text-[10px] font-mono font-bold text-gray-900 tracking-normal whitespace-nowrap block mt-0.5">
                  {data.regNo}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Meta Row */}
        <div className="grid grid-cols-3 gap-2 bg-[#f0fdf4] border border-[#86efac] rounded-xl p-3 text-xs mb-4">
          <div>
            <span className="text-[11px] text-[#166534] font-bold block mb-1">রেজিস্ট্রেশন আইডি (Registration No)</span>
            <strong className="text-base text-[#052e16] font-mono tracking-wider font-extrabold block">
              {data.regNo}
            </strong>
          </div>
          <div>
            <span className="text-[11px] text-[#166534] font-bold block mb-1">আবেদনের তারিখ ও সময়</span>
            <strong className="text-gray-900 text-xs block">{data.submissionDate || new Date().toLocaleString("bn-BD")}</strong>
          </div>
          <div>
            <span className="text-[11px] text-[#166534] font-bold block mb-1">আবেদন স্ট্যাটাস</span>
            <div
              className={`inline-block font-extrabold text-[11px] px-3 py-1 rounded-full text-white text-center shadow-sm ${
                isConfirmed ? "bg-[#d97706]" : "bg-[#d97706]"
              }`}
              style={{ lineHeight: "16px", minHeight: "22px" }}
            >
              {isConfirmed ? "⏳ পেন্ডিং (পেমেন্ট যাচাই প্রক্রিয়াধীন)" : "⏳ যাচাইকরণ প্রিভিউ (In-Review)"}
            </div>
          </div>
        </div>

        {/* Section 1: Student Personal Details */}
        <div className="space-y-2 mb-3.5">
          <h4 className="font-bold text-emerald-950 border-b border-emerald-200 pb-1 text-xs sm:text-sm flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-700" />
            <span>১. শিক্ষার্থীর ব্যক্তিগত তথ্য (Student Personal Information)</span>
          </h4>
          <div className="grid grid-cols-3 gap-y-2 gap-x-4 text-xs bg-[#f9fafb] p-3 rounded-xl border border-[#e5e7eb]">
            <div>
              <span className="text-[10px] text-gray-500 block">শিক্ষার্থীর পূর্ণ নাম</span>
              <strong className="text-gray-950 text-xs sm:text-sm">{data.name || "—"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">পিতার নাম</span>
              <strong className="text-gray-900">{data.fatherName || "—"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">মাতার নাম</span>
              <strong className="text-gray-900">{data.motherName || "—"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">জন্ম তারিখ</span>
              <strong className="text-gray-900">{data.dob || "—"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">লিঙ্গ</span>
              <strong className="text-gray-900">{data.gender === "female" ? "ছাত্রী" : "ছাত্র"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">পরীক্ষার নির্ধারিত রোল</span>
              <strong className="text-emerald-800 font-mono font-bold">{data.rollNumber || "১০৫২৪"}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Educational Institution */}
        <div className="space-y-2 mb-3.5">
          <h4 className="font-bold text-emerald-950 border-b border-emerald-200 pb-1 text-xs sm:text-sm flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-emerald-700" />
            <span>২. প্রাতিষ্ঠানিক তথ্য (Educational Institution Details)</span>
          </h4>
          <div className="grid grid-cols-3 gap-y-2 gap-x-4 text-xs bg-[#f9fafb] p-3 rounded-xl border border-[#e5e7eb]">
            <div className="col-span-2">
              <span className="text-[10px] text-gray-500 block">শিক্ষা প্রতিষ্ঠানের নাম</span>
              <strong className="text-gray-950 text-xs sm:text-sm">{data.institution || "—"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">শ্রেণী (Class)</span>
              <strong className="text-emerald-900 font-black text-xs sm:text-sm">{data.studentClass || "—"}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-gray-500 block">প্রতিষ্ঠান প্রধানের মোবাইল নম্বর</span>
              <strong className="text-gray-900 font-mono">{data.principalPhone || "—"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">পরীক্ষার কেন্দ্র</span>
              <strong className="text-emerald-900">বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা</strong>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Fee Payment */}
        <div className="space-y-2 mb-3">
          <h4 className="font-bold text-emerald-950 border-b border-emerald-200 pb-1 text-xs sm:text-sm flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
            <span>৩. যোগাযোগ ও রেজিস্ট্রেশন ফি বিবরণী (Guardian & Fee Payment)</span>
          </h4>
          <div className="grid grid-cols-3 gap-y-2 gap-x-4 text-xs bg-[#f9fafb] p-3 rounded-xl border border-[#e5e7eb]">
            <div>
              <span className="text-[10px] text-gray-500 block">অভিভাবকের মোবাইল</span>
              <strong className="text-gray-950 font-mono">{data.guardianPhone || "—"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">ই-মেইল অ্যাড্রেস</span>
              <strong className="text-gray-900">{data.email || "—"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">প্রেরক বিকাশ নম্বর</span>
              <strong className="text-pink-700 font-mono font-bold">{data.senderBkash || "—"}</strong>
            </div>
          </div>

          {/* Payment Proof Snapshot in Document */}
          {payShotPreview && (
            <div className="flex items-center gap-3 bg-[#fdf2f8] p-2.5 rounded-xl border border-[#fbcfe8] text-xs">
              <div className="w-20 h-14 border border-pink-300 rounded-lg overflow-hidden bg-white shrink-0">
                <img src={payShotPreview} alt="Payment" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-bold text-pink-900 text-xs block">✓ বিকাশ লেনদেনের স্ক্রিনশট সংযুক্ত</span>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  ফি পরিশোধের প্রমাণপত্র ড্রাইভ সার্ভারে সংরক্ষিত রয়েছে এবং যাচাই সাপেক্ষে আবেদনটি চূড়ান্ত করা হয়েছে।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Declaration Notice */}
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-2.5 text-[10px] text-gray-700 space-y-0.5 mb-2">
          <strong className="text-amber-950 block font-bold text-[11px]">ঘোষণা ও দিকনির্দেশনা:</strong>
          <p>১. আমি এই মর্মে অঙ্গীকার করছি যে, ওপরে প্রদত্ত সকল তথ্য সত্য ও নির্ভুল।</p>
          <p>২. পরীক্ষার পূর্বে এই রেজিস্ট্রেশন নম্বর ব্যবহার করে প্রবেশপত্র (Admit Card) সংগ্রহ করতে হবে।</p>
        </div>
      </div>

      {/* Footer Signatures & Official Rosette Seal */}
      <div className="pt-4 border-t-2 border-emerald-900 flex justify-between items-end text-xs text-gray-700">
        <div className="text-center">
          <div className="w-36 border-b border-gray-600 mb-1"></div>
          <span className="font-bold text-[11px] text-gray-900">অভিভাবক / শিক্ষার্থীর স্বাক্ষর</span>
          <span className="text-[9px] text-gray-500 block mt-0.5">তারিখ: {new Date().toLocaleDateString("bn-BD")}</span>
        </div>

        {/* Rosette Seal */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-double border-emerald-800 rounded-full flex flex-col items-center justify-center text-emerald-950 font-black text-center p-1 bg-[#f0fdf4] shadow-sm">
            <span className="text-[7px] uppercase tracking-widest text-emerald-800">SWF BD</span>
            <span className="text-[9px] font-black leading-tight text-emerald-950">OFFICIAL<br />SEAL</span>
            <span className="text-[7px] text-amber-700 font-bold">2026</span>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-900 mt-0.5">ফাউন্ডেশন অফিশিয়াল সিল</span>
        </div>

        <div className="text-center">
          <div className="w-36 border-b border-gray-600 mb-1"></div>
          <span className="font-bold text-[11px] text-gray-900">পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর</span>
          <span className="text-[9px] text-gray-500 block mt-0.5">দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন</span>
        </div>
      </div>
    </div>
  );
}
