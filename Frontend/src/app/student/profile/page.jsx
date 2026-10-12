"use client";
import React, { useState, useEffect } from "react";
import { useUser, useClerk, useSession } from "@clerk/nextjs";
import { useConfirm, useAlert } from "@/context/ConfirmContext";
import { useStudentDashboard } from "../StudentDashboardContext";
import { studentService } from "@/services/studentService";
import {
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  Shield,
  Monitor,
  Settings,
  AlertCircle,
  CheckCircle2,
  Lock,
  Key,
  Smartphone,
  Globe,
  LogOut,
  Trash2,
  Bell,
  Code,
  Eye,
  RefreshCw,
  ExternalLink,
  Laptop,
  Check,
  ShieldCheck,
  Sliders,
  Download,
  Calendar,
  Clock,
  Github,
  Link2,
  Unlink
} from "lucide-react";

export default function StudentProfile() {
  const { isLoaded, user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { session: currentSession } = useSession();
  const { dashboardData, fetchDashboardData } = useStudentDashboard();
  const confirm = useConfirm();
  const showAlert = useAlert();

  const [currentTab, setCurrentTab] = useState("#profile");

  // GitHub Integration State
  const [githubHandle, setGithubHandle] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState({ type: "", text: "" });

  // Profile Details State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Security State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // Active Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionActionLoading, setSessionActionLoading] = useState("");
  const [sessionMessage, setSessionMessage] = useState({ type: "", text: "" });

  // Application Settings & Preferences State
  const [ideSettings, setIdeSettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("devspace_ide_preferences");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      language: "javascript",
      fontSize: "14",
      tabSize: "2",
      keybinding: "standard"
    };
  });

  const [notificationSettings, setNotificationSettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("devspace_notification_preferences");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      contests: true,
      workshops: true,
      certificates: true,
      teamInvites: true
    };
  });

  const [privacySettings, setPrivacySettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("devspace_privacy_preferences");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      publicProfile: true,
      showLeaderboard: true,
      showProjects: true
    };
  });

  const [settingsSavedMessage, setSettingsSavedMessage] = useState("");

  // Initialize data on load
  useEffect(() => {
    if (isLoaded && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
      setPreviewPhoto(user.imageUrl || null);
    }
    
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        setCurrentTab(hash);
      }
    }
  }, [isLoaded, user]);

  // Initialize GitHub handle from profile, OAuth, or local state
  useEffect(() => {
    const existingGithub = dashboardData?.profile?.github_username || 
      user?.externalAccounts?.find(a => a.provider === 'oauth_github')?.username || 
      (typeof window !== 'undefined' ? localStorage.getItem('devspace_github_username') : '') || '';
    if (existingGithub) {
      setGithubHandle(existingGithub);
    }
  }, [dashboardData, user]);

  // Fetch sessions when entering sessions tab
  useEffect(() => {
    if (currentTab === "#sessions" && user) {
      fetchSessions();
    }
  }, [currentTab, user]);

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      if (typeof user?.getSessions === "function") {
        const sessionList = await user.getSessions();
        setSessions(sessionList || []);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      setSessionActionLoading(sessionId);
      setSessionMessage({ type: "", text: "" });
      const targetSession = sessions.find(s => s.id === sessionId);
      if (targetSession && typeof targetSession.revoke === "function") {
        await targetSession.revoke();
        setSessionMessage({ type: "success", text: "Session revoked successfully." });
        await fetchSessions();
      }
    } catch (err) {
      console.error("Error revoking session:", err);
      setSessionMessage({ type: "error", text: err?.message || "Failed to revoke session." });
    } finally {
      setSessionActionLoading("");
    }
  };

  const handleSignOutAllOtherSessions = async () => {
    const isConfirmed = await confirm({
      title: "Sign Out Other Devices",
      message: "Are you sure you want to sign out of all other active sessions? You will remain logged in on this browser.",
      confirmText: "Sign Out Devices",
      cancelText: "Cancel",
      type: "danger"
    });

    if (!isConfirmed) return;
    try {
      setSessionActionLoading("all-other");
      setSessionMessage({ type: "", text: "" });
      const otherSessions = sessions.filter(s => s.id !== currentSession?.id);
      for (const s of otherSessions) {
        if (typeof s.revoke === "function") {
          await s.revoke();
        }
      }
      setSessionMessage({ type: "success", text: "All other sessions have been signed out." });
      await fetchSessions();
    } catch (err) {
      console.error("Error revoking other sessions:", err);
      setSessionMessage({ type: "error", text: "Failed to sign out other sessions." });
    } finally {
      setSessionActionLoading("");
    }
  };

  // Profile update handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (profilePhoto) {
        await user.setProfileImage({ file: profilePhoto });
      }
      
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (githubHandle !== undefined) {
        const clean = githubHandle.trim().replace(/^@/, '');
        try {
          await studentService.updateGithubUsername(clean || null);
          if (typeof window !== "undefined") {
            if (clean) localStorage.setItem("devspace_github_username", clean);
            else localStorage.removeItem("devspace_github_username");
          }
          if (typeof fetchDashboardData === "function") {
            await fetchDashboardData();
          }
        } catch (ghErr) {
          console.warn("GitHub save notice:", ghErr);
        }
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.errors?.[0]?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGithub = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const clean = (githubHandle || "").trim().replace(/^@/, "");
    if (!clean) {
      await showAlert({
        title: "Username Required",
        message: "Please enter your GitHub handle (e.g. 'torvalds').",
        type: "warning"
      });
      return;
    }
    setGithubLoading(true);
    setGithubMessage({ type: "", text: "" });
    try {
      await studentService.updateGithubUsername(clean);
      if (typeof window !== "undefined") {
        localStorage.setItem("devspace_github_username", clean);
      }
      if (typeof fetchDashboardData === "function") {
        await fetchDashboardData();
      }
      setGithubMessage({ type: "success", text: `GitHub handle @${clean} connected and saved successfully!` });
      await showAlert({
        title: "GitHub Connected!",
        message: `Your GitHub account (@${clean}) is now connected and synced across your student profile, Git dashboard, and resume builder.`,
        type: "info"
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to connect GitHub account.";
      setGithubMessage({ type: "error", text: msg });
      await showAlert({
        title: "Connection Failed",
        message: msg,
        type: "danger"
      });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleDisconnectGithub = async () => {
    const isConfirmed = await confirm({
      title: "Disconnect GitHub Account",
      message: "Are you sure you want to remove your connected GitHub account from your profile?",
      confirmText: "Disconnect",
      cancelText: "Cancel",
      type: "warning"
    });
    if (!isConfirmed) return;

    try {
      setGithubLoading(true);
      await studentService.updateGithubUsername(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("devspace_github_username");
      }
      if (typeof fetchDashboardData === "function") {
        await fetchDashboardData();
      }
      setGithubHandle("");
      setGithubMessage({ type: "info", text: "GitHub account disconnected." });
    } catch (err) {
      console.error(err);
    } finally {
      setGithubLoading(false);
    }
  };

  const handleOAuthConnectGithub = async () => {
    try {
      if (user && typeof user.createExternalAccount === "function") {
        const res = await user.createExternalAccount({
          strategy: "oauth_github",
          redirect_url: window.location.href,
        });
        if (res?.verification?.externalVerificationRedirectURL) {
          window.location.href = res.verification.externalVerificationRedirectURL.href;
          return;
        }
      }
      openUserProfile();
    } catch (err) {
      console.error("OAuth error:", err);
      await showAlert({
        title: "OAuth Notice",
        message: err.errors?.[0]?.message || err.message || "Please enter your GitHub handle in the input field above to connect directly.",
        type: "warning"
      });
    }
  };

  // Security password change handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      setPasswordLoading(true);
      if (user.hasPassword) {
        if (!passwordData.currentPassword) {
          setPasswordMessage({ type: "error", text: "Current password is required." });
          setPasswordLoading(false);
          return;
        }
        await user.updatePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
      } else {
        if (typeof user.createPassword === "function") {
          await user.createPassword({
            newPassword: passwordData.newPassword
          });
        } else {
          await user.updatePassword({
            newPassword: passwordData.newPassword
          });
        }
      }

      setPasswordMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error.errors?.[0]?.message || "Failed to update password. Please check your credentials."
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Settings Save handler
  const handleSaveSettings = () => {
    try {
      localStorage.setItem("devspace_ide_preferences", JSON.stringify(ideSettings));
      localStorage.setItem("devspace_notification_preferences", JSON.stringify(notificationSettings));
      localStorage.setItem("devspace_privacy_preferences", JSON.stringify(privacySettings));
      setSettingsSavedMessage("Preferences saved successfully!");
      setTimeout(() => setSettingsSavedMessage(""), 2500);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      user: {
        id: user?.id,
        fullName: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        createdAt: user?.createdAt
      },
      idePreferences: ideSettings,
      notificationPreferences: notificationSettings,
      privacyPreferences: privacySettings
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devspace-profile-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "#profile", name: "Profile Details", icon: User },
    { id: "#accounts", name: "Connected Accounts", icon: Github },
    { id: "#password", name: "Security", icon: Shield },
    { id: "#sessions", name: "Active Sessions", icon: Monitor },
    { id: "#settings", name: "Settings", icon: Settings },
  ];

  if (!isLoaded || !user) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10 space-y-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6 pb-4 border-b border-border/60">
          <div className="space-y-2">
            <div className="w-48 h-8 bg-card rounded-lg skeleton-shimmer" />
            <div className="w-72 h-4 bg-card rounded-md skeleton-shimmer" />
          </div>
          <div className="w-96 h-10 bg-card rounded-xl skeleton-shimmer" />
        </div>
        <div className="bg-card rounded-2xl border border-border p-8 space-y-6 skeleton-shimmer">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-bg" />
            <div className="space-y-2 flex-1">
              <div className="w-40 h-5 bg-bg rounded-md" />
              <div className="w-60 h-4 bg-bg rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border-soft/40">
            <div className="h-10 bg-bg rounded-xl" />
            <div className="h-10 bg-bg rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10 space-y-8">
      {/* Page Header with Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-text">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your personal profile, credentials, security, and developer preferences.
          </p>
        </div>

        {/* Horizontal Tabs */}
        <div className="flex space-x-1 bg-card-hover/80 p-1.5 rounded-xl w-full lg:w-max overflow-x-auto border border-border/60 shrink-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id);
                if (typeof window !== "undefined") {
                  window.location.hash = tab.id;
                }
              }}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                currentTab === tab.id
                  ? "bg-card text-accent shadow-sm ring-1 ring-accent/20 font-semibold"
                  : "text-text-muted hover:text-text hover:bg-card-hover/50"
              }`}
            >
              <tab.icon
                className={`w-4 h-4 ${currentTab === tab.id ? "text-accent" : "text-text-muted"}`}
              />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 min-w-0">
        
        {/* ================================================================= */}
        {/* 1. PROFILE DETAILS TAB */}
        {/* ================================================================= */}
        {currentTab === "#profile" && (
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border-soft flex items-center justify-between bg-card-hover">
              <div className="flex items-center gap-3">
                <User className="text-accent w-5 h-5" />
                <h2 className="font-semibold text-text">Profile Details</h2>
              </div>
              <span className="text-xs font-mono text-text-muted">User ID: {user.id.slice(0, 12)}...</span>
            </div>
            
            <div className="p-6 sm:p-10">
              <form onSubmit={handleSubmitProfile} className="space-y-8">
                
                {/* Profile Photo Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-border-soft">
                  <div className="relative group">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-card-hover border-4 border-border shadow-lg relative">
                      {previewPhoto ? (
                        <img
                          src={previewPhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent/10 text-accent">
                          <User size={48} />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 bg-accent text-bg p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-accent/90 transition-colors"
                      title="Upload new photo"
                    >
                      <Camera size={18} />
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text font-headline">
                      Profile Photo
                    </h3>
                    <p className="text-sm text-text-muted mt-1 max-w-sm">
                      Upload a new profile picture. JPG, PNG or WebP up to 5MB.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <label
                        htmlFor="photo-upload"
                        className="px-4 py-2 border border-border-soft text-text text-xs font-bold rounded-lg cursor-pointer hover:bg-card-hover transition-colors"
                      >
                        Change Photo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-border-soft rounded-xl bg-bg text-text text-sm focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                        placeholder="John"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-border-soft rounded-xl bg-bg text-text text-sm focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={user.primaryEmailAddress?.emailAddress || ""}
                        disabled
                        className="block w-full pl-10 pr-3 py-2.5 border border-border-soft rounded-xl bg-bg/50 text-text-muted cursor-not-allowed text-sm"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Email address is managed by Clerk and verified with your DevSpace account.
                    </p>
                  </div>

                  {/* GitHub Profile Handle in Profile Details */}
                  <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border-soft">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <Github className="h-3.5 w-3.5 text-accent" /> GitHub Handle
                      </label>
                      <button
                        type="button"
                        onClick={() => setCurrentTab("#accounts")}
                        className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
                      >
                        <span>Manage in Connected Accounts</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted font-mono text-sm">
                        @
                      </div>
                      <input
                        type="text"
                        value={githubHandle}
                        onChange={(e) => setGithubHandle(e.target.value)}
                        placeholder="your-github-username (e.g. torvalds)"
                        className="block w-full pl-8 pr-3 py-2.5 border border-border-soft rounded-xl bg-bg text-text text-sm font-mono focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Links your repositories to your Git Dashboard, team profiles, and Project Showcase.
                    </p>
                  </div>
                </div>

                {/* Status Messages */}
                {message.text && (
                  <div
                    className={`p-4 rounded-xl flex items-center gap-3 ${
                      message.type === "success"
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0" />
                    )}
                    <p className="text-sm font-medium">{message.text}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-border-soft">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-accent text-bg px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* CONNECTED ACCOUNTS & DEVELOPER PROFILES TAB */}
        {/* ================================================================= */}
        {currentTab === "#accounts" && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border-soft flex items-center justify-between bg-card-hover">
                <div className="flex items-center gap-3">
                  <Github className="text-accent w-5 h-5" />
                  <div>
                    <h2 className="font-semibold text-text">GitHub Integration</h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Sync your repositories, open source contributions, and portfolio stats across DevSpace.
                    </p>
                  </div>
                </div>
                {githubHandle ? (
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-border-soft text-text-muted text-xs font-bold rounded-full">
                    Not Linked
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-10 space-y-8">
                {/* Current Status / Input Form */}
                <form onSubmit={handleSaveGithub} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                      <span>GitHub Handle / Username</span>
                      {githubHandle && (
                        <a
                          href={`https://github.com/${githubHandle.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline lowercase font-mono inline-flex items-center gap-1 normal-case text-xs"
                        >
                          <span>github.com/{githubHandle.replace(/^@/, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted font-mono text-sm">
                        @
                      </div>
                      <input
                        type="text"
                        value={githubHandle}
                        onChange={(e) => setGithubHandle(e.target.value)}
                        placeholder="your-github-username (e.g. torvalds)"
                        className="block w-full pl-9 pr-3 py-2.5 border border-border-soft rounded-xl bg-bg text-text text-sm font-mono focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                      />
                    </div>
                    <p className="text-xs text-text-muted">
                      Your GitHub profile will be displayed on your student profile, public project cards, and Git Dashboard.
                    </p>
                  </div>

                  {githubMessage.text && (
                    <div
                      className={`p-4 rounded-xl flex items-center gap-3 ${
                        githubMessage.type === "success"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {githubMessage.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 shrink-0" />
                      )}
                      <p className="text-sm font-medium">{githubMessage.text}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-soft justify-between items-center">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={githubLoading}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-accent text-bg px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent/90 transition-all disabled:opacity-70 cursor-pointer shadow-md"
                      >
                        {githubLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{githubHandle ? "Update GitHub Handle" : "Connect GitHub Account"}</span>
                      </button>

                      {githubHandle && (
                        <button
                          type="button"
                          onClick={handleDisconnectGithub}
                          disabled={githubLoading}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Unlink className="w-4 h-4" />
                          <span>Disconnect</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleOAuthConnectGithub}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card hover:bg-card-hover border border-border-soft px-4 py-2.5 rounded-xl text-xs font-bold text-text transition-all cursor-pointer"
                    >
                      <Github className="w-4 h-4 text-accent" />
                      <span>Authorize via GitHub OAuth</span>
                    </button>
                  </div>
                </form>

                {/* Helpful Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-soft">
                  <div className="p-4 bg-bg rounded-xl border border-border-soft flex items-start gap-3">
                    <Code className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-text">Git Dashboard Sync</h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Track repositories and commit activity in real time on your dedicated Git Dashboard.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-bg rounded-xl border border-border-soft flex items-start gap-3">
                    <Laptop className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-text">Resume & Portfolio</h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Include your live GitHub repository links and stats automatically inside Resume Studio exports.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clerk Authentication Details Card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden p-6">
              <h3 className="font-semibold text-text text-sm mb-2">Clerk Account Management</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                Manage your primary sign-in email, password, and connected social providers (Google, GitHub) directly in Clerk.
              </p>
              <button
                type="button"
                onClick={() => openUserProfile()}
                className="px-4 py-2 bg-card-hover border border-border-soft hover:border-accent text-text text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-accent" />
                <span>Open Clerk Security & OAuth Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. SECURITY TAB */}
        {/* ================================================================= */}
        {currentTab === "#password" && (
          <div className="space-y-6">
            {/* Password Management */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border-soft flex items-center justify-between bg-card-hover">
                <div className="flex items-center gap-3">
                  <Lock className="text-accent w-5 h-5" />
                  <h2 className="font-semibold text-text">Password & Authentication</h2>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  user.hasPassword 
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  {user.hasPassword ? "Password Enabled" : "OAuth Only"}
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {!user.hasPassword ? (
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-xs space-y-2">
                    <div className="font-bold text-accent flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Signed in with Google / Social Provider
                    </div>
                    <p className="text-text-muted leading-relaxed">
                      Your account was authenticated using an OAuth provider. You can set a password below to also enable standard email & password login.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                  {user.hasPassword && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 bg-bg border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      {user.hasPassword ? "New Password" : "Create Password"} (Min 8 Characters)
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-bg border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-bg border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                    />
                  </div>

                  {passwordMessage.text && (
                    <div className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs ${
                      passwordMessage.type === "success"
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}>
                      {passwordMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{passwordMessage.text}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-5 py-2.5 bg-accent text-bg text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2 disabled:opacity-60"
                    >
                      {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                      <span>{user.hasPassword ? "Update Password" : "Set Password"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Two-Factor Authentication & Connected Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 2FA Card */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-accent" />
                      <h3 className="font-bold text-text text-sm">Two-Factor Authentication</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.twoFactorEnabled 
                        ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      {user.twoFactorEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Protect your account with an extra verification step using an Authenticator app (TOTP) or backup security keys.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openUserProfile && openUserProfile()}
                    className="w-full py-2.5 px-3 bg-card-hover border border-border-soft hover:border-accent text-text text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Manage 2FA in Clerk</span>
                    <ExternalLink className="w-3.5 h-3.5 text-accent" />
                  </button>
                </div>
              </div>

              {/* Connected Social Accounts */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-accent" />
                    <h3 className="font-bold text-text text-sm">Connected Accounts</h3>
                  </div>
                  <p className="text-xs text-text-muted mb-3">
                    Linked social providers configured for one-click access:
                  </p>

                  <div className="space-y-2">
                    {user.externalAccounts && user.externalAccounts.length > 0 ? (
                      user.externalAccounts.map((acc, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-bg-soft border border-border-soft flex items-center justify-between text-xs">
                          <span className="font-semibold capitalize text-text">{acc.provider}</span>
                          <span className="text-text-muted font-mono truncate max-w-[150px]">{acc.emailAddress || 'Connected'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-text-muted italic">No social accounts connected.</div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openUserProfile && openUserProfile()}
                    className="w-full py-2.5 px-3 bg-card-hover border border-border-soft hover:border-accent text-text text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Connect More Accounts</span>
                    <ExternalLink className="w-3.5 h-3.5 text-accent" />
                  </button>
                </div>
              </div>

            </div>

            {/* Security Audit Details */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 text-xs space-y-3">
              <h3 className="font-bold text-text flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" /> Account Security Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-text-muted">
                <div className="p-3 bg-bg-soft rounded-xl border border-border-soft">
                  <span className="block text-[10px] uppercase font-bold text-text-muted/70">Email Verification</span>
                  <span className="font-semibold text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                <div className="p-3 bg-bg-soft rounded-xl border border-border-soft">
                  <span className="block text-[10px] uppercase font-bold text-text-muted/70">Account Created</span>
                  <span className="font-semibold text-text mt-1 block">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-bg-soft rounded-xl border border-border-soft">
                  <span className="block text-[10px] uppercase font-bold text-text-muted/70">Last Sign-in</span>
                  <span className="font-semibold text-text mt-1 block">
                    {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : 'Active Now'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. ACTIVE SESSIONS TAB */}
        {/* ================================================================= */}
        {currentTab === "#sessions" && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border-soft flex flex-wrap items-center justify-between gap-3 bg-card-hover">
                <div className="flex items-center gap-3">
                  <Monitor className="text-accent w-5 h-5" />
                  <div>
                    <h2 className="font-semibold text-text">Active Devices & Sessions</h2>
                    <p className="text-xs text-text-muted mt-0.5">Manage devices currently logged into your DevSpace account.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchSessions}
                    disabled={sessionsLoading}
                    className="p-2 border border-border-soft rounded-xl hover:bg-card text-text-muted hover:text-text transition-all"
                    title="Refresh sessions"
                  >
                    <RefreshCw className={`w-4 h-4 ${sessionsLoading ? 'animate-spin text-accent' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOutAllOtherSessions}
                    disabled={sessionActionLoading === "all-other"}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out Other Devices</span>
                  </button>
                </div>
              </div>

              {sessionMessage.text && (
                <div className={`m-6 p-3.5 rounded-xl flex items-center gap-2.5 text-xs ${
                  sessionMessage.type === "success"
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}>
                  {sessionMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{sessionMessage.text}</span>
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Current Device Highlight */}
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-accent/10 text-accent border border-accent/20">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-text text-sm">Current Browser & Device</h4>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active Now
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1 font-mono">
                        Session ID: {currentSession?.id ? `${currentSession.id.slice(0, 14)}...` : 'Active'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-text-muted sm:text-right">
                    <span>This browser</span>
                  </div>
                </div>

                {/* Other Sessions List */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                    Other Logged-in Devices
                  </h4>

                  {sessionsLoading ? (
                    <div className="p-8 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" /> Loading active sessions...
                    </div>
                  ) : sessions.filter(s => s.id !== currentSession?.id).length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border-soft rounded-xl text-text-muted text-xs">
                      No other devices or sessions active. You are securely logged in only on this device.
                    </div>
                  ) : (
                    <div className="divide-y divide-border-soft border border-border-soft rounded-xl overflow-hidden">
                      {sessions.filter(s => s.id !== currentSession?.id).map((s) => (
                        <div key={s.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card hover:bg-card-hover/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-card-hover text-text-muted border border-border-soft">
                              <Monitor className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-text">
                                {s.latestActivity?.deviceType || 'Web Browser'} – {s.latestActivity?.browserName || 'Unknown Browser'}
                              </div>
                              <div className="text-[11px] text-text-muted flex items-center gap-2 mt-0.5 font-mono">
                                {s.latestActivity?.ipAddress && <span>IP: {s.latestActivity.ipAddress}</span>}
                                {s.lastActiveAt && (
                                  <span>• Last active: {new Date(s.lastActiveAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRevokeSession(s.id)}
                            disabled={sessionActionLoading === s.id}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {sessionActionLoading === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                            <span>Sign Out Device</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. SETTINGS TAB */}
        {/* ================================================================= */}
        {currentTab === "#settings" && (
          <div className="space-y-6">
            
            {/* Success toast */}
            {settingsSavedMessage && (
              <div className="p-4 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{settingsSavedMessage}</span>
              </div>
            )}

            {/* Code IDE Preferences */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border-soft flex items-center justify-between bg-card-hover">
                <div className="flex items-center gap-3">
                  <Code className="text-accent w-5 h-5" />
                  <div>
                    <h2 className="font-semibold text-text">Code Studio & IDE Preferences</h2>
                    <p className="text-xs text-text-muted mt-0.5">Customize your online coding challenge and playground environment.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                    Default Programming Language
                  </label>
                  <select
                    value={ideSettings.language}
                    onChange={(e) => setIdeSettings({ ...ideSettings, language: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC)</option>
                    <option value="java">Java (OpenJDK)</option>
                    <option value="go">Go</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                    Editor Font Size
                  </label>
                  <select
                    value={ideSettings.fontSize}
                    onChange={(e) => setIdeSettings({ ...ideSettings, fontSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="12">12px (Compact)</option>
                    <option value="14">14px (Recommended)</option>
                    <option value="16">16px (Comfortable)</option>
                    <option value="18">18px (Large)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                    Tab Indentation Size
                  </label>
                  <select
                    value={ideSettings.tabSize}
                    onChange={(e) => setIdeSettings({ ...ideSettings, tabSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="2">2 Spaces</option>
                    <option value="4">4 Spaces</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                    Editor Keybindings
                  </label>
                  <select
                    value={ideSettings.keybinding}
                    onChange={(e) => setIdeSettings({ ...ideSettings, keybinding: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="standard">Standard (VS Code default)</option>
                    <option value="vim">Vim Emulation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border-soft flex items-center gap-3 bg-card-hover">
                <Bell className="text-accent w-5 h-5" />
                <div>
                  <h2 className="font-semibold text-text">Notification & Alert Preferences</h2>
                  <p className="text-xs text-text-muted mt-0.5">Control which email announcements you receive from DevSpace.</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                {[
                  { key: 'contests', title: 'Coding Contests & Hackathons', desc: 'Get alerts when new coding contests or hackathon registrations open.' },
                  { key: 'workshops', title: 'Workshops & Dev Meetups', desc: 'Reminders and boarding pass notifications for upcoming campus sessions.' },
                  { key: 'certificates', title: 'Verified Certificate Issuance', desc: 'Instant email whenever a new verified certificate or achievement is issued.' },
                  { key: 'teamInvites', title: 'Team & Project Collaboration', desc: 'Notifications when classmates invite you to collaborate on projects.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-bg-soft border border-border-soft">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-text block">{item.title}</span>
                      <span className="text-[11px] text-text-muted">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!notificationSettings[item.key]}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-accent cursor-pointer shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Profile Visibility */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border-soft flex items-center gap-3 bg-card-hover">
                <Eye className="text-accent w-5 h-5" />
                <div>
                  <h2 className="font-semibold text-text">Privacy & Public Visibility</h2>
                  <p className="text-xs text-text-muted mt-0.5">Manage what information is displayed to other students.</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                {[
                  { key: 'publicProfile', title: 'Public Student Profile', desc: 'Allow your developer portfolio and projects to be viewed by peers.' },
                  { key: 'showLeaderboard', title: 'Display on Leaderboards', desc: 'Show your points, badges, and problems solved on club rank tables.' },
                  { key: 'showProjects', title: 'Showcase Uploaded Projects', desc: 'Feature your projects in the public community directory.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-bg-soft border border-border-soft">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-text block">{item.title}</span>
                      <span className="text-[11px] text-text-muted">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!privacySettings[item.key]}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-accent cursor-pointer shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Preferences Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex items-center gap-2 bg-accent text-bg px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent/90 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save All Preferences</span>
              </button>
            </div>

            {/* Data & Danger Zone */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-4 border-l-4 border-l-red-500/80">
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" /> Account Data & Actions
              </h3>
              <p className="text-xs text-text-muted">
                Download a machine-readable archive of your DevSpace profile and data or sign out of your account.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2 bg-card hover:bg-card-hover border border-border-soft text-text text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>Download My Data (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of DevSpace</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
