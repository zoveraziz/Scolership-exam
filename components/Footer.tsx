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

  // সোশ্যাল মিডিয়া লিংক (গুগল শিটের Settings ট্যাব থেকে আসবে)
  const fbUrl = settings.FacebookUrl || settings.Facebook || "";
  const ytUrl = settings.YoutubeUrl || settings.Youtube || "";
  const waNumber = settings.WhatsappNumber || settings.WhatsApp || settings.Whatsapp || "";
  const tgUrl = settings.TelegramUrl || settings.Telegram || "";

  // হোয়াটসঅ্যাপ চ্যাট ইউআরএল তৈরি
  const waUrl = waNumber ? `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}` : "";

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

          {/* Social Media Icons */}
          <div className="pt-2 flex items-center gap-3">
            {/* Facebook */}
            <a
              href={fbUrl || "#"}
              target={fbUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              title="ফেসবুক পেজ"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                fbUrl
                  ? "bg-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:scale-110 shadow-sm"
                  : "bg-gray-800/60 text-gray-400 hover:text-blue-400 hover:bg-gray-800"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href={ytUrl || "#"}
              target={ytUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              title="ইউটিউব চ্যানেল"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                ytUrl
                  ? "bg-[#FF0000]/20 text-[#FF0000] hover:bg-[#FF0000] hover:text-white hover:scale-110 shadow-sm"
                  : "bg-gray-800/60 text-gray-400 hover:text-red-400 hover:bg-gray-800"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={waUrl || "#"}
              target={waUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              title="হোয়াটসঅ্যাপ চ্যাট"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                waUrl
                  ? "bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white hover:scale-110 shadow-sm"
                  : "bg-gray-800/60 text-gray-400 hover:text-emerald-400 hover:bg-gray-800"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.277-.101-.478-.15-.679.151-.2.301-.779.98-.954 1.18-.176.201-.351.226-.653.076-.301-.15-1.272-.469-2.424-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.135-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.151-.679-1.634-.93-2.242-.244-.593-.493-.512-.679-.521-.176-.009-.377-.01-.578-.01-.201 0-.527.075-.804.377-.276.301-1.055 1.03-1.055 2.512 0 1.482 1.08 2.913 1.231 3.114.151.201 2.126 3.246 5.15 4.553.72.311 1.282.497 1.72.637.724.23 1.383.197 1.904.12.58-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.125-.276-.201-.577-.351zM12.042 22.082h-.002a9.99 9.99 0 0 1-5.093-1.396l-.365-.217-3.784.992 1.01-3.69-.238-.379a9.998 9.998 0 1 1 8.472 4.69zM12.042 0C5.397 0 .002 5.395.002 12.04c0 2.123.554 4.195 1.607 6.02L0 24l6.109-1.602A11.987 11.987 0 0 0 12.042 24c6.643 0 12.039-5.395 12.039-12.04C24.081 5.395 18.685 0 12.042 0z" />
              </svg>
            </a>

            {/* Telegram */}
            <a
              href={tgUrl || "#"}
              target={tgUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              title="টেলিগ্রাম চ্যানেল বা গ্রুপ"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                tgUrl
                  ? "bg-[#229ED9]/20 text-[#229ED9] hover:bg-[#229ED9] hover:text-white hover:scale-110 shadow-sm"
                  : "bg-gray-800/60 text-gray-400 hover:text-cyan-400 hover:bg-gray-800"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" />
              </svg>
            </a>
          </div>
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
        <span>
          Copyright © 2026 {settings.SiteName}. All Rights Reserved. •{" "}
          <a href="/admin" className="text-gray-400 hover:text-emerald-400 transition underline underline-offset-2">
            অ্যাডমিন প্যানেল
          </a>
        </span>
        <span className="flex items-center gap-1 text-gray-400">
          Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Bangladeshi Students
        </span>
      </div>
    </footer>
  );
}
