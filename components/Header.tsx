"use client";

import React, { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { formatImageUrl } from "@/lib/imageUtils";
import {
  Menu,
  X,
  Home,
  Info,
  BookOpen,
  UserPlus,
  CreditCard,
  Award,
  MessageSquareQuote,
  PhoneCall,
  Sparkles,
  Bell,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function parseHeaderFontSize(val?: string, type: "site_name" | "tagline" = "site_name"): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;

  if (clean.includes("খুব বড়") || clean.includes("extra large") || clean.includes("xl")) {
    return type === "site_name" ? "1.875rem" : "1.125rem";
  }
  if (clean.includes("বড়") || clean.includes("large")) {
    return type === "site_name" ? "1.625rem" : "0.95rem";
  }
  if (clean.includes("মাঝারি") || clean.includes("medium") || clean.includes("normal")) {
    return type === "site_name" ? "1.375rem" : "0.825rem";
  }
  if (clean.includes("ছোট") || clean.includes("small")) {
    return type === "site_name" ? "1.125rem" : "0.7rem";
  }

  const pxMatch = clean.match(/(\d+(\.\d+)?)\s*(px|rem|em|pt|%)?/);
  if (pxMatch) {
    const num = pxMatch[1];
    const unit = pxMatch[3] || "px";
    return `${num}${unit}`;
  }
  return undefined;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSettings();

  const siteNameFontSize = parseHeaderFontSize(settings.SiteNameSize, "site_name");
  const siteTaglineFontSize = parseHeaderFontSize(settings.SiteTaglineSize, "tagline");
  const logoUrl =
    settings.SiteLogo ||
    settings.LogoUrl ||
    settings.SiteLogoUrl ||
    settings.logo_url ||
    settings["logo_url"] ||
    settings["logo _url"] ||
    settings.Logo ||
    settings["লোগো"] ||
    settings["লোগো_লিংক"] ||
    "";

  const navItems = [
    { id: "home", label: settings.MenuHome || "হোম", icon: Home },
    { id: "notice", label: settings.MenuNotice || "নোটিশ বোর্ড", icon: Bell },
    { id: "rules", label: settings.MenuRules || "নিয়মাবলী ও সিলেবাস", icon: BookOpen },
    { id: "register", label: settings.MenuRegister || "অনলাইন রেজিস্ট্রেশন", icon: UserPlus },
    { id: "admit", label: settings.MenuAdmit || "এডমিট কার্ড", icon: CreditCard },
    { id: "result", label: settings.MenuResult || "ফলাফল", icon: Award },
    { id: "about", label: settings.MenuAbout || "আমাদের সম্পর্কে", icon: Info },
    { id: "messages", label: settings.MenuMessages || "গুণীজনের বাণী", icon: MessageSquareQuote },
    { id: "contact", label: settings.MenuContact || "যোগাযোগ", icon: PhoneCall },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="bg-white">
      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {logoUrl ? (
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border-2 border-emerald-500 bg-white shrink-0">
              <img
                src={formatImageUrl(logoUrl)}
                alt={settings.SiteName || "Logo"}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform border-2 border-emerald-500 shrink-0">
              {settings.SiteShortName || "SWF"}
            </div>
          )}
          <div>
            <h1
              style={siteNameFontSize ? { fontSize: siteNameFontSize } : undefined}
              className="text-xl md:text-2xl font-bold text-emerald-900 leading-tight"
            >
              {settings.SiteName}
            </h1>
            <p
              style={siteTaglineFontSize ? { fontSize: siteTaglineFontSize } : undefined}
              className="text-xs text-emerald-700 font-medium"
            >
              {settings.SiteTagline || settings.SiteSubtitle || "শিক্ষা সেবা ও মূল্যায়ন কর্মসূচি"}
            </p>
          </div>
        </div>

        {/* Desktop Quick Apply CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNavClick("register")}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 font-bold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 text-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-950" />
            <span>আবেদন করুন</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg focus:outline-none transition"
          aria-label="মেনু খুলুন"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Horizontal Navigation Box Bar */}
      <nav className="hidden md:block border-t border-emerald-100 bg-emerald-50/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 grid grid-cols-9 gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`h-11 flex items-center justify-center gap-1 px-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-md font-bold"
                    : "bg-white text-gray-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900 hover:border-emerald-400"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive ? "text-amber-300" : "text-emerald-600"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm animate-fadeIn">
          <div className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="p-4 bg-emerald-800 text-white flex justify-between items-center shadow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm text-emerald-950 overflow-hidden bg-white border border-emerald-400 shrink-0">
                    {logoUrl ? (
                      <img
                        src={formatImageUrl(logoUrl)}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      settings.SiteShortName || "SWF"
                    )}
                  </div>
                  <span className="font-bold text-base">মেনু অপশন</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-emerald-700 rounded-full text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition text-left ${
                        isActive
                          ? "bg-emerald-700 text-white font-bold shadow"
                          : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-amber-300" : "text-emerald-600"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom CTA */}
            <div className="p-4 border-t bg-emerald-50">
              <button
                onClick={() => handleNavClick("register")}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition"
              >
                <UserPlus className="w-5 h-5 text-amber-300" />
                <span>এখনই আবেদন করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
