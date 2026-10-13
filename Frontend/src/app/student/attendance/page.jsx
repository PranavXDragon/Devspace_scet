'use client';
import { useState, useEffect } from 'react';
import { Map, Camera, CheckCircle, AlertCircle, Fingerprint, Keyboard, ArrowRight, Loader2 } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { Html5QrcodeScanner } from 'html5-qrcode';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function StudentAttendancePage() {
  const [status, setStatus] = useState('idle'); // idle, scanning, submitting, success, error
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    // 1. Get Fingerprint
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (err) {
        setFingerprint('browser-device-' + Date.now());
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
          // Fallback location
          setLocation({ lat: 21.1702, lng: 72.8311 }); 
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocation({ lat: 21.1702, lng: 72.8311 }); 
    }
  }, []);

  // 3. Auto-submit if student scanned with native phone camera and landed here via URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('sessionId');
      const timestamp = params.get('t') || params.get('timestamp');
      const hash = params.get('h') || params.get('hash');

      if (sessionId && timestamp && hash && status === 'idle') {
        submitAttendance({
          sessionId,
          timestamp: Number(timestamp),
          hash
        });
      }
    }
  }, [fingerprint]);

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
            submitAttendance(qrData);
          } else {
            setStatus('error');
            setMessage('Unrecognized QR Code format. Please scan the DevSpace classroom QR.');
          }
        }, () => {
          // Ignore interim scan frame failures
        });
      } catch (err) {
        console.error('Camera scanner init failed:', err);
        setStatus('error');
        setMessage('Could not access camera. Please allow camera permissions or enter the session code manually.');
      }
    }, 150);
  };

  const submitAttendance = async (qrData) => {
    setStatus('submitting');
    try {
      await axiosInstance.post('/attendance/mark', {
        qrData,
        location: location || { lat: 21.1702, lng: 72.8311 },
        deviceFingerprint: fingerprint || 'web-client'
      });
      setStatus('success');
      setMessage('Attendance successfully marked for today!');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || 'Failed to mark attendance.');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const parsed = parseQrPayload(manualCode.trim());
    if (parsed) {
      submitAttendance(parsed);
    } else {
      setStatus('error');
      setMessage('Invalid session code format. Paste the complete attendance link or payload.');
    }
  };

  return (
    <div className='max-w-4xl mx-auto space-y-8 p-4 sm:p-6'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Map className="w-8 h-8 text-green-500" /> Mark Attendance
        </h1>
        <p className='text-text-muted mt-2'>Scan the classroom QR code or open it with your phone camera.</p>
      </div>

      <div className="bg-card border border-border-soft rounded-2xl shadow-sm p-6 sm:p-10 flex flex-col items-center">
        
        <div className="flex flex-wrap justify-center gap-3 mb-8 text-xs font-semibold">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border ${location ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
             <Map className="w-3.5 h-3.5" /> {location ? 'Location Ready' : 'Getting Location...'}
          </div>
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border ${fingerprint ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
             <Fingerprint className="w-3.5 h-3.5" /> {fingerprint ? 'Device ID Ready' : 'Analyzing Device...'}
          </div>
        </div>

        {status === 'idle' && (
          <div className="text-center w-full max-w-md space-y-6">
            <button 
              onClick={startScanning}
              className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 w-full shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <Camera className="w-6 h-6" /> Open Scanner Camera
            </button>
            <p className="text-text-muted text-xs">Point your device camera at the Attendance QR code on the projector or screen.</p>

            <div className="pt-4 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setShowManual(!showManual)}
                className="text-xs font-semibold text-text-muted hover:text-accent flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <Keyboard className="w-3.5 h-3.5" />
                {showManual ? 'Hide manual entry' : 'Camera having issues? Enter link or code'}
              </button>

              {showManual && (
                <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Paste attendance link or code..."
                    className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent/90"
                  >
                    Submit
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {status === 'scanning' && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-emerald-500/30 bg-bg"></div>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-text-muted hover:text-text text-xs underline font-semibold"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {status === 'submitting' && (
          <div className="text-center text-blue-500 font-bold flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-accent" />
            <p className="text-text text-sm">Validating class attendance session...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center text-emerald-500 flex flex-col items-center gap-3 py-6">
            <CheckCircle className="w-16 h-16 animate-in zoom-in-75 duration-300" />
            <h2 className="text-2xl font-bold font-headline text-text">Attendance Verified!</h2>
            <p className="text-text-muted text-sm">{message}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 px-6 py-2 bg-card hover:bg-card-hover border border-border text-text rounded-lg text-xs font-semibold"
            >
              Back to Home
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center text-rose-500 flex flex-col items-center gap-3 py-6">
            <AlertCircle className="w-16 h-16 animate-in shake duration-300" />
            <h2 className="text-2xl font-bold font-headline text-text">Attendance Failed</h2>
            <p className="text-text-muted text-sm max-w-md">{message}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 px-6 py-2 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent/90"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
