import { useState, useEffect, useMemo } from "react";
import { submitMyApplication, fetchBooths } from "../api.js";
import { G, ACCENT, Card, Badge, Btn, Input, SectionTitle, EmptyState, Alert } from "./shared.jsx";

export default function MyApplication({ apps, expos, loading, refresh, preselectedExpo, onClearPreselect }) {
  const [showForm,   setShowForm]   = useState(!!preselectedExpo);
  const [company,    setCompany]    = useState("");
  const [expoId,     setExpoId]     = useState(preselectedExpo?._id || "");
  const [booth,      setBooth]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");
  const [booths,     setBooths]     = useState([]);
  const [loadingBooths, setLoadingBooths] = useState(false);

  useEffect(() => {
    if (showForm) {
      setLoadingBooths(true);
      fetchBooths().then(setBooths).catch(e => console.error(e)).finally(() => setLoadingBooths(false));
    }
  }, [showForm]);

  useEffect(() => {
    if (preselectedExpo) { setExpoId(preselectedExpo._id); setShowForm(true); }
  }, [preselectedExpo]);

  const handleSubmit = async () => {
    if (!company || !expoId || !booth) { setError("Please fill all fields."); return; }
    setError(""); setSubmitting(true);
    try {
      await submitMyApplication({ company, expo: expoId, booth });
      setSuccess("✅ Application submitted! Admin will review it soon.");
      setCompany(""); setExpoId(""); setBooth("");
      setShowForm(false);
      if (onClearPreselect) onClearPreselect();
      refresh();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const getStep = (app) => {
    if (app.status === "pending")  return 1;
    if (app.status === "approved") return 3;
    if (app.status === "rejected") return 2;
    return 0;
  };
  const steps = ["Applied", "Under Review", "Decision", "Assigned"];

  const selectedExpo = expos.find(e => e._id === expoId);
  const boothCount = selectedExpo ? (selectedExpo.booths || 0) : 0;

  const generatedBooths = useMemo(() => {
    if (!selectedExpo) return [];
    const arr = [];
    for (let i = 1; i <= boothCount; i++) {
      const slotName = `A${i}`;
      const dbId = `${selectedExpo._id}-${slotName}`;
      const existing = booths.find(b => b.id === dbId || (b.id === slotName && b.expo === selectedExpo._id));
      if (existing) {
        arr.push({ ...existing, displayId: slotName });
      } else {
        arr.push({ id: dbId, status: "available", displayId: slotName });
      }
    }
    return arr;
  }, [selectedExpo, booths, boothCount]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Booth Applications</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>My Applications</h2>
          <p style={{ fontSize: 13, color: G.muted }}>Track your booth applications and apply for new ones.</p>
        </div>
        <Btn size="md" onClick={() => { setShowForm(!showForm); onClearPreselect && onClearPreselect(); }}>
          {showForm ? "✕ Cancel" : "＋ Apply for Booth"}
        </Btn>
      </div>

      <Alert msg={success} type="success" />

      {/* Form */}
      {showForm && (
        <Card style={{ padding: 24, marginBottom: 20 }}>
          <SectionTitle>Submit New Application</SectionTitle>
          <Alert msg={error} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            <Input label="Company Name" placeholder="Your company name" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div style={{ marginTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Select Expo</div>
            <select value={expoId} onChange={e => { setExpoId(e.target.value); setBooth(""); }}>
              <option value="">-- Select Expo --</option>
              {expos.filter(ex => ex.status === "upcoming").map(ex => (
                <option key={ex._id} value={ex._id}>{ex.title} · {ex.date}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Select Booth</div>
            {expoId ? (
              loadingBooths ? <div style={{ fontSize: 12, color: G.muted }}>Loading floor plan...</div> :
              generatedBooths.length === 0 ? <div style={{ fontSize: 12, color: G.muted }}>No booths available for this expo.</div> :
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10 }}>
                {generatedBooths.map(b => {
                  const isAvailable = b.status === "available";
                  const isSelected = booth === b.displayId;
                  const bg = isSelected ? G.accent : isAvailable ? 'rgba(16,185,129,.1)' : 'rgba(255,255,255,.05)';
                  const border = isSelected ? G.accent : isAvailable ? 'rgba(16,185,129,.3)' : 'rgba(255,255,255,.1)';
                  const color = isSelected ? '#fff' : isAvailable ? '#10B981' : G.muted;
                  return (
                    <div key={b.displayId}
                         onClick={() => { if (isAvailable) setBooth(b.displayId); }}
                         style={{
                           background: bg, border: `1.5px solid ${border}`, borderRadius: 8, padding: "10px",
                           cursor: isAvailable ? "pointer" : "not-allowed", textAlign: "center",
                           transition: "all .15s", opacity: isAvailable ? 1 : 0.5
                         }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color, fontFamily: "'Syne',sans-serif" }}>{b.displayId}</div>
                      <div style={{ fontSize: 9, color, opacity: .7, marginTop: 2, textTransform: "capitalize" }}>{isSelected ? "Selected" : b.status}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: 14, background: G.card2, borderRadius: 8, color: G.muted, fontSize: 13, textAlign: "center", border: `1px solid rgba(255,255,255,.05)` }}>
                Select an expo first to see available booths
              </div>
            )}
          </div>
          <Btn size="md" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "📤 Submit Application"}
          </Btn>
        </Card>
      )}

      {/* Applications list */}
      {loading ? <EmptyState icon="⏳" text="Loading applications..." /> :
       apps.length === 0 ? <EmptyState icon="📋" text="No applications yet. Click 'Apply for Booth' to get started!" /> :
       apps.map(app => {
        const step       = getStep(app);
        const isApproved = app.status === "approved";
        const expoObj = expos.find(e => e._id === app.expo) || expos.find(e => e.title === app.expo);
        const expoTitle = expoObj ? expoObj.title : (app.expo || "Expo");
        return (
          <Card key={app._id} style={{ padding: 22, marginBottom: 14 }}>
            {isApproved && (
              <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: G.green }}>Congratulations! Your booth is confirmed.</div>
                  <div style={{ fontSize: 12, color: G.muted }}>Booth {app.booth} is reserved for you at {expoTitle}.</div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: G.text, fontFamily: "'Syne',sans-serif" }}>{expoTitle}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>🏢 {app.company} &nbsp;·&nbsp; 🏪 Booth {app.booth}</div>
                <div style={{ fontSize: 11, color: G.muted, opacity: .7, marginTop: 2 }}>Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
              </div>
              <Badge>{app.status}</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {steps.map((s, i) => {
                const done = i < step, current = i === step;
                const bad  = app.status === "rejected" && i === 2;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                    <div style={{ textAlign: "center", minWidth: 56 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", margin: "0 auto 5px",
                        background: bad ? "rgba(239,68,68,.15)" : done || current ? ACCENT : "rgba(255,255,255,.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: (done || current) ? "#fff" : G.muted,
                      }}>
                        {bad ? "✕" : done ? "✓" : i + 1}
                      </div>
                      <div style={{ fontSize: 10, color: (done || current) ? G.text : G.muted, fontWeight: current ? 700 : 400 }}>{s}</div>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: done ? ACCENT : "rgba(255,255,255,.06)", marginBottom: 14, marginInline: 2 }} />
                    )}
                  </div>
                );
              })}
            </div>
            {app.reviewNote && (
              <div style={{ marginTop: 12, padding: "8px 12px", background: G.card2, borderLeft: `3px solid ${ACCENT}`, borderRadius: 4, fontSize: 12, color: G.muted }}>
                💬 {app.reviewNote}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
