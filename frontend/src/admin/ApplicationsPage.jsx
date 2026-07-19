import { useState, useEffect } from "react";
import { fetchApplications, fetchAppStats, reviewApplication, deleteApplication, fetchExpos } from "../api.js";
import { G, Badge, Card, Btn, Spinner, Toast, Modal } from "./shared.jsx";

// ─── APPLICATIONS PAGE ────────────────────────────────────────────────────────
export default function ApplicationsPage({ onPendingChange }) {
  const [apps,    setApps]    = useState([]);
  const [expos,   setExpos]   = useState([]);
  const [stats,   setStats]   = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filter,  setFilter]  = useState("");
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState({ msg: "", type: "" });
  const [selectedApp, setSelectedApp] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [appData, statData, exposData] = await Promise.all([
        fetchApplications(filter),
        fetchAppStats(),
        fetchExpos(),
      ]);
      setApps(appData);
      setStats(statData);
      setExpos(exposData);
      onPendingChange?.(statData.pending);
    } catch (err) { showToast(err.message || "Failed to load", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filter]);

  const handleReview = async (id, status) => {
    try {
      await reviewApplication(id, status);
      showToast(`Application ${status}!`);
      loadData();
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await deleteApplication(id);
      showToast("Application deleted!");
      loadData();
    } catch (err) { showToast(err.message, "error"); }
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
      <Toast {...toast} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Exhibitors</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>Applications</h2>
        <p style={{ fontSize: 13, color: G.muted }}>Review, approve, or reject exhibitor applications — changes saved to MongoDB.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pending",  value: stats.pending,  color: G.amber },
          { label: "Approved", value: stats.approved, color: G.green },
          { label: "Rejected", value: stats.rejected, color: G.red },
        ].map(s => (
          <Card key={s.label} style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 12, minWidth: 140 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: G.text, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: G.muted }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["", "pending", "approved", "rejected"].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            style={{
              border: `1px solid ${filter === tab ? G.accent : G.border}`,
              background: filter === tab ? `${G.accent}18` : 'transparent',
              color: filter === tab ? G.accent2 : G.muted,
              padding: '5px 16px', borderRadius: 20, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif",
              textTransform: 'capitalize', transition: 'all .15s',
            }}>
            {tab === "" ? "All" : tab}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gap: 10 }}>
          {apps.length === 0 ? (
            <Card style={{ padding: 48, textAlign: "center", color: G.muted, fontSize: 13 }}>
              No applications found
            </Card>
          ) : apps.map(app => (
            <Card key={app._id} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              {app.appliedBy?.exhibitorProfile?.logo ? (
                <img src={app.appliedBy.exhibitorProfile.logo} alt="Logo" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: `${G.accent}18`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>🏢</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: G.text, fontFamily: "'Syne',sans-serif" }}>{app.company}</span>
                  <Badge>{app.status}</Badge>
                </div>
                <div style={{ fontSize: 12, color: G.muted }}>
                  Expo: <b style={{ color: G.text }}>
                    {(() => {
                      const expoObj = expos.find(e => e._id === app.expo) || expos.find(e => e.title === app.expo);
                      return expoObj ? expoObj.title : (app.expo || "Expo");
                    })()}
                  </b> · Booth: <b style={{ color: G.text }}>{app.booth}</b>
                  {" · "}{new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {app.status === "pending" && (
                  <>
                    <Btn variant="success" onClick={() => handleReview(app._id, "approved")}>✓ Approve</Btn>
                    <Btn variant="danger"  onClick={() => handleReview(app._id, "rejected")}>✗ Reject</Btn>
                  </>
                )}
                {app.status !== "pending" && <Btn variant="secondary" onClick={() => setSelectedApp(app)}>👁 Details</Btn>}
                <Btn variant="ghost" onClick={() => handleDelete(app._id)}>🗑</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedApp && (
        <Modal title="Exhibitor Details" onClose={() => setSelectedApp(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {selectedApp.appliedBy?.exhibitorProfile?.logo ? (
                <img src={selectedApp.appliedBy.exhibitorProfile.logo} alt="Logo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover" }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 12, background: `${G.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏢</div>
              )}
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif" }}>{selectedApp.company}</div>
                <div style={{ fontSize: 13, color: G.muted }}>{selectedApp.appliedBy?.name || "No User linked"}</div>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Card style={{ padding: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: "uppercase" }}>Category</div>
                <div style={{ fontSize: 14, color: G.text }}>{selectedApp.category || selectedApp.appliedBy?.exhibitorProfile?.category || "—"}</div>
              </Card>
              <Card style={{ padding: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: "uppercase" }}>Booth / Expo</div>
                <div style={{ fontSize: 14, color: G.text }}>{selectedApp.booth} · {selectedApp.expo}</div>
              </Card>
            </div>

            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: "uppercase" }}>Description</div>
              <div style={{ fontSize: 13, color: G.text, marginTop: 4 }}>{selectedApp.description || selectedApp.appliedBy?.exhibitorProfile?.description || "No description provided."}</div>
            </Card>

            {(selectedApp.appliedBy?.exhibitorProfile?.website || selectedApp.appliedBy?.exhibitorProfile?.phone) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Card style={{ padding: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: "uppercase" }}>Website</div>
                  <div style={{ fontSize: 13, color: G.accent, marginTop: 4 }}>{selectedApp.appliedBy?.exhibitorProfile?.website || "—"}</div>
                </Card>
                <Card style={{ padding: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: "uppercase" }}>Phone</div>
                  <div style={{ fontSize: 13, color: G.text, marginTop: 4 }}>{selectedApp.appliedBy?.exhibitorProfile?.phone || "—"}</div>
                </Card>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
