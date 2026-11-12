"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Sparkles,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

function parseCustomFontSize(val?: string, type: "title" | "subtitle" = "title"): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;

  if (clean.includes("খুব বড়") || clean.includes("extra large") || clean.includes("xl")) {
    return type === "title" ? "2.75rem" : "1.25rem";
  }
  if (clean.includes("বড়") || clean.includes("large")) {
    return type === "title" ? "2.25rem" : "1.125rem";
  }
  if (clean.includes("মাঝারি") || clean.includes("medium") || clean.includes("normal")) {
    return type === "title" ? "1.875rem" : "1rem";
  }
  if (clean.includes("ছোট") || clean.includes("small")) {
    return type === "title" ? "1.5rem" : "0.875rem";
  }

  const pxMatch = clean.match(/(\d+(\.\d+)?)\s*(px|rem|em|pt|%)?/);
  if (pxMatch) {
    const num = pxMatch[1];
    const unit = pxMatch[3] || "px";
    return `${num}${unit}`;
  }
  return undefined;
}

export default function ContactSection() {
  const { settings } = useSettings();
  const contactTitle = settings.ContactTitle || "যোগাযোগের ঠিকানা ও তথ্য";
  const contactSubtitle =
    settings.ContactSubtitle ||
    "যেকোনো জিজ্ঞাসা, পরামর্শ বা বৃত্তি সংক্রান্ত তথ্যের জন্য সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন।";
  const officeAddress = settings.OfficeAddress || "আমতলী, মহাখালী, ঢাকা-১২০৬, বাংলাদেশ।";
  const helpline = settings.Hotline || "০১৯৭৯৫১৩৯৯০";
  const altPhone = settings.AlternativePhone || "";
  const email = settings.Email || "swfdhaka@gmail.com";
  const officeHours = settings.OfficeHours || "সকাল ৯:০০ টা - বিকাল ৫:০০ টা (শুক্রবার বন্ধ)";
  const contactNotice = settings.ContactNotice || "";
  const contactExtraInfo = settings.ContactExtraInfo || "";

  const titleFontSize = parseCustomFontSize(settings.ContactTitleSize, "title");
  const subtitleFontSize = parseCustomFontSize(settings.ContactSubtitleSize, "subtitle");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "আপনার বার্তা সফলভাবে পাঠানো হয়েছে!");
        setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
      } else {
        setErrorMsg(data.error || "বার্তা পাঠাতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setErrorMsg("নেটওয়ার্ক ত্রুটি! পরে পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Office Contact Info */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">আমাদের সাথে যোগাযোগ</span>
              <h2
                style={titleFontSize ? { fontSize: titleFontSize } : undefined}
                className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1 leading-tight"
              >
                {contactTitle}
              </h2>
              <p
                style={subtitleFontSize ? { fontSize: subtitleFontSize } : undefined}
                className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed"
              >
                {contactSubtitle}
              </p>
            </div>

            <div className="space-y-3.5 pt-1 text-sm text-gray-700">
              {/* Office Address */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-950 font-bold">কেন্দ্রীয় কার্যালয়:</strong>
                  <span className="text-gray-600 text-xs sm:text-sm leading-relaxed">{officeAddress}</span>
                </div>
              </div>

              {/* Helpline */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <Phone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-950 font-bold">হেল্পলাইন নম্বর:</strong>
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={`tel:${helpline.replace(/\s+/g, "")}`} className="text-emerald-700 font-semibold hover:underline">
                      {helpline}
                    </a>
                    {altPhone && (
                      <span className="text-xs text-gray-500">
                        / <a href={`tel:${altPhone.replace(/\s+/g, "")}`} className="text-emerald-700 hover:underline">{altPhone}</a>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <Mail className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-950 font-bold">ই-মেইল যোগাযোগ:</strong>
                  <a href={`mailto:${email}`} className="text-emerald-700 font-semibold hover:underline text-xs sm:text-sm">
                    {email}
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              {officeHours && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-950 font-bold">অফিস সময়সূচী:</strong>
                    <span className="text-gray-600 text-xs sm:text-sm">{officeHours}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Additional Notice / Extra Info */}
            {contactNotice && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed whitespace-pre-line">{contactNotice}</div>
              </div>
            )}
          </div>

          {/* Interactive Message Form */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                সরাসরি বার্তা পাঠান
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                ফর্মটি পূরণ করে আপনার বার্তা পাঠালে তা সরাসরি আমাদের ডাটাবেজে জমা হবে।
              </p>

              {successMsg && (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-800 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="আপনার পূর্ণ নাম *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="মোবাইল নম্বর *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-white"
                  />
                  <input
                    type="email"
                    placeholder="ইমেইল (ঐচ্ছিক)"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-white"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="বার্তার বিষয় *"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-white"
                  />
                </div>

                <div>
                  <textarea
                    rows={3}
                    required
                    placeholder="আপনার বার্তা বা প্রশ্ন লিখুন *"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl shadow transition text-xs sm:text-sm disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>বার্তা পাঠান</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Optional Extra Full-Width Information / Announcement Banner */}
        {contactExtraInfo && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-emerald-900 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>অতিরিক্ত তথ্য ও নির্দেশিকা:</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {contactExtraInfo}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
