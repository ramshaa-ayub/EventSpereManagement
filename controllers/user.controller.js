import User from "../models/User.model.js";

// ── GET /api/users — Get all users ───────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/users/stats ─────────────────────────────────────
export const getUserStats = async (req, res) => {
  try {
    const total      = await User.countDocuments();
    const admins     = await User.countDocuments({ role: "admin" });
    const exhibitors = await User.countDocuments({ role: "exhibitor" });
    const attendees  = await User.countDocuments({ role: "attendee" });
    res.json({ total, admins, exhibitors, attendees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/users/profile ───────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { company, category, website, phone, description, linkedin, instagram, logo } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle Cloudinary upload or direct URL
    const logoUrl = req.file?.path || logo || user.exhibitorProfile?.logo || "";

    user.exhibitorProfile = {
      company: company || user.exhibitorProfile?.company || "",
      category: category || user.exhibitorProfile?.category || "",
      website: website || user.exhibitorProfile?.website || "",
      phone: phone || user.exhibitorProfile?.phone || "",
      description: description || user.exhibitorProfile?.description || "",
      linkedin: linkedin || user.exhibitorProfile?.linkedin || "",
      instagram: instagram || user.exhibitorProfile?.instagram || "",
      logo: logoUrl,
    };

    await user.save();
    
    // Don't send back password
    const updatedUser = await User.findById(req.user.id).select("-password");

    res.json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/users/:id ────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};