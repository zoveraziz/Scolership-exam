"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Users,
  Award,
  FileText,
  LogOut,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  AlertCircle,
  Menu,
  X,
  CreditCard,
  Building,
  Calendar,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth & General State
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "notices" | "submissions" | "pages">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Notices State
  const [notices, setNotices] = useState<any[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", date: "", category: "সাধারণ", content: "", fileUrl: "" });
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);

  // Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [subSearch, setSubSearch] = useState("");
  const [subClassFilter, setSubClassFilter] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("");
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Pages State
  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [newPage, setNewPage] = useState({ slug: "", title: "", content: "", showInMenu: "Yes", parentMenu: "", order: "1" });
  const [showPageModal, setShowPageModal] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 1. Check Auth
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.authenticated) {
          setAdminUser(data.admin);
          setLoadingAuth(false);
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  // 2. Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Fetch Notices
  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);
      const res = await fetch("/api/admin/notices");
      const data = await res.json();
      if (data.success) {
        setNotices(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotices(false);
    }
  };

  // 4. Fetch Submissions
  const fetchSubmissions = async (page = 1) => {
    try {
      setLoadingSubmissions(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        search: subSearch,
        class: subClassFilter,
        status: subStatusFilter,
      });
      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data || []);
        setTotalSubmissions(data.total || 0);
        setSubPage(data.page || 1);
        setSubTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // 5. Fetch Pages
  const fetchPages = async () => {
    try {
      setLoadingPages(true);
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (data.success) {
        setPages(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    if (!loadingAuth && adminUser) {
      fetchSettings();
      fetchNotices();
      fetchSubmissions();
      fetchPages();
    }
  }, [loadingAuth, adminUser]);

  // Handle Logout
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast("গুগল স্প্রেডশিটে সেটিংস সফলভাবে সেভ হয়েছে!");
      } else {
        showToast(data.message || "সেভ করা যায়নি", "error");
      }
    } catch {
      showToast("সার্ভার এরর", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Save / Add Notice
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        const res = await fetch("/api/admin/notices", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingNotice),
        });
        const d = await res.json();
        if (d.success) {
          showToast("নোটিশ সফলভাবে আপডেট হয়েছে!");
          setEditingNotice(null);
          setShowNoticeModal(false);
          fetchNotices();
        }
      } else {
        const res = await fetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNotice),
        });
        const d = await res.json();
        if (d.success) {
          showToast("নতুন নোটিশ সফলভাবে প্রকাশিত হয়েছে!");
          setNewNotice({ title: "", date: "", category: "সাধারণ", content: "", fileUrl: "" });
          setShowNoticeModal(false);
          fetchNotices();
        }
      }
    } catch {
      showToast("অপারেশন ব্যর্থ হয়েছে", "error");
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (rowIndex: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই নোটিশটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/admin/notices?rowIndex=${rowIndex}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast("নোটিশ মুছে ফেলা হয়েছে!");
        fetchNotices();
      }
    } catch {
      showToast("মুছে ফেলা সম্ভব হয়নি", "error");
    }
  };

  // Update Student Status / Roll
  const handleUpdateStudent = async (student: any, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: student.rowIndex,
          status: newStatus,
          rollNumber: student.rollNumber,
          examCenter: student.examCenter,
          examDate: student.examDate,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`শিক্ষার্থীর স্ট্যাটাস '${newStatus}' করা হয়েছে!`);
        fetchSubmissions(subPage);
      }
    } catch {
      showToast("আপডেট করা যায়নি", "error");
    }
  };

  // Save New Page
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage),
      });
      const d = await res.json();
      if (d.success) {
        showToast("নতুন পেজ সফলভাবে তৈরি হয়েছে!");
        setNewPage({ slug: "", title: "", content: "", showInMenu: "Yes", parentMenu: "", order: "1" });
        setShowPageModal(false);
        fetchPages();
      }
    } catch {
      showToast("পেজ তৈরি ব্যর্থ", "error");
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">অ্যাডমিন কন্ট্রোল সেন্টার লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl border flex items-center gap-2 text-sm font-semibold transition-all ${
            toastMsg.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-emerald-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="w-9 h-9 bg-emerald-700 border border-emerald-500 rounded-lg flex items-center justify-center font-bold text-amber-300 shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">
                {settings.SiteName || "রেজাউল হাসান কয়েস লোদী বৃত্তি পরীক্ষা"}
              </h1>
              <p className="text-[11px] text-emerald-300 font-medium">
                সেন্ট্রাল অ্যাডমিন কন্ট্রোল প্যানেল
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white rounded-lg text-xs font-semibold transition border border-emerald-700"
            >
              <span>ওয়েবসাইট দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="h-6 w-px bg-emerald-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-white leading-none">{adminUser?.name}</p>
                <span className="text-[10px] text-emerald-300">সুপার অ্যাডমিন</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition shadow"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside
          className={`w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-200 p-3 h-fit shrink-0 md:sticky md:top-24 ${
            mobileMenuOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
            প্রধান মেনু
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "overview"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ওভারভিউ (Overview)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "settings"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>সাইট সেটিংস (Settings)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("submissions");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "submissions"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>আবেদনকারী ও এডমিট</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {totalSubmissions || 1000}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("notices");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "notices"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>নোটিশ বোর্ড</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold">
                {notices.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("pages");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "pages"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>পেজ ও মেনু বিল্ডার</span>
            </button>
          </nav>

          <div className="mt-6 pt-4 border-t border-gray-100 px-3">
            <div className="text-[11px] text-gray-400 font-medium">কানেক্টেড ডাটাবেজ:</div>
            <div className="text-xs font-bold text-gray-700 truncate mt-0.5" title="Google Sheets">
              Google Cloud API Live
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">স্বাগতম, {adminUser?.name || "অ্যাডমিন"}!</h2>
                  <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                    রেজাউল হাসান কয়েস লোদী বৃত্তি পরীক্ষার সকল কার্যক্রম এখান থেকেই সহজে পরিচালনা করুন।
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs rounded-xl shadow transition"
                >
                  সেটিংস পরিবর্তন করুন
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">মোট আবেদন</span>
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{totalSubmissions || 1000} জন</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>গুগল শিটে সংরক্ষিত</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">রেজিস্ট্রেশন ফি</span>
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    ৳{settings.RegistrationFee || "২০০"}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">
                    বিকাশ: {settings.bKashNumber || "০১৮২২৮৬২৯৩৯"}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">পরীক্ষার তারিখ</span>
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-lg font-black text-gray-900 truncate">
                    {settings.ExamDate || "২০ নভেম্বর ২০২৭"}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1 truncate">
                    {settings.ExamCenterDefault || "আম্বরখানা গার্লস স্কুল"}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">মোট নোটিশ</span>
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{notices.length} টি</div>
                  <div className="text-xs text-purple-600 font-semibold mt-1">
                    নোটিশ বোর্ডে লাইভ
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  দ্রুত অ্যাকশন (Quick Shortcuts)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab("submissions")}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition"
                  >
                    <Users className="w-5 h-5 text-emerald-700 mb-2" />
                    <div className="text-sm font-bold text-gray-900">শিক্ষার্থী অনুমোদন</div>
                    <div className="text-xs text-gray-600 mt-0.5">আবেদন ও রোল নম্বর যাচাই করুন</div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("notices");
                      setShowNoticeModal(true);
                    }}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition"
                  >
                    <Bell className="w-5 h-5 text-amber-700 mb-2" />
                    <div className="text-sm font-bold text-gray-900">নতুন নোটিশ প্রকাশ</div>
                    <div className="text-xs text-gray-600 mt-0.5">ওয়েবসাইটে নতুন নোটিশ দিন</div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("pages");
                      setShowPageModal(true);
                    }}
                    className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition"
                  >
                    <FileText className="w-5 h-5 text-blue-700 mb-2" />
                    <div className="text-sm font-bold text-gray-900">নতুন পেজ তৈরি</div>
                    <div className="text-xs text-gray-600 mt-0.5">ড্রপডাউন বা কাস্টম পেজ যোগ করুন</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SITE SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-gray-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">সাইট ও পরীক্ষা সেটিংস</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    এখানে কোনো তথ্য পরিবর্তন করে সেভ করলেই সরাসরি গুগল শিট ও লাইভ সাইট আপডেট হয়ে যাবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তনগুলো সেভ করুন"}</span>
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      প্রতিষ্ঠানের পুরো নাম (Site Name)
                    </label>
                    <input
                      type="text"
                      value={settings.SiteName || ""}
                      onChange={(e) => setSettings({ ...settings, SiteName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      স্লোগান / ট্যাগলাইন (Site Tagline)
                    </label>
                    <input
                      type="text"
                      value={settings.SiteTagline || ""}
                      onChange={(e) => setSettings({ ...settings, SiteTagline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      লোগো ইমেজ লিঙ্ক (Google Drive / Direct URL)
                    </label>
                    <input
                      type="text"
                      value={settings.SiteLogo || settings.LogoUrl || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, SiteLogo: e.target.value, LogoUrl: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      বিকাশ নম্বর (bKash Payment Number)
                    </label>
                    <input
                      type="text"
                      value={settings.bKashNumber || ""}
                      onChange={(e) => setSettings({ ...settings, bKashNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      রেজিস্ট্রেশন ফি (Registration Fee)
                    </label>
                    <input
                      type="text"
                      value={settings.RegistrationFee || ""}
                      onChange={(e) => setSettings({ ...settings, RegistrationFee: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      হেল্পলাইন ফোন নম্বর (Hotline Phone)
                    </label>
                    <input
                      type="text"
                      value={settings.Hotline || ""}
                      onChange={(e) => setSettings({ ...settings, Hotline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      অফিসিয়াল ইমেইল (Contact Email)
                    </label>
                    <input
                      type="text"
                      value={settings.Email || ""}
                      onChange={(e) => setSettings({ ...settings, Email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      পরীক্ষার তারিখ (Exam Date)
                    </label>
                    <input
                      type="text"
                      value={settings.ExamDate || ""}
                      onChange={(e) => setSettings({ ...settings, ExamDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      পরীক্ষা কেন্দ্র (Exam Center)
                    </label>
                    <input
                      type="text"
                      value={settings.ExamCenterDefault || ""}
                      onChange={(e) => setSettings({ ...settings, ExamCenterDefault: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      আবেদনের শেষ সময় (Deadline)
                    </label>
                    <input
                      type="text"
                      value={settings.ApplicationDeadline || ""}
                      onChange={(e) => setSettings({ ...settings, ApplicationDeadline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    চলমান নোটিশ স্ক্রলবার (Marquee Ticker Text)
                  </label>
                  <input
                    type="text"
                    value={settings.MarqueeNotice || ""}
                    onChange={(e) => setSettings({ ...settings, MarqueeNotice: e.target.value })}
                    placeholder="স্ক্রিনের উপরে যা স্ক্রল করবে (ঐচ্ছিক)..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? "সংরক্ষণ হচ্ছে..." : "সব পরিবর্তন সেভ করুন"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SUBMISSIONS & ADMIT CARDS */}
          {activeTab === "submissions" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    আবেদনকারী ও এডমিট কার্ড তালিকা ({totalSubmissions})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    শিক্ষার্থীদের আবেদন অনুমোদন, রোল নম্বর বরাদ্দ এবং এডমিট কার্ড প্রিন্ট করুন।
                  </p>
                </div>
                <button
                  onClick={() => fetchSubmissions(subPage)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? "animate-spin" : ""}`} />
                  <span>রিফ্রেশ</span>
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchSubmissions(1)}
                    placeholder="নাম, রোল, ফোন বা রেজি: নং..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={subClassFilter}
                  onChange={(e) => {
                    setSubClassFilter(e.target.value);
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">সকল শ্রেণি (All Classes)</option>
                  <option value="৪র্থ">৪র্থ শ্রেণি</option>
                  <option value="৫ম">৫ম শ্রেণি</option>
                  <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                  <option value="৭ম">৭ম শ্রেণি</option>
                  <option value="৮ম">৮ম শ্রেণি</option>
                </select>

                <button
                  onClick={() => fetchSubmissions(1)}
                  className="py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  ফিল্টার প্রয়োগ করুন
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200 text-[11px]">
                    <tr>
                      <th className="py-3 px-3">রেজি: নং</th>
                      <th className="py-3 px-3">ছবি</th>
                      <th className="py-3 px-3">শিক্ষার্থীর নাম</th>
                      <th className="py-3 px-3">শ্রেণি</th>
                      <th className="py-3 px-3">রোল নং</th>
                      <th className="py-3 px-3">অভিভাবক ফোন</th>
                      <th className="py-3 px-3">স্ট্যাটাস</th>
                      <th className="py-3 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingSubmissions ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          ডাটা লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : submissions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          কোনো আবেদনকারী পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      submissions.map((s, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">{s.regNo}</td>
                          <td className="py-2.5 px-3">
                            {s.photoUrl ? (
                              <img
                                src={s.photoUrl}
                                alt="Student"
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                                ছবি নাই
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">{s.name}</td>
                          <td className="py-2.5 px-3 font-medium">{s.studentClass}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                            {s.rollNumber || "দেওয়া হয়নি"}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{s.guardianPhone}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === "Approved" || s.status === "অনুমোদিত"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {s.status !== "Approved" && s.status !== "অনুমোদিত" ? (
                                <button
                                  onClick={() => handleUpdateStudent(s, "Approved")}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                                  title="Approve"
                                >
                                  Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStudent(s, "Pending")}
                                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-[10px] font-bold"
                                  title="Pending"
                                >
                                  Pending
                                </button>
                              )}
                              <a
                                href={`/?tab=admit&reg=${s.regNo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-bold"
                              >
                                এডমিট
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {subTotalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                  <span>
                    পৃষ্ঠা {subPage} এর {subTotalPages} (মোট {totalSubmissions} জন)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      disabled={subPage <= 1}
                      onClick={() => fetchSubmissions(subPage - 1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40"
                    >
                      পূর্ববর্তী
                    </button>
                    <button
                      disabled={subPage >= subTotalPages}
                      onClick={() => fetchSubmissions(subPage + 1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40"
                    >
                      পরবর্তী
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTICES */}
          {activeTab === "notices" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">নোটিশ বোর্ড ব্যবস্থাপনা</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ওয়েবসাইটের নোটিশ বোর্ডে নতুন নোটিশ দিন, সংশোধন বা ডিলিট করুন।
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingNotice(null);
                    setShowNoticeModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন নোটিশ প্রকাশ করুন</span>
                </button>
              </div>

              <div className="space-y-3">
                {notices.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-gray-200 rounded-xl flex items-start justify-between gap-4 hover:border-emerald-300 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          {n.category}
                        </span>
                        <span className="text-xs text-gray-400">{n.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{n.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{n.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingNotice(n);
                          setShowNoticeModal(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="এডিট করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(n.rowIndex)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAGES & MENU BUILDER */}
          {activeTab === "pages" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">পেজ ও ড্রপডাউন মেনু বিল্ডার</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ওয়েবসাইটে নতুন পেজ তৈরি করুন এবং মেনুর ভেতরে সাব-মেনু (ড্রপডাউন) কনফিগার করুন।
                  </p>
                </div>
                <button
                  onClick={() => setShowPageModal(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন পেজ যোগ করুন</span>
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200 text-[11px]">
                    <tr>
                      <th className="py-3 px-4">পেজ টাইটেল</th>
                      <th className="py-3 px-4">স্লাগ / URL</th>
                      <th className="py-3 px-4">মেনুতে দেখাবে</th>
                      <th className="py-3 px-4">প্যারেন্ট মেনু (ড্রপডাউন)</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          এখনো কোনো অতিরিক্ত পেজ তৈরি করা হয়নি।
                        </td>
                      </tr>
                    ) : (
                      pages.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-gray-900">{p.title}</td>
                          <td className="py-3 px-4 font-mono text-emerald-800">/{p.slug}</td>
                          <td className="py-3 px-4">{p.showInMenu}</td>
                          <td className="py-3 px-4 font-medium">{p.parentMenu || "মূল মেনু (Root)"}</td>
                          <td className="py-3 px-4 font-bold text-emerald-700">{p.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add/Edit Notice */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingNotice ? "নোটিশ সংশোধন করুন" : "নতুন নোটিশ প্রকাশ করুন"}
              </h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">নোটিশের শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={editingNotice ? editingNotice.title : newNotice.title}
                  onChange={(e) =>
                    editingNotice
                      ? setEditingNotice({ ...editingNotice, title: e.target.value })
                      : setNewNotice({ ...newNotice, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">প্রকাশের তারিখ</label>
                  <input
                    type="text"
                    placeholder="১৫ নভেম্বর ২০২৬"
                    value={editingNotice ? editingNotice.date : newNotice.date}
                    onChange={(e) =>
                      editingNotice
                        ? setEditingNotice({ ...editingNotice, date: e.target.value })
                        : setNewNotice({ ...newNotice, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">ক্যাটাগরি</label>
                  <select
                    value={editingNotice ? editingNotice.category : newNotice.category}
                    onChange={(e) =>
                      editingNotice
                        ? setEditingNotice({ ...editingNotice, category: e.target.value })
                        : setNewNotice({ ...newNotice, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="সাধারণ">সাধারণ</option>
                    <option value="রেজিস্ট্রেশন">রেজিস্ট্রেশন</option>
                    <option value="সিলেবাস">সিলেবাস</option>
                    <option value="পরীক্ষা">পরীক্ষা</option>
                    <option value="ফলাফল">ফলাফল</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">নোটিশের বিস্তারিত বিবরণ</label>
                <textarea
                  rows={4}
                  value={editingNotice ? editingNotice.content : newNotice.content}
                  onChange={(e) =>
                    editingNotice
                      ? setEditingNotice({ ...editingNotice, content: e.target.value })
                      : setNewNotice({ ...newNotice, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-lg shadow hover:bg-emerald-800"
                >
                  {editingNotice ? "আপডেট করুন" : "প্রকাশ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Page */}
      {showPageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">নতুন কাস্টম পেজ তৈরি করুন</h3>
              <button onClick={() => setShowPageModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">পেজের শিরোনাম (Title)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আমাদের ইতিহাস বা ফটো গ্যালারি"
                  value={newPage.title}
                  onChange={(e) =>
                    setNewPage({
                      ...newPage,
                      title: e.target.value,
                      slug: newPage.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">স্লাগ / URL পাথ</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: about-us বা history"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">প্যারেন্ট মেনু (ড্রপডাউন)</label>
                  <input
                    type="text"
                    placeholder="যেমন: আমাদের পরিচিতি"
                    value={newPage.parentMenu}
                    onChange={(e) => setNewPage({ ...newPage, parentMenu: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-400">খালি রাখলে মূল মেনুতে দেখাবে</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">মেনুতে দেখাবে?</label>
                  <select
                    value={newPage.showInMenu}
                    onChange={(e) => setNewPage({ ...newPage, showInMenu: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Yes">হ্যাঁ (Yes)</option>
                    <option value="No">না (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">পেজের কনটেন্ট / বিবরণ</label>
                <textarea
                  rows={5}
                  placeholder="পেজের বিস্তারিত লেখা এখানে লিখুন..."
                  value={newPage.content}
                  onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-lg shadow hover:bg-emerald-800"
                >
                  পেজ তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
