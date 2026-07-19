import mongoose from "mongoose";

const expoSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    date:        { type: String, required: true },
    location:    { type: String, required: true },
    status:      { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
    booths:      { type: Number, default: 0 },
    registered:  { type: Number, default: 0 },
    description: { type: String, default: "" },
    theme:       { type: String, default: "" },       // e.g. "Technology", "Healthcare"
    img:         { type: String, default: "" },       // Cloudinary or external image URL
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Expo", expoSchema);
