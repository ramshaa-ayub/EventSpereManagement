import { G, Btn } from "./shared.jsx";

const NAV = [
  { id: "analytics",    icon: "📈", label: "Analytics" },
  { id: "expos",        icon: "🎪", label: "Expo Management" },
  { id: "applications", icon: "📋", label: "Applications" },
  { id: "sessions",     icon: "🎤", label: "Sessions" },
  { id: "floorplan",    icon: "🗺️",  label: "Floor Plan" },
  { id: "messages",     icon: "💬", label: "Messages" },
];

export default function Sidebar({ active, setActive, user, onLogout, pendingCount }) {
  return (
    <div className="sidebar-container" style={{
      width: 224, minHeight: '100vh', background: G.bg2,
      borderRight: `1px solid ${G.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '22px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: G.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
          }}>🌐</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: "'Syne',sans-serif" }}>EventSphere</span>
        </div>
        <div style={{ fontSize: 9, color: '#3a3a5c', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 40 }}>
          Admin Panel
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav" style={{ padding: '0 8px', flex: 1 }}>
        {NAV.map(item => {
          const badge = item.id === 'applications' ? pendingCount : 0;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2,
                background: isActive ? `${G.accent}20` : 'transparent',
                color: isActive ? '#fff' : G.muted,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontSize: 13, fontWeight: isActive ? 700 : 400,
                transition: 'all .15s', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 14, opacity: isActive ? 1 : .5 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {badge > 0 && (
                <span style={{
                  background: G.accent, color: '#fff', fontSize: 9,
                  fontWeight: 700, borderRadius: 10, padding: '1px 6px',
                }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User footer */}
      <div className="sidebar-footer" style={{ padding: '16px 18px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: G.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0
          }}>
            {(user?.name || 'A')[0]}
          </div>
          <div>
            <div style={{ color: '#e2e2f0', fontSize: 12, fontWeight: 700 }}>{user?.name || 'Admin'}</div>
            <div style={{ color: '#3a3a5c', fontSize: 10 }}>Administrator</div>
          </div>
        </div>
        <Btn variant="ghost" onClick={onLogout}
          style={{ color: G.muted, padding: '6px 0', fontSize: 11, marginTop: 10, width: '100%' }}>
          🚪 Logout
        </Btn>
      </div>
    </div>
  );
}
