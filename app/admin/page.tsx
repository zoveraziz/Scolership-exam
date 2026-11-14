"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatImageUrl } from "@/lib/imageUtils";
import {
  LayoutDashboard,
  Settings,
  Bell,
  User,
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
  PenTool,
  MessageSquare,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth & General State
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "settings" | "submissions" | "controllers" | "messages" | "committee" | "notices" | "pages"
  >("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Controllers State
  const [controllers, setControllers] = useState<any[]>([]);
  const [loadingControllers, setLoadingControllers] = useState(false);
  const [showControllerModal, setShowControllerModal] = useState(false);
  const [editingController, setEditingController] = useState<any>(null);
  const [controllerForm, setControllerForm] = useState({
    name: "",
    startRoll: "",
    endRoll: "",
    signatureUrl: "",
    phone: "",
  });

  // Messages State
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [messageForm, setMessageForm] = useState({
    name: "",
    role: "",
    message: "",
    photoUrl: "",
    status: "Active",
  });

  // Committee State
  const [committeeList, setCommitteeList] = useState<any[]>([]);
  const [loadingCommittee, setLoadingCommittee] = useState(false);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<any>(null);
  const [committeeForm, setCommitteeForm] = useState({
    name: "",
    role: "",
    designation: "",
    photoUrl: "",
    order: "1",
  });

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
  const [savingStudent, setSavingStudent] = useState(false);

  // Table Scroll Sync References
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);

  // Pages State
  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [newPage, setNewPage] = useState({ slug: "", title: "", content: "", showInMenu: "Yes", parentMenu: "", order: "1" });
  const [showPageModal, setShowPageModal] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Sync horizontal scrolling between top scrollbar and table container
  const handleTopScroll = () => {
    if (topScrollRef.current && tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (topScrollRef.current && tableContainerRef.current) {
      topScrollRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
    }
  };

  const scrollTable = (offset: number) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const scrollToPosition = (position: number) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ left: position, behavior: "smooth" });
    }
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

  // 3. Fetch Controllers
  const fetchControllers = async () => {
    try {
      setLoadingControllers(true);
      const res = await fetch("/api/admin/controllers");
      const data = await res.json();
      if (data.success) {
        setControllers(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingControllers(false);
    }
  };

  // 4. Fetch Messages
  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (data.success) {
        setMessagesList(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 5. Fetch Committee
  const fetchCommittee = async () => {
    try {
      setLoadingCommittee(true);
      const res = await fetch("/api/admin/committee");
      const data = await res.json();
      if (data.success) {
        setCommitteeList(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCommittee(false);
    }
  };

  // 6. Fetch Notices
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

  // 7. Fetch Submissions
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

  // 8. Fetch Pages
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
      fetchControllers();
      fetchMessages();
      fetchCommittee();
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
        // Update localStorage cache as well
        try {
          localStorage.setItem("rhkl_site_settings", JSON.stringify(settings));
        } catch {}
      } else {
        showToast(data.message || "সেভ করা যায়নি", "error");
      }
    } catch {
      showToast("সার্ভার এরর", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Save / Add Controller
  const handleSaveController = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingController) {
        const res = await fetch("/api/admin/controllers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rowIndex: editingController.rowIndex,
            ...controllerForm,
          }),
        });
        const d = await res.json();
        if (d.success) {
          showToast("পরীক্ষা নিয়ন্ত্রক সফলভাবে আপডেট হয়েছে!");
          setEditingController(null);
          setShowControllerModal(false);
          fetchControllers();
        } else {
          showToast(d.message || "আপডেট ব্যর্থ", "error");
        }
      } else {
        const res = await fetch("/api/admin/controllers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(controllerForm),
        });
        const d = await res.json();
        if (d.success) {
          showToast("নতুন পরীক্ষা নিয়ন্ত্রক সফলভাবে যুক্ত হয়েছে!");
          setControllerForm({ name: "", startRoll: "", endRoll: "", signatureUrl: "", phone: "" });
          setShowControllerModal(false);
          fetchControllers();
        } else {
          showToast(d.message || "যোগ করা সম্ভব হয়নি", "error");
        }
      }
    } catch {
      showToast("অপারেশন ব্যর্থ হয়েছে", "error");
    }
  };

  // Delete Controller
  const handleDeleteController = async (rowIndex: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই পরীক্ষা নিয়ন্ত্রককে মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/admin/controllers?rowIndex=${rowIndex}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast("পরীক্ষা নিয়ন্ত্রক সফলভাবে মুছে ফেলা হয়েছে!");
        fetchControllers();
      } else {
        showToast(d.message || "মুছে ফেলা সম্ভব হয়নি", "error");
      }
    } catch {
      showToast("মুছে ফেলা সম্ভব হয়নি", "error");
    }
  };

  // Save / Add Message
  const handleSaveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMessage) {
        const res = await fetch("/api/admin/messages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rowIndex: editingMessage.rowIndex,
            sl: editingMessage.sl,
            ...messageForm,
          }),
        });
        const d = await res.json();
        if (d.success) {
          showToast("গুণীজনের বাণী সফলভাবে আপডেট হয়েছে!");
          setEditingMessage(null);
          setShowMessageModal(false);
          fetchMessages();
        } else {
          showToast(d.message || "আপডেট ব্যর্থ", "error");
        }
      } else {
        const res = await fetch("/api/admin/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageForm),
        });
        const d = await res.json();
        if (d.success) {
          showToast("গুণীজনের বাণী সফলভাবে যুক্ত হয়েছে!");
          setMessageForm({ name: "", role: "", message: "", photoUrl: "", status: "Active" });
          setShowMessageModal(false);
          fetchMessages();
        } else {
          showToast(d.message || "যোগ করা সম্ভব হয়নি", "error");
        }
      }
    } catch {
      showToast("অপারেশন ব্যর্থ হয়েছে", "error");
    }
  };

  // Delete Message
  const handleDeleteMessage = async (rowIndex: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই বাণীটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/admin/messages?rowIndex=${rowIndex}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast("গুণীজনের বাণী মুছে ফেলা হয়েছে!");
        fetchMessages();
      } else {
        showToast(d.message || "মুছে ফেলা সম্ভব হয়নি", "error");
      }
    } catch {
      showToast("মুছে ফেলা সম্ভব হয়নি", "error");
    }
  };

  // Save / Add Committee Member
  const handleSaveCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCommittee) {
        const res = await fetch("/api/admin/committee", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rowIndex: editingCommittee.rowIndex,
            ...committeeForm,
          }),
        });
        const d = await res.json();
        if (d.success) {
          showToast("সদস্যের তথ্য সফলভাবে আপডেট হয়েছে!");
          setEditingCommittee(null);
          setShowCommitteeModal(false);
          fetchCommittee();
        } else {
          showToast(d.message || "আপডেট ব্যর্থ", "error");
        }
      } else {
        const res = await fetch("/api/admin/committee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(committeeForm),
        });
        const d = await res.json();
        if (d.success) {
          showToast("নতুন সদস্য সফলভাবে যুক্ত হয়েছে!");
          setCommitteeForm({ name: "", role: "", designation: "", photoUrl: "", order: "1" });
          setShowCommitteeModal(false);
          fetchCommittee();
        } else {
          showToast(d.message || "যোগ করা সম্ভব হয়নি", "error");
        }
      }
    } catch {
      showToast("অপারেশন ব্যর্থ হয়েছে", "error");
    }
  };

  // Delete Committee Member
  const handleDeleteCommittee = async (rowIndex: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই সদস্যকে মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/admin/committee?rowIndex=${rowIndex}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        showToast("সদস্য মুছে ফেলা হয়েছে!");
        fetchCommittee();
      } else {
        showToast(d.message || "মুছে ফেলা সম্ভব হয়নি", "error");
      }
    } catch {
      showToast("মুছে ফেলা সম্ভব হয়নি", "error");
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

  // Save Full Student Corrections to Google Sheets
  const handleSaveStudentCorrections = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedStudent) return;
    try {
      setSavingStudent(true);
      const res = await fetch("/api/admin/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedStudent),
      });
      const d = await res.json();
      if (d.success) {
        showToast("শিক্ষার্থীর সমস্ত তথ্য গুগল স্প্রেডশিটে সফলভাবে আপডেট হয়েছে!");
        fetchSubmissions(subPage);
      } else {
        showToast(d.message || "সংরক্ষণ ব্যর্থ হয়েছে", "error");
      }
    } catch {
      showToast("সার্ভার এরর", "error");
    } finally {
      setSavingStudent(false);
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
            কন্ট্রোল মেনু
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
                setActiveTab("controllers");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "controllers"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <PenTool className="w-4 h-4" />
                <span>পরীক্ষা নিয়ন্ত্রক ও স্বাক্ষর</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {controllers.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("messages");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "messages"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>গুণীজনদের বাণী</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold">
                {messagesList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("committee");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "committee"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4" />
                <span>পরিচালনা পরিষদ ও কমিটি</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {committeeList.length}
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
              <span>পেজ ও ড্রপডাউন মেনু</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalSubmissions || 1000}</div>
                    <div className="text-xs font-medium text-gray-500">মোট আবেদনকারী</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{controllers.length} জন</div>
                    <div className="text-xs font-medium text-gray-500">পরীক্ষা নিয়ন্ত্রক</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{messagesList.length} টি</div>
                    <div className="text-xs font-medium text-gray-500">গুণীজনের বাণী</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{settings.bKashNumber || "০১৮২২৮৬২৯৩৯"}</div>
                    <div className="text-xs font-medium text-gray-500">বিকাশ পেমেন্ট নম্বর</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900">দ্রুত অ্যাকশন (Quick Actions)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition"
                  >
                    <Settings className="w-5 h-5 text-emerald-700 mb-2" />
                    <div className="text-sm font-bold text-gray-900">সাইট ও পেমেন্ট সেটিংস</div>
                    <div className="text-xs text-gray-600 mt-0.5">বিকাশ, ঠিকানা ও এডমিট কার্ড কন্ট্রোল</div>
                  </button>

                  <button
                    onClick={() => setActiveTab("controllers")}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition"
                  >
                    <PenTool className="w-5 h-5 text-amber-700 mb-2" />
                    <div className="text-sm font-bold text-gray-900">পরীক্ষা নিয়ন্ত্রক ব্যবস্থাপনা</div>
                    <div className="text-xs text-gray-600 mt-0.5">নিয়ন্ত্রক ও ডিজিটাল স্বাক্ষর পরিবর্তন</div>
                  </button>

                  <button
                    onClick={() => setActiveTab("messages")}
                    className="p-4 rounded-xl border border-pink-200 bg-pink-50/50 hover:bg-pink-50 text-left transition"
                  >
                    <MessageSquare className="w-5 h-5 text-pink-700 mb-2" />
                    <div className="text-sm font-bold text-gray-900">গুণীজনদের বাণী</div>
                    <div className="text-xs text-gray-600 mt-0.5">বাণী ও ছবি পরিবর্তন বা যোগ করুন</div>
                  </button>

                  <button
                    onClick={() => setActiveTab("submissions")}
                    className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition"
                  >
                    <Users className="w-5 h-5 text-blue-700 mb-2" />
                    <div className="text-sm font-bold text-gray-900">আবেদনকারী ও এডমিট</div>
                    <div className="text-xs text-gray-600 mt-0.5">আবেদন ও রোল নম্বর যাচাই করুন</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SITE SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">সেন্ট্রাল সাইট ও পরীক্ষা সেটিংস</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    এখানে বিকাশ নম্বর, অফিস ঠিকানা, কেন্দ্র ও এডমিট কার্ড ডাউনলোড নিয়ন্ত্রণসহ সকল তথ্য পরিবর্তন করে সেভ করলেই সরাসরি গুগল শিট ও লাইভ সাইটে আপডেট হবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? "সংরক্ষণ হচ্ছে..." : "সব পরিবর্তন সেভ করুন"}</span>
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* CARD 1: PAYMENT & BKASH */}
                <div className="bg-amber-50/40 rounded-xl p-5 border border-amber-200/80 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-amber-900 border-b border-amber-200 pb-2 text-sm">
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    <span>১. বিকাশ ও পেমেন্ট সংক্রান্ত তথ্য</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        বিকাশ পেমেন্ট নম্বর (bKash Number) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.bKashNumber || ""}
                        onChange={(e) => setSettings({ ...settings, bKashNumber: e.target.value })}
                        placeholder="যেমন: ০১৮২২৮৬২৯৩৯"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">শিক্ষার্থী রেজিস্ট্রেশন ফি দেওয়ার সময় এই নম্বরে বিকাশ করবে।</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        রেজিস্ট্রেশন ফি (Registration Fee) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.RegistrationFee || ""}
                        onChange={(e) => setSettings({ ...settings, RegistrationFee: e.target.value })}
                        placeholder="যেমন: ২০০"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">টাকার পরিমাণ (যেমন: ২০০ বা ২৫০)।</p>
                    </div>
                  </div>
                </div>

                {/* CARD 2: ADMIT CARD & EXAM DATES */}
                <div className="bg-blue-50/40 rounded-xl p-5 border border-blue-200/80 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-blue-900 border-b border-blue-200 pb-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <span>২. পরীক্ষার কেন্দ্র, সময়সূচি ও এডমিট কার্ড ডাউনলোড নিয়ন্ত্রণ</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ডিফল্ট পরীক্ষা কেন্দ্র (Default Center)
                      </label>
                      <input
                        type="text"
                        value={settings.ExamCenterDefault || ""}
                        onChange={(e) => setSettings({ ...settings, ExamCenterDefault: e.target.value })}
                        placeholder="যেমন: আম্বরখানা গার্লস স্কুল এন্ড কলেজ"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        পরীক্ষার তারিখ (Exam Date)
                      </label>
                      <input
                        type="text"
                        value={settings.ExamDate || ""}
                        onChange={(e) => setSettings({ ...settings, ExamDate: e.target.value })}
                        placeholder="যেমন: ২০ নভেম্বর ২০২৭"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        আবেদনের শেষ সময় (Deadline)
                      </label>
                      <input
                        type="text"
                        value={settings.ApplicationDeadline || ""}
                        onChange={(e) => setSettings({ ...settings, ApplicationDeadline: e.target.value })}
                        placeholder="যেমন: ৩১ আগস্ট ২০২৬"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>এডমিট কার্ড ডাউনলোড অবস্থা (Download Status) *</span>
                      </label>
                      <select
                        value={settings.AdmitCardStatus || "স্বয়ংক্রিয়"}
                        onChange={(e) => setSettings({ ...settings, AdmitCardStatus: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-emerald-400 rounded-xl text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                      >
                        <option value="চালু">✅ চালু (সবার জন্য ডাউনলোড উন্মুক্ত)</option>
                        <option value="বন্ধ">⛔ বন্ধ (সাময়িকভাবে ডাউনলোড স্থগিত)</option>
                        <option value="স্বয়ংক্রিয়">⏳ স্বয়ংক্রিয় (আবেদনের শেষ তারিখের পর চালু হবে)</option>
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1">
                        আপনি যখন ইচ্ছা 'বন্ধ' বা 'চালু' করে ডাউনলোড নিয়ন্ত্রণ করতে পারবেন।
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        এডমিট কার্ড সংক্রান্ত নোটিশ বা ডাউনলোড বন্ধ থাকার বার্তা
                      </label>
                      <input
                        type="text"
                        value={settings.AdmitCardNotice || ""}
                        onChange={(e) => setSettings({ ...settings, AdmitCardNotice: e.target.value })}
                        placeholder="যেমন: আগামী ১৫ নভেম্বর থেকে এডমিট কার্ড ডাউনলোড শুরু হবে।"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        ডাউনলোড বন্ধ থাকলে আবেদনকারীকে এই নোটিশটি দেখানো হবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* CARD 3: CONTACT & OFFICE ADDRESS */}
                <div className="bg-emerald-50/40 rounded-xl p-5 border border-emerald-200/80 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 border-b border-emerald-200 pb-2 text-sm">
                    <Building className="w-4 h-4 text-emerald-700" />
                    <span>৩. অফিস ও যোগাযোগের পূর্ণ তথ্য</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        কেন্দ্রীয় কার্যালয়ের পূর্ণ ঠিকানা (Office Address) *
                      </label>
                      <input
                        type="text"
                        value={settings.OfficeAddress || ""}
                        onChange={(e) => setSettings({ ...settings, OfficeAddress: e.target.value })}
                        placeholder="যেমন: হাউসিং এস্টেট, আম্বরখানা, সিলেট।"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        অফিসের কাজের সময়সূচী (Office Hours)
                      </label>
                      <input
                        type="text"
                        value={settings.OfficeHours || ""}
                        onChange={(e) => setSettings({ ...settings, OfficeHours: e.target.value })}
                        placeholder="যেমন: সকাল ৯:০০ টা - বিকাল ৫:০০ টা (শুক্রবার বন্ধ)"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        প্রধান হেল্পলাইন নম্বর (Hotline Phone) *
                      </label>
                      <input
                        type="text"
                        value={settings.Hotline || ""}
                        onChange={(e) => setSettings({ ...settings, Hotline: e.target.value })}
                        placeholder="যেমন: ০১৮২২৮৬২৯৩৯"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        বিকল্প মোবাইল / জরুরি নম্বর (Alternative Phone)
                      </label>
                      <input
                        type="text"
                        value={settings.AlternativePhone || ""}
                        onChange={(e) => setSettings({ ...settings, AlternativePhone: e.target.value })}
                        placeholder="যেমন: ০১৭২১৮৩৮৯৯০"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        অফিসিয়াল ইমেইল (Official Email)
                      </label>
                      <input
                        type="email"
                        value={settings.Email || ""}
                        onChange={(e) => setSettings({ ...settings, Email: e.target.value })}
                        placeholder="যেমন: info@example.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        জরুরি সহায়তা ও যোগাযোগ নোটিশ (Contact Notice)
                      </label>
                      <input
                        type="text"
                        value={settings.ContactNotice || ""}
                        onChange={(e) => setSettings({ ...settings, ContactNotice: e.target.value })}
                        placeholder="যেমন: বিশেষ ঘোষণা: সরকারি ছুটির দিনে অফিস বন্ধ থাকে।"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 4: BRANDING & HEADERS */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-gray-900 border-b border-gray-200 pb-2 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>৪. ব্র্যান্ডিং, নাম ও লোগো সেটিংস</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        প্রতিষ্ঠানের পুরো নাম (Site Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.SiteName || ""}
                        onChange={(e) => setSettings({ ...settings, SiteName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        স্লোগান / ট্যাগলাইন (Site Tagline)
                      </label>
                      <input
                        type="text"
                        value={settings.SiteTagline || ""}
                        onChange={(e) => setSettings({ ...settings, SiteTagline: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        লোগো ইমেজ লিঙ্ক (Google Drive / Direct URL)
                      </label>
                      <input
                        type="text"
                        value={settings.SiteLogo || settings.LogoUrl || settings.logo_url || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            SiteLogo: e.target.value,
                            LogoUrl: e.target.value,
                            logo_url: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        চলমান নোটিশ স্ক্রলবার (Marquee Ticker Text)
                      </label>
                      <input
                        type="text"
                        value={settings.MarqueeNotice || ""}
                        onChange={(e) => setSettings({ ...settings, MarqueeNotice: e.target.value })}
                        placeholder="স্ক্রিনের ওপরে চলমান হলুদ নোটিশ টেক্সট..."
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 5: HERO BANNER */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-gray-900 border-b border-gray-200 pb-2 text-sm">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>৫. হোমপেইজ ব্যানার ও বিবরণ (Hero Section)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ব্যানারের ছোট ব্যাজ (Hero Badge)
                      </label>
                      <input
                        type="text"
                        value={settings.HeroBadge || ""}
                        onChange={(e) => setSettings({ ...settings, HeroBadge: e.target.value })}
                        placeholder="যেমন: মেধা মূল্যায়ন ও বৃত্তি পরীক্ষা ২০২৬"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ব্যানারের মূল বড় শিরোনাম (Hero Title)
                      </label>
                      <input
                        type="text"
                        value={settings.HeroTitle || ""}
                        onChange={(e) => setSettings({ ...settings, HeroTitle: e.target.value })}
                        placeholder="যেমন: বৃত্তি পরীক্ষা ২০২৭ এর অনলাইন রেজিস্ট্রেশন চলছে"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        বিস্তারিত বর্ণনা (Hero Subtitle)
                      </label>
                      <textarea
                        rows={3}
                        value={settings.HeroSubtitle || ""}
                        onChange={(e) => setSettings({ ...settings, HeroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{savingSettings ? "গুগল শিটে সেভ হচ্ছে..." : "💾 সমস্ত সেটিংস গুগল শিটে সেভ করুন"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CONTROLLERS MANAGEMENT */}
          {activeTab === "controllers" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">পরীক্ষা নিয়ন্ত্রক ও ডিজিটাল স্বাক্ষর ব্যবস্থাপনা</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    রোল রেঞ্জ অনুযায়ী পরীক্ষা নিয়ন্ত্রকদের নাম, পদবী, ফোন নম্বর ও এডমিট কার্ডের ডিজিটাল স্বাক্ষর যোগ বা পরিবর্তন করুন।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchControllers}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingControllers ? "animate-spin" : ""}`} />
                    <span>রিফ্রেশ</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingController(null);
                      setControllerForm({ name: "", startRoll: "", endRoll: "", signatureUrl: "", phone: "" });
                      setShowControllerModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন নিয়ন্ত্রক যোগ করুন</span>
                  </button>
                </div>
              </div>

              {loadingControllers ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>নিয়ন্ত্রকদের তথ্য লোড হচ্ছে...</span>
                </div>
              ) : controllers.length === 0 ? (
                <div className="py-12 text-center text-gray-400 border border-dashed rounded-xl">
                  কোনো পরীক্ষা নিয়ন্ত্রকের তথ্য পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {controllers.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 hover:border-emerald-300 rounded-xl bg-gray-50/50 flex flex-col justify-between gap-3 transition shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {c.signatureUrl && c.signatureUrl.startsWith("http") ? (
                              <img
                                src={formatImageUrl(c.signatureUrl)}
                                alt="Signature"
                                className="w-full h-full object-contain p-1"
                                onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                              />
                            ) : (
                              <PenTool className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 leading-snug">{c.name}</h4>
                            <div className="text-xs text-emerald-800 font-semibold font-mono mt-0.5">
                              রোল রেঞ্জ: {c.startRoll} - {c.endRoll}
                            </div>
                            {c.phone && (
                              <div className="text-[11px] text-gray-500 font-mono mt-0.5">ফোন: {c.phone}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingController(c);
                              setControllerForm({
                                name: c.name,
                                startRoll: c.startRoll,
                                endRoll: c.endRoll,
                                signatureUrl: c.signatureUrl,
                                phone: c.phone,
                              });
                              setShowControllerModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="এডিট করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteController(c.rowIndex)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {c.signatureUrl && c.signatureUrl.startsWith("http") && (
                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">ডিজিটাল স্বাক্ষর সংরক্ষিত</span>
                          <a
                            href={c.signatureUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>মূল স্বাক্ষর দেখুন</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DIGNITARY MESSAGES */}
          {activeTab === "messages" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">গুণীজন ও প্রতিষ্ঠান প্রধানদের বাণী ব্যবস্থাপনা</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ওয়েবসাইটে প্রদর্শিত অনুপ্রেরণামূলক বাণী, বাণী প্রদানকারীর নাম, পদবী ও ছবি যোগ বা পরিবর্তন করুন।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchMessages}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? "animate-spin" : ""}`} />
                    <span>রিফ্রেশ</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setMessageForm({ name: "", role: "", message: "", photoUrl: "", status: "Active" });
                      setShowMessageModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন বাণী যোগ করুন</span>
                  </button>
                </div>
              </div>

              {loadingMessages ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>বাণীসমূহ লোড হচ্ছে...</span>
                </div>
              ) : messagesList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 border border-dashed rounded-xl">
                  কোনো বাণী পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {messagesList.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 hover:border-pink-300 rounded-xl bg-gray-50/40 flex flex-col sm:flex-row items-start justify-between gap-4 transition shadow-sm"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 h-14 bg-white rounded-xl border border-pink-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {m.photoUrl && m.photoUrl.startsWith("http") ? (
                            <img
                              src={formatImageUrl(m.photoUrl)}
                              alt={m.name}
                              className="w-full h-full object-cover"
                              onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                            />
                          ) : (
                            <User className="w-7 h-7 text-pink-400" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">{m.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                              {m.status || "Active"}
                            </span>
                          </div>
                          <div className="text-xs text-pink-700 font-medium">{m.role}</div>
                          <p className="text-xs text-gray-600 leading-relaxed italic line-clamp-3">
                            "{m.message}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                        <button
                          onClick={() => {
                            setEditingMessage(m);
                            setMessageForm({
                              name: m.name,
                              role: m.role,
                              message: m.message,
                              photoUrl: m.photoUrl,
                              status: m.status || "Active",
                            });
                            setShowMessageModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="এডিট করুন"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(m.rowIndex)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COMMITTEE */}
          {activeTab === "committee" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">পরিচালনা পরিষদ ও উপদেষ্টা কমিটি</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ফাউন্ডেশনের উপদেষ্টা ও পরিচালনা পরিষদের সদস্যদের নাম, পদবি ও ছবি পরিবর্তন করুন।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchCommittee}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCommittee ? "animate-spin" : ""}`} />
                    <span>রিফ্রেশ</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommittee(null);
                      setCommitteeForm({ name: "", role: "", designation: "", photoUrl: "", order: "1" });
                      setShowCommitteeModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন সদস্য যোগ করুন</span>
                  </button>
                </div>
              </div>

              {loadingCommittee ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>সদস্য তালিকা লোড হচ্ছে...</span>
                </div>
              ) : committeeList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 border border-dashed rounded-xl">
                  কোনো সদস্যের তথ্য পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {committeeList.map((mem, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 hover:border-emerald-300 rounded-xl bg-gray-50/50 flex flex-col justify-between gap-3 transition shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 bg-white rounded-full border-2 border-emerald-400 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {mem.photoUrl && mem.photoUrl.startsWith("http") ? (
                            <img
                              src={formatImageUrl(mem.photoUrl)}
                              alt={mem.name}
                              className="w-full h-full object-cover"
                              onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                            />
                          ) : (
                            <User className="w-7 h-7 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{mem.name}</h4>
                          <div className="text-xs text-emerald-800 font-semibold">{mem.role}</div>
                          <p className="text-[11px] text-gray-500 truncate">{mem.designation}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-mono">ক্রম: #{mem.order || idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingCommittee(mem);
                              setCommitteeForm({
                                name: mem.name,
                                role: mem.role,
                                designation: mem.designation || "",
                                photoUrl: mem.photoUrl || "",
                                order: String(mem.order || idx + 1),
                              });
                              setShowCommitteeModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="এডিট করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCommittee(mem.rowIndex)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SUBMISSIONS & ADMIT CARDS */}
          {activeTab === "submissions" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    আবেদনকারী ও এডমিট কার্ড তালিকা ({totalSubmissions})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    শিক্ষার্থীদের আবেদন অনুমোদন, রোল নম্বর বরাদ্দ, যেকোনো তথ্য সংশোধন এবং এডমিট কার্ড প্রিন্ট করুন।
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

              {/* TOP HORIZONTAL NAVIGATION & SCROLL CONTROLS */}
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700 flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                    <span>টেবিল স্ক্রল:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollTable(-250)}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 font-semibold shadow-sm flex items-center gap-1 transition"
                    title="বামে স্ক্রল করুন"
                  >
                    <ChevronLeft className="w-4 h-4 text-emerald-700" />
                    <span>বামে</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTable(250)}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 font-semibold shadow-sm flex items-center gap-1 transition"
                    title="ডানে স্ক্রল করুন"
                  >
                    <span>ডানে</span>
                    <ChevronRight className="w-4 h-4 text-emerald-700" />
                  </button>
                </div>

                {/* Quick Column Jump Pills */}
                <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
                  <span className="text-gray-400">কুইক জাম্প:</span>
                  <button
                    type="button"
                    onClick={() => scrollToPosition(0)}
                    className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold hover:bg-emerald-200"
                  >
                    রেজি ও রোল
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToPosition(180)}
                    className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300"
                  >
                    ছবি ও রসিদ
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToPosition(450)}
                    className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300"
                  >
                    নাম ও শ্রেণি
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToPosition(700)}
                    className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300"
                  >
                    অ্যাকশন ও এডমিট
                  </button>
                </div>
              </div>

              {/* Synchronized Top Scrollbar */}
              <div
                ref={topScrollRef}
                onScroll={handleTopScroll}
                className="overflow-x-auto overflow-y-hidden h-3 bg-gray-100 rounded-full border border-gray-200"
                style={{ scrollbarWidth: "thin" }}
              >
                <div style={{ width: "1150px", height: "1px" }} />
              </div>

              {/* Table Container with Sticky Header & Right Vertical Scroll */}
              <div
                ref={tableContainerRef}
                onScroll={handleTableScroll}
                className="max-h-[68vh] overflow-y-auto overflow-x-auto relative rounded-xl border border-gray-200 shadow-sm"
              >
                <table className="w-full text-left text-xs text-gray-700 min-w-[1000px] border-collapse">
                  {/* Sticky Frozen Header */}
                  <thead className="sticky top-0 z-20 bg-emerald-950 text-white font-bold uppercase text-[11px] shadow-sm">
                    <tr>
                      <th className="py-3 px-3 bg-emerald-950">রেজি: ও রোল</th>
                      <th className="py-3 px-3 text-center bg-emerald-950">শিক্ষার্থীর ছবি</th>
                      <th className="py-3 px-3 text-center bg-emerald-950">পেমেন্ট রসিদ</th>
                      <th className="py-3 px-3 bg-emerald-950">শিক্ষার্থীর নাম</th>
                      <th className="py-3 px-3 bg-emerald-950">শ্রেণি</th>
                      <th className="py-3 px-3 bg-emerald-950">অভিভাবক ফোন</th>
                      <th className="py-3 px-3 bg-emerald-950">স্ট্যাটাস</th>
                      <th className="py-3 px-3 text-right bg-emerald-950">যাচাই ও অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loadingSubmissions ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            <span>ডাটা লোড হচ্ছে...</span>
                          </div>
                        </td>
                      </tr>
                    ) : submissions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          কোনো আবেদনকারী পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      submissions.map((s, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/40 transition">
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-emerald-900">{s.regNo}</div>
                            <div className="font-mono text-[11px] font-semibold text-amber-700">
                              {s.rollNumber ? `রোল: ${s.rollNumber}` : "রোল নাই"}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {s.photoUrl && s.photoUrl !== "ছবি সংরক্ষিত" ? (
                              <button
                                onClick={() => setSelectedStudent(s)}
                                className="group relative inline-block focus:outline-none"
                                title="ছবি বড় করে দেখুন"
                              >
                                <img
                                  src={formatImageUrl(s.photoUrl)}
                                  alt="Student"
                                  className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shadow-sm group-hover:scale-110 group-hover:border-emerald-600 transition"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            ) : (
                              <div className="w-10 h-10 mx-auto rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-[9px]">
                                ছবি নাই
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {s.payShotUrl && s.payShotUrl !== "পেমেন্ট প্রমাণপত্র সংরক্ষিত" ? (
                              <button
                                onClick={() => setSelectedStudent(s)}
                                className="group relative inline-block focus:outline-none"
                                title="পেমেন্ট স্ক্রিনশট বড় করে দেখুন"
                              >
                                <img
                                  src={formatImageUrl(s.payShotUrl)}
                                  alt="Payment"
                                  className="w-10 h-10 rounded-lg object-cover border border-amber-300 shadow-sm group-hover:scale-110 group-hover:border-amber-600 transition"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            ) : (
                              <div className="text-[10px] text-gray-400">
                                {s.senderBkash ? (
                                  <span className="font-mono text-emerald-800 font-semibold">{s.senderBkash}</span>
                                ) : (
                                  "সংরক্ষিত"
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-gray-900">{s.name}</div>
                            <div className="text-[11px] text-gray-500 truncate max-w-[150px]">{s.institution}</div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-emerald-800">{s.studentClass}</td>
                          <td className="py-2.5 px-3 font-mono">{s.guardianPhone}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                s.status === "Approved" || s.status === "অনুমোদিত"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedStudent(s)}
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[11px] font-bold border border-teal-200 transition"
                                title="সম্পূর্ণ তথ্য দেখুন ও সংশোধন করুন"
                              >
                                এডিট
                              </button>
                              {s.status !== "Approved" && s.status !== "অনুমোদিত" ? (
                                <button
                                  onClick={() => handleUpdateStudent(s, "অনুমোদিত")}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                                >
                                  অনুমোদন
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStudent(s, "পেন্ডিং")}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-semibold"
                                >
                                  পেন্ডিং
                                </button>
                              )}
                              <a
                                href={`/?tab=admit&reg=${s.regNo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
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

          {/* TAB 7: NOTICES */}
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

          {/* TAB 8: PAGES & MENU BUILDER */}
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

      {/* Modal: Add/Edit Controller */}
      {showControllerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingController ? "পরীক্ষা নিয়ন্ত্রকের তথ্য সংশোধন" : "নতুন পরীক্ষা নিয়ন্ত্রক যোগ করুন"}
              </h3>
              <button onClick={() => setShowControllerModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveController} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  নিয়ন্ত্রকের নাম ও পদবী *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আব্দুল্লাহ আল মায়াজ, পরীক্ষা নিয়ন্ত্রক"
                  value={controllerForm.name}
                  onChange={(e) => setControllerForm({ ...controllerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">শুরু রোল (Start Roll) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 10001"
                    value={controllerForm.startRoll}
                    onChange={(e) => setControllerForm({ ...controllerForm, startRoll: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">শেষ রোল (End Roll) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 10500"
                    value={controllerForm.endRoll}
                    onChange={(e) => setControllerForm({ ...controllerForm, endRoll: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ০১৭২১৮৩৮৯৯০"
                  value={controllerForm.phone}
                  onChange={(e) => setControllerForm({ ...controllerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  স্বাক্ষরের ড্রাইভ লিংক বা ছবির URL
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={controllerForm.signatureUrl}
                  onChange={(e) => setControllerForm({ ...controllerForm, signatureUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">গুগল ড্রাইভ লিংক দিলে তা স্বয়ংক্রিয়ভাবে এডমিট কার্ডে বসবে।</p>
              </div>

              {controllerForm.signatureUrl && controllerForm.signatureUrl.startsWith("http") && (
                <div className="p-3 bg-gray-50 border rounded-lg flex items-center gap-3">
                  <div className="w-16 h-12 bg-white border rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={formatImageUrl(controllerForm.signatureUrl)}
                      alt="Signature Preview"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <span className="text-[11px] text-emerald-800 font-semibold">স্বাক্ষর প্রিভিউ প্রদর্শিত হচ্ছে</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowControllerModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-lg shadow hover:bg-emerald-800"
                >
                  {editingController ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Dignitary Message */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingMessage ? "গুণীজনের বাণী সংশোধন" : "নতুন গুণীজনের বাণী যোগ করুন"}
              </h3>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMessage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">গুণীজনের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ড. চৌধুরী মাহমুদ হাসান"
                  value={messageForm.name}
                  onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">পদবি ও প্রতিষ্ঠান *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অধ্যক্ষ, বি.এ.এফ শাহীন কলেজ"
                  value={messageForm.role}
                  onChange={(e) => setMessageForm({ ...messageForm, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">বাণী ও শুভেচ্ছা বার্তা *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="বাণীর বিস্তারিত লেখা লিখুন..."
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">ছবির লিংক বা ড্রাইভ লিংক</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/file/d/..."
                    value={messageForm.photoUrl}
                    onChange={(e) => setMessageForm({ ...messageForm, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">অবস্থা (Status)</label>
                  <select
                    value={messageForm.status}
                    onChange={(e) => setMessageForm({ ...messageForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  >
                    <option value="Active">সক্রিয় (Active)</option>
                    <option value="Inactive">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              </div>

              {messageForm.photoUrl && messageForm.photoUrl.startsWith("http") && (
                <div className="p-3 bg-gray-50 border rounded-lg flex items-center gap-3">
                  <div className="w-12 h-12 bg-white border rounded-full overflow-hidden shrink-0">
                    <img
                      src={formatImageUrl(messageForm.photoUrl)}
                      alt="Photo Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-pink-800 font-semibold">ছবির প্রিভিউ লোড হয়েছে</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-lg shadow hover:bg-emerald-800"
                >
                  {editingMessage ? "আপডেট করুন" : "বাণী প্রকাশ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Committee Member */}
      {showCommitteeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingCommittee ? "সদস্যের তথ্য সংশোধন" : "নতুন পরিচালনা পরিষদ সদস্য যোগ করুন"}
              </h3>
              <button onClick={() => setShowCommitteeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCommittee} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">সদস্যের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: রেজাউল হাসান কয়েস লোদী"
                  value={committeeForm.name}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">পদবি (Role) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: চেয়ারম্যান / প্রধান উপদেষ্টা"
                    value={committeeForm.role}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">ক্রম / অর্ডার (Order)</label>
                  <input
                    type="number"
                    value={committeeForm.order}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, order: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">ভূমিকা ও সংক্ষিপ্ত পরিচিতি</label>
                <input
                  type="text"
                  placeholder="যেমন: প্রখ্যাত শিক্ষাবিদ ও সমাজসেবক"
                  value={committeeForm.designation}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">ছবির ড্রাইভ লিংক বা ইমেজ URL</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/..."
                  value={committeeForm.photoUrl}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCommitteeModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-lg shadow hover:bg-emerald-800"
                >
                  {editingCommittee ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Modal: Full Student & Payment Verification & EDIT Suite */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    শিক্ষার্থী তথ্য ও সংশোধন ফরম (Full Details & Edit)
                  </h3>
                </div>
                <p className="text-xs text-emerald-700 font-mono mt-0.5">
                  রেজি: <span className="font-bold">{selectedStudent.regNo}</span> • বর্তমান রোল:{" "}
                  <span className="font-bold text-amber-700">{selectedStudent.rollNumber || "নাই"}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveStudentCorrections} className="space-y-6 overflow-y-auto pr-1 flex-1 text-xs">
              {/* Images Preview Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {/* Student Photo */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-gray-700 mb-2">শিক্ষার্থীর ছবি</span>
                  <div className="w-36 h-44 bg-white rounded-xl border-2 border-emerald-400 shadow overflow-hidden flex items-center justify-center relative">
                    {selectedStudent.photoUrl && selectedStudent.photoUrl !== "ছবি সংরক্ষিত" ? (
                      <img
                        src={formatImageUrl(selectedStudent.photoUrl)}
                        alt="Student"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-xs text-gray-400 p-2">ছবি পাওয়া যায়নি</div>
                    )}
                  </div>
                  {selectedStudent.photoUrl && selectedStudent.photoUrl.startsWith("http") && (
                    <a
                      href={selectedStudent.photoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 hover:underline mt-1.5 flex items-center gap-1 font-semibold"
                    >
                      <span>গুগল ড্রাইভ মূল ছবি খুলুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Payment Screenshot */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-gray-700 mb-2">বিকাশ পেমেন্ট রসিদ / স্ক্রিনশট</span>
                  <div className="w-36 h-44 bg-white rounded-xl border-2 border-amber-400 shadow overflow-hidden flex items-center justify-center relative">
                    {selectedStudent.payShotUrl && selectedStudent.payShotUrl !== "পেমেন্ট প্রমাণপত্র সংরক্ষিত" ? (
                      <img
                        src={formatImageUrl(selectedStudent.payShotUrl)}
                        alt="Payment Screenshot"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-xs text-gray-400 p-2">স্ক্রিনশট পাওয়া যায়নি</div>
                    )}
                  </div>
                  {selectedStudent.payShotUrl && selectedStudent.payShotUrl.startsWith("http") && (
                    <a
                      href={selectedStudent.payShotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-700 hover:underline mt-1.5 flex items-center gap-1 font-semibold"
                    >
                      <span>গুগল ড্রাইভ মূল রসিদ খুলুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Editable Fields: Section 1 - Personal & Exam Details */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="font-bold text-emerald-900 border-b pb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>১. শিক্ষার্থীর ব্যক্তিগত ও পরীক্ষার তথ্য</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">শিক্ষার্থীর পুরো নাম *</label>
                    <input
                      type="text"
                      required
                      value={selectedStudent.name || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">শ্রেণি (Class) *</label>
                    <select
                      value={selectedStudent.studentClass || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, studentClass: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    >
                      <option value="৪র্থ">৪র্থ শ্রেণি</option>
                      <option value="৫ম">৫ম শ্রেণি</option>
                      <option value="৬ষ্ঠ">৬ষ্ঠ শ্রেণি</option>
                      <option value="৭ম">৭ম শ্রেণি</option>
                      <option value="৮ম">৮ম শ্রেণি</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">রোল নম্বর (Roll No)</label>
                    <input
                      type="text"
                      value={selectedStudent.rollNumber || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, rollNumber: e.target.value })}
                      placeholder="যেমন: ১০৫০১"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold text-amber-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">লিঙ্গ (Gender)</label>
                    <select
                      value={selectedStudent.gender || "ছাত্র"}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    >
                      <option value="ছাত্র">ছাত্র</option>
                      <option value="ছাত্রী">ছাত্রী</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">জন্ম তারিখ (DOB)</label>
                    <input
                      type="text"
                      value={selectedStudent.dob || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, dob: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">অনুমোদন অবস্থা (Status)</label>
                    <select
                      value={selectedStudent.status || "পেন্ডিং"}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, status: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    >
                      <option value="অনুমোদিত">অনুমোদিত (Approved)</option>
                      <option value="পেন্ডিং">পেন্ডিং (Pending)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Editable Fields: Section 2 - Family & School */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="font-bold text-emerald-900 border-b pb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>২. পারিবারিক ও শিক্ষা প্রতিষ্ঠানের তথ্য</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">পিতার নাম</label>
                    <input
                      type="text"
                      value={selectedStudent.fatherName || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, fatherName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">মাতার নাম</label>
                    <input
                      type="text"
                      value={selectedStudent.motherName || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, motherName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">শিক্ষা প্রতিষ্ঠান / বিদ্যালয়</label>
                    <input
                      type="text"
                      value={selectedStudent.institution || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, institution: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Editable Fields: Section 3 - Contact & Payment */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="font-bold text-emerald-900 border-b pb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>৩. যোগাযোগ ও বিকাশ পেমেন্ট তথ্য</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">অভিভাবক ফোন নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={selectedStudent.guardianPhone || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, guardianPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-bold text-emerald-900"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">প্রধান শিক্ষক ফোন নম্বর</label>
                    <input
                      type="text"
                      value={selectedStudent.principalPhone || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, principalPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">প্রেরক বিকাশ নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={selectedStudent.senderBkash || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, senderBkash: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 outline-none text-xs font-bold text-amber-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 font-bold mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      value={selectedStudent.email || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">পরীক্ষা কেন্দ্র</label>
                    <input
                      type="text"
                      value={selectedStudent.examCenter || ""}
                      onChange={(e) => setSelectedStudent({ ...selectedStudent, examCenter: e.target.value })}
                      placeholder="আম্বরখানা গার্লস স্কুল এন্ড কলেজ"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={savingStudent}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingStudent ? "গুগল শিটে সেভ হচ্ছে..." : "💾 সমস্ত সংশোধন সংরক্ষণ করুন"}</span>
                  </button>

                  <a
                    href={`/?tab=admit&reg=${selectedStudent.regNo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 transition"
                  >
                    <span>এডমিট কার্ড</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-50 transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
