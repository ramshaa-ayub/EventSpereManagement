import Application from "../models/Application.model.js";
import Booth from "../models/Booth.model.js";
import User from "../models/User.model.js";

export const getAllApplications = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    let apps = await Application.find(filter)
      .populate("appliedBy", "exhibitorProfile name")
      .sort({ createdAt: -1 });

    // Fallback for legacy applications missing appliedBy
    apps = await Promise.all(apps.map(async (app) => {
      let appObj = app.toObject();
      if (!appObj.appliedBy) {
        const user = await User.findOne({ 
          $or: [
            { "exhibitorProfile.company": appObj.company },
            { name: appObj.company }
          ] 
        });
        if (user) {
          appObj.appliedBy = {
            _id: user._id,
            name: user.name,
            exhibitorProfile: user.exhibitorProfile
          };
          // Link it in the database for the future
          await Application.findByIdAndUpdate(app._id, { appliedBy: user._id });
        }
      }
      return appObj;
    }));

    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/applications — Submit new application ──────────
export const createApplication = async (req, res) => {
  try {
    const { company, expo, booth, category, products, description } = req.body;
    const app = await Application.create({
      company, expo, booth,
      category: category || "",
      products: products || [],
      description: description || "",
      appliedBy: req.user?.id,
    });
    res.status(201).json({ message: "Application submitted!", application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/applications/:id/review — Approve or Reject ───
export const reviewApplication = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote: reviewNote || "" },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: "Application not found" });

    if (status === "approved" && app.booth) {
      const boothIdStr = `${app.expo}-${app.booth}`;
      await Booth.findOneAndUpdate(
        { id: boothIdStr },
        { 
          status: "occupied", 
          company: app.company, 
          expo: app.expo,
          assignedTo: app.appliedBy
        },
        { upsert: true, new: true }
      );
    } else if (status === "rejected" && app.booth) {
      const boothIdStr = `${app.expo}-${app.booth}`;
      await Booth.findOneAndUpdate(
        { id: boothIdStr },
        { 
          status: "available", 
          company: "",
          assignedTo: null
        }
      );
    }

    res.json({ message: `Application ${status}!`, application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/applications/:id ─────────────────────────────
export const deleteApplication = async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/applications/mine — Returns apps for the logged-in user ─
export const getMyApplications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const apps = await Application.find({ appliedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/applications/stats ──────────────────────────────
export const getApplicationStats = async (req, res) => {
  try {
    const pending  = await Application.countDocuments({ status: "pending" });
    const approved = await Application.countDocuments({ status: "approved" });
    const rejected = await Application.countDocuments({ status: "rejected" });
    res.json({ pending, approved, rejected, total: pending + approved + rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};