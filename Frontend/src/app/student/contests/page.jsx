'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { Trophy, CalendarDays, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const CONTESTS_CACHE_KEY = 'devspace_contests_cache';

export default function ContestsPage() {
  const [contests, setContests] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(CONTESTS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(CONTESTS_CACHE_KEY);
        if (cached) return false;
      } catch (e) {}
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchContests = async (silent = false) => {
    if (!silent) {
      if (contests.length === 0) setLoading(true);
      else setIsRefreshing(true);
    }
    try {
      const res = await axiosInstance.get('/challenges/contests/list');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setContests(list);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(CONTESTS_CACHE_KEY, JSON.stringify(list));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to fetch contests', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // SWR pattern: If cache exists, silently revalidate; otherwise fetch and show skeleton
    fetchContests(contests.length > 0);
  }, []);

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 shrink-0" />
            Coding Contests
          </h1>
          <p className='text-text-muted mt-1 sm:mt-2 text-sm sm:text-base'>Compete with peers in timed coding battles.</p>
        </div>

        <button
          type="button"
          onClick={() => fetchContests(false)}
          disabled={isRefreshing || loading}
          className="self-end sm:self-auto p-2.5 rounded-xl border border-border-soft hover:border-yellow-500/40 text-text-muted hover:text-yellow-400 bg-card transition-all disabled:opacity-50"
          title="Refresh Contests"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-yellow-400' : ''}`} />
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {loading ? (
          // Shimmer Skeleton Loader (Instant feedback, no jarring plain text)
          [1, 2, 3, 4].map((i) => (
            <div key={i} className='bg-card border border-border-soft rounded-xl p-5 sm:p-6 space-y-4 skeleton-shimmer'>
              <div className="w-3/5 h-6 bg-card-hover rounded-md" />
              <div className="w-4/5 h-4 bg-card-hover rounded" />
              <div className="space-y-2.5 pt-2">
                <div className="w-1/2 h-4 bg-card-hover rounded" />
                <div className="w-2/5 h-4 bg-card-hover rounded" />
              </div>
              <div className="w-full h-11 bg-card-hover rounded-lg mt-4" />
            </div>
          ))
        ) : contests.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border-soft">
            <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text">No active contests</h3>
            <p className="text-text-muted mt-2">Check back later for upcoming competitive events!</p>
          </div>
        ) : (
          contests.map((c) => (
            <div key={c.id} className='bg-card border border-border-soft rounded-xl p-5 sm:p-6 hover:border-yellow-500/50 transition-colors flex flex-col justify-between'>
              <div>
                <h2 className='text-lg sm:text-xl font-bold text-text mb-2 break-words'>{c.title}</h2>
                <p className='text-sm text-text-muted mb-6'>{c.description}</p>
                
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-text">
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted shrink-0" />
                    <span className="truncate">Starts: {new Date(c.start_time).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted shrink-0" />
                    <span>Duration: {c.duration_minutes ? `${c.duration_minutes} minutes` : 'Flexible'}</span>
                  </div>
                </div>
              </div>
              
              <Link 
                href={`/student/contests/${c.id}`}
                className='w-full py-2.5 sm:py-3 bg-yellow-500/10 text-yellow-500 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-500 hover:text-white transition-colors text-sm sm:text-base mt-2'
              >
                View Contest
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
