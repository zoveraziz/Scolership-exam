"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Sparkles } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

// Bengali numeral translation
const banglaDigits: { [key: string]: string } = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

function toBanglaNumber(num: number | string): string {
  return String(num)
    .padStart(2, "0")
    .replace(/[0-9]/g, (w) => banglaDigits[w] || w);
}

// Convert Bengali month to English month index (0-11)
const banglaMonths: { [key: string]: number } = {
  জানুয়ারি: 0,
  জানুয়ারি: 0,
  ফেব্রুয়ারি: 1,
  ফেব্রুয়ারি: 1,
  মার্চ: 2,
  এপ্রিল: 3,
  মে: 4,
  জুন: 5,
  জুলাই: 6,
  আগস্ট: 7,
  সেপ্টেম্বর: 8,
  অক্টোবর: 9,
  নভেম্বর: 10,
  ডিসেম্বর: 11,
};

function parseExamTargetDate(dateStr?: string): Date {
  if (!dateStr) return new Date("2026-11-15T10:00:00+06:00");

  const englishNumerals = dateStr.replace(/[০-৯]/g, (d) => {
    const map: { [key: string]: string } = {
      "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
      "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
    };
    return map[d] || d;
  });

  // Check if Bengali month name is present
  for (const [bnMonth, monthIndex] of Object.entries(banglaMonths)) {
    if (dateStr.includes(bnMonth)) {
      const dayMatch = englishNumerals.match(/\b\d{1,2}\b/);
      const yearMatch = englishNumerals.match(/\b\d{4}\b/);
      const day = dayMatch ? parseInt(dayMatch[0], 10) : 15;
      const year = yearMatch ? parseInt(yearMatch[0], 10) : 2026;
      return new Date(year, monthIndex, day, 10, 0, 0);
    }
  }

  // Fallback ISO or standard string parse
  const parsed = new Date(englishNumerals);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date("2026-11-15T10:00:00+06:00");
}

export default function ExamCountdownTimer() {
  const { settings } = useSettings();
  const examDateDisplay = settings.ExamDate || "১৫ নভেম্বর ২০২৬";

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    const targetDate = parseExamTargetDate(examDateDisplay);

    const calculate = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [examDateDisplay]);

  return (
    <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-5 sm:p-7 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Title with live pulse */}
          <div className="text-center md:text-left space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>লাইভ কাউন্টডাউন</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-emerald-950 flex items-center justify-center md:justify-start gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>বৃত্তি পরীক্ষা শুরু হতে বাকি</span>
            </h3>
            <p className="text-xs text-gray-500 flex items-center justify-center md:justify-start gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>নির্ধারিত তারিখ: <strong className="text-emerald-800">{examDateDisplay}</strong> (সকাল ১০:০০ টা)</span>
            </p>
          </div>

          {/* Time digits showcase */}
          {timeLeft.isOver ? (
            <div className="px-6 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm text-center">
              🎉 পরীক্ষা কার্যক্রম সফলভাবে সম্পন্ন হয়েছে!
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-950 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md border-b-4 border-emerald-600">
                  {toBanglaNumber(timeLeft.days)}
                </div>
                <span className="text-[11px] font-bold text-gray-600 mt-1.5">দিন</span>
              </div>

              <span className="text-xl font-black text-emerald-800 -mt-5">:</span>

              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-950 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md border-b-4 border-emerald-600">
                  {toBanglaNumber(timeLeft.hours)}
                </div>
                <span className="text-[11px] font-bold text-gray-600 mt-1.5">ঘণ্টা</span>
              </div>

              <span className="text-xl font-black text-emerald-800 -mt-5">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-950 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md border-b-4 border-emerald-600">
                  {toBanglaNumber(timeLeft.minutes)}
                </div>
                <span className="text-[11px] font-bold text-gray-600 mt-1.5">মিনিট</span>
              </div>

              <span className="text-xl font-black text-emerald-800 -mt-5">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-amber-500 text-emerald-950 flex items-center justify-center font-black text-xl sm:text-2xl shadow-md border-b-4 border-amber-600 animate-pulse">
                  {toBanglaNumber(timeLeft.seconds)}
                </div>
                <span className="text-[11px] font-bold text-amber-800 mt-1.5">সেকেন্ড</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
