import Session      from "../models/Session.model.js";
import Registration from "../models/Registration.model.js";

// ── GET /api/sessions ────────────────────────────────────────
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/sessions ───────────────────────────────────────
export const createSession = async (req, res) => {
  try {
    const { title, speaker, time, hall, capacity, expo, description } = req.body;

    const session = await Session.create({
      title, speaker, time, hall,
      capacity: capacity || 100,
      expo: expo || "",
      description: description || "",
    });

    res.status(201).json({ message: "Session created!", session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/sessions/:id ────────────────────────────────────
export const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session updated!", session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/sessions/:id ─────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    // Also clean up any registrations for this session
    await Registration.deleteMany({ session: req.params.id });
    res.json({ message: "Session deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/sessions/:id/register ─────────────────────────
// Authenticated attendee registers for a session
export const registerForSession = async (req, res) => {
  try {
    const { contactName, contactEmail, contactPhone, members } = req.body;
    const sessionId = req.params.id;
    const userId    = req.user.id;

    if (!contactName || !contactEmail || !members) {
      return res.status(400).json({ message: "Contact name, email, and number of members are required." });
    }

    const numMembers = Math.max(1, parseInt(members, 10) || 1);

    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Check if user already registered
    const existing = await Registration.findOne({ session: sessionId, user: userId });
    if (existing) {
      return res.status(400).json({ message: "You are already registered for this session." });
    }

    // Check capacity
    if (session.registered + numMembers > session.capacity) {
      return res.status(400).json({
        message: `Not enough seats. Only ${session.capacity - session.registered} spots remaining.`,
      });
    }

    // Create registration
    const registration = await Registration.create({
      session: sessionId,
      user: userId,
      contactName,
      contactEmail,
      contactPhone: contactPhone || "",
      members: numMembers,
    });

    // Update session registered count
    session.registered += numMembers;
    await session.save();

    res.status(201).json({
      message: "Successfully registered!",
      registration,
      session,
    });
  } catch (err) {
    // Duplicate registration (unique index violation)
    if (err.code === 11000) {
      return res.status(400).json({ message: "You are already registered for this session." });
    }
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sessions/:id/registrations ─────────────────────
// Admin can see who registered for a session
export const getSessionRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ session: req.params.id })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sessions/my-registrations ──────────────────────
// Get current user's registrations
export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate("session")
      .sort({ createdAt: -1 });
    const sessionIds = registrations.map(r => r.session?._id?.toString()).filter(Boolean);
    res.json({ registrations, sessionIds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
