"use client";

import React, { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight, ArrowRight, X, User } from "lucide-react";
import { INITIAL_MESSAGES } from "../lib/initialData";
import { DignitaryMessage } from "../lib/types";
import { formatImageUrl } from "../lib/imageUtils";

interface MessagesSliderProps {
  onViewAll: () => void;
}

export default function MessagesSlider({ onViewAll }: MessagesSliderProps) {
  const [messages, setMessages] = useState<DignitaryMessage[]>(INITIAL_MESSAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<DignitaryMessage | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/messages?t=" + Date.now(), { cache: "no-store" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setMessages(json.data);
        }
      } catch (err) {
        console.warn("Could not fetch messages for slider:", err);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (isPaused || messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, messages.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  const currentMsg = messages[currentIndex];

  return (
    <section className="max-w-7xl mx-auto px-4 pb-14">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">অনুপ্রেরণা ও দিকনির্দেশনা</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-900 border-r-4 border-emerald-600 pr-3 mt-0.5">
            প্রতিষ্ঠান প্রধান ও গুণীজনের বাণী
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="hidden sm:flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-900 transition"
        >
          <span>সবগুলো বাণী</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div
        className="max-w-3xl mx-auto relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main Slide Card */}
        {currentMsg && (
          <div
            onClick={() => setSelectedMessage(currentMsg)}
            className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group min-h-[280px] flex flex-col justify-between"
          >
            <Quote className="w-16 h-16 text-emerald-200 absolute -top-2 -left-2 rotate-180 opacity-60 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed line-clamp-4 italic">
                "{currentMsg.text}"
              </p>
              <span className="inline-block text-xs text-emerald-700 font-semibold group-hover:underline">
                সম্পূর্ণ বাণী পড়তে ক্লিক করুন...
              </span>
            </div>

            <div className="relative z-10 flex items-center gap-4 mt-6 pt-4 border-t border-emerald-100">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white shrink-0 overflow-hidden">
                {currentMsg.photo ? (
                  <img
                    src={formatImageUrl(currentMsg.photo)}
                    alt={currentMsg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                  {currentMsg.name}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                  {currentMsg.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          aria-label="আগের বাণী"
          className="absolute top-1/2 -left-4 sm:-left-5 -translate-y-1/2 w-10 h-10 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          aria-label="পরের বাণী"
          className="absolute top-1/2 -right-4 sm:-right-5 -translate-y-1/2 w-10 h-10 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Navigation */}
        <div className="flex justify-center items-center gap-2 mt-5">
          {messages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-6 h-2.5 bg-emerald-700"
                  : "w-2.5 h-2.5 bg-emerald-200 hover:bg-emerald-400"
              }`}
              aria-label={`স্লাইড ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md border-4 border-emerald-100 overflow-hidden">
                {selectedMessage.photo ? (
                  <img
                    src={formatImageUrl(selectedMessage.photo)}
                    alt={selectedMessage.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {selectedMessage.name}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 font-semibold">
                {selectedMessage.role}
              </p>
            </div>

            <div className="border-t border-b border-gray-100 py-4 my-2 text-gray-700 text-sm sm:text-base leading-relaxed italic text-center">
              "{selectedMessage.text}"
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-6 py-2 rounded-xl transition"
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
