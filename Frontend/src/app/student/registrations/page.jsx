"use client";
import React from 'react';
import { useStudentDashboard } from '../StudentDashboardContext';
import { Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function StudentRegistrations() {
  const { dashboardData } = useStudentDashboard();
  const registrations = dashboardData?.registrations || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-headline text-text flex items-center gap-2">
          <Calendar className="w-6 h-6 text-accent" />
          Event Registrations
        </h1>
        <p className="text-text-muted mt-1 text-sm">Track the review and approval status of your event applications.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border-soft shadow-sm overflow-hidden">
        {registrations.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-3">
            <Calendar className="w-10 h-10 text-text-muted/40 mx-auto" />
            <h3 className="text-base font-bold text-text">No Event Registrations Yet</h3>
            <p className="text-sm">You haven't registered for any events yet. Check out the Events page to join upcoming club events.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-soft">
            {registrations.map((reg) => (
              <div key={reg.id || reg.transactionId} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-card-hover/50 transition-colors">
                <div>
                  <h3 className="font-bold text-text mb-1">Club & Event Registration</h3>
                  <p className="text-xs font-mono text-text-muted">Transaction ID: {reg.transactionId || 'N/A'}</p>
                  <p className="text-xs text-text-muted mt-1">Applied on: {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${
                  reg.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                  reg.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {reg.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                   reg.status === 'REJECTED' ? <AlertCircle className="w-3.5 h-3.5" /> : 
                   <Clock className="w-3.5 h-3.5" />}
                  <span>{reg.status || 'PENDING'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
