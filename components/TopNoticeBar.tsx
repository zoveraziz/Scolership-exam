"use client";

import React from "react";
import { Phone, Mail, Clock } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function TopNoticeBar() {
  const { settings } = useSettings();

  return (
    <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <a
            href={`tel:${settings.Hotline}`}
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>হেল্পলাইন: {settings.Hotline}</span>
          </a>
          <a
            href={`mailto:${settings.Email}`}
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>{settings.Email}</span>
          </a>
        </div>
        <div className="flex items-center gap-2 text-emerald-200">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>অফিস সময়: {settings.OfficeHours || "সকাল ৯:০০ - বিকাল ৫:০০ (শনিবার - বৃহস্পতিবার)"}</span>
        </div>
      </div>
    </div>
  );
}
