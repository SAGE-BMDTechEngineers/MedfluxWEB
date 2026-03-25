"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cinematic About Section Two  –  Three.js edition
   Dark-cosmos design system: Hero / Features / Video / Brands / AboutOne
   ───────────────────────────────────────────────────────────── */

/* ── 3-D background: data-stream ribbons + globe wireframe ── */
function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020816, 0.028);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 180);
    camera.position.set(0, 0, 18);

    /* ── Wireframe globe (left side, behind image) ── */
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0x4f8ef7, wireframe: true, transparent: true, opacity: 0.08 })
    );
    globe.position.set(-5, 0, -3);
    scene.add(globe);

    // Latitude/longitude highlight rings on globe
    [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2].forEach((angle, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(4.2, 0.012, 4, 80),
        new THREE.MeshBasicMaterial({ color: [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4][i], transparent: true, opacity: 0.18 })
      );
      ring.rotation.x = angle;
      ring.position.set(-5, 0, -3);
      scene.add(ring);
    });

    /* ── Location pin spikes on globe ── */
    const pinCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f];
    const pinAngles = [
      [0.6, 0.8], [1.2, 2.1], [0.4, -1.2], [1.5, 0.3], [0.9, -2.5],
    ];
    pinAngles.forEach(([phi, theta], i) => {
      const r = 4.2;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.45, 6),
        new THREE.MeshPhongMaterial({ color: pinCols[i], transparent: true, opacity: 0.85, shininess: 80 })
      );
      spike.position.set(x - 5, y, z - 3);
      spike.lookAt(new THREE.Vector3(-5, 0, -3));
      spike.rotateX(Math.PI / 2);
      scene.add(spike);

      // Pulse ring at pin base
      const pring = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.012, 4, 24),
        new THREE.MeshBasicMaterial({ color: pinCols[i], transparent: true, opacity: 0.55 })
      );
      pring.position.set(x - 5, y, z - 3);
      pring.lookAt(new THREE.Vector3(-5, 0, -3));
      scene.add(pring);
    });

    /* ── Floating data cards (translucent planes) ── */
    const cardMeshes: THREE.Mesh[] = [];
    const cardCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff];
    for (let i = 0; i < 5; i++) {
      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 0.8),
        new THREE.MeshBasicMaterial({ color: cardCols[i % 3], transparent: true, opacity: 0.06, side: THREE.DoubleSide })
      );
      card.position.set((Math.random() - 0.5) * 28, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 8 - 4);
      card.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.3);
      cardMeshes.push(card);
      scene.add(card);
    }

    /* ── Background floating icosahedra ── */
    const floaters: { m: THREE.Mesh; sp: number; ax: THREE.Vector3 }[] = [];
    const fCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];
    for (let i = 0; i < 18; i++) {
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.15 + Math.random() * 0.2, 0),
        new THREE.MeshPhongMaterial({ color: fCols[i % 6], transparent: true, opacity: 0.12 + Math.random() * 0.13, wireframe: Math.random() > 0.45 })
      );
      m.position.set((Math.random() - 0.5) * 38, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 14 - 4);
      floaters.push({ m, sp: 0.004 + Math.random() * 0.007, ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() });
      scene.add(m);
    }

    /* ── Stars ── */
    const sg = new THREE.BufferGeometry();
    const sp: number[] = [];
    for (let i = 0; i < 2400; i++) sp.push((Math.random() - 0.5) * 90, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40 - 12);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.025, color: 0xffffff, transparent: true, opacity: 0.2 })));

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const bl = new THREE.PointLight(0x4f8ef7, 4, 50); bl.position.set(-6, 4, 6); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 40); pl.position.set(8, -3, 4); scene.add(pl);
    scene.add(new THREE.PointLight(0x00d4ff, 2, 32)).position.set(-2, 8, 3);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => { mouse.x = (e.clientX / innerWidth - 0.5) * 2; mouse.y = -(e.clientY / innerHeight - 0.5) * 2; };
    addEventListener("mousemove", onMouse);
    const onResize = () => { const W2 = el.clientWidth, H2 = el.clientHeight; renderer.setSize(W2, H2); camera.aspect = W2 / H2; camera.updateProjectionMatrix(); };
    addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      globe.rotation.y = t * 0.12;
      cardMeshes.forEach((c, i) => { c.rotation.y += 0.003; c.position.y += Math.sin(t * 0.4 + i) * 0.002; });
      floaters.forEach(({ m, sp, ax }) => m.rotateOnAxis(ax, sp));
      camera.position.x += (mouse.x * 0.65 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.025;
      camera.position.z = 18 + Math.sin(t * 0.1) * 0.6;
      camera.lookAt(0, 0, 0);
      bl.intensity = 3.5 + Math.sin(t * 1.0) * 1.0;
      pl.intensity = 2.2 + Math.cos(t * 0.8) * 0.7;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMouse);
      removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ── Animated image frame with parallax tilt ── */
