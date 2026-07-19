import { useState } from "react";

// ─── Design tokens — dark purple admin theme ──────────────────────────────────
export const G = {
  bg: '#07070f', bg2: '#0c0c1c', card: '#111121', card2: '#18182e',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(124,58,237,0.35)',
  accent: '#7C3AED', accent2: '#9F67FF', muted: 'rgba(200,200,230,0.45)',
  text: '#e8e8f8', teal: '#06B6D4', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
};

export const ACCENT = G.accent;

// Global CSS injected into admin pages
export const adminCss = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#2a2a40;border-radius:2px}
  input,textarea,select{font-family:'Plus Jakarta Sans',sans-serif;background:#18182e;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#e8e8f8;outline:none;font-size:13px;width:100%;transition:border-color .2s;box-sizing:border-box}
  input:focus,textarea:focus,select:focus{border-color:rgba(124,58,237,0.5)}
  input::placeholder,textarea::placeholder{color:rgba(200,200,230,0.3)}
  select option{background:#111121}
  table{width:100%;border-collapse:collapse}
  th{padding:10px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(200,200,230,0.45);border-bottom:1px solid rgba(255,255,255,0.07)}
  td{padding:12px 14px;font-size:13px;color:#e8e8f8;border-bottom:1px solid rgba(255,255,255,0.04)}
  tr:hover td{background:rgba(255,255,255,0.02)}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal-box{background:#111121;border:1px solid rgba(124,58,237,0.3);border-radius:16px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .25s ease}
  
  /* Responsive Layout */
  @media (max-width: 768px) {
    .layout-container { flex-direction: column !important; }
    .sidebar-container { width: 100% !important; min-height: auto !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .sidebar-nav { display: flex !important; overflow-x: auto !important; padding-bottom: 10px !important; }
    .sidebar-nav button { white-space: nowrap; margin-bottom: 0 !important; margin-right: 8px !important; width: auto !important; }
    .sidebar-footer { display: none !important; }
    .grid-responsive { grid-template-columns: 1fr !important; }
    .stat-cards-responsive { grid-template-columns: 1fr !important; }
  }
`;

export const Badge = ({ children }) => {
  const map = {
    pending:   { bg: 'rgba(245,158,11,.12)',  c: '#F59E0B' },
    approved:  { bg: 'rgba(16,185,129,.12)',  c: '#10B981' },
    rejected:  { bg: 'rgba(239,68,68,.12)',   c: '#EF4444' },
    upcoming:  { bg: 'rgba(124,58,237,.12)',  c: '#9F67FF' },
    completed: { bg: 'rgba(100,100,130,.12)', c: 'rgba(200,200,230,.5)' },
    ongoing:   { bg: 'rgba(6,182,212,.12)',   c: '#06B6D4' },
    open:      { bg: 'rgba(245,158,11,.12)',  c: '#F59E0B' },
    reviewed:  { bg: 'rgba(6,182,212,.12)',   c: '#06B6D4' },
    resolved:  { bg: 'rgba(16,185,129,.12)',  c: '#10B981' },
    bug:       { bg: 'rgba(239,68,68,.1)',    c: '#EF4444' },
    suggestion:{ bg: 'rgba(124,58,237,.1)',   c: '#9F67FF' },
    complaint: { bg: 'rgba(245,158,11,.1)',   c: '#F59E0B' },
    available: { bg: 'rgba(16,185,129,.1)',   c: '#10B981' },
    occupied:  { bg: 'rgba(124,58,237,.1)',   c: '#9F67FF' },
    reserved:  { bg: 'rgba(245,158,11,.1)',   c: '#F59E0B' },
    exhibitor: { bg: 'rgba(6,182,212,.1)',    c: '#06B6D4' },
  };
  const s = map[(children || '').toLowerCase()] || { bg: 'rgba(100,100,130,.1)', c: 'rgba(200,200,230,.5)' };
  return (
    <span style={{
      background: s.bg, color: s.c, padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
};

export const Card = ({ children, style = {} }) => (
  <div style={{
    background: G.card, borderRadius: 14,
    border: `1px solid ${G.border}`, ...style,
  }}>{children}</div>
);

export const Btn = ({ children, onClick, variant = 'primary', disabled = false, size = 'sm', style = {} }) => {
  const vs = {
    primary:   { background: G.accent,                      color: '#fff' },
    secondary: { background: 'rgba(255,255,255,.05)',        color: G.muted, border: `1px solid ${G.border}` },
    danger:    { background: 'rgba(239,68,68,.1)',           color: '#EF4444' },
    success:   { background: 'rgba(16,185,129,.1)',          color: '#10B981' },
    ghost:     { background: 'transparent',                  color: G.muted },
  };
  const sz = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '9px 20px', fontSize: 13 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', borderRadius: 8,
        fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif",
        transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 5,
        opacity: disabled ? 0.5 : 1,
        ...sz[size], ...vs[variant], ...style,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = '.8'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {children}
    </button>
  );
};

export const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, color: G.text, fontFamily: "'Syne',sans-serif" }}>{children}</h3>
    {action}
  </div>
);

export const StatCard = ({ icon, label, value, sub, accent }) => (
  <Card style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px' }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12, background: (accent || G.accent) + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: G.muted }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: accent || G.accent, marginTop: 1, fontWeight: 600 }}>{sub}</div>}
    </div>
  </Card>
);

export const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
    <div style={{
      width: 32, height: 32, border: `3px solid ${G.accent}30`,
      borderTop: `3px solid ${G.accent}`, borderRadius: '50%',
      animation: 'spin .7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const Toast = ({ msg, type }) => !msg ? null : (
  <div style={{
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    background: type === 'error' ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)',
    color: type === 'error' ? '#EF4444' : '#10B981',
    border: `1px solid ${type === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`,
    padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
    boxShadow: '0 4px 20px rgba(0,0,0,.4)', fontFamily: "'Plus Jakarta Sans',sans-serif",
  }}>
    {type === 'error' ? '❌ ' : '✅ '}{msg}
  </div>
);

export const Modal = ({ title, onClose, onSubmit, submitLabel, children }) => (
  <div className="modal-bg" onClick={e => e.target.classList.contains('modal-bg') && onClose()}>
    <div className="modal-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: G.text }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: 'none', color: G.muted, borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      {children}
      {onSubmit && (
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Btn size="md" onClick={onSubmit} style={{ flex: 1, justifyContent: 'center' }}>{submitLabel}</Btn>
          <Btn variant="secondary" size="md" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
        </div>
      )}
    </div>
  </div>
);

export const FormRow = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

export const Field = ({ label, value, onChange, placeholder, type = 'text', required = false, as = 'input', disabled = false, options }) => (
  <FormRow label={label}>
    {as === 'select' ? (
      <select value={value} onChange={onChange} disabled={disabled} style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
        {placeholder && <option value="">{placeholder}</option>}
        {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : (
          <>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </>
        )}
      </select>
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}} />
    )}
  </FormRow>
);

export const useToast = () => {
  const [toast, setToast] = useState({ msg: '', type: '' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };
  return [toast, showToast];
};