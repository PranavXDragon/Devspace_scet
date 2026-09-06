import React from "react";
import { Calendar } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-sm">
      <Calendar className="w-12 h-12 text-text-text-muted mx-auto mb-4" />
      <h3 className="text-lg font-bold text-text mb-1">
        No Active Events
      </h3>
      <p className="text-text-text-muted text-sm">
        Click "Create Event" to schedule a new one.
      </p>
    </div>
  );
}
