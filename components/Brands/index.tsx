"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Brand } from "@/types/brand";
import brandsData from "./brandsData";

/* ─────────────────────────────────────────────────────────────
   Cinematic Brands / Trusted-By Section  –  Three.js edition
   Consistent with Hero + Features + Video dark-cosmos system.
   Requires: npm install three
   ───────────────────────────────────────────────────────────── */

/* ── Floating hexagonal particle ring (3D) ── */
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
    scene.fog = new THREE.FogExp2(0x020816, 0.035);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 180);
    camera.position.set(0, 0, 18);

    /* ── Connection node spheres ── */
    const nodeMeshes: { m: THREE.Mesh; vx: number; vy: number; sp: number; ph: number }[] = [];
    const nodeColors = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];
    const nodePositions: THREE.Vector3[] = [];

    for (let i = 0; i < 22; i++) {
      const col = nodeColors[i % nodeColors.length];
      const r = 0.12 + Math.random() * 0.16;
      const geo = new THREE.SphereGeometry(r, 8, 8);
      const mat = new THREE.MeshPhongMaterial({
        color: col, transparent: true,
        opacity: 0.35 + Math.random() * 0.3, shininess: 90,
      });
      const m = new THREE.Mesh(geo, mat);
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 12 - 4,
      );
      m.position.copy(pos);
      nodePositions.push(pos.clone());
      nodeMeshes.push({ m, vx: (Math.random() - 0.5) * 0.004, vy: (Math.random() - 0.5) * 0.003, sp: 0.003 + Math.random() * 0.005, ph: i * 0.7 });
      scene.add(m);
    }

    /* ── Connection lines between nearby nodes ── */
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4f8ef7, transparent: true, opacity: 0.08 });
    const lineGroup = new THREE.Group();
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 11) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([nodePositions[i], nodePositions[j]]);
          lineGroup.add(new THREE.Line(lineGeo, lineMat));
        }
      }
    }
    scene.add(lineGroup);

    /* ── Large orbit ring (network motif) ── */
    const rings: THREE.Mesh[] = [];
    [[7, 0.012, 0x4f8ef7, 0.1], [10, 0.008, 0x9f5cf7, 0.07], [5, 0.016, 0x00d4ff, 0.12]].forEach(([r, t, c, o]) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r as number, t as number, 6, 90),
        new THREE.MeshBasicMaterial({ color: c as number, transparent: true, opacity: o as number })
      );
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      m.position.z = -10;
      rings.push(m); scene.add(m);
    });

    /* ── Stars ── */
    const sg = new THREE.BufferGeometry();
    const sp: number[] = [];
    for (let i = 0; i < 2200; i++) sp.push((Math.random() - 0.5) * 90, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40 - 12);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.026, color: 0xffffff, transparent: true, opacity: 0.2 })));

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const bl = new THREE.PointLight(0x4f8ef7, 3.5, 45); bl.position.set(8, 5, 6); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 38); pl.position.set(-8, -4, 4); scene.add(pl);
    scene.add(new THREE.PointLight(0x00d4ff, 1.8, 30)).position.set(0, 8, 3);

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
      nodeMeshes.forEach(({ m, vx, vy, ph }) => {
        m.position.x += vx; m.position.y += vy;
        m.position.y += Math.sin(t * 0.4 + ph) * 0.002;
        if (Math.abs(m.position.x) > 19) m.position.x *= -0.97;
        if (Math.abs(m.position.y) > 12) m.position.y *= -0.97;
      });
      rings[0].rotation.z += 0.005; rings[1].rotation.y += 0.003; rings[2].rotation.x += 0.006;
      camera.position.x += (mouse.x * 0.7 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.45 - camera.position.y) * 0.025;
      camera.position.z = 18 + Math.sin(t * 0.1) * 0.7;
      camera.lookAt(0, 0, 0);
      bl.intensity = 3.2 + Math.sin(t * 1.0) * 0.8;
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

