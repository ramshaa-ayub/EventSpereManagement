import React, { useState, useEffect, useMemo } from "react";
import { fetchExpos } from "../api.js";
import { G, Card, Btn, Field, Spinner, Toast, useToast } from "./shared.jsx";

const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;
const getToken = () => localStorage.getItem("token");
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const fetchBooths = async () => {
  const res = await fetch(`${BASE}/booths`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch booths");
  return res.json();
};
const createBooth = async (data) => {
  const res  = await fetch(`${BASE}/booths`, { method: "POST", headers: headers(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};
const updateBooth = async (id, data) => {
  const res  = await fetch(`${BASE}/booths/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};
const deleteBooth = async (id) => {
  const res  = await fetch(`${BASE}/booths/${id}`, { method: "DELETE", headers: headers() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

// Dark color map
const COLORS = {
  available: { bg: 'rgba(16,185,129,.1)',  border: 'rgba(16,185,129,.3)',  text: '#10B981' },
  reserved:  { bg: 'rgba(245,158,11,.09)', border: 'rgba(245,158,11,.3)', text: '#F59E0B' },
  occupied:  { bg: 'rgba(124,58,237,.1)',  border: 'rgba(124,58,237,.3)', text: '#9F67FF' },
};

const EMPTY_FORM = { id: "", status: "available", company: "", displayId: "" };

const FloorPlan = () => {
  const [booths,    setBooths]    = useState([]);
  const [expos,     setExpos]     = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editBooth, setEditBooth] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [toast,     showToast]    = useToast();

  const load = async () => {
    setLoading(true);
    try { 
      const [boothsData, exposData] = await Promise.all([fetchBooths(), fetchExpos()]);
      setBooths(boothsData);
      setExpos(exposData);
      if (exposData.length > 0 && !selectedExpoId) {
        setSelectedExpoId(exposData[0]._id);
      }
    }
    catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (b) => { 
    setEditBooth(b); 
    setForm({ 
      id: b.id, 
      status: b.status, 
      company: b.company || "", 
      displayId: b.displayId || (b.id.includes("-") ? b.id.split("-")[1] : b.id),
      isNew: b.isNew 
    }); 
    setShowForm(true); 
  };
  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.id.trim()) return showToast("Booth ID is required", "error");
    try {
      if (form.isNew) {
        await createBooth({ id: form.id, status: form.status, company: form.company, expo: selectedExpoId });
        showToast("Booth created!");
      } else {
        await updateBooth(form.id, { status: form.status, company: form.company, expo: selectedExpoId }); 
        showToast("Booth updated!");
      }
      setShowForm(false); load();
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete booth assignment ${form.displayId}? This cannot be undone.`)) return;
    try { await deleteBooth(form.id); showToast("Booth deleted!"); setShowForm(false); load(); }
    catch (err) { showToast(err.message, "error"); }
  };

  const selectedExpo = expos.find(e => e._id === selectedExpoId);
  const boothCount = selectedExpo ? (selectedExpo.booths || 0) : 0;

  const generatedBooths = useMemo(() => {
    if (!selectedExpo) return [];
    const arr = [];
    for (let i = 1; i <= boothCount; i++) {
      const slotName = `A${i}`;
      const dbId = `${selectedExpo._id}-${slotName}`;
      const existing = booths.find(b => b.id === dbId || (b.id === slotName && b.expo === selectedExpo._id));
      if (existing) {
        arr.push({ ...existing, displayId: slotName, isNew: false });
      } else {
        arr.push({ id: dbId, status: "available", company: "", expo: selectedExpo._id, isNew: true, displayId: slotName });
      }
    }
    return arr;
  }, [selectedExpo, booths, boothCount]);

  const stats = {
    available: generatedBooths.filter(b => b.status === "available").length,
    reserved:  generatedBooths.filter(b => b.status === "reserved").length,
    occupied:  generatedBooths.filter(b => b.status === "occupied").length,
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
      <Toast {...toast} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Venue</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>Floor Plan Manager</h2>
            <p style={{ fontSize: 13, color: G.muted }}>Select an expo to manage its booths · All changes saved to MongoDB</p>
          </div>
          <div>
            <select 
              value={selectedExpoId} 
              onChange={(e) => setSelectedExpoId(e.target.value)}
              style={{
                background: G.card2, border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 12px",
                color: G.text, outline: "none", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
                cursor: "pointer", minWidth: 200
              }}
            >
              {expos.length === 0 ? <option value="">No Expos</option> : null}
              {expos.map(e => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Available", key: "available", color: G.green },
          { label: "Reserved",  key: "reserved",  color: G.amber },
          { label: "Occupied",  key: "occupied",  color: G.accent },
          { label: "Total",     key: null,         color: G.muted },
        ].map(s => (
          <Card key={s.label} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: G.text, fontFamily: "'Syne',sans-serif" }}>
                {s.key ? stats[s.key] : generatedBooths.length}
              </div>
              <div style={{ fontSize: 11, color: G.muted }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {Object.entries(COLORS).map(([key, c]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: G.muted }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, border: `1px solid ${c.border}` }} />
            <span style={{ textTransform: 'capitalize' }}>{key}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : generatedBooths.length === 0 ? (
        <Card style={{ padding: 48, textAlign: "center", color: G.muted, fontSize: 13 }}>
          {selectedExpo ? "No booths assigned to this expo. Update the booths count in Expo Management." : "No booths yet"}
        </Card>
      ) : (
        <Card style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {generatedBooths.map(b => {
              const c = COLORS[b.status] ?? COLORS.available;
              return (
                <div key={b.id} onClick={() => openEdit(b)}
                  style={{
                    background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 12,
                    padding: "14px 12px", cursor: "pointer", transition: "transform .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ fontWeight: 800, fontSize: 15, color: c.text, fontFamily: "'Syne',sans-serif" }}>{b.displayId}</div>
                  <div style={{ fontSize: 10, color: c.text, opacity: .7, marginTop: 2, textTransform: "capitalize" }}>{b.status}</div>
                  {b.company && <div style={{ fontSize: 10, color: c.text, marginTop: 4, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.company}</div>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background: G.card, border: `1px solid ${G.border2}`, borderRadius: 16, padding: 28, width: 420 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, color: G.text, fontFamily: "'Syne',sans-serif", marginBottom: 20 }}>
              {form.isNew ? `Assign Booth ${form.displayId}` : `✏️ Edit Booth ${form.displayId}`}
            </h3>
            <Field label="Booth ID" value={form.displayId} onChange={() => {}} disabled={true} />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Status</div>
              <select value={form.status} onChange={f("status")}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
            <Field label="Exhibitor Name / Company (optional)" value={form.company} onChange={f("company")} placeholder="e.g. NexaAI Solutions" />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {!form.isNew && <Btn variant="danger" onClick={handleDelete}>🗑 Reset</Btn>}
              <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
              <Btn size="md" onClick={handleSubmit} style={{ flex: 1, justifyContent: 'center' }}>
                {form.isNew ? "Assign Booth" : "Save Changes"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPlan;