import { useState, useRef, useEffect } from "react";
import { searchAirports } from "../lib/airports.js";

export default function AirportSearch({ value, onChange, placeholder = "Search airport..." }) {
  const [query, setQuery] = useState(value ? value.code + " — " + value.city : "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (value && !focused) {
      if (value._manual) {
        setQuery(value.code || "");
      } else {
        setQuery(value.code + " — " + value.city + ", " + value.country);
      }
    }
  }, [value, focused]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
        if (value && !value._manual) {
          setQuery(value.code + " — " + value.city + ", " + value.country);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [value]);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    setFocused(true);
    setManualMode(false);

    if (q.length >= 2) {
      const found = searchAirports(q);
      setResults(found);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (airport) => {
    setQuery(airport.code + " — " + airport.city + ", " + airport.country);
    onChange(airport);
    setOpen(false);
    setFocused(false);
    setManualMode(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setResults([]);
    setOpen(false);
    setManualMode(false);
  };

  // Called when user clicks "Enter manually" or presses Enter with no match selected
  const commitManual = () => {
    const raw = query.trim().toUpperCase();
    if (!raw) return;
    // Parse "LOS — Lagos" style or just "LOS"
    const code = raw.split(/[\s—\-]/)[0].trim();
    const rest = query.includes("—") ? query.split("—")[1].trim() : "";
    const city = rest.split(",")[0].trim() || code;
    const country = rest.includes(",") ? rest.split(",")[1].trim() : "";
    onChange({ code, city, country, lat: "", lng: "", _manual: true });
    setManualMode(true);
    setOpen(false);
    setFocused(false);
    setResults([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[0]);
      } else if (query.trim().length >= 2) {
        commitManual();
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showNoResults = open && query.length >= 2 && results.length === 0;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            if (query.length >= 2 && !manualMode) {
              setResults(searchAirports(query));
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          style={{
            width: "100%", boxSizing: "border-box", padding: "9px 36px 9px 12px",
            border: "1.5px solid " + (open ? "#0047AB" : manualMode ? "#16a34a" : "#e2e8f4"),
            borderRadius: 8, fontSize: 13, color: "#0f172a", outline: "none",
            fontFamily: "inherit", background: "#fafcff", transition: "border 0.15s",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, lineHeight: 1, padding: 2 }}
          >×</button>
        )}
      </div>

      {/* Dropdown: search results */}
      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "white", border: "1.5px solid #e2e8f4", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 1000, overflow: "hidden",
          maxHeight: 280, overflowY: "auto",
        }}>
          {results.map((airport, i) => (
            <div
              key={airport.code}
              onMouseDown={() => handleSelect(airport)}
              style={{
                padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                borderBottom: i < results.length - 1 ? "1px solid #f1f5f9" : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}
            >
              <div style={{ width: 42, height: 42, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0047AB" }}>{airport.code}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{airport.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{airport.city} · {airport.country}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown: no results found — offer manual entry */}
      {showNoResults && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "white", border: "1.5px solid #e2e8f4", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 1000, overflow: "hidden",
        }}>
          <div style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8", borderBottom: "1px solid #f1f5f9" }}>
            No airports found for "{query}"
          </div>
          <div
            onMouseDown={commitManual}
            style={{
              padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              background: "#f8faff", transition: "background 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
            onMouseLeave={e => e.currentTarget.style.background = "#f8faff"}
          >
            <div style={{ width: 42, height: 42, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>✏️</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>Use "{query.trim().toUpperCase().split(/[\s—\-]/)[0]}" manually</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Press Enter or click to set this as airport code</div>
            </div>
          </div>
        </div>
      )}

      {/* Manual mode badge */}
      {manualMode && value && (
        <div style={{ marginTop: 4, fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
          ✏️ Manual entry: {value.code} — will save as typed
        </div>
      )}
    </div>
  );
}