/* ── Single brand card ── */
function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const [hov, setHov] = useState(false);
  const accent = ["#4f8ef7", "#9f5cf7", "#00d4ff", "#5ff7c4", "#f7c14f", "#f75f8e"][index % 6];

  return (
    <a
      href={brand.href}
      target="_blank"
      rel="nofollow noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative",
        padding: "28px 22px",
        borderRadius: 18,
        border: `1px solid ${hov ? accent + "55" : "rgba(255,255,255,0.07)"}`,
        background: hov
          ? `linear-gradient(145deg,rgba(255,255,255,0.06),${accent}10)`
          : "rgba(255,255,255,0.025)",
        backdropFilter: "blur(16px)",
        textDecoration: "none",
        overflow: "hidden",
        transition: "border-color 0.35s, background 0.35s, transform 0.35s, box-shadow 0.35s",
        transform: hov ? "translateY(-7px) scale(1.03)" : "translateY(0) scale(1)",
        boxShadow: hov ? `0 22px 55px ${accent}20` : "none",
        animation: `brandIn 0.6s ease ${index * 0.07}s both`,
        cursor: "pointer",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,${accent},transparent)`,
        opacity: hov ? 1 : 0.3,
        transition: "opacity 0.35s",
      }} />

      {/* Corner glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle,${accent}25 0%,transparent 70%)`,
        opacity: hov ? 1 : 0.3,
        transition: "opacity 0.35s",
        pointerEvents: "none",
      }} />

      {/* Logo image */}
      <div style={{
        width: 110, height: 44,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
        filter: hov ? "brightness(1.15) grayscale(0)" : "brightness(0.55) grayscale(1)",
        transition: "filter 0.45s ease",
      }}>
        <Image
          src={brand.image}
          alt={brand.name}
          width={110}
          height={44}
          style={{ objectFit: "contain", maxHeight: "100%", maxWidth: "100%" }}
        />
      </div>

      {/* Name label */}
      <span style={{
        marginTop: 14, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: hov ? accent : "rgba(255,255,255,0.28)",
        fontFamily: "'Syne',sans-serif",
        transition: "color 0.35s",
        position: "relative", zIndex: 1,
      }}>{brand.name}</span>
    </a>
  );
}

