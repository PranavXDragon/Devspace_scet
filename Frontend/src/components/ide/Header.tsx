"use client";
import React from "react";
import { Play, Save, FolderOpen, FilePlus2, Code2, BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CodePadHeaderProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onRun: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  activeFile: string | null;
  hasProblem?: boolean;
  problemTitle?: string | null;
  isProblemPanelOpen?: boolean;
  onToggleProblemPanel?: () => void;
}

export default function CodePadHeader({
  onNew,
  onOpen,
  onSave,
  onRun,
  onSubmit,
  isSubmitting = false,
  activeFile,
  hasProblem = false,
  problemTitle,
  isProblemPanelOpen = true,
  onToggleProblemPanel,
}: CodePadHeaderProps) {
  return (
    <header className="flex items-center h-16 px-2 md:px-4 border-b border-border shrink-0 z-10 bg-background justify-between gap-2">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden md:flex items-center gap-2">
          <Code2 className="h-6 w-6 text-accent" />
          <h1 className="text-lg font-bold tracking-tight font-headline text-text">
            {hasProblem ? (problemTitle || "Challenge IDE") : "DevSpace IDE"}
          </h1>
        </div>

        {/* Toggle Problem Description Button */}
        {hasProblem && onToggleProblemPanel && (
          <Button
            variant={isProblemPanelOpen ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleProblemPanel}
            className="flex items-center gap-1.5 text-xs font-semibold"
            title="Toggle Problem Statement"
          >
            <BookOpen className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Problem</span>
          </Button>
        )}
      </div>

      {/* Middle: Active File Name (if any) */}
      <div className="flex-1 flex justify-center items-center px-2 min-w-0">
        {activeFile && (
          <span className="text-xs font-mono text-text-muted truncate max-w-[200px]" title={activeFile}>
            {activeFile}
          </span>
        )}
      </div>

      {/* Right: File Actions, Run, and Submit */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button variant="ghost" size="icon" onClick={onNew} aria-label="New File" className="h-8 w-8 text-text-muted hover:text-text">
          <FilePlus2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpen} aria-label="Open File" className="h-8 w-8 text-text-muted hover:text-text">
          <FolderOpen className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onSave} aria-label="Save File" className="h-8 w-8 text-text-muted hover:text-text">
          <Save className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1 bg-border" />

        {/* Run Code Button */}
        <Button
          onClick={onRun}
          size="sm"
          className="bg-card hover:bg-card-hover text-text border border-border-soft hover:border-accent/40 text-xs sm:text-sm font-semibold h-8 sm:h-9 px-3 gap-1.5 transition-all cursor-pointer"
        >
          <Play className="h-3.5 w-3.5 text-accent fill-accent" />
          <span>Run</span>
        </Button>

        {/* Submit Solution Button (when problem is active) */}
        {hasProblem && onSubmit && (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            <span>Submit</span>
          </Button>
        )}
      </div>
    </header>
  );
}
