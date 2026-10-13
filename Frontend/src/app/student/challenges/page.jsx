'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/services/axiosInstance';
import { Flame, Clock, Code2, ArrowRight, RefreshCw } from 'lucide-react';

const CHALLENGES_CACHE_KEY = 'devspace_challenges_cache';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(CHALLENGES_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(CHALLENGES_CACHE_KEY);
        if (cached) return false;
      } catch (e) {}
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChallenges = async (silent = false) => {
    if (!silent) {
      if (challenges.length === 0) setLoading(true);
      else setIsRefreshing(true);
    }
    try {
      const res = await axiosInstance.get('/challenges');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setChallenges(list);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(CHALLENGES_CACHE_KEY, JSON.stringify(list));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to fetch challenges', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChallenges(challenges.length > 0);
  }, []);

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Flame className="w-8 h-8 text-orange-500" />
            Coding Challenges
          </h1>
          <p className='text-text-muted mt-2'>Complete daily and weekly challenges to earn points and climb the leaderboard.</p>
        </div>

        <button
          type="button"
          onClick={() => fetchChallenges(false)}
          disabled={isRefreshing || loading}
          className="p-2.5 rounded-xl border border-border-soft hover:border-orange-500/40 text-text-muted hover:text-orange-400 bg-card transition-all disabled:opacity-50"
          title="Refresh Challenges"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {loading ? (
          // Shimmer Skeleton Loader
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className='bg-card border border-border-soft rounded-xl p-6 space-y-4 skeleton-shimmer flex flex-col justify-between h-56'>
              <div className="flex justify-between items-center">
                <div className="w-20 h-5 bg-card-hover rounded-full" />
                <div className="w-16 h-5 bg-card-hover rounded" />
              </div>
              <div className="space-y-2">
                <div className="w-4/5 h-6 bg-card-hover rounded" />
                <div className="w-full h-10 bg-card-hover rounded" />
              </div>
              <div className="w-full h-10 bg-card-hover rounded-lg" />
            </div>
          ))
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border-soft">
            <Flame className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text">No active challenges right now</h3>
            <p className="text-text-muted mt-2">Check back later for new daily challenges!</p>
          </div>
        ) : (
          challenges.map((c) => (
            <div key={c.id} className='bg-card border border-border-soft rounded-xl p-6 hover:border-accent/50 transition-colors flex flex-col'>
              <div className='flex items-center justify-between mb-4'>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${c.type === 'daily' ? 'bg-orange-500/10 text-orange-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {c.type}
                </span>
                <span className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                  <Flame className="w-4 h-4" /> +{c.reward_points} pts
                </span>
              </div>
              
              <h2 className='text-xl font-bold text-text mb-2'>{c.title}</h2>
              <p className='text-sm text-text-muted mb-6 flex-1'>{c.description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Problem:</span>
                  <span className="font-medium text-text">{c.coding_problems?.title}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Difficulty:</span>
                  <span className={`font-semibold ${
                    c.coding_problems?.difficulty === 'Easy' ? 'text-green-500' :
                    c.coding_problems?.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {c.coding_problems?.difficulty}
                  </span>
                </div>
                
                <Link 
                  href={`/student/ide?challengeId=${c.id}&problemId=${c.problem_id}`}
                  className='w-full py-3 bg-accent/10 text-accent font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-colors mt-4'
                >
                  <Code2 className="w-4 h-4" />
                  Solve Challenge
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
