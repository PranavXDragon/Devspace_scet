import { Router } from "express";
import { generateCustomQR, getCustomQRs, deleteCustomQR } from "../controllers/qr.controller.js";
import { verifyAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.use(verifyAdmin); // Ensure only authenticated admins can generate custom QR codes

router.route("/generate").post(generateCustomQR);
router.route("/").get(getCustomQRs);
router.route("/:id").delete(deleteCustomQR);

export default router;
