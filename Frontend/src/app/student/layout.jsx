"use client";
import { StudentDashboardContext } from './StudentDashboardContext';
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import { studentService } from "../../services/studentService";
import { setStudentLogout } from "../../context/studentAuthSlice";
import { useAuth, useUser } from "@clerk/nextjs";

import {
  LayoutDashboard,
  Calendar,
  LogOut,
  User,
  Menu,
  X,
  Library,
  Terminal,
  Code2,
  Flame,
  Trophy,
  Map,
  GraduationCap,
  FolderDot,
  Users,
  GitBranch,
  MessageSquare,
  UserCheck,
  LineChart,
  Loader2,
  AlertCircle,
  Medal,
  Award,
  Briefcase,
  FileText,
  Globe,
  Activity,
  UserCircle,
  ChevronDown
} from "lucide-react";

export default function StudentLayout({ children }) {
  const navigate = useRouter();
  const dispatch = useDispatch();
  const location = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, userId } = useAuth();
  const { user } = useUser();
  const student = user; // Map student to user for now

  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("devspace_student_dashboard_cache");
        if (cached) return false;
      } catch (e) {}
    }
    return !user;
  });
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("devspace_student_dashboard_cache");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return {
      profile: null,
      registrations: [],
      boardingPasses: [],
      certificates: [],
    };
  });

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    if (student) {
      fetchDashboardData();
    }
  }, [student, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await studentService.getDashboardData();
      const freshData = response.data || response;
      setDashboardData(freshData);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("devspace_student_dashboard_cache", JSON.stringify(freshData));
        } catch (e) {}
      }
    } catch (err) {
      setError(`Failed to load dashboard data: ${err?.message || err}`);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const navCategories = [
    {
      category: "Dashboard",
      icon: LayoutDashboard,
      items: [
        { name: "Home", path: "/student/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      category: "CODE",
      icon: Code2,
      items: [
        { name: "IDE", path: "/student/ide", icon: Terminal, disabled: false },
        { name: "Problems", path: "/student/problems", icon: Code2, disabled: false },
        { name: "Challenges", path: "/student/challenges", icon: Flame, disabled: false },
        { name: "Contests", path: "/student/contests", icon: Trophy, disabled: false },
      ]
    },
    {
      category: "LEARN",
      icon: GraduationCap,
      items: [
        { name: "Learning Hub", path: "/student/learn", icon: GraduationCap, disabled: false },
        { name: "Resources", path: "/student/resources", icon: Library },
      ]
    },
    {
      category: "BUILD",
      icon: FolderDot,
      items: [
        { name: "Projects", path: "/student/projects", icon: FolderDot, disabled: false },
        { name: "Teams", path: "/student/teams", icon: Users, disabled: false },
        { name: "Git", path: "/student/git", icon: GitBranch, disabled: false },
      ]
    },
    {
      category: "COMMUNITY",
      icon: Users,
      items: [
        { name: "Discussions", path: "/student/discussions", icon: MessageSquare, disabled: false },
        { name: "Mentors", path: "/student/mentors", icon: UserCheck, disabled: false },
        { name: "Events", path: "/student/events", icon: Calendar, disabled: false },
        { name: "Attendance", path: "/student/attendance", icon: Map, disabled: false },
      ]
    },
    {
      category: "PROGRESS",
      icon: LineChart,
      items: [
        { name: "Analytics", path: "/student/analytics", icon: LineChart, disabled: false },
        { name: "Achievements", path: "/student/achievements", icon: Medal, disabled: false },
        { name: "Leaderboard", path: "/student/leaderboard", icon: Trophy, disabled: false },
        { name: "Certificates", path: "/student/certificates", icon: Award, disabled: false },
      ]
    },
    {
      category: "CAREER",
      icon: Briefcase,
      items: [
        { name: "Opportunities", path: "/student/opportunities", icon: Briefcase, disabled: false },
        { name: "Resume", path: "/student/resume", icon: FileText, disabled: false },
      ]
    },
    {
      category: "ACCOUNT",
      icon: UserCircle,
      items: [
        { name: "Profile", path: "/student/profile", icon: UserCircle, disabled: false },
      ]
    }
  ];

  // Helper to determine which category contains the current route
  const getActiveCategory = (pathname) => {
    const found = navCategories.find(group =>
      group.items.some(item => pathname === item.path || pathname.startsWith(item.path + '/'))
    );
    return found ? found.category : "CODE";
  };

  // State to track expanded dropdown categories
  const [openCategories, setOpenCategories] = useState(() => {
    const initialCat = getActiveCategory(location);
    return initialCat && initialCat !== "Dashboard" && initialCat !== "ACCOUNT"
      ? { [initialCat]: true }
      : { CODE: true };
  });

  // Auto-expand category containing current route on route change
  useEffect(() => {
    const currentCat = getActiveCategory(location);
    if (currentCat && currentCat !== "Dashboard" && currentCat !== "ACCOUNT") {
      setOpenCategories(prev => ({
        ...prev,
        [currentCat]: true
      }));
    }
  }, [location]);

  const toggleCategory = (categoryName) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const expandableCategories = navCategories.filter(
    cat => cat.category !== "Dashboard" && cat.category !== "ACCOUNT"
  );

  const allCollapsed = expandableCategories.every(c => !openCategories[c.category]);

  const toggleAll = () => {
    if (allCollapsed) {
      const allOpen = {};
      expandableCategories.forEach(c => { allOpen[c.category] = true; });
      setOpenCategories(allOpen);
    } else {
      setOpenCategories({});
    }
  };

  const handleLogout = async () => {
    try {
      await studentService.logoutStudent(); // Optional: still hit backend if needed
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setStudentLogout());
      await signOut();
      navigate.push("/");
    }
  };

  if (loading && !dashboardData?.profile && !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <>
      {userId && (
        <div className="flex min-h-screen bg-bg font-sans text-text">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-bg/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <img src="/logo.png" alt="Devspace" className="h-12 w-auto object-contain scale-110 origin-left" />
            <p className="mt-1 text-[11px] font-semibold text-accent uppercase tracking-widest">
              Student Portal
            </p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-text-muted hover:text-text lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <User className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-text truncate">{dashboardData.profile?.name || user?.fullName}</p>
                <p className="text-xs text-text-text-muted truncate">{dashboardData.profile?.studentId || user?.primaryEmailAddress?.emailAddress}</p>
            </div>
        </div>

                <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {/* Top Primary Link: Home / Dashboard */}
          <Link
            href="/student/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all group ${
              location === "/student/dashboard"
                ? "bg-accent/10 text-accent font-semibold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-accent before:rounded-r-md shadow-sm"
                : "text-text-muted hover:bg-card-hover hover:text-text"
            }`}
          >
            <LayoutDashboard className={`w-4.5 h-4.5 ${location === "/student/dashboard" ? 'text-accent' : 'text-text-muted group-hover:text-text'}`} />
            <span>Home</span>
          </Link>

          {/* Quick Header / Accordion Controls */}
          <div className="pt-3 pb-1 px-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-text-muted/60">
            <span>Navigation</span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-[10px] text-text-muted/70 hover:text-accent font-semibold transition-colors cursor-pointer"
              title={allCollapsed ? "Expand all categories" : "Collapse all categories"}
            >
              {allCollapsed ? "+ Expand All" : "- Collapse All"}
            </button>
          </div>

          {/* Collapsible Dropdown Categories */}
          <div className="space-y-1">
            {expandableCategories.map((group) => {
              const isGroupActive = group.items.some(
                item => location === item.path || location.startsWith(item.path + '/')
              );
              const isOpen = !!openCategories[group.category];
              const CategoryIcon = group.icon;

              return (
                <div key={group.category} className="rounded-lg overflow-hidden transition-all">
                  {/* Category Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.category)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold tracking-wider rounded-lg transition-all cursor-pointer select-none group ${
                      isGroupActive
                        ? "text-text bg-accent/5 font-semibold border-l-2 border-accent"
                        : "text-text-muted hover:bg-card-hover hover:text-text"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon className={`w-4 h-4 transition-colors ${
                        isGroupActive ? "text-accent" : "text-text-muted group-hover:text-text"
                      }`} />
                      <span className="uppercase tracking-wider">{group.category}</span>
                      {isGroupActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_#2EC5D4]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg text-text-muted/70 border border-border-soft">
                        {group.items.length}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-accent" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu Items */}
                  {isOpen && (
                    <div className="ml-3 pl-3 my-1 border-l-2 border-border-soft space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = location === item.path || location.startsWith(item.path + '/');
                        const ItemIcon = item.icon;

                        return (
                          <Link
                            key={item.name}
                            href={item.disabled ? "#" : item.path}
                            onClick={(e) => {
                              if (item.disabled) e.preventDefault();
                            }}
                            className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all group ${
                              isActive
                                ? "bg-accent/15 text-accent font-semibold shadow-sm"
                                : item.disabled
                                  ? "text-text-muted/40 cursor-not-allowed"
                                  : "text-text-muted hover:bg-card-hover hover:text-text"
                            }`}
                          >
                            <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${
                              isActive
                                ? 'text-accent'
                                : item.disabled
                                  ? 'text-text-muted/30'
                                  : 'text-text-muted group-hover:text-text'
                            }`} />
                            <span className="truncate">{item.name}</span>
                            {item.disabled && (
                              <span className="ml-auto text-[8px] uppercase tracking-widest font-bold bg-bg px-1.5 py-0.5 rounded text-text-muted/50 border border-border-soft">
                                Soon
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Standalone Bottom Link: Profile */}
          <div className="pt-2 border-t border-border-soft">
            <Link
              href="/student/profile"
              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all group ${
                location === "/student/profile"
                  ? "bg-accent/10 text-accent font-semibold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-accent before:rounded-r-md shadow-sm"
                  : "text-text-muted hover:bg-card-hover hover:text-text"
              }`}
            >
              <UserCircle className={`w-4.5 h-4.5 ${location === "/student/profile" ? 'text-accent' : 'text-text-muted group-hover:text-text'}`} />
              <span>Profile</span>
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-border-soft">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-text-text-muted rounded-lg transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-screen w-full">
        {/* Mobile Header */}
        <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between lg:hidden z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-text-text-muted hover:bg-card-hover rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <img src="/logo.png" alt="Devspace" className="h-10 w-auto object-contain scale-110 origin-left" />
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {error && (
            <div className="bg-danger/10 border border-danger/30 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{error}</p>
            </div>
            )}
            
          <StudentDashboardContext.Provider value={{ dashboardData, fetchDashboardData }}>{children}</StudentDashboardContext.Provider>
        </div>
      </main>
    </div>
      )}
      {!userId && (
        (() => { if (typeof window !== 'undefined') window.location.href = '/register'; return null; })()
      )}
    </>
  );
}

