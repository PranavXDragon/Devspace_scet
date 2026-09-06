"use client";
import React, { useState, useEffect } from "react";
import {   useRouter, useParams,     } from 'next/navigation';
import Link from 'next/link';;
import axios from "axios";
import { ArrowLeft, Save, Loader2, AlertCircle, UploadCloud } from "lucide-react";

export default function CreateResource() {
  const navigate = useRouter();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "DSA",
    topic: "",
    type: "Link",
    url: "",
    difficulty: "Beginner",
    tags: "",
    thumbnail_url: "",
    author: "",
    is_featured: false,
    status: "Draft",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchResource();
    }
  }, [id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/v1/resources/${id}`, {
        withCredentials: true,
      });
      const r = res.data.data;
      setFormData({
        title: r.title,
        description: r.description,
        category: r.category,
        topic: r.topic,
        type: r.type,
        url: r.url,
        difficulty: r.difficulty,
        tags: r.tags ? r.tags.join(", ") : "",
        thumbnail_url: r.thumbnail_url || "",
        author: r.author || "",
        is_featured: r.is_featured,
        status: r.status,
      });
    } catch (err) {
      setError("Failed to fetch resource details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      };

      if (isEditMode) {
        await axios.put(`/api/v1/resources/${id}`, payload, { withCredentials: true });
      } else {
        await axios.post("/api/v1/resources", payload, { withCredentials: true });
      }
      navigate.push("/admin/resources");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save resource.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/resources"
          className="p-2 bg-card border border-border hover:bg-card-hover rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-text" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">
            {isEditMode ? "Edit Resource" : "Add New Resource"}
          </h1>
          <p className="text-text-text-muted text-sm mt-1">
            Publish study materials, videos, and useful links.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text mb-1.5">Resource Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
                placeholder="e.g. Complete Graph Algorithms Workshop"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text mb-1.5">Resource URL (Direct Link)</label>
              <div className="relative">
                <UploadCloud className="absolute left-3 top-2.5 w-4 h-4 text-text-text-muted" />
                <input
                  type="url"
                  name="url"
                  required
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-2 text-text focus:outline-none focus:border-accent"
                  placeholder="https://..."
                />
              </div>
              <p className="text-xs text-text-text-muted mt-1">Provide a link to a Google Drive file, YouTube video, or external website.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
              >
                <option value="DSA">DSA</option>
                <option value="Programming">Programming</option>
                <option value="Development">Development</option>
                <option value="CS Core">CS Core</option>
                <option value="Placement">Placement</option>
                <option value="Projects">Projects</option>
                <option value="Events">Events</option>
                <option value="DevSpace Internal">DevSpace Internal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Topic</label>
              <input
                type="text"
                name="topic"
                required
                value={formData.topic}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
                placeholder="e.g. Dynamic Programming, ReactJS"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Resource Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
              >
                <option value="Link">Link (Website/Article)</option>
                <option value="Video">Video (YouTube/Drive)</option>
                <option value="PDF">PDF Document</option>
                <option value="ZIP">ZIP Archive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text mb-1.5">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-accent"
                placeholder="Briefly describe what this resource covers..."
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-text border-b border-border-soft pb-2">Additional Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
                placeholder="e.g. Cheat Sheet, Interview Prep"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Author / Instructor</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
                placeholder="e.g. Pranav, Striver"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text mb-1.5">Thumbnail Image URL (Optional)</label>
              <input
                type="url"
                name="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
               <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  id="is_featured"
                  className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                />
               <label htmlFor="is_featured" className="text-sm font-semibold text-text cursor-pointer">
                  Feature this resource
               </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-accent/90 transition flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditMode ? "Save Changes" : "Publish Resource"}
          </button>
        </div>
      </form>
    </div>
  );
}

