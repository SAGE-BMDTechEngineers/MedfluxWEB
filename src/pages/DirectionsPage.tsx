import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ThreeBackground from "@/components/ThreeBackground";
import { GOOGLE_MAPS_API_KEY } from "@/components/config";

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export default function DirectionsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const pharmacyName = searchParams.get("name") || "Pharmacy";
  const pharmacyAddress = searchParams.get("address") || "";
  const pharmacyPhone = searchParams.get("phone") || "";
  const pharmacyRating = searchParams.get("rating");
  const destLat = parseFloat(searchParams.get("lat") || "0");
  const destLng = parseFloat(searchParams.get("lng") || "0");
  const hasCoords = destLat !== 0 || destLng !== 0;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 5.6037, lng: -0.1870 }) // Default: Accra
    );
  }, []);

  useEffect(() => {
    if (!userLocation || !hasCoords) return;
    if (GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
      setMapError("Google Maps API key not configured. Update src/components/config.ts with your API key.");
      return;
    }

    const loadMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 14,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0a0f1e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#6b7db3" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f1e" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#141c33" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1d2847" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#060d1e" }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0e1528" }] },
        ],
        disableDefaultUI: true,
        zoomControl: true,
      });

      // User marker
      new window.google.maps.Marker({
        position: userLocation,
        map,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4f8ef7",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      // Pharmacy marker
      const dest = { lat: destLat, lng: destLng };
      new window.google.maps.Marker({
        position: dest,
        map,
        title: pharmacyName,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#5ff7c4",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      // Directions
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4f8ef7",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });

      directionsService.route(
        {
          origin: userLocation,
          destination: dest,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setEta(leg.duration?.text || null);
              setDistance(leg.distance?.text || null);
            }
          }
        }
      );
    };

    if (window.google) {
      loadMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = loadMap;
      document.head.appendChild(script);
    }
  }, [userLocation, hasCoords, destLat, destLng, pharmacyName]);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }} className="bg-background">
      <ThreeBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div
          className="glass-surface"
          style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            onClick={() => navigate("/")}
            className="font-display"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>

          <div className="font-display" style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, fontWeight: 700 }}>
            {pharmacyName}
          </div>

          <div style={{ width: 100 }} />
        </div>

        {/* Map area */}
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
          {mapError ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(247,95,142,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f75f8e" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="font-body" style={{ color: "rgba(255,255,255,0.5)", maxWidth: 400, textAlign: "center", fontSize: 14 }}>
                {mapError}
              </p>
            </div>
          ) : !userLocation ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.4)" }}>
                <div style={{ width: 20, height: 20, border: "2px solid #4f8ef7", borderTopColor: "transparent", borderRadius: "50%", animation: "mfSpin 0.8s linear infinite" }} />
                <span className="font-body" style={{ fontSize: 14 }}>Getting your location...</span>
              </div>
            </div>
          ) : (
            <>
              <div ref={mapRef} style={{ flex: 1, minHeight: 0 }} />

              {/* Info panel */}
              <div
                className="glass-surface"
                style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div className="font-display" style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                      {pharmacyName}
                    </div>
                    <div className="font-body" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                      {pharmacyAddress}
                    </div>
                    {pharmacyRating && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, color: "#f7c14f", fontSize: 13 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#f7c14f"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        {pharmacyRating}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 24 }}>
                    {eta && (
                      <div style={{ textAlign: "center" }}>
                        <div className="font-display" style={{ color: "#4f8ef7", fontSize: 20, fontWeight: 800 }}>{eta}</div>
                        <div className="font-body" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>ETA</div>
                      </div>
                    )}
                    {distance && (
                      <div style={{ textAlign: "center" }}>
                        <div className="font-display" style={{ color: "#5ff7c4", fontSize: 20, fontWeight: 800 }}>{distance}</div>
                        <div className="font-body" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>Distance</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    {pharmacyPhone && pharmacyPhone !== "N/A" && (
                      <a
                        href={`tel:${pharmacyPhone.replace(/[^\d+]/g, "")}`}
                        className="font-display"
                        style={{
                          padding: "10px 24px",
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #4f8ef7, #7c3aed)",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                        Call
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display"
                      style={{
                        padding: "10px 24px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                      Open in Maps
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
