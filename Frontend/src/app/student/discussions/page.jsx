'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Trash2, Edit3, X, Check } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';

export default function DiscussionsPage() {
  const { user } = useUser();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  
  // Expanded view
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const res = await axiosInstance.get('/discussions');
      setDiscussions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussionDetails = async (id) => {
    try {
      const res = await axiosInstance.get(`/discussions/${id}`);
      setActiveDiscussion(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = { ...formData, tags: tagsArray, student_id: user?.publicMetadata?.studentId };
      
      if (editingId) {
        await axiosInstance.patch(`/discussions/${editingId}`, payload);
      } else {
        await axiosInstance.post('/discussions', payload);
      }
      
      setIsModalOpen(false);
      setFormData({ title: '', content: '', tags: '' });
      setEditingId(null);
      fetchDiscussions();
      if (activeDiscussion && editingId === activeDiscussion.id) fetchDiscussionDetails(editingId);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving discussion');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this discussion?')) return;
    
    try {
      await axiosInstance.delete(`/discussions/${id}`, { data: { student_id: user?.publicMetadata?.studentId }});
      if (activeDiscussion?.id === id) setActiveDiscussion(null);
      fetchDiscussions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    try {
      await axiosInstance.post(`/discussions/${activeDiscussion.id}/replies`, {
        content: replyContent,
        student_id: user?.publicMetadata?.studentId
      });
      setReplyContent('');
      fetchDiscussionDetails(activeDiscussion.id);
      fetchDiscussions(); // Update reply counts in main list
    } catch (err) {
      alert('Error posting reply');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Delete this reply?')) return;
    try {
      await axiosInstance.delete(`/discussions/replies/${replyId}`, { data: { student_id: user?.publicMetadata?.studentId }});
      fetchDiscussionDetails(activeDiscussion.id);
      fetchDiscussions();
    } catch (err) {
      alert('Error deleting reply');
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', tags: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (d, e) => {
    if(e) e.stopPropagation();
    setEditingId(d.id);
    setFormData({ title: d.title, content: d.content, tags: d.tags?.join(', ') || '' });
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-text-muted">Loading discussions...</div>;

  return (
    <div className='max-w-6xl mx-auto space-y-8 flex gap-6 h-[calc(100vh-8rem)]'>
      {/* Left side: List */}
      <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 ${activeDiscussion ? 'hidden lg:block lg:max-w-md' : 'w-full'}`}>
        <div className='flex items-center justify-between sticky top-0 bg-bg pb-4 z-10'>
          <h1 className='text-2xl font-bold font-headline text-text flex items-center gap-2'>
            <MessageSquare className="w-6 h-6 text-purple-500" /> Discussions
          </h1>
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center p-2 bg-accent text-white rounded-full hover:bg-accent/90"
            title="New Discussion"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {discussions.length === 0 ? (
          <div className="text-center p-8 bg-card border border-border-soft rounded-xl text-text-muted">
            No discussions yet. Start one!
          </div>
        ) : (
          discussions.map(d => {
            const isMine = d.student_id === user?.publicMetadata?.studentId;
            return (
              <div 
                key={d.id} 
                onClick={() => fetchDiscussionDetails(d.id)}
                className={`bg-card border p-4 rounded-xl cursor-pointer transition-colors ${activeDiscussion?.id === d.id ? 'border-purple-500 bg-purple-500/5' : 'border-border-soft hover:border-purple-500/50'}`}
              >
                <h3 className="font-bold text-text line-clamp-2">{d.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {d.tags?.map((t, i) => <span key={i} className="text-[10px] uppercase font-bold text-text-muted bg-bg px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                      {d.student_registrations?.name?.charAt(0)}
                    </span>
                    <span>{d.student_registrations?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {d.discussion_replies?.length || 0}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Right side: Detail view */}
      {activeDiscussion && (
        <div className="flex-1 bg-card border border-border-soft rounded-xl flex flex-col h-full overflow-hidden relative">
          <div className="p-6 border-b border-border-soft flex-shrink-0 flex items-start justify-between bg-card">
            <div>
              <h2 className="text-2xl font-bold text-text mb-2">{activeDiscussion.title}</h2>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <span className="flex items-center gap-2 font-medium">
                  <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                    {activeDiscussion.student_registrations?.name?.charAt(0)}
                  </span>
                  {activeDiscussion.student_registrations?.name}
                </span>
                <span>•</span>
                <span>{new Date(activeDiscussion.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {activeDiscussion.student_id === user?.publicMetadata?.studentId && (
                <>
                  <button onClick={(e) => openEditModal(activeDiscussion, e)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full"><Edit3 className="w-4 h-4"/></button>
                  <button onClick={(e) => handleDelete(activeDiscussion.id, e)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><Trash2 className="w-4 h-4"/></button>
                </>
              )}
              <button onClick={() => setActiveDiscussion(null)} className="p-2 text-text-muted hover:bg-card-hover rounded-full lg:hidden"><X className="w-5 h-5"/></button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            <div className="text-text leading-relaxed whitespace-pre-wrap">
              {activeDiscussion.content}
            </div>

            <div className="pt-6 border-t border-border-soft">
              <h3 className="text-lg font-bold text-text mb-4">Replies ({activeDiscussion.discussion_replies?.length})</h3>
              <div className="space-y-4">
                {activeDiscussion.discussion_replies?.map(reply => (
                  <div key={reply.id} className="bg-bg border border-border-soft p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-500">
                          {reply.student_registrations?.name?.charAt(0)}
                        </span>
                        {reply.student_registrations?.name}
                      </div>
                      {reply.student_id === user?.publicMetadata?.studentId && (
                        <button onClick={() => handleDeleteReply(reply.id)} className="text-red-500/50 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                      )}
                    </div>
                    <p className="text-text text-sm whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-card border-t border-border-soft flex-shrink-0">
            <form onSubmit={handleReply} className="flex gap-2">
              <input 
                type="text" 
                value={replyContent} 
                onChange={(e) => setReplyContent(e.target.value)} 
                placeholder="Write a reply..." 
                className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-purple-500 focus:outline-none"
              />
              <button type="submit" disabled={!replyContent.trim()} className="px-6 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50">
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text">{editingId ? 'Edit Discussion' : 'New Discussion'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Content</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text h-32" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Tags (comma separated)</label>
                <input type="text" placeholder="React, Help, Bug" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-muted hover:bg-card-hover rounded font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-purple-500 text-white rounded font-bold hover:bg-purple-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
