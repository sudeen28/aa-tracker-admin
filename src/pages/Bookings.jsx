import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBookings, deleteBooking } from "../lib/api.js";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    getBookings()
      .then(d => setBookings(d.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, pnr) => {
    if (!confirm("Delete booking " + pnr + "? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteBooking(id);
      setBookings(b => b.filter(x => x.id !== id));
    } catch (e) { alert(e.message); }
    finally { setDeleting(null); }
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const pax = b.passenger;
    return (
      b.pnr.toLowerCase().includes(q) ||
      (pax && (pax.firstName + " " + pax.lastName).toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Bookings</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>
        <Link to="/bookings/new" style={{ padding: "10px 22px", background: "linear-gradient(135deg,#CC0000,#a80000)", color: "white", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(204,0,0,0.3)" }}>
          + New Booking
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by PNR or passenger name..."
          style={{ width: "100%", maxWidth: 380, boxSizing: "border-box", padding: "10px 16px", border: "1.5px solid #e2e8f4", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit" }}
        />
      </div>

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f4", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✈️</div>
            <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>{search ? "No bookings match your search." : "No bookings yet."}</div>
            {!search && <Link to="/bookings/new" style={{ padding: "9px 20px", background: "linear-gradient(135deg,#0047AB,#003580)", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Create First Booking</Link>}
          </div>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr style={{ background: "#f8faff" }}>
                  {["PNR", "Passenger", "Trip", "Route", "Flights", "Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", borderBottom: "1px solid #e2e8f4", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const pax = b.passenger;
                  const segs = b.segments || [];
                  const first = segs[0], last = segs[segs.length - 1];
                  return (
                    <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ fontWeight: 800, color: "#CC0000", letterSpacing: "0.12em", fontSize: 14 }}>{b.pnr}</span>
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{pax ? pax.title + " " + pax.firstName + " " + pax.lastName : "—"}</div>
                        {pax?.passport && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{pax.passport}</div>}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: b.tripType === "ROUND_TRIP" ? "#eff6ff" : "#f8fafc", color: b.tripType === "ROUND_TRIP" ? "#0047AB" : "#64748b" }}>
                          {b.tripType === "ROUND_TRIP" ? "ROUND TRIP" : "ONE-WAY"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{first ? first.fromCode + " → " + last.toCode : "—"}</div>
                        {segs.length > 1 && <div style={{ fontSize: 11, color: "#94a3b8" }}>{segs.length} segments</div>}
                      </td>
                      <td style={{ padding: "13px 18px", color: "#64748b" }}>
                        {segs.map(s => s.flightNumber).join(", ") || "—"}
                      </td>
                      <td style={{ padding: "13px 18px", color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" }}>
                        {first?.departsDate || new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: b.status === "CONFIRMED" ? "#dcfce7" : b.status === "CANCELLED" ? "#fef2f2" : "#fef3c7", color: b.status === "CONFIRMED" ? "#16a34a" : b.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Link to={"/bookings/" + b.id + "/edit"} style={{ padding: "5px 12px", background: "#eff6ff", color: "#0047AB", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Edit</Link>
                          <button onClick={() => handleDelete(b.id, b.pnr)} disabled={deleting === b.id} style={{ padding: "5px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {deleting === b.id ? "..." : "Delete"}
                          </button>
                        </div>
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
