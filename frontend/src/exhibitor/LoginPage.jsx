import { useState } from "react";
import { apiExhibitorLogin, apiExhibitorRegister } from "../api.js";
import { ACCENT, Card, Btn, Input, Alert, FontStyle } from "./shared.jsx";

export default function LoginPage({ onLogin }) {
  const [tab,      setTab]      = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      const fn   = tab === "login" ? apiExhibitorLogin : apiExhibitorRegister;
      const args = tab === "login" ? [email, password] : [name, email, password];
      const data = await fn(...args);
      onLogin(data.user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0fdf9 0%,#f8fafc 60%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <FontStyle />
      <Card style={{ width: 420, padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 10px" }}>🌐</div>
          <div style={{ fontWeight: 700, fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", color: "#0F172A" }}>EventSphere</div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Exhibitor Portal</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 8, padding: 3, marginBottom: 22 }}>
          {[["login","Login"],["register","Register"]].map(([id,label]) => (
            <button key={id} onClick={() => { setTab(id); setError(""); }}
              style={{
                flex: 1, padding: "8px", border: "none", borderRadius: 6, cursor: "pointer",
                background: tab === id ? "#fff" : "transparent",
                color: tab === id ? "#0F172A" : "#64748B",
                fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              }}>{label}</button>
          ))}
        </div>

        <Alert msg={error} />
        {tab === "register" && <Input label="Company / Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NexaAI Solutions" />}
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exhibitor@company.com" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ marginBottom: 20 }} />

        <Btn onClick={handle} disabled={loading} size="md" style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Please wait..." : tab === "login" ? "🔑 Login" : "🚀 Create Exhibitor Account"}
        </Btn>

        <p style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginTop: 16 }}>
          Admin or Attendee? Use the role switcher at the top.
        </p>
      </Card>
    </div>
  );
}
