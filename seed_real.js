import mongoose from "mongoose";
import dotenv from "dotenv";
import Expo from "./models/Expo.model.js";
import Session from "./models/Session.model.js";
import Booth from "./models/Booth.model.js";
import Application from "./models/Application.model.js";
import Feedback from "./models/Feedback.model.js";
import Registration from "./models/Registration.model.js";
import Message from "./models/Message.model.js";
import User from "./models/User.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/eventsphere";

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Wipe all collections EXCEPT users
    console.log("Wiping collections...");
    await Expo.deleteMany({});
    await Session.deleteMany({});
    await Booth.deleteMany({});
    await Application.deleteMany({});
    await Feedback.deleteMany({});
    await Registration.deleteMany({});
    await Message.deleteMany({});
    console.log("Wiped collections (Users kept intact).");

    // 2. Fetch admins and exhibitors to assign realistic data
    const adminUser = await User.findOne({ role: "admin" });
    const exhibitors = await User.find({ role: "exhibitor" }).limit(5);

    // 3. Create Expos
    console.log("Creating Expos...");
    const expos = await Expo.insertMany([
      {
        title: "Global Tech Summit 2026",
        date: "2026-08-15",
        location: "Silicon Valley Convention Center",
        status: "upcoming",
        booths: 50,
        registered: 0,
        description: "The largest gathering of tech innovators, showcasing AI, Web3, and future tech.",
        theme: "Technology",
        img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        createdBy: adminUser ? adminUser._id : null,
      },
      {
        title: "Health & Wellness Expo",
        date: "2026-06-10",
        location: "New York Expo Hall",
        status: "upcoming",
        booths: 30,
        registered: 0,
        description: "Explore the latest in medical technology, nutrition, and holistic wellness.",
        theme: "Healthcare",
        img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        createdBy: adminUser ? adminUser._id : null,
      },
      {
        title: "Auto Show 2025",
        date: "2025-11-20",
        location: "Detroit Convention Center",
        status: "completed",
        booths: 100,
        registered: 500,
        description: "A look back at the revolutionary vehicles of 2025.",
        theme: "Automotive",
        img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        createdBy: adminUser ? adminUser._id : null,
      }
    ]);

    const techExpo = expos[0];
    const healthExpo = expos[1];

    // 4. Create Sessions
    console.log("Creating Sessions...");
    await Session.insertMany([
      {
        title: "The Future of AI in Enterprise",
        speaker: "Dr. Alan Turing",
        time: "10:00 AM",
        hall: "Main Auditorium",
        capacity: 200,
        registered: 0,
        expo: techExpo.title,
        description: "A deep dive into how Artificial Intelligence is reshaping global business operations."
      },
      {
        title: "Web3 and Decentralized Finance",
        speaker: "Satoshi Nakamoto",
        time: "01:00 PM",
        hall: "Hall B",
        capacity: 150,
        registered: 0,
        expo: techExpo.title,
        description: "Understanding the shift from traditional banking to blockchain-based economies."
      },
      {
        title: "Innovations in Telemedicine",
        speaker: "Dr. House",
        time: "11:00 AM",
        hall: "Medical Wing A",
        capacity: 100,
        registered: 0,
        expo: healthExpo.title,
        description: "How remote patient monitoring and telemedicine are saving lives globally."
      }
    ]);

    // 5. Create Booths for Tech Expo
    console.log("Creating Booths...");
    const boothsData = [];
    for (let i = 1; i <= 10; i++) {
      const isOccupied = i <= 3 && exhibitors.length >= i;
      const exhibitor = isOccupied ? exhibitors[i-1] : null;
      boothsData.push({
        id: `${techExpo.title}-A${i}`,
        status: isOccupied ? "occupied" : "available",
        company: exhibitor ? (exhibitor.exhibitorProfile?.company || exhibitor.name) : "",
        expo: techExpo._id,
        assignedTo: exhibitor ? exhibitor._id : null,
        notes: isOccupied ? "Premium sponsor booth" : "Standard booth",
        products: isOccupied ? ["Product 1", "Product 2"] : []
      });
    }
    for (let i = 1; i <= 5; i++) {
      boothsData.push({
        id: `${healthExpo.title}-B${i}`,
        status: "available",
        company: "",
        expo: healthExpo._id,
        assignedTo: null,
        notes: "Standard booth",
        products: []
      });
    }
    await Booth.insertMany(boothsData);

    // 6. Create Applications
    console.log("Creating Applications...");
    if (exhibitors.length >= 4) {
      await Application.insertMany([
        {
          company: exhibitors[0].exhibitorProfile?.company || exhibitors[0].name,
          expo: techExpo.title,
          booth: `A1`,
          status: "approved",
          appliedBy: exhibitors[0]._id,
          reviewNote: "Approved, welcome to the Expo!",
        },
        {
          company: exhibitors[1].exhibitorProfile?.company || exhibitors[1].name,
          expo: techExpo.title,
          booth: `A2`,
          status: "approved",
          appliedBy: exhibitors[1]._id,
          reviewNote: "Approved.",
        },
        {
          company: exhibitors[2].exhibitorProfile?.company || exhibitors[2].name,
          expo: techExpo.title,
          booth: `A3`,
          status: "approved",
          appliedBy: exhibitors[2]._id,
          reviewNote: "Approved.",
        },
        {
          company: exhibitors[3].exhibitorProfile?.company || exhibitors[3].name,
          expo: techExpo.title,
          booth: `A4`,
          status: "pending",
          appliedBy: exhibitors[3]._id,
        }
      ]);
    }

    console.log("Seeding complete! ✨");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
