"use client";

import React, { useState, useEffect } from "react";
import { Search, Calendar, ChevronRight, Bell, Tag, FileText, X, Download, ExternalLink } from "lucide-react";
import { INITIAL_NOTICES } from "../lib/initialData";
import { NoticeItem } from "../lib/types";
import { useSettings } from "@/context/SettingsContext";

interface NoticeBoardProps {
  onViewSyllabus: () => void;
}

export default function NoticeBoard({ onViewSyllabus }: NoticeBoardProps) {
  const { settings } = useSettings();
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("সব");
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/notices?t=" + Date.now(), { cache: "no-store" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setNotices(json.data);
        }
      } catch (err) {
        console.warn("Could not fetch notices from API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const categories = ["সব", "রেজিস্ট্রেশন", "সিলেবাস", "পরীক্ষা", "সাধারণ"];

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "সব" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-1">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>অফিসিয়াল ঘোষণা ও হালনাগাদ</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-900 border-r-4 border-emerald-600 pr-3">
            সর্বশেষ নোটিশ বোর্ড
          </h3>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নোটিশ খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${
              selectedCategory === cat
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y overflow-hidden">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-50/50 transition cursor-pointer group"
              onClick={() => setSelectedNotice(notice)}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {notice.date}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-md">
                    <Tag className="w-3 h-3" />
                    {notice.category}
                  </span>
                  {notice.isImportant && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded animate-pulse">
                      জরুরি
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-800 group-hover:text-emerald-800 text-base md:text-lg transition">
                  {notice.title}
                </h4>
                <p className="text-gray-600 text-xs md:text-sm line-clamp-2">
                  {notice.content}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-emerald-700 group-hover:text-emerald-900 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 group-hover:bg-emerald-100 transition"
                >
                  <span>বিস্তারিত</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700">কোনো নোটিশ খুঁজে পাওয়া যায়নি</p>
            <p className="text-xs text-gray-500 mt-1">ভিন্ন শব্দ দিয়ে পুনরায় সার্চ করুন বা ফিল্টার পরিবর্তন করুন।</p>
          </div>
        )}
      </div>

      {/* Rules Banner Under Notices */}
      <div className="mt-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-lg font-bold text-emerald-900">
            {settings.SiteName} এর নিয়মাবলী ও শ্রেণীভিত্তিক পূর্ণাঙ্গ সিলেবাস
          </h4>
          <p className="text-xs sm:text-sm text-gray-600">
            পরীক্ষার্থীদের করণীয়, পরীক্ষা কেন্দ্রের নিয়ম ও ১০০ নম্বরের বিষয়ভিত্তিক মানবন্টন দেখুন।
          </p>
        </div>
        <button
          onClick={onViewSyllabus}
          className="shrink-0 flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow transition"
        >
          <span>সিলেবাস দেখুন</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                {selectedNotice.date}
              </span>
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full">
                {selectedNotice.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-emerald-950">
              {selectedNotice.title}
            </h3>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line border-t border-gray-100 pt-3">
              {selectedNotice.content}
            </div>

            {selectedNotice.fileUrl && (
              <div className="pt-2">
                <a
                  href={selectedNotice.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>অফিসিয়াল নোটিশ ফাইল / পিডিএফ দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setSelectedNotice(null)}
                className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
