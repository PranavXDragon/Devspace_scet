"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Download, RefreshCw, Sparkles, Eye, Edit3, 
  Columns, ZoomIn, ZoomOut, Check, Printer, ChevronDown,
  UploadCloud, Cloud, Loader2
} from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { studentService } from '@/services/studentService';
import { useUser } from '@clerk/nextjs';
import { useStudentDashboard } from '../StudentDashboardContext';
import { useConfirm } from '@/context/ConfirmContext';
import ResumeForm from './ResumeForm';
import ResumeTemplates from './ResumeTemplates';

const SAMPLE_RESUME_DATA = {
  personal: {
    fullName: "Pranav Navghare",
    title: "Full Stack Engineer & Open Source Builder",
    email: "pranavnavgharelp@gmail.com",
    phone: "+91 98765 43210",
    location: "Surat, Gujarat, India",
    website: "https://devspace-portal.vercel.app",
    github: "https://github.com/PranavXDragon",
    linkedin: "https://linkedin.com/in/pranav-navghare",
    summary: "High-performance Full Stack Developer passionate about scalable web applications, real-time distributed architectures, and competitive programming. Active DevSpace community builder with proven experience delivering production-grade Next.js, Node.js, and cloud systems.",
    avatarUrl: "",
    showAvatar: true
  },
  experience: [
    {
      id: "exp-1",
      role: "Lead Full Stack Developer",
      company: "DevSpace SCET Portal",
      location: "Surat, India",
      startDate: "Aug 2024",
      endDate: "Present",
      current: true,
      bullets: [
        "Architected and deployed full-stack platform serving 1,000+ engineering students with real-time coding challenges and automated certificate verification.",
        "Engineered role-based access control with Clerk and Supabase, cutting authentication latency by 45%.",
        "Built responsive gamified leaderboards, event boarding pass scanners, and dynamic resume export engines."
      ]
    },
    {
      id: "exp-2",
      role: "Software Engineering Intern",
      company: "CloudTech Labs",
      location: "Remote",
      startDate: "Jan 2024",
      endDate: "Jun 2024",
      current: false,
      bullets: [
        "Developed RESTful microservices with Node.js and PostgreSQL, achieving 99.9% uptime during peak loads.",
        "Created CI/CD automated test suites reducing release deployment errors by 30%."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "DevSpace Coding & Portal Engine",
      techStack: "Next.js 16, React 19, Supabase, Tailwind CSS, Monaco IDE",
      githubUrl: "https://github.com/PranavXDragon/Devspace_scet",
      demoUrl: "https://devspace-portal.vercel.app",
      description: "Interactive online developer learning and club management ecosystem with live code execution and QR boarding passes.",
      bullets: [
        "Implemented real-time code editor with multi-language execution sandbox.",
        "Integrated public cryptographic certificate verification for hackathon attendees."
      ]
    },
    {
      id: "proj-2",
      title: "Distributed Task Scheduler",
      techStack: "TypeScript, Redis, Docker, Express",
      githubUrl: "https://github.com/PranavXDragon",
      demoUrl: "",
      description: "Asynchronous task queue processing 5,000+ jobs/min with dead-letter retries and Prometheus telemetry metrics.",
      bullets: [
        "Eliminated job starvation using weighted fair queueing across worker nodes."
      ]
    }
  ],
  skills: {
    languages: "JavaScript, TypeScript, Python, C++, SQL, Go",
    frameworks: "React, Next.js, Node.js, Express, Tailwind CSS, Redux Toolkit",
    tools: "Git, GitHub, Docker, Postman, Linux, Vercel, Supabase, Jest",
    databases: "PostgreSQL, MongoDB, Redis, Supabase Database"
  },
  education: [
    {
      id: "edu-1",
      institution: "Sarvajanik College of Engineering & Technology (SCET)",
      degree: "B.Tech in Computer Engineering",
      field: "Computer Engineering",
      startYear: "2022",
      endYear: "2026",
      gpa: "8.9 / 10.0"
    }
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Smart India Hackathon Finalist",
      issuer: "Ministry of Education",
      date: "2024"
    },
    {
      id: "ach-2",
      title: "Top 5% Competitive Programmer",
      issuer: "DevSpace SCET",
      date: "2025"
    }
  ],
  devspaceStats: {
    xp: 450,
    problemsSolved: 42,
    projectsCount: 5,
    showStats: true
  }
};

