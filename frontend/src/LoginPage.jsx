import { useState } from "react";
import { apiLogin, apiRegister } from "./api.js";

// ─── Design tokens ────────────────────────────────────────────────────────────
const G = {
  bg: "#07070f", card: "#111121", card2: "#18182e",
  border: "rgba(255,255,255,0.07)",
  muted: "rgba(200,200,230,0.45)", text: "#e8e8f8",
};

const ROLE_META = {
  attendee: {
    label: "Attendee", icon: "🎫",
    color: "#E84118", color2: "#FF6B3D", glow: "rgba(232,65,24,0.18)",
    canRegister: true,
    hint: "Browse expos, register for sessions, and connect with exhibitors.",
  },
  exhibitor: {
    label: "Exhibitor", icon: "🏢",
    color: "#0D9488", color2: "#2DD4BF", glow: "rgba(13,148,136,0.18)",
    canRegister: true,
    hint: "Apply for booths, manage your profile, and communicate with admins.",
  },
  admin: {
    label: "Admin", icon: "👑",
    color: "#7C3AED", color2: "#9F67FF", glow: "rgba(124,58,237,0.18)",
    canRegister: false,
    hint: "Admin accounts are created directly in the database by the system owner.",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #07070f; }
  @keyframes fadeup { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes float  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
  .login-card { animation: fadeup .35s ease; }
  .role-btn:hover { transform: translateY(-2px) !important; }
`;

// ─── Shared Input ─────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, accentColor, suffix }) {
  const base = {
    width: "100%", padding: "11px 14px",
    background: G.card2, border: `1px solid ${G.border}`,
    borderRadius: 10, color: G.text, fontSize: 13,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    transition: "border-color .2s", paddingRight: suffix ? 44 : 14,
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 5 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={base}
          onFocus={e => e.target.style.borderColor = `${accentColor}60`}
          onBlur={e => e.target.style.borderColor = G.border}
        />
        {suffix && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{suffix}</div>}
      </div>
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  const isOk = type === "success";
  return (
    <div style={{ background: isOk ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)", border: `1px solid ${isOk ? "rgba(16,185,129,.25)" : "rgba(239,68,68,.25)"}`, color: isOk ? "#10B981" : "#EF4444", padding: "10px 14px", borderRadius: 8, fontSize: 12, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span>{isOk ? "✅" : "❌"}</span> <span>{msg}</span>
    </div>
  );
}

// ─── Main LoginPage ───────────────────────────────────────────────────────────
export default function LoginPage({ onLogin, initialScreen = "login", initialResetToken = "" }) {
  // screen: "login" | "forgot" | "reset"
  const [screen,     setScreen]     = useState(initialScreen);
  const [role,       setRole]       = useState("attendee");
  const [mode,       setMode]       = useState("login");   // login | register
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  // Exhibitor image upload
  const [logoFile,   setLogoFile]   = useState(null);
  const [logoPreview,setLogoPreview]= useState("");

  // Forgot / Reset state
  const [fpEmail,    setFpEmail]    = useState("");
  const [resetToken, setResetToken] = useState(initialResetToken); // returned by API
  const [resetInput, setResetInput] = useState(initialResetToken); // token user pastes
  const [newPw,      setNewPw]      = useState("");
  const [newPwShow,  setNewPwShow]  = useState(false);
  const [success,    setSuccess]    = useState("");

  const meta = ROLE_META[role];

  const clearAll = () => { setError(""); setSuccess(""); setName(""); setEmail(""); setPassword(""); setLogoFile(null); setLogoPreview(""); };

  const handleRoleSwitch = (r) => {
    setRole(r); clearAll();
    if (r === "admin") setMode("login");
  };

  // ── Login / Register submit ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!email || !password) { setError("Email and password are required."); return; }
    if (mode === "register" && !name) { setError("Name is required."); return; }
    setLoading(true);
    try {
      let result;
      if (mode === "register") {
        if (role === "exhibitor" && !logoFile) {
          setError("A company logo image is required to register as an exhibitor.");
          setLoading(false);
          return;
        }
        if (role === "exhibitor") {
          // Use FormData to upload the image together with the registration data
          const fd = new FormData();
          fd.append("name",     name);
          fd.append("email",    email);
          fd.append("password", password);
          fd.append("role",     role);
          fd.append("logo",     logoFile);
          const res  = await fetch("/api/auth/register", { method: "POST", body: fd });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || "Registration failed");
          // Save auth
          localStorage.setItem("eventsphere_token", json.token);
          localStorage.setItem("eventsphere_user",  JSON.stringify(json.user));
          result = json;
        } else {
          result = await apiRegister(name, email, password, role);
        }
      } else {
        result = await apiLogin(email, password, role);
      }
      onLogin(result.user);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password — request token ─────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!fpEmail) { setError("Please enter your email."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      if (json.resetToken) {
        setResetToken(json.resetToken);
        setResetInput(json.resetToken); // auto-fill since no email
        setSuccess("Reset token generated! Paste it below (auto-filled) and set a new password.");
        setScreen("reset");
      } else {
        setSuccess(json.message);
      }
    } catch (err) {
      setError(err.message || "Could not generate reset token.");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset password — set new password ────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!resetInput) { setError("Reset token is required."); return; }
    if (!newPw || newPw.length < 4) { setError("Password must be at least 4 characters."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/auth/reset-password/${resetInput.trim()}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPw }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setSuccess("Password reset successfully! Logging you in…");
      setTimeout(() => {
        // Clear the URL if it was a reset link
        if (window.location.pathname.startsWith("/reset-password/")) {
          window.history.replaceState({}, document.title, "/");
        }
        onLogin(json.user);
      }, 1400);
    } catch (err) {
      setError(err.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  const accentColor = meta.color;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{
        minHeight: "100vh", background: G.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, position: "relative", overflow: "hidden",
      }}>
        {/* Ambient orbs */}
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: meta.glow, top: -150, right: -100, filter: "blur(100px)", animation: "float 7s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "rgba(124,58,237,0.07)", bottom: -100, left: -80, filter: "blur(80px)", animation: "float 9s ease-in-out infinite .5s", pointerEvents: "none" }} />

        {/* Card */}
        <div className="login-card" style={{
          width: "100%", maxWidth: 460,
          background: G.card, borderRadius: 20,
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 0 60px ${meta.glow}, 0 24px 80px rgba(0,0,0,0.6)`,
          padding: "36px 36px 30px", position: "relative", zIndex: 1,
        }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌐</div>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>EventSphere</span>
            </div>
            <div style={{ fontSize: 12, color: G.muted }}>
              {screen === "login"  ? "Sign in to your portal" :
               screen === "forgot" ? "Reset your password" :
               "Set a new password"}
            </div>
          </div>

          {/* ══════════ LOGIN SCREEN ══════════ */}
          {screen === "login" && (
            <>
              {/* Role selector */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: G.muted, marginBottom: 8 }}>Sign in as</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {Object.entries(ROLE_META).map(([key, m]) => (
                    <button key={key} className="role-btn" onClick={() => handleRoleSwitch(key)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                        cursor: "pointer", transition: "all .2s",
                        background: role === key ? `${m.color}18` : G.card2,
                        outline: role === key ? `1.5px solid ${m.color}` : `1.5px solid ${G.border}`,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      }}>
                      <span style={{ fontSize: 20 }}>{m.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: role === key ? 700 : 500, color: role === key ? m.color2 : G.muted }}>{m.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: "8px 12px", background: `${accentColor}08`, border: `1px solid ${accentColor}20`, borderRadius: 8, fontSize: 11, color: G.muted, lineHeight: 1.5 }}>
                  {meta.hint}
                </div>
              </div>

              {/* Login / Register tab */}
              {meta.canRegister && (
                <div style={{ display: "flex", gap: 2, marginBottom: 20, background: G.card2, borderRadius: 10, padding: 3 }}>
                  {["login", "register"].map(m => (
                    <button key={m} onClick={() => { setMode(m); setError(""); }}
                      style={{
                        flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                        cursor: "pointer", fontSize: 12, fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        background: mode === m ? accentColor : "transparent",
                        color: mode === m ? "#fff" : G.muted, transition: "all .2s",
                      }}>
                      {m === "login" ? "🔑 Sign In" : "✨ Register"}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {mode === "register" && (
                  <Field label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" accentColor={accentColor} />
                )}
                {mode === "register" && role === "exhibitor" && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 5 }}>
                      Company Logo <span style={{ color: accentColor }}>*</span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {logoPreview && (
                        <img src={logoPreview} alt="logo preview" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", border: `1px solid ${accentColor}40` }} />
                      )}
                      <label style={{
                        padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                        background: G.card2, border: `1px solid ${logoFile ? accentColor : G.border}`,
                        color: G.text, fontSize: 12, transition: "border-color .2s", display: "inline-block",
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${accentColor}80`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = logoFile ? accentColor : G.border}
                      >
                        📁 {logoFile ? logoFile.name : "Upload Company Logo"}
                        <input type="file" accept="image/*" style={{ display: "none" }}
                          onChange={e => {
                            const f = e.target.files[0];
                            setLogoFile(f || null);
                            setLogoPreview(f ? URL.createObjectURL(f) : "");
                          }}
                        />
                      </label>
                    </div>
                    <div style={{ fontSize: 10, color: G.muted, marginTop: 4 }}>Required: PNG, JPG, or WEBP — your logo will appear on your public profile.</div>
                  </div>
                )}
                <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={`${meta.label.toLowerCase()}@gmail.com`} accentColor={accentColor} />
                <Field label="Password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" accentColor={accentColor}
                  suffix={<button type="button" onClick={() => setShowPw(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, fontSize: 16, lineHeight: 1 }}>{showPw ? "🙈" : "👁"}</button>}
                />

                {/* Forgot password link */}
                {mode === "login" && (
                  <div style={{ textAlign: "right", marginTop: -8, marginBottom: 14 }}>
                    <button type="button" onClick={() => { setScreen("forgot"); setFpEmail(email); setError(""); setSuccess(""); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: accentColor, fontSize: 11, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                <Alert msg={error} />

                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: loading ? `${accentColor}60` : accentColor,
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    transition: "all .2s", boxShadow: loading ? "none" : `0 4px 24px ${meta.glow}`,
                    marginBottom: 14,
                  }}
                  onMouseEnter={e => { if (!loading) { e.target.style.opacity = ".88"; e.target.style.transform = "translateY(-1px)"; }}}
                  onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}
                >
                  {loading ? "⏳ Please wait…" : mode === "register" ? `✨ Create ${meta.label} Account` : `🔑 Sign In as ${meta.label}`}
                </button>
              </form>

              <div style={{ textAlign: "center" }}>
                <button onClick={() => onLogin(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, fontSize: 11, textDecoration: "underline", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Continue as Guest (Attendee view)
                </button>
              </div>

              {role === "admin" && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 8, fontSize: 11, color: "rgba(159,103,255,.8)", textAlign: "center" }}>
                  🔒 Admin accounts are managed directly in the database
                </div>
              )}
            </>
          )}

          {/* ══════════ FORGOT PASSWORD SCREEN ══════════ */}
          {screen === "forgot" && (
            <>
              <div style={{ marginBottom: 20, padding: "12px 14px", background: "rgba(13,148,136,.08)", border: "1px solid rgba(13,148,136,.2)", borderRadius: 10, fontSize: 12, color: "rgba(13,148,136,.9)", lineHeight: 1.6 }}>
                ℹ️ Enter your email address and we'll send you a link to reset your password.
              </div>

              <form onSubmit={handleForgot}>
                <Field label="Your Email Address" type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="your@email.com" accentColor="#FFBE00" />

                <Alert msg={error} />
                <Alert msg={success} type="success" />

                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: loading ? "rgba(255,190,0,.4)" : "#FFBE00",
                    color: "#000", fontSize: 13, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    marginBottom: 14, transition: "all .2s",
                  }}>
                  {loading ? "⏳ Generating…" : "🔐 Generate Reset Token"}
                </button>
              </form>

              <div style={{ textAlign: "center" }}>
                <button onClick={() => { setScreen("reset"); setError(""); setSuccess(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#FFBE00", fontSize: 11, textDecoration: "underline", fontFamily: "'Plus Jakarta Sans',sans-serif", marginRight: 16 }}>
                  I already have a token →
                </button>
                <button onClick={() => { setScreen("login"); setError(""); setSuccess(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, fontSize: 11, textDecoration: "underline", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  ← Back to Login
                </button>
              </div>
            </>
          )}

          {/* ══════════ RESET PASSWORD SCREEN ══════════ */}
          {screen === "reset" && (
            <>
              {resetToken && (
                <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>✅ Secure Reset Link Verified</div>
                  <div style={{ fontSize: 11, color: "rgba(200,230,200,.7)", lineHeight: 1.5 }}>You can now safely choose a new password.</div>
                </div>
              )}

              <form onSubmit={handleReset}>
                <Field label="Reset Token" value={resetInput} onChange={e => setResetInput(e.target.value)} placeholder="Paste reset token here" accentColor="#10B981" />
                <Field label="New Password" type={newPwShow ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 4 characters" accentColor="#10B981"
                  suffix={<button type="button" onClick={() => setNewPwShow(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, fontSize: 16, lineHeight: 1 }}>{newPwShow ? "🙈" : "👁"}</button>}
                />

                <Alert msg={error} />
                <Alert msg={success} type="success" />

                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: loading ? "rgba(16,185,129,.4)" : "#10B981",
                    color: "#fff", fontSize: 13, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    marginBottom: 14, transition: "all .2s",
                  }}>
                  {loading ? "⏳ Resetting…" : "🔑 Reset Password & Login"}
                </button>
              </form>

              <div style={{ textAlign: "center" }}>
                <button onClick={() => { setScreen("forgot"); setError(""); setSuccess(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, fontSize: 11, textDecoration: "underline", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  ← Request a new token
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
