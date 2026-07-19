import { useState } from "react";
import { apiLogin } from "../api.js";
import { Card, Btn, Field } from "./shared.jsx";

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState("admin@eventsphere.com");
  const [password, setPassword] = useState("admin123");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const data = await apiLogin(email, password);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Card style={{ padding: 40, width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🌐</div>
          <h2 style={{ fontWeight: 700, fontSize: 22, color: "#0F172A", margin: 0 }}>EventSphere</h2>
          <p style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>Admin Panel Login</p>
        </div>
        {error && (
          <div style={{
            background: "#FEE2E2", color: "#991B1B", padding: "10px 14px",
            borderRadius: 8, fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}
        <Field label="Email"    value={email}    onChange={e => setEmail(e.target.value)}    type="email"    required />
        <Field label="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        <Btn onClick={handleLogin} disabled={loading}
          style={{ width: "100%", padding: "11px", fontSize: 14, marginTop: 4 }}>
          {loading ? "Logging in…" : "Login →"}
        </Btn>
      </Card>
    </div>
  );
}
