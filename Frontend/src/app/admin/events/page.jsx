'use client';
import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, MapPin } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', date_time: '', location: '', type: 'Virtual', image_url: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get('/events');
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/events', {
        ...formData,
        date_time: new Date(formData.date_time).toISOString()
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', date_time: '', location: '', type: 'Virtual', image_url: '' });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await axiosInstance.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert('Error deleting');
    }
  };

  return (
    <div className='p-8 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Calendar className="text-orange-500" /> Manage Events
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className='flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90'
        >
          <Plus className='w-4 h-4' /> New Event
        </button>
      </div>

      <div className='bg-card border border-border rounded-xl overflow-hidden'>
        <table className='w-full text-left'>
          <thead className='bg-card-hover'>
            <tr>
              <th className='p-4 text-text-muted font-semibold'>Event Title</th>
              <th className='p-4 text-text-muted font-semibold'>Date & Time</th>
              <th className='p-4 text-text-muted font-semibold'>Type/Location</th>
              <th className='p-4 text-text-muted font-semibold text-right'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {events.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-text-muted">No events created yet.</td></tr>
            ) : (
              events.map(e => (
                <tr key={e.id}>
                  <td className='p-4 font-bold text-text'>{e.title}</td>
                  <td className='p-4 text-text text-sm'>
                    {new Date(e.date_time).toLocaleString()}
                  </td>
                  <td className='p-4 text-sm text-text-muted'>
                    <span className="bg-bg border border-border px-2 py-1 rounded text-xs uppercase mr-2">{e.type}</span>
                    {e.location}
                  </td>
                  <td className='p-4 text-right flex justify-end gap-2'>
                    <button onClick={() => handleDelete(e.id)} className='p-2 text-red-500 hover:bg-red-500/10 rounded'><Trash2 className='w-4 h-4'/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text h-20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Date & Time</label>
                  <input required type="datetime-local" value={formData.date_time} onChange={e => setFormData({...formData, date_time: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text">
                    <option value="Virtual">Virtual</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Location (Link or Address)</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Banner Image URL</label>
                <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-muted hover:bg-card-hover rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
