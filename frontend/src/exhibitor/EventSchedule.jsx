import { useState } from "react";
import { G, ACCENT, Card, EmptyState } from "./shared.jsx";

export default function EventSchedule({ sessions, loading }) {
  const [bookmarks,     setBookmarks]     = useState(new Set());
  const [registrations, setRegistrations] = useState(new Set());

  const toggleBookmark = (id) => setBookmarks(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleRegister = (id) => setRegistrations(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const fallbackSessions = [
    { _id: "s1", title: "AI in Expo Marketing",  speaker: "Dr. Sara Khan",  time: "10:00 AM", date: "May 15", location: "Hall A" },
    { _id: "s2", title: "Booth Design Mastery",  speaker: "Ahmed Raza",     time: "11:30 AM", date: "May 15", location: "Hall B" },
    { _id: "s3", title: "Lead Generation Tips",  speaker: "Zara Hussain",   time: "02:00 PM", date: "May 15", location: "Hall A" },
    { _id: "s4", title: "Tech Product Launches", speaker: "Omar Sheikh",    time: "04:00 PM", date: "May 16", location: "Hall C" },
  ];
  const displayed = sessions.length > 0 ? sessions : fallbackSessions;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Schedule</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>Event Schedule</h2>
        <p style={{ fontSize: 13, color: G.muted }}>Browse sessions, bookmark favourites, and register to attend.</p>
      </div>

      {/* Counters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ padding: "4px 14px", borderRadius: 20, background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, fontSize: 12, fontWeight: 700, color: ACCENT }}>
          📌 {bookmarks.size} Bookmarked
        </div>
        <div style={{ padding: "4px 14px", borderRadius: 20, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', fontSize: 12, fontWeight: 700, color: '#10B981' }}>
          ✅ {registrations.size} Registered
        </div>
      </div>

      {loading ? <EmptyState icon="⏳" text="Loading sessions..." /> :
       displayed.map(s => {
        const isBk = bookmarks.has(s._id), isReg = registrations.has(s._id);
        const timeParts = (s.time || "").split(" ");
        return (
          <div key={s._id} style={{
            background: G.card, border: `1px solid ${G.border}`, borderRadius: 14,
            padding: 18, marginBottom: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderLeft: isReg ? `3px solid ${ACCENT}` : `3px solid transparent`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: G.text, fontFamily: "'Syne',sans-serif", marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: G.muted }}>
                🎤 {s.speaker} &nbsp;·&nbsp; ⏰ {s.time} &nbsp;·&nbsp; 📅 {s.date} &nbsp;·&nbsp; 📍 {s.location || s.room}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
              <button onClick={() => toggleBookmark(s._id)} style={{
                padding: "7px 13px", borderRadius: 8,
                border: `1px solid ${isBk ? 'rgba(255,190,0,.3)' : G.border}`,
                background: isBk ? 'rgba(255,190,0,.1)' : 'transparent',
                color: isBk ? '#FFBE00' : G.muted,
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                transition: 'all .15s',
              }}>
                {isBk ? "🔖 Bookmarked" : "🔖 Bookmark"}
              </button>
              <button onClick={() => toggleRegister(s._id)} style={{
                padding: "7px 13px", borderRadius: 8, border: "none",
                background: isReg ? 'rgba(16,185,129,.12)' : ACCENT,
                color: isReg ? '#10B981' : "#fff",
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                transition: 'all .15s',
              }}>
                {isReg ? "✅ Registered" : "Register"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
