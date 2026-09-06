import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Library, ExternalLink, Filter, Loader2, BookOpen, Video, FileText, Link as LinkIcon, Archive } from "lucide-react";

export default function ResourceLibrary() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const categories = ["All", "DSA", "Programming", "Development", "CS Core", "Placement", "Projects", "Events", "DevSpace Internal"];
  const types = ["All", "Video", "PDF", "Link", "ZIP"];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/resources/published", {
        withCredentials: true,
      });
      setResources(response.data.data || []);
    } catch (err) {
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || r.category === selectedCategory;
    const matchesType = selectedType === "All" || r.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'Video': return <Video className="w-5 h-5 text-red-500" />;
      case 'PDF': return <FileText className="w-5 h-5 text-red-600" />;
      case 'ZIP': return <Archive className="w-5 h-5 text-amber-500" />;
      default: return <LinkIcon className="w-5 h-5 text-blue-500" />;
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
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Library className="w-6 h-6 text-accent" />
          Resource Library
        </h1>
        <p className="text-text-text-muted mt-1 text-sm">
          Access curated study materials, practice sheets, and recorded sessions.
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-xl border border-danger/30 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-text-muted" />
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-text"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent min-w-[140px]"
          >
            <option disabled value="">Category</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent min-w-[120px]"
          >
            <option disabled value="">Type</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <BookOpen className="w-12 h-12 text-border mb-4" />
          <h3 className="text-lg font-bold text-text">No resources found</h3>
          <p className="text-text-text-muted text-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:border-accent/50 transition flex flex-col h-full group">
              {resource.thumbnail_url && (
                <div className="h-40 w-full bg-bg border-b border-border overflow-hidden">
                  <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="bg-bg border border-border-soft px-2 py-0.5 rounded text-[10px] font-bold text-text-text-muted uppercase tracking-wider">
                    {resource.category}
                  </span>
                  {getIconForType(resource.type)}
                </div>
                
                <h3 className="font-bold text-text text-lg line-clamp-2 mt-1 mb-2">{resource.title}</h3>
                <p className="text-sm text-text-text-muted line-clamp-3 mb-4 flex-1">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {resource.tags && resource.tags.map((tag, idx) => (
                    <span key={idx} className="bg-accent/10 text-accent px-2 py-0.5 rounded-md text-[11px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border-soft flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text">{resource.topic}</span>
                    {resource.author && <span className="text-[10px] text-text-text-muted">by {resource.author}</span>}
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-bg border border-border hover:bg-card-hover px-3 py-1.5 rounded-lg text-sm font-semibold text-text transition-colors"
                  >
                    Open
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
