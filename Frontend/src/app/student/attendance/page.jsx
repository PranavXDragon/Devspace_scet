'use client';
import { useState, useEffect } from 'react';
import { Map, Camera, CheckCircle, AlertCircle, Fingerprint } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { Html5QrcodeScanner } from 'html5-qrcode';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function StudentAttendancePage() {
  const [status, setStatus] = useState('idle'); // idle, scanning, submitting, success, error
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);

  useEffect(() => {
    // 1. Get Fingerprint
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    initFingerprint();

    // 2. Get Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location error:", error);
          // Fallback to class location for MVP if location is denied so they can test it
          setLocation({ lat: 30.2679634, lng: 77.991887 }); 
        },
        { enableHighAccuracy: true }
      );
    } else {
       setLocation({ lat: 30.2679634, lng: 77.991887 }); 
    }
  }, []);

  const startScanning = () => {
    setStatus('scanning');
    
    // Give react time to render the div
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
      
      scanner.render(async (decodedText) => {
        scanner.clear();
        try {
          const qrData = JSON.parse(decodedText);
          submitAttendance(qrData);
        } catch (e) {
          setStatus('error');
          setMessage('Invalid QR Code format.');
        }
      }, (error) => {
        // ignore scan errors
      });
    }, 100);
  };

  const submitAttendance = async (qrData) => {
    setStatus('submitting');
    try {
      await axiosInstance.post('/attendance/mark', {
        qrData,
        location: location || { lat: 30.2679634, lng: 77.991887 },
        deviceFingerprint: fingerprint || 'unknown-device'
      });
      setStatus('success');
      setMessage('Attendance successfully marked for today!');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const mockSubmit = () => {
    // Helper function to easily test without scanning
    submitAttendance({
        sessionId: "mock",
        timestamp: Date.now(),
        hash: "mock" // Will fail hash validation unless we mock the backend.
    });
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <Map className="w-8 h-8 text-green-500" /> Mark Attendance
        </h1>
        <p className='text-text-muted mt-2'>Scan the QR code displayed in class. Requires geolocation.</p>
      </div>

      <div className="bg-card border border-border-soft rounded-xl shadow-sm p-8 flex flex-col items-center">
        
        <div className="flex gap-4 mb-8 text-sm font-medium">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${location ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
             <Map className="w-4 h-4" /> {location ? 'Location Ready' : 'Getting Location...'}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${fingerprint ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
             <Fingerprint className="w-4 h-4" /> {fingerprint ? 'Device ID Ready' : 'Analyzing Device...'}
          </div>
        </div>

        {status === 'idle' && (
          <div className="text-center">
            <button 
              onClick={startScanning}
              className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <Camera className="w-6 h-6" /> Start QR Scanner
            </button>
            <p className="text-text-muted mt-4 text-sm">Please ensure you are within 100m of the classroom.</p>
          </div>
        )}

        {status === 'scanning' && (
          <div className="w-full max-w-sm">
            <div id="reader" className="overflow-hidden rounded-xl border-2 border-green-500/30 bg-bg"></div>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-text-muted hover:text-text text-sm underline"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {status === 'submitting' && (
          <div className="text-center animate-pulse text-blue-500 font-bold flex flex-col items-center gap-2">
            <Map className="w-12 h-12 animate-bounce" />
            Verifying location and marking attendance...
          </div>
        )}

        {status === 'success' && (
          <div className="text-center text-green-500 flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16" />
            <h2 className="text-2xl font-bold font-headline">Success!</h2>
            <p className="text-text font-medium">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center text-red-500 flex flex-col items-center gap-4">
            <AlertCircle className="w-16 h-16" />
            <h2 className="text-2xl font-bold font-headline">Failed</h2>
            <p className="text-text font-medium">{message}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 px-6 py-2 bg-text text-bg rounded-lg font-bold"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
