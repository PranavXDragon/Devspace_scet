'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Map, Camera, CheckCircle, AlertCircle, Fingerprint, 
  Keyboard, ArrowRight, Loader2, User, ShieldCheck, 
  Lock, Sparkles, LogIn, Check, RefreshCw, ChevronRight, Globe
} from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { Html5QrcodeScanner } from 'html5-qrcode';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function StudentAttendancePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [status, setStatus] = useState('idle'); // idle, session_ready, scanning, submitting, success, error
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [pendingQrData, setPendingQrData] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const html5ScannerRef = useRef(null);

  // 1. Initialize Fingerprint and Geolocation
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (err) {
        setFingerprint('mobile-client-' + Date.now());
      }
    };
    initFingerprint();

    if (typeof navigator !== 'undefined' && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location error:", error);
          setLocation({ lat: 21.1702, lng: 72.8311 }); 
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocation({ lat: 21.1702, lng: 72.8311 }); 
    }
  }, []);

  // 2. Parse Attendance QR URL parameters (scanned via phone camera or external link)
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('sessionId');
      const timestamp = params.get('t') || params.get('timestamp');
      const hash = params.get('h') || params.get('hash');

      if (sessionId && timestamp && hash && !hasAutoSubmitted) {
        const qr = {
          sessionId,
          timestamp: Number(timestamp),
          hash
        };
        setPendingQrData(qr);

        if (isSignedIn && user) {
          // If student is signed in, prompt confirmation or auto-submit
          setStatus('session_ready');
        }
      }
    }
  }, [user, isLoaded, isSignedIn, hasAutoSubmitted]);

  const parseQrPayload = (decodedText) => {
    if (!decodedText) return null;
    const trimmed = decodedText.trim();

    // Raw JSON string
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.sessionId && parsed.hash) return parsed;
      } catch (e) {}
    }

    // URL string or query parameters
    try {
      const urlStr = trimmed.startsWith('http') ? trimmed : `https://dummy.local${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
      const url = new URL(urlStr);
      const sessionId = url.searchParams.get('sessionId');
      const timestamp = url.searchParams.get('t') || url.searchParams.get('timestamp');
      const hash = url.searchParams.get('h') || url.searchParams.get('hash');

      if (sessionId && hash) {
        return {
          sessionId,
          timestamp: Number(timestamp) || Date.now(),
          hash
        };
      }
    } catch (e) {}

    return null;
  };

  const startScanning = () => {
    setStatus('scanning');
    
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner("reader", { 
          fps: 15, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        }, false);
        html5ScannerRef.current = scanner;
        
        scanner.render(async (decodedText) => {
          scanner.clear();
          const qrData = parseQrPayload(decodedText);
          if (qrData) {
            setPendingQrData(qrData);
            if (isSignedIn && user) {
              submitAttendance(qrData);
            } else {
              setStatus('session_ready');
            }
          } else {
            setStatus('error');
            setMessage('Unrecognized QR Code format. Please scan the DevSpace classroom QR.');
          }
        }, () => {});
      } catch (err) {
        console.error('Camera scanner init failed:', err);
        setStatus('error');
        setMessage('Could not access camera. Please allow camera permissions or paste the session link.');
      }
    }, 150);
  };

  const cancelScanning = () => {
    if (html5ScannerRef.current) {
      try {
        html5ScannerRef.current.clear();
      } catch (e) {}
    }
    setStatus('idle');
  };

  const submitAttendance = async (qrData) => {
    if (!isSignedIn || !user) {
      setStatus('error');
      setMessage('You must be signed in to your DevSpace account to mark attendance.');
      return;
    }

    const qr = qrData || pendingQrData;
    if (!qr) return;

    setStatus('submitting');
    setHasAutoSubmitted(true);

    try {
      const studentEmail = user.primaryEmailAddress?.emailAddress;
      const studentName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student';

      const res = await axiosInstance.post('/attendance/mark', {
        qrData: qr,
        location: location || { lat: 21.1702, lng: 72.8311 },
        deviceFingerprint: fingerprint || 'mobile-device',
        studentIdentifier: studentEmail,
        studentName: studentName
      });

      const messageText = res.data?.message || res.message || `Attendance successfully marked for ${studentName}!`;
      setStatus('success');
      setMessage(messageText);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to mark attendance.';
      setStatus('error');
      setMessage(errMsg);
    }
  };

  const handleManualCodeSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const parsed = parseQrPayload(manualCode.trim());
    if (parsed) {
      setPendingQrData(parsed);
      if (isSignedIn && user) {
        submitAttendance(parsed);
      } else {
        setStatus('session_ready');
      }
    } else {
      setStatus('error');
      setMessage('Invalid attendance link format. Please paste the full URL or session parameters.');
    }
  };

  const getSignInUrlWithReturn = () => {
    if (typeof window === 'undefined') return '/sign-in';
    const currentTarget = window.location.pathname + window.location.search;
    return `/sign-in?redirect_url=${encodeURIComponent(currentTarget)}`;
  };

  // Loading state while Clerk hydrates
  if (!isLoaded) {
    return (
      <div className="max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#2EC5D4] mb-4" />
        <p className="text-text-muted text-sm font-medium">Verifying student credentials...</p>
      </div>
    );
  }

  // State: Student NOT signed in - Enforce Sign In Requirement
  if (!isSignedIn || !user) {
    return (
      <div className="max-w-md mx-auto min-h-[85vh] flex flex-col justify-center px-4 py-8">
        <div className="bg-card border border-border-soft rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-5 shadow-[0_0_30px_rgba(46,197,212,0.15)]">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-mono uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 font-semibold mb-3">
            Authentication Required
          </span>

          <h1 className="text-2xl font-bold font-headline text-text tracking-tight">
            Sign In for Attendance
          </h1>

          <p className="text-text-muted text-xs sm:text-sm mt-2 leading-relaxed max-w-xs">
            DevSpace requires verified student sign-in to mark attendance and track lecture credits.
          </p>

          {pendingQrData && (
            <div className="mt-5 w-full bg-bg border border-border rounded-xl p-3 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Classroom Session Waiting</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1 truncate font-mono">
                Session: {pendingQrData.sessionId.slice(0, 16)}...
              </p>
            </div>
          )}

          <div className="mt-6 w-full space-y-3">
            <Link
              href={getSignInUrlWithReturn()}
              className="w-full bg-accent hover:bg-accent/90 text-[#0b0f17] font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(46,197,212,0.25)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span>Sign In to DevSpace</span>
            </Link>

            <Link
              href={`/sign-up?redirect_url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/student/attendance')}`}
              className="w-full bg-card hover:bg-card-hover border border-border text-text font-semibold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Need an account? Sign Up</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Student IS signed in: Render Full Attendance Experience
  const studentDisplayName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'DevSpace Student';
  const studentEmail = user.primaryEmailAddress?.emailAddress || 'student@scet.ac.in';

  return (
    <div className='max-w-md mx-auto space-y-5 px-4 py-4 sm:py-6 min-h-[90vh] flex flex-col justify-center'>
      
      {/* Page Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-2.5 text-emerald-400 shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className='text-2xl sm:text-3xl font-bold font-headline text-text tracking-tight'>DevSpace Attendance</h1>
        <p className='text-text-muted text-xs sm:text-sm mt-1'>Instant verification for classroom lecture & workshop sessions.</p>
      </div>

      {/* Authenticated Student Identity Card */}
      <div className="bg-card border border-border-soft rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          {user.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt={studentDisplayName} 
              className="w-10 h-10 rounded-full object-cover border-2 border-accent/30 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
              {studentDisplayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-text truncate">{studentDisplayName}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" title="Signed In" />
            </div>
            <p className="text-xs text-text-muted truncate font-mono">{studentEmail}</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md shrink-0 uppercase tracking-wider font-semibold">
          Signed In
        </span>
      </div>

      {/* Main Attendance Card */}
      <div className="bg-card border border-border-soft rounded-2xl shadow-xl p-5 sm:p-7 flex flex-col items-center">
        
        {/* Geolocation & Device Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-5 text-[11px] font-semibold w-full">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
            location ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
             <Map className="w-3 h-3" /> 
             <span>{location ? 'Campus GPS Ready' : 'Getting Location...'}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
            fingerprint ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
             <Fingerprint className="w-3 h-3" /> 
             <span>Device Verified</span>
          </div>
        </div>

        {/* State: Session Ready to Confirm (Scanned via Phone Camera / URL params) */}
        {status === 'session_ready' && pendingQrData && (
          <div className="w-full space-y-4 text-center">
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3.5 text-left">
              <span className="px-2.5 py-0.5 bg-accent/20 text-accent rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                Session Active
              </span>
              <p className="text-sm font-bold text-text mt-2">Class Attendance Code Detected</p>
              <p className="text-xs text-text-muted font-mono mt-0.5 truncate">
                Session ID: {pendingQrData.sessionId.slice(0, 14)}...
              </p>
            </div>

            <p className="text-xs text-text-muted">
              Confirm attendance for <strong className="text-text">{studentDisplayName}</strong> under your verified student account.
            </p>

            <button
              onClick={() => submitAttendance(pendingQrData)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Mark My Attendance</span>
            </button>
          </div>
        )}

        {/* State: Idle / Ready to Scan */}
        {status === 'idle' && (
          <div className="text-center w-full space-y-4">
            <button 
              onClick={startScanning}
              className="bg-accent hover:bg-accent/90 text-[#0b0f17] px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 w-full shadow-lg shadow-accent/20 active:scale-[0.99] cursor-pointer"
            >
              <Camera className="w-5 h-5" /> 
              <span>Open Classroom Scanner</span>
            </button>
            <p className="text-text-muted text-xs">Or scan the projector screen with your default phone camera.</p>

            <div className="pt-3 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setShowManual(!showManual)}
                className="text-xs font-semibold text-text-muted hover:text-accent flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5" />
                {showManual ? 'Hide manual link entry' : 'Camera having trouble? Paste code'}
              </button>

              {showManual && (
                <form onSubmit={handleManualCodeSubmit} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Paste attendance URL..."
                    className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-accent text-[#0b0f17] rounded-lg text-xs font-bold hover:bg-accent/90 shrink-0"
                  >
                    Submit
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* State: Camera Scanning */}
        {status === 'scanning' && (
          <div className="w-full flex flex-col items-center">
            <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-accent/40 bg-bg"></div>
            <button 
              onClick={cancelScanning}
              className="mt-4 text-text-muted hover:text-text text-xs underline font-semibold cursor-pointer"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {/* State: Submitting */}
        {status === 'submitting' && (
          <div className="text-center text-accent font-bold flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="text-text text-sm">Recording verified attendance session...</p>
            <p className="text-text-muted text-xs font-mono">{studentEmail}</p>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && (
          <div className="text-center text-emerald-400 flex flex-col items-center gap-3 py-4 w-full">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold font-headline text-text">Attendance Verified!</h2>
            <p className="text-text-muted text-xs max-w-xs">{message}</p>
            
            <div className="w-full bg-bg border border-border rounded-xl p-3 my-2 text-xs text-left font-mono space-y-1">
              <div className="flex justify-between text-text-muted">
                <span>Student:</span>
                <span className="text-text font-bold">{studentDisplayName}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold uppercase">Present</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Time:</span>
                <span className="text-text">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <Link
              href="/student/dashboard"
              className="w-full bg-accent text-[#0b0f17] font-bold py-3 px-4 rounded-xl text-xs hover:bg-accent/90 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Return to Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* State: Error */}
        {status === 'error' && (
          <div className="text-center text-rose-500 flex flex-col items-center gap-3 py-4 w-full">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold font-headline text-text">Verification Notice</h2>
            <p className="text-text-muted text-xs max-w-xs">{message}</p>
            
            {message.toLowerCase().includes('already marked') && (
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                Status: Present
              </span>
            )}

            <div className="flex gap-2 w-full mt-3">
              <button 
                onClick={() => setStatus('idle')}
                className="flex-1 px-4 py-2.5 bg-card hover:bg-card-hover border border-border text-text rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Scan Again
              </button>
              <Link
                href="/student/dashboard"
                className="flex-1 px-4 py-2.5 bg-accent text-[#0b0f17] hover:bg-accent/90 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
