'use client';
import { useState, useEffect } from 'react';
import { Github, GitBranch, Star, GitFork, BookOpen, AlertCircle, Search, RefreshCw, ExternalLink, Link2, Unlink, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { studentService } from '@/services/studentService';
import { useUser, useClerk } from '@clerk/nextjs';
import { useStudentDashboard } from '../StudentDashboardContext';
import { useConfirm, useAlert } from '@/context/ConfirmContext';

export default function GitDashboard() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { dashboardData, fetchDashboardData } = useStudentDashboard();
  const confirm = useConfirm();
  const showAlert = useAlert();

  const [currentUsername, setCurrentUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [connectInput, setConnectInput] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize username from OAuth, backend profile, or localStorage
  useEffect(() => {
    const savedUsername = typeof window !== 'undefined' ? localStorage.getItem('devspace_github_username') : null;
    const oauthUsername = user?.externalAccounts?.find(a => a.provider === 'oauth_github')?.username;
    const profileUsername = dashboardData?.profile?.github_username;
    
    const detected = profileUsername || oauthUsername || savedUsername || '';
    
    if (detected) {
      setCurrentUsername(detected);
      setInputUsername(detected);
      setConnectInput(detected);
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

  const handleConnectGithub = async (e, handleToUse) => {
    if (e && e.preventDefault) e.preventDefault();
    const raw = (handleToUse || connectInput || inputUsername || '').trim().replace(/^@/, '');
    
    if (!raw) {
      await showAlert({
        title: "Username Required",
        message: "Please enter your GitHub handle (e.g. 'torvalds') to connect your account.",
        type: "warning"
      });
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      // 1. Fetch live GitHub stats to verify the username
      const res = await axiosInstance.get(`/git/${raw}`);
      const gitData = res.data?.data || res.data;
      setStats(gitData);
      setCurrentUsername(raw);
      setInputUsername(raw);
      setConnectInput(raw);

      // 2. Persist to backend database (student_registrations.github_username)
      try {
        await studentService.updateGithubUsername(raw);
        if (typeof fetchDashboardData === 'function') {
          await fetchDashboardData();
        }
      } catch (dbErr) {
        console.warn("Could not save to database directly:", dbErr);
      }

      // 3. Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('devspace_github_username', raw);
      }

      await showAlert({
        title: "GitHub Profile Connected",
        message: `Successfully connected @${raw}! Your repositories and metrics are now linked to your DevSpace profile.`,
        type: "info"
      });
    } catch (err) {
      const msg = err.response?.data?.message || `Could not find GitHub account @${raw}. Please verify the handle and try again.`;
      setError(msg);
      setStats(null);
      await showAlert({
        title: "Connection Failed",
        message: msg,
        type: "danger"
      });
    } finally {
      setConnecting(false);
      setLoading(false);
    }
  };

  const handleDisconnectGithub = async () => {
    const isConfirmed = await confirm({
      title: "Disconnect GitHub Account",
      message: `Are you sure you want to unlink @${currentUsername} from your DevSpace student profile?`,
      confirmText: "Disconnect",
      cancelText: "Cancel",
      type: "warning"
    });
    if (!isConfirmed) return;

    try {
      await studentService.updateGithubUsername(null);
      if (typeof fetchDashboardData === 'function') {
        await fetchDashboardData();
      }
    } catch (e) {
      console.warn("Error disconnecting github in backend:", e);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('devspace_github_username');
    }

    setCurrentUsername('');
    setInputUsername('');
    setConnectInput('');
    setStats(null);
    setError(null);

    await showAlert({
      title: "Disconnected",
      message: "Your GitHub profile has been disconnected.",
      type: "info"
    });
  };

  const handleOAuthConnect = async () => {
    try {
      if (user && typeof user.createExternalAccount === 'function') {
        const redirectUrl = window.location.href;
        const res = await user.createExternalAccount({
          strategy: 'oauth_github',
          redirect_url: redirectUrl,
        });
        if (res?.verification?.externalVerificationRedirectURL) {
          window.location.href = res.verification.externalVerificationRedirectURL.href;
          return;
        }
      }
      // Fallback: open user profile to connect OAuth accounts
      openUserProfile();
    } catch (err) {
      console.error("OAuth connect error:", err);
      await showAlert({
        title: "OAuth Connection",
        message: err.errors?.[0]?.message || err.message || "Please enter your GitHub handle in the box above to link your profile directly.",
        type: "warning"
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      fetchGitStats(inputUsername);
    }
  };

  const isConnected = !!currentUsername && !!stats;
  const isViewingDifferentProfile = isConnected && stats.profile?.login?.toLowerCase() !== currentUsername.toLowerCase();

  return (
    <div className='max-w-5xl mx-auto space-y-8 pb-16'>
      {/* Header with Title and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Github className="w-8 h-8 text-accent" /> Git Dashboard
          </h1>
          <p className='text-text-muted mt-1 text-sm'>
            Track your open source contributions, repositories, and live GitHub activity.
          </p>
        </div>

        {/* Search any developer handle */}
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

      {/* Connected Account Status Bar (When an account is connected) */}
      {isConnected && (
        <div className="bg-card border border-border-soft rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block ring-4 ring-emerald-500/20 animate-pulse" />
            </div>
            <div>
              <span className="text-xs text-text-muted font-medium">Connected Profile:</span>
              <span className="text-sm font-bold text-text ml-1.5 font-mono">@{currentUsername}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isViewingDifferentProfile && (
              <button
                onClick={(e) => handleConnectGithub(e, stats.profile?.login)}
                disabled={connecting}
                className="px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent text-xs font-bold rounded-lg hover:bg-accent hover:text-bg transition-all flex items-center gap-1.5"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Link This Handle</span>
              </button>
            )}
            <button
              onClick={() => {
                const newHandle = prompt("Enter new GitHub username:", currentUsername);
                if (newHandle && newHandle.trim()) {
                  handleConnectGithub(null, newHandle.trim());
                }
              }}
              className="px-3 py-1.5 bg-card hover:bg-card-hover border border-border-soft text-text text-xs font-semibold rounded-lg transition-all"
            >
              Switch Handle
            </button>
            <button
              onClick={handleDisconnectGithub}
              className="px-3 py-1.5 bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger text-xs font-bold rounded-lg transition-all flex items-center gap-1"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State: Shimmer Skeleton Dashboard */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-card border border-border-soft p-6 rounded-2xl space-y-4 skeleton-shimmer">
            <div className="w-24 h-24 rounded-full bg-bg mx-auto" />
            <div className="w-1/2 h-5 bg-bg rounded-md mx-auto" />
            <div className="w-1/3 h-4 bg-bg rounded-md mx-auto" />
            <div className="w-full h-12 bg-bg rounded-md" />
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-soft/40">
              <div className="h-16 bg-bg rounded-xl" />
              <div className="h-16 bg-bg rounded-xl" />
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="w-48 h-6 bg-card rounded-md skeleton-shimmer" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-border-soft p-4 rounded-xl space-y-3 skeleton-shimmer">
                  <div className="w-3/4 h-5 bg-bg rounded-md" />
                  <div className="w-full h-8 bg-bg rounded-md" />
                  <div className="flex gap-2 pt-2 border-t border-border-soft/40">
                    <div className="w-12 h-4 bg-bg rounded-md" />
                    <div className="w-10 h-4 bg-bg rounded-md ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && error && (
        <div className="max-w-2xl mx-auto p-8 bg-card border border-red-500/20 rounded-2xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-text">GitHub Account Not Found</h2>
          <p className="text-text-muted text-sm">{error}</p>
          <div className="pt-2">
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-accent text-bg font-bold text-xs rounded-lg hover:opacity-90"
            >
              Try Another Handle
            </button>
          </div>
        </div>
      )}

      {/* Empty State: Interactive Connect GitHub Form */}
      {!loading && !stats && !error && (
        <div className="max-w-2xl mx-auto p-8 sm:p-10 bg-card border border-border-soft rounded-2xl text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto">
            <Github className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text font-headline">Connect Your GitHub Profile</h2>
            <p className="text-text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Connect your GitHub profile to showcase your live repositories, follower counts, star metrics, and contributions across DevSpace.
            </p>
          </div>

          {/* Connect Input Form */}
          <form onSubmit={(e) => handleConnectGithub(e, connectInput)} className="max-w-md mx-auto space-y-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">@</span>
              <input
                type="text"
                value={connectInput}
                onChange={(e) => setConnectInput(e.target.value)}
                placeholder="enter your github handle (e.g. torvalds)"
                className="w-full pl-8 pr-4 py-2.5 text-sm font-mono bg-bg border border-border-soft rounded-xl text-text placeholder-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={connecting}
              className="w-full py-2.5 px-4 bg-accent text-bg font-bold text-sm rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting GitHub Profile...</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Connect GitHub Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative max-w-md mx-auto flex items-center justify-center">
            <div className="border-t border-border-soft w-full" />
            <span className="bg-card px-3 text-[11px] font-mono text-text-muted uppercase tracking-wider absolute">or</span>
          </div>

          {/* 1-Click OAuth Connect */}
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={handleOAuthConnect}
              className="w-full py-2.5 px-4 bg-card hover:bg-card-hover border border-border-soft hover:border-accent/50 text-text font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <Github className="w-4 h-4 text-accent" />
              <span>Link with GitHub via OAuth</span>
            </button>
          </div>

          <p className="text-xs text-text-muted/70 max-w-sm mx-auto">
            Your public repositories and activity will automatically sync into your Git Dashboard and Project Showcase.
          </p>
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
