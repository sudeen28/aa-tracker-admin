import { useState, useRef, useEffect } from "react";
import { searchAirports } from "../lib/airports.js";

export default function AirportSearch({ value, onChange, placeholder = "Search airport..." }) {
  const [query, setQuery] = useState(value ? value.code + " — " + value.city : "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (value && !focused) {
      setQuery(value.code + " — " + value.city + ", " + value.country);
    }
  }, [value, focused]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
        if (value) setQuery(value.code + " — " + value.city + ", " + value.country);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [value]);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    setFocused(true);
    if (q.length >= 2) {
      setResults(searchAirports(q));
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
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => { setFocused(true); if (query.length >= 2) { setResults(searchAirports(query)); setOpen(true); } }}
          placeholder={placeholder}
          style={{
            width: "100%", boxSizing: "border-box", padding: "9px 36px 9px 12px",
            border: "1.5px solid " + (open ? "#0047AB" : "#e2e8f4"),
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

      {open && query.length >= 2 && results.length === 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "white", border: "1.5px solid #e2e8f4", borderRadius: 10, padding: "12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 1000 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>No airports found for "{query}"</div>
        </div>
      )}
    </div>
  );
}
