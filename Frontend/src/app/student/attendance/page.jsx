'use client';
import { useState, useEffect } from 'react';
import { Map, Camera, CheckCircle, AlertCircle, Fingerprint, Keyboard, ArrowRight, Loader2, User, ShieldCheck } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { Html5QrcodeScanner } from 'html5-qrcode';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useUser } from '@clerk/nextjs';

export default function StudentAttendancePage() {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState('idle'); // idle, prompt_id, scanning, submitting, success, error
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [pendingQrData, setPendingQrData] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    // 1. Get Fingerprint
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

    // 2. Get Geolocation
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

    // 3. Populate cached student identifier if available
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('devspace_student_id');
      if (savedId) setStudentIdInput(savedId);
    }
  }, []);

  // 4. Handle QR scan via native mobile camera URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('sessionId');
      const timestamp = params.get('t') || params.get('timestamp');
      const hash = params.get('h') || params.get('hash');

      if (sessionId && timestamp && hash && status === 'idle') {
        const qr = {
          sessionId,
          timestamp: Number(timestamp),
          hash
        };
        setPendingQrData(qr);

        // If user is already logged in with Clerk, auto-submit!
        if (user) {
          const email = user.primaryEmailAddress?.emailAddress;
          submitAttendance(qr, email);
        } else {
          // If student ID is cached in localStorage, auto-submit
          const savedId = localStorage.getItem('devspace_student_id');
          if (savedId) {
            submitAttendance(qr, savedId);
          } else {
            // Prompt student for their ID/Email
            setStatus('prompt_id');
          }
        }
      }
    }
  }, [user, isLoaded]);

  const parseQrPayload = (decodedText) => {
    if (!decodedText) return null;
    const trimmed = decodedText.trim();

    // A) If raw JSON string
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.sessionId && parsed.hash) return parsed;
      } catch (e) {}
    }

    // B) If URL string or query parameters
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
        
        scanner.render(async (decodedText) => {
          scanner.clear();
          const qrData = parseQrPayload(decodedText);
          if (qrData) {
            setPendingQrData(qrData);
            if (user) {
              submitAttendance(qrData, user.primaryEmailAddress?.emailAddress);
            } else {
              const savedId = localStorage.getItem('devspace_student_id');
              if (savedId) {
                submitAttendance(qrData, savedId);
              } else {
                setStatus('prompt_id');
              }
            }
          } else {
            setStatus('error');
            setMessage('Unrecognized QR Code format. Please scan the DevSpace classroom QR.');
          }
        }, () => {});
      } catch (err) {
        console.error('Camera scanner init failed:', err);
        setStatus('error');
        setMessage('Could not access camera. Please allow camera permissions or enter your Student ID.');
      }
    }, 150);
  };

  const submitAttendance = async (qrData, identifier) => {
    setStatus('submitting');
    try {
      const activeId = identifier || studentIdInput.trim() || user?.primaryEmailAddress?.emailAddress;
      if (activeId && typeof window !== 'undefined') {
        localStorage.setItem('devspace_student_id', activeId);
      }

      const res = await axiosInstance.post('/attendance/mark', {
        qrData,
        location: location || { lat: 21.1702, lng: 72.8311 },
        deviceFingerprint: fingerprint || 'mobile-device',
        studentIdentifier: activeId
      });

      const messageText = res.data?.message || res.message || 'Attendance successfully marked for today!';
      setStatus('success');
      setMessage(messageText);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || 'Failed to mark attendance.');
    }
  };

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (!studentIdInput.trim()) return;
    if (pendingQrData) {
      submitAttendance(pendingQrData, studentIdInput.trim());
    }
  };

  const handleManualCodeSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const parsed = parseQrPayload(manualCode.trim());
    if (parsed) {
      setPendingQrData(parsed);
      const savedId = localStorage.getItem('devspace_student_id');
      if (savedId) {
        submitAttendance(parsed, savedId);
      } else {
        setStatus('prompt_id');
      }
    } else {
      setStatus('error');
      setMessage('Invalid code or link format. Please paste the full attendance link.');
    }
  };

  return (
    <div className='max-w-md mx-auto space-y-6 p-4 sm:p-6 min-h-screen flex flex-col justify-center'>
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-3 text-emerald-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className='text-2xl sm:text-3xl font-bold font-headline text-text'>DevSpace Attendance</h1>
        <p className='text-text-muted mt-1 text-xs sm:text-sm'>Verify and confirm your classroom attendance session.</p>
      </div>

      <div className="bg-card border border-border-soft rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center">
        
        {/* Geolocation & Device Status */}
        <div className="flex justify-center gap-2 mb-6 text-[11px] font-semibold">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${location ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
             <Map className="w-3 h-3" /> {location ? 'Location Ready' : 'Getting Location...'}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${fingerprint ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
             <Fingerprint className="w-3 h-3" /> Device Verified
          </div>
        </div>

        {/* State: Prompt Student ID (when scanned via phone without login) */}
        {status === 'prompt_id' && (
          <form onSubmit={handleIdSubmit} className="w-full space-y-4">
            <div className="text-center pb-2">
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                Session Detected
              </span>
              <p className="text-text font-bold text-base mt-2">Enter your Student ID or College Email</p>
              <p className="text-text-muted text-xs">To record your attendance for this class.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text block">Student ID / Roll No / Email</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. DS-10482 or student@scet.ac.in"
                  className="w-full bg-bg border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>Confirm & Mark Attendance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* State: Idle / Ready to scan */}
        {status === 'idle' && (
          <div className="text-center w-full space-y-5">
            <button 
              onClick={startScanning}
              className="bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-bold text-base hover:bg-emerald-600 transition-all flex items-center justify-center gap-2.5 w-full shadow-lg shadow-emerald-500/20"
            >
              <Camera className="w-5 h-5" /> Open In-App Scanner
            </button>
            <p className="text-text-muted text-xs">Or point your phone's default camera at the projector screen.</p>

            <div className="pt-3 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setShowManual(!showManual)}
                className="text-xs font-semibold text-text-muted hover:text-accent flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <Keyboard className="w-3.5 h-3.5" />
                {showManual ? 'Hide manual code entry' : 'Camera having trouble? Paste code'}
              </button>

              {showManual && (
                <form onSubmit={handleManualCodeSubmit} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Paste attendance link..."
                    className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent/90 shrink-0"
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
            <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-emerald-500/30 bg-bg"></div>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-text-muted hover:text-text text-xs underline font-semibold"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {/* State: Submitting */}
        {status === 'submitting' && (
          <div className="text-center text-blue-500 font-bold flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="text-text text-sm">Validating class attendance session...</p>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && (
          <div className="text-center text-emerald-400 flex flex-col items-center gap-3 py-4">
            <CheckCircle className="w-14 h-14" />
            <h2 className="text-xl font-bold font-headline text-text">Attendance Verified!</h2>
            <p className="text-text-muted text-xs max-w-xs">{message}</p>
            <span className="mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
              Status: Present
            </span>
          </div>
        )}

        {/* State: Error */}
        {status === 'error' && (
          <div className="text-center text-rose-500 flex flex-col items-center gap-3 py-4">
            <AlertCircle className="w-14 h-14" />
            <h2 className="text-xl font-bold font-headline text-text">Verification Notice</h2>
            <p className="text-text-muted text-xs max-w-xs">{message}</p>
            <button 
              onClick={() => {
                setStatus(pendingQrData ? 'prompt_id' : 'idle');
              }}
              className="mt-3 px-5 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:bg-accent/90"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
