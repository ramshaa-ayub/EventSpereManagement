import { useState, useEffect, useRef } from "react";
import { deleteExpo, fetchExpos } from "../api.js";
import { G, Badge, Card, Btn, Spinner, Toast, Modal, Field } from "./shared.jsx";
import { getToken } from "../api.js";

// ─── EXPO MANAGEMENT PAGE ──────────────────────────────────────────────────────
// Full CRUD with image upload: GET / POST (multipart) / PUT (multipart) / DELETE
export default function ExpoManagement() {
  const [expos,     setExpos]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editExpo,  setEditExpo]  = useState(null);
  const [toast,     setToast]     = useState({ msg: "", type: "" });
  const [submitting,setSubmitting]= useState(false);
  const [preview,   setPreview]   = useState("");  // local image preview

  const fileRef = useRef(null);

  const EMPTY = { title: "", date: "", location: "", booths: "", status: "upcoming", description: "", theme: "", imgUrl: "" };
  const [form, setForm] = useState(EMPTY);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3200);
  };

  const loadExpos = async () => {
    setLoading(true);
    try {
      const data = await fetchExpos();
      const today = new Date(); today.setHours(0,0,0,0);
      setExpos(data.map(e => {
        const d = e.date ? new Date(e.date) : null;
        return { ...e, status: (d && d < today) ? 'completed' : e.status };
      }));
    }
    catch (err) { showToast(err.message || "Failed to load expos", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadExpos(); }, []);

  const openCreate = () => {
    setEditExpo(null);
    setForm(EMPTY);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
    setShowForm(true);
  };

  const openEdit = (expo) => {
    setEditExpo(expo);
    setForm({
      title: expo.title, date: expo.date, location: expo.location,
      booths: expo.booths, status: expo.status,
      description: expo.description || "",
      theme: expo.theme || "",
      imgUrl: expo.img || "",
    });
    setPreview(expo.img || "");
    if (fileRef.current) fileRef.current.value = "";
    setShowForm(true);
  };

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(form.imgUrl);
  };

  // Submit via multipart/form-data so the backend Cloudinary middleware works
  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.location) {
      return showToast("Title, date and location are required", "error");
    }
    setSubmitting(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("title",       form.title);
      fd.append("date",        form.date);
      fd.append("location",    form.location);
      fd.append("booths",      form.booths || 0);
      fd.append("status",      form.status);
      fd.append("description", form.description);
      fd.append("theme",       form.theme);
      // If manual URL provided and no file, send it as img field
      if (form.imgUrl && (!fileRef.current?.files?.length)) {
        fd.append("img", form.imgUrl);
      }
      // If file selected, attach it
      if (fileRef.current?.files?.length) {
        fd.append("img", fileRef.current.files[0]);
      }

      const url    = editExpo ? `/api/expos/${editExpo._id}` : "/api/expos";
      const method = editExpo ? "PUT" : "POST";

      const res  = await fetch(url, {
        method, body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      showToast(editExpo ? "Expo updated!" : "Expo created!");
      setShowForm(false);
      loadExpos();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expo? This cannot be undone.")) return;
    try {
      await deleteExpo(id);
      showToast("Expo deleted!");
      loadExpos();
    } catch (err) { showToast(err.message, "error"); }
  };

  // Status options for the Field select
  const STATUS_OPTS = [
    { value: "upcoming",  label: "Upcoming" },
    { value: "ongoing",   label: "Ongoing" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200 }}>
      <Toast {...toast} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: G.accent, marginBottom: 5 }}>Management</div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: "-.02em", marginBottom: 4, lineHeight: 1.1 }}>Expo Management</h2>
            <p style={{ fontSize: 13, color: G.muted }}>Create, edit, and manage all expo events. All changes saved to MongoDB.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ padding: "5px 14px", borderRadius: 20, background: "rgba(255,255,255,.05)", border: `1px solid ${G.border}`, fontSize: 11, color: G.muted, fontWeight: 600 }}>
                {expos.length} Total
              </div>
              <div style={{ padding: "5px 14px", borderRadius: 20, background: `${G.accent}12`, border: `1px solid ${G.accent}30`, fontSize: 11, color: G.accent, fontWeight: 600 }}>
                {expos.filter(e => e.status === "upcoming").length} Upcoming
              </div>
              <div style={{ padding: "5px 14px", borderRadius: 20, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", fontSize: 11, color: G.green, fontWeight: 600 }}>
                {expos.filter(e => e.status === "completed").length} Completed
              </div>
            </div>
            <Btn size="md" onClick={openCreate}>＋ Create Expo</Btn>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <Modal
          title={editExpo ? "✏️ Edit Expo" : "＋ New Expo"}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          submitLabel={submitting ? "Saving…" : editExpo ? "Save Changes" : "Create Expo"}
        >
          {/* Two-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
            <Field label="Expo Title *"   value={form.title}       onChange={f("title")}       placeholder="e.g. TechXpo 2026"         required />
            <Field label="Date *"         value={form.date}        onChange={f("date")}        placeholder="e.g. 15 Apr 2026"          required />
            <Field label="Location *"     value={form.location}    onChange={f("location")}    placeholder="e.g. Karachi Expo Centre"  required />
            <Field label="Total Booths"   value={form.booths}      onChange={f("booths")}      placeholder="40" type="number" />
            <Field label="Theme / Category" value={form.theme}     onChange={f("theme")}       placeholder="e.g. Technology, Healthcare" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Status</div>
              <select value={form.status} onChange={f("status")} style={{ width: "100%", background: G.card2, border: `1px solid ${G.border}`, color: G.text, borderRadius: 8, padding: "10px 12px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13 }}>
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <Field label="Description" value={form.description} onChange={f("description")} placeholder="Brief description of the expo…" />

          {/* Image section */}
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Cover Image</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
              {/* File upload */}
              <div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 5 }}>Upload a file (Cloudinary)</div>
                <label style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "28px 16px", borderRadius: 10, cursor: "pointer",
                  border: `2px dashed ${G.border}`, background: G.card2, color: G.muted, fontSize: 12,
                  transition: "border-color .2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${G.accent}60`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = G.border}
                >
                  📁 Browse / Drop Image
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </label>
              </div>

              {/* OR manual URL */}
              <div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 5 }}>Or paste an image URL</div>
                <textarea
                  value={form.imgUrl}
                  onChange={e => { f("imgUrl")(e); setPreview(e.target.value); }}
                  placeholder="https://images.unsplash.com/…"
                  rows={3}
                  style={{ width: "100%", background: G.card2, border: `1px solid ${G.border}`, color: G.text, borderRadius: 8, padding: "10px 12px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, resize: "vertical" }}
                />
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 5 }}>Preview</div>
                <img
                  src={preview} alt="Expo preview"
                  onError={e => { e.target.style.display = "none"; }}
                  style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 10, border: `1px solid ${G.border}` }}
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Expo Grid */}
      {loading ? <Spinner /> : (
        expos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: G.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎪</div>
            <div style={{ fontSize: 14, marginBottom: 6 }}>No expos yet</div>
            <div style={{ fontSize: 12 }}>Click "+ Create Expo" to add your first event</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {expos.map(expo => {
              const isCompleted = expo.status === "completed";
              const statusColor = expo.status === "upcoming" ? G.accent : expo.status === "ongoing" ? G.teal : isCompleted ? G.green : G.muted;
              return (
                <div key={expo._id} style={{
                  background: G.card, border: `1px solid ${G.border}`, borderRadius: 16,
                  overflow: "hidden", transition: "border-color .2s, box-shadow .2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${G.accent}40`; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,.35)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Image */}
                  <div style={{ height: 180, position: "relative", overflow: "hidden", background: "#0e0e20" }}>
                    {expo.img ? (
                      <img src={expo.img} alt={expo.title} onError={e => e.target.style.display = "none"}
                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: isCompleted ? "grayscale(40%) brightness(.75)" : "brightness(.85)", transition: "transform .4s" }}
                        onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                        background: `linear-gradient(135deg,${G.accent}20,${G.card2})` }}>
                        <span style={{ fontSize: 48, opacity: 0.2 }}>🏛️</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 35%,rgba(7,7,15,.95) 100%)" }} />

                    {/* Status badge top-left */}
                    <div style={{
                      position: "absolute", top: 12, left: 12,
                      padding: "4px 12px", borderRadius: 50, fontSize: 9, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: ".08em",
                      background: `${statusColor}22`, color: statusColor,
                      border: `1px solid ${statusColor}40`, backdropFilter: "blur(6px)",
                    }}>
                      {expo.status === "upcoming" ? "● Upcoming" : expo.status === "ongoing" ? "◉ Ongoing" : "✓ Completed"}
                    </div>

                    {/* Booths badge top-right */}
                    <div style={{
                      position: "absolute", top: 12, right: 12,
                      padding: "4px 10px", borderRadius: 50, fontSize: 9, fontWeight: 700,
                      background: "rgba(0,0,0,.5)", color: "rgba(255,255,255,.75)", backdropFilter: "blur(6px)",
                    }}>
                      {expo.booths || 0} booths
                    </div>

                    {/* Title + theme on image */}
                    <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
                      {expo.theme && (
                        <div style={{ fontSize: 9, color: G.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{expo.theme}</div>
                      )}
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.25, textShadow: "0 2px 8px rgba(0,0,0,.7)" }}>
                        {expo.title}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "14px 16px 16px" }}>
                    {/* Meta grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.muted }}>
                        <span>📅</span> <span>{expo.date || "TBA"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.muted, overflow: "hidden" }}>
                        <span>📍</span> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{expo.location || "TBA"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.muted }}>
                        <span>👥</span> <span>{expo.registered || 0} registered</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: G.muted }}>
                        <span>🏪</span> <span>{expo.booths || 0} total booths</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: G.border, marginBottom: 12 }} />

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="secondary" onClick={() => openEdit(expo)} style={{ flex: 1, justifyContent: "center" }}>✏️ Edit</Btn>
                      <Btn variant="danger" onClick={() => handleDelete(expo._id)} style={{ padding: "6px 14px" }}>🗑️</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
