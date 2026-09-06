import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Plus, Search, Edit, Trash2, Library, Loader2, ExternalLink } from "lucide-react";

export default function ManageResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/resources", {
        withCredentials: true,
      });
      setResources(response.data.data || []);
    } catch (err) {
      setError("Failed to load resources. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await axios.delete(`/api/v1/resources/${id}`, {
        withCredentials: true,
      });
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete resource.");
    }
  };

  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Library className="w-6 h-6 text-accent" />
            Manage Resources
          </h1>
          <p className="text-text-text-muted mt-1 text-sm">
            Upload and manage study materials, videos, and links.
          </p>
        </div>
        <Link
          to="/admin/resources/new"
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-border-soft bg-card/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-text-muted" />
            <input
              type="text"
              placeholder="Search by title, category, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-text"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 min-h-[300px] flex items-center justify-center">
              {error}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="p-8 text-center text-text-text-muted min-h-[300px] flex flex-col items-center justify-center">
              <Library className="w-12 h-12 text-border mb-3" />
              <p>No resources found.</p>
              {searchQuery && <p className="text-sm mt-1">Try adjusting your search.</p>}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-bg/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filteredResources.map((r) => (
                  <tr key={r.id} className="hover:bg-card-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text">{r.title}</p>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-text-text-muted hover:text-accent">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-xs text-text-text-muted mt-0.5">{r.topic}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-bg px-2 py-1 rounded text-xs font-medium text-text-text-muted border border-border-soft">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.type === 'Video' ? 'bg-red-500/10 text-red-500' :
                        r.type === 'PDF' ? 'bg-red-600/10 text-red-600' :
                        r.type === 'ZIP' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500' // Link
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.status === 'Published' ? 'bg-accent/10 text-accent' :
                        'bg-border text-text-text-muted'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/resources/edit/${r.id}`}
                          className="p-1.5 text-text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"
                          title="Edit Resource"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
