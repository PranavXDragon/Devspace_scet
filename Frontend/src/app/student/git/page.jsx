'use client';
import { useState, useEffect } from 'react';
import { Github, GitBranch, Star, GitFork, BookOpen, AlertCircle } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';

export default function GitDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.publicMetadata?.studentId) {
      // In a real app, github_username would be passed in publicMetadata or fetched from student profile.
      // For this MVP, we assume it's in publicMetadata or we prompt for it.
      const githubUsername = user.publicMetadata.githubUsername || 'octocat'; // Fallback for MVP testing
      fetchGitStats(githubUsername);
    }
  }, [user]);

  const fetchGitStats = async (username) => {
    try {
      const res = await axiosInstance.get(`/git/${username}`);
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load GitHub stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-text-muted">Loading GitHub stats...</div>;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-card border border-border-soft rounded-xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">GitHub Integration Error</h2>
        <p className="text-text-muted">{error}</p>
        <p className="text-sm mt-4 text-text-muted">Ensure your GitHub username is linked correctly in your profile.</p>
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Github className="w-8 h-8 text-white" /> Git Dashboard
        </h1>
        <p className='text-text-muted mt-2'>Track your open source contributions and repositories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-card border border-border-soft p-6 rounded-xl text-center shadow-sm">
          <img src={stats.profile.avatar_url} alt="GitHub Avatar" className="w-32 h-32 rounded-full mx-auto border-4 border-bg mb-4 shadow-lg" />
          <h2 className="text-xl font-bold text-text">{stats.profile.name || stats.profile.login}</h2>
          <a href={stats.profile.html_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm mb-4 block">@{stats.profile.login}</a>
          <p className="text-sm text-text-muted mb-6">{stats.profile.bio}</p>
          
          <div className="flex justify-center gap-4 text-sm font-semibold text-text">
            <div className="flex flex-col items-center">
              <span className="text-2xl text-accent">{stats.profile.public_repos}</span>
              <span className="text-text-muted font-normal text-xs uppercase tracking-wider">Repos</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl text-accent">{stats.profile.followers}</span>
              <span className="text-text-muted font-normal text-xs uppercase tracking-wider">Followers</span>
            </div>
          </div>
        </div>

        {/* Repositories */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> Recent Repositories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.repos.map(repo => (
              <a 
                key={repo.id} 
                href={repo.html_url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-card border border-border-soft p-4 rounded-xl hover:border-accent transition-colors group block"
              >
                <h3 className="font-bold text-text group-hover:text-accent transition-colors line-clamp-1">{repo.name}</h3>
                <p className="text-xs text-text-muted mt-1 mb-4 line-clamp-2 min-h-[32px]">{repo.description || 'No description available'}</p>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-text-muted">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {repo.stargazers_count}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {repo.forks_count}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
