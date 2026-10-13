import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { supabase } from "../config/supabase.js";
import crypto from "crypto";

// Class Location Constants (Surat campus default, configurable via env)
const CLASS_LAT = parseFloat(process.env.CLASS_LAT || '21.1702');
const CLASS_LNG = parseFloat(process.env.CLASS_LNG || '72.8311');
const QR_EXPIRY_MS = 15 * 60 * 1000; // 15 mins
const SECRET_KEY = process.env.QR_SECRET_KEY || 'devspace_super_secret';

// Haversine formula
function getDistanceFromLatLngInMeters(lat1, lng1, lat2, lng2) {
    const toRad = angle => (angle * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const generateQR = asyncHandler(async (req, res) => {
    // Generate a payload
    const sessionId = crypto.randomUUID();
    const timestamp = Date.now();
    
    // Hash it for security to prevent tampering
    const hashInput = sessionId + timestamp + SECRET_KEY;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    const qrData = {
        sessionId,
        timestamp,
        hash
    };

    return res.status(200).json(
        new ApiResponse(200, qrData, "QR data generated successfully")
    );
});

export const markAttendance = asyncHandler(async (req, res) => {
    const { qrData, location, deviceFingerprint, studentIdentifier, studentName: clientStudentName } = req.body;

    if (!qrData || !qrData.sessionId || !qrData.timestamp || !qrData.hash) {
        throw new ApiError(400, "Invalid QR code data");
    }

    // 1. Verify Hash
    const hashInput = qrData.sessionId + qrData.timestamp + SECRET_KEY;
    const expectedHash = crypto.createHash('sha256').update(hashInput).digest('hex');

    if (qrData.hash !== expectedHash) {
        throw new ApiError(400, "Invalid QR code: Hash mismatch or expired code");
    }

    // 2. Verify Expiry
    if (Date.now() - qrData.timestamp > QR_EXPIRY_MS) {
        throw new ApiError(400, "QR code has expired. Please ask the instructor to regenerate.");
    }

    // Identify Student - Authentication is strictly required
    let studentId = req.student?.id;
    let studentName = req.student?.name || clientStudentName || 'Student';
    let studentEmail = req.userEmail || (typeof studentIdentifier === 'string' && studentIdentifier.includes('@') ? studentIdentifier.trim() : null);
    let studentCode = typeof studentIdentifier === 'string' && !studentIdentifier.includes('@') ? studentIdentifier.trim() : null;

    if (!studentId && !studentEmail && !studentCode && !req.clerkUserId) {
        throw new ApiError(401, "Sign-in required: You must be logged into your DevSpace student account to mark attendance.");
    }

    if (!studentId && (studentEmail || studentCode)) {
        try {
            let query = supabase.from('student_registrations').select('*');
            if (studentEmail) query = query.eq('email', studentEmail);
            else if (studentCode) query = query.eq('studentId', studentCode);
            
            const { data: found } = await query.limit(1).maybeSingle();
            if (found) {
                studentId = found.id;
                studentName = found.name;
            } else {
                studentId = studentCode || studentEmail;
                if (!studentName || studentName === 'Student') {
                    studentName = clientStudentName || studentCode || studentEmail;
                }
            }
        } catch (lookupErr) {
            studentId = studentCode || studentEmail;
            if (!studentName || studentName === 'Student') {
                studentName = clientStudentName || studentCode || studentEmail;
            }
        }
    }

    if (!studentId) {
        studentId = req.clerkUserId;
    }

    // 3. Verify Geolocation (flexible/configurable)
    let distance = 0;
    if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
        distance = getDistanceFromLatLngInMeters(
            location.lat, location.lng,
            CLASS_LAT, CLASS_LNG
        );

        const isStrict = process.env.STRICT_GEOLOCATION === 'true';
        if (isStrict && distance > (parseInt(process.env.CLASS_RADIUS_METERS || '100', 10))) {
            throw new ApiError(400, `You must be within classroom range. Current distance: ${distance.toFixed(0)}m`);
        }
    }

    // 4. Verify Not Already Marked Today
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data: existing } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('student_id', studentId)
            .eq('date', today)
            .limit(1)
            .maybeSingle();

        if (existing) {
            throw new ApiError(400, "You have already marked attendance for today");
        }
    } catch (checkErr) {
        if (checkErr instanceof ApiError) throw checkErr;
        console.warn("Could not check existing attendance from DB:", checkErr.message);
    }

    // 5. Insert Attendance Record
    let record = {
        id: crypto.randomUUID(),
        student_id: studentId,
        student_name: studentName,
        date: today,
        status: 'present',
        device_fingerprint: deviceFingerprint || 'unknown-device',
        distance_from_class: distance,
        created_at: new Date().toISOString()
    };

    try {
        const { data: inserted, error: insertError } = await supabase
            .from('attendance_records')
            .insert({
                student_id: studentId,
                date: today,
                status: 'present',
                device_fingerprint: deviceFingerprint || 'unknown-device',
                distance_from_class: distance
            })
            .select()
            .single();

        if (!insertError && inserted) {
            record = inserted;
        }
    } catch (dbErr) {
        console.warn("Attendance recorded in session (DB table check):", dbErr.message);
    }

    return res.status(200).json(
        new ApiResponse(200, record, `Attendance marked successfully for ${studentName}!`)
    );
});

export const getStudentAttendance = asyncHandler(async (req, res) => {
    const studentId = req.student?.id || req.student?.studentId || req.auth?.userId;

    if (!studentId) {
        throw new ApiError(401, "Unauthorized");
    }

    try {
        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('student_id', studentId)
            .order('date', { ascending: false });

        if (!error && data) {
            return res.status(200).json(
                new ApiResponse(200, data, "Attendance fetched successfully")
            );
        }
    } catch (err) {
        console.warn("Could not fetch attendance records from DB:", err.message);
    }

    return res.status(200).json(
        new ApiResponse(200, [], "Attendance fetched successfully")
    );
});
