"use client";

import React, { useState } from "react";
import { Phone, MessageCircle, X, HelpCircle, Clock, ChevronUp } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();

  const hotline = settings.Hotline || "০১৯৭৯৫১৩৯৯০";
  const rawHotline = hotline.replace(/[^0-9]/g, "");
  const cleanPhone = rawHotline.startsWith("0") ? "88" + rawHotline : (rawHotline.startsWith("88") ? rawHotline : "8801979513990");

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম, ${settings.SiteName} সংক্রান্ত একটি তথ্য জানতে চাই।`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

  return (
    <div className="no-print fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Quick Support Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-200 p-5 space-y-4 animate-scaleUp text-gray-800">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">জরুরি সহায়তা কেন্দ্র</h4>
                <p className="text-[11px] text-gray-500">আমরা সহায়তার জন্য প্রস্তুত</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs sm:text-sm transition group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4 fill-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-emerald-900 font-bold">হোয়াটসঅ্যাপে চ্যাট করুন</div>
                <div className="text-[10px] text-emerald-700 font-normal">সরাসরি বার্তা পাঠান</div>
              </div>
            </a>

            {/* Direct Phone Call */}
            <a
              href={`tel:${hotline.replace(/\s+/g, "")}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-bold text-xs sm:text-sm transition group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4 fill-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-amber-950 font-bold">হেল্পলাইনে ফোন করুন</div>
                <div className="text-[11px] text-amber-800 font-mono font-bold">{hotline}</div>
              </div>
            </a>
          </div>

          {/* Office hours info */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>সময়: {settings.OfficeHours || "সকাল ৯:০০ - বিকাল ৫:০০"}</span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:-translate-y-0.5 transition duration-300 font-bold text-xs sm:text-sm group border-2 border-white"
        aria-label="Help and Support"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
        <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">হেল্পলাইন ও সহায়তা</span>
        {isOpen ? <X className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
}
