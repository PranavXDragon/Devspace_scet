'use client';
import { useState, useEffect } from 'react';
import { FileText, Download, Code, Trophy, Briefcase, GitBranch } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';

export default function ResumePage() {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.publicMetadata?.studentId) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const studentId = user.publicMetadata.studentId;
      // Fetch multiple stats concurrently for the resume
      const [analytics, achievements, projects] = await Promise.all([
        axiosInstance.get(`/progress/analytics?student_id=${studentId}`),
        axiosInstance.get(`/progress/achievements?student_id=${studentId}`),
        axiosInstance.get('/projects') // this returns public showcase, for MVP we'll just filter on client
      ]);
      
      const myProjects = projects.data.filter(p => p.student_id === studentId || (p.teams && p.teams.team_members?.some(tm => tm.student_id === studentId)));

      setData({
        analytics: analytics.data,
        achievements: achievements.data,
        projects: myProjects
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-text-muted">Generating DevSpace Profile...</div>;

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <FileText className="w-8 h-8 text-pink-500" /> DevSpace Resume
          </h1>
          <p className='text-text-muted mt-2'>Your automatically generated developer portfolio.</p>
        </div>
        <button className="px-4 py-2 bg-text text-bg rounded-lg font-bold flex items-center gap-2 hover:bg-text-muted transition-colors" onClick={() => window.print()}>
          <Download className="w-4 h-4" /> Save as PDF
        </button>
      </div>

      {/* A4 Paper Style Container */}
      <div className="bg-white text-black p-8 sm:p-12 rounded-xl shadow-xl border border-border-soft print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="border-b-2 border-gray-200 pb-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <img src={user?.imageUrl} alt={user?.fullName} className="w-24 h-24 rounded-full border-4 border-gray-100" />
          <div className="text-center md:text-left flex-1">
            <h2 className="text-4xl font-black mb-1">{user?.fullName}</h2>
            <p className="text-gray-500 font-medium mb-4">{user?.primaryEmailAddress?.emailAddress}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold">
              <span className="flex items-center gap-1 text-pink-600"><Trophy className="w-4 h-4" /> {data?.analytics?.total_points || 0} XP</span>
              <span className="flex items-center gap-1 text-blue-600"><Code className="w-4 h-4" /> {data?.analytics?.total_problems_solved || 0} Problems Solved</span>
              <span className="flex items-center gap-1 text-purple-600"><Briefcase className="w-4 h-4" /> {data?.projects?.length || 0} Projects</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-8">
          
          <section>
            <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <Code className="w-5 h-5 text-gray-400" /> Technical Projects
            </h3>
            <div className="space-y-4">
              {data?.projects?.length === 0 ? (
                <p className="text-gray-500 italic">No public projects uploaded yet.</p>
              ) : (
                data.projects.map(p => (
                  <div key={p.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-lg">{p.title}</h4>
                      <div className="flex gap-2">
                        {p.github_url && <a href={p.github_url} className="text-sm text-blue-600 hover:underline">GitHub</a>}
                        {p.demo_url && <a href={p.demo_url} className="text-sm text-blue-600 hover:underline">Live Demo</a>}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{p.description}</p>
                    <div className="flex gap-2">
                      {p.tags?.map((t, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{t}</span>)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gray-400" /> DevSpace Achievements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {data?.achievements?.achievements?.filter(a => a.is_earned).map(ach => (
                <div key={ach.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <img src={ach.icon_url} alt={ach.title} className="w-10 h-10" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{ach.title}</h4>
                    <p className="text-xs text-gray-500">Earned {new Date(ach.earned_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {(!data?.achievements?.achievements || data.achievements.achievements.filter(a => a.is_earned).length === 0) && (
                <p className="text-gray-500 italic col-span-full">No achievements earned yet.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
