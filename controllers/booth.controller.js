import Booth from "../models/Booth.model.js";

// ── GET /api/booths — Get all booths ─────────────────────────
export const getAllBooths = async (req, res) => {
  try {
    const booths = await Booth.find().sort({ id: 1 });
    res.json(booths);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/booths — Create a booth ────────────────────────
export const createBooth = async (req, res) => {
  try {
    const { id, status, company, expo } = req.body;
    if (!id) return res.status(400).json({ message: "Booth ID is required" });

    const exists = await Booth.findOne({ id });
    if (exists) return res.status(400).json({ message: `Booth ${id} already exists` });

    const booth = await Booth.create({ id, status, company, expo });
    res.status(201).json({ message: "Booth created!", booth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/booths/:id — Update a booth ─────────────────────
export const updateBooth = async (req, res) => {
  try {
    const booth = await Booth.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!booth) return res.status(404).json({ message: "Booth not found" });
    res.json({ message: "Booth updated!", booth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/booths/:id — Delete a booth ──────────────────
export const deleteBooth = async (req, res) => {
  try {
    const booth = await Booth.findOneAndDelete({ id: req.params.id });
    if (!booth) return res.status(404).json({ message: "Booth not found" });
    res.json({ message: "Booth deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};