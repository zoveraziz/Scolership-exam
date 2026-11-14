import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: "রেজাউল হাসান কয়েস লোদী বৃত্তি পরীক্ষা",
  description: "রেজাউল হাসান কয়েস লোদী মেধা বৃত্তি পরীক্ষা। অনলাইন রেজিস্ট্রেশন, এডমিট কার্ড ডাউনলোড ও ফলাফল অনুসন্ধান।",
  keywords: ["বৃত্তি পরীক্ষা", "রেজাউল হাসান কয়েস লোদী বৃত্তি পরীক্ষা", "মেধা পরীক্ষা"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col antialiased selection:bg-emerald-600 selection:text-white">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
