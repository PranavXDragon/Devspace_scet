"use client";
import React from "react";
import { BookOpen, Trophy, Copy, X } from "lucide-react";

export interface ProblemData {
  id: string;
  title: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  description: string;
  starter_code?: Record<string, string>;
  testcases?: Array<{
    id?: string;
    input_data: string;
    expected_output: string;
    is_hidden?: boolean;
  }>;
}

interface ProblemPanelProps {
  problem: ProblemData | null;
  onUseInput?: (input: string) => void;
  onClose?: () => void;
}

export default function ProblemPanel({ problem, onUseInput, onClose }: ProblemPanelProps) {
  if (!problem) return null;

  const difficulty = problem.difficulty || "Medium";
  const xpReward = difficulty === "Hard" ? 100 : difficulty === "Medium" ? 50 : 25;

  const difficultyColors = {
    Easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Hard: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  }[difficulty] || "bg-accent/15 text-accent border-accent/30";

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-lg">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-border bg-card-hover/40 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-5 h-5 text-accent shrink-0" />
          <h2 className="font-bold text-base sm:text-lg text-text truncate" title={problem.title}>
            {problem.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyColors}`}>
            {difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
            <Trophy className="w-3.5 h-3.5" />
            +{xpReward} XP
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-card transition-colors cursor-pointer"
              title="Collapse problem description"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-sm font-sans leading-relaxed text-text select-text">
        {/* Description body */}
        <div className="space-y-3 whitespace-pre-wrap leading-relaxed">
          {problem.description}
        </div>

        {/* Sample Testcases */}
        {problem.testcases && problem.testcases.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-text-muted">
              Sample Test Cases
            </h3>
            {problem.testcases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="bg-bg border border-border-soft rounded-lg p-3 space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between text-text-muted">
                  <span className="font-bold text-text">Example {idx + 1}</span>
                  {onUseInput && (
                    <button
                      type="button"
                      onClick={() => onUseInput(tc.input_data)}
                      className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline cursor-pointer"
                      title="Load into custom input panel"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Use as Input</span>
                    </button>
                  )}
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Input:</span>
                  <pre className="bg-card p-2 rounded border border-border-soft text-text overflow-x-auto whitespace-pre-wrap">
                    {tc.input_data || "<none>"}
                  </pre>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Expected Output:</span>
                  <pre className="bg-card p-2 rounded border border-border-soft text-accent overflow-x-auto whitespace-pre-wrap">
                    {tc.expected_output || "<none>"}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
