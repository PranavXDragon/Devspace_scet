'use client';
import { useState, useEffect } from 'react';
import { Scan, RefreshCw, Copy, Check, ExternalLink, Globe, Code2 } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminAttendancePage() {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrFormat, setQrFormat] = useState('url'); // 'url' for phone camera, 'json' for raw app payload

  const generateNewQR = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/attendance/generate-qr');
      const payload = res.data?.data || res.data || res;
      if (payload && payload.sessionId) {
        setQrData(payload);
      } else {
        setError('Invalid QR payload received.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate QR code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateNewQR();
    // Auto refresh every 10 mins (expires in 15)
    const interval = setInterval(generateNewQR, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAttendanceUrl = () => {
    if (!qrData) return '';
    const origin = typeof window !== 'undefined' && window.location.origin 
      ? window.location.origin 
      : 'https://devspace-portal.vercel.app';
    return `${origin}/student/attendance?sessionId=${encodeURIComponent(qrData.sessionId)}&t=${qrData.timestamp}&h=${encodeURIComponent(qrData.hash)}`;
  };

  const getQrValue = () => {
    if (!qrData) return '';
    if (qrFormat === 'url') {
      return getAttendanceUrl();
    }
    return JSON.stringify(qrData);
  };

  const handleCopyLink = () => {
    const url = getAttendanceUrl();
    if (url && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className='p-6 md:p-8 h-full flex flex-col max-w-5xl mx-auto'>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Scan className="w-8 h-8 text-blue-500" /> Attendance QR Generator
          </h1>
          <p className='text-text-muted mt-1'>Generate high-contrast, instantly scannable QR codes for classroom attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={generateNewQR}
            disabled={loading}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 shadow-sm text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate QR
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border-soft rounded-2xl shadow-sm flex flex-col items-center justify-center p-6 md:p-12">
        {error ? (
          <div className="text-red-500 font-bold bg-danger/10 border border-danger/20 p-4 rounded-xl">{error}</div>
        ) : !qrData ? (
          <div className="text-text-muted animate-pulse flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-accent" />
            Generating Secure QR Code...
          </div>
        ) : (
          <div className="text-center max-w-lg w-full flex flex-col items-center">
            {/* Format toggle: Web URL (default - works on all phone cameras) vs Raw JSON */}
            <div className="mb-6 inline-flex p-1 bg-card-hover border border-border rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setQrFormat('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  qrFormat === 'url' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Phone Camera URL (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setQrFormat('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  qrFormat === 'json' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                In-App JSON Payload
              </button>
            </div>

            {/* High-Contrast SVG QR Code with Quiet Zone */}
            <div className="bg-white p-6 md:p-8 rounded-2xl inline-block shadow-xl border-4 border-slate-100 transition-all hover:scale-[1.02]">
              <QRCodeSVG 
                value={getQrValue()} 
                size={300} 
                level="M" 
                includeMargin={true}
              />
            </div>

            <p className="mt-6 text-xl font-bold text-text font-headline">DevSpace Class Attendance</p>
            <p className="text-text-muted text-sm mt-1">
              {qrFormat === 'url' 
                ? 'Scan with any mobile phone camera (iOS / Android / Google Lens) or the DevSpace app.'
                : 'Scan using the built-in scanner in the DevSpace student app.'}
            </p>

            {/* Quick Session Code & Copy Link */}
            <div className="mt-6 w-full max-w-md bg-bg border border-border rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="text-left font-mono">
                <span className="text-text-muted block text-[10px] uppercase font-bold">Session ID</span>
                <span className="font-semibold text-text truncate max-w-[200px] inline-block">{qrData.sessionId.slice(0, 13)}...</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-card-hover border border-border rounded-lg text-text font-semibold transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-text-muted mt-4 uppercase tracking-wider font-bold">
              Expires at: {new Date(qrData.timestamp + 15 * 60 * 1000).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
