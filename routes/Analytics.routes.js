import express from "express";
import {
  getAnalytics,
  getEngagement,
  getAppStatus,
  getBoothTraffic,
} from "../controllers/Analytics.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only analytics routes
router.get("/",              protect, adminOnly, getAnalytics);
router.get("/engagement",    protect, adminOnly, getEngagement);
router.get("/app-status",    protect, adminOnly, getAppStatus);
router.get("/booth-traffic", protect, adminOnly, getBoothTraffic);

export default router;