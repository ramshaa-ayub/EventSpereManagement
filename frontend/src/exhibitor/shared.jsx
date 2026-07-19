// ─── Design tokens — dark teal exhibitor theme ───────────────────────────────
export const G = {
  bg: '#07070f', bg2: '#0a0a16', card: '#111121', card2: '#18182e',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(13,148,136,0.35)',
  accent: '#0D9488', accent2: '#2DD4BF', muted: 'rgba(200,200,230,0.45)',
  text: '#e8e8f8', red: '#EF4444', amber: '#F59E0B', purple: '#7C3AED', green: '#10B981',
};

export const ACCENT = G.accent;

export const exhCss = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1e1e30;border-radius:2px}
  input,textarea,select{font-family:'Plus Jakarta Sans',sans-serif;background:#18182e;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#e8e8f8;outline:none;font-size:13px;width:100%;transition:border-color .2s;box-sizing:border-box}
  input:focus,textarea:focus,select:focus{border-color:rgba(13,148,136,0.5)}
  input::placeholder,textarea::placeholder{color:rgba(200,200,230,0.3)}
  select option{background:#111121}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .25s ease}
  .exh-btn-hover:hover{opacity:.85!important;transform:translateY(-1px)!important}

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

export const FontStyle = () => (
  <style dangerouslySetInnerHTML={{ __html: exhCss }} />
);

export const Badge = ({ children }) => {
  const map = {
    pending:   { bg: 'rgba(245,158,11,.12)', c: '#F59E0B' },
    approved:  { bg: 'rgba(16,185,129,.12)', c: '#10B981' },
    rejected:  { bg: 'rgba(239,68,68,.12)',  c: '#EF4444' },
    upcoming:  { bg: 'rgba(13,148,136,.12)', c: '#2DD4BF' },
    ongoing:   { bg: 'rgba(13,148,136,.12)', c: '#2DD4BF' },
    completed: { bg: 'rgba(100,100,130,.1)', c: 'rgba(200,200,230,.4)' },
    available: { bg: 'rgba(16,185,129,.1)',  c: '#10B981' },
    occupied:  { bg: 'rgba(13,148,136,.1)',  c: '#2DD4BF' },
    reserved:  { bg: 'rgba(245,158,11,.1)',  c: '#F59E0B' },
    exhibitor: { bg: 'rgba(13,148,136,.1)',  c: '#2DD4BF' },
  };
  const s = map[(children || '').toLowerCase()] || { bg: 'rgba(100,100,130,.1)', c: 'rgba(200,200,230,.5)' };
  return (
    <span style={{ background: s.bg, color: s.c, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
};

export const Card = ({ children, style = {} }) => (
  <div style={{ background: G.card, borderRadius: 14, border: `1px solid ${G.border}`, ...style }}>
    {children}
  </div>
);

export const Btn = ({ children, onClick, variant = 'primary', size = 'sm', color = G.accent, style = {}, disabled = false }) => {
  const vs = {
    primary:   { background: color,                     color: '#fff' },
    secondary: { background: 'rgba(255,255,255,.05)',   color: G.muted, border: `1px solid ${G.border}` },
    danger:    { background: 'rgba(239,68,68,.1)',      color: '#EF4444' },
    success:   { background: 'rgba(16,185,129,.1)',     color: '#10B981' },
    ghost:     { background: 'transparent',             color: G.muted },
  };
  const sz = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '9px 20px', fontSize: 13 },
    lg: { padding: '12px 28px', fontSize: 14 },
  };
  return (
    <button disabled={disabled} onClick={onClick} className="exh-btn-hover"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', borderRadius: 8,
        fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif",
        transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 5,
        opacity: disabled ? .55 : 1,
        ...sz[size], ...vs[variant], ...style,
      }}>
      {children}
    </button>
  );
};

export const Input = ({ placeholder, value, onChange, type = 'text', label, icon, style = {} }) => (
  <div style={{ marginBottom: label ? 14 : 0, ...style }}>
    {label && <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>{label}</div>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: G.muted }}>{icon}</span>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={icon ? { paddingLeft: 32 } : {}} />
    </div>
  </div>
);

export const StatCard = ({ icon, label, value, sub, accent = G.accent }) => (
  <Card style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: G.muted }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: accent, marginTop: 1, fontWeight: 600 }}>{sub}</div>}
    </div>
  </Card>
);

export const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, color: G.text, fontFamily: "'Syne',sans-serif" }}>{children}</h3>
    {action}
  </div>
);

export const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px', color: G.muted }}>
    <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontSize: 13 }}>{text}</div>
  </div>
);

export const Alert = ({ msg, type = 'error' }) => {
  if (!msg) return null;
  const colors = {
    error:   { bg: 'rgba(239,68,68,.1)',   c: '#EF4444',  border: 'rgba(239,68,68,.2)'   },
    success: { bg: 'rgba(16,185,129,.1)',  c: '#10B981',  border: 'rgba(16,185,129,.2)'  },
    info:    { bg: 'rgba(13,148,136,.1)',  c: '#2DD4BF',  border: 'rgba(13,148,136,.2)'  },
  };
  const s = colors[type] || colors.error;
  return <div style={{ background: s.bg, color: s.c, border: `1px solid ${s.border}`, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{msg}</div>;
};

export const BASE = '/api';
export const exhTok = () => localStorage.getItem('exhibitor_token');
export const exhHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${exhTok()}`,
});
