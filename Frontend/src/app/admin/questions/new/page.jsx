"use client";
import React, { useState, useEffect } from "react";
import {   useRouter, useParams,     } from 'next/navigation';
import Link from 'next/link';;
import axios from "axios";
import { ArrowLeft, Save, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";

export default function CreateQuestion() {
  const navigate = useRouter();
  const { id } = useParams(); // If id exists, we are in Edit mode
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    difficulty: "Medium",
    status: "Draft",
    time_limit_ms: 2000,
    memory_limit_kb: 256000,
    description: "",
    constraints: "",
    tags: "",
  });

  const [testCases, setTestCases] = useState([
    { input: "", expected_output: "", is_hidden: false }
  ]);

  useEffect(() => {
    if (isEditMode) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/v1/admin/questions/${id}`, {
        withCredentials: true,
      });
      const q = res.data.data;
      setFormData({
        title: q.title,
        topic: q.topic,
        difficulty: q.difficulty,
        status: q.status,
        time_limit_ms: q.time_limit_ms,
        memory_limit_kb: q.memory_limit_kb,
        description: q.description,
        constraints: q.constraints,
        tags: q.tags.join(", "),
      });
      if (q.testCases && q.testCases.length > 0) {
        setTestCases(q.testCases);
      }
    } catch (err) {
      setError("Failed to fetch question details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expected_output: "", is_hidden: true }]);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        time_limit_ms: parseInt(formData.time_limit_ms),
        memory_limit_kb: parseInt(formData.memory_limit_kb),
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        testCases,
      };

      if (isEditMode) {
        await axios.put(`/api/v1/admin/questions/${id}`, payload, { withCredentials: true });
      } else {
        await axios.post("/api/v1/admin/questions", payload, { withCredentials: true });
      }
      navigate.push("/admin/questions");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question.");
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/questions"
          className="p-2 bg-card border border-border hover:bg-card-hover rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-text" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">
            {isEditMode ? "Edit Question" : "Create New Question"}
          </h1>
          <p className="text-text-text-muted text-sm mt-1">
            Build out the problem statement, constraints, and test cases.
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
        
        {/* Basic Details */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-text border-b border-border-soft pb-2">Basic Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text mb-1.5">Problem Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
                placeholder="e.g. Longest Substring Without Repeating Characters"
              />
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
                placeholder="e.g. Arrays, Strings, DP"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
                placeholder="e.g. Sliding Window, Hash Map"
              />
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

        {/* Problem Statement */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-text border-b border-border-soft pb-2">Problem Statement</h2>
          
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">Description (Markdown supported)</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              rows={8}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-accent font-mono text-sm"
              placeholder="Given a string s, find the length of the longest substring..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">Constraints (Markdown supported)</label>
            <textarea
              name="constraints"
              required
              value={formData.constraints}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-accent font-mono text-sm"
              placeholder="- 0 <= s.length <= 5 * 10^4&#10;- s consists of English letters, digits, symbols and spaces."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Time Limit (ms)</label>
              <input
                type="number"
                name="time_limit_ms"
                required
                min="100"
                value={formData.time_limit_ms}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Memory Limit (KB)</label>
              <input
                type="number"
                name="memory_limit_kb"
                required
                min="1024"
                value={formData.memory_limit_kb}
                onChange={handleInputChange}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-border-soft pb-2">
            <h2 className="text-lg font-bold text-text">Test Cases</h2>
            <button
              type="button"
              onClick={addTestCase}
              className="text-xs bg-accent/10 text-accent font-semibold px-3 py-1.5 rounded-lg hover:bg-accent hover:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Test Case
            </button>
          </div>
          
          <div className="space-y-6">
            {testCases.map((tc, index) => (
              <div key={index} className="relative bg-bg border border-border rounded-lg p-4">
                <div className="absolute top-4 right-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tc.is_hidden}
                      onChange={(e) => handleTestCaseChange(index, "is_hidden", e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    Hidden
                  </label>
                  <button
                    type="button"
                    onClick={() => removeTestCase(index)}
                    className="text-text-text-muted hover:text-danger transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-text-text-muted mb-4 uppercase tracking-wider">Test Case {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1.5">Input</label>
                    <textarea
                      required
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                      rows={3}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-accent font-mono text-sm"
                      placeholder="e.g. s = &quot;abcabcbb&quot;"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1.5">Expected Output</label>
                    <textarea
                      required
                      value={tc.expected_output}
                      onChange={(e) => handleTestCaseChange(index, "expected_output", e.target.value)}
                      rows={3}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-accent font-mono text-sm"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>
              </div>
            ))}
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
            {isEditMode ? "Save Changes" : "Create Question"}
          </button>
        </div>
      </form>
    </div>
  );
}

