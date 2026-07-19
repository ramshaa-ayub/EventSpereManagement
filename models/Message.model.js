import mongoose from "mongoose";

/**
 * Message model — supports threaded conversations between any two users.
 *
 * conversationId is a deterministic key so the same two users always
 * share a single thread:  [smallerId, largerId].join("_")
 */
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      _id:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["admin", "exhibitor", "attendee"], required: true },
    },
    receiver: {
      _id:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["admin", "exhibitor", "attendee"], required: true },
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;