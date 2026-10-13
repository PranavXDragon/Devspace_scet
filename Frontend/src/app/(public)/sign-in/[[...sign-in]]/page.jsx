"use client";
import React from 'react';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#070a10] text-[#f0f6fc] relative flex flex-col justify-center items-center px-4 py-8 sm:py-12 overflow-x-hidden">
      {/* Cyber Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage: "linear-gradient(#2EC5D4 1px, transparent 1px), linear-gradient(90deg, #2EC5D4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2EC5D4]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Navigation Back Link */}
      <div className="relative z-10 mb-6 w-full max-w-md flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#2EC5D4] uppercase tracking-wider transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to DevSpace</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2EC5D4] bg-[#2EC5D4]/10 border border-[#2EC5D4]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
          <Shield className="w-3 h-3" />
          <span>Secure Auth</span>
        </span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <SignIn 
          routing="path" 
          path="/sign-in"
          fallbackRedirectUrl="/student/dashboard"
          signUpUrl="/sign-up"
        />
      </div>

      {/* Subtle Footer */}
      <div className="relative z-10 mt-8 text-center text-xs font-mono text-slate-500 tracking-wider">
        DEVSPACE CODING CLUB &bull; SCET SURAT
      </div>
    </div>
  );
}
