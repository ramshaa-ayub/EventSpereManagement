import { useState, useEffect } from "react";
import { fetchSessions, createSession, updateSession, deleteSession, fetchExpos, fetchSessionRegistrations } from "../api.js";
import { G, Card, Btn, Field, Spinner, Toast, Modal } from "./shared.jsx";

// ─── REGISTRATIONS VIEWER ─────────────────────────────────────────────────────
function RegistrationsViewer({ session, onClose }) {
  const [regs, setRegs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSessionRegistrations(session._id);
        setRegs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session._id]);

  const totalMembers = regs.reduce((sum, r) => sum + (r.members || 1), 0);

  return (
    <div className="modal-bg" onClick={e => e.target.classList.contains('modal-bg') && onClose()}>
      <div className="modal-box" style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Registrations</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: G.text }}>{session.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: 'none', color: G.muted, borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ padding: '10px 16px', background: `${G.accent}12`, borderRadius: 10, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: G.accent, fontFamily: "'Syne',sans-serif" }}>{regs.length}</div>
            <div style={{ fontSize: 10, color: G.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Registrations</div>
          </div>
          <div style={{ padding: '10px 16px', background: `${G.teal}12`, borderRadius: 10, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: G.teal, fontFamily: "'Syne',sans-serif" }}>{totalMembers}</div>
            <div style={{ fontSize: 10, color: G.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Total Members</div>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,.04)', borderRadius: 10, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif" }}>{session.capacity - (session.registered || 0)}</div>
            <div style={{ fontSize: 10, color: G.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Remaining</div>
          </div>
        </div>

        {loading ? <Spinner /> : error ? (
          <div style={{ color: G.red, fontSize: 13, padding: 20, textAlign: 'center' }}>❌ {error}</div>
        ) : regs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: G.muted, fontSize: 13 }}>
            No registrations yet for this session.
          </div>
        ) : (
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Contact Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Members</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r, i) => (
                  <tr key={r._id}>
                    <td style={{ color: G.muted }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{r.contactName}</td>
                    <td style={{ color: G.muted }}>{r.contactEmail}</td>
                    <td style={{ color: G.muted }}>{r.contactPhone || '—'}</td>
                    <td>
                      <span style={{
                        background: `${G.accent}15`, color: G.accent, padding: '2px 10px',
                        borderRadius: 20, fontSize: 12, fontWeight: 700,
                      }}>{r.members}</span>
                    </td>
                    <td style={{ color: G.muted, fontSize: 11 }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SESSIONS PAGE ────────────────────────────────────────────────────────────
export default function SessionsPage() {
  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [toast,       setToast]       = useState({ msg: "", type: "" });
  const [expos,       setExpos]       = useState([]);
  const [viewRegs,    setViewRegs]    = useState(null); // session to view registrations
  const [form,        setForm]        = useState({
    title: "", speaker: "", time: "", hall: "", capacity: 100, expo: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      const [sessionsData, exposData] = await Promise.all([
        fetchSessions(),
        fetchExpos()
      ]);
      setSessions(sessionsData);
      // Build expo lookup for date display
      const lookup = {};
      exposData.forEach(e => { if (e.title) lookup[e.title] = e; });
      // Only show upcoming expos for the "assign" dropdown
      setExpos(exposData.filter(e => {
        const d = e.date ? new Date(e.date) : null;
        const today = new Date(); today.setHours(0,0,0,0);
        return !d || d >= today;
      }));
      // Store all expos for date lookups in the list
      setSessions(sessionsData.map(s => ({
        ...s,
        _expoDate: s.expo && lookup[s.expo] ? lookup[s.expo].date : null,
      })));
    }
    catch (err) { showToast(err.message || "Failed to load sessions", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSessions(); }, []);

  const openCreate = () => {
    setEditSession(null);
    setForm({ title: "", speaker: "", time: "", hall: "", capacity: 100, expo: "" });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditSession(s);
    setForm({ title: s.title, speaker: s.speaker, time: s.time, hall: s.hall, capacity: s.capacity, expo: s.expo || "" });
    setShowForm(true);
  };

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.speaker || !form.time || !form.hall)
      return showToast("Title, speaker, time and hall are required", "error");
    try {
      if (editSession) {
        await updateSession(editSession._id, form);
        showToast("Session updated!");
      } else {
        await createSession(form);
        showToast("Session created!");
      }
      setShowForm(false);
      loadSessions();
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await deleteSession(id);
      showToast("Session deleted!");
      loadSessions();
    } catch (err) { showToast(err.message, "error"); }
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
      <Toast {...toast} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Schedule</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>Session Management</h2>
            <p style={{ fontSize: 13, color: G.muted }}>Full CRUD — all changes saved directly to MongoDB Atlas</p>
          </div>
          <Btn size="md" onClick={openCreate}>＋ Add Session</Btn>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <Modal
          title={editSession ? "✏️ Edit Session" : "＋ New Session"}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          submitLabel={editSession ? "Save Changes" : "Create Session"}
        >
          <Field label="Session Title" value={form.title}    onChange={f("title")}    placeholder="e.g. Future of AI in Healthcare" required />
          <Field label="Speaker"       value={form.speaker}  onChange={f("speaker")}  placeholder="e.g. Dr. Ayesha Siddiqui"        required />
          <Field label="Time"          value={form.time}     onChange={f("time")}     placeholder="e.g. 10:00 AM"                   required />
          <Field label="Hall / Room"   value={form.hall}     onChange={f("hall")}     placeholder="e.g. Main Hall"                  required />
          <Field label="Capacity"      value={form.capacity} onChange={f("capacity")} placeholder="100" type="number" />
          <Field 
            label="Expo" 
            as="select" 
            value={form.expo} 
            onChange={f("expo")} 
            placeholder="Select an upcoming Expo"
            options={expos.map(e => ({ label: e.title, value: e.title }))}
          />
        </Modal>
      )}

      {/* Registrations Viewer Modal */}
      {viewRegs && (
        <RegistrationsViewer session={viewRegs} onClose={() => setViewRegs(null)} />
      )}

      {/* Sessions list */}
      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gap: 10 }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: G.muted, fontSize: 13 }}>
              No sessions yet — click "Add Session" to create one
            </div>
          ) : sessions.map(s => {
            const pct = Math.min(((s.registered || 0) / (s.capacity || 1)) * 100, 100);
            const timeParts = (s.time || "").split(" ");
            return (
              <div key={s._id} style={{
                background: G.card, border: `1px solid ${G.border}`, borderRadius: 12,
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
              }}>
                {/* Time badge */}
                <div style={{
                  textAlign: "center", minWidth: 56, padding: "8px 10px",
                  background: `${G.accent}18`, borderRadius: 10, flexShrink: 0,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G.accent, fontFamily: "'Syne',sans-serif" }}>{timeParts[0]}</div>
                  {timeParts[1] && <div style={{ fontSize: 9, color: `${G.accent}90`, fontWeight: 700, marginTop: 2 }}>{timeParts[1]}</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: G.text, marginBottom: 3, fontFamily: "'Syne',sans-serif" }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: G.muted }}>
                    🎤 {s.speaker} · 📍 {s.hall}{s.expo ? ` · 🎪 ${s.expo}` : ''}
                  </div>
                  {s._expoDate && (
                    <div style={{ fontSize: 11, color: G.accent, fontWeight: 600, marginTop: 2 }}>
                      📅 {new Date(s._expoDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,.06)', flex: 1, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        background: pct > 90 ? G.red : pct > 70 ? G.amber : G.accent,
                        width: `${pct}%`, transition: 'width .3s',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: pct > 80 ? G.red : G.muted, whiteSpace: 'nowrap', flexShrink: 0, fontWeight: pct > 80 ? 700 : 400 }}>
                      👥 {s.registered || 0}/{s.capacity}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Btn variant="success" onClick={() => setViewRegs(s)}>👥 Registrations</Btn>
                  <Btn variant="secondary" onClick={() => openEdit(s)}>✏️ Edit</Btn>
                  <Btn variant="danger"    onClick={() => handleDelete(s._id)}>🗑</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
