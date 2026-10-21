
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/services/axiosInstance';
import { Code2, RefreshCw } from 'lucide-react';

const PROBLEMS_CACHE_KEY = 'devspace_problems_cache';

export default function ProblemsPage() {
  const [problems, setProblems] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(PROBLEMS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(PROBLEMS_CACHE_KEY);
        if (cached) return false;
      } catch (e) {}
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProblems = async (silent = false) => {
    if (!silent) {
      if (problems.length === 0) setLoading(true);
      else setIsRefreshing(true);
    }
    try {
      const res = await axiosInstance.get('/coding/problems');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setProblems(list);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(PROBLEMS_CACHE_KEY, JSON.stringify(list));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProblems(problems.length > 0);
  }, []);

  return (
    <div className='p-3 sm:p-6 max-w-6xl mx-auto'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Code2 className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
          Coding Problems
        </h1>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => fetchProblems(false)}
            disabled={isRefreshing || loading}
            className="p-2 rounded-lg border border-border-soft hover:border-accent/40 text-text-muted hover:text-accent bg-card transition-all disabled:opacity-50"
            title="Refresh Problems"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          </button>
          <Link href='/student/ide' className='px-4 py-2 bg-accent text-bg font-semibold rounded-lg hover:bg-accent/90 transition-all text-xs sm:text-sm'>
            Open Free IDE
          </Link>
        </div>
      </div>

      <div className='bg-card rounded-lg overflow-x-auto border border-border-soft'>
        <table className='w-full text-left'>
          <thead className='bg-card-hover text-text-muted'>
            <tr>
              <th className='px-6 py-3 font-semibold'>Title</th>
              <th className='px-6 py-3 font-semibold'>Difficulty</th>
              <th className='px-6 py-3 font-semibold'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border-soft text-text'>
            {loading ? (
              // Shimmer Skeleton Table Rows
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="skeleton-shimmer">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="w-48 h-5 bg-card-hover rounded" />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="w-16 h-5 bg-card-hover rounded-full" />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="w-20 h-8 bg-card-hover rounded-lg" />
                  </td>
                </tr>
              ))
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={3} className='px-6 py-12 text-center text-text-muted'>
                  <Code2 className="w-10 h-10 mx-auto mb-2 text-text-muted/60" />
                  <p className="font-medium text-text">No problems available yet.</p>
                  <p className="text-xs text-text-muted mt-1">Check back soon or open the IDE to practice custom code.</p>
                </td>
              </tr>
            ) : (
              problems.map((p) => (
                <tr key={p.id} className='hover:bg-card-hover/40 transition-colors'>
                  <td className='px-4 sm:px-6 py-4 font-semibold text-text text-sm sm:text-base'>
                    {p.title}
                  </td>
                  <td className='px-4 sm:px-6 py-4'>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      p.difficulty === 'Easy' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      p.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {p.difficulty || 'Medium'}
                    </span>
                  </td>
                  <td className='px-4 sm:px-6 py-4'>
                    <Link
                      href={`/student/ide?problem=${p.id}`}
                      className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 hover:bg-accent text-accent hover:text-bg font-semibold text-xs sm:text-sm transition-all border border-accent/30 hover:border-accent'
                    >
                      <span>Solve</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
