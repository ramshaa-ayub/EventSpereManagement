import express from "express";
import { getAllBooths, createBooth, updateBooth, deleteBooth } from "../controllers/booth.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public — anyone can view booths (floor plan)
router.get("/",        getAllBooths);

// Protected — admin only for CRUD
router.post("/",       protect, adminOnly, createBooth);
router.put("/:id",     protect, updateBooth);
router.delete("/:id",  protect, adminOnly, deleteBooth);

export default router;