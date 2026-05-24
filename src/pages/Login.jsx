import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import * as api from "../lib/api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await api.login(email, password);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e293b)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: "#CC0000", borderRadius: 16, fontSize: 24, marginBottom: 12, boxShadow: "0 8px 24px rgba(204,0,0,0.4)" }}>✈</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "0.04em" }}>American Airlines</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: "0.12em" }}>ADMIN PORTAL</div>
        </div>

        {/* Card */}
        <div style={{ background: "white", borderRadius: 20, padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Sign In</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Enter your credentials to access the admin panel.</p>

          {error && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>EMAIL ADDRESS</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@example.com"
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", border: "1.5px solid #e2e8f4", borderRadius: 10, fontSize: 14, color: "#0f172a", outline: "none", fontFamily: "inherit" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>PASSWORD</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", border: "1.5px solid #e2e8f4", borderRadius: 10, fontSize: 14, color: "#0f172a", outline: "none", fontFamily: "inherit" }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "#94a3b8" : "linear-gradient(135deg,#CC0000,#a80000)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 16px rgba(204,0,0,0.35)", letterSpacing: "0.04em" }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
