import React from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RegistrationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center font-jetbrains p-6 relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="bg-card border-4 border-text p-12 max-w-lg w-full text-center relative z-10 shadow-[12px_12px_0px_rgba(46,197,212,0.2)]">
        <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
        <h2 className="font-oswald text-4xl font-bold uppercase text-text mb-4">
          Transmission Received
        </h2>
        <p className="text-text-text-muted font-bold uppercase tracking-widest text-sm leading-relaxed mb-8">
          Your application is now in the queue. You will receive an email
          notification once Central Command (Admin) reviews and approves your
          registration.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-text text-bg px-8 py-4 font-bold uppercase tracking-widest hover:bg-accent hover:text-text transition-colors border-2 border-transparent hover:border-text"
        >
          Return to Base
        </button>
      </div>
    </div>
  );
}
