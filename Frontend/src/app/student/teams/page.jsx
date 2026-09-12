'use client';
import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Info, ArrowRight } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';

export default function TeamsPage() {
  const { user } = useUser();
  const [teams, setTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (user?.publicMetadata?.studentId) {
      fetchTeams();
      fetchMyTeam();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const res = await axiosInstance.get('/teams');
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyTeam = async () => {
    try {
      const res = await axiosInstance.get(`/teams/student/${user.publicMetadata.studentId}`);
      setMyTeam(res.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/teams', {
        ...formData,
        student_id: user.publicMetadata.studentId
      });
      setIsCreating(false);
      fetchTeams();
      fetchMyTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating team');
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      await axiosInstance.post(`/teams/${teamId}/join`, {
        student_id: user.publicMetadata.studentId
      });
      fetchTeams();
      fetchMyTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Error joining team');
    }
  };

  if (loading) return <div className="text-text-muted">Loading teams...</div>;

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Users className="w-8 h-8 text-blue-500" /> DevSpace Teams
        </h1>
        <p className='text-text-muted mt-2'>Form teams for capstone projects, hackathons, and collaborative coding.</p>
      </div>

      {myTeam ? (
        <div className="bg-card border border-border-soft rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-2xl uppercase">
              {myTeam.name.substring(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text">{myTeam.name}</h2>
              <p className="text-text-muted mt-1">{myTeam.description}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-text mb-4">Team Members ({myTeam.team_members?.length}/4)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTeam.team_members?.map(m => (
              <div key={m.student_registrations.id} className="flex items-center gap-4 bg-bg border border-border-soft p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                  {m.student_registrations.name.substring(0, 1)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text">{m.student_registrations.name}</p>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    {m.role === 'Leader' && <Shield className="w-3 h-3 text-yellow-500" />} {m.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-text mb-4">Browse Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.length === 0 ? (
                <p className="text-text-muted col-span-full">No teams created yet.</p>
              ) : (
                teams.map(t => {
                  const membersCount = t.team_members?.length || 0;
                  const isFull = membersCount >= 4;
                  return (
                    <div key={t.id} className="bg-card border border-border-soft p-6 rounded-xl flex flex-col hover:border-blue-500/50 transition-colors">
                      <h3 className="text-lg font-bold text-text">{t.name}</h3>
                      <p className="text-sm text-text-muted mt-1 flex-1">{t.description}</p>
                      
                      <div className="flex items-center justify-between mt-6">
                        <span className={`text-sm font-semibold ${isFull ? 'text-red-500' : 'text-green-500'}`}>
                          {membersCount}/4 Members
                        </span>
                        <button
                          onClick={() => handleJoinTeam(t.id)}
                          disabled={isFull}
                          className="px-4 py-2 bg-blue-500/10 text-blue-500 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Join Team
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="bg-card border border-border-soft p-6 rounded-xl h-fit">
            <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent" /> Create a Team
            </h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Team Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text h-24" />
              </div>
              <button type="submit" disabled={isCreating} className="w-full py-2 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-colors">
                Create Team
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
