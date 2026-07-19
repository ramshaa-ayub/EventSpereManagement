import { G, Btn } from "./shared.jsx";

const NAV = [
  { id: "dashboard",   icon: "🏠", label: "Dashboard" },
  { id: "explore",     icon: "🔍", label: "Explore Expos" },
  { id: "application", icon: "📋", label: "My Application" },
  { id: "booth",       icon: "🏪", label: "Booth Manager" },
  { id: "messages",    icon: "💬", label: "Messages" },
  { id: "profile",     icon: "👤", label: "My Profile" },
];

export default function Sidebar({ active, setActive, user, unread, onLogout }) {
  return (
    <div className="sidebar-container" style={{
      width: 224, minHeight: '100vh', background: G.bg2,
      borderRight: `1px solid ${G.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '22px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: G.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🌐</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: "'Syne',sans-serif" }}>EventSphere</span>
        </div>
        <div style={{ fontSize: 9, color: '#3a3a5c', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 40 }}>Exhibitor Portal</div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav" style={{ padding: '0 8px', flex: 1 }}>
        {NAV.map(item => {
          const badge = item.id === 'messages' ? unread : 0;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
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
                <span style={{ background: G.accent, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 10, padding: '1px 6px' }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User footer */}
      <div className="sidebar-footer" style={{ padding: '16px 18px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.exhibitorProfile?.logo ? (
            <img src={user.exhibitorProfile.logo} alt="Logo" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: G.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
              {(user?.name || 'E')[0]}
            </div>
          )}
          <div>
            <div style={{ color: '#e2e2f0', fontSize: 12, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: '#3a3a5c', fontSize: 10 }}>Exhibitor</div>
          </div>
        </div>
        <Btn variant="ghost" onClick={onLogout} style={{ color: G.muted, padding: '6px 0', fontSize: 11, marginTop: 10, width: '100%' }}>
          🚪 Logout
        </Btn>
      </div>
    </div>
  );
}
