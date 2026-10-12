"use client";
import React from 'react';
import { useStudentDashboard } from '../StudentDashboardContext';
import { Ticket, QrCode, ExternalLink, Calendar } from "lucide-react";
import Link from 'next/link';

export default function StudentPasses() {
  const { dashboardData } = useStudentDashboard();
  const boardingPasses = dashboardData?.boardingPasses || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-headline text-text flex items-center gap-2">
          <Ticket className="w-6 h-6 text-accent" />
          My Boarding Passes
        </h1>
        <p className="text-text-muted mt-1 text-sm">Access your official boarding passes and check-in QR codes for upcoming events.</p>
      </div>

      {boardingPasses.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-text-muted shadow-sm space-y-3">
          <Ticket className="w-12 h-12 text-text-muted/40 mx-auto" />
          <h3 className="text-lg font-bold text-text">No Boarding Passes Yet</h3>
          <p className="text-sm max-w-md mx-auto">
            Once your event registrations are approved by organizers, your digital event pass and entry QR code will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardingPasses.map((pass) => (
            <div key={pass.id || pass.boardingPassId} className="bg-card border border-border-soft rounded-2xl p-5 shadow-sm hover:border-accent/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-text group-hover:text-accent transition-colors line-clamp-1">{pass.eventName}</h3>
                    <p className="text-xs text-text-muted mt-1 font-mono">PASS: {pass.boardingPassId}</p>
                  </div>
                  <div className="bg-accent/10 text-accent p-2.5 rounded-xl border border-accent/20 shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1.5 py-2 text-xs font-mono text-text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Issued: {pass.issuedAt ? new Date(pass.issuedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-border-soft">
                <Link
                  href={`/verify-boarding-pass/${pass.boardingPassId}`}
                  target="_blank"
                  className="w-full py-2.5 bg-card hover:bg-card-hover border border-border-soft hover:border-accent text-text text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-sm"
                >
                  <span>View Pass</span>
                  <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-accent" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
