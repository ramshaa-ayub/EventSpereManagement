import { useState, useEffect } from "react";
import { G, Card, SectionTitle, Spinner } from "./shared.jsx";
import {
  fetchExpos, fetchSessions, fetchApplications, fetchUsers,
} from "../api.js";

// ─── Helpers ──────────────────────────────────────────────────
const fmt = (n) => (n ?? 0) >= 1000 ? `${((n ?? 0) / 1000).toFixed(1)}K` : String(n ?? 0);
const pct = (a, b) => (b > 0 ? Math.round(((a || 0) / b) * 100) : 0);

// ─── KPI Card ─────────────────────────────────────────────────
function KPI({ icon, label, value, sub, accent = G.accent, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: G.card, border: `1px solid ${G.border}`, borderRadius: 16,
        padding: "22px 24px", position: "relative", overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color .2s, transform .15s",
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = `${accent}70`; e.currentTarget.style.transform = "translateY(-2px)"; }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "absolute", top: -10, right: -10, width: 80, height: 80, borderRadius: "50%", background: `${accent}12`, filter: "blur(6px)" }} />
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: G.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: G.muted, marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: accent, fontWeight: 600, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── CSS Bar Chart ────────────────────────────────────────────
function CSSBar({ data = [], color = G.accent, maxValue }) {
  const max = maxValue || Math.max(...data.map(d => d.value || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, paddingBottom: 28, position: "relative" }}>
      {data.map((d, i) => {
        const h = Math.max(pct(d.value || 0, max), 2);
        const barColor = Array.isArray(color) ? color[i % color.length] : color;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 9, color: G.muted, fontWeight: 700, marginBottom: 2 }}>{d.value || 0}</div>
            <div
              style={{
                width: "100%", height: `${h}%`, borderRadius: "4px 4px 0 0",
                background: barColor, opacity: 0.9, transition: "height .4s ease",
                minHeight: 3,
              }}
            />
            <div style={{ fontSize: 9, color: G.muted, textAlign: "center", position: "absolute", bottom: 0, left: `calc(${(i / data.length) * 100}% + ${i * 8}px)`, width: `calc(${100 / data.length}% - 8px)` }}>
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CSS Donut Chart ──────────────────────────────────────────
function Donut({ slices = [], size = 140 }) {
  const total = slices.reduce((s, x) => s + (x.value || 0), 0);
  if (total === 0) return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <span style={{ fontSize: 11, color: G.muted }}>No data</span>
    </div>
  );
  let cumulative = 0;
  const gradient = slices.map(s => {
    const start = (cumulative / total) * 360;
    cumulative += s.value || 0;
    const end = (cumulative / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `conic-gradient(${gradient})`,
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: size * 0.57, height: size * 0.57, borderRadius: "50%", background: G.card,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif" }}>{total}</div>
        <div style={{ fontSize: 9, color: G.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Total</div>
      </div>
    </div>
  );
}

// ─── Progress Row ─────────────────────────────────────────────
function Prog({ label, fill, sub, color }) {
  const c = color || (fill > 80 ? "#EF4444" : fill > 50 ? G.amber : G.green);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: G.text, fontWeight: 600, maxWidth: "75%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontSize: 11, color: c, fontWeight: 700 }}>{fill}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(fill, 100)}%`, borderRadius: 3, background: c, transition: "width .5s ease" }} />
      </div>
      {sub && <div style={{ fontSize: 10, color: G.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────
function ActivityRow({ icon, title, sub, badge, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${G.border}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color || G.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: G.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: 11, color: G.muted }}>{sub}</div>
      </div>
      {badge && <span style={{ background: `${color || G.accent}18`, color: color || G.accent, fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, flexShrink: 0, textTransform: "capitalize" }}>{badge}</span>}
    </div>
  );
}

// ─── Main Analytics ───────────────────────────────────────────
export default function Analytics({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState(null);
  const [d,       setD]       = useState(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true); setErr(null);
    Promise.allSettled([
      fetchExpos(), fetchSessions(), fetchApplications(), fetchUsers(),
    ]).then(([e, s, a, u]) => {
      if (!alive) return;
      const toArr = (r) => {
        const v = r.status === "fulfilled" ? r.value : null;
        if (!v) return [];
        if (Array.isArray(v)) return v;
        return v.applications || v.users || v.data || [];
      };
      setD({
        expos:    toArr(e),
        sessions: toArr(s),
        apps:     toArr(a),
        users:    toArr(u),
      });
    }).catch(e => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tick]);

  if (loading) return <div style={{ padding: "40px 32px" }}><Spinner /></div>;

  if (err || !d) return (
    <div style={{ padding: "60px 32px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 14, color: G.text, marginBottom: 6 }}>Failed to load analytics</div>
      <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 18 }}>{err}</div>
      <button onClick={() => setTick(t => t + 1)} style={{ background: G.accent, border: "none", color: "#fff", padding: "9px 22px", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Retry</button>
    </div>
  );

  const { expos, sessions, apps, users } = d;

  // ── Derived numbers ──
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingX  = expos.filter(e => { const x = e.date ? new Date(e.date) : null; return x && x >= today; }).length;
  const completedX = expos.filter(e => { const x = e.date ? new Date(e.date) : null; return x && x < today; }).length;

  const totalReg  = sessions.reduce((s, x) => s + (x.registered || 0), 0);
  const totalCap  = sessions.reduce((s, x) => s + (x.capacity  || 0), 0);
  const fillRate  = pct(totalReg, totalCap);

  const pendingCt  = apps.filter(a => a.status === "pending").length;
  const approvedCt = apps.filter(a => a.status === "approved").length;
  const rejectedCt = apps.filter(a => a.status === "rejected").length;

  const attendees  = users.filter(u => u.role === "attendee").length;
  const exhibitors = users.filter(u => u.role === "exhibitor").length;



  // ── Chart data ──
  const appDonut = [
    { label: "Approved", value: approvedCt, color: G.green },
    { label: "Pending",  value: pendingCt,  color: G.amber  },
    { label: "Rejected", value: rejectedCt, color: "#EF4444" },
  ];

  const userDonut = [
    { label: "Attendees",  value: attendees,  color: G.teal   },
    { label: "Exhibitors", value: exhibitors,  color: G.accent },
  ];

  const sessBar = sessions.slice(0, 8).map((s, i) => ({
    label: `S${i + 1}`,
    value: s.registered || 0,
  }));

  const capBar = sessions.slice(0, 8).map((s, i) => ({
    label: `S${i + 1}`,
    value: s.capacity || 0,
  }));

  const expoBar = expos.slice(0, 6).map(e => ({
    label: e.title ? e.title.substring(0, 8) : "Expo",
    value: sessions.filter(s => s.expo === e.title).length,
  }));

  const topSessions = [...sessions]
    .filter(s => (s.capacity || 0) > 0)
    .sort((a, b) => pct(b.registered || 0, b.capacity) - pct(a.registered || 0, a.capacity))
    .slice(0, 5);

  const recentApps = [...apps]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const sColor = s => s === "approved" ? G.green : s === "rejected" ? "#EF4444" : G.amber;
  const sIcon  = s => s === "approved" ? "✅"    : s === "rejected" ? "❌"       : "⏳";

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: G.accent, marginBottom: 4 }}>Live Dashboard</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: "-.02em", marginBottom: 4 }}>
            Analytics &amp; <span style={{ color: G.accent }}>Overview</span>
          </h2>
          <p style={{ fontSize: 13, color: G.muted }}>
            Real data from EventSphere · {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          onClick={() => setTick(t => t + 1)}
          style={{ background: `${G.accent}15`, border: `1px solid ${G.accent}30`, color: G.accent, padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "background .2s" }}
          onMouseEnter={e => e.currentTarget.style.background = `${G.accent}28`}
          onMouseLeave={e => e.currentTarget.style.background = `${G.accent}15`}
        >🔄 Refresh</button>
      </div>

      {/* KPI Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
        <KPI icon="🎪" label="Total Expos"        value={expos.length}    sub={`${upcomingX} upcoming · ${completedX} done`}                  accent={G.accent} onClick={() => onNavigate?.("expos")} />
        <KPI icon="👥" label="Registered Users"   value={fmt(users.length)} sub={`${attendees} attendees · ${exhibitors} exhibitors`}          accent={G.teal}   onClick={() => onNavigate?.("applications")} />
        <KPI icon="🎤" label="Sessions"           value={sessions.length} sub={`${totalReg} / ${totalCap} seats filled`}                       accent={G.green}  onClick={() => onNavigate?.("sessions")} />
        <KPI icon="📋" label="Applications"       value={apps.length}     sub={pendingCt > 0 ? `${pendingCt} pending review` : "All reviewed"} accent={pendingCt > 0 ? G.amber : G.green} onClick={() => onNavigate?.("applications")} />
      </div>

      {/* KPI Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI icon="✅" label="Approved Exhibitors"  value={approvedCt}          sub={approvedCt > 0 ? "Active at booths" : "None yet"}                accent={G.green} />
        <KPI icon="⏳" label="Pending Applications" value={pendingCt}           sub={pendingCt > 0 ? "Need review" : "All clear"}                     accent={G.amber} onClick={() => onNavigate?.("applications")} />
        <KPI icon="📊" label="Session Fill Rate"    value={`${fillRate}%`}      sub={`${totalReg} total seat registrations`}                           accent={fillRate > 75 ? G.green : G.amber} />
        <KPI icon="❌" label="Rejected Applications" value={rejectedCt} sub={rejectedCt > 0 ? "Declined from expos" : "None rejected"} accent="#EF4444" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Sessions Registered Bar */}
        <Card style={{ padding: "20px 24px" }}>
          <SectionTitle>Session Registrations</SectionTitle>
          {sessBar.length === 0
            ? <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: G.muted, fontSize: 13 }}>No session data yet</div>
            : <CSSBar data={sessBar} color={G.accent} />
          }
          <div style={{ fontSize: 11, color: G.muted, marginTop: 8, textAlign: "center" }}>Registered attendees per session (S1 = earliest)</div>
        </Card>

        {/* App Status Donut */}
        <Card style={{ padding: "20px 24px" }}>
          <SectionTitle>Application Status</SectionTitle>
          <Donut slices={appDonut} size={130} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 14 }}>
            {appDonut.filter(x => x.value > 0).map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.muted }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                {item.label}: <strong style={{ color: G.text, marginLeft: 2 }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Expos Sessions Bar */}
        <Card style={{ padding: "20px 24px" }}>
          <SectionTitle>Sessions per Expo</SectionTitle>
          {expoBar.every(e => e.value === 0)
            ? <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: G.muted, fontSize: 13 }}>Assign sessions to expos to see data</div>
            : <CSSBar data={expoBar} color={[G.accent, G.teal, G.green, G.amber, "#EF4444", "#9F67FF"]} />
          }
        </Card>

        {/* User Breakdown Donut */}
        <Card style={{ padding: "20px 24px" }}>
          <SectionTitle>User Breakdown</SectionTitle>
          <Donut slices={userDonut} size={130} />
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 14 }}>
            {userDonut.filter(x => x.value > 0).map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.muted }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                {item.label}: <strong style={{ color: G.text, marginLeft: 2 }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Top Sessions Fill Rate */}
        <Card style={{ padding: "20px 24px" }}>
          <SectionTitle>Top Sessions by Fill Rate</SectionTitle>
          {topSessions.length === 0
            ? <div style={{ color: G.muted, fontSize: 13, padding: "20px 0" }}>No sessions with capacity data</div>
            : topSessions.map((s, i) => (
                <Prog
                  key={i}
                  label={s.title || `Session ${i + 1}`}
                  fill={pct(s.registered || 0, s.capacity)}
                  sub={`${s.registered || 0} / ${s.capacity} seats · ${s.hall || ""}`}
                />
              ))
          }
        </Card>

        {/* Recent Applications */}
        <Card style={{ padding: "20px 24px" }}>
          <SectionTitle>Recent Applications</SectionTitle>
          {recentApps.length === 0
            ? <div style={{ color: G.muted, fontSize: 13, padding: "20px 0" }}>No applications yet</div>
            : recentApps.map((a, i) => (
                <ActivityRow
                  key={i}
                  icon={sIcon(a.status)}
                  title={a.company || a.appliedBy?.name || "Unknown Exhibitor"}
                  sub={`${a.expo || "—"} · ${a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "—"}`}
                  badge={a.status}
                  color={sColor(a.status)}
                />
              ))
          }
          {onNavigate && recentApps.length > 0 && (
            <button
              onClick={() => onNavigate("applications")}
              style={{ marginTop: 14, width: "100%", padding: "8px 0", borderRadius: 8, border: `1px solid ${G.border}`, background: "transparent", color: G.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              View All Applications →
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}
