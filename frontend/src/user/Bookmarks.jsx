import React from 'react';
import { G } from '@utils/theme.js';
import Card from '@components/Card.jsx';

export default function Bookmarks({ bookmarks, setBookmarks, regs, setRegs, sessions = [] }) {
  const toggle = (setObj, fn, id) => fn(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const saved = sessions.filter(s => bookmarks.has(s.id));

  return (
    <div className="view" style={{ padding: '28px 32px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: G.accent, marginBottom: 6 }}>Saved Sessions</div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 6, color: G.text }}>
        Your <span style={{ color: G.accent }}>Bookmarks</span>
      </h2>
      <p style={{ fontSize: 13, color: G.muted, marginBottom: 22 }}>
        Sessions you've saved — go to Schedule to register.
      </p>

      {saved.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: .4 }}>🔖</div>
          <div style={{ color: G.muted, fontSize: 14 }}>No bookmarks yet.</div>
          <div style={{ color: G.muted, opacity: .7, fontSize: 12, marginTop: 6 }}>Go to the Schedule tab to save sessions.</div>
        </div>
      ) : (
        <>
          {/* Reminder banner */}
          <div style={{
            background: `${G.accent}08`, border: `1px solid ${G.accent}20`,
            borderRadius: 12, padding: '12px 18px', marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
          }}>
            <span style={{ fontSize: 18 }}>⏰</span>
            <div>
              <span style={{ color: G.text, fontWeight: 700 }}>{saved.length} session{saved.length !== 1 ? 's' : ''} saved</span>
              <span style={{ color: G.muted }}> — go to Schedule to register before spots fill up!</span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {saved.map(s => {
              const isR = regs.has(s.id);
              const regCount = s.reg ?? s.registered ?? 0;
              const capCount = s.cap ?? s.capacity ?? 100;
              const pct = Math.round((regCount / capCount) * 100);

              return (
                <Card key={s.id} style={{
                  padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center',
                  borderLeft: isR ? `3px solid ${G.accent}` : `3px solid ${G.accent}40`,
                  borderRadius: 14,
                }}>
                  <div style={{ background: `${G.accent}10`, borderRadius: 10, padding: '10px 10px', textAlign: 'center', flexShrink: 0, minWidth: 56 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: G.accent }}>{s.time}</div>
                    {s.ampm && <div style={{ fontSize: 8, color: `${G.accent}80`, fontWeight: 700, marginTop: 2 }}>{s.ampm}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: G.text, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>
                      📍 {s.hall} · 🎤 {s.speaker} · 👥 <span style={{ color: pct > 80 ? '#EF4444' : G.accent, fontWeight: 600 }}>{regCount}/{capCount}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {isR ? (
                      <span style={{
                        padding: '7px 16px', fontSize: 12, fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        background: `${G.accent}18`, color: G.accent,
                        borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>✓ Registered</span>
                    ) : (
                      <span style={{
                        padding: '7px 16px', fontSize: 12, fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        background: 'rgba(255,255,255,.04)', color: G.muted,
                        borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>📅 Go to Schedule</span>
                    )}
                    <button onClick={() => toggle(bookmarks, setBookmarks, s.id)}
                      style={{
                        border: 'none', borderRadius: 8, cursor: 'pointer',
                        padding: '7px 12px', fontSize: 12, fontWeight: 700,
                        background: 'rgba(239,68,68,.1)', color: G.red,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                      }}>
                      ✕
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}