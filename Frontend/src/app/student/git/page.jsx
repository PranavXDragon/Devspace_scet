'use client';
import { useState, useEffect } from 'react';
import { Github, GitBranch, Star, GitFork, BookOpen, AlertCircle, Search, RefreshCw, ExternalLink } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';
import { useStudentDashboard } from '../StudentDashboardContext';

export default function GitDashboard() {
  const { user } = useUser();
  const { dashboardData } = useStudentDashboard();
  const [currentUsername, setCurrentUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize username from OAuth or profile
  useEffect(() => {
    const savedUsername = typeof window !== 'undefined' ? localStorage.getItem('devspace_github_username') : null;
    const oauthUsername = user?.externalAccounts?.find(a => a.provider === 'oauth_github')?.username;
    const profileUsername = dashboardData?.profile?.github_username;
    
    const detected = savedUsername || oauthUsername || profileUsername || user?.username || '';
    
    if (detected) {
      setCurrentUsername(detected);
      setInputUsername(detected);
      fetchGitStats(detected);
    } else {
      setLoading(false);
    }
  }, [user, dashboardData]);

  const fetchGitStats = async (username) => {
    if (!username || !username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const clean = username.trim().replace(/^@/, '');
      const res = await axiosInstance.get(`/git/${clean}`);
      setStats(res.data?.data || res.data);
      setCurrentUsername(clean);
      if (typeof window !== 'undefined') {
        localStorage.setItem('devspace_github_username', clean);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Could not find GitHub stats for @${username}`);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      fetchGitStats(inputUsername);
      setIsSearching(false);
    }
  };

  return (
    <div className='max-w-5xl mx-auto space-y-8'>
      {/* Header with Title and Search / Connect Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Github className="w-8 h-8 text-accent" /> Git Dashboard
          </h1>
          <p className='text-text-muted mt-1 text-sm'>
            Track your open source contributions and live GitHub repositories.
          </p>
        </div>

        {/* Change / Search Username Button */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">@</span>
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="github username..."
              className="pl-7 pr-3 py-1.5 text-xs font-mono bg-card border border-border-soft rounded-lg text-text placeholder-text-muted/50 focus:border-accent focus:outline-none w-44 sm:w-52 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-accent text-bg font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Load</span>
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          <p className="font-mono text-sm">Fetching live GitHub stats for @{inputUsername || currentUsername}...</p>
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && error && (
        <div className="max-w-2xl mx-auto p-8 bg-card border border-red-500/20 rounded-2xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-text">GitHub Account Not Found</h2>
          <p className="text-text-muted text-sm">{error}</p>
          <div className="pt-2">
            <p className="text-xs text-text-muted font-mono mb-3">Try entering another GitHub username above.</p>
          </div>
        </div>
      )}

      {/* Empty State: No username connected yet */}
      {!loading && !stats && !error && (
        <div className="max-w-2xl mx-auto p-10 bg-card border border-border-soft rounded-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto">
            <Github className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text font-headline">Connect Your GitHub Profile</h2>
            <p className="text-text-muted text-sm mt-1 max-w-md mx-auto">
              Enter your GitHub handle above to sync and display your repositories, follower metrics, and open source projects in your student dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Stats Display */}
      {!loading && stats && stats.profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1 bg-card border border-border-soft p-6 rounded-2xl text-center shadow-sm flex flex-col justify-between">
            <div>
              <div className="relative inline-block mb-4">
                <img
                  src={stats.profile.avatar_url}
                  alt={stats.profile.login}
                  className="w-28 h-28 rounded-full mx-auto border-2 border-accent/40 shadow-xl object-cover"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card" />
              </div>

              <h2 className="text-xl font-bold text-text">{stats.profile.name || stats.profile.login}</h2>
              <a
                href={stats.profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline text-xs font-mono mt-1 mb-3 inline-flex items-center gap-1"
              >
                <span>@{stats.profile.login}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {stats.profile.bio && (
                <p className="text-xs text-text-muted mb-6 leading-relaxed line-clamp-4">
                  {stats.profile.bio}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-soft">
              <div className="p-3 bg-bg rounded-xl border border-border-soft">
                <span className="text-2xl font-bold text-accent block">{stats.profile.public_repos || 0}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Repositories</span>
              </div>
              <div className="p-3 bg-bg rounded-xl border border-border-soft">
                <span className="text-2xl font-bold text-accent block">{stats.profile.followers || 0}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Followers</span>
              </div>
            </div>
          </div>

          {/* Repositories Grid */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" /> Recent Repositories
              </h2>
              <span className="text-xs font-mono text-text-muted">
                Showing top {stats.repos?.length || 0} active
              </span>
            </div>

            {(!stats.repos || stats.repos.length === 0) ? (
              <div className="p-8 bg-card border border-border-soft rounded-xl text-center text-text-muted text-sm">
                No public repositories found for this account.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.repos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-card border border-border-soft p-4 rounded-xl hover:border-accent/60 transition-all group block shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-text group-hover:text-accent transition-colors text-sm truncate">
                        {repo.name}
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors shrink-0" />
                    </div>

                    <p className="text-xs text-text-muted mt-1.5 mb-4 line-clamp-2 min-h-[32px] leading-relaxed">
                      {repo.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted pt-2 border-t border-border-soft">
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-accent" />
                          <span>{repo.language}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 ml-auto">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>{repo.stargazers_count || 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-text-muted" />
                        <span>{repo.forks_count || 0}</span>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
