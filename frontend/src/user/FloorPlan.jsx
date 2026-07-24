import React, { useState, useEffect, useMemo } from 'react';
import { G } from '@utils/theme.js';
import Card from '@components/Card.jsx';
import { API_BASE } from '../api.js';

export default function FloorPlan({ setTab, expos = [] }) {
  const [sel, setSel] = useState(null);
  const [booths, setBooths] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch booths
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/booths`)
      .then(r => r.json())
      .then(data => {
        setBooths(data);
        if (expos.length > 0 && !selectedExpoId) {
          setSelectedExpoId(expos[0]._id || expos[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Failed to fetch booths", err);
        setLoading(false);
      });
  }, [expos, selectedExpoId]);

  // Ensure default selection when expos load
  useEffect(() => {
    if (expos.length > 0 && !selectedExpoId) {
      setSelectedExpoId(expos[0]._id || expos[0].id);
    }
  }, [expos, selectedExpoId]);

  const selectedExpo = expos.find(e => (e._id || e.id) === selectedExpoId);
  const boothCount = selectedExpo ? (selectedExpo.booths || 0) : 0;

  const generatedBooths = useMemo(() => {
    if (!selectedExpo) return [];
    const arr = [];
    const sId = selectedExpo._id || selectedExpo.id;
    for (let i = 1; i <= boothCount; i++) {
      const slotName = `A${i}`;
      const dbId = `${sId}-${slotName}`;
      const existing = booths.find(b => b.id === dbId || (b.id === slotName && b.expo === sId));
      if (existing) {
        arr.push({ id: dbId, status: existing.status, company: existing.company, displayId: slotName });
      } else {
        arr.push({ id: dbId, status: "available", company: "", displayId: slotName });
      }
    }
    return arr;
  }, [selectedExpo, booths, boothCount]);

  const cs = {
    available: { bg: 'rgba(0,200,140,.08)',  border: 'rgba(0,200,140,.3)',  color: '#00C88C' },
    reserved:  { bg: 'rgba(255,190,0,.07)',  border: 'rgba(255,190,0,.28)', color: '#FFBE00' },
    occupied:  { bg: 'rgba(232,65,24,.09)',  border: 'rgba(232,65,24,.32)', color: '#E84118' },
  };

  return (
    <div className="view" style={{ padding: '28px 32px' }}>
      {/* Header with Dropdown */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: G.accent, marginBottom: 6 }}>Venue</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 6, color: G.text }}>
            Interactive <span style={{ color: G.accent }}>Floor Plan</span>
          </h2>
          <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6 }}>
            Click a booth to see details and contact the exhibitor.
          </p>
        </div>
        
        {/* Expo Selector */}
        {expos.length > 0 && (
          <select 
            value={selectedExpoId} 
            onChange={(e) => setSelectedExpoId(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 12px",
              color: G.text, outline: "none", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
              cursor: "pointer", minWidth: 200, alignSelf: 'flex-end', marginBottom: 6
            }}
          >
            {expos.map(e => (
              <option key={e._id || e.id} value={e._id || e.id} style={{ background: G.bg }}>{e.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
        {Object.entries(cs).map(([key, c]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: G.muted }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, border: `1px solid ${c.border}` }} />
            <span style={{ textTransform: 'capitalize' }}>{key}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ color: G.muted, padding: 40, textAlign: 'center' }}>Loading Floor Plan...</div>
      ) : generatedBooths.length === 0 ? (
        <Card style={{ padding: 48, textAlign: "center", color: G.muted, fontSize: 13 }}>
          {selectedExpo ? "No booths assigned to this expo yet." : "No expos available."}
        </Card>
      ) : (
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {generatedBooths.map(b => {
              const c = cs[b.status] || cs.available;
              const isSel = sel?.id === b.id;
              return (
                <div key={b.id} className="fp-cell"
                  onClick={() => setSel(sel?.id === b.id ? null : b)}
                  style={{
                    background: c.bg, border: `1.5px solid ${isSel ? c.color : c.border}`,
                    borderRadius: 12, padding: '14px 12px', cursor: 'pointer',
                    boxShadow: isSel ? `0 0 0 2px ${c.color}40` : 'none',
                    transition: 'all .2s',
                  }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: c.color }}>{b.displayId}</div>
                  <div style={{ fontSize: 9, color: c.color, opacity: .7, marginTop: 3, textTransform: 'capitalize', fontWeight: 600 }}>{b.status}</div>
                  {b.company && <div style={{ fontSize: 10, color: c.color, marginTop: 5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.company}</div>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Selected booth detail */}
      {sel && (
        <div style={{
          marginTop: 16, background: G.card, borderRadius: 14,
          border: `1px solid ${cs[sel.status].border}`, padding: '18px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'fadeup .2s ease',
        }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: cs[sel.status].color }}>Booth {sel.displayId}</div>
            <div style={{ fontSize: 13, color: G.text, marginTop: 4, fontWeight: 600 }}>{sel.company || 'Available'}</div>
            <div style={{ fontSize: 11, color: G.muted, marginTop: 2, textTransform: 'capitalize' }}>{sel.status}</div>
          </div>
          {sel.status === 'occupied' && (
            <button onClick={() => setTab('messages')}
              style={{
                background: G.accent, color: '#fff', border: 'none', borderRadius: 10,
                padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}>
              💬 Contact Exhibitor
            </button>
          )}
        </div>
      )}
    </div>
  );
}