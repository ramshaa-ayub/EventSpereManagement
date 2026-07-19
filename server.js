import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
 
import authRoutes    from "./routes/auth.routes.js";
import expoRoutes    from "./routes/expo.routes.js";
import appRoutes     from "./routes/application.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import userRoutes    from "./routes/user.routes.js";
import boothRoutes from "./routes/booth.routes.js";
import feedbackRoutes  from "./routes/Feedback.routes.js";
import messageRoutes   from "./routes/Message.routes.js";
import analyticsRoutes from "./routes/Analytics.routes.js";

 
dotenv.config();
 
const app  = express();
const PORT = process.env.PORT || 5000;
 
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
 
app.use("/api/auth",         authRoutes);
app.use("/api/expos",        expoRoutes);
app.use("/api/applications", appRoutes);
app.use("/api/sessions",     sessionRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/booths", boothRoutes);
app.use("/api/feedback",   feedbackRoutes);
app.use("/api/messages",   messageRoutes);
app.use("/api/analytics",  analyticsRoutes);

 
app.get("/", (req, res) => res.json({ message: "EventSphere API is running 🚀" }));
 
// ── Connect to MongoDB Atlas then start server ───────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB Atlas connected");
    app.listen(PORT, () =>
      console.log(`🚀  Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌  MongoDB error:", err));