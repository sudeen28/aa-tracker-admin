import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const S = {
  wrap: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI',sans-serif", background: "#f0f4ff" },
  sidebar: { width: 220, background: "linear-gradient(180deg,#0f172a,#1e293b)", display: "flex", flexDirection: "column", flexShrink: 0 },
  logo: { padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logoTop: { fontSize: 13, fontWeight: 800, color: "#CC0000", letterSpacing: "0.06em" },
  logoSub: { fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: "0.12em" },
  nav: { flex: 1, padding: "16px 12px" },
  navLabel: { fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", padding: "8px 8px 4px", marginTop: 8 },
  link: { display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: 2, transition: "all 0.15s" },
  activeLink: { background: "rgba(204,0,0,0.25)", color: "white", fontWeight: 700 },
  bottom: { padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  userBox: { display: "flex", alignItems: "center", gap: 9, marginBottom: 10 },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#CC0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 },
  userName: { fontSize: 12, fontWeight: 600, color: "white", lineHeight: 1.3 },
  userRole: { fontSize: 10, color: "rgba(255,255,255,0.4)" },
  logoutBtn: { width: "100%", padding: "8px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 7, color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", textAlign: "left" },
  main: { flex: 1, overflow: "auto" },
  topbar: { background: "white", borderBottom: "1px solid #e2e8f4", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  content: { padding: "28px" },
};

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊", exact: true },
  { to: "/bookings", label: "Bookings", icon: "✈️" },
  { to: "/users", label: "Users", icon: "👥", superOnly: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={S.wrap}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoTop}>AMERICAN AIRLINES</div>
          <div style={S.logoSub}>ADMIN PORTAL</div>
        </div>
        <nav style={S.nav}>
          <div style={S.navLabel}>MAIN MENU</div>
          {navItems.map(item => {
            if (item.superOnly && user?.role !== "SUPER_ADMIN") return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                style={({ isActive }) => ({ ...S.link, ...(isActive ? S.activeLink : {}) })}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div style={S.bottom}>
          <div style={S.userBox}>
            <div style={S.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={S.userName}>{user?.name}</div>
              <div style={S.userRole}>{user?.role}</div>
            </div>
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Welcome back, <strong style={{ color: "#0f172a" }}>{user?.name}</strong>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>AA Tracker Admin · {new Date().toDateString()}</div>
        </div>
        <div style={S.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
