import express from "express";
import {
  sendMessage,
  getContacts,
  getExhibitors,
  getAllContacts,
  getConversation,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteMessage,
} from "../controllers/Message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All message routes require authentication
// NOTE: static paths must come BEFORE /:param routes

router.get(   "/contacts",              protect, getContacts);
router.get(   "/exhibitors",            protect, getExhibitors);
router.get(   "/all-contacts",          protect, getAllContacts);
router.get(   "/unread-count",          protect, getUnreadCount);
router.get(   "/conversation/:otherId", protect, getConversation);
router.post(  "/send",                  protect, sendMessage);
router.patch( "/read-all",              protect, markAllAsRead);
router.patch( "/:id/read",              protect, markAsRead);
router.delete("/:id",                   protect, deleteMessage);

export default router;