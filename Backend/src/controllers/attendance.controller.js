import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { supabase } from "../config/supabase.js";
import crypto from "crypto";

// Class Location Constants (Example)
const CLASS_LAT = 30.2679634;
const CLASS_LNG = 77.991887;
const MAX_DISTANCE_METERS = 100; // Realistic limit: 100m
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
    const { qrData, location, deviceFingerprint } = req.body;
    const studentId = req.student?.id; // Assuming auth middleware sets this

    if (!studentId) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!qrData || !qrData.sessionId || !qrData.timestamp || !qrData.hash) {
        throw new ApiError(400, "Invalid QR code data");
    }

    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        throw new ApiError(400, "Location (lat, lng) is required");
    }

    // 1. Verify Hash
    const hashInput = qrData.sessionId + qrData.timestamp + SECRET_KEY;
    const expectedHash = crypto.createHash('sha256').update(hashInput).digest('hex');

    if (qrData.hash !== expectedHash) {
        throw new ApiError(400, "Invalid QR code: Hash mismatch");
    }

    // 2. Verify Expiry
    if (Date.now() - qrData.timestamp > QR_EXPIRY_MS) {
        throw new ApiError(400, "QR code has expired");
    }

    // 3. Verify Geolocation
    const distance = getDistanceFromLatLngInMeters(
        location.lat, location.lng,
        CLASS_LAT, CLASS_LNG
    );

    if (distance > MAX_DISTANCE_METERS) {
        throw new ApiError(400, `You must be within ${MAX_DISTANCE_METERS}m of the classroom. Current distance: ${distance.toFixed(0)}m`);
    }

    // 4. Verify Not Already Marked Today
    const today = new Date().toISOString().split('T')[0];

    const { data: existing, error: checkError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .eq('date', today)
        .single();

    if (existing) {
        throw new ApiError(400, "You've already marked attendance today");
    }

    // 5. Insert Attendance Record
    const { data: record, error: insertError } = await supabase
        .from('attendance_records')
        .insert({
            student_id: studentId,
            date: today,
            status: 'present',
            device_fingerprint: deviceFingerprint,
            distance_from_class: distance
        })
        .select()
        .single();

    if (insertError) {
        throw new ApiError(500, "Failed to mark attendance: " + insertError.message);
    }

    return res.status(200).json(
        new ApiResponse(200, record, "Attendance marked successfully")
    );
});

export const getStudentAttendance = asyncHandler(async (req, res) => {
    const studentId = req.student?.id;

    if (!studentId) {
        throw new ApiError(401, "Unauthorized");
    }

    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

    if (error) {
        throw new ApiError(500, "Failed to fetch attendance");
    }

    return res.status(200).json(
        new ApiResponse(200, data, "Attendance fetched successfully")
    );
});
