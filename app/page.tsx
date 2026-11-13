"use client";

import React, { useState, useEffect } from "react";
import TopNoticeBar from "@/components/TopNoticeBar";
import Header from "@/components/Header";
import MarqueeNotice from "@/components/MarqueeNotice";
import HeroBanner from "@/components/HeroBanner";
import NoticeBoard from "@/components/NoticeBoard";
import QuickActionCards from "@/components/QuickActionCards";
import MessagesSlider from "@/components/MessagesSlider";
import AdvisorsSection from "@/components/AdvisorsSection";
import RegistrationForm from "@/components/RegistrationForm";
import AdmitCardSection from "@/components/AdmitCardSection";
import ResultSection from "@/components/ResultSection";
import RulesSection from "@/components/RulesSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ExamCountdownTimer from "@/components/ExamCountdownTimer";
import HowToApplySteps from "@/components/HowToApplySteps";
import ScholarshipRewards from "@/components/ScholarshipRewards";
import FAQSection from "@/components/FAQSection";
import FloatingSupportWidget from "@/components/FloatingSupportWidget";
import { INITIAL_MESSAGES } from "@/lib/initialData";
import { DignitaryMessage } from "@/lib/types";
import { formatImageUrl } from "@/lib/imageUtils";
import { User, Quote, Search } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [admitSearchId, setAdmitSearchId] = useState<string>("");
  const [messageSearch, setMessageSearch] = useState<string>("");
  const [messagesList, setMessagesList] = useState<DignitaryMessage[]>(INITIAL_MESSAGES);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/messages?t=" + Date.now(), { cache: "no-store" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setMessagesList(json.data);
        }
      } catch (err) {
        console.warn("Could not fetch messages:", err);
      }
    };
    fetchMessages();
  }, []);

  // Handle Hash change for deep links (e.g. #register, #admit, #result, #rules, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["home", "about", "rules", "register", "admit", "result", "messages", "contact", "notice"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToAdmitWithId = (regId: string) => {
    setAdmitSearchId(regId);
    switchTab("admit");
  };

  const filteredMessages = messagesList.filter(
    (m) =>
      m.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.role.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.text.toLowerCase().includes(messageSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Combined Header: Helpline Top Bar + Main Header with Navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <TopNoticeBar />
        <Header activeTab={activeTab} setActiveTab={switchTab} />
      </div>

      {/* Animated Notice Marquee Bar */}
      <MarqueeNotice onViewRules={() => switchTab("rules")} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Tab 1: Home View */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Hero Section */}
            <HeroBanner
              onApply={() => switchTab("register")}
              onAdmit={() => switchTab("admit")}
              onResult={() => switchTab("result")}
            />

            {/* Live Exam Countdown Timer */}
            <ExamCountdownTimer />

            {/* Quick Action Navigation Cards */}
            <div className="pt-4 sm:pt-6">
              <QuickActionCards
                onRegister={() => switchTab("register")}
                onAdmit={() => switchTab("admit")}
                onResult={() => switchTab("result")}
                onRules={() => switchTab("rules")}
              />
            </div>

            {/* Step-by-Step Application Guide */}
            <HowToApplySteps onApplyClick={() => switchTab("register")} />

            {/* Scholarship Rewards & Honors Showcase */}
            <ScholarshipRewards />

            {/* Notice Board with Search & Filter */}
            <NoticeBoard onViewSyllabus={() => switchTab("rules")} />

            {/* Dignitaries' Messages Carousel */}
            <MessagesSlider onViewAll={() => switchTab("messages")} />

            {/* Advisors & Governing Council Section */}
            <AdvisorsSection />

            {/* Frequently Asked Questions (FAQ) */}
            <FAQSection />
          </div>
        )}

        {/* Tab: Notice Board Dedicated View */}
        {activeTab === "notice" && (
          <div className="max-w-5xl mx-auto py-8 px-4">
            <NoticeBoard onViewSyllabus={() => switchTab("rules")} />
          </div>
        )}

        {/* Tab 2: Registration View */}
        {activeTab === "register" && (
          <RegistrationForm onGoToAdmit={handleGoToAdmitWithId} />
        )}

        {/* Tab 3: Admit Card View */}
        {activeTab === "admit" && (
          <AdmitCardSection initialSearchId={admitSearchId} />
        )}

        {/* Tab 4: Result View */}
        {activeTab === "result" && <ResultSection />}

        {/* Tab 5: Rules & Syllabus View */}
        {activeTab === "rules" && <RulesSection />}

        {/* Tab 6: About Us View */}
        {activeTab === "about" && <AboutSection />}

        {/* Tab 7: Messages from Dignitaries Full View */}
        {activeTab === "messages" && (
          <section className="max-w-4xl mx-auto py-10 px-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
                  প্রতিষ্ঠান প্রধান ও গুণীজনের বাণী
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  শিক্ষা অনুরাগী ও বিশিষ্ট ব্যক্তিবর্গের দিকনির্দেশনা ও শুভবার্তা
                </p>
              </div>

              {/* Message Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="বাণী খুঁজুন..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="space-y-6">
              {filteredMessages.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100 space-y-4 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <Quote className="w-8 h-8 text-emerald-600 shrink-0 opacity-40 rotate-180" />
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base italic">
                      "{m.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0 overflow-hidden">
                      {m.photo ? (
                        <img src={formatImageUrl(m.photo)} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{m.name}</h4>
                      <p className="text-xs sm:text-sm text-emerald-800 font-semibold">{m.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 8: Contact View */}
        {activeTab === "contact" && <ContactSection />}
      </main>

      {/* Footer */}
      <Footer onNavClick={switchTab} />

      {/* Floating Quick Support Widget (WhatsApp & Call) */}
      <FloatingSupportWidget />
    </div>
  );
}
