import { useState, useRef, useEffect } from "react";
import { G, ACCENT, Card, Btn, Badge, SectionTitle, Alert } from "./shared.jsx";
import { getToken } from "../api.js";

export default function Profile({ user, onUpdate }) {
  const [form, setForm] = useState({
    company:     user?.exhibitorProfile?.company || user?.name || "",
    category:    user?.exhibitorProfile?.category || "Technology",
    website:     user?.exhibitorProfile?.website || "",
    phone:       user?.exhibitorProfile?.phone || "",
    description: user?.exhibitorProfile?.description || "",
    linkedin:    user?.exhibitorProfile?.linkedin || "",
    instagram:   user?.exhibitorProfile?.instagram || "",
    logoUrl:     user?.exhibitorProfile?.logo || "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");
  const [preview, setPreview] = useState(form.logoUrl);
  const fileRef = useRef(null);

  // Sync state if user prop updates
  useEffect(() => {
    if (user) {
      const p = user.exhibitorProfile || {};
      setForm({
        company:     p.company || user.name || "",
        category:    p.category || "Technology",
        website:     p.website || "",
        phone:       p.phone || "",
        description: p.description || "",
        linkedin:    p.linkedin || "",
        instagram:   p.instagram || "",
        logoUrl:     p.logo || "",
      });
      setPreview(p.logo || "");
    }
  }, [user]);

  const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(form.logoUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("company",     form.company);
      fd.append("category",    form.category);
      fd.append("website",     form.website);
      fd.append("phone",       form.phone);
      fd.append("description", form.description);
      fd.append("linkedin",    form.linkedin);
      fd.append("instagram",   form.instagram);

      if (form.logoUrl && !fileRef.current?.files?.length) {
        fd.append("logo", form.logoUrl);
      }
      if (fileRef.current?.files?.length) {
        fd.append("logo", fileRef.current.files[0]);
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Update parent component state if needed
      if (onUpdate && data.user) {
        onUpdate(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Account</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>Company Profile</h2>
        <p style={{ fontSize: 13, color: G.muted }}>Your public exhibitor profile shown to attendees and admins.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.2fr", gap: 16 }}>
        {/* Logo Panel */}
        <div>
          <Card style={{ padding: 24, textAlign: "center", marginBottom: 14 }}>
            {preview ? (
              <img src={preview} alt="Company Logo" style={{ width: 90, height: 90, borderRadius: 18, objectFit: "cover", margin: "0 auto 14px", border: `2px solid ${ACCENT}30` }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: 18, background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, margin: "0 auto 14px", border: `2px solid ${ACCENT}30` }}>🏢</div>
            )}
            <div style={{ fontWeight: 800, fontSize: 16, color: G.text, fontFamily: "'Syne',sans-serif" }}>{form.company || "Your Company"}</div>
            <div style={{ fontSize: 12, color: G.muted, marginTop: 3 }}>{form.category}</div>
            <div style={{ marginTop: 10 }}><Badge>exhibitor</Badge></div>
            <div style={{ marginTop: 14, fontSize: 12, color: G.muted, opacity: .6 }}>Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Account Info</div>
            {[["Email", user?.email || "—"], ["Role", "Exhibitor"], ["ID", (user?.id || user?._id || "—").slice(-8)]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${G.border}` }}>
                <span style={{ fontSize: 12, color: G.muted }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Edit Form */}
        <Card style={{ padding: 26 }}>
          <SectionTitle>Edit Company Profile</SectionTitle>
          {saved && <Alert msg="✅ Profile saved successfully!" type="success" />}
          {error && <Alert msg={`❌ ${error}`} type="error" />}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Company Logo</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label style={{
                padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                background: G.card2, border: `1px solid ${G.border}`, color: G.text, fontSize: 12,
                transition: "border-color .2s"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${G.accent}60`}
                onMouseLeave={e => e.currentTarget.style.borderColor = G.border}
              >
                📁 Upload Image
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
              <span style={{ fontSize: 12, color: G.muted }}>Or paste URL:</span>
              <input value={form.logoUrl} onChange={e => { set("logoUrl")(e); setPreview(e.target.value); }} placeholder="https://..." style={{ flex: 1, padding: "9px 12px", borderRadius: 8, background: G.card2, border: `1px solid ${G.border}`, color: G.text, fontSize: 12 }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              ["Company Name",       "company"],
              ["Category / Industry","category"],
              ["Website URL",        "website"],
              ["Phone Number",       "phone"],
              ["LinkedIn URL",       "linkedin"],
              ["Instagram Handle",   "instagram"],
            ].map(([label, field]) => (
              <div key={field}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>{label}</div>
                <input value={form[field]} onChange={set(field)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: G.card2, border: `1px solid ${G.border}`, color: G.text, fontSize: 13 }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Company Description</div>
            <textarea value={form.description} onChange={set("description")} rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: G.card2, border: `1px solid ${G.border}`, color: G.text, fontSize: 13, resize: "vertical" }} />
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Btn size="md" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "💾 Save Changes"}</Btn>
            <Btn size="md" variant="secondary" onClick={() => {
               setForm(f => ({ ...f, company: user?.exhibitorProfile?.company || user?.name || "" }));
               setPreview(user?.exhibitorProfile?.logo || "");
               if (fileRef.current) fileRef.current.value = "";
            }}>↺ Reset</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