/* ── Infinite scroll ticker (mobile + desktop) ── */
function Ticker({ brands, reverse = false }: { brands: Brand[]; reverse?: boolean }) {
  // Triple-clone for seamless loop
  const items = [...brands, ...brands, ...brands];
  return (
    <div style={{ overflow: "hidden", position: "relative", width: "100%" }}>
      {/* Fade edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: "linear-gradient(to right,#020816,transparent)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: "linear-gradient(to left,#020816,transparent)", pointerEvents: "none",
      }} />

      <div style={{
        display: "flex", gap: 16,
        animation: `ticker${reverse ? "Rev" : ""} ${brands.length * 3.5}s linear infinite`,
        width: "max-content",
      }}>
        {items.map((brand, i) => (
          <a
            key={`${brand.id}-${i}`}
            href={brand.href}
            target="_blank"
            rel="nofollow noreferrer"
            style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
              padding: "12px 24px", borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(12px)",
              textDecoration: "none",
              transition: "border-color 0.3s, background 0.3s",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(79,142,247,0.4)";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(79,142,247,0.08)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <div style={{ width: 72, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Image src={brand.image} alt={brand.name} width={72} height={28}
                style={{ objectFit: "contain", maxHeight: "100%", filter: "brightness(0.6) grayscale(1)" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif", whiteSpace: "nowrap" }}>
              {brand.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Stat counter card ── */
function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div style={{
      textAlign: "center", padding: "20px 32px",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(255,255,255,0.025)",
      backdropFilter: "blur(14px)",
    }}>
      <div style={{
        fontSize: 32, fontWeight: 800,
        fontFamily: "'Syne',sans-serif",
        letterSpacing: "-0.025em",
        background: `linear-gradient(135deg,${accent},#fff)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text", lineHeight: 1, marginBottom: 6,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, fontFamily: "'Syne',sans-serif" }}>{label}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main Brands component
   ────────────────────────────────────────────────── */
export default function Brands() {
  const half = Math.ceil(brandsData.length / 2);
  const row1 = brandsData.slice(0, half);
  const row2 = brandsData.slice(half);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes brandIn {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes brandGlow {
          0%,100% { opacity:.28; }
          50%      { opacity:.65; }
        }
        @keyframes brandDot {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.4); opacity:.5; }
        }
        @keyframes ticker {
          from { transform:translateX(0); }
          to   { transform:translateX(calc(-100% / 3)); }
        }
        @keyframes tickerRev {
          from { transform:translateX(calc(-100% / 3)); }
          to   { transform:translateX(0); }
        }
        @keyframes brandHeaderIn {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lineExpand {
          from { transform:scaleX(0); }
          to   { transform:scaleX(1); }
        }
      `}</style>

      <section style={{
        position: "relative",
        background: "#020816",
        padding: "100px 0 120px",
        overflow: "hidden",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        {/* ── Three.js 3D background ── */}
        <ThreeBackground />

        {/* ── Grid overlay ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(79,142,247,.028) 1px,transparent 1px),
            linear-gradient(90deg,rgba(79,142,247,.028) 1px,transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }} />

        {/* ── Scanlines ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.025) 3px,rgba(0,0,0,.025) 4px)",
        }} />

        {/* ── Top radial glow ── */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 1000, height: 320, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(79,142,247,.1) 0%,transparent 68%)",
          zIndex: 1, pointerEvents: "none",
          animation: "brandGlow 5s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: 0, right: "8%",
          width: 480, height: 240, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(159,92,247,.07) 0%,transparent 70%)",
          zIndex: 1, pointerEvents: "none",
          animation: "brandGlow 6s ease-in-out infinite 2.5s",
        }} />

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>

          {/* ── Section header ── */}
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            {/* Eyebrow */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "7px 18px", borderRadius: 100,
              border: "1px solid rgba(79,142,247,.32)",
              background: "rgba(79,142,247,.08)",
              marginBottom: 28,
              animation: "brandHeaderIn 0.7s ease both",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#4f8ef7",
                display: "inline-block", animation: "brandDot 2.2s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: 10.5, fontWeight: 700, color: "#4f8ef7",
                letterSpacing: "0.18em", textTransform: "uppercase",
                fontFamily: "'Syne',sans-serif",
              }}>Trusted Partners</span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: "clamp(36px,5vw,64px)",
              fontWeight: 800,
              fontFamily: "'Syne',sans-serif",
              lineHeight: 1.0, letterSpacing: "-0.032em",
              margin: "0 0 22px",
              animation: "brandHeaderIn 0.8s ease 0.1s both",
            }}>
              <span style={{ color: "#ffffff" }}>Trusted by</span>{" "}
              <span style={{
                background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Industry Leaders</span>
            </h2>

            {/* Divider line */}
            <div style={{
              width: 80, height: 2, borderRadius: 2,
              background: "linear-gradient(90deg,#4f8ef7,#9f5cf7)",
              margin: "0 auto 22px",
              animation: "lineExpand 0.9s ease 0.3s both",
              transformOrigin: "center",
            }} />

            <p style={{
              fontSize: 17, fontWeight: 300,
              color: "rgba(255,255,255,.47)",
              maxWidth: 520, margin: "0 auto",
              lineHeight: 1.78,
              animation: "brandHeaderIn 0.9s ease 0.2s both",
            }}>
              Join thousands of pharmacies and suppliers who trust our platform
              to power their operations every single day.
            </p>
          </div>

          {/* ── Stats row ── */}
          <div style={{
            display: "flex", flexWrap: "wrap",
            justifyContent: "center", gap: 16,
            marginBottom: 60,
            animation: "brandHeaderIn 0.9s ease 0.3s both",
          }}>
            <StatCard value="12K+" label="Pharmacies" accent="#4f8ef7" />
            <StatCard value="340+"  label="Suppliers"  accent="#9f5cf7" />
            <StatCard value="99.9%" label="Uptime"     accent="#00d4ff" />
            <StatCard value="48h"   label="Delivery"   accent="#5ff7c4" />
          </div>

          {/* ── Brand grid (md+) ── */}
          <div style={{
            display: "none",
          }} className="brand-grid-desktop">
            {/* desktop shown via CSS – we use the ticker instead for all sizes */}
          </div>

          {/* ── Dual ticker rows ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Ticker brands={row1} />
            <Ticker brands={row2} reverse />
          </div>

          {/* ── Full brand grid (desktop) ── */}
          <div style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
            gap: 16,
          }}>
            {brandsData.map((brand, i) => (
              <BrandCard key={brand.id} brand={brand} index={i} />
            ))}
          </div>

          {/* ── Bottom CTA ── */}
          <div style={{
            textAlign: "center", marginTop: 64,
            animation: "brandHeaderIn 0.8s ease 0.55s both",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ height: 1, width: 80, background: "linear-gradient(to right,transparent,rgba(79,142,247,.4))" }} />
              <button
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#4f8ef7,#7c3aed)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(79,142,247,.4)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(79,142,247,.08)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#4f8ef7";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
                style={{
                  padding: "14px 40px", borderRadius: 14,
                  border: "1px solid rgba(79,142,247,.35)",
                  background: "rgba(79,142,247,.08)",
                  color: "#4f8ef7", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", letterSpacing: "0.04em",
                  fontFamily: "'Syne',sans-serif",
                  transition: "all 0.28s ease",
                }}
              >
                Become a Partner →
              </button>
              <div style={{ height: 1, width: 80, background: "linear-gradient(to left,transparent,rgba(79,142,247,.4))" }} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}