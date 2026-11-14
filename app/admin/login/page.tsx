"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.message || "ভুল ইউজারনেম অথবা পাসওয়ার্ড!");
      }
    } catch {
      setError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/20 p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg shadow-emerald-900/30 text-white mb-4">
            <ShieldCheck className="w-9 h-9 text-amber-300" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>সেন্ট্রাল অ্যাডমিন কন্ট্রোল</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            রেজাউল হাসান কয়েস লোদী
          </h1>
          <p className="text-sm text-emerald-700 font-medium mt-1">
            বৃত্তি পরীক্ষা ২০২৬-২৭ | অ্যাডমিন লগইন
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              ইউজারনেম (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ইউজারনেম লিখুন..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm text-gray-900 outline-none"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              পাসওয়ার্ড (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন..."
                className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm text-gray-900 outline-none"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition transform active:scale-[0.99] disabled:opacity-70 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-gray-100 text-center">
          <a
            href="/"
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold hover:underline transition"
          >
            ← মূল ওয়েবসাইটে ফিরে যান
          </a>
        </div>
      </div>
    </div>
  );
}
