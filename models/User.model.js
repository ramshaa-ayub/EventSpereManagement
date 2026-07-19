import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import crypto   from "crypto";

// Think of a Schema like a FORM — it defines what fields a User document must have
const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 4 },
    role:     { type: String, enum: ["admin", "exhibitor", "attendee"], default: "exhibitor" },

    // ── Exhibitor Profile ───────────────────────────────────────────────────
    exhibitorProfile: {
      company:     { type: String, default: "" },
      category:    { type: String, default: "" },
      website:     { type: String, default: "" },
      phone:       { type: String, default: "" },
      description: { type: String, default: "" },
      linkedin:    { type: String, default: "" },
      instagram:   { type: String, default: "" },
      logo:        { type: String, default: "" }, // Cloudinary URL
    },

    // ── Password Reset ──────────────────────────────────────────────────────
    resetPasswordToken:   { type: String,  default: null },
    resetPasswordExpire:  { type: Date,    default: null },
  },
  { timestamps: true }
);

// ── Before saving, hash the password so it's never stored as plain text 🔒 ──
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ── Check if entered password is correct ────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Generate a password-reset token (stored as SHA-256 hash in DB) ──────────
userSchema.methods.getResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  // Store only the hash — never the raw token
  this.resetPasswordToken  = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return rawToken; // send this to the user
};

export default mongoose.model("User", userSchema);
