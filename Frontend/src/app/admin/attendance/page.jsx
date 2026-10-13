'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Scan, RefreshCw, Copy, Check, Globe, Code2, Users, 
  Search, Download, Calendar, MapPin, Smartphone, 
  CheckCircle, ArrowUpRight, ShieldCheck, Clock, Filter,
  ChevronDown
} from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'qr'
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrFormat, setQrFormat] = useState('url'); // 'url' | 'json'

  // Records state
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const dateInputRef = useRef(null);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      } catch (e) {
        dateInputRef.current.focus();
      }
    }
  };

  // 1. Fetch QR Code
  const generateNewQR = async () => {
    setQrLoading(true);
    setQrError(null);
    try {
      const res = await axiosInstance.get('/attendance/generate-qr');
      const payload = res.data?.data || res.data || res;
      if (payload && payload.sessionId) {
        setQrData(payload);
      } else {
        setQrError('Invalid QR payload received.');
      }
    } catch (err) {
      console.error(err);
      setQrError('Failed to generate QR code.');
    } finally {
      setQrLoading(false);
    }
  };

  // 2. Fetch Live Attendance Records
  const fetchAttendanceRecords = async () => {
    setRecordsLoading(true);
    try {
      const dateParam = selectedDate ? `?date=${selectedDate}` : '?date=all';
      const res = await axiosInstance.get(`/attendance/records${dateParam}`);
      const list = res.data?.data || res.data || [];
      setRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch attendance records:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    generateNewQR();
    fetchAttendanceRecords();

    // Auto refresh QR every 10 mins (expires in 15)
    const qrInterval = setInterval(generateNewQR, 10 * 60 * 1000);
    return () => clearInterval(qrInterval);
  }, []);

  // Live polling for records every 12 seconds when autoRefresh is enabled
  useEffect(() => {
    fetchAttendanceRecords();
    if (!autoRefresh) return;
    const recordsInterval = setInterval(fetchAttendanceRecords, 12000);
    return () => clearInterval(recordsInterval);
  }, [selectedDate, autoRefresh]);

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

  // Filter records by search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase().trim();
    return records.filter(r => 
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.studentId && r.studentId.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  // Format check-in timestamp to local Indian Standard Time (IST)
  const formatCheckInTime = (record) => {
    if (!record) return '--:--';
    const raw = record.created_at || record.time;
    if (!raw) return record.time || '--:--';
    try {
      const d = new Date(record.created_at || raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      }
    } catch (e) {}
    return record.time || '--:--';
  };

  // Format distance cleanly (meters or km)
  const formatDistance = (dist) => {
    if (!dist && dist !== 0) return 'Campus GPS';
    const raw = typeof dist === 'string' ? dist.replace(/[^\d.]/g, '') : dist;
    const num = parseFloat(raw);
    if (isNaN(num)) return 'Campus GPS';
    if (num < 1000) return `${Math.round(num)}m`;
    return `${(num / 1000).toFixed(1)} km`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!records.length) return;
    const headers = ['Student Name', 'Personal Email', 'Student ID', 'Date', 'Time (IST)', 'Status', 'Distance'];
    const rows = records.map(r => [
      `"${r.name || 'Student'}"`,
      `"${r.email || ''}"`,
      `"${r.studentId || ''}"`,
      `"${r.date || ''}"`,
      `"${formatCheckInTime(r)}"`,
      `"${r.status || 'present'}"`,
      `"${formatDistance(r.distance)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DevSpace_Attendance_${selectedDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latestCheckIn = records.length > 0 ? records[0] : null;

  return (
    <div className='p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6'>
      
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-soft pb-5">
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold font-headline text-text flex items-center gap-3'>
            <Scan className="w-8 h-8 text-accent" />
            Classroom Attendance Hub
          </h1>
          <p className='text-text-muted text-xs sm:text-sm mt-1'>
            Live check-in monitoring and high-contrast projector QR code generation.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-accent text-[#0b0f17] shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Live Check-Ins</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'roster' ? 'bg-[#0b0f17]/20 text-[#0b0f17]' : 'bg-bg text-accent'
            }`}>
              {records.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-accent text-[#0b0f17] shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Display QR Code</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border-soft rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-text-muted text-xs font-mono uppercase tracking-wider mb-2">
            <span>Present Today</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-headline text-text">
            {records.length}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Verified Attendees
          </p>
        </div>

        <div className="bg-card border border-border-soft rounded-2xl p-4 shadow-sm">
          <div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-2">
            Latest Check-In
          </div>
          <div className="text-sm font-bold text-text truncate">
            {latestCheckIn ? latestCheckIn.name : 'Waiting...'}
          </div>
          <p className="text-xs text-accent mt-1 font-mono font-semibold truncate flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{latestCheckIn ? formatCheckInTime(latestCheckIn) : 'No check-ins yet'}</span>
          </p>
        </div>

        <div className="bg-card border border-border-soft rounded-2xl p-4 shadow-sm">
          <div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-2">
            Session Status
          </div>
          <div className="text-sm font-bold text-accent flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>Active & Scannable</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1 font-mono">
            {qrData ? `ID: ${qrData.sessionId.slice(0, 10)}...` : 'Generating...'}
          </p>
        </div>

        <div className="bg-card border border-border-soft rounded-2xl p-4 shadow-sm">
          <div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-2">
            Verification
          </div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> GPS & Device
          </div>
          <p className="text-[11px] text-text-muted mt-1 font-mono">
            Campus Geofence Active
          </p>
        </div>
      </div>

      {/* TAB 1: LIVE ATTENDANCE ROSTER */}
      {activeTab === 'roster' && (
        <div className="bg-card border border-border-soft rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
          
          {/* Controls Bar: Search, Date Filter, Refresh, Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search attendee by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Clickable Date Picker & Quick Selectors */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div 
                  onClick={handleOpenDatePicker}
                  className="flex items-center gap-2 bg-bg hover:bg-card-hover border border-border hover:border-accent/60 px-3 py-1.5 rounded-xl text-xs font-semibold text-text transition-all cursor-pointer select-none group shadow-sm relative overflow-hidden"
                  title="Click anywhere to change date"
                >
                  <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="font-mono text-text font-bold">
                    {selectedDate 
                      ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'All History'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors shrink-0" />

                  {/* Transparent overlay input so clicking anywhere triggers native picker */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Quick "Today" jump button */}
                {selectedDate !== todayStr && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className="px-2.5 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/25 text-accent rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Today
                  </button>
                )}

                {/* Quick "All Dates" toggle */}
                <button
                  type="button"
                  onClick={() => setSelectedDate(selectedDate ? '' : todayStr)}
                  className={`px-2.5 py-1.5 border rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    !selectedDate 
                      ? 'bg-accent text-[#0b0f17] border-accent shadow-sm' 
                      : 'bg-bg hover:bg-card-hover border-border text-text-muted'
                  }`}
                >
                  {!selectedDate ? 'Showing All' : 'All Dates'}
                </button>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={fetchAttendanceRecords}
                disabled={recordsLoading}
                className="flex items-center gap-1.5 bg-bg hover:bg-card-hover border border-border px-3 py-2 rounded-xl text-xs font-semibold text-text transition-colors cursor-pointer"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-accent ${recordsLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={!records.length}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-[#0b0f17] px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="overflow-x-auto rounded-xl border border-border-soft">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg/80 text-text-muted uppercase text-[10px] font-mono tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Personal Email</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft font-sans">
                {recordsLoading && records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
                      <RefreshCw className="w-6 h-6 animate-spin text-accent mx-auto mb-2" />
                      Loading attendance records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted space-y-2">
                      <Users className="w-8 h-8 text-text-muted/40 mx-auto" />
                      <p className="font-semibold text-text text-sm">No Attendance Records Found</p>
                      <p className="text-xs max-w-sm mx-auto">
                        {searchQuery 
                          ? `No students matching "${searchQuery}"`
                          : `No students have checked in for ${selectedDate} yet. Project the QR code on screen to start session.`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('qr')}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-lg text-xs font-bold hover:bg-accent/20"
                      >
                        <Scan className="w-3.5 h-3.5" /> Display Projector QR
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-card-hover/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs shrink-0">
                            {(r.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-text text-xs sm:text-sm block">{r.name}</span>
                            <span className="text-[10px] text-text-muted font-mono">{r.studentId || 'ID Verified'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-text-muted text-xs">
                        {r.email}
                      </td>
                      <td className="py-3.5 px-4 text-text text-xs whitespace-nowrap min-w-[130px]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg border border-border rounded-lg font-mono font-semibold text-text shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="tracking-tight">{formatCheckInTime(r)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                          <Check className="w-3 h-3" /> Present
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted font-mono" title={`GPS Distance: ${r.distance || '0m'}`}>
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" /> {formatDistance(r.distance)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-semibold">
                            <Smartphone className="w-3 h-3 text-accent shrink-0" /> Device OK
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Roster Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted pt-2 gap-2">
            <span>Showing {filteredRecords.length} of {records.length} total student check-in(s) for {selectedDate}</span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Live Attendance Sync Active</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASSROOM QR CODE GENERATOR */}
      {activeTab === 'qr' && (
        <div className="bg-card border border-border-soft rounded-2xl shadow-sm flex flex-col items-center justify-center p-6 md:p-12">
          {qrError ? (
            <div className="text-red-500 font-bold bg-danger/10 border border-danger/20 p-4 rounded-xl">{qrError}</div>
          ) : !qrData ? (
            <div className="text-text-muted animate-pulse flex items-center gap-2 py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-accent" />
              Generating Secure QR Code...
            </div>
          ) : (
            <div className="text-center max-w-lg w-full flex flex-col items-center">
              
              {/* Format toggle: Web URL vs Raw JSON */}
              <div className="mb-6 inline-flex p-1 bg-card-hover border border-border rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setQrFormat('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    qrFormat === 'url' ? 'bg-accent text-[#0b0f17] shadow-sm font-bold' : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Phone Camera URL (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setQrFormat('json')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    qrFormat === 'json' ? 'bg-accent text-[#0b0f17] shadow-sm font-bold' : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  In-App JSON Payload
                </button>
              </div>

              {/* High-Contrast SVG QR Code with Quiet Zone */}
              <div className="bg-white p-6 md:p-8 rounded-2xl inline-block shadow-2xl border-4 border-slate-100 transition-all hover:scale-[1.01]">
                <QRCodeSVG 
                  value={getQrValue()} 
                  size={300} 
                  level="M" 
                  includeMargin={true}
                />
              </div>

              <p className="mt-6 text-xl font-bold text-text font-headline">DevSpace Classroom Session</p>
              <p className="text-text-muted text-xs sm:text-sm mt-1 max-w-sm">
                Students can scan this screen with any mobile camera (iOS / Android / Lens) or the DevSpace app.
              </p>

              {/* Quick Session Code & Copy Link */}
              <div className="mt-5 w-full max-w-md bg-bg border border-border rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="text-left font-mono overflow-hidden">
                  <span className="text-text-muted block text-[10px] uppercase font-bold">Session ID</span>
                  <span className="font-semibold text-text truncate max-w-[200px] inline-block">{qrData.sessionId.slice(0, 14)}...</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-card-hover border border-border rounded-lg text-text font-semibold transition-colors shrink-0 cursor-pointer"
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

              {/* Status & Expiry */}
              <div className="flex items-center justify-between w-full max-w-md mt-4 text-xs font-mono">
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5" /> {records.length} Student(s) Checked In
                </span>
                <span className="text-text-muted uppercase font-bold">
                  Expires: {new Date(qrData.timestamp + 15 * 60 * 1000).toLocaleTimeString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full max-w-md mt-6">
                <button 
                  onClick={generateNewQR}
                  disabled={qrLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-card hover:bg-card-hover border border-border text-text px-4 py-2.5 rounded-xl font-bold transition-colors text-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-accent ${qrLoading ? 'animate-spin' : ''}`} />
                  Regenerate QR
                </button>
                <button
                  onClick={() => setActiveTab('roster')}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-[#0b0f17] px-4 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm"
                >
                  <Users className="w-3.5 h-3.5" />
                  View Live Roster ({records.length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
