import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: "দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন | বৃত্তি পরীক্ষা ২০২৬",
  description: "দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন কর্তৃক আয়োজিত বৃত্তি পরীক্ষা ২০২৬। অনলাইন রেজিস্ট্রেশন, এডমিট কার্ড ডাউনলোড ও ফলাফল অনুসন্ধান।",
  keywords: ["বৃত্তি পরীক্ষা ২০২৬", "স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন", "SWF", "Scholarship Bangladesh", "মেধা পরীক্ষা"],
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
