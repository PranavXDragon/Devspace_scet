import { Router } from "express";
import { generateQR, markAttendance, getStudentAttendance } from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Student Routes
router.post("/mark", verifyJWT, markAttendance);
router.get("/my-attendance", verifyJWT, getStudentAttendance);

// Admin Routes
router.get("/generate-qr", verifyAdmin, generateQR);

export default router;
