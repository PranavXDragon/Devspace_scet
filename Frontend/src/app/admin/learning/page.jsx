"use client";

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, BookOpen, Layers, Video } from 'lucide-react';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function AdminLearningPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('roadmaps'); // 'roadmaps' or 'courses' or 'lessons'

  // Edit/Add States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('roadmap'); // 'roadmap', 'course', 'lesson'
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/learning/roadmaps');
      setRoadmaps(res.data || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load learning data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({ order: 0 }); // Defaults
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let endpoint = `/admin/learning/${modalType}s`;
      let method = editingItem ? 'put' : 'post';
      if (editingItem) endpoint += `/${editingItem.id}`;

      await axiosInstance[method](endpoint, formData);
      
      toast({ title: 'Success', description: `${modalType} saved successfully` });
      closeModal();
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || `Failed to save ${modalType}`, variant: 'destructive' });
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await axiosInstance.delete(`/admin/learning/${type}s/${id}`);
      toast({ title: 'Success', description: `${type} deleted successfully` });
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: `Failed to delete ${type}`, variant: 'destructive' });
    }
  };

  // Helper arrays for flat views
  const allCourses = roadmaps.flatMap(r => (r.courses || []).map(c => ({...c, roadmapName: r.title})));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Learning Content</h1>
          <p className="text-text-muted text-sm mt-1">Manage roadmaps, courses, and lessons for students.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border-soft pb-2">
        <button 
          onClick={() => setActiveTab('roadmaps')}
          className={`flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-colors ${activeTab === 'roadmaps' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text'}`}
        >
          <Layers className="w-4 h-4" /> Roadmaps
        </button>
        <button 
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-colors ${activeTab === 'courses' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text'}`}
        >
          <BookOpen className="w-4 h-4" /> Courses
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>
      ) : (
        <>
          {/* Roadmaps View */}
          {activeTab === 'roadmaps' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => openModal('roadmap')} className="flex items-center gap-2 bg-accent text-bg px-4 py-2 rounded-lg font-bold text-sm">
                  <Plus className="w-4 h-4" /> Add Roadmap
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmaps.map(r => (
                  <div key={r.id} className="bg-card border border-border-soft rounded-xl p-5 hover:border-accent/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-text">{r.title}</h3>
                        <p className="text-text-muted text-sm mt-1">{r.description || 'No description'}</p>
                        <p className="text-xs text-accent mt-2">{r.courses?.length || 0} Courses</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal('roadmap', r)} className="p-2 text-text-muted hover:text-accent bg-card-hover rounded-md"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete('roadmap', r.id)} className="p-2 text-text-muted hover:text-red-500 bg-card-hover rounded-md"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {roadmaps.length === 0 && <div className="col-span-full text-center py-8 text-text-muted">No roadmaps found</div>}
              </div>
            </div>
          )}

          {/* Courses View */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => openModal('course')} className="flex items-center gap-2 bg-accent text-bg px-4 py-2 rounded-lg font-bold text-sm">
                  <Plus className="w-4 h-4" /> Add Course
                </button>
              </div>
              <div className="overflow-x-auto border border-border-soft rounded-xl">
                <table className="w-full text-left text-sm text-text-muted">
                  <thead className="text-xs text-text uppercase bg-card border-b border-border-soft">
                    <tr>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Roadmap</th>
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCourses.map(c => (
                      <tr key={c.id} className="bg-bg border-b border-border-soft hover:bg-card-hover">
                        <td className="px-6 py-4 font-bold text-text">{c.title}</td>
                        <td className="px-6 py-4">{c.roadmapName}</td>
                        <td className="px-6 py-4">{c.order}</td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button onClick={() => openModal('course', c)} className="text-accent hover:underline">Edit</button>
                          <button onClick={() => handleDelete('course', c.id)} className="text-red-500 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {allCourses.length === 0 && <tr><td colSpan="4" className="text-center py-8">No courses found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Basic Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border-soft shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border-soft flex justify-between items-center">
              <h2 className="text-xl font-bold text-text capitalize">{editingItem ? 'Edit' : 'Add'} {modalType}</h2>
              <button onClick={closeModal} className="text-text-muted hover:text-text">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {modalType === 'course' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text uppercase">Roadmap</label>
                  <select 
                    value={formData.roadmap_id || ''} 
                    onChange={e => setFormData({...formData, roadmap_id: e.target.value})}
                    className="w-full bg-bg border border-border-soft rounded-lg px-4 py-2 text-text focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    required
                  >
                    <option value="">Select Roadmap</option>
                    {roadmaps.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text uppercase">Title</label>
                <input 
                  type="text" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-bg border border-border-soft rounded-lg px-4 py-2 text-text focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text uppercase">Description</label>
                <textarea 
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-bg border border-border-soft rounded-lg px-4 py-2 text-text focus:border-accent focus:ring-1 focus:ring-accent outline-none h-24"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text uppercase">Order / Sequence</label>
                <input 
                  type="number" 
                  value={formData.order || 0} 
                  onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                  className="w-full bg-bg border border-border-soft rounded-lg px-4 py-2 text-text focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={closeModal} className="px-5 py-2 rounded-lg font-bold text-text bg-card-hover border border-border-soft">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg font-bold text-bg bg-accent">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
