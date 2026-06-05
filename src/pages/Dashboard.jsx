import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBookings } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getBookings()
      .then(d => setBookings(d.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;
  const cancelled = bookings.filter(b => b.status === "CANCELLED").length;
  const recent = bookings.slice(0, 5);

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: "✈️", color: "#0047AB", bg: "#eff6ff" },
    { label: "Confirmed", value: confirmed, icon: "✅", color: "#16a34a", bg: "#f0fdf4" },
    { label: "Cancelled", value: cancelled, icon: "❌", color: "#dc2626", bg: "#fef2f2" },
    { label: "Admins", value: "—", icon: "👥", color: "#7c3aed", bg: "#faf5ff" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>Overview of all bookings and activity.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: 14, padding: "20px 22px", border: "1px solid #e2e8f4", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{loading ? "—" : s.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f4", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Recent Bookings</div>
          <Link to="/bookings/new" style={{ padding: "7px 16px", background: "linear-gradient(135deg,#CC0000,#a80000)", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", boxShadow: "0 3px 10px rgba(204,0,0,0.3)" }}>
            + New Booking
          </Link>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Loading...</div>
        ) : recent.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✈️</div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16 }}>No bookings yet. Create your first one.</div>
            <Link to="/bookings/new" style={{ padding: "10px 22px", background: "linear-gradient(135deg,#0047AB,#003580)", color: "white", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Create Booking</Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 500 }}>
            <thead>
              <tr style={{ background: "#f8faff" }}>
                {["PNR", "Passenger", "Route", "Status", "Created", ""].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", borderBottom: "1px solid #e2e8f4" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((b, i) => {
                const pax = b.passenger;
                const seg = b.segments?.[0];
                const lastSeg = b.segments?.[b.segments.length - 1];
                return (
                  <tr key={b.id} style={{ borderBottom: i < recent.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontWeight: 700, color: "#CC0000", letterSpacing: "0.1em" }}>{b.pnr}</span>
                    </td>
                    <td style={{ padding: "12px 20px", color: "#0f172a" }}>
                      {pax ? pax.title + " " + pax.firstName + " " + pax.lastName : "—"}
                    </td>
                    <td style={{ padding: "12px 20px", color: "#64748b" }}>
                      {seg ? seg.fromCode + " → " + lastSeg.toCode : "—"}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: b.status === "CONFIRMED" ? "#dcfce7" : "#fef2f2", color: b.status === "CONFIRMED" ? "#16a34a" : "#dc2626" }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px", color: "#94a3b8", fontSize: 12 }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <Link to={"/bookings/" + b.id + "/edit"} style={{ color: "#0047AB", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Edit →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
