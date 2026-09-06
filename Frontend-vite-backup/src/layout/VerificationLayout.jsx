import React from "react";

const VerificationLayout = ({
  isLoading,
  error,
  errorTitle = "Invalid Document",
  loadingTitle = "Verifying",
  loadingMessage = "Checking authenticity...",
  verificationURL,
  downloadText = "Download PDF",
  children,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const copyVerificationLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationURL);
      alert("Verification link copied.");
    } catch {
      alert("Unable to copy link.");
    }
  };

  return (
    <div className="app-shell">
      {/* Fixed Print-Specific CSS */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 0; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background-color: white !important;
          }
          
          /* 1. Hide everything on the page without collapsing the layout completely */
          body * {
            visibility: hidden;
          }

          /* 2. Show only the overlay and its children */
          #verification-overlay, #verification-overlay * {
            visibility: visible;
          }

          /* 3. Pull the document to the absolute top-left corner of the paper */
          #verification-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Main Shared Wrapper (Guarantees full height and centering for all states) */}
      <main
        id="verification-overlay"
        className="w-full max-w-[1400px] mx-auto flex-1 border-x border-border bg-bg-soft min-h-screen py-12 px-4 flex flex-col items-center justify-center relative overflow-y-auto"
      >
        

        {/* ---------------- Loading State ---------------- */}
        {isLoading ? (
          <div className="relative z-10 flex flex-col justify-center p-8 bg-card/40 backdrop-blur-md rounded-2xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-lg text-center items-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-[6px] border-border border-t-accent" />
            <h2 className="mt-8 font-sans text-2xl font-bold uppercase tracking-[0.3em] text-text">
              {loadingTitle}
            </h2>
            <p className="mt-4 text-text-muted text-sm font-mono uppercase tracking-widest">
              {loadingMessage}
            </p>
          </div>
        ) : 
        
        /* ---------------- Error State ---------------- */
        error ? (
          <div className="relative z-10 flex flex-col justify-center p-8 bg-card/40 backdrop-blur-md rounded-2xl border border-danger/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-2xl text-center">
            <h1 className="mt-2 font-sans text-4xl lg:text-6xl uppercase tracking-[0.05em] text-danger">
              {errorTitle}
            </h1>
            <p className="mt-6 text-text-muted font-mono uppercase tracking-widest text-sm">
              {error}
            </p>
          </div>
        ) : 
        
        /* ---------------- Main Layout (Success) ---------------- */
        (
          <>
            {/* Action Buttons */}
            <div className="relative z-10 w-full max-w-[1000px] flex flex-wrap justify-end gap-4 mb-8 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center w-full lg:w-fit justify-center min-h-[3.25rem] px-[1.5rem] py-[0.9rem] border font-sans text-[0.96rem] tracking-[0.2em] uppercase transition-all duration-150 rounded-lg bg-text text-bg border-transparent hover:bg-text-muted hover:text-bg hover:-translate-y-[1px]"
              >
                {downloadText}
              </button>
              <button
                onClick={copyVerificationLink}
                className="inline-flex items-center w-full lg:w-fit justify-center min-h-[3.25rem] px-[1.5rem] py-[0.9rem] border font-sans text-[0.96rem] tracking-[0.2em] uppercase transition-all duration-150 rounded-lg bg-card text-text border-border hover:bg-card-hover hover:-translate-y-[1px]"
              >
                Copy Link
              </button>
            </div>

            {/* Document Container */}
            {children}
          </>
        )}
      </main>
    </div>
  );
};

export default VerificationLayout;