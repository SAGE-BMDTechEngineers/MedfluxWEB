"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────
   Cinematic Video Section  –  Three.js edition
   Consistent with Hero + Features dark-cosmos design system.
   Requires: npm install three
   ───────────────────────────────────────────────────────── */

/* ── 3-D background: floating pill geometry + particle rings ── */
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

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 0, 20);

    /* ── Floating Cross/Plus shapes (medical motif) ── */
    const crossMeshes: { m: THREE.Group; sp: number; ax: THREE.Vector3; vy: number }[] = [];
    const crossColors = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f];

    const makeCross = (col: number, scale: number) => {
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.22, shininess: 80 });
      const g = new THREE.Group();
      // Horizontal bar
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6 * scale, 0.18 * scale, 0.08 * scale), mat));
      // Vertical bar
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.18 * scale, 0.6 * scale, 0.08 * scale), mat));
      return g;
    };

    for (let i = 0; i < 18; i++) {
      const col = crossColors[i % crossColors.length];
      const sc = 0.6 + Math.random() * 1.0;
      const grp = makeCross(col, sc);
      grp.position.set((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 28, (Math.random() - 0.5) * 16 - 4);
      grp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const sp = 0.004 + Math.random() * 0.008;
      const ax = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const vy = (Math.random() - 0.5) * 0.003;
      crossMeshes.push({ m: grp, sp, ax, vy });
      scene.add(grp);
    }

    /* ── Capsule pills ── */
    const pillMeshes: { m: THREE.Group; sp: number; vy: number; ph: number }[] = [];
    const pillCols = [0x4f8ef7, 0x9f5cf7, 0x5ff7c4, 0xf75f8e];
    for (let i = 0; i < 12; i++) {
      const col = pillCols[i % pillCols.length];
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.18, shininess: 100 });
      const sc = 0.4 + Math.random() * 0.5;
      const grp = new THREE.Group();
      grp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1 * sc, 0.1 * sc, 0.38 * sc, 12), mat));
      const capT = new THREE.Mesh(new THREE.SphereGeometry(0.1 * sc, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      capT.position.y = 0.19 * sc;
      const capB = new THREE.Mesh(new THREE.SphereGeometry(0.1 * sc, 12, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat);
      capB.position.y = -0.19 * sc;
      grp.add(capT, capB);
      grp.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14 - 5);
      grp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      pillMeshes.push({ m: grp, sp: 0.003 + Math.random() * 0.007, vy: (Math.random() - 0.5) * 0.003, ph: i * 0.9 });
      scene.add(grp);
    }

    /* ── Large slow torus rings (depth planes) ── */
    const torusRings: THREE.Mesh[] = [];
    [
      [9, 0.012, 0x4f8ef7, 0.09],
      [13, 0.008, 0x9f5cf7, 0.06],
      [6, 0.016, 0x00d4ff, 0.11],
    ].forEach(([r, t, c, o]) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r as number, t as number, 6, 100),
        new THREE.MeshBasicMaterial({ color: c as number, transparent: true, opacity: o as number })
      );
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      m.position.z = -12;
      torusRings.push(m);
      scene.add(m);
    });

    /* ── Star particles ── */
    const sg = new THREE.BufferGeometry();
    const sp: number[] = [];
    for (let i = 0; i < 2800; i++)
      sp.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 50 - 14);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.028, color: 0xffffff, transparent: true, opacity: 0.22 })));

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const bl = new THREE.PointLight(0x4f8ef7, 4, 50); bl.position.set(10, 6, 8); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 3, 45); pl.position.set(-10, -5, 5); scene.add(pl);
    const cl = new THREE.PointLight(0x00d4ff, 2, 35); cl.position.set(0, 10, 4); scene.add(cl);

    /* ── Mouse parallax ── */
    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / innerHeight - 0.5) * 2;
    };
    addEventListener("mousemove", onMouse);
    const onResize = () => {
      const W2 = el.clientWidth, H2 = el.clientHeight;
      renderer.setSize(W2, H2);
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
    };
    addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      crossMeshes.forEach(({ m, sp, ax }) => {
        m.rotateOnAxis(ax, sp);
        m.position.y += Math.sin(t * 0.4 + m.position.x) * 0.002;
      });
      pillMeshes.forEach(({ m, sp, vy, ph }) => {
        m.rotation.x += sp * 0.6;
        m.rotation.z += sp * 0.9;
        m.position.y += Math.sin(t * 0.5 + ph) * 0.003;
      });
      torusRings[0].rotation.z += 0.005;
      torusRings[1].rotation.y += 0.003;
      torusRings[2].rotation.x += 0.006;

      camera.position.x += (mouse.x * 0.9 - camera.position.x) * 0.028;
      camera.position.y += (mouse.y * 0.55 - camera.position.y) * 0.028;
      camera.position.z = 20 + Math.sin(t * 0.1) * 0.8;
      camera.lookAt(0, 0, 0);

      bl.intensity = 3.5 + Math.sin(t * 1.0) * 1.0;
      pl.intensity = 2.5 + Math.cos(t * 0.8) * 0.8;
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

