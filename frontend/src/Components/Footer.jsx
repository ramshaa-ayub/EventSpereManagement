import React from 'react';

const SOCIALS = [
  { icon: '𝕏', label: 'Twitter/X',  href: 'https://twitter.com' },
  { icon: 'in', label: 'LinkedIn',   href: 'https://linkedin.com' },
  { icon: 'f',  label: 'Facebook',   href: 'https://facebook.com' },
  { icon: '▶',  label: 'YouTube',    href: 'https://youtube.com' },
];

export default function Footer({ theme, portalName = "Attendee" }) {
  const G = theme;
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: `1px solid ${G.border}`,
      background: 'rgba(7,7,15,0.7)',
      padding: '36px 24px 20px',
      color: G.muted,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Top row: brand + social icons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: G.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌐</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>EventSphere</div>
              <div style={{ fontSize: 11, letterSpacing: 0.4 }}>Next-Gen Exhibition Management <span style={{ color: G.accent }}>· {portalName}</span></div>
            </div>
          </div>

          {/* Social Icons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(255,255,255,.05)',
                  border: `1px solid ${G.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: G.muted, textDecoration: 'none',
                  fontSize: 13, fontWeight: 700,
                  transition: 'background .2s, color .2s, border-color .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${G.accent}20`;
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = `${G.accent}60`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.05)';
                  e.currentTarget.style.color = G.muted;
                  e.currentTarget.style.borderColor = G.border;
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom line */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', borderTop: `1px solid rgba(255,255,255,0.05)`,
          paddingTop: 18, fontSize: 12,
        }}>
          <div>© {new Date().getFullYear()} EventSphere Inc. All rights reserved.</div>
          <div style={{ fontSize: 11, color: 'rgba(200,200,230,.3)' }}>Built with ❤️ for the future of events</div>
        </div>
      </div>
    </footer>
  );
}
