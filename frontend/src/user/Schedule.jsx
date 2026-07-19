import React, { useState } from 'react';
import { G } from '@utils/theme.js';
import Card from '@components/Card.jsx';
import { registerForSession } from '../api.js';

// ── Registration Modal ────────────────────────────────────────────────────────
function RegisterModal({ session, user, onClose, onSuccess }) {
  const [contactName,  setContactName]  = useState(user?.name  || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [members,      setMembers]      = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const remaining = (session.cap || session.capacity || 100) - (session.reg ?? session.registered ?? 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!contactName.trim() || !contactEmail.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (members < 1) { setError('At least 1 member is required.'); return; }
    if (members > remaining) { setError(`Only ${remaining} spots remaining.`); return; }

    setLoading(true);
    try {
      const result = await registerForSession(session.id || session._id, {
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        members,
      });
      onSuccess(result);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, color: '#e8e8f8', fontSize: 13,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    outline: 'none', transition: 'border-color .2s',
    boxSizing: 'border-box',
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: '#111121', border: `1px solid ${G.accent}30`, borderRadius: 18,
        padding: '32px 30px', width: '100%', maxWidth: 460,
        boxShadow: `0 0 60px rgba(232,65,24,0.08), 0 20px 60px rgba(0,0,0,0.5)`,
        animation: 'fadeup .25s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Register for Session</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: G.text }}>{session.title}</h3>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.06)', border: 'none', color: G.muted,
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Session info */}
        <div style={{
          padding: '12px 16px', background: `${G.accent}08`, border: `1px solid ${G.accent}18`,
          borderRadius: 12, marginBottom: 20, fontSize: 12, color: G.muted, lineHeight: 1.7,
        }}>
          🎤 <strong style={{ color: G.text }}>{session.speaker}</strong> &nbsp;·&nbsp; 📍 {session.hall}
          &nbsp;·&nbsp; 🕐 {session.time} {session.ampm || ''}
          <br/>
          👥 <span style={{ color: remaining > 10 ? G.accent : '#EF4444', fontWeight: 700 }}>{remaining}</span> spots remaining out of {session.cap || session.capacity}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 5 }}>Full Name *</label>
            <input style={inputStyle} value={contactName} onChange={e => setContactName(e.target.value)}
              placeholder="Your full name" onFocus={e => e.target.style.borderColor = `${G.accent}60`}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 5 }}>Email Address *</label>
            <input type="email" style={inputStyle} value={contactEmail} onChange={e => setContactEmail(e.target.value)}
              placeholder="you@example.com" onFocus={e => e.target.style.borderColor = `${G.accent}60`}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 5 }}>Phone Number</label>
            <input type="tel" style={inputStyle} value={contactPhone} onChange={e => setContactPhone(e.target.value)}
              placeholder="+92 300 1234567 (optional)" onFocus={e => e.target.style.borderColor = `${G.accent}60`}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 5 }}>Number of Members *</label>
            <input type="number" min="1" max={remaining} style={{ ...inputStyle, width: 120 }}
              value={members} onChange={e => setMembers(Math.max(1, parseInt(e.target.value) || 1))}
              onFocus={e => e.target.style.borderColor = `${G.accent}60`}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            <span style={{ fontSize: 11, color: G.muted, marginLeft: 10 }}>Max: {remaining}</span>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
              color: '#EF4444', padding: '10px 14px', borderRadius: 8, fontSize: 12,
              marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span>❌</span> <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '13px 0', borderRadius: 12, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? `${G.accent}60` : G.accent,
              color: '#fff', fontSize: 14, fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              transition: 'all .2s', boxShadow: loading ? 'none' : `0 4px 24px ${G.accent}30`,
            }}>
              {loading ? '⏳ Registering…' : `✅ Register (${members} ${members === 1 ? 'person' : 'people'})`}
            </button>
            <button type="button" onClick={onClose} style={{
              padding: '13px 20px', borderRadius: 12, border: `1px solid ${G.border}`,
              background: 'transparent', color: G.muted, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Login Prompt Overlay ──────────────────────────────────────────────────────
function LoginPrompt({ session, onLoginClick, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: '#111121', border: `1px solid ${G.accent}30`, borderRadius: 18,
        padding: '36px 32px', width: '100%', maxWidth: 420, textAlign: 'center',
        boxShadow: `0 0 60px rgba(232,65,24,0.08), 0 20px 60px rgba(0,0,0,0.5)`,
        animation: 'fadeup .25s ease',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: `${G.accent}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 20px',
        }}>🔒</div>

        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: G.text, marginBottom: 8 }}>
          Login Required
        </h3>
        <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, marginBottom: 8 }}>
          You need to be logged in to register for
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: G.accent, marginBottom: 24 }}>
          "{session.title}"
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onLoginClick} style={{
            padding: '13px 28px', borderRadius: 12, border: 'none',
            background: G.accent, color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: `0 4px 24px ${G.accent}30`, transition: 'all .2s',
          }}
          onMouseEnter={e => { e.target.style.opacity = '.88'; e.target.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
          >
            🔑 Login / Register
          </button>
          <button onClick={onClose} style={{
            padding: '13px 20px', borderRadius: 12, border: `1px solid ${G.border}`,
            background: 'transparent', color: G.muted, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Success Toast ─────────────────────────────────────────────────────────────
function SuccessToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)',
      color: '#10B981', padding: '14px 22px', borderRadius: 14,
      fontWeight: 700, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,.4)',
      fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 10,
      animation: 'fadeup .3s ease',
    }}>
      <span>✅</span> <span>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: '#10B981', cursor: 'pointer',
        fontSize: 14, marginLeft: 8, opacity: 0.7,
      }}>✕</button>
    </div>
  );
}

// ── Main Schedule Component ───────────────────────────────────────────────────
export default function Schedule({ bookmarks, setBk, regs, setRegs, sessions = [], expos = [], user = null, onLoginClick }) {
  const toggle = (setObj, fn, id) => fn(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const [registerModal, setRegisterModal] = useState(null);  // session object or null
  const [loginPrompt,   setLoginPrompt]   = useState(null);  // session object or null
  const [toast,         setToast]         = useState('');

  // Handle register button click
  const handleRegisterClick = (session) => {
    if (!user) {
      // Not logged in — show login prompt
      setLoginPrompt(session);
    } else {
      // Logged in — open registration form
      setRegisterModal(session);
    }
  };

  // After successful registration
  const handleRegSuccess = (result) => {
    setRegisterModal(null);
    // Add to local regs set
    const sessionId = result.session?._id || registerModal?.id;
    if (sessionId) {
      setRegs(p => { const n = new Set(p); n.add(sessionId); return n; });
    }
    setToast('Successfully registered! See you at the session 🎉');
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="view" style={{padding:'28px 32px'}}>
      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:G.accent,marginBottom:6}}>Live Event Schedule</div>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(22px,4vw,32px)',fontWeight:800,letterSpacing:'-.02em',marginBottom:6,color:G.text}}>Session <span style={{color:G.accent}}>Schedule</span></h2>
      <p style={{fontSize:13,color:G.muted,lineHeight:1.6,marginBottom:22}}>🔖 tap to bookmark &nbsp;·&nbsp; <span style={{color: G.accent, fontWeight: 600}}>+ tap to register</span>{!user && <span style={{color:'rgba(239,68,68,.7)', marginLeft: 8, fontSize: 11}}>(login required for registration)</span>}</p>

      {sessions.length === 0 ? (
        <div style={{color: G.muted}}>No sessions found.</div>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {sessions.map(s => {
            const sessionId = s.id || s._id;
            const isR = regs.has(sessionId), isBk = bookmarks.has(sessionId);
            const regCount = s.reg ?? s.registered ?? 0;
            const capCount = s.cap ?? s.capacity ?? 100;
            const pct = Math.round((regCount / capCount) * 100);
            const isFull = regCount >= capCount;

            return (
              <Card key={sessionId} style={{padding:'16px 20px',display:'grid',gridTemplateColumns:'62px 1fr auto',gap:14,alignItems:'start',borderLeft:isR?`3px solid ${G.accent}`:'3px solid transparent',borderRadius:14}}>
                <div style={{background:`${G.accent}10`,borderRadius:10,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:G.accent}}>{s.time}</div>
                  <div style={{fontSize:8,color:`${G.accent}80`,fontWeight:700,marginTop:2}}>{s.ampm}</div>
                </div>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:G.text,marginBottom:4}}>{s.title}</div>
                  <div style={{fontSize:11,color:G.muted}}>📍 {s.hall} · 👥 <span style={{color: pct > 80 ? '#EF4444' : G.accent, fontWeight: 600}}>{regCount}/{capCount}</span> registered</div>
                  {(s.expo || s.expoDate) && (
                    <div style={{fontSize:10,color:G.accent,fontWeight:600,marginTop:3,display:'flex',alignItems:'center',gap:5}}>
                      🎪 {s.expo || 'Event'}
                      {s.expoDate && <span style={{color:G.muted,fontWeight:400}}>· {new Date(s.expoDate).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'})}</span>}
                    </div>
                  )}
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
                    {s.spImg ? (
                      <img src={s.spImg} alt={s.speaker} onError={e=>{e.target.style.display='none'}} style={{width:24,height:24,borderRadius:'50%',objectFit:'cover'}} />
                    ) : (
                      <div style={{width:24,height:24,borderRadius:'50%',background:`${G.accent}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:G.text}}>
                        {s.speaker ? s.speaker.charAt(0).toUpperCase() : "S"}
                      </div>
                    )}
                    <span style={{fontSize:11,color:'rgba(255,255,255,.45)',fontStyle:'italic'}}>{s.speaker}</span>
                  </div>
                  <div style={{height:3,borderRadius:2,background:'rgba(255,255,255,.06)',marginTop:9,overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:2,background:pct>80?G.red:G.accent,width:`${pct}%`,transition:'width .3s'}} />
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  <button onClick={()=>toggle(bookmarks,setBk,sessionId)} style={{border:'none',borderRadius:8,width:36,height:36,cursor:'pointer',background:isBk?'rgba(255,190,0,.18)':'rgba(255,190,0,.06)',color:isBk?G.gold:'rgba(255,190,0,.4)'}}>🔖</button>
                  {isR ? (
                    <button disabled style={{border:'none',borderRadius:8,width:36,height:36,cursor:'default',fontWeight:700,background:`${G.accent}20`,color:G.accent, fontSize: 14}}>✓</button>
                  ) : (
                    <button
                      onClick={() => handleRegisterClick(s)}
                      disabled={isFull}
                      title={isFull ? 'Session is full' : 'Register for this session'}
                      style={{
                        border:'none',borderRadius:8,width:36,height:36,
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        fontWeight:700,
                        background: isFull ? 'rgba(239,68,68,.12)' : G.accent,
                        color: isFull ? '#EF4444' : '#fff',
                        opacity: isFull ? 0.6 : 1,
                      }}
                    >{isFull ? '✕' : '+'}</button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Login Prompt Modal */}
      {loginPrompt && (
        <LoginPrompt
          session={loginPrompt}
          onLoginClick={() => { setLoginPrompt(null); onLoginClick && onLoginClick(); }}
          onClose={() => setLoginPrompt(null)}
        />
      )}

      {/* Registration Modal */}
      {registerModal && (
        <RegisterModal
          session={registerModal}
          user={user}
          onClose={() => setRegisterModal(null)}
          onSuccess={handleRegSuccess}
        />
      )}

      {/* Success Toast */}
      <SuccessToast message={toast} onClose={() => setToast('')} />
    </div>
  );
}