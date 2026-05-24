import { useState, useEffect } from "react";
import { getUsers, createUser, deleteUser } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    getUsers().then(d => setUsers(d.users)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await createUser(form);
      setSuccess("User created successfully.");
      setForm({ name: "", email: "", password: "", role: "ADMIN" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm("Delete user " + name + "?")) return;
    try {
      await deleteUser(id);
      setUsers(u => u.filter(x => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1.5px solid #e2e8f4", borderRadius: 8, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", display: "block", marginBottom: 5 };

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Users</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Manage admin accounts.</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#0047AB,#003580)", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,71,171,0.3)" }}>
          {showForm ? "Cancel" : "+ New User"}
        </button>
      </div>

      {error && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}
      {success && <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#16a34a", fontSize: 13, marginBottom: 16 }}>✅ {success}</div>}

      {/* New user form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f4", padding: "22px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Create New User</div>
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input required style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div>
                <label style={labelStyle}>EMAIL</label>
                <input required type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
              </div>
              <div>
                <label style={labelStyle}>PASSWORD</label>
                <input required type="password" style={inputStyle} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label style={labelStyle}>ROLE</label>
                <select style={inputStyle} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ padding: "9px 22px", background: saving ? "#94a3b8" : "linear-gradient(135deg,#0047AB,#003580)", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      )}

      {/* Users table */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f4", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8faff" }}>
                {["Name", "Email", "Role", "Created", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", borderBottom: "1px solid #e2e8f4" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: u.role === "SUPER_ADMIN" ? "#CC0000" : "#0047AB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>{u.name[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{u.name} {u.id === me?.id && <span style={{ fontSize: 10, color: "#94a3b8" }}>(you)</span>}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 20px", color: "#64748b" }}>{u.email}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.role === "SUPER_ADMIN" ? "#fef3c7" : "#eff6ff", color: u.role === "SUPER_ADMIN" ? "#d97706" : "#0047AB" }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "13px 20px", color: "#94a3b8", fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "13px 20px" }}>
                    {u.id !== me?.id && (
                      <button onClick={() => handleDelete(u.id, u.name)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
