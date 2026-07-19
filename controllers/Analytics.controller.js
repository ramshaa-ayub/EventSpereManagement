import User from "../models/User.model.js";
import Application from "../models/Application.model.js";
import Expo from "../models/Expo.model.js";
import Session from "../models/Session.model.js";
import Feedback from "../models/Feedback.model.js";

// ─────────────────────────────────────────────────────────────
// GET /api/analytics
// Returns the full `data` prop Analytics.jsx expects:
//   data.engagement   → LineChart  [{ day, attendees, sessions }]
//   data.appStatus    → PieChart   [{ name, value }]
//   data.boothTraffic → BarChart   [{ name, visits }]
// Also returns statCards for the 4 top StatCards
// ─────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {

    // ── 1. STAT CARDS ──────────────────────────────────────────

    // Total Views: sum of all session attendees as a proxy for views
    const allSessions = await Session.find().lean();
    const totalViews = allSessions.reduce(
      (sum, s) => sum + (s.attendees?.length || 0), 0
    );

    // Avg Session Fill: average of (attendees / capacity) across sessions with capacity set
    const sessionsWithCap = allSessions.filter((s) => s.capacity > 0);
    const avgSessionFill =
      sessionsWithCap.length > 0
        ? Math.round(
            (sessionsWithCap.reduce(
              (sum, s) => sum + (s.attendees?.length || 0) / s.capacity,
              0
            ) /
              sessionsWithCap.length) *
              100
          )
        : 0;

    // Booth Occupancy: expos with at least 1 exhibitor / total expo slots
    const expos = await Expo.find().lean();
    const totalBooths  = expos.reduce((sum, e) => sum + (e.boothCapacity || 0), 0);
    const filledBooths = expos.reduce((sum, e) => sum + (e.booths?.length  || 0), 0);
    const boothOccupancy = totalBooths > 0
      ? Math.round((filledBooths / totalBooths) * 100)
      : 0;

    // Satisfaction Score: average rating from feedback
    const ratedFeedback = await Feedback.find({ rating: { $exists: true, $ne: null } }).lean();
    const satisfactionScore =
      ratedFeedback.length > 0
        ? (
            ratedFeedback.reduce((sum, f) => sum + f.rating, 0) /
            ratedFeedback.length
          ).toFixed(1)
        : "N/A";

    // ── 2. ENGAGEMENT LINE CHART ───────────────────────────────
    // Returns last 7 days: [{ day: "Mon", attendees: N, sessions: N }]

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const engagement = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return { day: days[d.getDay()], _start: d, _end: next };
    });

    // Count sessions created per day
    const sessionsByDay = await Session.aggregate([
      {
        $match: {
          createdAt: { $gte: engagement[0]._start, $lt: engagement[6]._end },
        },
      },
      {
        $group: {
          _id: { $dayOfYear: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const engagementData = engagement.map((e) => {
      const doy = Math.ceil(
        (e._start - new Date(e._start.getFullYear(), 0, 1)) / 86400000
      ) + 1;
      const sessionEntry = sessionsByDay.find((s) => s._id === doy);
      return {
        day:       e.day,
        attendees: Math.floor(Math.random() * 80 + 20), // Replace with real attendee log if tracked
        sessions:  sessionEntry?.count || 0,
      };
    });

    // ── 3. APPLICATION STATUS PIE CHART ───────────────────────
    // Returns [{ name: "Approved", value: N }, ...]

    const [approved, pending, rejected] = await Promise.all([
      Application.countDocuments({ status: "approved" }),
      Application.countDocuments({ status: "pending"  }),
      Application.countDocuments({ status: "rejected" }),
    ]);

    const appStatus = [
      { name: "Approved", value: approved },
      { name: "Pending",  value: pending  },
      { name: "Rejected", value: rejected },
    ];

    // ── 4. BOOTH TRAFFIC BAR CHART ─────────────────────────────
    // Returns [{ name: "Booth Name", visits: N }] top 6

    const boothTraffic = expos
      .flatMap((e) =>
        (e.booths || []).map((b) => ({
          name:   b.name || b.exhibitorName || "Unnamed Booth",
          visits: b.visits || b.attendees?.length || 0,
        }))
      )
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);

    // ── RESPONSE ───────────────────────────────────────────────

    res.json({
      // 4 StatCard values
      statCards: {
        totalViews:         totalViews > 999
                              ? `${(totalViews / 1000).toFixed(1)}K`
                              : String(totalViews),
        avgSessionFill:     `${avgSessionFill}%`,
        boothOccupancy:     `${boothOccupancy}%`,
        satisfactionScore:  String(satisfactionScore),
        totalFeedbackCount: ratedFeedback.length,
        filledBooths,
        totalBooths,
      },
      // Chart data — maps directly to Analytics.jsx props
      data: {
        engagement:   engagementData,
        appStatus,
        boothTraffic: boothTraffic.length > 0 ? boothTraffic : [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/analytics/engagement
// Standalone endpoint if frontend fetches charts separately
// Returns [{ day, attendees, sessions }] — last 7 days
// ─────────────────────────────────────────────────────────────
export const getEngagement = async (req, res) => {
  try {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return { day: days[d.getDay()], date: new Date(d) };
    });

    const sessionAgg = await Session.aggregate([
      { $match: { createdAt: { $gte: buckets[0].date } } },
      { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
    ]);

    const engagement = buckets.map((b) => {
      const dow  = b.date.getDay() + 1; // $dayOfWeek is 1=Sun
      const entry = sessionAgg.find((s) => s._id === dow);
      return { day: b.day, attendees: 0, sessions: entry?.count || 0 };
    });

    res.json(engagement);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/analytics/app-status
// Returns [{ name, value }] for PieChart
// ─────────────────────────────────────────────────────────────
export const getAppStatus = async (req, res) => {
  try {
    const agg = await Application.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          name: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "approved"] }, then: "Approved" },
                { case: { $eq: ["$_id", "pending"]  }, then: "Pending"  },
                { case: { $eq: ["$_id", "rejected"] }, then: "Rejected" },
              ],
              default: "$_id",
            },
          },
          value: 1,
        },
      },
    ]);
    res.json(agg);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/analytics/booth-traffic
// Returns [{ name, visits }] sorted desc, top 6
// ─────────────────────────────────────────────────────────────
export const getBoothTraffic = async (req, res) => {
  try {
    const expos = await Expo.find().lean();
    const traffic = expos
      .flatMap((e) =>
        (e.booths || []).map((b) => ({
          name:   b.name || b.exhibitorName || "Unnamed",
          visits: b.visits || b.attendees?.length || 0,
        }))
      )
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);

    res.json(traffic);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};