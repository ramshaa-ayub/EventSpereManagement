import express from "express";
import { getAllUsers, getUserStats, deleteUser, updateProfile } from "../controllers/user.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/cloudinaryUpload.js";

const router = express.Router();

// Protected — admin only
router.get("/",       protect, adminOnly, getAllUsers);
router.get("/stats",  protect, adminOnly, getUserStats);
router.delete("/:id", protect, adminOnly, deleteUser);

// Protected — user profile update
router.put("/profile", protect, upload.single("logo"), updateProfile);

export default router;