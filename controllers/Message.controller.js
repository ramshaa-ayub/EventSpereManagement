import mongoose from "mongoose";
import Message  from "../models/Message.model.js";
import User     from "../models/User.model.js";

const { Types: { ObjectId } } = mongoose;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a deterministic conversationId from two user IDs
 * (sorted so A↔B and B↔A share the same thread).
 */
const makeConvId = (idA, idB) =>
  [idA.toString(), idB.toString()].sort().join("_");

const formatTime = (date) => {
  const now  = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Helper: get the latest message per conversation for a given user,
 * returning full contact info for the other participant.
 */
const getContactsForUser = async (myId) => {
  const myObjId = new ObjectId(myId);

  const latestPerConv = await Message.aggregate([
    {
      $match: {
        $or: [
          { "sender._id":   myObjId },
          { "receiver._id": myObjId },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id:        "$conversationId",
        lastMsg:    { $first: "$text" },
        lastTime:   { $first: "$createdAt" },
        sender:     { $first: "$sender" },
        receiver:   { $first: "$receiver" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$isRead", false] },
                  { $eq: ["$receiver._id", myObjId] },
                ],
              },
              1, 0,
            ],
          },
        },
      },
    },
    { $sort: { lastTime: -1 } },
  ]);

  return latestPerConv.map((c) => {
    const other =
      c.sender._id.toString() === myId ? c.receiver : c.sender;
    return {
      userId:      other._id,
      name:        other.name,
      role:        other.role,
      convId:      c._id,
      lastMsg:     c.lastMsg,
      lastTime:    formatTime(c.lastTime),
      unreadCount: c.unreadCount,
    };
  });
};

// ── GET /api/messages/contacts ───────────────────────────────────────────────
//    People the current user has chatted with.
//    For non-admins also injects Admin as a default contact.
export const getContacts = async (req, res) => {
  try {
    const myId   = req.user.id;
    const myRole = req.user.role;

    const contacts = await getContactsForUser(myId);

    // Always inject Admin contact for exhibitors/attendees (if not already present)
    if (myRole !== "admin") {
      const admin = await User.findOne({ role: "admin" }).select("_id name role");
      if (admin) {
        const alreadyHas = contacts.some(
          (c) => c.userId.toString() === admin._id.toString()
        );
        if (!alreadyHas) {
          contacts.unshift({
            userId:      admin._id,
            name:        admin.name || "EventSphere Admin",
            role:        "admin",
            convId:      makeConvId(myId, admin._id.toString()),
            lastMsg:     "Start a conversation…",
            lastTime:    "",
            unreadCount: 0,
          });
        }
      }
    }

    res.json({ contacts });
  } catch (err) {
    console.error("getContacts error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ── GET /api/messages/exhibitors — list of all exhibitors ─────────────────────
//    Used by attendees to start new conversations.
export const getExhibitors = async (req, res) => {
  try {
    const exhibitors = await User.find({ role: "exhibitor" })
      .select("_id name exhibitorProfile")
      .sort({ name: 1 });

    const list = exhibitors.map((u) => ({
      userId:   u._id,
      name:     u.exhibitorProfile?.company || u.name,
      rawName:  u.name,
      role:     "exhibitor",
      category: u.exhibitorProfile?.category || "Exhibitor",
      logo:     u.exhibitorProfile?.logo || "",
    }));

    res.json({ exhibitors: list });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ── GET /api/messages/all-contacts — admin view ──────────────────────────────
//    Everyone who has ever messaged admin (or whom admin has messaged).
export const getAllContacts = async (req, res) => {
  try {
    const myId   = req.user.id;
    const contacts = await getContactsForUser(myId);
    res.json({ contacts });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ── GET /api/messages/conversation/:otherId ───────────────────────────────────
//    Full message thread between current user and another user.
export const getConversation = async (req, res) => {
  try {
    const myId    = req.user.id;
    const otherId = req.params.otherId;
    const convId  = makeConvId(myId, otherId);

    const msgs = await Message.find({ conversationId: convId }).sort({ createdAt: 1 });

    // Mark messages received by me as read
    await Message.updateMany(
      { conversationId: convId, "receiver._id": new ObjectId(myId), isRead: false },
      { isRead: true }
    );

    res.json({
      messages: msgs.map((m) => ({
        id:         m._id,
        text:       m.text,
        mine:       m.sender._id.toString() === myId,
        time:       formatTime(m.createdAt),
        isRead:     m.isRead,
        senderName: m.sender.name,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ── POST /api/messages/send ───────────────────────────────────────────────────
//    Send a message to a specific user.
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ message: "receiverId and text are required." });
    }

    const sender   = req.user; // { id, name, role } from JWT
    const receiver = await User.findById(receiverId).select("_id name role");
    if (!receiver) return res.status(404).json({ message: "Recipient not found." });

    const convId = makeConvId(sender.id, receiverId);

    const message = await Message.create({
      conversationId: convId,
      sender:   { _id: sender.id,    name: sender.name,    role: sender.role },
      receiver: { _id: receiver._id, name: receiver.name,  role: receiver.role },
      text:     text.trim(),
    });

    res.status(201).json({
      message: "Sent.",
      data: {
        id:         message._id,
        text:       message.text,
        mine:       true,
        time:       "Just now",
        senderName: sender.name,
      },
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ── GET /api/messages/unread-count ───────────────────────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    const myId  = req.user.id;
    const count = await Message.countDocuments({
      "receiver._id": new ObjectId(myId),
      isRead: false,
    });
    res.json({ count, unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ── PATCH /api/messages/:id/read ──────────────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id, { isRead: true }, { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found." });
    res.json({ message: "Marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ── PATCH /api/messages/read-all ──────────────────────────────────────────────
export const markAllAsRead = async (req, res) => {
  try {
    const myId = req.user.id;
    await Message.updateMany(
      { "receiver._id": new ObjectId(myId), isRead: false },
      { isRead: true }
    );
    res.json({ message: "All messages marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ── DELETE /api/messages/:id ──────────────────────────────────────────────────
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found." });
    res.json({ message: "Deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};