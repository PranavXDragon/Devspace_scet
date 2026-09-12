'use client';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';

export default function EventsPage() {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.publicMetadata?.studentId) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get(`/events?student_id=${user.publicMetadata.studentId}`);
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRSVP = async (eventId) => {
    try {
      await axiosInstance.post(`/events/${eventId}/rsvp`, {
        student_id: user.publicMetadata.studentId
      });
      fetchEvents();
    } catch (err) {
      alert('Failed to RSVP');
    }
  };

  if (loading) return <div className="text-text-muted">Loading events...</div>;

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Calendar className="w-8 h-8 text-orange-500" /> Upcoming Events
        </h1>
        <p className='text-text-muted mt-2'>Discover and RSVP to tech talks, workshops, and hackathons.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border-soft">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text">No upcoming events</h3>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-card border border-border-soft rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="h-40 bg-card-hover relative">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <Calendar className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-bg/80 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg text-text border border-border-soft">
                  {event.type}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-text mb-2 line-clamp-1" title={event.title}>{event.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{new Date(event.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short'})}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>{event.rsvp_count} Attending</span>
                  </div>
                </div>

                <p className="text-sm text-text-muted line-clamp-3 mb-6 flex-1">{event.description}</p>
                
                <button 
                  onClick={() => toggleRSVP(event.id)}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                    event.is_rsvpd 
                      ? 'bg-border-soft text-text-muted hover:bg-red-500/10 hover:text-red-500' 
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {event.is_rsvpd ? 'Cancel RSVP' : <><Ticket className="w-5 h-5"/> RSVP Now</>}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
