import React, { useState } from "react";
import ThreeBackground from "@/components/ThreeBackground";
import Navbar from "@/components/Navbar";
import ResultCard from "@/components/ResultCard";
import { serverUrl } from "@/components/config";
import type { PharmacyMedicine } from "@/types/pharmacy";

const CATEGORIES = ["all", "Pain Relief", "Antibiotics", "Vitamins", "Allergy", "Cold & Flu", "Digestive Health", "Skin Care", "Other"];

export default function MedicationFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PharmacyMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${serverUrl}/pharmacy/search-nearby-medicine?term=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const results: PharmacyMedicine[] = data.map((item: any) => ({
        pharmacy: {
          id: String(item.pharmacy_id),
          name: item.pharmacy_name,
          address: item.pharmacy_location,
          phone: item.pharmacy_phone ?? "N/A",
          email: item.pharmacy_email,
          latitude: item.latitude ? parseFloat(item.latitude) : undefined,
          longitude: item.longitude ? parseFloat(item.longitude) : undefined,
          rating: item.pharmacy_ratings ? parseFloat(item.pharmacy_ratings) : undefined,
          is_verified: true,
        },
        medicine: {
          id: String(item.medication_id),
          name: item.medication_name,
          price: parseFloat(item.price),
          category: item.category,
        },
        in_stock: item.quantity > 0,
        quantity_available: item.quantity,
        last_updated: new Date().toISOString(),
      }));
      setSearchResults(
        selectedCategory === "all"
          ? results
          : results.filter((r) => r.medicine.category?.toLowerCase() === selectedCategory.toLowerCase())
      );
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }} className="bg-background">
      <ThreeBackground />
      <Navbar />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── HERO / SEARCH ── */}
        <div style={{ minHeight: hasSearched ? "auto" : "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: hasSearched ? "80px 20px 40px" : "20px", position: "relative", overflow: "hidden" }}>
          {/* Grid overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(79,142,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

          {/* Glows */}
          <div style={{ position: "absolute", top: "20%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.08), transparent 70%)", pointerEvents: "none", animation: "mfGlow 6s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(159,92,247,0.06), transparent 70%)", pointerEvents: "none", animation: "mfGlow 8s ease-in-out infinite 2s" }} />

          <div style={{ maxWidth: 680, width: "100%", textAlign: "center", animation: "mfFadeUp 0.8s ease both" }}>
            {/* Eyebrow */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 100, border: "1px solid rgba(79,142,247,0.25)", background: "rgba(79,142,247,0.06)", marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", animation: "mfPulse 2s infinite" }} />
              <span className="font-display" style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" }}>Pharmacy Network</span>
            </div>

            {/* Headline */}
            <h1 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16, color: "#fff" }}>
              Find Your{" "}
              <span className="gradient-text">Medications Quickly</span>
            </h1>

            {/* Divider */}
            <div style={{ width: 60, height: 2, margin: "0 auto 20px", background: "linear-gradient(90deg, transparent, #4f8ef7, transparent)", animation: "mfLineExp 1s ease 0.4s both", transformOrigin: "center" }} />

            <p className="font-body" style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 36px" }}>
              Search for medications and discover which nearby pharmacies have them in stock — in real time.
            </p>

            {/* Search bar */}
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}>
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search medications (e.g., Paracetamol, Amoxicillin)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="font-body"
                    style={{
                      width: "100%",
                      padding: "15px 16px 15px 48px",
                      borderRadius: 14,
                      border: "1px solid rgba(79,142,247,0.35)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#fff",
                      fontSize: 15,
                      outline: "none",
                      backdropFilter: "blur(14px)",
                      transition: "border-color 0.3s, box-shadow 0.3s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(79,142,247,0.7)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(79,142,247,0.35)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="font-display gradient-primary"
                  onMouseEnter={(e) => {
                    if (!isLoading && searchQuery.trim()) {
                      (e.currentTarget).style.transform = "translateY(-2px)";
                      (e.currentTarget).style.boxShadow = "0 14px 36px rgba(79,142,247,0.45)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget).style.transform = "translateY(0)";
                    (e.currentTarget).style.boxShadow = "none";
                  }}
                  style={{
                    padding: "0 32px",
                    borderRadius: 14,
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isLoading || !searchQuery.trim() ? "not-allowed" : "pointer",
                    opacity: !searchQuery.trim() ? 0.5 : 1,
                    transition: "all 0.28s ease",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "mfSpin 0.7s linear infinite" }} />
                      Searching
                    </>
                  ) : (
                    <>Search →</>
                  )}
                </button>
              </div>

              {/* Category filters */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="font-body"
                    style={{
                      padding: "6px 16px",
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.25s",
                      border: selectedCategory === cat ? "1px solid hsl(var(--primary))" : "1px solid rgba(255,255,255,0.12)",
                      background: selectedCategory === cat ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" : "rgba(255,255,255,0.04)",
                      color: selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RESULTS ── */}
        {hasSearched && (
          <div style={{ padding: "0 20px 80px" }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, color: "rgba(255,255,255,0.4)" }}>
                    <div style={{ width: 24, height: 24, border: "2.5px solid rgba(79,142,247,0.3)", borderTopColor: "#4f8ef7", borderRadius: "50%", animation: "mfSpin 0.8s linear infinite" }} />
                    <span className="font-body" style={{ fontSize: 14 }}>Scanning pharmacy network…</span>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {/* Results header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                      <div className="font-display" style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, fontWeight: 700 }}>
                        Results for "{searchQuery}"
                      </div>
                      <div className="font-body" style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 4 }}>
                        {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} across{" "}
                        {new Set(searchResults.map((r) => r.pharmacy.id)).size} pharmac
                        {new Set(searchResults.map((r) => r.pharmacy.id)).size !== 1 ? "ies" : "y"}
                      </div>
                    </div>
                    <button
                      onClick={clearSearch}
                      className="font-display"
                      onMouseEnter={(e) => {
                        (e.currentTarget).style.borderColor = "rgba(255,255,255,0.28)";
                        (e.currentTarget).style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget).style.borderColor = "rgba(255,255,255,0.12)";
                        (e.currentTarget).style.color = "rgba(255,255,255,0.45)";
                      }}
                      style={{
                        padding: "9px 22px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "transparent",
                        color: "rgba(255,255,255,0.45)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.25s",
                      }}
                    >
                      Clear ✕
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {searchResults.map((result, i) => (
                      <ResultCard key={`${result.pharmacy.id}-${result.medicine.id}`} result={result} index={i} />
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <h3 className="font-display" style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                    No medications found
                  </h3>
                  <p className="font-body" style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginBottom: 24 }}>
                    Try different keywords or check the spelling of your search term.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="font-display"
                    style={{
                      padding: "12px 32px",
                      borderRadius: 13,
                      border: "1px solid rgba(79,142,247,0.35)",
                      background: "rgba(79,142,247,0.08)",
                      color: "#4f8ef7",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.25s",
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
