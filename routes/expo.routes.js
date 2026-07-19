import express from "express";
import {
  getAllExpos, createExpo, updateExpo, deleteExpo, getExpoStats
} from "../controllers/expo.controller.js";
import { upload } from "../middleware/cloudinaryUpload.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public — anyone can view expos
router.get("/",       getAllExpos);
router.get("/stats",  getExpoStats);

// Protected — admin only; optional image upload via multipart
router.post("/", protect, adminOnly, (req, res, next) => {
  upload.single("img")(req, res, (err) => {
    if (err) {
      console.error("UPLOAD ERROR:", err);
      return res.status(500).json({ message: err.message, stack: err.stack, from: "upload" });
    }
    next();
  });
}, createExpo);
router.put("/:id",   protect, adminOnly, upload.single("img"), updateExpo);
router.delete("/:id",protect, adminOnly, deleteExpo);

export default router;
