import express from "express";
import {
  getAllSessions, createSession, updateSession, deleteSession,
  registerForSession, getSessionRegistrations, getMyRegistrations,
} from "../controllers/session.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public — anyone can view sessions
router.get("/",      getAllSessions);

// Protected — only logged-in users can register
router.get("/my-registrations",      protect, getMyRegistrations);
router.post("/:id/register",        protect, registerForSession);

// Admin — CRUD and viewing registrations
router.post("/",                     protect, adminOnly, createSession);
router.put("/:id",                   protect, adminOnly, updateSession);
router.delete("/:id",               protect, adminOnly, deleteSession);
router.get("/:id/registrations",    protect, adminOnly, getSessionRegistrations);

export default router;
