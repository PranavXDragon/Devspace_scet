"use client";
import React, { useState, useEffect } from "react";

import Link from 'next/link';;
import axios from "axios";
import { Plus, Search, Edit, Trash2, Code, Loader2 } from "lucide-react";

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/admin/questions", {
        withCredentials: true,
      });
      setQuestions(response.data.data || []);
    } catch (err) {
      setError("Failed to load questions. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axios.delete(`/api/v1/admin/questions/${id}`, {
        withCredentials: true,
      });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert("Failed to delete question.");
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Code className="w-6 h-6 text-accent" />
            Question Bank
          </h1>
          <p className="text-text-text-muted mt-1 text-sm">
            Manage all DSA challenges and problems.
          </p>
        </div>
        <Link href="/admin/questions/new"
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Question
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-border-soft bg-card/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-text-muted" />
            <input
              type="text"
              placeholder="Search questions by title or topic..."
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
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-text-text-muted min-h-[300px] flex flex-col items-center justify-center">
              <Code className="w-12 h-12 text-border mb-3" />
              <p>No questions found.</p>
              {searchQuery && <p className="text-sm mt-1">Try adjusting your search.</p>}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-bg/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-card-hover transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-text">{q.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-bg px-2 py-1 rounded text-xs font-medium text-text-text-muted border border-border-soft">
                        {q.topic}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                        q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        q.status === 'Published' ? 'bg-accent/10 text-accent' :
                        'bg-border text-text-text-muted'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/questions/edit/${q.id}`}
                          className="p-1.5 text-text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          title="Delete Question"
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