const DEFAULT_SETTINGS = {
  layout: 'modern',       // 'modern' | 'classic' | 'developer' | 'executive'
  fontFamily: 'sans',      // 'sans' | 'tech' | 'serif' | 'mono'
  accentColor: '#06b6d4',  // Cyan
  fontSize: 'base',        // 'sm' | 'base' | 'lg'
  spacing: 'normal'        // 'compact' | 'normal' | 'relaxed'
};

const STORAGE_KEY = 'devspace_resume_state_v2';

export default function ResumePage() {
  const { user } = useUser();
  const { dashboardData } = useStudentDashboard();
  const confirm = useConfirm();
  const studentId = dashboardData?.profile?.id || user?.publicMetadata?.studentId || user?.id;

  // View mode: 'split' (desktop dual view), 'editor' (form only), 'preview' (full A4 preview)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 'editor';
    return 'split';
  });
  const [zoomScale, setZoomScale] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 0.55;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 0.75;
    return 0.9;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Auto-adjust view mode and zoom scale on window resize for optimal responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 1024 && viewMode === 'split') {
        setViewMode('editor');
      }
      if (window.innerWidth < 640 && zoomScale > 0.6) {
        setZoomScale(0.55);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, zoomScale]);

  // Cloud persistence state
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('idle'); // 'idle' | 'saving' | 'synced' | 'unsaved' | 'error'
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState(null);
  const [hasCloudDraftAvailable, setHasCloudDraftAvailable] = useState(false);
  const [cloudDraftData, setCloudDraftData] = useState(null);
  const [cloudBannerDismissed, setCloudBannerDismissed] = useState(false);

  const [resumeData, setResumeData] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved).data;
      } catch (err) {
        console.error("Failed to load saved resume state", err);
      }
    }
    return SAMPLE_RESUME_DATA;
  });

  const [designSettings, setDesignSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved).settings;
      } catch (err) {
        console.error("Failed to load saved resume settings", err);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Automatically save to local storage on edit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          data: resumeData,
          settings: designSettings
        }));
        setSaveStatus('Local Auto-saved');
        const timer = setTimeout(() => setSaveStatus(''), 2000);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Error saving resume state", e);
      }
    }
  }, [resumeData, designSettings]);

  // Initial fetch of Cloud Draft from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchCloudDraft = async () => {
      try {
        const res = await studentService.getResumeDraft();
        const payload = res.data?.data;
        if (payload?.resumeData && isMounted) {
          setCloudDraftData(payload);
          setLastCloudSavedAt(payload.updatedAt);

          // Check if local storage was just default sample
          const localStored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
          let isLocalStorageDefault = true;
          if (localStored) {
            try {
              const parsed = JSON.parse(localStored);
              isLocalStorageDefault = !parsed.data || parsed.data.personal?.fullName === SAMPLE_RESUME_DATA.personal.fullName;
            } catch {
              isLocalStorageDefault = true;
            }
          }

          if (isLocalStorageDefault) {
            // Automatically populate cloud draft for cross-device continuity
            setResumeData(payload.resumeData);
            if (payload.designSettings) {
              setDesignSettings(payload.designSettings);
            }
            setCloudStatus('synced');
          } else {
            // User has distinct local data, show cloud option
            setHasCloudDraftAvailable(true);
            setCloudStatus('synced');
          }
        }
      } catch (err) {
        console.warn("Could not fetch cloud resume draft:", err?.message);
      }
    };

    if (user) {
      fetchCloudDraft();
    }
    return () => { isMounted = false; };
  }, [user]);

  // Save to Supabase Cloud handler
  const handleSaveToCloud = async (overrideData = null, overrideSettings = null) => {
    const dataToSave = overrideData || resumeData;
    const settingsToSave = overrideSettings || designSettings;
    try {
      setIsCloudSaving(true);
      setCloudStatus('saving');
      const res = await studentService.saveResumeDraft({
        resumeData: dataToSave,
        designSettings: settingsToSave
      });
      const updatedAt = res.data?.data?.updatedAt || new Date().toISOString();
      setLastCloudSavedAt(updatedAt);
      setCloudStatus('synced');
      setHasCloudDraftAvailable(false);
      setSaveStatus('Cloud Synced');
      const timer = setTimeout(() => setSaveStatus(''), 2500);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Failed to save resume to cloud:", err);
      setCloudStatus('error');
    } finally {
      setIsCloudSaving(false);
    }
  };

  // Debounced auto-save to cloud on edits
  useEffect(() => {
    if (!user) return;
    // Don't auto-save if data is untouched default sample
    const isSample = resumeData.personal?.fullName === SAMPLE_RESUME_DATA.personal.fullName && !lastCloudSavedAt;
    if (isSample) return;

    setCloudStatus('unsaved');
    const timer = setTimeout(() => {
      handleSaveToCloud();
    }, 4000);

    return () => clearTimeout(timer);
  }, [resumeData, designSettings, user]);

  // Handler to load cloud draft
  const handleLoadCloudDraft = async () => {
    if (!cloudDraftData?.resumeData) return;
    const isConfirmed = await confirm({
      title: "Load Cloud Resume Draft",
      message: `Replace editor content with your cloud draft saved on ${new Date(cloudDraftData.updatedAt || Date.now()).toLocaleString()}?`,
      confirmText: "Load Cloud Draft",
      cancelText: "Keep Local Draft",
      type: "accent"
    });

    if (isConfirmed) {
      setResumeData(cloudDraftData.resumeData);
      if (cloudDraftData.designSettings) {
        setDesignSettings(cloudDraftData.designSettings);
      }
      setCloudStatus('synced');
      setHasCloudDraftAvailable(false);
      setCloudBannerDismissed(true);
    }
  };

  // Initial sync from user's Clerk and DevSpace profiles if not customized
  useEffect(() => {
    if (user && !resumeData.personal.email) {
      setResumeData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          fullName: user.fullName || prev.personal.fullName,
          email: user.primaryEmailAddress?.emailAddress || prev.personal.email,
          avatarUrl: user.imageUrl || prev.personal.avatarUrl
        }
      }));
    }
  }, [user]);

  // Function to sync live stats from DevSpace
  const handleSyncDevSpace = async () => {
    try {
      setIsSyncing(true);
      const [analyticsRes, achievementsRes, projectsRes] = await Promise.all([
        axiosInstance.get(studentId ? `/progress/analytics?student_id=${studentId}` : '/progress/analytics').catch(() => ({ data: {} })),
        axiosInstance.get(studentId ? `/progress/achievements?student_id=${studentId}` : '/progress/achievements').catch(() => ({ data: {} })),
        axiosInstance.get('/projects').catch(() => ({ data: [] }))
      ]);

      const analytics = analyticsRes.data || {};
      const achievements = achievementsRes.data?.achievements || [];
      const projectList = Array.isArray(projectsRes.data) ? projectsRes.data : [];
      const myProjects = studentId 
        ? projectList.filter(p => p.student_id === studentId || (p.teams && p.teams.project_team_members?.some(tm => tm.student_id === studentId)))
        : projectList;

      setResumeData(prev => {
        // Map backend projects to resume format
        const importedProjects = myProjects.map(p => ({
          id: p.id || String(Date.now()),
          title: p.title || 'Untitled Project',
          techStack: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          githubUrl: p.github_url || '',
          demoUrl: p.demo_url || '',
          description: p.description || '',
          bullets: []
        }));

        // Map backend achievements to resume format
        const earnedAchievements = achievements.filter(a => a.is_earned).map(a => ({
          id: a.id || String(Date.now()),
          title: a.title,
          issuer: 'DevSpace SCET',
          date: a.earned_at ? new Date(a.earned_at).toLocaleDateString() : 'Earned'
        }));

        return {
          ...prev,
          personal: {
            ...prev.personal,
            fullName: user?.fullName || dashboardData?.profile?.name || prev.personal.fullName,
            email: user?.primaryEmailAddress?.emailAddress || dashboardData?.profile?.email || prev.personal.email,
            phone: dashboardData?.profile?.phone || prev.personal.phone,
            avatarUrl: user?.imageUrl || prev.personal.avatarUrl
          },
          projects: importedProjects.length > 0 ? importedProjects : prev.projects,
          achievements: earnedAchievements.length > 0 ? earnedAchievements : prev.achievements,
          devspaceStats: {
            xp: analytics.total_points ?? prev.devspaceStats.xp,
            problemsSolved: analytics.total_problems_solved ?? prev.devspaceStats.problemsSolved,
            projectsCount: myProjects.length,
            showStats: true
          }
        };
      });
    } catch (err) {
      console.error("Error syncing DevSpace profile:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadSampleData = async () => {
    const isConfirmed = await confirm({
      title: "Load Sample Template",
      message: "Load a complete sample developer resume? This will populate all fields with a high-impact portfolio template that you can customize.",
      confirmText: "Load Template",
      cancelText: "Cancel",
      type: "accent"
    });

    if (isConfirmed) {
      setResumeData({
        ...SAMPLE_RESUME_DATA,
        personal: {
          ...SAMPLE_RESUME_DATA.personal,
          fullName: user?.fullName || SAMPLE_RESUME_DATA.personal.fullName,
          email: user?.primaryEmailAddress?.emailAddress || SAMPLE_RESUME_DATA.personal.email,
          avatarUrl: user?.imageUrl || ""
        }
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* =================================================================== */}
      {/* Cloud Draft Discovery Notification (Shown if cloud has saved draft) */}
      {/* =================================================================== */}
      {hasCloudDraftAvailable && !cloudBannerDismissed && cloudDraftData && (
        <div className="no-print bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text flex items-center gap-2">
                <span>Cloud Resume Draft Available</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  Supabase Synced
                </span>
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                We found your saved cloud resume from {new Date(cloudDraftData.updatedAt || Date.now()).toLocaleDateString()} at {new Date(cloudDraftData.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Would you like to load it?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleLoadCloudDraft}
              className="px-3.5 py-1.5 bg-accent hover:bg-accent/90 text-bg font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Load Cloud Draft</span>
            </button>
            <button
              type="button"
              onClick={() => setCloudBannerDismissed(true)}
              className="px-3 py-1.5 bg-bg-soft border border-border-soft hover:border-border text-text-muted hover:text-text font-medium text-xs rounded-xl transition-all"
            >
              Keep Local
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* Header & Quick Action Bar (Hidden during print) */}
      {/* =================================================================== */}
      <div className="no-print bg-card border border-border-soft rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-headline text-text flex items-center gap-2 flex-wrap">
                  <span>DevSpace Resume Studio</span>
                  {saveStatus && (
                    <span className="text-[11px] font-mono font-normal text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      {saveStatus}
                    </span>
                  )}
                  {cloudStatus === 'saving' && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Syncing Cloud...
                    </span>
                  )}
                  {cloudStatus === 'synced' && (
                    <span 
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full"
                      title={lastCloudSavedAt ? `Synced at ${new Date(lastCloudSavedAt).toLocaleTimeString()}` : 'Cloud Synced'}
                    >
                      <Check className="w-3 h-3 text-emerald-400" /> Cloud Synced
                    </span>
                  )}
                  {cloudStatus === 'unsaved' && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      <Cloud className="w-3 h-3 text-amber-400" /> Cloud Unsaved
                    </span>
                  )}
                  {cloudStatus === 'error' && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                      Sync Error
                    </span>
                  )}
                </h1>
                <p className="text-xs text-text-muted mt-0.5">
                  Design, customize layouts, edit content, and sync your ATS-optimized resume securely across all devices.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* View Mode Toggle */}
            <div className="bg-bg-soft border border-border-soft p-1 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'editor'
                    ? 'bg-card text-accent shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Form</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`hidden lg:flex px-3 py-1.5 rounded-lg text-xs font-bold items-center gap-1.5 transition-all ${
                  viewMode === 'split'
                    ? 'bg-card text-accent shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'preview'
                    ? 'bg-card text-accent shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Cloud Sync Button */}
            <button
              type="button"
              onClick={() => handleSaveToCloud()}
              disabled={isCloudSaving}
              className="px-3.5 py-2 bg-card border border-accent/40 text-accent hover:bg-accent/10 font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
              title="Save resume draft securely to Supabase Cloud - access it from any phone, laptop, or browser"
            >
              {isCloudSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              ) : (
                <UploadCloud className="w-4 h-4 text-accent" />
              )}
              <span>{isCloudSaving ? 'Saving...' : 'Save to Cloud'}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-text text-bg hover:bg-accent hover:text-bg font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Quick Toolbar (Layout + Font + Color shortcuts) */}
        <div className="pt-3 border-t border-border-soft flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-muted font-bold uppercase tracking-wider text-[11px]">Layout:</span>
            {[
              { id: 'modern', name: 'Modern Tech' },
              { id: 'classic', name: 'Classic ATS' },
              { id: 'developer', name: 'Terminal Code' },
              { id: 'executive', name: 'Executive' }
            ].map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => setDesignSettings(s => ({ ...s, layout: l.id }))}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  designSettings.layout === l.id
                    ? 'border-accent bg-accent/10 text-accent font-bold'
                    : 'border-border-soft hover:border-border text-text-muted hover:text-text'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>

          {/* Preview Zoom Controls */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex items-center gap-1 text-text-muted">
              <span className="text-[11px] font-mono mr-1">Zoom:</span>
              <button
                type="button"
                onClick={() => setZoomScale(z => Math.max(0.45, Number((z - 0.1).toFixed(2))))}
                className="p-1 hover:text-text rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1 min-w-[2.5rem] text-center">{Math.round(zoomScale * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomScale(z => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
                className="p-1 hover:text-text rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* Main Workspace Layout */}
      {/* =================================================================== */}
      <div className={`grid gap-6 ${
        viewMode === 'split' 
          ? 'grid-cols-1 lg:grid-cols-12' 
          : 'grid-cols-1'
      }`}>
        
        {/* Editor Form Column */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`no-print ${
            viewMode === 'split' ? 'lg:col-span-6 xl:col-span-5' : 'w-full max-w-4xl mx-auto'
          }`}>
            <ResumeForm
              data={resumeData}
              setData={setResumeData}
              settings={designSettings}
              setSettings={setDesignSettings}
              onSyncDevSpace={handleSyncDevSpace}
              onLoadSampleData={handleLoadSampleData}
              isSyncing={isSyncing}
              onSaveCloud={() => handleSaveToCloud()}
              isCloudSaving={isCloudSaving}
              cloudStatus={cloudStatus}
              lastCloudSavedAt={lastCloudSavedAt}
            />
          </div>
        )}

        {/* Live Preview Column */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${
            viewMode === 'split' ? 'lg:col-span-6 xl:col-span-7' : 'w-full'
          } flex flex-col items-center justify-start overflow-x-auto`}>
            
            <div 
              className="w-full flex justify-center transition-transform origin-top duration-200"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <div className="w-full max-w-[210mm] shadow-2xl rounded-sm print:shadow-none print:max-w-none">
                <ResumeTemplates
                  data={resumeData}
                  settings={designSettings}
                />
              </div>
            </div>

            {/* Print Tip Helper */}
            <div className="no-print text-center text-xs text-text-muted mt-6 max-w-md">
              <p>💡 Tip: Click <strong>Save as PDF</strong> above. In the print dialog, set <strong>Margins: None</strong> and check <strong>Background graphics</strong> for optimal results.</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
