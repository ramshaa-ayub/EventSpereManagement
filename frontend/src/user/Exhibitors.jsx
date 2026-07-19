import React, { useState } from 'react';
import { G } from '@utils/theme.js';
import Card from '@components/Card.jsx';

const CATS = ['All', 'Technology', 'Healthcare', 'Agriculture', 'Environment'];

export default function Exhibitors({ setTab, exhibitors = [] }) {
  const [search, setSrch] = useState('');
  const [cat,    setCat]  = useState('All');

  const filtered = exhibitors.filter(e =>
    (cat === 'All' || e.cat === cat) &&
    (search === '' || e.co.toLowerCase().includes(search.toLowerCase()) ||
      (e.prods && e.prods.some(p => p.toLowerCase().includes(search.toLowerCase()))))
  );

  return (
    <div className="view" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: G.accent, marginBottom: 6 }}>Directory</div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 6, color: G.text }}>
        Find <span style={{ color: G.accent }}>Exhibitors</span>
      </h2>
      <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, marginBottom: 22 }}>
        Explore companies showcasing their products and innovations.
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: G.muted, pointerEvents: 'none' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSrch(e.target.value)}
          placeholder="Search companies, products, keywords..."
          style={{
            width: '100%', padding: '11px 16px 11px 40px',
            borderRadius: 10, border: `1px solid ${G.border}`,
            background: G.card, color: G.text, fontSize: 13,
            fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none',
            boxSizing: 'border-box', transition: 'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = `${G.accent}50`}
          onBlur={e => e.target.style.borderColor = G.border}
        />
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            border: `1px solid ${cat === c ? G.accent : G.border}`,
            background: cat === c ? `${G.accent}18` : 'rgba(255,255,255,.03)',
            color: cat === c ? G.accent2 : G.muted,
            padding: '6px 16px', borderRadius: 50, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif",
            transition: 'all .15s',
          }}>{c}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: .35 }}>🔍</div>
          <div style={{ color: G.muted, fontSize: 14 }}>No exhibitors match your search.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {filtered.map(ex => (
            <Card key={ex.id} className="ex-card" style={{ overflow: 'hidden', padding: 0 }}>
              {/* Image header */}
              <div style={{ height: 120, position: 'relative', overflow: 'hidden', background: G.card2 }}>
                <img
                  src={ex.img} alt={ex.co}
                  onError={e => { e.target.parentElement.style.background = G.card2; e.target.style.display = 'none'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.7)', transition: 'transform .4s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                {/* Category badge */}
                <div style={{ position: 'absolute', top: 10, right: 10, background: `${G.accent}cc`, backdropFilter: 'blur(4px)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 50, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {ex.cat}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: G.card2, border: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {ex.ic}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: G.text, fontFamily: "'Syne',sans-serif" }}>{ex.co}</div>
                    {ex.booth && <div style={{ fontSize: 9, color: G.muted, marginTop: 1 }}>Booth {ex.booth}</div>}
                  </div>
                </div>
                {ex.prods && ex.prods.length > 0 && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                    {ex.prods.slice(0, 2).map(p => (
                      <span key={p} style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${G.border}`, color: G.muted, fontSize: 9, padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>{p}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => setTab('messages')}
                  style={{
                    width: '100%', border: 'none', cursor: 'pointer', borderRadius: 8,
                    padding: '8px 0', fontSize: 11, fontWeight: 700,
                    background: G.accent, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif",
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.target.style.opacity = '.85'; e.target.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
                >
                  💬 Contact
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}