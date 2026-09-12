'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/services/axiosInstance';
import { Flame, Clock, Code2, ArrowRight } from 'lucide-react';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await axiosInstance.get('/challenges');
        setChallenges(res.data || []);
      } catch (err) {
        console.error('Failed to fetch challenges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
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
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {loading ? (
          <p className="text-text-muted">Loading active challenges...</p>
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
