import jwt    from "jsonwebtoken";
import crypto from "crypto";
import User   from "../models/User.model.js";
import sendEmail from "../utils/sendEmail.js";

// ── Helpers ──────────────────────────────────────────────────────────────────
const normalizeRole = (role) => {
  if (role === 1 || role === "admin") return "admin";
  if (role === "attendee")            return "attendee";
  return "exhibitor";
};

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: normalizeRole(user.role), name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ── REGISTER (admin cannot self-register) ────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be self-registered. Contact the system administrator." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const safeRole = role === "attendee" ? "attendee" : "exhibitor";

    // Build user data — for exhibitors, save the uploaded logo immediately
    const userData = { name, email, password, role: safeRole };
    if (safeRole === "exhibitor") {
      const logoUrl = req.file?.path || null;   // Cloudinary URL from multer-storage-cloudinary
      userData.exhibitorProfile = {
        company:  name,
        logo:     logoUrl || "",
        category: "Uncategorized",
      };
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: "Account created!",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: normalizeRole(user.role), exhibitorProfile: user.exhibitorProfile },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      message: "Login successful!",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: normalizeRole(user.role), exhibitorProfile: user.exhibitorProfile },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET ME ───────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── FORGOT PASSWORD ──────────────────────────────────────────────────────────
// POST /api/auth/forgot-password   { email }
// Since no email server is configured, the reset token is returned directly
// in the API response (development / internal-use setup).
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Security: don't reveal whether email exists
      return res.json({ message: "If that email is registered, a reset link has been generated." });
    }

    // Generate and save the hashed token on the user document
    const rawToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url (frontend must handle this route)
    // We assume the frontend is running on localhost:5173 or the same origin
    const origin = req.get("origin") || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password/${rawToken}`;

    const message = `You are receiving this email because you (or someone else) requested a password reset for your EventSphere account.\n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `${resetUrl}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    try {
      await sendEmail({
        email: user.email,
        subject: "EventSphere Password Reset",
        message,
      });

      res.json({ message: "Reset link sent to email." });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── RESET PASSWORD ───────────────────────────────────────────────────────────
// POST /api/auth/reset-password/:token   { newPassword }
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters" });
    }

    // Hash the incoming raw token to compare against DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },  // not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token. Please request a new one." });
    }

    // Set new password (pre-save hook will hash it)
    user.password             = newPassword;
    user.resetPasswordToken   = null;
    user.resetPasswordExpire  = null;
    await user.save();

    res.json({
      message: "Password reset successful! You can now log in with your new password.",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: normalizeRole(user.role), exhibitorProfile: user.exhibitorProfile },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};