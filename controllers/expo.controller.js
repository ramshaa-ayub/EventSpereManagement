import Expo from "../models/Expo.model.js";

// ── GET /api/expos — All expos ────────────────────────────────────────────────
export const getAllExpos = async (req, res) => {
  try {
    const expos = await Expo.find().sort({ createdAt: -1 });
    res.json(expos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/expos — Create expo (supports multipart/form-data for image) ────
export const createExpo = async (req, res) => {
  try {
    const { title, date, location, booths, status, description, theme, img } = req.body;

    // If a file was uploaded via Cloudinary middleware, use its URL
    const imageUrl = req.file?.path || img || "";

    const expo = await Expo.create({
      title, date, location,
      booths:      booths      || 0,
      status:      status      || "upcoming",
      description: description || "",
      theme:       theme       || "",
      img:         imageUrl,
      createdBy:   req.user?.id,
    });

    res.status(201).json({ message: "Expo created!", expo });
  } catch (err) {
    console.error("ERROR IN CREATE EXPO:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

// ── PUT /api/expos/:id — Update expo ─────────────────────────────────────────
export const updateExpo = async (req, res) => {
  try {
    const updates = { ...req.body };

    // If a new file was uploaded, override img field
    if (req.file?.path) {
      updates.img = req.file.path;
    }

    const expo = await Expo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!expo) return res.status(404).json({ message: "Expo not found" });
    res.json({ message: "Expo updated!", expo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/expos/:id ─────────────────────────────────────────────────────
export const deleteExpo = async (req, res) => {
  try {
    const expo = await Expo.findByIdAndDelete(req.params.id);
    if (!expo) return res.status(404).json({ message: "Expo not found" });
    res.json({ message: "Expo deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/expos/stats ──────────────────────────────────────────────────────
export const getExpoStats = async (req, res) => {
  try {
    const total     = await Expo.countDocuments();
    const upcoming  = await Expo.countDocuments({ status: "upcoming" });
    const completed = await Expo.countDocuments({ status: "completed" });
    const ongoing   = await Expo.countDocuments({ status: "ongoing" });
    res.json({ total, upcoming, completed, ongoing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
