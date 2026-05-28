import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊", exact: true },
  { to: "/bookings", label: "Bookings", icon: "✈️" },
  { to: "/users", label: "Users", icon: "👥", superOnly: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#CC0000", letterSpacing: "0.06em" }}>AMERICAN AIRLINES</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: "0.12em" }}>ADMIN PORTAL</div>
          </div>
          {/* Close button - mobile only */}
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer", display: "block" }} className="mobile-close">✕</button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", padding: "8px 8px 4px" }}>MAIN MENU</div>
        {navItems.map(item => {
          if (item.superOnly && user?.role !== "SUPER_ADMIN") return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 9,
                padding: "10px 12px", borderRadius: 8, fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "white" : "rgba(255,255,255,0.55)",
                textDecoration: "none", marginBottom: 2,
                background: isActive ? "rgba(204,0,0,0.25)" : "none",
                transition: "all 0.15s",
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#CC0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "white", lineHeight: 1.3 }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{user?.role}</div>
          </div>
        </div>
        <button style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 7, color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", textAlign: "left" }} onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI',sans-serif", background: "#f0f4ff" }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-overlay { display: flex !important; }
          .mobile-topbar-title { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-sidebar { display: flex !important; }
          .mobile-overlay { display: none !important; }
          .hamburger { display: none !important; }
          .mobile-topbar-title { display: none !important; }
          .mobile-close { display: none !important; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{ width: 220, background: "linear-gradient(180deg,#0f172a,#1e293b)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay Sidebar */}
      {sidebarOpen && (
        <div className="mobile-overlay" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
          <div style={{ width: 260, background: "linear-gradient(180deg,#0f172a,#1e293b)", display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
            <SidebarContent />
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: "white", borderBottom: "1px solid #e2e8f4", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Hamburger */}
            <button className="hamburger" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#0f172a", padding: 4, display: "block" }}>☰</button>
            <div className="mobile-topbar-title" style={{ fontSize: 12, fontWeight: 700, color: "#CC0000", letterSpacing: "0.06em", display: "none" }}>AA ADMIN</div>
            <div style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
              Welcome, <strong style={{ color: "#0f172a" }}>{user?.name}</strong>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{new Date().toDateString()}</div>
        </div>

        {/* Page content */}
        <div style={{ padding: "20px 16px 40px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
