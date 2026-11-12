"use client";

import React from "react";
import { Heart, Phone, Mail, MapPin } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { formatImageUrl } from "@/lib/imageUtils";

interface FooterProps {
  onNavClick: (tab: string) => void;
}

export default function Footer({ onNavClick }: FooterProps) {
  const { settings } = useSettings();

  const logoUrl =
    settings.SiteLogo ||
    settings.LogoUrl ||
    settings.SiteLogoUrl ||
    settings.logo_url ||
    settings["logo_url"] ||
    settings["logo _url"] ||
    settings.Logo ||
    settings["লোগো"] ||
    "";

  return (
    <footer className="no-print bg-gray-950 text-gray-300 py-12 px-4 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        {/* Brand */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              {logoUrl ? (
                <img
                  src={formatImageUrl(logoUrl)}
                  alt="Logo"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              ) : (
                <div className="w-full h-full bg-emerald-700 rounded-2xl flex items-center justify-center font-black text-2xl text-white">
                  {settings.SiteShortName || "SWF"}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-white font-black text-lg md:text-xl leading-tight">
                {settings.SiteName}
              </h4>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                {settings.SiteTagline || "শিক্ষা, সেবা ও মেধা মূল্যায়নে অগ্রগামী"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
            প্রাথমিক ও মাধ্যমিক স্তরের শিক্ষার্থীদের মেধা বিকাশ, শিক্ষা বৃত্তি এবং সমাজকল্যাণে নিবেদিত এক বিশ্বস্ত নাম। মেধার সর্বোচ্চ মূল্যায়নে আমরা অঙ্গীকারাবদ্ধ।
          </p>
        </div>

        {/* Important Links */}
        <div>
          <h4 className="text-white font-bold text-base mb-3 border-l-2 border-emerald-500 pl-2">
            গুরুত্বপূর্ণ লিংক
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li>
              <button onClick={() => onNavClick("register")} className="hover:text-emerald-400 transition">
                অনলাইন রেজিস্ট্রেশন
              </button>
            </li>
            <li>
              <button onClick={() => onNavClick("admit")} className="hover:text-emerald-400 transition">
                এডমিট কার্ড ডাউনলোড
              </button>
            </li>
            <li>
              <button onClick={() => onNavClick("result")} className="hover:text-emerald-400 transition">
                ফলাফল অনুসন্ধান
              </button>
            </li>
            <li>
              <button onClick={() => onNavClick("notice")} className="hover:text-emerald-400 transition">
                নোটিশ বোর্ড
              </button>
            </li>
            <li>
              <button onClick={() => onNavClick("rules")} className="hover:text-emerald-400 transition">
                পরীক্ষার নিয়মাবলী ও সিলেবাস
              </button>
            </li>
            <li>
              <button onClick={() => onNavClick("about")} className="hover:text-emerald-400 transition">
                আমাদের সম্পর্কে
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold text-base mb-3 border-l-2 border-emerald-500 pl-2">
            যোগাযোগ
          </h4>
          <div className="space-y-2 text-xs text-gray-400">
            <p className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{settings.OfficeAddress || "আমতলী, মহাখালী, ঢাকা-১২০৬"}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>হেল্পলাইন: {settings.Hotline}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{settings.Email}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
        <span>Copyright © 2026 {settings.SiteName}. All Rights Reserved.</span>
        <span className="flex items-center gap-1 text-gray-400">
          Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Bangladeshi Students
        </span>
      </div>
    </footer>
  );
}
