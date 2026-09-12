'use client';
import { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, Clock, ExternalLink } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await axiosInstance.get('/career/opportunities');
      setOpportunities(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-text-muted">Loading opportunities...</div>;

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Briefcase className="w-8 h-8 text-green-500" /> Opportunities
        </h1>
        <p className='text-text-muted mt-2'>Find internships and full-time roles curated for DevSpace students.</p>
      </div>

      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="text-center p-12 bg-card border border-border-soft rounded-xl text-text-muted">
            No opportunities posted currently. Check back later!
          </div>
        ) : (
          opportunities.map(opp => (
            <div key={opp.id} className="bg-card border border-border-soft rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-green-500/50 transition-colors shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-text">{opp.title}</h3>
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold tracking-wider rounded-lg border border-green-500/20">
                    {opp.type}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1 font-medium text-text">
                    <Building2 className="w-4 h-4" /> {opp.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {opp.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Posted {new Date(opp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <a 
                href={opp.apply_url} 
                target="_blank" 
                rel="noreferrer"
                className="shrink-0 px-6 py-3 bg-text text-bg font-bold rounded-lg hover:bg-text-muted transition-colors flex items-center justify-center gap-2"
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
