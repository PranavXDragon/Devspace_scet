"use client";
import React from 'react';
import { useStudentDashboard } from '../StudentDashboardContext';
import { Award, ExternalLink, Calendar, ShieldCheck } from "lucide-react";
import Link from 'next/link';

export default function StudentCertificates() {
  const { dashboardData } = useStudentDashboard();
  const certificates = dashboardData?.certificates || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-headline text-text flex items-center gap-2">
          <Award className="w-6 h-6 text-accent" />
          My Certificates
        </h1>
        <p className="text-text-muted mt-1 text-sm">View, download, and verify your event achievements and certificates.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-text-muted shadow-sm space-y-3">
          <Award className="w-12 h-12 text-text-muted/40 mx-auto" />
          <h3 className="text-lg font-bold text-text">No Certificates Yet</h3>
          <p className="text-sm max-w-md mx-auto">
            Participate in DevSpace workshops, hackathons, and coding challenges to earn verified digital certificates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id || cert.certificateId} className="bg-card border border-border-soft rounded-2xl p-5 shadow-sm hover:border-accent/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-text group-hover:text-accent transition-colors line-clamp-1">{cert.eventName}</h3>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mt-1.5">
                      {cert.position || 'Participant'}
                    </div>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 p-2.5 rounded-xl border border-amber-500/20 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1.5 py-2 text-xs font-mono text-text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{cert.eventDate ? new Date(cert.eventDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <span className="truncate">ID: {cert.certificateId}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-border-soft">
                <Link
                  href={`/verify-certificate/${cert.certificateId}`}
                  target="_blank"
                  className="w-full py-2.5 bg-card hover:bg-card-hover border border-border-soft hover:border-accent text-text text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-sm"
                >
                  <span>View Certificate</span>
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
