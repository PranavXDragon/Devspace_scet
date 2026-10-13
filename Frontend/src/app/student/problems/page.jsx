
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
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Code2 className="w-8 h-8 text-accent" />
          Coding Problems
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchProblems(false)}
            disabled={isRefreshing || loading}
            className="p-2 rounded-lg border border-border-soft hover:border-accent/40 text-text-muted hover:text-accent bg-card transition-all disabled:opacity-50"
            title="Refresh Problems"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          </button>
          <Link href='/student/ide' className='px-4 py-2 bg-accent text-bg font-semibold rounded-lg hover:bg-accent/90 transition-all'>
            Open Free IDE
          </Link>
        </div>
      </div>

      <div className='bg-card rounded-lg overflow-hidden border border-border-soft'>
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
                  <td className="px-6 py-4">
                    <div className="w-48 h-5 bg-card-hover rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-5 bg-card-hover rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-8 bg-card-hover rounded-lg" />
                  </td>
                </tr>
              ))
            ) : problems.length === 0 ? (
              <tr><td colSpan='3' className='px-6 py-4 text-center'>No problems found. Start by adding some in the database!</td></tr>
            ) : (
              problems.map((p) => (
                <tr key={p.id} className='hover:bg-card-hover/50 transition-colors'>
                  <td className='px-6 py-4 font-medium'>{p.title}</td>
                  <td className='px-6 py-4'>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <Link href={`/student/ide?problem=${p.id}`} className='text-primary hover:underline font-semibold'>
                      Solve
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
