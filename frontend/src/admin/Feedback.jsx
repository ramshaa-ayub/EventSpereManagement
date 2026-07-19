import { useState } from "react";
import { G, Card } from "./shared.jsx";

const TYPE_ICON = { bug: '🐛', suggestion: '💡', complaint: '⚠️' };

const DUMMY_FEEDBACK = [
  { id: 1, from: 'Ali Hassan',     subject: 'Floor plan not loading on mobile',              type: 'bug',        status: 'open',     time: '1h ago'  },
  { id: 2, from: 'Zara Khan',      subject: 'Add PDF export for session schedules',           type: 'suggestion', status: 'reviewed', time: '3h ago'  },
  { id: 3, from: 'Omar Sheikh',    subject: 'Booth selection UI is confusing for new users',  type: 'complaint',  status: 'resolved', time: '1d ago'  },
  { id: 4, from: 'Ayesha Noor',    subject: 'Registration confirmation email not received',   type: 'bug',        status: 'open',     time: '2d ago'  },
  { id: 5, from: 'Bilal Chaudhry', subject: 'Allow bulk downloading of exhibitor brochures', type: 'suggestion', status: 'open',     time: '3d ago'  },
];

const StatusBadge = ({ status }) => {
  const map = {
    open:     { bg: 'rgba(245,158,11,.12)',  color: '#F59E0B' },
    reviewed: { bg: 'rgba(6,182,212,.12)',   color: '#06B6D4' },
    resolved: { bg: 'rgba(16,185,129,.12)',  color: '#10B981' },
  };
  const s = map[status] || { bg: 'rgba(100,100,130,.12)', color: G.muted };
  return <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{status}</span>;
};

const TypeBadge = ({ type }) => {
  const map = {
    bug:        { bg: 'rgba(239,68,68,.1)',   color: '#EF4444' },
    suggestion: { bg: 'rgba(124,58,237,.1)',  color: '#9F67FF' },
    complaint:  { bg: 'rgba(245,158,11,.1)',  color: '#F59E0B' },
  };
  const s = map[type] || { bg: 'rgba(100,100,130,.1)', color: G.muted };
  return <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{type}</span>;
};

export default function Feedback() {
  const [feeds,  setFeeds]  = useState(DUMMY_FEEDBACK);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? feeds : feeds.filter(f => f.type === filter || f.status === filter);
  const updateStatus = (id, status) => setFeeds(prev => prev.map(f => f.id === id ? { ...f, status } : f));

  const filterBtns = [
    { key: 'all',        label: 'All'             },
    { key: 'open',       label: 'Open'            },
    { key: 'reviewed',   label: 'Reviewed'        },
    { key: 'resolved',   label: 'Resolved'        },
    { key: 'bug',        label: '🐛 Bugs'         },
    { key: 'suggestion', label: '💡 Ideas'        },
    { key: 'complaint',  label: '⚠️ Complaints'  },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Support</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>Feedback & Support</h2>
        <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.5 }}>User submissions — bugs, suggestions, and complaints.</p>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',    count: feeds.length,                               color: G.accent2 },
          { label: 'Open',     count: feeds.filter(f => f.status === 'open').length,     color: G.amber },
          { label: 'Reviewed', count: feeds.filter(f => f.status === 'reviewed').length, color: G.teal },
          { label: 'Resolved', count: feeds.filter(f => f.status === 'resolved').length, color: G.green },
        ].map(s => (
          <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}30`, borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.count}</span>
            <span style={{ fontSize: 11, color: G.muted }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {filterBtns.map(btn => (
          <button key={btn.key} onClick={() => setFilter(btn.key)}
            style={{
              border: `1px solid ${filter === btn.key ? G.accent : G.border}`,
              background: filter === btn.key ? `${G.accent}18` : 'transparent',
              color: filter === btn.key ? G.accent2 : G.muted,
              padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif",
              transition: 'all .15s',
            }}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: G.muted, fontSize: 13 }}>No feedback matching this filter.</div>
        )}
        {filtered.map(f => (
          <Card key={f.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 20px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: G.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {TYPE_ICON[f.type] || '📝'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: G.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.subject}</div>
              <div style={{ fontSize: 11, color: G.muted }}>
                From: <b style={{ color: G.text }}>{f.from}</b> · {f.time}
              </div>
            </div>
            <TypeBadge type={f.type} />
            <StatusBadge status={f.status} />
            {f.status === 'open' && (
              <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                <button onClick={() => updateStatus(f.id, 'reviewed')}
                  style={{ background: 'rgba(6,182,212,.12)', border: 'none', color: '#06B6D4', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Mark Reviewed
                </button>
                <button onClick={() => updateStatus(f.id, 'resolved')}
                  style={{ background: 'rgba(16,185,129,.12)', border: 'none', color: '#10B981', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  ✓ Resolve
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
