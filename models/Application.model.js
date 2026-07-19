import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    company:    { type: String, required: true },
    expo:       { type: String, required: true },    // Expo name (or ref to Expo model)
    booth:      { type: String, default: "—" },
    status:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    appliedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
