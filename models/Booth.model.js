import mongoose from "mongoose";
 
const boothSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true, unique: true, trim: true }, // e.g. "A1", "B3"
    status:   { type: String, enum: ["available", "reserved", "occupied"], default: "available" },
    company:  { type: String, default: "" },
    expo:     { type: mongoose.Schema.Types.ObjectId, ref: "Expo" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes:    { type: String, default: "" },
    products: { type: Array, default: [] },
  },
  { timestamps: true }
);
 
export default mongoose.model("Booth", boothSchema);
