import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    session:      { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
    contactName:  { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, default: "" },
    members:      { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true }
);

// Prevent duplicate registrations: one user per session
registrationSchema.index({ session: 1, user: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);
