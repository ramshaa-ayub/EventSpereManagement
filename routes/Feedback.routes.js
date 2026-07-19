import express from "express";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} from "../controllers/Feedback.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public — anyone can submit feedback
router.post(  "/",           createFeedback);

// Protected — admin only for management
router.get(   "/",           protect, adminOnly, getAllFeedback);
router.get(   "/:id",        protect, adminOnly, getFeedbackById);
router.put(   "/:id",        protect, adminOnly, updateFeedback);
router.patch( "/:id/status", protect, adminOnly, updateFeedbackStatus);
router.delete("/:id",        protect, adminOnly, deleteFeedback);

export default router;