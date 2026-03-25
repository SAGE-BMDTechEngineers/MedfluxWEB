"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { serverUrl } from "@/components/config";

/* ─────────────────────────────────────────────────────────────
   Cinematic Medication Finder  –  Three.js edition
   Dark-cosmos design system: complete page suite
   ───────────────────────────────────────────────────────────── */

interface Pharmacy {
  id: string; name: string; address: string; phone: string;
  email?: string; latitude?: number; longitude?: number;
  rating?: number; delivery_available?: boolean;
  operating_hours?: string; is_verified?: boolean; distance?: string;
}
interface Medicine { id: string; name: string; price: number; category?: string; }
interface PharmacyMedicine {
  pharmacy: Pharmacy; medicine: Medicine;
  in_stock: boolean; quantity_available?: number; last_updated?: string;
}

const CATEGORIES = ["all","Pain Relief","Antibiotics","Vitamins","Allergy","Cold & Flu","Digestive Health","Skin Care","Other"];

/* ── 3-D background: floating pill capsules + network nodes ── */
function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020816, 0.025);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 20);

    const cols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];

    /* Pills */
    const pills: { m: THREE.Group; sp: number; ph: number; vy: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const col = cols[i % 6], sc = 0.35 + Math.random() * 0.5;
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.16 + Math.random() * 0.14, shininess: 90 });
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1 * sc, 0.1 * sc, 0.38 * sc, 12), mat));
      const cT = new THREE.Mesh(new THREE.SphereGeometry(0.1 * sc, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      cT.position.y = 0.19 * sc;
      const cB = new THREE.Mesh(new THREE.SphereGeometry(0.1 * sc, 12, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat);
      cB.position.y = -0.19 * sc;
      g.add(cT, cB);
      g.position.set((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 28, (Math.random() - 0.5) * 16 - 5);
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      pills.push({ m: g, sp: 0.003 + Math.random() * 0.006, ph: i * 0.7, vy: (Math.random() - 0.5) * 0.003 });
      scene.add(g);
    }

    /* Cross / plus shapes */
    const crosses: { m: THREE.Group; sp: number; ax: THREE.Vector3 }[] = [];
    for (let i = 0; i < 14; i++) {
      const col = cols[i % 6], sc = 0.5 + Math.random() * 0.7;
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.1 + Math.random() * 0.1, shininess: 60 });
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6 * sc, 0.16 * sc, 0.08 * sc), mat));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.16 * sc, 0.6 * sc, 0.08 * sc), mat));
      g.position.set((Math.random() - 0.5) * 48, (Math.random() - 0.5) * 32, (Math.random() - 0.5) * 18 - 5);
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      crosses.push({ m: g, sp: 0.003 + Math.random() * 0.007, ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() });
      scene.add(g);
    }

    /* Torus rings */
    const rings: THREE.Mesh[] = [];
    [[10, 0.012, 0x4f8ef7, 0.08], [14, 0.007, 0x9f5cf7, 0.055], [7, 0.016, 0x00d4ff, 0.1]].forEach(([r, t, c, o]) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r as number, t as number, 6, 100), new THREE.MeshBasicMaterial({ color: c as number, transparent: true, opacity: o as number }));
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0); m.position.z = -12;
      rings.push(m); scene.add(m);
    });

    /* Stars */
    const sg = new THREE.BufferGeometry(); const sp: number[] = [];
    for (let i = 0; i < 2600; i++) sp.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 45 - 14);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.024, color: 0xffffff, transparent: true, opacity: 0.18 })));

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const bl = new THREE.PointLight(0x4f8ef7, 4, 55); bl.position.set(8, 5, 7); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 45); pl.position.set(-8, -4, 5); scene.add(pl);
    scene.add(new THREE.PointLight(0x00d4ff, 2, 35)).position.set(0, 9, 4);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => { mouse.x = (e.clientX / innerWidth - 0.5) * 2; mouse.y = -(e.clientY / innerHeight - 0.5) * 2; };
    addEventListener("mousemove", onMouse);
    const onResize = () => { const W2 = el.clientWidth, H2 = el.clientHeight; renderer.setSize(W2, H2); camera.aspect = W2 / H2; camera.updateProjectionMatrix(); };
    addEventListener("resize", onResize);

    const clock = new THREE.Clock(); let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      pills.forEach(({ m, sp, ph }) => { m.rotation.x += sp * 0.6; m.rotation.z += sp * 0.9; m.position.y += Math.sin(t * 0.5 + ph) * 0.003; });
      crosses.forEach(({ m, sp, ax }) => m.rotateOnAxis(ax, sp));
      rings[0].rotation.z += 0.004; rings[1].rotation.y += 0.003; rings[2].rotation.x += 0.005;
      camera.position.x += (mouse.x * 0.7 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.45 - camera.position.y) * 0.025;
      camera.position.z = 20 + Math.sin(t * 0.1) * 0.8;
      camera.lookAt(0, 0, 0);
      bl.intensity = 3.5 + Math.sin(t * 1.0) * 1.0; pl.intensity = 2.2 + Math.cos(t * 0.8) * 0.7;
      renderer.render(scene, camera);
    };
    tick();

    return () => { cancelAnimationFrame(raf); removeEventListener("mousemove", onMouse); removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ── Result card ── */
function ResultCard({ result, index }: { result: PharmacyMedicine; index: number }) {
  const [hov, setHov] = useState(false);
  const accent = ["#4f8ef7", "#9f5cf7", "#00d4ff", "#5ff7c4"][index % 4];

  const handleDirections = () => {
    const params = new URLSearchParams({ name: result.pharmacy.name, address: result.pharmacy.address });
    if (result.pharmacy.phone) params.append("phone", result.pharmacy.phone);
    if (result.pharmacy.rating) params.append("rating", result.pharmacy.rating.toString());
    if (result.pharmacy.latitude !== undefined) params.append("lat", result.pharmacy.latitude.toString());
    if (result.pharmacy.longitude !== undefined) params.append("lng", result.pharmacy.longitude.toString());
    window.location.href = `/directions?${params.toString()}`;
  };
  const handleCall = () => { if (result.in_stock && result.pharmacy.phone !== "N/A") window.location.href = `tel:${result.pharmacy.phone.replace(/[^\d+]/g, "")}`; };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", padding: "28px 30px", borderRadius: 20,
        border: `1px solid ${hov ? accent + "50" : "rgba(255,255,255,0.07)"}`,
        background: hov ? `linear-gradient(145deg,rgba(255,255,255,0.05),${accent}0d)` : "rgba(255,255,255,0.025)",
        backdropFilter: "blur(18px)", overflow: "hidden",
        transition: "all 0.35s ease",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? `0 20px 60px ${accent}18` : "none",
        animation: `mfCardIn 0.55s ease ${index * 0.07}s both`,
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${accent},transparent)`, opacity: hov ? 1 : 0.3, transition: "opacity 0.35s" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 28 }}>
        {/* Medicine info */}
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${accent}18`, border: `1px solid ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "transform 0.3s, box-shadow 0.3s", transform: hov ? "scale(1.1) rotate(6deg)" : "scale(1)", boxShadow: hov ? `0 0 20px ${accent}45` : "none" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/><circle cx="18" cy="18" r="3"/><path d="m22 22-1.5-1.5"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 6 }}>{result.medicine.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: `${accent}18`, border: `1px solid ${accent}30` }}>{result.medicine.category ?? "General"}</span>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.025em", marginBottom: 10 }}>₵{result.medicine.price.toFixed(2)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, background: result.in_stock ? "rgba(95,247,196,0.15)" : "rgba(247,95,142,0.15)", color: result.in_stock ? "#5ff7c4" : "#f75f8e", border: `1px solid ${result.in_stock ? "#5ff7c430" : "#f75f8e30"}` }}>{result.in_stock ? "In Stock" : "Out of Stock"}</span>
            {result.in_stock && result.quantity_available && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>{result.quantity_available} available</span>}
          </div>
        </div>

        {/* Pharmacy info */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.015em" }}>{result.pharmacy.name}</div>
            {result.pharmacy.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 100, background: "rgba(247,193,79,0.12)", border: "1px solid rgba(247,193,79,0.25)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f7c14f"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f7c14f" }}>{result.pharmacy.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {[
              { icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", label: result.pharmacy.address },
              { icon: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z", label: result.pharmacy.phone },
              { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z", label: result.pharmacy.operating_hours ?? "Hours not specified" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d={item.icon} /></svg>
                {item.label}
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {result.pharmacy.is_verified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "#4f8ef7", padding: "4px 11px", borderRadius: 100, border: "1px solid rgba(79,142,247,0.3)", background: "rgba(79,142,247,0.08)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verified
              </span>
            )}
            {result.pharmacy.delivery_available && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "#00d4ff", padding: "4px 11px", borderRadius: 100, border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.08)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" /></svg>
                Delivery
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleDirections} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${accent}55`; (e.currentTarget as HTMLButtonElement).style.color = accent; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.25s", fontFamily: "'Syne',sans-serif" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              Directions
            </button>
            <button onClick={handleCall} disabled={!result.in_stock || result.pharmacy.phone === "N/A"}
              onMouseEnter={e => { if (result.in_stock && result.pharmacy.phone !== "N/A") { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 28px ${accent}40`; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: result.in_stock && result.pharmacy.phone !== "N/A" ? `linear-gradient(135deg,${accent},${accent}cc)` : "rgba(255,255,255,0.08)", color: result.in_stock && result.pharmacy.phone !== "N/A" ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 13, fontWeight: 600, cursor: result.in_stock && result.pharmacy.phone !== "N/A" ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.25s", fontFamily: "'Syne',sans-serif" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
              {result.in_stock ? (result.pharmacy.phone !== "N/A" ? "Call Pharmacy" : "No Phone") : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>

      {/* Corner glow */}
      <div style={{ position: "absolute", bottom: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${accent}20 0%,transparent 70%)`, opacity: hov ? 1 : 0.3, transition: "opacity 0.35s", pointerEvents: "none" }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────── */
export default function MedicationFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PharmacyMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true); setHasSearched(true);
    try {
      const res = await fetch(`${serverUrl}/pharmacy/search-pharmacy-medicine?term=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const results: PharmacyMedicine[] = data.map((item: any) => ({
        pharmacy: { id: String(item.pharmacy_id), name: item.pharmacy_name, address: item.pharmacy_location, phone: item.pharmacy_phone ?? "N/A", email: item.pharmacy_email, rating: item.pharmacy_ratings ? parseFloat(item.pharmacy_ratings) : undefined, is_verified: true },
        medicine: { id: String(item.medication_id), name: item.medication_name, price: parseFloat(item.price), category: item.category },
        in_stock: item.quantity > 0, quantity_available: item.quantity, last_updated: new Date().toISOString(),
      }));
      setSearchResults(selectedCategory === "all" ? results : results.filter(r => r.medicine.category?.toLowerCase() === selectedCategory.toLowerCase()));
    } catch { setSearchResults([]); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes mfFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mfGlow{0%,100%{opacity:.28}50%{opacity:.65}}
        @keyframes mfDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.5}}
        @keyframes mfCardIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mfSpin{to{transform:rotate(360deg)}}
        @keyframes mfLineExp{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes mfPulse{0%,100%{box-shadow:0 0 0 0 rgba(79,142,247,0.4)}50%{box-shadow:0 0 0 8px rgba(79,142,247,0)}}
      `}} />

      <div style={{ background: "#020816", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", paddingTop: 80 }}>

        {/* ── HERO / SEARCH SECTION ── */}
        <section style={{ position: "relative", padding: "80px 0 90px", overflow: "hidden" }}>
          <ThreeBackground />

          {/* Grid + scanlines */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(79,142,247,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.028) 1px,transparent 1px)`, backgroundSize: "64px 64px" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px)" }} />

          {/* Glows */}
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 1000, height: 340, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(79,142,247,.12) 0%,transparent 68%)", zIndex: 1, pointerEvents: "none", animation: "mfGlow 5s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: -40, right: "8%", width: 500, height: 260, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,92,247,.08) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "mfGlow 7s ease-in-out infinite 2s" }} />

          <div style={{ position: "relative", zIndex: 10, maxWidth: 760, margin: "0 auto", padding: "0 5%", textAlign: "center" }}>
            {/* Eyebrow */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 18px", borderRadius: 100, border: "1px solid rgba(79,142,247,.32)", background: "rgba(79,142,247,.08)", marginBottom: 28, animation: "mfFadeUp .7s ease both" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "mfDot 2.2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f8ef7", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>Pharmacy Network</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: "clamp(36px,5.5vw,68px)", fontWeight: 800, fontFamily: "'Syne',sans-serif", lineHeight: 1.0, letterSpacing: "-0.034em", margin: "0 0 20px", animation: "mfFadeUp .85s ease .1s both" }}>
              <span style={{ color: "#ffffff" }}>Find Your</span><br />
              <span style={{ background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Medications Quickly</span>
            </h1>

            {/* Divider */}
            <div style={{ width: 72, height: 2, borderRadius: 2, background: "linear-gradient(90deg,#4f8ef7,#9f5cf7)", margin: "0 auto 22px", animation: "mfLineExp .9s ease .25s both", transformOrigin: "center" }} />

            <p style={{ fontSize: 17, fontWeight: 300, color: "rgba(255,255,255,.47)", lineHeight: 1.78, margin: "0 auto 52px", maxWidth: 520, animation: "mfFadeUp .9s ease .2s both" }}>
              Search for medications and discover which nearby pharmacies have them in stock — in real time.
            </p>

            {/* Search bar */}
            <div style={{ animation: "mfFadeUp 1s ease .35s both" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(79,142,247,0.7)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                  <input
                    type="text"
                    placeholder="Search medications — Paracetamol, Ibuprofen, Vitamin D…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    style={{ width: "100%", padding: "15px 16px 15px 48px", borderRadius: 14, border: "1px solid rgba(79,142,247,0.35)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 15, outline: "none", backdropFilter: "blur(14px)", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.3s, box-shadow 0.3s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,0.7)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.12)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,0.35)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  onMouseEnter={e => { if (!isLoading && searchQuery.trim()) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(79,142,247,0.45)"; }}}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                  style={{ padding: "0 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: isLoading || !searchQuery.trim() ? "not-allowed" : "pointer", opacity: !searchQuery.trim() ? 0.5 : 1, transition: "all 0.28s ease", fontFamily: "'Syne',sans-serif", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}
                >
                  {isLoading ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "mfSpin 0.8s linear infinite" }} /> Searching</> : <>Search →</>}
                </button>
              </div>

              {/* Category filters */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)" style={{ marginTop: 6, flexShrink: 0 }}><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z" /></svg>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    style={{ padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.25s", border: selectedCategory === cat ? "1px solid #4f8ef7" : "1px solid rgba(255,255,255,0.12)", background: selectedCategory === cat ? "linear-gradient(135deg,#4f8ef7,#7c3aed)" : "rgba(255,255,255,0.04)", color: selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}
                  >{cat === "all" ? "All Categories" : cat}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── RESULTS SECTION ── */}
        {hasSearched && (
          <section style={{ position: "relative", padding: "60px 0 100px", background: "#020816" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(79,142,247,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.02) 1px,transparent 1px)`, backgroundSize: "64px 64px" }} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 32px", borderRadius: 100, border: "1px solid rgba(79,142,247,0.3)", background: "rgba(79,142,247,0.06)", backdropFilter: "blur(14px)" }}>
                    <div style={{ width: 18, height: 18, border: "2px solid rgba(79,142,247,0.3)", borderTopColor: "#4f8ef7", borderRadius: "50%", animation: "mfSpin 0.8s linear infinite" }} />
                    <span style={{ fontSize: 14, color: "#4f8ef7", fontWeight: 600, letterSpacing: "0.06em" }}>Scanning pharmacy network…</span>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {/* Results header */}
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
                    <div>
                      <h3 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, fontFamily: "'Syne',sans-serif", letterSpacing: "-0.025em", margin: "0 0 8px", color: "#fff" }}>
                        Results for <span style={{ background: "linear-gradient(135deg,#4f8ef7,#9f5cf7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>"{searchQuery}"</span>
                      </h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
                        {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} across {new Set(searchResults.map(r => r.pharmacy.id)).size} pharmac{new Set(searchResults.map(r => r.pharmacy.id)).size !== 1 ? "ies" : "y"}
                      </p>
                    </div>
                    <button onClick={() => { setSearchQuery(""); setSearchResults([]); setHasSearched(false); }}
                      style={{ padding: "9px 22px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.25s", fontFamily: "'Syne',sans-serif" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.28)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)"; }}
                    >Clear ✕</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {searchResults.map((result, i) => <ResultCard key={`${result.pharmacy.id}-${result.medicine.id}-${i}`} result={result} index={i} />)}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "mfPulse 2.5s ease-in-out infinite" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(79,142,247,0.7)"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: 12 }}>No medications found</h3>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 28, maxWidth: 360, margin: "0 auto 28px" }}>Try different keywords or check the spelling of your search term.</p>
                  <button onClick={() => { setSearchQuery(""); setSearchResults([]); setHasSearched(false); }}
                    style={{ padding: "12px 32px", borderRadius: 13, border: "1px solid rgba(79,142,247,0.35)", background: "rgba(79,142,247,0.08)", color: "#4f8ef7", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.25s", fontFamily: "'Syne',sans-serif" }}
                  >Clear Search</button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}