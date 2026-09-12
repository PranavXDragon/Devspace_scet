'use client';
import { useState, useEffect } from 'react';
import { FolderDot, Github, ExternalLink, Globe, Plus, ToggleLeft, ToggleRight, X } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { useUser } from '@clerk/nextjs';

export default function ProjectsPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('showcase'); // 'showcase' or 'mine'
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', github_url: '', live_url: '', tags: '', is_public: true });

  useEffect(() => {
    if (user?.publicMetadata?.studentId) {
      fetchProjects();
    }
  }, [user, activeTab]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (activeTab === 'showcase') {
        const res = await axiosInstance.get('/projects');
        setProjects(res.data || []);
      } else {
        const res = await axiosInstance.get(`/projects/student/${user.publicMetadata.studentId}`);
        setMyProjects(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      await axiosInstance.post('/projects', {
        ...formData,
        tags: tagsArray,
        student_id: user.publicMetadata.studentId
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', github_url: '', live_url: '', tags: '', is_public: true });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      await axiosInstance.patch(`/projects/${id}/visibility`, { is_public: !currentVisibility });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <FolderDot className="w-8 h-8 text-emerald-500" /> Project Showcase
          </h1>
          <p className='text-text-muted mt-2'>Discover projects built by your peers and showcase your own.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="flex items-center gap-4 border-b border-border-soft pb-2">
        <button 
          onClick={() => setActiveTab('showcase')}
          className={`px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'showcase' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-text-muted hover:text-text'}`}
        >
          Global Showcase
        </button>
        <button 
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'mine' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-text-muted hover:text-text'}`}
        >
          My Projects
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-text-muted col-span-full">Loading projects...</p>
        ) : (activeTab === 'showcase' ? projects : myProjects).length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border-soft">
            <FolderDot className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text">No projects found</h3>
            {activeTab === 'mine' && <p className="text-text-muted mt-2">Click "Add Project" to upload your first creation.</p>}
          </div>
        ) : (
          (activeTab === 'showcase' ? projects : myProjects).map(p => (
            <div key={p.id} className="bg-card border border-border-soft p-6 rounded-xl flex flex-col hover:border-emerald-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-text line-clamp-1" title={p.title}>{p.title}</h3>
                {activeTab === 'mine' && (
                  <button onClick={() => toggleVisibility(p.id, p.is_public)} className="text-text-muted hover:text-text" title={p.is_public ? "Make Private" : "Make Public"}>
                    {p.is_public ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-text-muted" />}
                  </button>
                )}
              </div>
              
              <p className="text-sm text-text-muted flex-1 line-clamp-3 mb-4">{p.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {p.tags?.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-bg border border-border-soft text-[10px] uppercase font-bold text-text-muted rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-soft">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                    {p.teams ? p.teams.name.charAt(0) : p.student_registrations?.name?.charAt(0)}
                  </span>
                  <span className="truncate max-w-[100px]">
                    {p.teams ? p.teams.name : p.student_registrations?.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer" className="text-text-muted hover:text-text transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer" className="text-text-muted hover:text-accent transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-text">Add New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Project Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">GitHub Repo URL</label>
                    <input type="url" value={formData.github_url} onChange={e => setFormData({...formData, github_url: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Live Demo URL</label>
                    <input type="url" value={formData.live_url} onChange={e => setFormData({...formData, live_url: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Tags (comma separated)</label>
                  <input type="text" placeholder="React, Node, AI" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-bg border border-border rounded px-3 py-2 text-text" />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="isPublic" checked={formData.is_public} onChange={e => setFormData({...formData, is_public: e.target.checked})} className="rounded bg-bg border-border text-accent focus:ring-accent" />
                  <label htmlFor="isPublic" className="text-sm text-text">Make this project public to the Global Showcase</label>
                </div>
                <button type="submit" className="w-full py-2 bg-accent text-white font-bold rounded mt-4 hover:bg-accent/90">
                  Save Project
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