function ImageFrame() {
  const frameRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const f = frameRef.current; if (!f) return;
    const rect = f.getBoundingClientRect();
    const rx = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -12;
    const ry = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 12;
    f.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
  };
  const onLeave = () => { if (frameRef.current) frameRef.current.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)"; };

  return (
    <div 
      ref={frameRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: "relative",
        borderRadius: 26,
        padding: 3,
        background: "linear-gradient(135deg, rgba(79,142,247,0.45), rgba(159,92,247,0.28), rgba(0,212,255,0.38))",
        boxShadow: "0 32px 90px rgba(0,0,0,0.65), 0 0 60px rgba(79,142,247,0.14)",
        transition: "transform 0.15s ease, box-shadow 0.3s ease",
        willChange: "transform",
        animation: "a2ImgIn 0.9s ease 0.3s both",
        cursor: "default",
      }}
    >
      <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "25/24", position: "relative", background: "#020816" }}>
        {/* Images */}
        <Image src="/images/about/about-image-2.svg" alt="pharmacy locator" fill style={{ objectFit: "contain" }} className="dark:hidden" />
        <Image src="/images/about/about-image-2-dark.svg" alt="pharmacy locator dark" fill style={{ objectFit: "contain" }} className="hidden dark:block" />

        {/* Cinematic overlays */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 55%, rgba(2,8,22,0.5) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6%", background: "linear-gradient(to bottom,#020816,transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "6%", background: "linear-gradient(to top,#020816,transparent)", pointerEvents: "none" }} />

        {/* HUD corners */}
        {[
          { top: 18, left: 18, borderTop: "1.5px solid #4f8ef7", borderLeft: "1.5px solid #4f8ef7", borderRadius: "3px 0 0 0" },
          { top: 18, right: 18, borderTop: "1.5px solid #4f8ef7", borderRight: "1.5px solid #4f8ef7", borderRadius: "0 3px 0 0" },
          { bottom: 18, left: 18, borderBottom: "1.5px solid #4f8ef7", borderLeft: "1.5px solid #4f8ef7", borderRadius: "0 0 0 3px" },
          { bottom: 18, right: 18, borderBottom: "1.5px solid #4f8ef7", borderRight: "1.5px solid #4f8ef7", borderRadius: "0 0 3px 0" },
        ].map((s, i) => <div key={i} style={{ position: "absolute", width: 22, height: 22, opacity: 0.55, ...s }} />)}

        {/* Floating stat badge */}
        <div style={{
          position: "absolute", bottom: "14%", left: 20, zIndex: 8,
          padding: "10px 16px", borderRadius: 13,
          background: "rgba(2,8,22,0.8)", border: "1px solid rgba(79,142,247,0.3)",
          backdropFilter: "blur(14px)", animation: "a2Float 3.5s ease-in-out infinite",
        }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#4f8ef7", fontFamily: "'Syne',sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>2 min</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.42)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>Avg. Find Time</div>
        </div>

        {/* Live badge */}
        <div style={{
          position: "absolute", top: "14%", right: 20, zIndex: 8,
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 13px", borderRadius: 100,
          background: "rgba(2,8,22,0.8)", border: "1px solid rgba(0,212,255,0.3)",
          backdropFilter: "blur(12px)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", display: "inline-block", animation: "a2Dot 1.8s ease-in-out infinite" }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#00d4ff", letterSpacing: "0.13em", textTransform: "uppercase" }}>Active</span>
        </div>
      </div>

      {/* Reflection glow */}
      <div style={{
        position: "absolute", bottom: -24, left: "12%", right: "12%",
        height: 40, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(79,142,247,0.2) 0%, transparent 70%)",
        filter: "blur(10px)", pointerEvents: "none",
      }} />
    </div>
  );
}

/* ── Expandable feature block ── */
function FeatureBlock({
  num, title, body, accent, index,
}: { num: string; title: string; body: string; accent: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => setOpen(o => !o)}
      style={{
        padding: "22px 26px",
        borderRadius: 18,
        border: `1px solid ${open || hov ? accent + "50" : "rgba(255,255,255,0.07)"}`,
        background: open
          ? `linear-gradient(145deg, rgba(255,255,255,0.05), ${accent}0e)`
          : hov ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
        backdropFilter: "blur(16px)",
        cursor: "pointer",
        transition: "all 0.35s ease",
        transform: hov && !open ? "translateX(5px)" : "translateX(0)",
        boxShadow: open ? `0 16px 50px ${accent}18` : "none",
        animation: `a2CardIn 0.55s ease ${index * 0.12}s both`,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Left accent strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
        background: `linear-gradient(to bottom, ${accent}, transparent)`,
        opacity: open ? 1 : 0.25,
        borderRadius: "18px 0 0 18px",
        transition: "opacity 0.35s",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingLeft: 10 }}>
        {/* Number badge */}
        <div style={{
          flexShrink: 0,
          width: 44, height: 44, borderRadius: 13,
          background: open ? `linear-gradient(135deg, ${accent}, ${accent}88)` : `${accent}1a`,
          border: `1px solid ${accent}${open ? "00" : "40"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16,
          color: open ? "#fff" : accent,
          transition: "all 0.35s ease",
          boxShadow: open ? `0 0 22px ${accent}55` : "none",
          transform: open ? "scale(1.08) rotate(-4deg)" : "scale(1)",
        }}>{num}</div>

        <h3 style={{
          flex: 1,
          fontSize: 19, fontWeight: 700,
          fontFamily: "'Syne',sans-serif",
          color: open ? "#fff" : "rgba(255,255,255,0.72)",
          transition: "color 0.3s",
          letterSpacing: "-0.015em",
          lineHeight: 1.2,
        }}>{title}</h3>

        {/* Chevron */}
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={accent} strokeWidth="2" strokeLinecap="round"
          style={{
            flexShrink: 0,
            transition: "transform 0.35s ease, opacity 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: open || hov ? 1 : 0.4,
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Expandable body */}
      <div style={{
        maxHeight: open ? 160 : 0,
        overflow: "hidden",
        transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
        opacity: open ? 1 : 0,
        paddingLeft: 70,
        marginTop: open ? 14 : 0,
      }}>
        <p style={{
          fontSize: 15, fontWeight: 300,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.78,
          margin: 0,
        }}>{body}</p>
      </div>

      {/* Corner glow */}
      <div style={{
        position: "absolute", bottom: -30, right: -30,
        width: 100, height: 100, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
        opacity: open ? 1 : 0.3, transition: "opacity 0.35s",
        pointerEvents: "none",
      }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────── */
const features = [
  {
    num: "01",
    title: "Seamless Pharmacy Locator",
    body: "Find pharmacies near you instantly with our geolocation-based system, ensuring you always know where to get the medications you need.",
    accent: "#4f8ef7",
  },
  {
    num: "02",
    title: "Reliable Customer Support",
    body: "Our dedicated support team is available to help you with queries about pharmacy locations, medicine availability, and more.",
    accent: "#9f5cf7",
  },
  {
    num: "03",
    title: "Innovative Features",
    body: "Our system integrates advanced technologies, including real-time data updates and a user-friendly interface, for a seamless experience.",
    accent: "#00d4ff",
  },
];

export default function AboutSectionTwo() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes a2FadeUp  { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes a2Glow    { 0%,100%{opacity:.28} 50%{opacity:.65} }
        @keyframes a2Dot     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.5} }
        @keyframes a2Float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes a2ImgIn   { from{opacity:0;transform:perspective(900px) rotateY(14deg) translateX(-28px)} to{opacity:1;transform:perspective(900px) rotateY(0) translateX(0)} }
        @keyframes a2CardIn  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes a2LineExp { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>

      <section
        id="about-two"
        style={{
          position: "relative",
          background: "#020816",
          padding: "160px 0 140px",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Three.js 3D background ── */}
        <ThreeBackground />

        {/* ── Grid overlay ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(79,142,247,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.028) 1px,transparent 1px)`,
          backgroundSize: "64px 64px",
        }} />

        {/* ── Scanlines ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px)",
        }} />

        {/* ── Radial glows ── */}
        <div style={{
          position: "absolute", top: -60, left: "30%", transform: "translateX(-50%)",
          width: 900, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(79,142,247,.1) 0%,transparent 68%)",
          zIndex: 1, pointerEvents: "none", animation: "a2Glow 5s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: 0, right: "6%",
          width: 480, height: 240, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(159,92,247,.07) 0%,transparent 70%)",
          zIndex: 1, pointerEvents: "none", animation: "a2Glow 7s ease-in-out infinite 2s",
        }} />

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 80,
            alignItems: "center",
          }}>

            {/* ──── LEFT: image ──── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "a2FadeUp 0.85s ease both",
            }}>
              <div style={{ width: "100%", maxWidth: 500 }}>
                <ImageFrame />
              </div>
            </div>

            {/* ──── RIGHT: accordion features ──── */}
            <div style={{ animation: "a2FadeUp 0.85s ease 0.15s both" }}>

              {/* Eyebrow */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                padding: "7px 18px", borderRadius: 100,
                border: "1px solid rgba(79,142,247,.32)",
                background: "rgba(79,142,247,.08)",
                marginBottom: 28,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "a2Dot 2.2s ease-in-out infinite" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f8ef7", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>
                  Platform Capabilities
                </span>
              </div>

              {/* Headline */}
              <h2 style={{
                fontSize: "clamp(34px,4.5vw,58px)",
                fontWeight: 800,
                fontFamily: "'Syne',sans-serif",
                lineHeight: 1.02,
                letterSpacing: "-0.032em",
                margin: "0 0 18px",
              }}>
                <span style={{ color: "#ffffff" }}>Built for</span>
                <br />
                <span style={{
                  background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>Modern Healthcare</span>
              </h2>

              {/* Divider */}
              <div style={{
                width: 72, height: 2, borderRadius: 2,
                background: "linear-gradient(90deg,#4f8ef7,#9f5cf7)",
                marginBottom: 20,
                animation: "a2LineExp 0.9s ease 0.25s both",
                transformOrigin: "left",
              }} />

              {/* Intro text */}
              <p style={{
                fontSize: 16, fontWeight: 300,
                color: "rgba(255,255,255,.45)",
                lineHeight: 1.78,
                marginBottom: 40,
                maxWidth: 460,
              }}>
                Every feature is engineered to bring pharmacies and patients
                closer — faster, smarter, and more reliably than ever before.
              </p>

              {/* Accordion blocks */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {features.map((f, i) => (
                  <FeatureBlock key={f.title} {...f} index={i} />
                ))}
              </div>

              {/* CTA row */}
              <div style={{ display: "flex", gap: 14, marginTop: 42, flexWrap: "wrap" }}>
                <button
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "linear-gradient(135deg,#4f8ef7,#7c3aed)"; b.style.color = "#fff"; b.style.transform = "translateY(-2px)"; b.style.boxShadow = "0 14px 36px rgba(79,142,247,.42)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(79,142,247,.08)"; b.style.color = "#4f8ef7"; b.style.transform = "translateY(0)"; b.style.boxShadow = "none"; }}
                  style={{ padding: "14px 36px", borderRadius: 14, border: "1px solid rgba(79,142,247,.35)", background: "rgba(79,142,247,.08)", color: "#4f8ef7", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Syne',sans-serif", transition: "all 0.28s ease" }}
                >
                  Get Started →
                </button>
                <button
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(255,255,255,.28)"; b.style.color = "#fff"; b.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(255,255,255,.1)"; b.style.color = "rgba(255,255,255,.52)"; b.style.transform = "translateY(0)"; }}
                  style={{ padding: "14px 36px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.52)", fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Syne',sans-serif", transition: "all 0.28s ease" }}
                >
                  Learn More
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}