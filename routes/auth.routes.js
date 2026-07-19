import express from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload }  from "../middleware/cloudinaryUpload.js";

const router = express.Router();

// Public routes — no token needed
// upload.single("logo") handles multipart/form-data for exhibitor registration
router.post("/register",              upload.single("logo"),     register);
router.post("/login",                     login);
router.post("/forgot-password",           forgotPassword);
router.post("/reset-password/:token",     resetPassword);

// Protected route — token required
router.get("/me", protect, getMe);

export default router;
