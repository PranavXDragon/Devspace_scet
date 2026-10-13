import { Router } from "express";
import { generateQR, markAttendance, getStudentAttendance } from "../controllers/attendance.controller.js";
import { verifyStudentJWT } from "../middlewares/studentAuth.middleware.js";
import { verifyAdmin } from "../middlewares/adminAuth.middleware.js";
import { getAuth, clerkClient } from "@clerk/express";

const optionalStudentAuth = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      req.clerkUserId = auth.userId;
      const user = await clerkClient.users.getUser(auth.userId);
      if (user?.emailAddresses?.[0]?.emailAddress) {
        req.userEmail = user.emailAddresses[0].emailAddress;
      }
    }
  } catch (err) {
    // Optional auth, proceed without blocking mobile attendance
  }
  next();
};

const router = Router();

// Student Routes
router.post("/mark", optionalStudentAuth, markAttendance);
router.get("/my-attendance", verifyStudentJWT, getStudentAttendance);

// Admin Routes
router.get("/generate-qr", verifyAdmin, generateQR);

export default router;
