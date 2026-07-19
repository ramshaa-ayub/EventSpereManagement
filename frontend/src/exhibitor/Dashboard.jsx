import { G, ACCENT, Card, Badge, Btn, StatCard, SectionTitle, EmptyState } from "./shared.jsx";

export default function Dashboard({ user, apps, expos = [], booth, onNavigate }) {
  const approved = apps.find(a => a.status === "approved");
  const pending  = apps.filter(a => a.status === "pending").length;
  const rejected = apps.filter(a => a.status === "rejected").length;

  const getStep = (app) => {
    if (!app) return -1;
    if (app.status === "pending")  return 1;
    if (app.status === "approved") return 3;
    if (app.status === "rejected") return 2;
    return 0;
  };
  const latestApp = apps[0];
  const step      = getStep(latestApp);
  const steps     = ["Applied", "Under Review", "Decision", "Assigned"];

  const neighbours = booth ? [
    { name: "TechVision Inc.", category: "Software",      booth: "A1" },
    { name: "GreenEco Pvt.",   category: "Sustainability", booth: "B2" },
    { name: "MediPlus Corp.",  category: "Healthcare",    booth: "A3" },
  ] : [];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Overview</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>
          Welcome back, {user?.name} 🏢
        </h2>
        <p style={{ fontSize: 13, color: G.muted }}>Your exhibitor portal — manage applications, booth, and connections.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="📋" label="Applications Sent"  value={apps.length}    sub={`${pending} pending review`} />
        <StatCard icon="🏪" label="Booth Status"        value={approved ? approved.booth : "—"}
          sub={approved ? "Reserved ✓" : "Not assigned yet"} accent={G.purple} />
        <StatCard icon="✅" label="Approved"            value={approved ? 1 : 0} sub={rejected ? `${rejected} rejected` : "All clear"} accent={G.green} />
      </div>

      {/* Application Step Tracker */}
      {latestApp && (
        <Card style={{ padding: 22, marginBottom: 16 }}>
          <SectionTitle>Application Progress</SectionTitle>
          <div style={{ marginBottom: 10 }}>
            {(() => {
              const expoObj = expos.find(e => e._id === latestApp.expo) || expos.find(e => e.title === latestApp.expo);
              const title = expoObj ? expoObj.title : (latestApp.expo || "Latest Expo Application");
              return <div style={{ fontSize: 14, fontWeight: 700, color: G.text, fontFamily: "'Syne',sans-serif" }}>{title}</div>;
            })()}
            <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Booth: {latestApp.booth} · {new Date(latestApp.createdAt).toLocaleDateString()}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
            {steps.map((s, i) => {
              const done    = i < step;
              const current = i === step;
              const bad     = latestApp.status === "rejected" && i === 2;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", margin: "0 auto 6px",
                      background: bad ? "rgba(239,68,68,.2)" : done || current ? ACCENT : "rgba(255,255,255,.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: (done || current) ? "#fff" : G.muted,
                      border: current ? `3px solid ${ACCENT}40` : "none",
                    }}>
                      {bad ? "✕" : done ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 10, color: (done || current) ? G.text : G.muted, fontWeight: current ? 700 : 400 }}>{s}</div>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? ACCENT : "rgba(255,255,255,.06)", marginBottom: 16, marginInline: 4 }} />
                  )}
                </div>
              );
            })}
          </div>
          {latestApp.reviewNote && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: G.card2, borderRadius: 8, borderLeft: `3px solid ${ACCENT}`, fontSize: 12, color: G.muted }}>
              💬 Admin note: {latestApp.reviewNote}
            </div>
          )}
        </Card>
      )}

      {/* Confirmed booth */}
      {approved && (
        <Card style={{ padding: 22, marginBottom: 16, background: `linear-gradient(135deg, ${ACCENT}10, ${G.card})` }}>
          <SectionTitle>
            Your Confirmed Booth
            <Btn size="sm" onClick={() => onNavigate("booth")}>Manage →</Btn>
          </SectionTitle>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 12, background: `${ACCENT}18`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: `2px solid ${ACCENT}44`,
            }}>
              <div style={{ fontSize: 22 }}>🏪</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: ACCENT, fontFamily: "'Syne',sans-serif" }}>{approved.booth}</div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: G.text, fontFamily: "'Syne',sans-serif" }}>Booth {approved.booth}</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
                Expo: {(() => {
                  const obj = expos.find(e => e._id === approved.expo) || expos.find(e => e.title === approved.expo);
                  return obj ? obj.title : approved.expo;
                })()}
              </div>
              <div style={{ marginTop: 8 }}><Badge>approved</Badge></div>
            </div>
          </div>
        </Card>
      )}

      {/* Neighbouring exhibitors */}
      {neighbours.length > 0 && (
        <Card style={{ padding: 22 }}>
          <SectionTitle>Neighbouring Exhibitors</SectionTitle>
          {neighbours.map(n => (
            <div key={n.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", background: G.card2, borderRadius: 10, marginBottom: 8,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: G.text }}>{n.name}</div>
                <div style={{ fontSize: 11, color: G.muted }}>{n.category} · Booth {n.booth}</div>
              </div>
              <Btn size="sm" variant="secondary" onClick={() => onNavigate("messages")}>💬 Message</Btn>
            </div>
          ))}
        </Card>
      )}

      {apps.length === 0 && (
        <Card style={{ padding: 22 }}>
          <EmptyState icon="📋" text="No applications yet. Explore expos and apply!" />
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Btn size="md" onClick={() => onNavigate("explore")}>🔍 Explore Expos</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