/* ── Animated play button ── */
function PlayButton({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label="Play video"
      style={{
        position: "relative",
        width: 80, height: 80, borderRadius: "50%",
        border: "none", background: "transparent",
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Outer pulse ring */}
      <div style={{
        position: "absolute", inset: -16,
        borderRadius: "50%",
        border: "1.5px solid rgba(79,142,247,0.35)",
        animation: "vidRingPulse 2.2s ease-in-out infinite",
      }} />
      {/* Second ring */}
      <div style={{
        position: "absolute", inset: -8,
        borderRadius: "50%",
        border: "1.5px solid rgba(79,142,247,0.22)",
        animation: "vidRingPulse 2.2s ease-in-out infinite 0.6s",
      }} />
      {/* Button body */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: hov
          ? "linear-gradient(135deg,#4f8ef7,#9f5cf7)"
          : "rgba(255,255,255,0.08)",
        border: hov ? "none" : "1.5px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.3s, transform 0.3s, box-shadow 0.3s",
        transform: hov ? "scale(1.1)" : "scale(1)",
        boxShadow: hov ? "0 0 40px rgba(79,142,247,0.5)" : "none",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
          <path d="M5 3l14 9-14 9V3z" />
        </svg>
      </div>
    </button>
  );
}

/* ── Stat chip ── */
function Chip({ label, accent = "#4f8ef7" }: { label: string; accent?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px", borderRadius: 100,
        border: `1px solid ${hov ? accent + "55" : "rgba(255,255,255,0.1)"}`,
        background: hov ? `${accent}14` : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(14px)",
        fontSize: 12, fontWeight: 600,
        color: hov ? accent : "rgba(255,255,255,0.55)",
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        cursor: "default",
        transition: "all 0.3s ease",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {label}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────── */
const VIDEO_SRC =
  "https://www.pexels.com/download/video/5453562/";

export default function VideoSection() {
  const [isOpen, setOpen] = useState(false);
  const [vidHov, setVidHov] = useState(false);

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes vidFadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes vidGlow {
          0%,100% { opacity:.28; }
          50%      { opacity:.65; }
        }
        @keyframes vidRingPulse {
          0%   { transform:scale(1);  opacity:.7; }
          100% { transform:scale(1.5); opacity:0; }
        }
        @keyframes vidDot {
          0%,100% { transform:scale(1);   opacity:1; }
          50%      { transform:scale(1.4); opacity:.5; }
        }
        @keyframes vidScan {
          0%   { transform:translateY(-100%); }
          100% { transform:translateY(200%); }
        }
        @keyframes vidCornerSpin {
          to { transform:rotate(360deg); }
        }
      `}</style>

      <section
        style={{
          position: "relative",
          background: "#020816",
          padding: "130px 0 150px",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Three.js 3-D background ── */}
        <ThreeBackground />

        {/* ── Grid overlay ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(79,142,247,0.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(79,142,247,0.03) 1px,transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }} />

        {/* ── Scanline film overlay ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,0.025) 3px,rgba(0,0,0,0.025) 4px)",
        }} />

        {/* ── Top radial glow ── */}
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: 1100, height: 380, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(79,142,247,0.11) 0%,transparent 68%)",
          zIndex: 1, pointerEvents: "none",
          animation: "vidGlow 5s ease-in-out infinite",
        }} />
        {/* ── Bottom left glow ── */}
        <div style={{
          position: "absolute", bottom: -40, right: "5%",
          width: 520, height: 280, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(159,92,247,0.08) 0%,transparent 70%)",
          zIndex: 1, pointerEvents: "none",
          animation: "vidGlow 7s ease-in-out infinite 2s",
        }} />

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1080, margin: "0 auto", padding: "0 6%" }}>

          {/* ── Section header ── */}
          <div style={{ textAlign: "center", marginBottom: 72, animation: "vidFadeUp 0.8s ease both" }}>
            {/* Eyebrow */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "7px 18px", borderRadius: 100,
              border: "1px solid rgba(79,142,247,0.32)",
              background: "rgba(79,142,247,0.08)",
              marginBottom: 30,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#4f8ef7", display: "inline-block",
                animation: "vidDot 2.2s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: 10.5, fontWeight: 700, color: "#4f8ef7",
                letterSpacing: "0.18em", textTransform: "uppercase",
                fontFamily: "'Syne',sans-serif",
              }}>See It In Action</span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: "clamp(36px,5.5vw,70px)",
              fontWeight: 800,
              fontFamily: "'Syne',sans-serif",
              lineHeight: 1.0,
              letterSpacing: "-0.034em",
              margin: "0 0 24px",
              animation: "vidFadeUp 0.85s ease 0.1s both",
            }}>
              <span style={{ color: "#ffffff" }}>We Are Ready</span>
              <br />
              <span style={{
                background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>To Help</span>
            </h2>

            {/* Body */}
            <p style={{
              fontSize: 17,
              fontWeight: 300,
              color: "rgba(255,255,255,0.48)",
              lineHeight: 1.78,
              maxWidth: 580,
              margin: "0 auto",
              animation: "vidFadeUp 0.9s ease 0.2s both",
            }}>
              Our pharmacy system is designed to improve medication management,
              provide precise geolocation services, and ensure customer satisfaction
              with every delivery.
            </p>
          </div>

          {/* ── Video card ── */}
          <div style={{
            maxWidth: 820, margin: "0 auto",
            animation: "vidFadeUp 0.95s ease 0.35s both",
          }}>
            {/* Outer glow frame */}
            <div
              onMouseEnter={() => setVidHov(true)}
              onMouseLeave={() => setVidHov(false)}
              style={{
                position: "relative",
                borderRadius: 24,
                padding: "3px",
                background: vidHov
                  ? "linear-gradient(135deg,#4f8ef7,#9f5cf7,#00d4ff)"
                  : "linear-gradient(135deg,rgba(79,142,247,0.3),rgba(159,92,247,0.2),rgba(0,212,255,0.3))",
                transition: "background 0.5s ease",
                boxShadow: vidHov
                  ? "0 30px 80px rgba(79,142,247,0.35), 0 0 0 1px rgba(79,142,247,0.2)"
                  : "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Inner video container */}
              <div style={{
                position: "relative",
                borderRadius: 22,
                overflow: "hidden",
                aspectRatio: "16/9",
                background: "#020816",
              }}>
                {/* Video element */}
                <video
                  autoPlay muted loop playsInline
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    transform: vidHov ? "scale(1.04)" : "scale(1)",
                    filter: vidHov ? "brightness(1.05)" : "brightness(0.9)",
                    transition: "transform 0.8s ease, filter 0.8s ease",
                  }}
                >
                  <source src={VIDEO_SRC} />
                </video>

                {/* Dark cinematic vignette */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `
                    radial-gradient(ellipse at center, transparent 40%, rgba(2,8,22,0.75) 100%),
                    linear-gradient(to top, rgba(2,8,22,0.6) 0%, transparent 40%)
                  `,
                  transition: "opacity 0.5s",
                  opacity: vidHov ? 0.6 : 1,
                }} />

                {/* CinemaScope letter-box bars */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: "8%", background: "#020816",
                  opacity: 0.85,
                }} />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "8%", background: "#020816",
                  opacity: 0.85,
                }} />

                {/* Scan line sweep effect */}
                <div style={{
                  position: "absolute", inset: 0, overflow: "hidden",
                  pointerEvents: "none", opacity: 0.04,
                }}>
                  <div style={{
                    width: "100%", height: "40%",
                    background: "linear-gradient(to bottom,transparent,rgba(79,142,247,0.8),transparent)",
                    animation: "vidScan 6s linear infinite",
                  }} />
                </div>

                {/* Centered play button */}
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 10,
                  opacity: vidHov ? 1 : 0.7,
                  transition: "opacity 0.4s ease",
                }}>
                  <PlayButton onClick={() => setOpen(true)} />
                </div>

                {/* Corner HUD accents */}
                {[
                  { top: 20, left: 20 },
                  { top: 20, right: 20 },
                  { bottom: 20, left: 20 },
                  { bottom: 20, right: 20 },
                ].map((pos, i) => (
                  <div key={i} style={{
                    position: "absolute", ...pos,
                    width: 22, height: 22,
                    border: `1.5px solid rgba(79,142,247,${vidHov ? 0.8 : 0.35})`,
                    borderRadius: 3,
                    opacity: vidHov ? 1 : 0.5,
                    transition: "opacity 0.4s ease, border-color 0.4s ease",
                    // Only show 2 sides per corner
                    borderRight: i % 2 === 0 ? "none" : undefined,
                    borderLeft: i % 2 === 1 ? "none" : undefined,
                    borderBottom: i < 2 ? "none" : undefined,
                    borderTop: i >= 2 ? "none" : undefined,
                  }} />
                ))}

                {/* Live indicator top-left */}
                <div style={{
                  position: "absolute", top: "12%", left: 24, zIndex: 12,
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "5px 12px", borderRadius: 100,
                  background: "rgba(2,8,22,0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(79,142,247,0.25)",
                  opacity: vidHov ? 1 : 0,
                  transform: vidHov ? "translateX(0)" : "translateX(-8px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#00d4ff",
                    animation: "vidDot 1.5s ease-in-out infinite", display: "inline-block",
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#00d4ff", letterSpacing: "0.12em", textTransform: "uppercase" }}>Live Preview</span>
                </div>

                {/* Duration badge bottom-right */}
                <div style={{
                  position: "absolute", bottom: "12%", right: 24, zIndex: 12,
                  padding: "5px 12px", borderRadius: 100,
                  background: "rgba(2,8,22,0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.06em",
                  opacity: vidHov ? 1 : 0,
                  transform: vidHov ? "translateX(0)" : "translateX(8px)",
                  transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
                  fontFamily: "'Syne',sans-serif",
                }}>2:45</div>
              </div>
            </div>

            {/* ── Chips row ── */}
            <div style={{
              display: "flex", flexWrap: "wrap",
              justifyContent: "center", gap: 12,
              marginTop: 36,
              animation: "vidFadeUp 1s ease 0.5s both",
            }}>
              <Chip label="Quality Meds" accent="#4f8ef7" />
              <Chip label="Quick Search" accent="#9f5cf7" />
              <Chip label="Professional Pharmacies" accent="#00d4ff" />
              <Chip label="24/7 Support" accent="#5ff7c4" />
            </div>

            {/* ── CTA strip ── */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 16,
              marginTop: 52,
              animation: "vidFadeUp 1s ease 0.65s both",
            }}>
              <div style={{ height: 1, width: 80, background: "linear-gradient(to right,transparent,rgba(79,142,247,0.4))" }} />
              <button
                onClick={() => setOpen(true)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#4f8ef7,#7c3aed)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(79,142,247,0.4)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(79,142,247,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#4f8ef7";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
                style={{
                  padding: "14px 40px", borderRadius: 14,
                  border: "1px solid rgba(79,142,247,0.35)",
                  background: "rgba(79,142,247,0.08)",
                  color: "#4f8ef7", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", letterSpacing: "0.04em",
                  fontFamily: "'Syne',sans-serif",
                  transition: "all 0.28s ease",
                }}
              >
                Watch Full Video →
              </button>
              <div style={{ height: 1, width: 80, background: "linear-gradient(to left,transparent,rgba(79,142,247,0.4))" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal: YouTube lightbox ── */}
      {isOpen && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(2,8,22,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "min(880px, 92vw)", aspectRatio: "16/9",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(79,142,247,0.3)",
              boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(79,142,247,0.15)",
            }}
          >
            <iframe
              width="100%" height="100%"
              src="https://www.pexels.com/download/video/5453562/"
              allow="autoplay; fullscreen"
              style={{ border: "none", display: "block" }}
              title="Pharmacy System Video"
            />
          </div>
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", top: 28, right: 32,
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(10px)",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >✕</button>
        </div>
      )}
    </>
  );
}