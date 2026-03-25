import React, { useState } from "react";
import type { PharmacyMedicine } from "@/types/pharmacy";

const ACCENT_COLORS = ["#4f8ef7", "#9f5cf7", "#00d4ff", "#5ff7c4"];

export default function ResultCard({ result, index }: { result: PharmacyMedicine; index: number }) {
  const [hov, setHov] = useState(false);
  const accent = ACCENT_COLORS[index % 4];

  const handleDirections = () => {
    const params = new URLSearchParams({
      name: result.pharmacy.name,
      address: result.pharmacy.address,
    });
    if (result.pharmacy.phone) params.append("phone", result.pharmacy.phone);
    if (result.pharmacy.rating) params.append("rating", result.pharmacy.rating.toString());
    if (result.pharmacy.latitude !== undefined) params.append("lat", result.pharmacy.latitude.toString());
    if (result.pharmacy.longitude !== undefined) params.append("lng", result.pharmacy.longitude.toString());
    window.location.href = `/directions?${params.toString()}`;
  };

  const handleCall = () => {
    if (result.in_stock && result.pharmacy.phone !== "N/A") {
      window.location.href = `tel:${result.pharmacy.phone.replace(/[^\d+]/g, "")}`;
    }
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        padding: "28px 30px",
        borderRadius: 20,
        border: `1px solid ${hov ? accent + "50" : "rgba(255,255,255,0.07)"}`,
        background: hov
          ? `linear-gradient(145deg,rgba(255,255,255,0.05),${accent}0d)`
          : "rgba(255,255,255,0.025)",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
        transition: "all 0.35s ease",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? `0 20px 60px ${accent}18` : "none",
        animation: `mfCardIn 0.55s ease ${index * 0.07}s both`,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 30,
          right: 30,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: hov ? 0.7 : 0.2,
          transition: "opacity 0.35s",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Medicine info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
                border: `1px solid ${accent}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5">
                <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 12h3m-3 3h3" />
              </svg>
            </div>
            <div>
              <div className="font-display" style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>
                {result.medicine.name}
              </div>
              <div className="font-body" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
                {result.medicine.category ?? "General"}
              </div>
            </div>
          </div>

          <div className="font-display" style={{ color: accent, fontSize: 22, fontWeight: 800 }}>
            ₵{result.medicine.price.toFixed(2)}
          </div>
        </div>

        {/* Stock status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              background: result.in_stock ? "rgba(95,247,196,0.12)" : "rgba(247,95,142,0.12)",
              color: result.in_stock ? "#5ff7c4" : "#f75f8e",
              border: `1px solid ${result.in_stock ? "rgba(95,247,196,0.25)" : "rgba(247,95,142,0.25)"}`,
            }}
          >
            {result.in_stock ? "In Stock" : "Out of Stock"}
          </span>
          {result.in_stock && result.quantity_available && (
            <span className="font-body" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
              {result.quantity_available} available
            </span>
          )}
        </div>

        {/* Pharmacy info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="font-display" style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 600 }}>
              {result.pharmacy.name}
            </div>
            {result.pharmacy.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f7c14f", fontSize: 13, fontWeight: 600 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#f7c14f"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                {result.pharmacy.rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", label: result.pharmacy.address },
              { icon: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z", label: result.pharmacy.phone },
              { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z", label: result.pharmacy.operating_hours ?? "Hours not specified" },
            ].map((item, i) => (
              <div key={i} className="font-body" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, opacity: 0.5 }}>
                  <path d={item.icon} />
                </svg>
                {item.label}
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {result.pharmacy.is_verified && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 600, background: "rgba(79,142,247,0.1)", color: "#4f8ef7", border: "1px solid rgba(79,142,247,0.2)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                Verified
              </span>
            )}
            {result.pharmacy.delivery_available && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 600, background: "rgba(95,247,196,0.1)", color: "#5ff7c4", border: "1px solid rgba(95,247,196,0.2)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a3 3 0 003 3h10a3 3 0 003-3V8a1 1 0 00-1-1zm-9-1a2 2 0 014 0v1h-4V6z" /></svg>
                Delivery
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={handleDirections}
              className="font-display"
              onMouseEnter={(e) => { (e.currentTarget).style.borderColor = `${accent}55`; (e.currentTarget).style.color = accent; }}
              onMouseLeave={(e) => { (e.currentTarget).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget).style.color = "rgba(255,255,255,0.55)"; }}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "rgba(255,255,255,0.55)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "all 0.25s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Directions
            </button>
            <button
              onClick={handleCall}
              className="font-display"
              onMouseEnter={(e) => {
                if (result.in_stock && result.pharmacy.phone !== "N/A") {
                  (e.currentTarget).style.transform = "translateY(-1px)";
                  (e.currentTarget).style.boxShadow = `0 10px 28px ${accent}40`;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.transform = "translateY(0)";
                (e.currentTarget).style.boxShadow = "none";
              }}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 12, border: "none",
                background: result.in_stock && result.pharmacy.phone !== "N/A"
                  ? `linear-gradient(135deg,${accent},${accent}cc)` : "rgba(255,255,255,0.08)",
                color: result.in_stock && result.pharmacy.phone !== "N/A" ? "#fff" : "rgba(255,255,255,0.25)",
                fontSize: 13, fontWeight: 600,
                cursor: result.in_stock && result.pharmacy.phone !== "N/A" ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "all 0.25s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
              {result.in_stock ? (result.pharmacy.phone !== "N/A" ? "Call Pharmacy" : "No Phone") : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>

      {/* Corner glow */}
      <div
        style={{
          position: "absolute",
          bottom: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: accent,
          opacity: hov ? 0.06 : 0.02,
          filter: "blur(25px)",
          transition: "opacity 0.35s",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
