'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { Medal, Trophy, Award, Search, Filter } from 'lucide-react';

const LEADERBOARD_CACHE_PREFIX = 'devspace_leaderboard_cache_';

export default function LeaderboardPage() {
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');

  const cacheKey = `${LEADERBOARD_CACHE_PREFIX}${filterCourse}_${filterBatch}`;

  const [leaderboard, setLeaderboard] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(`${LEADERBOARD_CACHE_PREFIX}ALL_ALL`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return !sessionStorage.getItem(`${LEADERBOARD_CACHE_PREFIX}ALL_ALL`);
      } catch (e) {}
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Assume we have these options or fetch them from backend
  const courses = ['ALL', 'B.Tech', 'BCA', 'MCA', 'B.Sc'];
  const batches = ['ALL', '2024', '2025', '2026', '2027'];

  const fetchLeaderboard = async (silent = false) => {
    if (!silent) {
      if (leaderboard.length === 0) setLoading(true);
      else setIsRefreshing(true);
    }
    try {
      const res = await axiosInstance.get(`/leaderboard?course=${filterCourse}&batch=${filterBatch}`);
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setLeaderboard(list);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(list));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if current filter combo is already in cache
    let cachedList = null;
    if (typeof window !== 'undefined') {
      try {
        const item = sessionStorage.getItem(cacheKey);
        if (item) cachedList = JSON.parse(item);
      } catch (e) {}
    }

    if (cachedList) {
      setLeaderboard(cachedList);
      setLoading(false);
      fetchLeaderboard(true);
    } else {
      fetchLeaderboard(false);
    }
  }, [filterCourse, filterBatch]);

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Trophy className="w-8 h-8 text-yellow-500" />
            Global Leaderboard
          </h1>
          <p className='text-text-muted mt-2'>See how you rank among your peers in DevSpace.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-card border border-border-soft rounded-lg px-3 py-2 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-text-muted" />
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-transparent text-sm text-text outline-none w-full"
            >
              <option value="ALL">All Courses</option>
              {courses.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-card border border-border-soft rounded-lg px-3 py-2 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-text-muted" />
            <select 
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="bg-transparent text-sm text-text outline-none w-full"
            >
              <option value="ALL">All Batches</option>
              {batches.filter(b => b !== 'ALL').map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className='bg-card rounded-xl border border-border-soft overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead className='bg-card-hover text-text-muted text-sm uppercase tracking-wider'>
            <tr>
              <th className='px-6 py-4 font-semibold'>Rank</th>
              <th className='px-6 py-4 font-semibold'>Student</th>
              <th className='px-6 py-4 font-semibold hidden md:table-cell'>Course / Batch</th>
              <th className='px-6 py-4 font-semibold'>Tier</th>
              <th className='px-6 py-4 font-semibold text-right'>Points</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border-soft'>
            {loading ? (
              // Shimmer Skeleton Rows
              [1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="skeleton-shimmer">
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-card-hover" />
                  </td>
                  <td className="px-6 py-4 space-y-1.5">
                    <div className="w-36 h-4 bg-card-hover rounded" />
                    <div className="w-48 h-3 bg-card-hover rounded" />
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="w-24 h-4 bg-card-hover rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-5 bg-card-hover rounded-full" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="w-12 h-5 bg-card-hover rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : leaderboard.length === 0 ? (
              <tr><td colSpan='5' className='px-6 py-8 text-center text-text-muted'>No students found for this criteria</td></tr>
            ) : (
              leaderboard.map((student, idx) => (
                <tr key={student.student_id} className='hover:bg-card-hover/50 transition-colors group'>
                  <td className='px-6 py-4'>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      idx === 1 ? 'bg-gray-300/20 text-gray-300' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-700' :
                      'bg-bg text-text-muted'
                    }`}>
                      #{idx + 1}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div>
                      <p className='font-bold text-text'>{student.name}</p>
                      <p className='text-xs text-text-muted'>{student.email}</p>
                    </div>
                  </td>
                  <td className='px-6 py-4 hidden md:table-cell text-sm text-text-muted'>
                    {student.course} - {student.batch}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      student.rank_tier === 'Gold' ? 'bg-yellow-500/10 text-yellow-500' :
                      student.rank_tier === 'Silver' ? 'bg-gray-300/10 text-gray-300' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      {student.rank_tier || 'Bronze'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className="font-bold text-text flex items-center justify-end gap-1">
                      {student.total_points} <Flame className="w-4 h-4 text-orange-500" />
                    </div>
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
