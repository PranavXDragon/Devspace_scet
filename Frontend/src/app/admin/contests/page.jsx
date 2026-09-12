'use client';
import { useState, useEffect } from 'react';
import { Trophy, Plus, Pencil, Trash2 } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

export default function AdminContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 120
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get('/challenges/contests/list'); // Reuse list for now
      setContests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (contest = null) => {
    if (contest) {
      setEditingId(contest.id);
      setFormData({
        title: contest.title,
        description: contest.description || '',
        start_time: contest.start_time ? new Date(contest.start_time).toISOString().slice(0,16) : '',
        end_time: contest.end_time ? new Date(contest.end_time).toISOString().slice(0,16) : '',
        duration_minutes: contest.duration_minutes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '', description: '', start_time: '', end_time: '', duration_minutes: 120
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      };
      
      if (editingId) {
        await axiosInstance.put(`/admin/challenges/contests/${editingId}`, payload);
      } else {
        await axiosInstance.post('/admin/challenges/contests', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error saving contest');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this contest?')) {
      try {
        await axiosInstance.delete(`/admin/challenges/contests/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className='p-8 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Trophy className="text-yellow-500" /> Manage Contests
        </h1>
        <button 
          onClick={() => handleOpenModal()} 
          className='flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90'
        >
          <Plus className='w-4 h-4' /> New Contest
        </button>
      </div>

      <div className='bg-card border border-border rounded-xl overflow-hidden'>
        <table className='w-full text-left'>
          <thead className='bg-card-hover'>
            <tr>
              <th className='p-4 text-text-muted font-semibold'>Title</th>
              <th className='p-4 text-text-muted font-semibold'>Duration (m)</th>
              <th className='p-4 text-text-muted font-semibold'>Start / End</th>
              <th className='p-4 text-text-muted font-semibold text-right'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {contests.map(c => (
              <tr key={c.id}>
                <td className='p-4 font-medium text-text'>{c.title}</td>
                <td className='p-4 text-text'>{c.duration_minutes || 'Flexible'}</td>
                <td className='p-4 text-sm text-text-muted'>
                  {new Date(c.start_time).toLocaleString()} <br/> {new Date(c.end_time).toLocaleString()}
                </td>
                <td className='p-4 text-right flex justify-end gap-2'>
                  <button onClick={() => handleOpenModal(c)} className='p-2 text-blue-500 hover:bg-blue-500/10 rounded'><Pencil className='w-4 h-4'/></button>
                  <button onClick={() => handleDelete(c.id)} className='p-2 text-red-500 hover:bg-red-500/10 rounded'><Trash2 className='w-4 h-4'/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Contest' : 'New Contest'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Duration (minutes)</label>
                <input required type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Start Time</label>
                  <input required type="datetime-local" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">End Time</label>
                  <input required type="datetime-local" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-muted hover:bg-card-hover rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
