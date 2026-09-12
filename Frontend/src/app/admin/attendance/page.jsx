'use client';
import { useState, useEffect } from 'react';
import { Scan, RefreshCw } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { QRCodeCanvas } from 'qrcode.react';

export default function AdminAttendancePage() {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateNewQR = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/attendance/generate-qr');
      setQrData(res.data.data); // Should contain sessionId, timestamp, hash
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

  return (
    <div className='p-8 h-full flex flex-col'>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Scan className="w-8 h-8 text-blue-500" /> Attendance QR Generator
          </h1>
          <p className='text-text-muted mt-2'>Generate secure QR codes for students to scan in-class.</p>
        </div>
        <button 
          onClick={generateNewQR}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Regenerate QR
        </button>
      </div>

      <div className="flex-1 bg-card border border-border-soft rounded-xl shadow-sm flex flex-col items-center justify-center p-12">
        {error ? (
          <div className="text-red-500 font-bold">{error}</div>
        ) : !qrData ? (
          <div className="text-text-muted animate-pulse">Generating Secure QR...</div>
        ) : (
          <div className="text-center">
            <div className="bg-white p-6 rounded-xl inline-block shadow-lg border border-gray-100">
              <QRCodeCanvas 
                value={JSON.stringify(qrData)} 
                size={350} 
                level="H" 
                includeMargin={true}
              />
            </div>
            <p className="mt-8 text-xl font-bold text-text font-headline">DevSpace Class Attendance</p>
            <p className="text-text-muted mt-2">Open your DevSpace app and scan this code.</p>
            <p className="text-xs text-text-muted mt-6 uppercase tracking-wider font-bold">
              Expires at: {new Date(qrData.timestamp + 15 * 60 * 1000).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
