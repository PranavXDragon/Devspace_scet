'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { Trophy, CalendarDays, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axiosInstance.get('/challenges/contests/list');
        setContests(res.data || []);
      } catch (err) {
        console.error('Failed to fetch contests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Trophy className="w-8 h-8 text-yellow-500" />
            Coding Contests
          </h1>
          <p className='text-text-muted mt-2'>Compete with peers in timed coding battles.</p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {loading ? (
          <p className="text-text-muted">Loading contests...</p>
        ) : contests.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border-soft">
            <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text">No active contests</h3>
            <p className="text-text-muted mt-2">Check back later for upcoming competitive events!</p>
          </div>
        ) : (
          contests.map((c) => (
            <div key={c.id} className='bg-card border border-border-soft rounded-xl p-6 hover:border-yellow-500/50 transition-colors'>
              <h2 className='text-xl font-bold text-text mb-2'>{c.title}</h2>
              <p className='text-sm text-text-muted mb-6'>{c.description}</p>
              
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-text">
                  <CalendarDays className="w-5 h-5 text-text-muted" />
                  <span>Starts: {new Date(c.start_time).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text">
                  <Clock className="w-5 h-5 text-text-muted" />
                  <span>Duration: {c.duration_minutes ? `${c.duration_minutes} minutes` : 'Flexible'}</span>
                </div>
              </div>
              
              <Link 
                href={`/student/contests/${c.id}`}
                className='w-full py-3 bg-yellow-500/10 text-yellow-500 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-500 hover:text-white transition-colors'
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
