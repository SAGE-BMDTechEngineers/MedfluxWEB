"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cinematic Floating Phone  –  Three.js edition
   Dark-cosmos design system: standalone showcase component
   ───────────────────────────────────────────────────────────── */

/* ── 3-D orbital environment around the phone ── */
function OrbitalScene({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 16);

    /* Orbiting data spheres */
    const orbitData = [
      { r: 4.5, speed: 0.38, phase: 0,              y: 0.4, col: 0x4f8ef7, sz: 0.18 },
      { r: 4.5, speed: 0.38, phase: Math.PI * 2/3,  y: -0.6, col: 0x9f5cf7, sz: 0.14 },
      { r: 4.5, speed: 0.38, phase: Math.PI * 4/3,  y: 0.3, col: 0x00d4ff, sz: 0.16 },
      { r: 6.2, speed: 0.22, phase: Math.PI / 5,    y: 0.8, col: 0x5ff7c4, sz: 0.12 },
      { r: 6.2, speed: 0.22, phase: Math.PI * 7/5,  y: -0.5, col: 0xf7c14f, sz: 0.11 },
      { r: 3.0, speed: 0.55, phase: Math.PI,        y: 0.2, col: 0xf75f8e, sz: 0.10 },
    ];

    const orbitMeshes = orbitData.map(({ col, sz }) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(sz, 12, 12),
        new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.85, shininess: 110 })
      );
      scene.add(m); return m;
    });

    /* Orbit ring paths */
    [4.5, 6.2, 3.0].forEach((r, i) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.008, 4, 100),
        new THREE.MeshBasicMaterial({ color: [0x4f8ef7, 0x5ff7c4, 0xf75f8e][i], transparent: true, opacity: 0.1 })
      );
      m.rotation.x = Math.PI / 2 + (i * 0.35);
      scene.add(m);
    });

    /* Floating pill capsules */
    const pills: { m: THREE.Group; sp: number; ph: number }[] = [];
    const pilCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4];
    for (let i = 0; i < 8; i++) {
      const col = pilCols[i % 4], sc = 0.22 + Math.random() * 0.22;
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.2, shininess: 70 });
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08 * sc, 0.08 * sc, 0.3 * sc, 10), mat));
      const cT = new THREE.Mesh(new THREE.SphereGeometry(0.08 * sc, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      cT.position.y = 0.15 * sc;
      const cB = new THREE.Mesh(new THREE.SphereGeometry(0.08 * sc, 10, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat);
      cB.position.y = -0.15 * sc;
      g.add(cT, cB);
      g.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6 - 2);
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      pills.push({ m: g, sp: 0.006 + Math.random() * 0.01, ph: i * 0.9 });
      scene.add(g);
    }

    /* Star particles */
    const sg = new THREE.BufferGeometry(); const sp: number[] = [];
    for (let i = 0; i < 1800; i++) sp.push((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30 - 8);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.028, color: 0xffffff, transparent: true, opacity: 0.22 })));

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const bl = new THREE.PointLight(0x4f8ef7, 5, 30); bl.position.set(6, 4, 5); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 3.5, 25); pl.position.set(-5, -3, 4); scene.add(pl);
    const cl = new THREE.PointLight(0x00d4ff, 2.5, 22); cl.position.set(0, 7, 3); scene.add(cl);

    /* Mouse parallax */
    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    addEventListener("mousemove", onMouse);
    const onResize = () => { const W2 = el.clientWidth, H2 = el.clientHeight; renderer.setSize(W2, H2); camera.aspect = W2 / H2; camera.updateProjectionMatrix(); };
    addEventListener("resize", onResize);

    const clock = new THREE.Clock(); let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick); const t = clock.getElapsedTime();
      orbitData.forEach(({ r, speed, phase, y }, i) => {
        const angle = t * speed + phase;
        orbitMeshes[i].position.set(Math.cos(angle) * r, y + Math.sin(t * 0.4 + i) * 0.15, Math.sin(angle) * r * 0.5);
      });
      pills.forEach(({ m, sp, ph }) => { m.rotation.x += sp * 0.6; m.rotation.z += sp * 0.9; m.position.y += Math.sin(t * 0.5 + ph) * 0.003; });
      camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.04;
      camera.position.z = 16 + Math.sin(t * 0.1) * 0.6;
      camera.lookAt(0, 0, 0);
      bl.intensity = 5 + Math.sin(t * 1.1) * 1.2; pl.intensity = 3.5 + Math.cos(t * 0.85) * 0.9;
      renderer.render(scene, camera);
    };
    tick();

    return () => { cancelAnimationFrame(raf); removeEventListener("mousemove", onMouse); removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ── Floating phone CSS animation ── */
const PHONE_KEYFRAMES = `
  @keyframes phoneFloat {
    0%,100% { transform: rotateY(-28deg) rotateX(14deg) translateZ(0px) translateY(0px); }
    50%      { transform: rotateY(-28deg) rotateX(14deg) translateZ(20px) translateY(-14px); }
  }
  @keyframes screenGlow {
    0%,100% { box-shadow: 0 0 30px rgba(79,142,247,0.3), 0 0 80px rgba(79,142,247,0.12); }
    50%      { box-shadow: 0 0 50px rgba(79,142,247,0.55), 0 0 120px rgba(79,142,247,0.22); }
  }
  @keyframes statusPulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.35)} }
  @keyframes screenFade  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dotRing     { 0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0} }
`;

/* ── Phone screen content – cycles 3 states ── */
function PhoneScreen({ phase }: { phase: number }) {
  const screens = [
    /* Home */
    <div key="home" style={{ height: "100%", padding: "28px 16px 16px", display: "flex", flexDirection: "column", animation: "screenFade 0.45s ease both" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#4f8ef7", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>SLEEK</div>
        <div style={{ width: 48, height: 2, borderRadius: 1, background: "linear-gradient(90deg,#4f8ef7,#9f5cf7)", margin: "0 auto 14px" }} />
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.01em" }}>Your Pharmacy<br />In Your Pocket</div>
      </div>
      <div style={{ height: 72, borderRadius: 12, background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.2)", marginBottom: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(79,142,247,0.8)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Map View</span>
      </div>
      {[["Pain Relief","#4f8ef7"],["Antibiotics","#9f5cf7"]].map(([l,c]) => (
        <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 7 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: c as string, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{l as string}</span>
        </div>
      ))}
      <div style={{ marginTop: "auto", padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, letterSpacing: "0.04em" }}>Get Started</span>
      </div>
    </div>,

    /* Map */
    <div key="map" style={{ height: "100%", padding: "28px 0 0", animation: "screenFade 0.45s ease both" }}>
      <div style={{ padding: "0 14px 10px" }}>
        <div style={{ height: 26, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(79,142,247,0.2)", display: "flex", alignItems: "center", padding: "0 10px", gap: 6 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(79,142,247,0.7)"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Paracetamol…</span>
        </div>
      </div>
      <div style={{ height: "52%", background: "linear-gradient(135deg,#0a1a3a,#0d2040)", position: "relative", overflow: "hidden", margin: "0 0 10px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(79,142,247,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.07) 1px,transparent 1px)", backgroundSize: "14px 14px" }} />
        {[[42,35,"#4f8ef7"],[65,58,"#9f5cf7"],[28,62,"#00d4ff"],[78,30,"#5ff7c4"]].map(([x,y,c],i) => (
          <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%` }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: c as string, boxShadow: `0 0 10px ${c}` }} />
            <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1px solid ${c}`, animation: "dotRing 1.8s ease-out infinite", animationDelay: `${i * 0.4}s` }} />
          </div>
        ))}
      </div>
      <div style={{ padding: "0 12px" }}>
        {[["Raydos Pharmacy","0.3 km","#5ff7c4"],["Klan Pharmacy","0.8 km","#4f8ef7"]].map(([n,d,c]) => (
          <div key={n as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${c as string}22`, marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{n as string}</span>
            <span style={{ fontSize: 8, color: c as string, fontWeight: 700 }}>{d as string}</span>
          </div>
        ))}
      </div>
    </div>,

    /* Detail */
    <div key="detail" style={{ height: "100%", padding: "28px 14px 14px", display: "flex", flexDirection: "column", animation: "screenFade 0.45s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(79,142,247,0.14)", border: "1px solid rgba(79,142,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#4f8ef7"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Raydos Pharmacy</div>
          <div style={{ fontSize: 9, color: "rgba(79,142,247,0.8)" }}>0.3 km away · Open</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
        {[1,2,3,4,5].map(i => <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i<=4?"#f7c14f":"rgba(255,255,255,0.15)"}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>4.8</span>
      </div>
      {[["Paracetamol 500mg","₵2.50","In Stock","#5ff7c4"],["Ibuprofen 400mg","₵3.80","Low Stock","#f7c14f"]].map(([n,p,s,c]) => (
        <div key={n as string} style={{ padding: "8px 10px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.07)`, marginBottom: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{n as string}</span>
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>{p as string}</span>
          </div>
          <div style={{ marginTop: 3, fontSize: 8, color: c as string, fontWeight: 700 }}>{s as string}</div>
        </div>
      ))}
      <div style={{ marginTop: "auto", display: "flex", gap: 7 }}>
        <div style={{ flex: 1, padding: "8px 0", borderRadius: 9, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.3)", textAlign: "center" }}>
          <span style={{ fontSize: 9, color: "#4f8ef7", fontWeight: 700 }}>Directions</span>
        </div>
        <div style={{ flex: 1, padding: "8px 0", borderRadius: 9, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", textAlign: "center" }}>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>Call Now</span>
        </div>
      </div>
    </div>,
  ];

  return <>{screens[phase]}</>;
}

/* ── Floating badge ── */
function Badge({ style, accent, icon, title, sub }: { style?: React.CSSProperties; accent: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 14,
      background: "rgba(2,8,22,0.75)",
      border: `1px solid ${accent}40`,
      backdropFilter: "blur(16px)",
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accent}18`,
      ...style,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: accent }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.1, fontFamily: "'Syne',sans-serif" }}>{title}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main Example component
   ────────────────────────────────────────────────── */
export default function Example() {
  const [phase, setPhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setPhase(p => (p + 1) % 3), 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        ${PHONE_KEYFRAMES}
        @keyframes fpGlow { 0%,100%{opacity:.28}50%{opacity:.65} }
        @keyframes fpFadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fpBadgeL { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fpBadgeR { from{opacity:0;transform:translateX(16px)}  to{opacity:1;transform:translateX(0)} }
      `}</style>

      <section
        ref={containerRef}
        style={{
          position: "relative",
          background: "#020816",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          fontFamily: "'DM Sans',sans-serif",
          padding: "80px 5%",
        }}
      >
        {/* ── 3-D orbital environment ── */}
        <OrbitalScene containerRef={containerRef} />

        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(79,142,247,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.022) 1px,transparent 1px)`, backgroundSize: "64px 64px" }} />

        {/* Glows */}
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 800, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(79,142,247,.14) 0%,transparent 65%)", zIndex: 1, pointerEvents: "none", animation: "fpGlow 5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 400, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,92,247,.08) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "fpGlow 7s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", top: "20%", right: "8%", width: 350, height: 250, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(0,212,255,.06) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "fpGlow 6s ease-in-out infinite 1s" }} />

        {/* ── Main content layout ── */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 80, width: "100%", maxWidth: 1100 }}>

          {/* ── Left copy ── */}
          <div style={{ maxWidth: 400, animation: "fpFadeUp 0.9s ease both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 18px", borderRadius: 100, border: "1px solid rgba(79,142,247,.32)", background: "rgba(79,142,247,.08)", marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "statusPulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f8ef7", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>Live Preview</span>
            </div>

            <h2 style={{ fontSize: "clamp(32px,4.5vw,58px)", fontWeight: 800, fontFamily: "'Syne',sans-serif", lineHeight: 1.02, letterSpacing: "-0.032em", color: "#fff", margin: "0 0 20px" }}>
              Healthcare<br />
              <span style={{ background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>At Your Fingertips</span>
            </h2>

            <div style={{ width: 72, height: 2, borderRadius: 2, background: "linear-gradient(90deg,#4f8ef7,#9f5cf7)", marginBottom: 20 }} />

            <p style={{ fontSize: 16, fontWeight: 300, color: "rgba(255,255,255,.46)", lineHeight: 1.78, marginBottom: 40 }}>
              Find nearby pharmacies, check real-time medicine availability, and order your prescriptions — all from one beautiful app.
            </p>

            {/* Feature chips */}
            {[["Locate pharmacies instantly","#4f8ef7"],["Real-time stock updates","#9f5cf7"],["24/7 delivery tracking","#00d4ff"]].map(([label, color]) => (
              <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color as string} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>{label as string}</span>
              </div>
            ))}

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
              <button onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 14px 36px rgba(79,142,247,.45)";}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform="translateY(0)";(e.currentTarget as HTMLButtonElement).style.boxShadow="none";}}
                style={{ display:"flex",alignItems:"center",gap:8,padding:"12px 26px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"0.04em",fontFamily:"'Syne',sans-serif",transition:"all .28s ease" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store
              </button>
              <button onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(79,142,247,0.18)";(e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)";}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(79,142,247,0.06)";(e.currentTarget as HTMLButtonElement).style.transform="translateY(0)";}}
                style={{ display:"flex",alignItems:"center",gap:8,padding:"12px 26px",borderRadius:12,border:"1px solid rgba(79,142,247,.35)",background:"rgba(79,142,247,.06)",color:"#4f8ef7",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"0.04em",fontFamily:"'Syne',sans-serif",transition:"all .28s ease" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.83 1-1.3 1.66-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.66.03-1.66-.8z"/></svg>
                Play Store
              </button>
            </div>
          </div>

          {/* ── Center: 3D floating phone ── */}
          <div style={{ position: "relative", animation: "fpFadeUp 0.9s ease 0.2s both" }}>

            {/* Floating badges */}
            <div style={{ position: "absolute", top: "10%", left: "-160px", zIndex: 20, animation: "fpBadgeL 0.8s ease 0.6s both" }}>
              <Badge accent="#5ff7c4" title="In Stock" sub="124 pharmacies nearby"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="#5ff7c4"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#5ff7c4" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>} />
            </div>

            <div style={{ position: "absolute", bottom: "18%", right: "-155px", zIndex: 20, animation: "fpBadgeR 0.8s ease 0.75s both" }}>
              <Badge accent="#f7c14f" title="4.8 ★ Rating" sub="2,400+ reviews"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="#f7c14f"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>} />
            </div>

            {/* Screen indicator dots */}
            <div style={{ position: "absolute", bottom: -36, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 7, zIndex: 20 }}>
              {[0,1,2].map(i => (
                <div key={i} onClick={() => setPhase(i)} style={{ width: i === phase ? 20 : 6, height: 6, borderRadius: 3, background: i === phase ? "#4f8ef7" : "rgba(255,255,255,0.2)", transition: "all 0.4s ease", cursor: "pointer" }} />
              ))}
            </div>

            {/* 3D phone wrapper */}
            <div style={{ transformStyle: "preserve-3d", transform: "rotateY(-28deg) rotateX(14deg)" }}>
              <div style={{
                position: "relative",
                width: 220, height: 420,
                borderRadius: 36,
                background: "linear-gradient(145deg,#1a1a2e,#0f0f1a)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                boxShadow: "8px 8px 0 rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.7)",
                animation: "phoneFloat 3.5s ease-in-out infinite",
              }}>
                {/* Side edge depth */}
                <div style={{ position: "absolute", top: 4, bottom: 4, right: -5, width: 5, borderRadius: "0 4px 4px 0", background: "linear-gradient(180deg,#111,#0a0a15)", boxShadow: "2px 0 8px rgba(0,0,0,0.4)" }} />
                <div style={{ position: "absolute", top: 4, bottom: 4, left: -5, width: 5, borderRadius: "4px 0 0 4px", background: "linear-gradient(180deg,#1a1a2e,#0d0d1e)" }} />

                {/* Screen bezel */}
                <div style={{ position: "absolute", inset: 6, borderRadius: 30, overflow: "hidden", background: "#060b18", animation: "screenGlow 3.5s ease-in-out infinite" }}>

                  {/* Screen content */}
                  <div style={{ height: "100%", background: "linear-gradient(155deg,#060e22,#080a18)", overflowY: "hidden" }}>

                    {/* Status bar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px", position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, background: "linear-gradient(to bottom,rgba(6,11,24,0.95),transparent)" }}>
                      {/* Dynamic island */}
                      <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 80, height: 22, borderRadius: 11, background: "#000", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} />
                        <div style={{ width: 12, height: 5, borderRadius: 3, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} />
                      </div>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginLeft: 4 }}>9:41</span>
                      <div style={{ display: "flex", gap: 4, alignItems: "center", marginRight: 4 }}>
                        <svg width="11" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                        <svg width="11" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/></svg>
                      </div>
                    </div>

                    {/* App content */}
                    <div style={{ paddingTop: 38, height: "100%" }}>
                      <PhoneScreen phase={phase} />
                    </div>
                  </div>
                </div>

                {/* Home indicator */}
                <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 48, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
              </div>
            </div>

            {/* Ground reflection */}
            <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 160, height: 40, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(79,142,247,0.28) 0%,transparent 70%)", filter: "blur(12px)", pointerEvents: "none" }} />
          </div>
        </div>
      </section>
    </>
  );
}