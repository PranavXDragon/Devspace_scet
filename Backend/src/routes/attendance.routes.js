import { Router } from "express";
import { generateQR, markAttendance, getStudentAttendance } from "../controllers/attendance.controller.js";
import { verifyStudentJWT } from "../middlewares/studentAuth.middleware.js";
import { verifyAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Student Routes
router.post("/mark", verifyStudentJWT, markAttendance);
router.get("/my-attendance", verifyStudentJWT, getStudentAttendance);

// Admin Routes
router.get("/generate-qr", verifyAdmin, generateQR);

export default router;
