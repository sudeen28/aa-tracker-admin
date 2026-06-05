import { useState, useRef, useEffect } from "react";
import { searchAirports } from "../lib/airports.js";

/**
 * AirportSearch — drop-in autocomplete component for BookingForm.jsx
 *
 * Props:
 *   value      — { code, city, country } | null   (controlled)
 *   onChange   — (airport | null) => void
 *   placeholder — string
 *   required   — bool
 *
 * Supports:
 *   - Autocomplete from airports.js database
 *   - Manual entry fallback for any airport not in the database
 */

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  border: "1.5px solid #e2e8f4",
  borderRadius: 7,
  fontSize: 13,
  color: "#0f172a",
  outline: "none",
  fontFamily: "inherit",
  background: "#fafcff",
};

export default function AirportSearch({ value, onChange, placeholder = "Search city or airport code…", required = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [manualMode, setManualMode] = useState(false);
  const [manual, setManual] = useState({ code: "", city: "", country: "", name: "" });

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  // When a value is selected externally, clear the query
  useEffect(() => {
    if (value) setQuery("");
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlighted(-1);
        setManualMode(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    setHighlighted(-1);
    if (q.length >= 2) {
      const found = searchAirports(q);
      setResults(found);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
    if (q === "" && value) onChange(null);
  };

  const select = (airport) => {
    onChange(airport);
    setQuery("");
    setResults([]);
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.blur();
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setResults([]);
    setOpen(false);
    setManualMode(false);
    setManual({ code: "", city: "", country: "", name: "" });
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      select(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  const openManual = () => {
    // Pre-fill code/city from what the user already typed
    const q = query.trim();
    const looksLikeCode = /^[A-Za-z]{2,4}$/.test(q);
    setManual({
      code: looksLikeCode ? q.toUpperCase() : "",
      city: looksLikeCode ? "" : q,
      country: "",
      name: "",
    });
    setOpen(false);
    setManualMode(true);
  };

  const confirmManual = () => {
    const code = manual.code.trim().toUpperCase();
    const city = manual.city.trim();
    if (!code || !city) return;
    select({ code, city, country: manual.country.trim(), name: manual.name.trim(), lat: "", lng: "" });
    setManualMode(false);
    setManual({ code: "", city: "", country: "", name: "" });
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const showSelected = !!value && query === "" && !manualMode;
  const manualReady = manual.code.trim().length >= 2 && manual.city.trim().length >= 2;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <style>{`
        @keyframes airportFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .airport-option:hover { background: #f0f6ff !important; }
        .airport-manual-confirm:hover { background: #003580 !important; }
        .airport-manual-cancel:hover  { background: #f1f5f9 !important; }
        .airport-enter-btn:hover { background: #eff6ff !important; color: #0047AB !important; }
      `}</style>

      {/* ── Main input / selected pill ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${focused || manualMode ? "#0047AB" : "#e2e8f4"}`,
          borderRadius: manualMode ? "8px 8px 0 0" : 8,
          background: "#fafcff",
          overflow: "hidden",
          transition: "border-color 0.15s",
          cursor: "text",
          minHeight: 38,
        }}
        onClick={() => !manualMode && inputRef.current?.focus()}
      >
        <span style={{ paddingLeft: 10, color: "#94a3b8", fontSize: 14, flexShrink: 0 }}>✈️</span>

        {showSelected ? (
          /* ── Selected badge ── */
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px 4px 8px", flex: 1 }}>
            <span style={{
              background: "linear-gradient(135deg, #0047AB, #003580)",
              color: "white", fontWeight: 800, fontSize: 12,
              letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 5,
            }}>
              {value.code}
            </span>
            <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {value.city}{value.country ? `, ${value.country}` : ""}
              {value.name ? <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 11, marginLeft: 4 }}>{value.name}</span> : null}
            </span>
            <button type="button" onClick={clear} title="Clear"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, padding: "0 8px", lineHeight: 1, flexShrink: 0 }}>
              ×
            </button>
          </div>
        ) : manualMode ? (
          /* ── Manual mode label in the pill ── */
          <div style={{ padding: "7px 10px", fontSize: 12, color: "#0047AB", fontWeight: 700, flex: 1 }}>
            ✏️ Enter airport manually
          </div>
        ) : (
          /* ── Search input ── */
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => { setFocused(true); if (query.length >= 2) setOpen(true); }}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            required={required && !value}
            autoComplete="off"
            spellCheck={false}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "8px 10px", fontSize: 13, color: "#0f172a", fontFamily: "inherit", width: "100%" }}
          />
        )}
      </div>

      {/* ── Manual entry panel (inline, below the input) ── */}
      {manualMode && (
        <div style={{
          border: "1.5px solid #0047AB",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          background: "white",
          padding: "14px 14px 12px",
          boxShadow: "0 8px 24px rgba(0,71,171,0.10)",
          animation: "airportFadeIn 0.15s ease",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", marginBottom: 10 }}>
            AIRPORT DETAILS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.08em" }}>IATA CODE *</div>
              <input
                style={{ ...inputStyle, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", textAlign: "center" }}
                value={manual.code}
                onChange={e => setManual(m => ({ ...m, code: e.target.value.toUpperCase().slice(0, 4) }))}
                placeholder="e.g. XYZ"
                maxLength={4}
                autoFocus
              />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.08em" }}>CITY *</div>
              <input
                style={inputStyle}
                value={manual.city}
                onChange={e => setManual(m => ({ ...m, city: e.target.value }))}
                placeholder="e.g. Springfield"
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.08em" }}>COUNTRY</div>
              <input
                style={inputStyle}
                value={manual.country}
                onChange={e => setManual(m => ({ ...m, country: e.target.value }))}
                placeholder="e.g. United States"
              />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.08em" }}>AIRPORT NAME</div>
              <input
                style={inputStyle}
                value={manual.name}
                onChange={e => setManual(m => ({ ...m, name: e.target.value }))}
                placeholder="e.g. Springfield Intl"
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="airport-manual-confirm"
              onClick={confirmManual}
              disabled={!manualReady}
              style={{
                flex: 1, padding: "8px 0",
                background: manualReady ? "linear-gradient(135deg,#0047AB,#003580)" : "#e2e8f4",
                color: manualReady ? "white" : "#94a3b8",
                border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700,
                cursor: manualReady ? "pointer" : "not-allowed",
                transition: "all 0.15s",
              }}
            >
              ✓ Use This Airport
            </button>
            <button
              type="button"
              className="airport-manual-cancel"
              onClick={() => { setManualMode(false); setManual({ code: "", city: "", country: "", name: "" }); setTimeout(() => inputRef.current?.focus(), 50); }}
              style={{ padding: "8px 14px", background: "#f8faff", color: "#64748b", border: "1.5px solid #e2e8f4", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Dropdown (search results) ── */}
      {open && results.length > 0 && (
        <div
          ref={listRef}
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            background: "white", border: "1.5px solid #e2e8f4", borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 9999,
            maxHeight: 280, overflowY: "auto", animation: "airportFadeIn 0.12s ease",
          }}
        >
          {results.map((airport, idx) => {
            const isHigh = idx === highlighted;
            return (
              <div
                key={airport.code}
                className="airport-option"
                onMouseDown={(e) => { e.preventDefault(); select(airport); }}
                onMouseEnter={() => setHighlighted(idx)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", cursor: "pointer",
                  background: isHigh ? "#eff6ff" : "transparent",
                  borderBottom: idx < results.length - 1 ? "1px solid #f1f5f9" : "none",
                  transition: "background 0.1s",
                }}
              >
                <span style={{
                  minWidth: 42, textAlign: "center",
                  background: isHigh ? "linear-gradient(135deg,#0047AB,#003580)" : "#f1f5f9",
                  color: isHigh ? "white" : "#64748b",
                  fontWeight: 800, fontSize: 12, letterSpacing: "0.08em",
                  padding: "3px 7px", borderRadius: 5, transition: "all 0.1s", flexShrink: 0,
                }}>
                  {airport.code}
                </span>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {airport.city}
                    <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6, fontSize: 12 }}>{airport.country}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                    {airport.name}
                  </div>
                </div>
              </div>
            );
          })}

          {/* "Enter manually" always at the bottom of results */}
          <div
            className="airport-enter-btn"
            onMouseDown={(e) => { e.preventDefault(); openManual(); }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", cursor: "pointer",
              borderTop: "1px solid #e2e8f4", color: "#64748b", fontSize: 12,
              transition: "background 0.1s",
            }}
          >
            <span style={{ fontSize: 14 }}>✏️</span>
            <span>Not listed? Enter airport manually</span>
          </div>
        </div>
      )}

      {/* ── No results dropdown ── */}
      {open && query.length >= 2 && results.length === 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "white", border: "1.5px solid #e2e8f4", borderRadius: 10,
          zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          overflow: "hidden", animation: "airportFadeIn 0.12s ease",
        }}>
          <div style={{ padding: "14px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            No airports found for "<strong style={{ color: "#0f172a" }}>{query}</strong>"
          </div>
          <div
            className="airport-enter-btn"
            onMouseDown={(e) => { e.preventDefault(); openManual(); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 16px", cursor: "pointer",
              borderTop: "1px solid #e2e8f4",
              background: "#f8faff", color: "#0047AB",
              fontSize: 13, fontWeight: 600,
              transition: "background 0.1s",
            }}
          >
            <span>✏️</span>
            <span>Enter "<strong>{query}</strong>" manually</span>
          </div>
        </div>
      )}
    </div>
  );
}
