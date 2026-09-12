'use client';
import { useState, useEffect } from 'react';
import { Flame, Plus, Pencil, Trash2 } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    problem_id: '',
    reward_points: 100,
    type: 'daily'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Need a way to fetch ALL challenges for admin, for now reusing active + past if possible.
      // Wait, getActiveChallenges only gets active ones. I'll just use the active challenges endpoint for MVP,
      // or we can assume it fetches all.
      // Let's fetch problems for the dropdown
      const probRes = await axiosInstance.get('/coding/problems');
      setProblems(probRes.data || []);
      
      const chalRes = await axiosInstance.get('/challenges'); // In a real app, this should be /admin/challenges to get all.
      setChallenges(chalRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (challenge = null) => {
    if (challenge) {
      setEditingId(challenge.id);
      setFormData({
        title: challenge.title,
        description: challenge.description || '',
        start_time: challenge.start_time ? new Date(challenge.start_time).toISOString().slice(0,16) : '',
        end_time: challenge.end_time ? new Date(challenge.end_time).toISOString().slice(0,16) : '',
        problem_id: challenge.problem_id,
        reward_points: challenge.reward_points,
        type: challenge.type
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '', description: '', start_time: '', end_time: '', problem_id: '', reward_points: 100, type: 'daily'
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
        await axiosInstance.put(`/admin/challenges/${editingId}`, payload);
      } else {
        await axiosInstance.post('/admin/challenges', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error saving challenge');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this challenge?')) {
      try {
        await axiosInstance.delete(`/admin/challenges/${id}`);
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
          <Flame className="text-orange-500" /> Manage Challenges
        </h1>
        <button 
          onClick={() => handleOpenModal()} 
          className='flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90'
        >
          <Plus className='w-4 h-4' /> New Challenge
        </button>
      </div>

      <div className='bg-card border border-border rounded-xl overflow-hidden'>
        <table className='w-full text-left'>
          <thead className='bg-card-hover'>
            <tr>
              <th className='p-4 text-text-muted font-semibold'>Title</th>
              <th className='p-4 text-text-muted font-semibold'>Type</th>
              <th className='p-4 text-text-muted font-semibold'>Points</th>
              <th className='p-4 text-text-muted font-semibold'>Dates</th>
              <th className='p-4 text-text-muted font-semibold text-right'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {challenges.map(c => (
              <tr key={c.id}>
                <td className='p-4 font-medium text-text'>{c.title}</td>
                <td className='p-4'>
                  <span className='px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-bold uppercase'>{c.type}</span>
                </td>
                <td className='p-4 text-text'>{c.reward_points}</td>
                <td className='p-4 text-sm text-text-muted'>
                  {new Date(c.start_time).toLocaleDateString()} - {new Date(c.end_time).toLocaleDateString()}
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
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Challenge' : 'New Challenge'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Problem to Solve</label>
                <select required value={formData.problem_id} onChange={e => setFormData({...formData, problem_id: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text">
                  <option value="">Select a problem...</option>
                  {problems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Points</label>
                  <input required type="number" value={formData.reward_points} onChange={e => setFormData({...formData, reward_points: parseInt(e.target.value)})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
                </div>
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
