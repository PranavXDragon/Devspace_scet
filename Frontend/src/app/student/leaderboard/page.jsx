'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { Medal, Trophy, Award, Search, Filter } from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  
  // Assume we have these options or fetch them from backend
  const courses = ['ALL', 'B.Tech', 'BCA', 'MCA', 'B.Sc'];
  const batches = ['ALL', '2024', '2025', '2026', '2027'];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/leaderboard?course=${filterCourse}&batch=${filterBatch}`);
        setLeaderboard(res.data || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
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
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border-soft rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-transparent text-sm text-text outline-none"
            >
              <option value="ALL">All Courses</option>
              {courses.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-card border border-border-soft rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select 
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="bg-transparent text-sm text-text outline-none"
            >
              <option value="ALL">All Batches</option>
              {batches.filter(b => b !== 'ALL').map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className='bg-card rounded-xl border border-border-soft overflow-hidden'>
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
              <tr><td colSpan='5' className='px-6 py-8 text-center text-text-muted'>Loading rankings...</td></tr>
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
