import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true },
    speaker:    { type: String, required: true },
    time:       { type: String, required: true },     // e.g. "10:00 AM"
    hall:       { type: String, required: true },
    capacity:   { type: Number, default: 100 },
    registered: { type: Number, default: 0 },
    expo:       { type: String, default: "" },
    description:{ type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
