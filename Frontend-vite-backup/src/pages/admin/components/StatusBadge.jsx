import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function StatusBadge({ status }) {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/30">
          <CheckCircle className="w-3.5 h-3.5" /> Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/30">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30">
          <Clock className="w-3.5 h-3.5" /> Pending
        </span>
      );
  }
}
