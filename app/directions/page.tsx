"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Star, Navigation, Clock, Ruler, ExternalLink } from "lucide-react";
import { Navigatr } from "@navigatr/web";

/* ─────────────────────────────────────────────────────────────
   Cinematic Directions Page  –  Navigatr SDK edition
   Dark-cosmos design system: interactive map + routing
   ───────────────────────────────────────────────────────────── */

export default function DirectionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [navigatr, setNavigatr] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Pharmacy data from URL
  const pharmacyName = searchParams.get("name") || "Pharmacy";
  const address = searchParams.get("address") || "";
  const phone = searchParams.get("phone") || "";
  const rating = searchParams.get("rating") || "";
  const destLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : 5.6037;
  const destLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : -0.1870;

  useEffect(() => {
    // Initialize Navigatr
    const nav = new Navigatr();
    setNavigatr(nav);

    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Location access denied. Please enable GPS for routing.");
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigatr || !mapContainerRef.current) return;

    // Create map
    const mapInstance = navigatr.map({
      container: mapContainerRef.current,
      center: { lat: destLat, lng: destLng },
      zoom: 14,
      pitch: 45,
    });
    
    // Set map style to dark to match the cosmos theme
    navigatr.setStyleFromPreset('dark', {
      polyline: { color: '#4f8ef7', weight: 6, opacity: 0.8 }
    });

    setMap(mapInstance);

    // Add destination marker
    mapInstance.addMarker({
      lat: destLat,
      lng: destLng,
      label: pharmacyName,
      iconHtml: `<div style="width: 24px; height: 24px; background: #4f8ef7; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 15px #4f8ef7; display: flex; alignItems: center; justifyContent: center; color: white; font-size: 12px;">🏥</div>`
    });

    return () => {
      // Cleanup if needed (SDK might not have an explicit destroy, but we remove the ref)
    };
  }, [navigatr, destLat, destLng, pharmacyName]);

  useEffect(() => {
    if (!map || !userLocation || !navigatr) return;

    const getRoute = async () => {
      try {
        const route = await navigatr.route({
          origin: userLocation,
          destination: { lat: destLat, lng: destLng },
          maneuvers: true
        });

        setRouteData(route);
        
        // Draw route on map
        map.drawRoute(route.polyline);
        map.fitRoute(route.polyline);
        
        // Add user marker
        map.addMarker({
          lat: userLocation.lat,
          lng: userLocation.lng,
          label: 'Your Location',
          iconHtml: `<div style="width: 18px; height: 18px; background: #00d4ff; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 10px #00d4ff;"></div>`
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Routing error:", err);
        setError("Could not calculate route. Using destination view.");
        setIsLoading(false);
      }
    };

    getRoute();
  }, [map, userLocation, navigatr, destLat, destLng]);

  const handleCall = () => {
    if (phone && phone !== "N/A") {
      window.location.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
    }
  };

  const handleOpenExternal = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`, "_blank");
  };

  return (
    <div style={{ background: "#020816", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── HEADER ── */}
      <header style={{ 
        position: "sticky", top: 0, zIndex: 100, 
        background: "rgba(2, 8, 22, 0.8)", backdropFilter: "blur(16px)", 
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "16px 24px"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button 
            onClick={() => router.back()}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, 
              background: "none", border: "none", color: "rgba(255, 255, 255, 0.6)", 
              cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "color 0.2s" 
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
          >
            <ArrowLeft size={18} />
            Back to Search
          </button>
          
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0, fontFamily: "'Syne', sans-serif" }}>{pharmacyName}</h1>
            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", margin: 0 }}>{address}</p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>
        {/* ── LEFT: MAP ── */}
        <div style={{ position: "relative", height: "calc(100vh - 160px)", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)", background: "#060b18" }}>
          <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
          
          {isLoading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(2, 8, 22, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "40px", height: "40px", border: "3px solid rgba(79, 142, 247, 0.2)", borderTopColor: "#4f8ef7", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ fontSize: "14px", color: "#4f8ef7", fontWeight: 600 }}>Calculating Route...</p>
              </div>
            </div>
          )}

          {error && (
            <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px", background: "rgba(247, 95, 142, 0.15)", border: "1px solid rgba(247, 95, 142, 0.3)", padding: "12px 16px", borderRadius: "12px", backdropFilter: "blur(8px)", color: "#f75f8e", fontSize: "13px", zIndex: 20 }}>
              {error}
            </div>
          )}
        </div>

        {/* ── RIGHT: INFO & STEPS ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Stats Card */}
          {routeData && (
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "20px", borderRadius: "20px", backdropFilter: "blur(12px)" }}>
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255, 255, 255, 0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    <Clock size={12} /> Duration
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#4f8ef7" }}>{routeData.durationText}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255, 255, 255, 0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    <Ruler size={12} /> Distance
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#00d4ff" }}>{routeData.distanceText}</div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button onClick={handleOpenExternal} style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #4f8ef7, #7c3aed)", border: "none", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  <ExternalLink size={16} /> Open External Maps
                </button>
                {phone && (
                  <button onClick={handleCall} style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(79, 142, 247, 0.08)", border: "1px solid rgba(79, 142, 247, 0.3)", color: "#4f8ef7", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Phone size={16} /> Call Pharmacy
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Directions List */}
          <div style={{ flex: 1, overflowY: "auto", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "20px", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "14px", fontWeight: 700, color: "rgba(255, 255, 255, 0.8)" }}>
              Navigation Steps
            </div>
            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {routeData?.maneuvers ? (
                routeData.maneuvers.map((step: any, i: number) => (
                  <div key={i} style={{ padding: "12px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", gap: "12px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(79, 142, 247, 0.1)", color: "#4f8ef7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", lineHeight: "1.4" }}>
                      {step.instruction}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255, 255, 255, 0.3)", fontSize: "13px" }}>
                  <Navigation size={32} style={{ marginBottom: "12px", opacity: 0.2 }} />
                  {isLoading ? "Generating path..." : "No step-by-step data available."}
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}} />
    </div>
  );
}
 