import React, { useState, useEffect, useCallback } from 'react';
import { G, globalCss } from '@utils/theme.js';
import { EXPOS, SESSIONS, EXHIBITORS } from '@data/mockData.js';
import { fetchMyRegistrations, API_BASE } from '../api.js';

// Page components
import Discover   from './Discover.jsx';
import Schedule   from './Schedule.jsx';
import Bookmarks  from './Bookmarks.jsx';
import Exhibitors from './Exhibitors.jsx';
import FloorPlan  from './FloorPlan.jsx';
import Messages   from './Messages.jsx';
import Footer     from '../Components/Footer.jsx';

const NAV = [
  { id: 'discover',   label: 'Discover',   icon: '🌍' },
  { id: 'schedule',   label: 'Schedule',   icon: '📅' },
  { id: 'bookmarks',  label: 'Saved',      icon: '🔖' },
  { id: 'exhibitors', label: 'Exhibitors', icon: '🔍' },
  { id: 'floorplan',  label: 'Floor Plan', icon: '🗺️' },
  { id: 'messages',   label: 'Messages',   icon: '💬' },
];

// ── AttendeeLayout ─────────────────────────────────────────────────────────────
// Props:
//   user          — null (guest) | { name, email, role: "attendee" }
//   onLoginClick  — called when user clicks "Login" button
//   onLogout      — called when logged-in user clicks "Logout"
export default function AttendeeLayout({ user = null, onLoginClick, onLogout }) {
  const [tab, setTab] = useState('discover');

  // Live data state — falls back to mock data if API is empty/fails
  const [exposData,     setExposData]     = useState(EXPOS);
  const [sessionsData,  setSessionsData]  = useState(SESSIONS);
  const [exhibitorsData,setExhibitorsData]= useState(EXHIBITORS);
  const [statsData,     setStatsData]     = useState({ exhibitorCount: 0, attendeeCount: 0, totalRegistered: 0 });
  const [loading, setLoading] = useState(true);

  // Interaction state
  const [bookmarks, setBk]   = useState(new Set());
  const [regs,      setRegs] = useState(new Set());

  // Fetch live data + merge user's existing registrations
  const fetchLiveData = useCallback(async () => {
    try {
      const [exposRes, sessionsRes, appsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/expos`).then(r => r.json()),
        fetch(`${API_BASE}/sessions`).then(r => r.json()),
        fetch(`${API_BASE}/applications?status=approved`).then(r => r.json()),
        fetch(`${API_BASE}/users`).then(r => r.json()).catch(() => []),
      ]);

      // Compute live user stats from /api/users
      if (Array.isArray(usersRes) && usersRes.length > 0) {
        setStatsData({
          exhibitorCount:  usersRes.filter(u => u.role === 'exhibitor').length,
          attendeeCount:   usersRes.filter(u => u.role === 'attendee').length,
          totalRegistered: usersRes.length,
        });
      }

      // Only replace mock data if API returned real records
      if (Array.isArray(exposRes) && exposRes.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setExposData(exposRes.map(e => {
          const expoDate = e.date ? new Date(e.date) : null;
          let status = e.status;
          if (expoDate && expoDate < today) status = 'completed';
          return {
            id: e._id, title: e.title, date: e.date, loc: e.location,
            booths: e.booths, reg: e.registered, status,
            img: e.img, theme: e.theme, desc: e.description,
          };
        }));
      }

      if (Array.isArray(sessionsRes) && sessionsRes.length > 0) {
        // Build a lookup from expo title -> expo for enriching sessions
        const expoLookup = {};
        (Array.isArray(exposRes) ? exposRes : []).forEach(e => {
          if (e.title) expoLookup[e.title] = e;
        });
        setSessionsData(sessionsRes.map(s => {
          const [time, ampm] = (s.time || '').split(' ');
          const matchedExpo = s.expo ? expoLookup[s.expo] : null;
          return {
            id: s._id, title: s.title, speaker: s.speaker, spImg: s.spImg,
            time: time || s.time, ampm: ampm || '', hall: s.hall,
            reg: s.registered, cap: s.capacity,
            expo: s.expo || '',
            expoDate: matchedExpo?.date || null,
          };
        }));
      }

      if (Array.isArray(appsRes) && appsRes.length > 0) {
        // Deduplicate by company name — keep only one card per exhibitor
        const seen = new Set();
        const unique = [];
        for (const ex of appsRes) {
          const key = (ex.company || ex.appliedBy?.name || 'unknown').toLowerCase().trim();
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(ex);
        }
        setExhibitorsData(unique.map(ex => ({
          id: ex._id, 
          co: ex.company || ex.appliedBy?.name || "Unknown Company", 
          cat: ex.category || ex.appliedBy?.exhibitorProfile?.category || "Uncategorized", 
          booth: ex.booth,
          prods: ex.products || [], 
          ic: "🏢",
          img: ex.appliedBy?.exhibitorProfile?.logo || ex.img || "",
        })));
      }

      // If user is logged in, fetch their existing session registrations
      if (user) {
        try {
          const myRegs = await fetchMyRegistrations();
          if (myRegs.sessionIds && myRegs.sessionIds.length > 0) {
            setRegs(new Set(myRegs.sessionIds));
          }
        } catch {
          // Not critical — user just won't see pre-checked registrations
        }
      }
    } catch (err) {
      console.warn('API unavailable — using mock data:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchLiveData(); }, [fetchLiveData]);

  const renderView = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${G.accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ color: G.muted, fontSize: 13 }}>Loading EventSphere…</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      );
    }
    switch (tab) {
      case 'discover':   return <Discover   setTab={setTab} expos={exposData} sessions={sessionsData} exhibitors={exhibitorsData} stats={statsData} />;
      case 'schedule':   return <Schedule   bookmarks={bookmarks} setBk={setBk} regs={regs} setRegs={setRegs} sessions={sessionsData} expos={exposData} user={user} onLoginClick={onLoginClick} />;
      case 'bookmarks':  return <Bookmarks  bookmarks={bookmarks} setBookmarks={setBk} regs={regs} setRegs={setRegs} sessions={sessionsData} />;
      case 'exhibitors': return <Exhibitors setTab={setTab} exhibitors={exhibitorsData} />;
      case 'floorplan':  return <FloorPlan  setTab={setTab} expos={exposData} />;
      case 'messages':   return <Messages user={user} />;

      default:           return <Discover   setTab={setTab} expos={exposData} sessions={sessionsData} exhibitors={exhibitorsData} stats={statsData} />;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      <div style={{ background: G.bg, color: G.text, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', flexDirection: 'column' }}>

        {/* ── TOP NAVIGATION ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(7,7,15,.95)', backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${G.border}`,
          display: 'flex', alignItems: 'center',
          padding: '0 24px', height: 56, gap: 2,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 20, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: G.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌐</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>EventSphere</span>
            <span style={{ fontSize: 9, color: G.muted, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 2 }}>Attendee</span>
          </div>

          {/* Nav tabs */}
          <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  background: tab === item.id ? `${G.accent}18` : 'transparent',
                  border: tab === item.id ? `1px solid ${G.accent}40` : '1px solid transparent',
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: 12, fontWeight: tab === item.id ? 700 : 500,
                  padding: '6px 13px', borderRadius: 8,
                  color: tab === item.id ? '#fff' : 'rgba(200,200,220,.55)',
                  transition: 'all .18s', position: 'relative', display: 'flex', alignItems: 'center', gap: 5,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                {item.label}
                {item.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: 3, right: 3,
                    width: 14, height: 14, background: G.accent,
                    borderRadius: '50%', fontSize: 7, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Auth section (right side) ── */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {user ? (
              // Logged-in attendee: show name + logout
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${G.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: G.accent, fontSize: 13 }}>
                    {(user.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: G.text, lineHeight: 1 }}>{user.name}</div>
                    <div style={{ fontSize: 9, color: G.muted, textTransform: 'uppercase', letterSpacing: .5 }}>Attendee</div>
                  </div>
                </div>
                <button onClick={onLogout}
                  style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${G.border}`, background: 'transparent', color: G.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Logout
                </button>
              </>
            ) : (
              // Guest: show Login button
              <button onClick={onLoginClick}
                style={{
                  padding: '7px 18px', borderRadius: 10, border: 'none',
                  background: G.accent, color: '#fff', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
                  transition: 'all .2s', boxShadow: `0 2px 12px ${G.accent}40`,
                }}
                onMouseEnter={e => { e.target.style.opacity = '.85'; e.target.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
              >
                🔑 Login
              </button>
            )}
          </div>
        </nav>

        {/* ── ACTIVE VIEW ── */}
        <div style={{ flex: 1 }}>
          {renderView()}
        </div>

        <Footer theme={G} portalName="Attendee" />
      </div>
    </>
  );
}