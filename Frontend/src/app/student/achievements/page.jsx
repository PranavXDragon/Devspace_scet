'use client';
import { useState, useEffect } from 'react';
import { Trophy, Star, Lock } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';

export default function AchievementsPage() {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.publicMetadata?.studentId) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const res = await axiosInstance.get(`/progress/achievements?student_id=${user.publicMetadata.studentId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-text-muted">Loading achievements...</div>;

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Trophy className="w-8 h-8 text-yellow-500" /> Achievements
        </h1>
        <p className='text-text-muted mt-2'>Unlock badges by earning XP through solving problems and challenges.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full font-bold">
          <Star className="w-5 h-5 fill-current" /> {data?.current_points || 0} Total XP
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.achievements?.map(ach => (
          <div 
            key={ach.id} 
            className={`relative overflow-hidden border rounded-xl p-6 flex flex-col items-center text-center transition-all ${
              ach.is_earned 
                ? 'bg-card border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                : 'bg-card border-border-soft opacity-60 grayscale'
            }`}
          >
            {!ach.is_earned && (
              <div className="absolute top-4 right-4 text-text-muted">
                <Lock className="w-5 h-5" />
              </div>
            )}
            
            <img src={ach.icon_url} alt={ach.title} className="w-24 h-24 mb-4" />
            <h3 className="text-xl font-bold text-text mb-2">{ach.title}</h3>
            <p className="text-sm text-text-muted mb-4 flex-1">{ach.description}</p>
            
            {ach.is_earned ? (
              <div className="text-xs font-bold text-yellow-500 uppercase tracking-wider bg-yellow-500/10 px-3 py-1 rounded-full">
                Earned on {new Date(ach.earned_at).toLocaleDateString()}
              </div>
            ) : (
              <div className="w-full">
                <div className="flex justify-between text-xs font-bold text-text-muted mb-1 uppercase tracking-wider">
                  <span>Progress</span>
                  <span>{data.current_points} / {ach.required_points} XP</span>
                </div>
                <div className="h-2 w-full bg-card-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-border" 
                    style={{ width: `${Math.min((data.current_points / ach.required_points) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
