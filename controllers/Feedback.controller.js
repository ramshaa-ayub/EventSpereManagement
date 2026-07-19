import Feedback from "../models/Feedback.model.js";

const formatTime = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const toFrontend = (doc) => ({
  id:      doc._id,
  type:    doc.type,
  subject: doc.subject,
  message: doc.message || "",
  from:    doc.senderName || "Unknown",
  time:    formatTime(doc.createdAt),
  status:  doc.status,
});

// CREATE  POST /api/feedback
export const createFeedback = async (req, res) => {
  try {
    const { type, subject, message, senderName } = req.body;
    if (!type || !subject) {
      return res.status(400).json({ message: "type and subject are required." });
    }
    const allowed = ["bug", "suggestion", "complaint"];
    if (!allowed.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${allowed.join(", ")}` });
    }
    const feedback = await Feedback.create({
      type, subject, message: message || "", senderName: senderName || "Anonymous",
    });
    res.status(201).json({ message: "Feedback submitted.", feedback: toFrontend(feedback) });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// READ ALL  GET /api/feedback
export const getAllFeedback = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (type)   filter.type   = type;
    if (status) filter.status = status;

    const docs  = await Feedback.find(filter).sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit)).limit(Number(limit));
    const total = await Feedback.countDocuments(filter);

    res.json({ feedbackList: docs.map(toFrontend), total });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// READ ONE  GET /api/feedback/:id
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found." });
    res.json(toFrontend(feedback));
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// UPDATE STATUS  PATCH /api/feedback/:id/status
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["open", "reviewed", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!feedback) return res.status(404).json({ message: "Feedback not found." });
    res.json({ message: `Status updated to "${status}".`, feedback: toFrontend(feedback) });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// UPDATE FULL  PUT /api/feedback/:id
export const updateFeedback = async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id, { type, subject, message }, { new: true }
    );
    if (!feedback) return res.status(404).json({ message: "Feedback not found." });
    res.json({ message: "Feedback updated.", feedback: toFrontend(feedback) });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// DELETE  DELETE /api/feedback/:id
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found." });
    res.json({ message: "Feedback deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};