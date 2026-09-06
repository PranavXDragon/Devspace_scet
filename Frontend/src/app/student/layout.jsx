"use client";
import { StudentDashboardContext } from './StudentDashboardContext';
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import { studentService } from "@/services/studentService";
import { setStudentLogout } from "@/context/studentAuthSlice";
import { useAuth, useUser } from "@clerk/nextjs";

import {
  LayoutDashboard,
  Calendar,
  LogOut,
  User,
  Menu,
  X,
  Library,
  Ticket,
  Award,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function StudentLayout({ children }) {
  const navigate = useRouter();
  const dispatch = useDispatch();
  const location = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, userId } = useAuth();
  const { user } = useUser();
  const student = user; // Map student to user for now

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    registrations: [],
    boardingPasses: [],
    certificates: [],
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
      setDashboardData(response.data || response);
    } catch (err) {
      setError("Failed to load dashboard data.");
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    { name: "Registrations", path: "/student/registrations", icon: Calendar },
    { name: "Resource Library", path: "/student/resources", icon: Library },
  ];

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

  if (loading) {
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
            <h1 className="text-2xl font-bold tracking-tight text-text">
              DEVSPACE
            </h1>
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

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-accent/10 text-accent relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-accent before:rounded-r-md"
                    : "text-text-text-muted hover:bg-card-hover hover:text-text"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
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
              <h1 className="text-xl font-bold tracking-tight text-text leading-none">
                DEVSPACE
              </h1>
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

