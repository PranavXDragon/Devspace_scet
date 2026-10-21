"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function RegisterPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (userId) {
      router.replace("/student/dashboard");
    } else {
      router.replace("/sign-up");
    }
  }, [userId, isLoaded, router]);

  return (
    <div className="min-h-screen bg-bg relative flex flex-col justify-center items-center px-4 overflow-hidden">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage: "linear-gradient(#2EC5D4 1px, transparent 1px), linear-gradient(90deg, #2EC5D4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <h2 className="font-sans text-xl font-bold uppercase tracking-wider text-text">
          Accessing Devspace
        </h2>
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
          Redirecting to your student dashboard...
        </p>
      </div>
    </div>
  );
}
