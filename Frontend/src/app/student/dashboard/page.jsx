"use client";
import { useStudentDashboard } from '../StudentDashboardContext';
import { useUser } from '@clerk/nextjs';
import { Flame, Trophy, Calendar, CheckCircle2, ArrowRight, Play, BookOpen, Clock, Activity, Sparkles, Compass } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function StudentDashboard() {
  const { dashboardData: data } = useStudentDashboard();
  const { user } = useUser();

  // Dynamic real stats for the logged-in student
  const stats = data?.stats || {};
  const xp = stats.xp ?? 0;
  const level = stats.level ?? 1;
  const xpNext = stats.xpNext ?? 250;
  const streak = stats.streak ?? 0;
  const problemsSolved = stats.problemsSolved ?? 0;
  
  const xpPercentage = Math.min(100, Math.round(((xp % 250) / 250) * 100));

  // Resolved student name
  const fullName = data?.profile?.name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "Developer";
  const firstName = fullName.split(' ')[0] || "Developer";

  // Dynamic Upcoming Events
  const events = data?.upcomingEvents || [];

  // Dynamic Challenge / Focus
  const todaysChallenge = data?.todaysChallenge;

  // Dynamic Learning Roadmaps
  const learningCourses = data?.learningCourses || [];

  // Real 16-week Activity Grid (112 days)
  const activityDatesSet = useMemo(() => {
    return new Set(data?.activityDates || []);
  }, [data?.activityDates]);

  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    // 16 weeks * 7 days = 112 days
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const isActive = activityDatesSet.has(iso);
      days.push({
        date: iso,
        isActive,
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }
    return days;
  }, [activityDatesSet]);

  // Format event date
  const formatEventDate = (dateStr) => {
    if (!dateStr) return { month: 'DEV', day: 'DS', time: 'TBA' };
    try {
      const d = new Date(dateStr);
      return {
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        day: d.toLocaleDateString('en-IN', { day: 'numeric' }),
        time: d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      };
    } catch (e) {
      return { month: 'EVENT', day: '•', time: 'Upcoming' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Good Morning, {firstName} 👋</h1>
          <p className="text-text-muted mt-1 sm:mt-2 text-base sm:text-lg">
            {streak > 0 
              ? `Keep your ${streak}-day streak alive! 🔥` 
              : "Check into campus sessions or solve challenges to build your streak! 🚀"}
          </p>
        </div>
        
        {/* Quick Level Info */}
        <div className="flex items-center gap-4 bg-card px-4 sm:px-5 py-3 rounded-2xl border border-border w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Level {level}</span>
              <span className="text-[10px] text-accent font-mono">{xp} XP</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 sm:w-36 h-2 bg-bg rounded-full overflow-hidden flex-1 sm:flex-initial border border-border-soft/40">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(5, xpPercentage)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-text-muted font-mono">{xpNext} XP next</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/student/problems" className="block">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-accent/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">Problems Solved</p>
              <p className="text-3xl font-bold text-text">{problemsSolved}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <Link href="/student/attendance" className="block">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-[var(--color-warning)]/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">Current Streak</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-text">{streak}</p>
                <p className="text-sm font-medium text-[var(--color-warning)]">Days</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center text-[var(--color-warning)] group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between group transition-colors">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">Total XP</p>
            <p className="text-3xl font-bold text-text">{xp.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Focus */}
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
              <Play className="w-5 h-5 text-accent" />
              Today's Focus
            </h2>
            
            {todaysChallenge ? (
              <div className="bg-bg rounded-xl p-5 border border-border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold px-2 py-1 bg-warning/10 text-warning rounded uppercase tracking-wider mb-2 inline-block">
                    Daily Challenge
                  </span>
                  <h3 className="text-xl font-bold text-text">{todaysChallenge.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-accent" /> 
                      {todaysChallenge.difficulty || 'Medium'}
                    </span>
                    <span className="flex items-center gap-1 text-accent">
                      <Trophy className="w-4 h-4" /> 
                      +{todaysChallenge.reward_points || 50} XP
                    </span>
                  </div>
                </div>
                <Link
                  href={todaysChallenge.type === 'question' ? `/student/ide?problem=${todaysChallenge.id}` : `/student/challenges`}
                  className="px-6 py-3 bg-accent text-[#0b0f17] font-bold rounded-lg hover:bg-accent/90 transition-colors shrink-0 text-center text-sm"
                >
                  Solve Now →
                </Link>
              </div>
            ) : (
              <div className="bg-bg rounded-xl p-5 border border-border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold px-2 py-1 bg-accent/10 text-accent rounded uppercase tracking-wider mb-2 inline-block">
                    Coding Practice
                  </span>
                  <h3 className="text-xl font-bold text-text">Practice DSA & Web Development</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Solve real problems, submit solutions, and climb the DevSpace leaderboard.
                  </p>
                </div>
                <Link 
                  href="/student/problems" 
                  className="px-6 py-3 bg-accent text-[#0b0f17] font-bold rounded-lg hover:bg-accent/90 transition-colors shrink-0 text-center text-sm"
                >
                  Browse Problems →
                </Link>
              </div>
            )}
          </div>

          {/* Continue Learning */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Continue Learning
              </h2>
              <Link href="/student/learn" className="text-sm font-medium text-accent hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {learningCourses.length > 0 ? (
                learningCourses.map((c, idx) => (
                  <Link key={c.id || idx} href="/student/learn" className="block">
                    <div className="group border border-border-soft hover:border-accent/40 rounded-xl p-4 transition-colors cursor-pointer bg-bg/50 hover:bg-card-hover">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-text group-hover:text-accent transition-colors">
                            {c.title || c.name || "Software Engineering Track"}
                          </h3>
                          <p className="text-sm text-text-muted mt-1">
                            {c.description || "Structured roadmap with milestones and practice exercises."}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-accent">Active</span>
                      </div>
                      <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-border-soft/40">
                        <div className="h-full bg-accent rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <Link href="/student/learn" className="block">
                  <div className="group border border-dashed border-border-soft hover:border-accent/40 rounded-xl p-5 transition-colors cursor-pointer text-center bg-bg/30">
                    <Compass className="w-8 h-8 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-text text-sm">Explore DevSpace Learning Roadmaps</h3>
                    <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                      Follow step-by-step developer paths in Full-Stack, Python, and Systems Engineering.
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:underline">
                      Open Learning Hub <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Coding & Campus Activity Heatmap (Real Dynamic) */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">Activity Heatmap</h2>
              <span className="text-xs text-text-muted font-mono">
                {activityDatesSet.size} active {activityDatesSet.size === 1 ? 'day' : 'days'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {heatmapDays.map((day) => (
                <div
                  key={day.date}
                  className={`w-3.5 h-3.5 rounded-sm transition-all ${
                    day.isActive
                      ? "bg-accent shadow-[0_0_6px_rgba(46,197,212,0.5)]"
                      : "bg-bg border border-border-soft/60"
                  }`}
                  title={`${day.label}: ${day.isActive ? 'Active (attendance / code)' : 'No recorded activity'}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-text-muted">
              <span className="text-[11px]">Real history from classroom attendance & problem submissions</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-3.5 h-3.5 bg-bg border border-border-soft/60 rounded-sm"></div>
                <div className="w-3.5 h-3.5 bg-accent/40 rounded-sm"></div>
                <div className="w-3.5 h-3.5 bg-accent rounded-sm shadow-[0_0_6px_rgba(46,197,212,0.5)]"></div>
                <span>More</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Upcoming Events */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Upcoming Events
              </h2>
            </div>
            
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((ev, idx) => {
                  const evDate = formatEventDate(ev.date || ev.date_time);
                  return (
                    <Link key={ev.id || idx} href="/student/events" className="block">
                      <div className="border border-border-soft rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer group bg-bg/40">
                        <div className="flex items-start gap-4">
                          <div className="bg-bg rounded-lg p-2 text-center min-w-[3rem] group-hover:bg-accent/10 transition-colors border border-border-soft/40">
                            <p className="text-xs font-bold text-accent uppercase">{evDate.month}</p>
                            <p className="text-lg font-bold text-text">{evDate.day}</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-text group-hover:text-accent transition-colors">
                              {ev.eventName || ev.title || "Club Workshop"}
                            </h3>
                            <p className="text-sm text-text-muted mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {evDate.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-bg/40 rounded-xl border border-dashed border-border-soft p-4">
                  <Calendar className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-text">No Upcoming Events Scheduled</p>
                  <p className="text-[11px] text-text-muted mt-1">
                    Check back soon for upcoming workshops, hackathons, and webinars.
                  </p>
                </div>
              )}
            </div>
            <Link 
              href="/student/events" 
              className="w-full mt-4 py-2.5 text-sm font-medium text-text bg-bg hover:bg-card-hover rounded-lg transition-colors border border-border-soft block text-center"
            >
              View Calendar
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

