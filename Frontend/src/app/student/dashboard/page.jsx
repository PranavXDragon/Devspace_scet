"use client";
import { useStudentDashboard } from '../StudentDashboardContext';
import { Flame, Trophy, Calendar, CheckCircle2, ArrowRight, Play, BookOpen, Clock, Activity } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { dashboardData: data } = useStudentDashboard();

  // Mock data for Phase 1
  const xp = 4820;
  const xpNext = 5000;
  const level = 12;
  const streak = 14;
  const problemsSolved = 127;
  
  const xpPercentage = Math.round((xp / xpNext) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Good Morning, {data.profile?.name?.split(' ')[0] || "Pranav"} 👋</h1>
          <p className="text-text-muted mt-2 text-lg">Keep your {streak}-day streak alive! 🔥</p>
        </div>
        
        {/* Quick Level Info */}
        <div className="flex items-center gap-4 bg-card px-5 py-3 rounded-2xl border border-border">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Level {level}</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-bg rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${xpPercentage}%` }}></div>
              </div>
              <span className="text-sm font-semibold text-text">{xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-accent/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">Problems Solved</p>
            <p className="text-3xl font-bold text-text">{problemsSolved}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

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

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-[var(--color-success)]/50 transition-colors">
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
            
            <div className="bg-bg rounded-xl p-5 border border-border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold px-2 py-1 bg-warning/10 text-warning rounded text-orange-500 uppercase tracking-wider mb-2 inline-block">Daily Challenge</span>
                <h3 className="text-xl font-bold text-text">Graph Traversal (BFS)</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                  <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> Medium</span>
                  <span className="flex items-center gap-1 text-accent"><Trophy className="w-4 h-4" /> +50 XP</span>
                </div>
              </div>
              <button className="px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors shrink-0">
                Solve Now →
              </button>
            </div>
          </div>

          {/* Continue Learning */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Continue Learning
              </h2>
              <Link href="#" className="text-sm font-medium text-accent hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              <div className="group border border-border-soft hover:border-border rounded-xl p-4 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-text">Mastering Python</h3>
                    <p className="text-sm text-text-muted mt-1">18 / 23 lessons completed</p>
                  </div>
                  <span className="text-sm font-bold text-text">78%</span>
                </div>
                <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Coding Activity Heatmap (Mock) */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold text-text mb-6">Coding Activity</h2>
            <div className="flex flex-wrap gap-1">
              {[...Array(120)].map((_, i) => {
                const activityLevel = Math.random();
                let colorClass = "bg-bg"; // 0
                if (activityLevel > 0.9) colorClass = "bg-accent"; // 4
                else if (activityLevel > 0.7) colorClass = "bg-accent/80"; // 3
                else if (activityLevel > 0.4) colorClass = "bg-accent/50"; // 2
                else if (activityLevel > 0.2) colorClass = "bg-accent/30"; // 1

                return (
                  <div key={i} className={`w-3 h-3 rounded-sm ${colorClass}`} title="Mock contribution"></div>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-text-muted">
              <span>Less</span>
              <div className="w-3 h-3 bg-bg rounded-sm"></div>
              <div className="w-3 h-3 bg-accent/30 rounded-sm"></div>
              <div className="w-3 h-3 bg-accent/50 rounded-sm"></div>
              <div className="w-3 h-3 bg-accent/80 rounded-sm"></div>
              <div className="w-3 h-3 bg-accent rounded-sm"></div>
              <span>More</span>
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
              <div className="border border-border-soft rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="bg-bg rounded-lg p-2 text-center min-w-[3rem] group-hover:bg-accent/10 transition-colors">
                    <p className="text-xs font-bold text-accent uppercase">Sep</p>
                    <p className="text-lg font-bold text-text">15</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-text">AI & ML Workshop</h3>
                    <p className="text-sm text-text-muted mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 10:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="border border-border-soft rounded-xl p-4 hover:border-accent/50 transition-colors cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="bg-bg rounded-lg p-2 text-center min-w-[3rem] group-hover:bg-accent/10 transition-colors">
                    <p className="text-xs font-bold text-accent uppercase">Sep</p>
                    <p className="text-lg font-bold text-text">18</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-text">DevSpace Weekly #12</h3>
                    <p className="text-sm text-text-muted mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2.5 text-sm font-medium text-text bg-bg hover:bg-card-hover rounded-lg transition-colors border border-border-soft">
              View Calendar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
