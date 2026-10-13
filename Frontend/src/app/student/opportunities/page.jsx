'use client';
import { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

const OPPORTUNITIES_CACHE_KEY = 'devspace_opportunities_cache';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(OPPORTUNITIES_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(OPPORTUNITIES_CACHE_KEY);
        if (cached) return false;
      } catch (e) {}
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOpportunities = async (silent = false) => {
    if (!silent) {
      if (opportunities.length === 0) setLoading(true);
      else setIsRefreshing(true);
    }
    try {
      const res = await axiosInstance.get('/career/opportunities');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setOpportunities(list);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(OPPORTUNITIES_CACHE_KEY, JSON.stringify(list));
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(opportunities.length > 0);
  }, []);

  if (loading && opportunities.length === 0) {
    return (
      <div className='max-w-6xl mx-auto space-y-8'>
        <div className="space-y-2">
          <div className="w-56 h-8 bg-card rounded-lg skeleton-shimmer" />
          <div className="w-80 h-4 bg-card rounded skeleton-shimmer" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border border-border-soft rounded-xl p-6 space-y-4 skeleton-shimmer">
              <div className="flex justify-between items-center">
                <div className="w-48 h-6 bg-card-hover rounded" />
                <div className="w-24 h-6 bg-card-hover rounded" />
              </div>
              <div className="w-3/4 h-4 bg-card-hover rounded" />
              <div className="flex gap-4">
                <div className="w-28 h-4 bg-card-hover rounded" />
                <div className="w-28 h-4 bg-card-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6 sm:space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-green-500 shrink-0" /> Opportunities
          </h1>
          <p className='text-text-muted mt-1 sm:mt-2 text-sm sm:text-base'>Find internships and full-time roles curated for DevSpace students.</p>
        </div>

        <button
          type="button"
          onClick={() => fetchOpportunities(false)}
          disabled={isRefreshing || loading}
          className="self-end sm:self-auto p-2.5 rounded-xl border border-border-soft hover:border-green-500/40 text-text-muted hover:text-green-400 bg-card transition-all disabled:opacity-50"
          title="Refresh Opportunities"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-green-400' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="text-center p-8 sm:p-12 bg-card border border-border-soft rounded-xl text-text-muted">
            <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text">No opportunities posted currently</h3>
            <p className="text-text-muted mt-2 text-sm">Check back later for internship and career openings!</p>
          </div>
        ) : (
          opportunities.map(opp => (
            <div key={opp.id} className="bg-card border border-border-soft rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 hover:border-green-500/50 transition-colors shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-text break-words">{opp.title}</h3>
                  <span className="px-2 py-0.5 sm:py-1 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold tracking-wider rounded-lg border border-green-500/20">
                    {opp.type}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-muted">
                  <span className="flex items-center gap-1 font-medium text-text">
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {opp.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {opp.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Posted {new Date(opp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <a 
                href={opp.apply_url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full md:w-auto shrink-0 px-6 py-2.5 sm:py-3 bg-text text-bg font-bold rounded-lg hover:bg-text-muted transition-colors flex items-center justify-center gap-2 text-sm sm:text-base mt-2 md:mt-0"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
