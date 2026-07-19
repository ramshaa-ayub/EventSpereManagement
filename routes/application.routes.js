import express from "express";
import {
  getAllApplications, createApplication,
  reviewApplication, deleteApplication, getApplicationStats,
  getMyApplications
} from "../controllers/application.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes — static paths (/mine, /stats) MUST come before /:id
router.get("/mine",        protect, getMyApplications);
router.get("/stats",       protect, adminOnly, getApplicationStats);
router.get("/",            getAllApplications);   // public — attendees browse approved exhibitors
router.post("/",           protect, createApplication);
router.patch("/:id/review",protect, adminOnly, reviewApplication);
router.delete("/:id",      protect, adminOnly, deleteApplication);

export default router;