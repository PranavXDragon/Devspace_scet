'use client';
import { useState, useEffect } from 'react';
import { Activity, Target, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';
import { useStudentDashboard } from '../StudentDashboardContext';

const ANALYTICS_CACHE_KEY = 'devspace_analytics_cache';

export default function AnalyticsPage() {
  const { user } = useUser();
  const { dashboardData } = useStudentDashboard();
  const studentId = dashboardData?.profile?.id || user?.publicMetadata?.studentId || user?.id;

  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(`${ANALYTICS_CACHE_KEY}_${studentId || 'default'}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(`${ANALYTICS_CACHE_KEY}_${studentId || 'default'}`);
        if (cached) return false;
      } catch (e) {}
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async (silent = false) => {
    if (!silent) {
      if (!data) setLoading(true);
      else setIsRefreshing(true);
    }
    try {
      const url = studentId 
        ? `/progress/analytics?student_id=${studentId}` 
        : `/progress/analytics`;
      const res = await axiosInstance.get(url);
      const payload = res.data?.data || res.data;
      setData(payload);
      if (typeof window !== 'undefined' && payload) {
        try {
          sessionStorage.setItem(`${ANALYTICS_CACHE_KEY}_${studentId || 'default'}`, JSON.stringify(payload));
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(Boolean(data));
  }, [studentId]);

  if (loading && !data) {
    return (
      <div className='max-w-6xl mx-auto space-y-8'>
        <div className="space-y-2">
          <div className="w-48 h-8 bg-card rounded-lg skeleton-shimmer" />
          <div className="w-72 h-4 bg-card rounded skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border-soft rounded-xl p-8 space-y-4 skeleton-shimmer flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-card-hover" />
            <div className="w-24 h-8 bg-card-hover rounded" />
            <div className="w-32 h-4 bg-card-hover rounded" />
          </div>
          <div className="bg-card border border-border-soft rounded-xl p-8 space-y-4 skeleton-shimmer flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-card-hover" />
            <div className="w-24 h-8 bg-card-hover rounded" />
            <div className="w-32 h-4 bg-card-hover rounded" />
          </div>
        </div>
        <div className="bg-card border border-border-soft rounded-xl p-6 h-64 skeleton-shimmer" />
      </div>
    );
  }

  const maxProblems = Math.max(...(data?.chart_data?.map(d => d.problems) || [1]));

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Activity className="w-8 h-8 text-blue-500" /> My Progress
        </h1>
        <p className='text-text-muted mt-2'>Track your learning journey and problem-solving activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KPI Cards */}
        <div className="bg-card border border-border-soft rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-4xl font-black font-headline text-text mb-1">{data?.total_problems_solved || 0}</h3>
          <p className="text-text-muted uppercase tracking-widest text-xs font-bold">Problems Solved</p>
        </div>

        <div className="bg-card border border-border-soft rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-4xl font-black font-headline text-text mb-1">{data?.total_points || 0}</h3>
          <p className="text-text-muted uppercase tracking-widest text-xs font-bold">Total XP Earned</p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-card border border-border-soft rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-text mb-8 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" /> Activity (Last 6 Months)
        </h3>
        
        <div className="h-64 flex items-end justify-between gap-2">
          {data?.chart_data?.map((month, i) => {
            const height = maxProblems > 0 ? (month.problems / maxProblems) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full relative flex-1 flex items-end justify-center rounded bg-card-hover group-hover:bg-card-hover/50 transition-colors">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500 ease-out" 
                    style={{ height: `${height}%`, minHeight: month.problems > 0 ? '4px' : '0' }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-text text-bg text-xs font-bold px-2 py-1 rounded transition-opacity">
                      {month.problems}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-text-muted uppercase">{month.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
