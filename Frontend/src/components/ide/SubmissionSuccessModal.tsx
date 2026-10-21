"use client";
import React from "react";
import Link from "next/link";
import { CheckCircle2, Trophy, ArrowRight, LayoutDashboard, ListFilter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  xpAwarded: number;
}

export default function SubmissionSuccessModal({
  isOpen,
  onClose,
  problemTitle,
  xpAwarded,
}: SubmissionSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border text-text p-6 text-center">
        <DialogHeader className="items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <DialogTitle className="text-2xl font-bold font-headline text-text">
            Solution Accepted!
          </DialogTitle>
          <DialogDescription className="text-text-muted text-sm pt-1">
            You successfully solved <span className="font-semibold text-text">{problemTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* XP & Stats Badge */}
        <div className="my-4 py-4 px-6 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center gap-3">
          <Trophy className="w-7 h-7 text-accent shrink-0 animate-pulse" />
          <div className="text-left">
            <div className="text-xl font-extrabold text-accent">+{xpAwarded} XP</div>
            <div className="text-xs text-text-muted">Rank points & daily streak updated</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border-soft hover:bg-card-hover text-text"
          >
            Keep Editing
          </Button>
          <Link href="/student/problems" className="flex-1" onClick={onClose}>
            <Button className="w-full bg-accent hover:bg-accent/90 text-bg font-semibold gap-1.5">
              <ListFilter className="w-4 h-4" />
              More Problems
            </Button>
          </Link>
          <Link href="/student/dashboard" className="sm:w-auto" onClick={onClose}>
            <Button variant="ghost" size="icon" title="Go to Dashboard" className="h-10 w-10 text-text-muted hover:text-text">
              <LayoutDashboard className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
