"use client";
import React, { useState } from 'react';
import { 
  User, Briefcase, Code, GraduationCap, Award, Palette, 
  Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Terminal, 
  RefreshCw, Layout, Type, MoveVertical, ShieldCheck, Check,
  UploadCloud, Loader2
} from 'lucide-react';

export default function ResumeForm({ 
  data, 
  setData, 
  settings, 
  setSettings, 
  onSyncDevSpace, 
  onLoadSampleData, 
  isSyncing,
  onSaveCloud,
  isCloudSaving,
  cloudStatus,
  lastCloudSavedAt
}) {
  const [activeTab, setActiveTab] = useState('personal');

  // Input handlers for nested personal data
  const handlePersonalChange = (field, val) => {
    setData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: val }
    }));
  };

  // Handlers for Skills
  const handleSkillsChange = (category, val) => {
    setData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: val }
    }));
  };

  // Handlers for Experience items
  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      role: 'Software Engineer Intern',
      company: 'Tech Company',
      location: 'Remote',
      startDate: '2024',
      endDate: '2025',
      current: false,
      bullets: ['Built scalable web services and improved performance by 25%.']
    };
    setData(prev => ({
      ...prev,
      experience: [newExp, ...(prev.experience || [])]
    }));
  };

  const updateExperience = (index, field, val) => {
    setData(prev => {
      const updated = [...(prev.experience || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index) => {
    setData(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index)
    }));
  };

  const addExperienceBullet = (expIndex) => {
    setData(prev => {
      const updated = [...(prev.experience || [])];
      const bullets = [...(updated[expIndex].bullets || []), 'Collaborated with cross-functional teams to deploy features.'];
      updated[expIndex] = { ...updated[expIndex], bullets };
      return { ...prev, experience: updated };
    });
  };

  const updateExperienceBullet = (expIndex, bulletIndex, val) => {
    setData(prev => {
      const updated = [...(prev.experience || [])];
      const bullets = [...(updated[expIndex].bullets || [])];
      bullets[bulletIndex] = val;
      updated[expIndex] = { ...updated[expIndex], bullets };
      return { ...prev, experience: updated };
    });
  };

  const removeExperienceBullet = (expIndex, bulletIndex) => {
    setData(prev => {
      const updated = [...(prev.experience || [])];
      const bullets = (updated[expIndex].bullets || []).filter((_, i) => i !== bulletIndex);
      updated[expIndex] = { ...updated[expIndex], bullets };
      return { ...prev, experience: updated };
    });
  };

  // Handlers for Projects
  const addProject = () => {
    const newProj = {
      id: Date.now().toString(),
      title: 'Full Stack App',
      techStack: 'Next.js, Node.js, PostgreSQL',
      githubUrl: 'https://github.com/user/project',
      demoUrl: 'https://project.vercel.app',
      description: 'A full stack platform empowering students to learn and collaborate.',
      bullets: ['Integrated authentication and payment flow with 99.9% uptime.']
    };
    setData(prev => ({
      ...prev,
      projects: [newProj, ...(prev.projects || [])]
    }));
  };

  const updateProject = (index, field, val) => {
    setData(prev => {
      const updated = [...(prev.projects || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index) => {
    setData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  };

  // Handlers for Education
  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      institution: 'Sarvajanik College of Engineering & Technology (SCET)',
      degree: 'B.Tech in Computer Engineering',
      field: 'Computer Engineering',
      startYear: '2022',
      endYear: '2026',
      gpa: '8.8'
    };
    setData(prev => ({
      ...prev,
      education: [...(prev.education || []), newEdu]
    }));
  };

  const updateEducation = (index, field, val) => {
    setData(prev => {
      const updated = [...(prev.education || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index) => {
    setData(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
  };

  // Handlers for Achievements
  const addAchievement = () => {
    const newAch = {
      id: Date.now().toString(),
      title: 'Hackathon Finalist / Winner',
      issuer: 'DevSpace Hackathon',
      date: '2025'
    };
    setData(prev => ({
      ...prev,
      achievements: [...(prev.achievements || []), newAch]
    }));
  };

  const updateAchievement = (index, field, val) => {
    setData(prev => {
      const updated = [...(prev.achievements || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, achievements: updated };
    });
  };

  const removeAchievement = (index) => {
    setData(prev => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index)
    }));
  };

  const navTabs = [
    { id: 'design', label: 'Design & Style', icon: Palette },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase, count: data.experience?.length },
    { id: 'projects', label: 'Projects', icon: Code, count: data.projects?.length },
    { id: 'skills', label: 'Skills', icon: Sparkles },
    { id: 'education', label: 'Education', icon: GraduationCap, count: data.education?.length },
    { id: 'devspace', label: 'DevSpace & Awards', icon: Award }
  ];

  const colorOptions = [
    { name: 'DevSpace Cyan', hex: '#06b6d4' },
    { name: 'Cyber Violet', hex: '#8b5cf6' },
    { name: 'Tech Emerald', hex: '#10b981' },
    { name: 'Ruby Rose', hex: '#f43f5e' },
    { name: 'Amber Gold', hex: '#f59e0b' },
    { name: 'Executive Slate', hex: '#334155' }
  ];

  const layoutOptions = [
    { 
      id: 'modern', 
      title: 'Modern Tech', 
      desc: '2-column developer format with skill pills, contact sidebar & timeline' 
    },
    { 
      id: 'classic', 
      title: 'Classic ATS', 
      desc: 'Single-column traditional layout optimized for corporate ATS parsers' 
    },
    { 
      id: 'developer', 
      title: 'Terminal / Code', 
      desc: 'High-tech terminal monospace look with bracketed stack tags' 
    },
    { 
      id: 'executive', 
      title: 'Executive Accent', 
      desc: 'Bold colored top header banner with structured 2-column body' 
    }
  ];

  const fontOptions = [
    { id: 'sans', title: 'Modern Sans', preview: 'Inter / System' },
    { id: 'tech', title: 'Tech Headline', preview: 'Oswald / Condensed' },
    { id: 'serif', title: 'Editorial Serif', preview: 'Playfair / Classic' },
    { id: 'mono', title: 'Engineer Monospace', preview: 'JetBrains / Code' }
  ];

  return (
    <div className="bg-card border border-border-soft rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Top Form Controls / Action Bar */}
      <div className="p-4 border-b border-border-soft flex flex-wrap items-center justify-between gap-3 bg-card-hover/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Editor Mode:</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold">
            {navTabs.find(t => t.id === activeTab)?.label}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSaveCloud && (
            <button
              type="button"
              onClick={onSaveCloud}
              disabled={isCloudSaving}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent font-semibold transition-all flex items-center gap-1.5 disabled:opacity-60"
              title="Save draft to Supabase Cloud - access it from any device"
            >
              {isCloudSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>{isCloudSaving ? 'Saving...' : 'Save to Cloud'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSyncDevSpace}
            disabled={isSyncing}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-border-soft hover:border-accent text-text hover:text-accent font-semibold transition-all flex items-center gap-1.5 bg-card"
            title="Auto-pull your DevSpace profile stats, XP, and uploaded projects"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-accent' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync DevSpace'}</span>
          </button>

          <button
            type="button"
            onClick={onLoadSampleData}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-border-soft hover:border-accent text-text-muted hover:text-text font-semibold transition-all flex items-center gap-1.5 bg-card"
            title="Load sample developer resume content to customize"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border-soft overflow-x-auto scrollbar-none bg-card">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
                isActive 
                  ? 'border-accent text-accent bg-accent/5' 
                  : 'border-transparent text-text-muted hover:text-text hover:bg-card-hover/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-accent/20 text-accent' : 'bg-border-soft text-text-muted'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Editor Content Area */}
      <div className="p-6 overflow-y-auto max-h-[calc(100vh-220px)] space-y-6">

        {/* ================================================================= */}
        {/* DESIGN & STYLE TAB */}
        {/* ================================================================= */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Layout Preset Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-accent" />
                Resume Layout Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {layoutOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSettings(s => ({ ...s, layout: opt.id }))}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      settings.layout === opt.id
                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                        : 'border-border-soft hover:border-border bg-card'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-text">{opt.title}</span>
                      {settings.layout === opt.id && (
                        <Check className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography / Font Selector */}
            <div className="space-y-3 pt-4 border-t border-border-soft">
              <label className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <Type className="w-4 h-4 text-accent" />
                Font Type / Typography
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {fontOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSettings(s => ({ ...s, fontFamily: f.id }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      settings.fontFamily === f.id
                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                        : 'border-border-soft hover:border-border bg-card'
                    }`}
                  >
                    <div className="font-bold text-xs text-text">{f.title}</div>
                    <div className="text-[10.5px] text-text-muted font-mono mt-1">{f.preview}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div className="space-y-3 pt-4 border-t border-border-soft">
              <label className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-accent" />
                Accent Color Theme
              </label>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSettings(s => ({ ...s, accentColor: c.hex }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                      settings.accentColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-accent ring-1 ring-accent bg-card-hover'
                        : 'border-border-soft hover:border-border bg-card'
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full border border-black/20" 
                      style={{ backgroundColor: c.hex }} 
                    />
                    <span className="text-xs font-medium text-text">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing & Font Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-soft">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text block mb-2">
                  Line Density & Spacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['compact', 'normal', 'relaxed'].map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, spacing: sp }))}
                      className={`py-2 text-xs font-semibold capitalize rounded-lg border transition-all ${
                        settings.spacing === sp
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border-soft text-text-muted hover:text-text'
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text block mb-2">
                  Font Size Scale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sm', label: 'Small (1-Page)' },
                    { id: 'base', label: 'Standard' },
                    { id: 'lg', label: 'Large' }
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, fontSize: sz.id }))}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        settings.fontSize === sz.id
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border-soft text-text-muted hover:text-text'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PERSONAL INFO TAB */}
        {/* ================================================================= */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={data.personal?.fullName || ''}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  placeholder="e.g. Pranav Navghare"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Professional Title *
                </label>
                <input
                  type="text"
                  value={data.personal?.title || ''}
                  onChange={(e) => handlePersonalChange('title', e.target.value)}
                  placeholder="e.g. Full Stack Developer / Software Engineer"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={data.personal?.email || ''}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  placeholder="e.g. pranav@example.com"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={data.personal?.phone || ''}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Location (City, Country)
                </label>
                <input
                  type="text"
                  value={data.personal?.location || ''}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  placeholder="e.g. Surat, Gujarat, India"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Portfolio / Website
                </label>
                <input
                  type="text"
                  value={data.personal?.website || ''}
                  onChange={(e) => handlePersonalChange('website', e.target.value)}
                  placeholder="e.g. https://pranav.dev"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={data.personal?.github || ''}
                  onChange={(e) => handlePersonalChange('github', e.target.value)}
                  placeholder="e.g. https://github.com/PranavXDragon"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={data.personal?.linkedin || ''}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  placeholder="e.g. https://linkedin.com/in/pranav"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Profile Photo Toggle */}
            <div className="pt-2 flex items-center justify-between p-3.5 bg-bg-soft rounded-xl border border-border-soft">
              <div>
                <span className="text-xs font-bold text-text block">Show Profile Avatar in Modern Layout</span>
                <span className="text-[11px] text-text-muted">Displays your Clerk profile picture in the sidebar</span>
              </div>
              <input
                type="checkbox"
                checked={!!data.personal?.showAvatar}
                onChange={(e) => handlePersonalChange('showAvatar', e.target.checked)}
                className="w-4 h-4 accent-accent cursor-pointer"
              />
            </div>

            {/* Professional Summary */}
            <div className="pt-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                Executive / Professional Summary
              </label>
              <textarea
                rows={4}
                value={data.personal?.summary || ''}
                onChange={(e) => handlePersonalChange('summary', e.target.value)}
                placeholder="Passionate Full Stack Developer with experience in React, Next.js, and cloud backends. Solved 100+ algorithmic challenges on DevSpace and passionate about building resilient products..."
                className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* WORK EXPERIENCE TAB */}
        {/* ================================================================= */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-text-muted">Add your internships, freelance projects, or full-time roles.</p>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs px-3 py-1.5 bg-accent text-bg font-bold rounded-lg flex items-center gap-1.5 hover:bg-accent/90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {(!data.experience || data.experience.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-border-soft rounded-xl text-text-muted text-xs">
                No experience entries added yet. Click &quot;Add Experience&quot; above to add your first role.
              </div>
            ) : (
              data.experience.map((exp, idx) => (
                <div key={exp.id || idx} className="p-4 bg-bg-soft rounded-xl border border-border-soft space-y-3 relative group">
                  <div className="flex justify-between items-center border-b border-border-soft pb-2">
                    <span className="text-xs font-bold font-mono text-accent">#0{idx + 1} Role</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="text-text-muted hover:text-red-400 p-1 rounded transition-colors"
                      title="Remove experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Role / Job Title</label>
                      <input
                        type="text"
                        value={exp.role || ''}
                        onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                        placeholder="e.g. Frontend Engineer Intern"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Company / Organization</label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                        placeholder="e.g. DevSpace SCET"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                        placeholder="e.g. Remote / Surat, IN"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                          placeholder="e.g. Jan 2024"
                          className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">End Date</label>
                        <input
                          type="text"
                          disabled={exp.current}
                          value={exp.current ? 'Present' : (exp.endDate || '')}
                          onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                          placeholder="e.g. Jun 2024"
                          className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`current-${idx}`}
                      checked={!!exp.current}
                      onChange={(e) => updateExperience(idx, 'current', e.target.checked)}
                      className="w-3.5 h-3.5 accent-accent cursor-pointer"
                    />
                    <label htmlFor={`current-${idx}`} className="text-xs text-text-muted cursor-pointer">
                      I currently work here
                    </label>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2 border-t border-border-soft">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-text-muted uppercase">Bullet Points & Impact</span>
                      <button
                        type="button"
                        onClick={() => addExperienceBullet(idx)}
                        className="text-[11px] text-accent font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3 h-3" /> Add Bullet
                      </button>
                    </div>

                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex gap-2 items-center">
                        <span className="text-xs text-text-muted">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateExperienceBullet(idx, bIdx, e.target.value)}
                          placeholder="Architected RESTful APIs reducing response times by 30%..."
                          className="flex-1 px-3 py-1.5 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeExperienceBullet(idx, bIdx)}
                          className="text-text-muted hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PROJECTS TAB */}
        {/* ================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-text-muted">Showcase your technical projects and hackathon submissions.</p>
              <button
                type="button"
                onClick={addProject}
                className="text-xs px-3 py-1.5 bg-accent text-bg font-bold rounded-lg flex items-center gap-1.5 hover:bg-accent/90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {(!data.projects || data.projects.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-border-soft rounded-xl text-text-muted text-xs">
                No projects added yet. Click &quot;Add Project&quot; or &quot;Sync DevSpace&quot; to auto-import your uploaded projects.
              </div>
            ) : (
              data.projects.map((proj, idx) => (
                <div key={proj.id || idx} className="p-4 bg-bg-soft rounded-xl border border-border-soft space-y-3">
                  <div className="flex justify-between items-center border-b border-border-soft pb-2">
                    <span className="text-xs font-bold font-mono text-accent">#0{idx + 1} Project</span>
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="text-text-muted hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Project Title *</label>
                      <input
                        type="text"
                        value={proj.title || ''}
                        onChange={(e) => updateProject(idx, 'title', e.target.value)}
                        placeholder="e.g. AI Code Reviewer"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Tech Stack (comma separated)</label>
                      <input
                        type="text"
                        value={proj.techStack || ''}
                        onChange={(e) => updateProject(idx, 'techStack', e.target.value)}
                        placeholder="e.g. Next.js, FastAPI, PostgreSQL, Tailwind"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">GitHub Repo URL</label>
                      <input
                        type="text"
                        value={proj.githubUrl || ''}
                        onChange={(e) => updateProject(idx, 'githubUrl', e.target.value)}
                        placeholder="e.g. https://github.com/user/project"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Live Demo URL</label>
                      <input
                        type="text"
                        value={proj.demoUrl || ''}
                        onChange={(e) => updateProject(idx, 'demoUrl', e.target.value)}
                        placeholder="e.g. https://project.dev"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Brief Description</label>
                    <textarea
                      rows={2}
                      value={proj.description || ''}
                      onChange={(e) => updateProject(idx, 'description', e.target.value)}
                      placeholder="High-performance code analysis engine that scans git diffs for memory leaks..."
                      className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* SKILLS TAB */}
        {/* ================================================================= */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">Enter comma-separated skills for each category. They will automatically format as crisp tags.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
                  Programming Languages
                </label>
                <input
                  type="text"
                  value={data.skills?.languages || ''}
                  onChange={(e) => handleSkillsChange('languages', e.target.value)}
                  placeholder="JavaScript, TypeScript, Python, C++, Go, SQL"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
                  Frameworks & Libraries
                </label>
                <input
                  type="text"
                  value={data.skills?.frameworks || ''}
                  onChange={(e) => handleSkillsChange('frameworks', e.target.value)}
                  placeholder="React, Next.js, Node.js, Express, Tailwind CSS, Redux, FastAPI"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
                  Developer Tools & DevOps
                </label>
                <input
                  type="text"
                  value={data.skills?.tools || ''}
                  onChange={(e) => handleSkillsChange('tools', e.target.value)}
                  placeholder="Git, GitHub, Docker, Linux, Postman, Vercel, Supabase, Jest"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
                  Databases & Storage
                </label>
                <input
                  type="text"
                  value={data.skills?.databases || ''}
                  onChange={(e) => handleSkillsChange('databases', e.target.value)}
                  placeholder="PostgreSQL, MongoDB, MySQL, Redis, Firebase"
                  className="w-full px-3.5 py-2.5 bg-bg-soft border border-border-soft rounded-xl text-text text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* EDUCATION TAB */}
        {/* ================================================================= */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-text-muted">Add your university, college, or academic background.</p>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs px-3 py-1.5 bg-accent text-bg font-bold rounded-lg flex items-center gap-1.5 hover:bg-accent/90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            {(!data.education || data.education.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-border-soft rounded-xl text-text-muted text-xs">
                No education added yet. Click &quot;Add Education&quot; to include your college or degree.
              </div>
            ) : (
              data.education.map((edu, idx) => (
                <div key={edu.id || idx} className="p-4 bg-bg-soft rounded-xl border border-border-soft space-y-3">
                  <div className="flex justify-between items-center border-b border-border-soft pb-2">
                    <span className="text-xs font-bold font-mono text-accent">#0{idx + 1} Degree</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-text-muted hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Institution / University</label>
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                        placeholder="e.g. SCET Surat"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Degree / Course</label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        placeholder="e.g. B.Tech in Computer Engineering"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.startYear || ''}
                          onChange={(e) => updateEducation(idx, 'startYear', e.target.value)}
                          placeholder="e.g. 2022"
                          className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.endYear || ''}
                          onChange={(e) => updateEducation(idx, 'endYear', e.target.value)}
                          placeholder="e.g. 2026"
                          className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">CGPA / Percentage</label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => updateEducation(idx, 'gpa', e.target.value)}
                        placeholder="e.g. 8.75 / 10"
                        className="w-full px-3 py-2 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* DEVSPACE & AWARDS TAB */}
        {/* ================================================================= */}
        {activeTab === 'devspace' && (
          <div className="space-y-5">
            {/* DevSpace Stats Toggle */}
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-text flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" /> Include DevSpace Verified Stats
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Embed verified XP, algorithmic problems solved, and DevSpace platform achievements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={!!data.devspaceStats?.showStats}
                  onChange={(e) => {
                    setData(prev => ({
                      ...prev,
                      devspaceStats: { ...prev.devspaceStats, showStats: e.target.checked }
                    }));
                  }}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>

              {data.devspaceStats?.showStats && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-accent/20">
                  <div>
                    <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Total XP Earned</label>
                    <input
                      type="number"
                      value={data.devspaceStats?.xp ?? 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setData(prev => ({
                          ...prev,
                          devspaceStats: { ...prev.devspaceStats, xp: val }
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-card border border-border-soft rounded-lg text-xs text-text font-mono focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-text-muted uppercase block mb-1">Problems Solved</label>
                    <input
                      type="number"
                      value={data.devspaceStats?.problemsSolved ?? 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setData(prev => ({
                          ...prev,
                          devspaceStats: { ...prev.devspaceStats, problemsSolved: val }
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-card border border-border-soft rounded-lg text-xs text-text font-mono focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Custom Achievements & Honors */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-text">
                  Certifications & Honors
                </span>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="text-xs px-2.5 py-1 bg-card hover:bg-card-hover border border-border-soft text-text font-bold rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-accent" /> Add Award
                </button>
              </div>

              {(data.achievements || []).map((ach, idx) => (
                <div key={ach.id || idx} className="p-3 bg-bg-soft rounded-xl border border-border-soft flex items-center gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                    <input
                      type="text"
                      value={ach.title || ''}
                      onChange={(e) => updateAchievement(idx, 'title', e.target.value)}
                      placeholder="e.g. Smart India Hackathon Finalist"
                      className="px-2.5 py-1.5 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                    />
                    <input
                      type="text"
                      value={ach.issuer || ''}
                      onChange={(e) => updateAchievement(idx, 'issuer', e.target.value)}
                      placeholder="e.g. Ministry of Education"
                      className="px-2.5 py-1.5 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                    />
                    <input
                      type="text"
                      value={ach.date || ''}
                      onChange={(e) => updateAchievement(idx, 'date', e.target.value)}
                      placeholder="e.g. Nov 2024"
                      className="px-2.5 py-1.5 bg-card border border-border-soft rounded-lg text-xs text-text focus:border-accent focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="text-text-muted hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
