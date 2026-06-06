import { useState, useEffect } from "react";
import AirportSearch from "../components/AirportSearch.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking, updateBooking, getBooking } from "../lib/api.js";

// Airports handled by AirportSearch component

const blank_segment = {
  flightNumber: "", aircraft: "", fromCode: "", fromCity: "", fromTerminal: "", fromGate: "",
  fromLat: "", fromLng: "", toCode: "", toCity: "", toTerminal: "", toGate: "",
  toLat: "", toLng: "", departsDate: "", departsTime: "", arrivesDate: "", arrivesTime: "",
  duration: "", seat: "", cabinClass: "Economy", meal: "Standard", status: "On Time",
};

const F = { fontFamily: "'Segoe UI',sans-serif" };
const label = { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", display: "block", marginBottom: 5 };
const input = { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1.5px solid #e2e8f4", borderRadius: 8, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", background: "#fafcff" };
const section = { background: "white", borderRadius: 14, border: "1px solid #e2e8f4", padding: "22px 24px", marginBottom: 20 };
const sectionTitle = { fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 };
const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 };

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passenger, setPassenger] = useState({ title: "MR", firstName: "", lastName: "", email: "", frequentFlyer: "", passport: "" });
  const [segments, setSegments] = useState([{ ...blank_segment }]);
  const [fare, setFare] = useState({ basis: "", cabinClass: "Economy (N)", ticketFare: "", fuelSurcharge: "", taxes: "", serviceCharge: "", aviationLevy: "", total: "", payment: "", purchaseDate: "", validBefore: "", co2: "", changesBefore: "", changesAfter: "", cancelBefore: "", cancelAfter: "", noShow: "", notValidNote: "" });
  const [baggage, setBaggage] = useState({ personal: "1 personal item", carryOn: "1 x 10kg", checked: "1 x 23kg" });
  const [alerts, setAlerts] = useState([{ type: "success", icon: "✅", message: "" }]);
  const [notifications, setNotifications] = useState([]);
  const [status, setBookingStatus] = useState("CONFIRMED");
  const [tourCode, setTourCode] = useState("");

  const [baggageStages, setBaggageStages] = useState([
    { label: "Checked In", icon: "🏷", description: "Bag tagged at check-in counter", time: "", isCurrent: false },
    { label: "Loaded", icon: "✈️", description: "Loaded onto aircraft", time: "", isCurrent: true },
  ]);
  const [hasLayover, setHasLayover] = useState(false);
  const [layover, setLayover] = useState({ airport: "", code: "", country: "", connectionTime: "", arrivalFlight: "", arrivalTime: "", arrivalTerminal: "", arrivalGate: "", depFlight: "", depTime: "", depTerminal: "", depGate: "", sameTerminal: true, transferWalk: "", tips: [] });
  const [visaEntries, setVisaEntries] = useState([]);
  const [hasSeatConfig, setHasSeatConfig] = useState(false);
  const [seatConfig, setSeatConfig] = useState({ aircraft: "", flightLabel: "", selectedSeat: "", occupied: [], exits: [] });
  const [mealOptions, setMealOptions] = useState([
    { icon: "🍽", label: "Standard Meal", desc: "Balanced meal with meat, starch, vegetable & dessert", tag: "" },
    { icon: "☪️", label: "Halal", desc: "Prepared in accordance with Islamic dietary law", tag: "MOML" },
    { icon: "🌱", label: "Vegan", desc: "Plant-based, no animal products", tag: "VGML" },
  ]);
  const [assistanceOptions, setAssistanceOptions] = useState([
    { icon: "♿", label: "Wheelchair (Ramp)", desc: "Assistance to/from aircraft door via ramp", category: "Mobility", code: "WCHR" },
    { icon: "👁", label: "Visual Impairment", desc: "Guide assistance through airport", category: "Sensory", code: "BLND" },
  ]);

  useEffect(() => {
    if (!isEdit) return;
    getBooking(id).then(({ booking: b }) => {
      if (b.passenger) setPassenger({ title: b.passenger.title, firstName: b.passenger.firstName, lastName: b.passenger.lastName, email: b.passenger.email || "", frequentFlyer: b.passenger.frequentFlyer || "", passport: b.passenger.passport || "" });
      if (b.segments && b.segments.length) setSegments(b.segments.map(s => ({ flightNumber: s.flightNumber, aircraft: s.aircraft, fromCode: s.fromCode, fromCity: s.fromCity, fromTerminal: s.fromTerminal, fromGate: s.fromGate, fromLat: s.fromLat, fromLng: s.fromLng, toCode: s.toCode, toCity: s.toCity, toTerminal: s.toTerminal, toGate: s.toGate, toLat: s.toLat, toLng: s.toLng, departsDate: s.departsDate, departsTime: s.departsTime, arrivesDate: s.arrivesDate, arrivesTime: s.arrivesTime, duration: s.duration, seat: s.seat, cabinClass: s.cabinClass, meal: s.meal, status: s.status })));
      if (b.fare) setFare({ basis: b.fare.basis, cabinClass: b.fare.cabinClass, ticketFare: b.fare.ticketFare, fuelSurcharge: b.fare.fuelSurcharge, taxes: b.fare.taxes, serviceCharge: b.fare.serviceCharge, aviationLevy: b.fare.aviationLevy, total: b.fare.total, payment: b.fare.payment, purchaseDate: b.fare.purchaseDate, validBefore: b.fare.validBefore || "", co2: b.fare.co2 || "", changesBefore: b.fare.changesBefore || "", changesAfter: b.fare.changesAfter || "", cancelBefore: b.fare.cancelBefore || "", cancelAfter: b.fare.cancelAfter || "", noShow: b.fare.noShow || "", notValidNote: b.fare.notValidNote || "" });
      if (b.baggage) setBaggage({ personal: b.baggage.personal, carryOn: b.baggage.carryOn, checked: b.baggage.checked });
      if (b.alerts && b.alerts.length) setAlerts(b.alerts.map(a => ({ type: a.type, icon: a.icon, message: a.message })));
      if (b.notifications && b.notifications.length) setNotifications(b.notifications.map(n => ({ type: n.type, icon: n.icon, message: n.message, expiresAt: n.expiresAt || "" })));
      setBookingStatus(b.status);
      setTourCode(b.tourCode || "");
      if (b.baggageStages && b.baggageStages.length) setBaggageStages(b.baggageStages.map(s => ({ label: s.label, icon: s.icon, description: s.description, time: s.time || "", isCurrent: s.isCurrent })));
      if (b.layover) { setHasLayover(true); setLayover({ airport: b.layover.airport, code: b.layover.code, country: b.layover.country, connectionTime: b.layover.connectionTime, arrivalFlight: b.layover.arrivalFlight, arrivalTime: b.layover.arrivalTime, arrivalTerminal: b.layover.arrivalTerminal, arrivalGate: b.layover.arrivalGate, depFlight: b.layover.depFlight, depTime: b.layover.depTime, depTerminal: b.layover.depTerminal, depGate: b.layover.depGate, sameTerminal: b.layover.sameTerminal, transferWalk: b.layover.transferWalk || "", tips: b.layover.tips || [] }); }
      if (b.visaEntries && b.visaEntries.length) setVisaEntries(b.visaEntries.map(v => ({ country: v.country, code: v.code, flag: v.flag, purpose: v.purpose, status: v.status, statusLabel: v.statusLabel, statusColor: v.statusColor, summary: v.summary, tip: v.tip, tipType: v.tipType, requirements: v.requirements || [], exemptions: v.exemptions || [], checklist: v.checklist || [] })));
      if (b.seatConfig) { setHasSeatConfig(true); setSeatConfig({ aircraft: b.seatConfig.aircraft, flightLabel: b.seatConfig.flightLabel, selectedSeat: b.seatConfig.selectedSeat, occupied: b.seatConfig.occupied || [], exits: b.seatConfig.exits || [] }); }
      if (b.mealOptions && b.mealOptions.length) setMealOptions(b.mealOptions.map(m => ({ icon: m.icon, label: m.label, desc: m.desc, tag: m.tag || "" })));
      if (b.assistanceOptions && b.assistanceOptions.length) setAssistanceOptions(b.assistanceOptions.map(a => ({ icon: a.icon, label: a.label, desc: a.desc, category: a.category, code: a.code })));
    }).catch(e => setError(e.message)).finally(() => setFetching(false));
  }, [id]);

  const handleAirportSelect = (segIdx, direction, airport) => {
    if (!airport) return;
    setSegments(segs => segs.map((s, i) => i !== segIdx ? s : {
      ...s,
      [direction + "Code"]: airport.code,
      [direction + "City"]: airport.city,
      [direction + "Lat"]: airport.lat,
      [direction + "Lng"]: airport.lng,
    }));
  };

  const updateSeg = (i, key, val) => setSegments(s => s.map((seg, idx) => idx === i ? { ...seg, [key]: val } : seg));
  const addSegment = () => setSegments(s => [...s, { ...blank_segment }]);
  const removeSegment = (i) => setSegments(s => s.filter((_, idx) => idx !== i));
  const updateAlert = (i, key, val) => setAlerts(a => a.map((al, idx) => idx === i ? { ...al, [key]: val } : al));
  const addAlert = () => setAlerts(a => [...a, { type: "info", icon: "ℹ️", message: "" }]);
  const removeAlert = (i) => setAlerts(a => a.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const payload = {
        status, tourCode, passenger, segments, fare, baggage,
        alerts: alerts.filter(a => a.message.trim()),
        notifications: notifications.filter(n => n.message.trim()),
        baggageStages,
        layover: hasLayover ? layover : null,
        visaEntries,
        seatConfig: hasSeatConfig ? {
  ...seatConfig,
  sections: seatConfig.sections || [
    {
      name: "Economy",
      rows: Array.from({ length: 30 }, (_, i) => ({
        row: i + 1,
        seats: ["A", "B", "C", "D", "E", "F"]
      }))
    }
  ]
} : null,
        mealOptions,
        assistanceOptions,
      };
      if (isEdit) {
        await updateBooking(id, payload);
        setSuccess("Booking updated successfully!");
      } else {
        const res = await createBooking(payload);
        setSuccess("Booking created! PNR: " + res.pnr);
        setTimeout(() => navigate("/bookings"), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontFamily: "sans-serif" }}>Loading booking...</div>;

  return (
    <div style={F}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{isEdit ? "Edit Booking" : "New Booking"}</h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>{isEdit ? "Update booking details below." : "Fill in the details to create a new PNR."}</p>
      </div>

      {error && <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}
      {success && <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, color: "#16a34a", fontSize: 13, marginBottom: 16 }}>✅ {success}</div>}

      <form onSubmit={handleSubmit}>

        {/* Booking Info */}
        <div style={section}>
          <div style={sectionTitle}>📋 Booking Info</div>
          <div style={grid2}>
            <div>
              <label style={label}>STATUS</label>
              <select value={status} onChange={e => setBookingStatus(e.target.value)} style={input}>
                <option>CONFIRMED</option><option>CANCELLED</option><option>PENDING</option>
              </select>
            </div>
            <div>
              <label style={label}>TOUR CODE</label>
              <input style={input} value={tourCode} onChange={e => setTourCode(e.target.value)} placeholder="e.g. USNG001" />
            </div>
          </div>
        </div>

        {/* Passenger */}
        <div style={section}>
          <div style={sectionTitle}>👤 Passenger</div>
          <div style={grid3}>
            <div>
              <label style={label}>TITLE</label>
              <select value={passenger.title} onChange={e => setPassenger(p => ({ ...p, title: e.target.value }))} style={input}>
                {["MR", "MRS", "MS", "DR", "PROF"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={label}>FIRST NAME</label><input required style={input} value={passenger.firstName} onChange={e => setPassenger(p => ({ ...p, firstName: e.target.value }))} placeholder="James" /></div>
            <div><label style={label}>LAST NAME</label><input required style={input} value={passenger.lastName} onChange={e => setPassenger(p => ({ ...p, lastName: e.target.value }))} placeholder="Mitchell" /></div>
            <div>
              <label style={label}>PASSENGER EMAIL <span style={{ color: "#CC0000" }}>*</span></label>
              <input required type="email" style={{ ...input, borderColor: !passenger.email ? "#fecaca" : "#e2e8f4" }} value={passenger.email} onChange={e => setPassenger(p => ({ ...p, email: e.target.value }))} placeholder="passenger@email.com" />
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>Confirmation email will be sent here</div>
            </div>
            <div><label style={label}>FREQUENT FLYER #</label><input style={input} value={passenger.frequentFlyer} onChange={e => setPassenger(p => ({ ...p, frequentFlyer: e.target.value }))} placeholder="AA-9284710" /></div>
            <div><label style={label}>PASSPORT</label><input style={input} value={passenger.passport} onChange={e => setPassenger(p => ({ ...p, passport: e.target.value }))} placeholder="***4821" /></div>
          </div>
        </div>

        {/* Segments */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>✈️ Flight Segments</span>
            <button type="button" onClick={addSegment} style={{ padding: "5px 14px", background: "#eff6ff", color: "#0047AB", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Segment</button>
          </div>
          {segments.map((seg, i) => (
            <div key={i} style={{ border: "1px solid #e2e8f4", borderRadius: 12, padding: "18px", marginBottom: 16, background: "#fafcff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0047AB" }}>Segment {i + 1}</div>
                {segments.length > 1 && <button type="button" onClick={() => removeSegment(i)} style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Remove</button>}
              </div>
              <div style={{ ...grid2, marginBottom: 12 }}>
                <div><label style={label}>FLIGHT NUMBER</label><input required style={input} value={seg.flightNumber} onChange={e => updateSeg(i, "flightNumber", e.target.value)} placeholder="AA 0081" /></div>
                <div><label style={label}>AIRCRAFT</label><input style={input} value={seg.aircraft} onChange={e => updateSeg(i, "aircraft", e.target.value)} placeholder="Boeing 777-300ER" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={label}>FROM AIRPORT</label>
                  <AirportSearch
                    value={seg.fromCode ? { code: seg.fromCode, city: seg.fromCity, country: "" } : null}
                    onChange={(airport) => handleAirportSelect(i, "from", airport)}
                    placeholder="Search city or airport code..."
                  />
                  {seg.fromCode && <div style={{ fontSize: 11, color: "#0047AB", marginTop: 4, fontWeight: 600 }}>{seg.fromCode} — {seg.fromCity}</div>}
                  <input style={{ ...input, marginTop: 6 }} value={seg.fromTerminal} onChange={e => updateSeg(i, "fromTerminal", e.target.value)} placeholder="Terminal 2" />
                  <input style={{ ...input, marginTop: 6 }} value={seg.fromGate} onChange={e => updateSeg(i, "fromGate", e.target.value)} placeholder="Gate G14" />
                </div>
                <div>
                  <label style={label}>TO AIRPORT</label>
                  <AirportSearch
                    value={seg.toCode ? { code: seg.toCode, city: seg.toCity, country: "" } : null}
                    onChange={(airport) => handleAirportSelect(i, "to", airport)}
                    placeholder="Search city or airport code..."
                  />
                  {seg.toCode && <div style={{ fontSize: 11, color: "#CC0000", marginTop: 4, fontWeight: 600 }}>{seg.toCode} — {seg.toCity}</div>}
                  <input style={{ ...input, marginTop: 6 }} value={seg.toTerminal} onChange={e => updateSeg(i, "toTerminal", e.target.value)} placeholder="Terminal 3" />
                  <input style={{ ...input, marginTop: 6 }} value={seg.toGate} onChange={e => updateSeg(i, "toGate", e.target.value)} placeholder="Gate B22" />
                </div>
              </div>
              <div style={{ ...grid3, marginBottom: 12 }}>
                <div><label style={label}>DEPARTS DATE</label><input style={input} value={seg.departsDate} onChange={e => updateSeg(i, "departsDate", e.target.value)} placeholder="Jun 14, 2026" /></div>
                <div><label style={label}>DEPARTS TIME</label><input style={input} value={seg.departsTime} onChange={e => updateSeg(i, "departsTime", e.target.value)} placeholder="23:45" /></div>
                <div><label style={label}>DURATION</label><input style={input} value={seg.duration} onChange={e => updateSeg(i, "duration", e.target.value)} placeholder="6h 45m" /></div>
                <div><label style={label}>ARRIVES DATE</label><input style={input} value={seg.arrivesDate} onChange={e => updateSeg(i, "arrivesDate", e.target.value)} placeholder="Jun 15, 2026" /></div>
                <div><label style={label}>ARRIVES TIME</label><input style={input} value={seg.arrivesTime} onChange={e => updateSeg(i, "arrivesTime", e.target.value)} placeholder="06:30" /></div>
                <div>
                  <label style={label}>FLIGHT STATUS</label>
                  <select style={input} value={seg.status} onChange={e => updateSeg(i, "status", e.target.value)}>
                    {["On Time", "Delayed", "Cancelled", "Boarding", "Departed", "Landed"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={grid3}>
                <div><label style={label}>SEAT</label><input style={input} value={seg.seat} onChange={e => updateSeg(i, "seat", e.target.value)} placeholder="14A" /></div>
                <div>
                  <label style={label}>CLASS</label>
                  <select style={input} value={seg.cabinClass} onChange={e => updateSeg(i, "cabinClass", e.target.value)}>
                    {["Economy", "Premium Economy", "Business", "First"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={label}>MEAL</label><input style={input} value={seg.meal} onChange={e => updateSeg(i, "meal", e.target.value)} placeholder="Dinner + Breakfast" /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Fare */}
        <div style={section}>
          <div style={sectionTitle}>💰 Fare & Pricing</div>
          <div style={{ ...grid3, marginBottom: 12 }}>
            <div><label style={label}>FARE BASIS</label><input style={input} value={fare.basis} onChange={e => setFare(f => ({ ...f, basis: e.target.value }))} placeholder="YLOWUS" /></div>
            <div><label style={label}>TICKET FARE</label><input style={input} value={fare.ticketFare} onChange={e => setFare(f => ({ ...f, ticketFare: e.target.value }))} placeholder="USD 842.00" /></div>
            <div><label style={label}>FUEL SURCHARGE</label><input style={input} value={fare.fuelSurcharge} onChange={e => setFare(f => ({ ...f, fuelSurcharge: e.target.value }))} placeholder="USD 312.40" /></div>
            <div><label style={label}>TAXES</label><input style={input} value={fare.taxes} onChange={e => setFare(f => ({ ...f, taxes: e.target.value }))} placeholder="USD 98.60" /></div>
            <div><label style={label}>SERVICE CHARGE</label><input style={input} value={fare.serviceCharge} onChange={e => setFare(f => ({ ...f, serviceCharge: e.target.value }))} placeholder="USD 24.00" /></div>
            <div><label style={label}>AVIATION LEVY</label><input style={input} value={fare.aviationLevy} onChange={e => setFare(f => ({ ...f, aviationLevy: e.target.value }))} placeholder="USD 18.50" /></div>
            <div><label style={label}>TOTAL</label><input style={{ ...input, fontWeight: 700, color: "#0047AB" }} value={fare.total} onChange={e => setFare(f => ({ ...f, total: e.target.value }))} placeholder="USD 1,295.50" /></div>
            <div><label style={label}>PAYMENT</label><input style={input} value={fare.payment} onChange={e => setFare(f => ({ ...f, payment: e.target.value }))} placeholder="CREDIT CARD ····7842" /></div>
            <div><label style={label}>PURCHASE DATE</label><input style={input} value={fare.purchaseDate} onChange={e => setFare(f => ({ ...f, purchaseDate: e.target.value }))} placeholder="May 18, 2026" /></div>
          </div>
          <div style={grid3}>
            <div><label style={label}>CHANGES BEFORE</label><input style={input} value={fare.changesBefore} onChange={e => setFare(f => ({ ...f, changesBefore: e.target.value }))} placeholder="USD 150.00" /></div>
            <div><label style={label}>CHANGES AFTER</label><input style={input} value={fare.changesAfter} onChange={e => setFare(f => ({ ...f, changesAfter: e.target.value }))} placeholder="USD 200.00" /></div>
            <div><label style={label}>CANCEL BEFORE</label><input style={input} value={fare.cancelBefore} onChange={e => setFare(f => ({ ...f, cancelBefore: e.target.value }))} placeholder="USD 250.00" /></div>
            <div><label style={label}>CANCEL AFTER</label><input style={input} value={fare.cancelAfter} onChange={e => setFare(f => ({ ...f, cancelAfter: e.target.value }))} placeholder="Non-refundable" /></div>
            <div><label style={label}>NO SHOW FEE</label><input style={input} value={fare.noShow} onChange={e => setFare(f => ({ ...f, noShow: e.target.value }))} placeholder="USD 350.00" /></div>
            <div><label style={label}>CO2 EMISSIONS</label><input style={input} value={fare.co2} onChange={e => setFare(f => ({ ...f, co2: e.target.value }))} placeholder="1,842 kg per person" /></div>
          </div>
        </div>

        {/* Baggage */}
        <div style={section}>
          <div style={sectionTitle}>🧳 Baggage</div>
          <div style={grid3}>
            <div><label style={label}>PERSONAL ITEM</label><input style={input} value={baggage.personal} onChange={e => setBaggage(b => ({ ...b, personal: e.target.value }))} /></div>
            <div><label style={label}>CARRY-ON</label><input style={input} value={baggage.carryOn} onChange={e => setBaggage(b => ({ ...b, carryOn: e.target.value }))} /></div>
            <div><label style={label}>CHECKED BAG</label><input style={input} value={baggage.checked} onChange={e => setBaggage(b => ({ ...b, checked: e.target.value }))} /></div>
          </div>
        </div>

        {/* Alerts */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>🔔 Flight Alerts</span>
            <button type="button" onClick={addAlert} style={{ padding: "5px 14px", background: "#eff6ff", color: "#0047AB", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Alert</button>
          </div>
          {alerts.map((al, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 60px 1fr 80px", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select style={input} value={al.type} onChange={e => updateAlert(i, "type", e.target.value)}>
                {["info", "success", "warning", "error"].map(t => <option key={t}>{t}</option>)}
              </select>
              <input style={input} value={al.icon} onChange={e => updateAlert(i, "icon", e.target.value)} placeholder="✅" />
              <input style={input} value={al.message} onChange={e => updateAlert(i, "message", e.target.value)} placeholder="Alert message..." />
              <button type="button" onClick={() => removeAlert(i)} style={{ padding: "9px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>Remove</button>
            </div>
          ))}
        </div>

        {/* Baggage Stages */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>🧳 Baggage Tracker Stages</span>
            <button type="button" onClick={() => setBaggageStages(s => [...s, { label: "", icon: "📦", description: "", time: "", isCurrent: false }])} style={{ padding: "5px 14px", background: "#eff6ff", color: "#0047AB", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Stage</button>
          </div>
          {baggageStages.map((stage, i) => (
            <div key={i} style={{ border: "1px solid #e2e8f4", borderRadius: 10, padding: "14px", marginBottom: 10, background: stage.isCurrent ? "#f0fdf4" : "#fafcff" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <input style={input} value={stage.icon} onChange={e => setBaggageStages(s => s.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} placeholder="📦" />
                <input style={input} value={stage.label} onChange={e => setBaggageStages(s => s.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Stage label" />
                <input style={input} value={stage.description} onChange={e => setBaggageStages(s => s.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} placeholder="Description" />
                <input style={input} value={stage.time} onChange={e => setBaggageStages(s => s.map((x, j) => j === i ? { ...x, time: e.target.value } : x))} placeholder="Jun 14, 20:15" />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", cursor: "pointer" }}>
                    <input type="checkbox" checked={stage.isCurrent} onChange={e => setBaggageStages(s => s.map((x, j) => j === i ? { ...x, isCurrent: e.target.checked } : x))} />
                    Current
                  </label>
                  <button type="button" onClick={() => setBaggageStages(s => s.filter((_, j) => j !== i))} style={{ padding: "4px 8px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Layover */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>🔁 Layover Details</span>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#0047AB", cursor: "pointer", fontWeight: 600 }}>
              <input type="checkbox" checked={hasLayover} onChange={e => setHasLayover(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
              {hasLayover ? "Remove layover" : "Add layover to this booking"}
            </label>
          </div>
          {!hasLayover && (
            <div style={{ padding: "20px", textAlign: "center", background: "#f8faff", borderRadius: 10, border: "1px dashed #e2e8f4", color: "#94a3b8", fontSize: 13 }}>
              Tick the checkbox above to add layover details
            </div>
          )}
          {hasLayover && (
            <>
              <div style={{ ...grid3, marginBottom: 12 }}>
                <div><label style={label}>AIRPORT</label><input style={input} value={layover.airport} onChange={e => setLayover(l => ({ ...l, airport: e.target.value }))} placeholder="London Heathrow" /></div>
                <div><label style={label}>CODE</label><input style={input} value={layover.code} onChange={e => setLayover(l => ({ ...l, code: e.target.value }))} placeholder="LHR" /></div>
                <div><label style={label}>COUNTRY</label><input style={input} value={layover.country} onChange={e => setLayover(l => ({ ...l, country: e.target.value }))} placeholder="United Kingdom" /></div>
                <div><label style={label}>CONNECTION TIME</label><input style={input} value={layover.connectionTime} onChange={e => setLayover(l => ({ ...l, connectionTime: e.target.value }))} placeholder="3h 40m" /></div>
                <div><label style={label}>TRANSFER WALK</label><input style={input} value={layover.transferWalk} onChange={e => setLayover(l => ({ ...l, transferWalk: e.target.value }))} placeholder="~12 min walk" /></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 20 }}>
                  <input type="checkbox" checked={layover.sameTerminal} onChange={e => setLayover(l => ({ ...l, sameTerminal: e.target.checked }))} />
                  <label style={{ fontSize: 12, color: "#64748b" }}>Same Terminal</label>
                </div>
              </div>
              <div style={{ ...grid2, marginBottom: 12 }}>
                <div style={{ border: "1px solid #e2e8f4", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0047AB", marginBottom: 8 }}>ARRIVAL</div>
                  <div style={grid2}>
                    <div><label style={label}>FLIGHT</label><input style={input} value={layover.arrivalFlight} onChange={e => setLayover(l => ({ ...l, arrivalFlight: e.target.value }))} placeholder="AA 0081" /></div>
                    <div><label style={label}>TIME</label><input style={input} value={layover.arrivalTime} onChange={e => setLayover(l => ({ ...l, arrivalTime: e.target.value }))} placeholder="06:30" /></div>
                    <div><label style={label}>TERMINAL</label><input style={input} value={layover.arrivalTerminal} onChange={e => setLayover(l => ({ ...l, arrivalTerminal: e.target.value }))} placeholder="Terminal 3" /></div>
                    <div><label style={label}>GATE</label><input style={input} value={layover.arrivalGate} onChange={e => setLayover(l => ({ ...l, arrivalGate: e.target.value }))} placeholder="B22" /></div>
                  </div>
                </div>
                <div style={{ border: "1px solid #e2e8f4", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#CC0000", marginBottom: 8 }}>DEPARTURE</div>
                  <div style={grid2}>
                    <div><label style={label}>FLIGHT</label><input style={input} value={layover.depFlight} onChange={e => setLayover(l => ({ ...l, depFlight: e.target.value }))} placeholder="AA 0100" /></div>
                    <div><label style={label}>TIME</label><input style={input} value={layover.depTime} onChange={e => setLayover(l => ({ ...l, depTime: e.target.value }))} placeholder="10:10" /></div>
                    <div><label style={label}>TERMINAL</label><input style={input} value={layover.depTerminal} onChange={e => setLayover(l => ({ ...l, depTerminal: e.target.value }))} placeholder="Terminal 3" /></div>
                    <div><label style={label}>GATE</label><input style={input} value={layover.depGate} onChange={e => setLayover(l => ({ ...l, depGate: e.target.value }))} placeholder="C09" /></div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Layover Tips</div>
                  <button type="button" onClick={() => setLayover(l => ({ ...l, tips: [...l.tips, { icon: "✈", title: "", text: "" }] }))} style={{ padding: "4px 12px", background: "#eff6ff", color: "#0047AB", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Tip</button>
                </div>
                {layover.tips.map((tip, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "50px 1fr 2fr 60px", gap: 8, marginBottom: 8 }}>
                    <input style={input} value={tip.icon} onChange={e => setLayover(l => ({ ...l, tips: l.tips.map((t, j) => j === i ? { ...t, icon: e.target.value } : t) }))} placeholder="🛂" />
                    <input style={input} value={tip.title} onChange={e => setLayover(l => ({ ...l, tips: l.tips.map((t, j) => j === i ? { ...t, title: e.target.value } : t) }))} placeholder="Tip title" />
                    <input style={input} value={tip.text} onChange={e => setLayover(l => ({ ...l, tips: l.tips.map((t, j) => j === i ? { ...t, text: e.target.value } : t) }))} placeholder="Tip description" />
                    <button type="button" onClick={() => setLayover(l => ({ ...l, tips: l.tips.filter((_, j) => j !== i) }))} style={{ padding: "9px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Visa Entries */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>🛂 Visa & Entry Requirements</span>
            <button type="button" onClick={() => setVisaEntries(v => [...v, { country: "", code: "", flag: "🏳", purpose: "", status: "required", statusLabel: "VISA REQUIRED", statusColor: "#dc2626", summary: "", tip: "", tipType: "warning", requirements: [], exemptions: [], checklist: [] }])} style={{ padding: "5px 14px", background: "#eff6ff", color: "#0047AB", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Country</button>
          </div>
          {visaEntries.map((v, i) => (
            <div key={i} style={{ border: "1px solid #e2e8f4", borderRadius: 12, padding: 16, marginBottom: 12, background: "#fafcff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Country {i + 1}: {v.country || "Untitled"}</div>
                <button type="button" onClick={() => setVisaEntries(vs => vs.filter((_, j) => j !== i))} style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer" }}>Remove</button>
              </div>
              <div style={{ ...grid3, marginBottom: 10 }}>
                <div><label style={label}>FLAG EMOJI</label><input style={input} value={v.flag} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, flag: e.target.value } : x))} placeholder="🇬🇧" /></div>
                <div><label style={label}>COUNTRY NAME</label><input style={input} value={v.country} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, country: e.target.value } : x))} placeholder="United Kingdom" /></div>
                <div><label style={label}>AIRPORT CODE</label><input style={input} value={v.code} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, code: e.target.value } : x))} placeholder="LHR" /></div>
                <div><label style={label}>PURPOSE</label><input style={input} value={v.purpose} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, purpose: e.target.value } : x))} placeholder="Airside Transit" /></div>
                <div>
                  <label style={label}>STATUS TYPE</label>
                  <select style={input} value={v.status} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, status: e.target.value } : x))}>
                    <option value="required">Required</option>
                    <option value="warning">May be required</option>
                    <option value="free">Visa free</option>
                  </select>
                </div>
                <div><label style={label}>STATUS LABEL</label><input style={input} value={v.statusLabel} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, statusLabel: e.target.value } : x))} placeholder="VISA REQUIRED" /></div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={label}>SUMMARY</label>
                <textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={v.summary} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, summary: e.target.value } : x))} placeholder="Brief visa requirement summary..." />
              </div>
              <div style={{ ...grid2, marginBottom: 10 }}>
                <div><label style={label}>TIP TEXT</label><input style={input} value={v.tip} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, tip: e.target.value } : x))} placeholder="Key tip for this country" /></div>
                <div>
                  <label style={label}>TIP TYPE</label>
                  <select style={input} value={v.tipType} onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, tipType: e.target.value } : x))}>
                    <option value="success">Success (green)</option>
                    <option value="warning">Warning (yellow)</option>
                    <option value="info">Info (blue)</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={label}>REQUIREMENTS (one per line: Label|Value)</label>
                <textarea
                  style={{ ...input, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                  value={Array.isArray(v.requirements) ? v.requirements.map(r => r.label + "|" + r.value).join("\n") : ""}
                  onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, requirements: e.target.value.split("\n").filter(Boolean).map(line => { const parts = line.split("|"); return { label: (parts[0] || "").trim(), value: (parts[1] || "").trim() }; }) } : x))}
                  placeholder="Visa Type|B-1/B-2 Nonimmigrant Visa"
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={label}>EXEMPTIONS (one per line)</label>
                <textarea
                  style={{ ...input, minHeight: 60, resize: "vertical" }}
                  value={Array.isArray(v.exemptions) ? v.exemptions.join("\n") : ""}
                  onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, exemptions: e.target.value.split("\n").filter(Boolean) } : x))}
                  placeholder="You hold a valid US visa"
                />
              </div>
              <div>
                <label style={label}>CHECKLIST (one per line)</label>
                <textarea
                  style={{ ...input, minHeight: 60, resize: "vertical" }}
                  value={Array.isArray(v.checklist) ? v.checklist.join("\n") : ""}
                  onChange={e => setVisaEntries(vs => vs.map((x, j) => j === i ? { ...x, checklist: e.target.value.split("\n").filter(Boolean) } : x))}
                  placeholder="Valid passport"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Seat Config */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>💺 Seat Map Configuration</span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", cursor: "pointer" }}>
              <input type="checkbox" checked={hasSeatConfig} onChange={e => setHasSeatConfig(e.target.checked)} /> Configure seat map
            </label>
          </div>
          {hasSeatConfig && (
            <div style={grid2}>
              <div><label style={label}>AIRCRAFT</label><input style={input} value={seatConfig.aircraft} onChange={e => setSeatConfig(s => ({ ...s, aircraft: e.target.value }))} placeholder="Boeing 777-300ER" /></div>
              <div><label style={label}>FLIGHT LABEL</label><input style={input} value={seatConfig.flightLabel} onChange={e => setSeatConfig(s => ({ ...s, flightLabel: e.target.value }))} placeholder="AA 0081 · LOS to LHR" /></div>
              <div><label style={label}>SELECTED SEAT</label><input style={input} value={seatConfig.selectedSeat} onChange={e => setSeatConfig(s => ({ ...s, selectedSeat: e.target.value }))} placeholder="14A" /></div>
              <div>
                <label style={label}>OCCUPIED SEATS (comma separated)</label>
                <input style={input} value={Array.isArray(seatConfig.occupied) ? seatConfig.occupied.join(",") : ""} onChange={e => setSeatConfig(s => ({ ...s, occupied: e.target.value.split(",").map(x => x.trim()).filter(Boolean) }))} placeholder="12A,13B,14C" />
              </div>
              <div>
                <label style={label}>EXIT ROWS (comma separated)</label>
                <input style={input} value={Array.isArray(seatConfig.exits) ? seatConfig.exits.join(",") : ""} onChange={e => setSeatConfig(s => ({ ...s, exits: e.target.value.split(",").map(x => parseInt(x.trim())).filter(Boolean) }))} placeholder="1,12,30,45" />
              </div>
            </div>
          )}
        </div>

        {/* Meal Options */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>🍽 Meal Options</span>
            <button type="button" onClick={() => setMealOptions(m => [...m, { icon: "🍽", label: "", desc: "", tag: "" }])} style={{ padding: "5px 14px", background: "#eff6ff", color: "#0047AB", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Meal</button>
          </div>
          {mealOptions.map((m, i) => (
            <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input style={input} value={m.icon} onChange={e => setMealOptions(ms => ms.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} placeholder="🍽" />
              <input style={input} value={m.label} onChange={e => setMealOptions(ms => ms.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Halal" />
              <input style={input} value={m.desc} onChange={e => setMealOptions(ms => ms.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} placeholder="Description" />
              <input style={input} value={m.tag} onChange={e => setMealOptions(ms => ms.map((x, j) => j === i ? { ...x, tag: e.target.value } : x))} placeholder="MOML" />
              <button type="button" onClick={() => setMealOptions(ms => ms.filter((_, j) => j !== i))} style={{ padding: "9px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>✕</button>
            </div>
          ))}
        </div>

        {/* Assistance Options */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>♿ Special Assistance Options</span>
            <button type="button" onClick={() => setAssistanceOptions(a => [...a, { icon: "♿", label: "", desc: "", category: "Mobility", code: "" }])} style={{ padding: "5px 14px", background: "#eff6ff", color: "#0047AB", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Option</button>
          </div>
          {assistanceOptions.map((a, i) => (
            <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input style={input} value={a.icon} onChange={e => setAssistanceOptions(as => as.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} placeholder="♿" />
              <input style={input} value={a.label} onChange={e => setAssistanceOptions(as => as.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Wheelchair" />
              <input style={input} value={a.desc} onChange={e => setAssistanceOptions(as => as.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} placeholder="Description" />
              <select style={input} value={a.category} onChange={e => setAssistanceOptions(as => as.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}>
                {["Mobility", "Sensory", "Medical", "Seating", "Family", "Pets"].map(c => <option key={c}>{c}</option>)}
              </select>
              <input style={input} value={a.code} onChange={e => setAssistanceOptions(as => as.map((x, j) => j === i ? { ...x, code: e.target.value } : x))} placeholder="WCHR" />
              <button type="button" onClick={() => setAssistanceOptions(as => as.filter((_, j) => j !== i))} style={{ padding: "9px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>✕</button>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div style={section}>
          <div style={{ ...sectionTitle, justifyContent: "space-between" }}>
            <span>📢 Passenger Notifications</span>
            <button type="button" onClick={() => setNotifications(n => [...n, { type: "info", icon: "📢", message: "", expiresAt: "" }])} style={{ padding: "5px 14px", background: "#eff6ff", color: "#0047AB", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Notification</button>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>These appear as banners on the passenger's booking page.</p>
          {notifications.length === 0 && (
            <div style={{ padding: "16px", textAlign: "center", background: "#f8faff", borderRadius: 10, border: "1px dashed #e2e8f4", color: "#94a3b8", fontSize: 13 }}>
              No notifications yet — click Add Notification above
            </div>
          )}
          {notifications.map((n, i) => (
            <div key={i} style={{ border: "1px solid #e2e8f4", borderRadius: 10, padding: 14, marginBottom: 10, background: "#fafcff" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
                <select style={input} value={n.type} onChange={e => setNotifications(ns => ns.map((x, j) => j === i ? { ...x, type: e.target.value } : x))}>
                  <option value="info">ℹ️ Info (blue)</option>
                  <option value="success">✅ Success (green)</option>
                  <option value="warning">⚠️ Warning (yellow)</option>
                  <option value="error">🚨 Urgent (red)</option>
                </select>
                <input style={input} value={n.icon} onChange={e => setNotifications(ns => ns.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} placeholder="📢" />
                <input style={input} value={n.message} onChange={e => setNotifications(ns => ns.map((x, j) => j === i ? { ...x, message: e.target.value } : x))} placeholder="Type your notification message here..." />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...label, marginBottom: 4 }}>EXPIRES AT (optional)</label>
                  <input type="datetime-local" style={input} value={n.expiresAt} onChange={e => setNotifications(ns => ns.map((x, j) => j === i ? { ...x, expiresAt: e.target.value } : x))} />
                </div>
                <button type="button" onClick={() => setNotifications(ns => ns.filter((_, j) => j !== i))} style={{ padding: "9px 14px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 20 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="button" onClick={() => navigate("/bookings")} style={{ padding: "11px 24px", background: "white", color: "#64748b", border: "1.5px solid #e2e8f4", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: "11px 28px", background: loading ? "#94a3b8" : "linear-gradient(135deg,#CC0000,#a80000)", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 16px rgba(204,0,0,0.3)" }}>
            {loading ? "Saving..." : isEdit ? "Update Booking" : "Create Booking & Generate PNR"}
          </button>
        </div>

      </form>
    </div>
  );
}
