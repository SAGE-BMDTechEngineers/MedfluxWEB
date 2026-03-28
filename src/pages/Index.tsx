import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ResultCard from "@/components/ResultCard";
import { GOOGLE_MAPS_API_KEY } from "@/components/config";
import type { PharmacyMedicine } from "@/types/pharmacy";

declare global {
  interface Window {
    google: typeof google;
    initMedifindHomeMap: () => void;
  }
}

const CATEGORIES = [
  "all",
  "Pain Relief",
  "Antibiotics",
  "Vitamins",
  "Allergy",
  "Cold & Flu",
  "Digestive Health",
  "Skin Care",
  "Other",
];

const RECENTS_KEY = "medifind-pharmacy-recents";
const ACCRA = { lat: 5.6037, lng: -0.187 };

/** Nearby medicine search — override with VITE_SEARCH_NEARBY_URL if needed */
const NEARBY_MEDICINE_API =
  (import.meta.env.VITE_SEARCH_NEARBY_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://backend-hosting-4w2m.onrender.com/api/pharmacy/search-nearby-medicine";

type RecentEntry = {
  id: string;
  pharmacyName: string;
  medicineName: string;
  address: string;
  phone: string;
  inStock: boolean;
  lat?: number;
  lng?: number;
};

function readRecents(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecents(items: RecentEntry[]) {
  localStorage.setItem(RECENTS_KEY, JSON.stringify(items.slice(0, 15)));
}

function mergeRecentsFromResults(results: PharmacyMedicine[], prev: RecentEntry[]): RecentEntry[] {
  const incoming: RecentEntry[] = results.map((r) => ({
    id: `${r.pharmacy.id}-${r.medicine.id}`,
    pharmacyName: r.pharmacy.name,
    medicineName: r.medicine.name,
    address: r.pharmacy.address,
    phone: r.pharmacy.phone ?? "N/A",
    inStock: r.in_stock,
    lat: r.pharmacy.latitude,
    lng: r.pharmacy.longitude,
  }));
  const seen = new Set<string>();
  const merged: RecentEntry[] = [];
  for (const item of [...incoming, ...prev]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
    if (merged.length >= 15) break;
  }
  writeRecents(merged);
  return merged;
}

export default function MedicationFinder() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PharmacyMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [recents, setRecents] = useState<RecentEntry[]>(() =>
    typeof window !== "undefined" ? readRecents() : []
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(ACCRA)
    );
  }, []);

  const initHomeMap = useCallback(() => {
    if (!mapRef.current || !userLocation || !window.google) return;
    if (GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
      setMapError("Add your Google Maps API key in environment (VITE_GOOGLE_MAPS_API_KEY).");
      return;
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: "greedy",
      draggable: true,
      scrollwheel: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#e8eef5" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#3d4f6f" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f7fb" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d0d8e6" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c5d9f0" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8e6c9" }] },
      ],
    });
    mapInstanceRef.current = map;
    setMapReady(true);

    userMarkerRef.current?.setMap(null);
    userMarkerRef.current = new window.google.maps.Marker({
      position: userLocation,
      map,
      title: "Your location",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#2563eb",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
    });
  }, [userLocation]);

  useEffect(() => {
    if (!userLocation) return;
    if (GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
      setMapError("Add your Google Maps API key in environment (VITE_GOOGLE_MAPS_API_KEY).");
      return;
    }

    const run = () => initHomeMap();

    if (window.google) {
      run();
      return;
    }

    window.initMedifindHomeMap = () => {
      run();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMedifindHomeMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete window.initMedifindHomeMap;
    };
  }, [userLocation, initHomeMap]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map || !window.google || !userLocation) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(userLocation);

    const byPharmacy = new Map<string, PharmacyMedicine["pharmacy"]>();
    searchResults.forEach((r) => {
      if (r.pharmacy.latitude != null && r.pharmacy.longitude != null) {
        byPharmacy.set(r.pharmacy.id, r.pharmacy);
      }
    });

    byPharmacy.forEach((ph) => {
      const pos = { lat: ph.latitude!, lng: ph.longitude! };
      const m = new window.google.maps.Marker({
        position: pos,
        map,
        title: ph.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#7c3aed",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(m);
      bounds.extend(pos);
    });

    if (byPharmacy.size > 0) {
      map.fitBounds(bounds, 48);
    } else {
      map.setCenter(userLocation);
      map.setZoom(14);
    }
  }, [searchResults, userLocation, mapReady]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    const lat = userLocation?.lat ?? ACCRA.lat;
    const lon = userLocation?.lng ?? ACCRA.lng;
    try {
      const res = await fetch(
        `${NEARBY_MEDICINE_API}?lat=${lat}&lon=${lon}&term=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const results: PharmacyMedicine[] = data.map((item: Record<string, unknown>) => ({
        pharmacy: {
          id: String(item.pharmacy_id),
          name: item.pharmacy_name as string,
          address: item.pharmacy_location as string,
          phone: (item.pharmacy_phone as string | undefined) ?? "N/A",
          email: item.pharmacy_email as string | undefined,
          latitude: item.latitude != null ? parseFloat(String(item.latitude)) : undefined,
          longitude: item.longitude != null ? parseFloat(String(item.longitude)) : undefined,
          rating: item.pharmacy_ratings != null ? parseFloat(String(item.pharmacy_ratings)) : undefined,
          is_verified: true,
        },
        medicine: {
          id: String(item.medication_id),
          name: item.medication_name as string,
          price: parseFloat(String(item.price)),
          category: item.category as string | undefined,
        },
        in_stock: Number(item.quantity) > 0,
        quantity_available: item.quantity as number | undefined,
        last_updated: new Date().toISOString(),
      }));
      const filtered =
        selectedCategory === "all"
          ? results
          : results.filter((r) => r.medicine.category?.toLowerCase() === selectedCategory.toLowerCase());
      setSearchResults(filtered);
      setRecents((prev) => mergeRecentsFromResults(filtered, prev));
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

  const openDirections = (r: RecentEntry) => {
    const params = new URLSearchParams({
      name: r.pharmacyName,
      address: r.address,
    });
    if (r.phone) params.append("phone", r.phone);
    if (r.lat != null) params.append("lat", String(r.lat));
    if (r.lng != null) params.append("lng", String(r.lng));
    navigate({ pathname: "/directions", search: `?${params.toString()}` });
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", width: "100%" }} className="bg-background">
      <Navbar />

      <div style={{ position: "relative", zIndex: 1, paddingTop: 76, width: "100%", boxSizing: "border-box" }}>
        {/* Hero: map + search + recents */}
        <section
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: 0,
            padding: "0 clamp(16px, 4vw, 32px) 24px",
            boxSizing: "border-box",
          }}
        >
          {/* Map */}
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 20,
              overflow: "hidden",
              height: "clamp(400px, 68vh, 820px)",
              minHeight: 400,
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(15,23,42,0.5)",
            }}
          >
            {mapError ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <p className="font-body" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>
                  {mapError}
                </p>
              </div>
            ) : !userLocation ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "2px solid rgba(79,142,247,0.35)",
                    borderTopColor: "#4f8ef7",
                    borderRadius: "50%",
                    animation: "mfSpin 0.8s linear infinite",
                  }}
                />
                <span className="font-body" style={{ fontSize: 14 }}>Locating you…</span>
              </div>
            ) : (
              <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            )}
          </div>

          {/* Search row — pill + scan */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: -18,
              position: "relative",
              zIndex: 2,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "rgba(248,250,252,0.98)",
                borderRadius: 16,
                padding: "4px 4px 4px 14px",
                border: "1px solid rgba(226,232,240,0.9)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search Medication"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="font-body"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  background: "transparent",
                  padding: "12px 10px",
                  fontSize: 15,
                  color: "#0f172a",
                  outline: "none",
                }}
              />
              <button
                type="button"
                aria-label="Voice search"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3b82f6",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              aria-label="Send search"
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="font-display"
              style={{
                width: 52,
                borderRadius: 16,
                border: "none",
                background: isLoading || !searchQuery.trim() ? "rgba(124,58,237,0.35)" : "linear-gradient(145deg, #7c3aed, #5b21b6)",
                color: "#fff",
                cursor: isLoading || !searchQuery.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
                flexShrink: 0,
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "mfSpin 0.7s linear infinite",
                  }}
                />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>

          {/* Categories */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 18 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className="font-body"
                style={{
                  padding: "6px 14px",
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border:
                    selectedCategory === cat ? "1px solid hsl(var(--primary))" : "1px solid rgba(255,255,255,0.12)",
                  background:
                    selectedCategory === cat
                      ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))"
                      : "rgba(255,255,255,0.04)",
                  color: selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Recents */}
          <div style={{ marginTop: 28 }}>
            <h2
              className="font-display"
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
                margin: "0 0 14px",
                letterSpacing: "-0.02em",
              }}
            >
              Recents
            </h2>
            {recents.length === 0 ? (
              <p className="font-body" style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, margin: 0 }}>
                Search for a medication to see pharmacies here — location and phone are saved for quick access.
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {recents.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => openDirections(r)}
                      className="font-body"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        gap: 14,
                        alignItems: "flex-start",
                        padding: "14px 16px",
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        cursor: "pointer",
                        transition: "background 0.2s, border-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.borderColor = "rgba(79,142,247,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: "#fff",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#2563eb",
                          fontSize: 22,
                          fontWeight: 300,
                          lineHeight: 1,
                        }}
                      >
                        +
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#e8eef8", marginBottom: 4 }}>
                          {r.pharmacyName}
                        </div>
                        <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6 }}>
                          {r.medicineName} — {r.inStock ? "Available" : "Out of stock"}
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(148,163,184,0.95)", marginBottom: 4, lineHeight: 1.45 }}>
                          {r.address}
                        </div>
                        <div style={{ fontSize: 13, color: "#4f8ef7", fontWeight: 600 }}>
                          {r.phone !== "N/A" ? r.phone : "Phone not listed"}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Full results */}
        {hasSearched && (
          <div style={{ width: "100%", padding: "0 clamp(16px, 4vw, 32px) 80px", boxSizing: "border-box" }}>
            <div style={{ width: "100%", maxWidth: "100%", margin: 0 }}>
              {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, color: "rgba(255,255,255,0.4)" }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        border: "2.5px solid rgba(79,142,247,0.3)",
                        borderTopColor: "#4f8ef7",
                        borderRadius: "50%",
                        animation: "mfSpin 0.8s linear infinite",
                      }}
                    />
                    <span className="font-body" style={{ fontSize: 14 }}>
                      Scanning pharmacy network…
                    </span>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 24,
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div className="font-display" style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, fontWeight: 700 }}>
                        Results for &quot;{searchQuery}&quot;
                      </div>
                      <div className="font-body" style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 4 }}>
                        {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} across{" "}
                        {new Set(searchResults.map((x) => x.pharmacy.id)).size} pharmac
                        {new Set(searchResults.map((x) => x.pharmacy.id)).size !== 1 ? "ies" : "y"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="font-display"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.45)";
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
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <h3 className="font-display" style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                    No medications found
                  </h3>
                  <p className="font-body" style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginBottom: 24 }}>
                    Try different keywords or check the spelling of your search term.
                  </p>
                  <button
                    type="button"
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
