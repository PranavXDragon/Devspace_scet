import React, { useState, useEffect, useCallback } from "react";
import { Users, Calendar, Activity, ShieldCheck, RefreshCw } from "lucide-react";
import axiosInstance from "@/services/axiosInstance";

export default function MetricsGrid({ metrics }) {
  const [health, setHealth] = useState({
    status: 'checking', // 'ok' | 'degraded' | 'offline' | 'checking'
    latency: null,
    message: 'Pinging backend & DB...'
  });

  const checkHealth = useCallback(async () => {
    setHealth(prev => ({ ...prev, status: 'checking', message: 'Checking systems...' }));
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    try {
      const res = await axiosInstance.get('/healthcheck', { timeout: 6000 });
      const elapsed = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime);
      
      const statusData = res?.data?.status || res?.status;
      if (statusData === 'Degraded') {
        setHealth({
          status: 'degraded',
          latency: elapsed,
          message: `Database degraded (${elapsed}ms)`
        });
      } else {
        setHealth({
          status: 'ok',
          latency: elapsed,
          message: `All systems operational (${elapsed}ms)`
        });
      }
    } catch (err) {
      const elapsed = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime);
      if (err.response?.status === 503) {
        setHealth({
          status: 'degraded',
          latency: elapsed,
          message: 'Database degraded'
        });
      } else {
        setHealth({
          status: 'offline',
          latency: null,
          message: 'Backend server unreachable'
        });
      }
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Poll health status every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Pending Applications */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <span className="text-sm font-medium text-text-muted">
            Pending Applications
          </span>
        </div>
        <div>
          <span className="text-3xl font-bold text-text">
            {metrics?.loading ? "-" : (metrics?.pendingApps ?? 0)}
          </span>
          <p className="text-xs font-medium text-accent mt-2">
            Real-time sync
          </p>
        </div>
      </div>

      {/* 2. Active Events */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <span className="text-sm font-medium text-text-muted">
            Active Events
          </span>
        </div>
        <div>
          <span className="text-3xl font-bold text-text">
            {metrics?.loading ? "-" : (metrics?.activeEvents ?? 0)}
          </span>
          <p className="text-xs font-medium text-accent mt-2">
            Real-time sync
          </p>
        </div>
      </div>

      {/* 3. Live Sessions */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-warning/10 rounded-lg">
            <Activity className="w-6 h-6 text-warning" />
          </div>
          <span className="text-sm font-medium text-text-muted">
            Live Sessions
          </span>
        </div>
        <div>
          <span className="text-3xl font-bold text-text">
            {metrics?.loading ? "-" : (metrics?.liveSessions ?? 0)}
          </span>
          <p className="text-xs font-medium text-accent mt-2">
            Real-time sync
          </p>
        </div>
      </div>

      {/* 4. Live System Status */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${
              health.status === 'ok'
                ? 'bg-success/15 text-success'
                : health.status === 'degraded'
                ? 'bg-warning/15 text-warning'
                : health.status === 'offline'
                ? 'bg-danger/15 text-danger'
                : 'bg-accent/15 text-accent'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-text-muted">
              System Status
            </span>
          </div>
          <button
            type="button"
            onClick={checkHealth}
            title="Re-check health status"
            className="text-text-muted hover:text-accent p-1.5 rounded-md hover:bg-card-hover transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${health.status === 'checking' ? 'animate-spin text-accent' : ''}`} />
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${
              health.status === 'ok'
                ? 'text-text'
                : health.status === 'degraded'
                ? 'text-warning'
                : health.status === 'offline'
                ? 'text-danger'
                : 'text-text-muted'
            }`}>
              {health.status === 'ok' && 'OK'}
              {health.status === 'degraded' && 'DEGRADED'}
              {health.status === 'offline' && 'OFFLINE'}
              {health.status === 'checking' && 'CHECKING'}
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${
              health.status === 'ok'
                ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'
                : health.status === 'degraded'
                ? 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : health.status === 'offline'
                ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                : 'bg-accent animate-ping'
            }`} />
          </div>
          <p className={`text-xs font-medium mt-2 transition-colors ${
            health.status === 'ok'
              ? 'text-accent'
              : health.status === 'degraded'
              ? 'text-warning'
              : health.status === 'offline'
              ? 'text-danger'
              : 'text-text-muted'
          }`}>
            {health.message}
          </p>
        </div>
      </div>
    </div>
  );
}