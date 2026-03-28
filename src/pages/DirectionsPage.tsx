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

const ACCRA = { lat: 5.6037, lng: -0.187 };

/** Pharmacy pin — visible destination on the map */
const PHARMACY_PIN_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
    <path fill="#5ff7c4" stroke="#0f172a" stroke-width="1.4" d="M22 2C12.06 2 4 10.06 4 20c0 14 18 34 18 34s18-20 18-34C40 10.06 31.94 2 22 2z"/>
    <circle cx="22" cy="20" r="6" fill="#0f172a"/>
    <path stroke="#0f172a" stroke-width="2" stroke-linecap="round" d="M22 12v-2"/>
  </svg>`);

function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export default function DirectionsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const mapReadyRef = useRef(false);
  const lastRouteRefreshRef = useRef<{ lat: number; lng: number; t: number } | null>(null);
  const destRef = useRef<google.maps.LatLngLiteral | null>(null);

  const [mapBootstrapped, setMapBootstrapped] = useState(false);
  const [liveTracking, setLiveTracking] = useState(false);
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
  const destination = hasCoords ? { lat: destLat, lng: destLng } : null;

  useEffect(() => {
    if (!hasCoords || !destination) return;
    destRef.current = destination;

    if (GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
      setMapError("Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in your environment.");
      return;
    }

    let cancelled = false;

    const loadGoogle = (): Promise<void> =>
      new Promise((resolve) => {
        if (window.google) {
          resolve();
          return;
        }
        window.initMap = () => resolve();
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      });

    const refreshWalkingRoute = (origin: { lat: number; lng: number }) => {
      const map = mapInstanceRef.current;
      const ds = directionsServiceRef.current;
      const dr = directionsRendererRef.current;
      const dest = destRef.current;
      if (!map || !ds || !dr || !dest) return;

      ds.route(
        {
          origin,
          destination: dest,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (cancelled) return;
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            dr.setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setEta(leg.duration?.text || null);
              setDistance(leg.distance?.text || null);
            }
          }
        }
      );
    };

    const maybeRefreshRoute = (loc: { lat: number; lng: number }) => {
      const last = lastRouteRefreshRef.current;
      const now = Date.now();
      const moved = last ? haversineM(loc, { lat: last.lat, lng: last.lng }) : 1e6;
      if (!last || moved > 75 || now - last.t > 50000) {
        lastRouteRefreshRef.current = { lat: loc.lat, lng: loc.lng, t: now };
        refreshWalkingRoute(loc);
      }
    };

    const initMapWithOrigin = (origin: { lat: number; lng: number }) => {
      if (!mapRef.current || !window.google || mapReadyRef.current || cancelled) return;
      mapReadyRef.current = true;

      const dest = destRef.current!;
      const map = new window.google.maps.Map(mapRef.current, {
        center: origin,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: "greedy",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0a0f1e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#6b7db3" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f1e" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#141c33" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1d2847" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#060d1e" }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0e1528" }] },
        ],
      });
      mapInstanceRef.current = map;

      destMarkerRef.current = new window.google.maps.Marker({
        position: dest,
        map,
        title: pharmacyName,
        zIndex: 3,
        icon: {
          url: PHARMACY_PIN_SVG,
          scaledSize: new window.google.maps.Size(44, 56),
          anchor: new window.google.maps.Point(22, 54),
        },
      });

      userMarkerRef.current = new window.google.maps.Marker({
        position: origin,
        map,
        title: "You (live)",
        zIndex: 4,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: "#4f8ef7",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 1.5,
          rotation: 0,
        },
      });

      const directionsService = new window.google.maps.DirectionsService();
      directionsServiceRef.current = directionsService;
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4f8ef7",
          strokeWeight: 5,
          strokeOpacity: 0.85,
        },
      });
      directionsRendererRef.current = directionsRenderer;

      refreshWalkingRoute(origin);
      setMapBootstrapped(true);
    };

    const updateUserMarker = (pos: GeolocationPosition) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const heading = pos.coords.heading;
      const marker = userMarkerRef.current;

      if (marker) {
        marker.setPosition(loc);
        if (heading != null && !Number.isNaN(heading)) {
          marker.setIcon({
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: "#4f8ef7",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 1.5,
            rotation: heading,
          });
        }
      }

      const map = mapInstanceRef.current;
      if (map) {
        const c = map.getCenter();
        if (c) {
          const d = haversineM(loc, { lat: c.lat() ?? loc.lat, lng: c.lng() ?? loc.lng });
          if (d > 25) map.panTo(loc);
        }
      }

      if (mapReadyRef.current) maybeRefreshRoute(loc);
    };

    (async () => {
      await loadGoogle();
      if (cancelled || !mapRef.current) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          initMapWithOrigin(origin);
        },
        () => {
          if (cancelled) return;
          initMapWithOrigin(ACCRA);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (cancelled) return;
          setLiveTracking(true);
          if (!mapReadyRef.current) {
            initMapWithOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
          updateUserMarker(pos);
        },
        () => setLiveTracking(false),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      );
      watchIdRef.current = watchId;
    })();

    return () => {
      cancelled = true;
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      mapReadyRef.current = false;
      userMarkerRef.current = null;
      destMarkerRef.current = null;
      mapInstanceRef.current = null;
      directionsRendererRef.current = null;
      directionsServiceRef.current = null;
      lastRouteRefreshRef.current = null;
    };
  }, [hasCoords, destLat, destLng, pharmacyName]);

  const mapsWalkingUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;

  return (
    <div style={{ minHeight: "100vh", position: "relative" }} className="bg-background">
      <ThreeBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
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
            type="button"
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

        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
          {!hasCoords ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <p className="font-body" style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: 360 }}>
                Directions need a pharmacy location. Open directions again from a search result that includes a map pin.
              </p>
            </div>
          ) : mapError ? (
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
          ) : (
            <>
              <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                {!mapBootstrapped && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(2,8,22,0.75)",
                      gap: 12,
                    }}
                  >
                    <div style={{ width: 22, height: 22, border: "2px solid #4f8ef7", borderTopColor: "transparent", borderRadius: "50%", animation: "mfSpin 0.8s linear infinite" }} />
                    <span className="font-body" style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Starting map & walking route…</span>
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    right: 12,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="font-body"
                    style={{
                      pointerEvents: "auto",
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: "rgba(2,8,22,0.82)",
                      border: "1px solid rgba(95,247,196,0.35)",
                      color: "#5ff7c4",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Destination: pin on map · Walking directions
                  </div>
                  {liveTracking && (
                    <div
                      className="font-body"
                      style={{
                        pointerEvents: "auto",
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: "rgba(2,8,22,0.82)",
                        border: "1px solid rgba(79,142,247,0.4)",
                        color: "#4f8ef7",
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#4f8ef7",
                          boxShadow: "0 0 0 0 rgba(79,142,247,0.6)",
                          animation: "mfPulse 1.8s ease infinite",
                        }}
                      />
                      Live location (walk) — arrow points your heading when available
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-surface" style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
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
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#f7c14f">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {pharmacyRating}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 24 }}>
                    {eta && (
                      <div style={{ textAlign: "center" }}>
                        <div className="font-display" style={{ color: "#4f8ef7", fontSize: 20, fontWeight: 800 }}>
                          {eta}
                        </div>
                        <div className="font-body" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                          Walk time
                        </div>
                      </div>
                    )}
                    {distance && (
                      <div style={{ textAlign: "center" }}>
                        <div className="font-display" style={{ color: "#5ff7c4", fontSize: 20, fontWeight: 800 }}>
                          {distance}
                        </div>
                        <div className="font-body" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                          Walking distance
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                        Call
                      </a>
                    )}
                    <a
                      href={mapsWalkingUrl}
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
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
