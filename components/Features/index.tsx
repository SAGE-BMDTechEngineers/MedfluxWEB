"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────
   Drop-in replacements – adapt these to your actual
   featuresData shape and icons.
   ───────────────────────────────────────────────── */
interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  paragraph: string;
  accent: string;         // hex string e.g. "#4f8ef7"
}

const defaultFeatures: Feature[] = [
  {
    id: 1,
    title: "Geolocation Services",
    paragraph: "Pinpoint nearby pharmacies in real-time using advanced GPS mapping. Optimise last-mile delivery routes and reduce patient wait times.",
    accent: "#4f8ef7",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: "Inventory Management",
    paragraph: "AI-powered stock tracking with expiry alerts, demand forecasting and automated reorder suggestions across your entire supply chain.",
    accent: "#9f5cf7",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        <path d="M7 8h3M7 12h3M14 8l2 2 3-3"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: "Prescription Engine",
    paragraph: "Validate, process and dispense digital prescriptions with full audit trails, regulatory compliance and seamless EMR integration.",
    accent: "#00d4ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: "Smart Analytics",
    paragraph: "Comprehensive dashboards surface sales trends, patient insights and profitability metrics — all updated in real time for faster decisions.",
    accent: "#5ff7c4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
  },
  {
    id: 5,
    title: "Secure Payments",
    paragraph: "PCI-DSS compliant checkout with multi-currency support, insurance claims processing and automated receipt generation for patients.",
    accent: "#f7c14f",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
      </svg>
    ),
  },
  {
    id: 6,
    title: "Delivery Tracking",
    paragraph: "End-to-end shipment visibility with live driver location, push notifications and an estimated arrival window accurate to the minute.",
    accent: "#f75f8e",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
      </svg>
    ),
  },
];

/* ──────────────────────────────────────────────────
   3-D background canvas
   ────────────────────────────────────────────────── */
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
    scene.fog = new THREE.FogExp2(0x020816, 0.032);

    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 180);
    camera.position.set(0, 0, 18);

    /* ── Hex grid of flat icosahedra (molecules) ── */
    const geos: THREE.BufferGeometry[] = [];
    const meshes: { m: THREE.Mesh; vx: number; vy: number; sp: number }[] = [];
    const hexColors = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];
    for (let i = 0; i < 28; i++) {
      const geo = new THREE.IcosahedronGeometry(0.28 + Math.random() * 0.22, 0);
      geos.push(geo);
      const col = hexColors[i % hexColors.length];
      const mat = new THREE.MeshPhongMaterial({
        color: col, transparent: true,
        opacity: 0.18 + Math.random() * 0.18,
        wireframe: Math.random() > 0.5,
        shininess: 60,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12 - 4,
      );
      meshes.push({ m: mesh, vx: (Math.random() - 0.5) * 0.004, vy: (Math.random() - 0.5) * 0.003, sp: 0.003 + Math.random() * 0.006 });
      scene.add(mesh);
    }

    /* ── Torus rings ── */
    const rings: THREE.Mesh[] = [];
    [[5, 0.015, 0x4f8ef7, 0.12], [7, 0.01, 0x9f5cf7, 0.08], [3.5, 0.018, 0x00d4ff, 0.15]].forEach(([r, t, c, o]) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(r as number, t as number, 6, 90),
        new THREE.MeshBasicMaterial({ color: c as number, transparent: true, opacity: o as number })
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, -8);
      rings.push(mesh);
      scene.add(mesh);
    });

    /* ── Star field ── */
    const sg = new THREE.BufferGeometry();
    const sp: number[] = [];
    for (let i = 0; i < 2200; i++) sp.push((Math.random() - .5) * 80, (Math.random() - .5) * 60, (Math.random() - .5) * 40 - 10);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.032, color: 0xffffff, transparent: true, opacity: 0.28 })));

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const bl = new THREE.PointLight(0x4f8ef7, 3.5, 40); bl.position.set(8, 5, 6); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 35); pl.position.set(-8, -4, 4); scene.add(pl);
    scene.add(new THREE.PointLight(0x00d4ff, 1.8, 28)).position.set(0, 8, 3);

    /* ── Mouse parallax ── */
    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / innerHeight - 0.5) * 2;
    };
    addEventListener("mousemove", onMouse);

    /* ── Resize ── */
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

      meshes.forEach(({ m, vx, vy, sp }) => {
        m.rotation.x += sp * 0.7;
        m.rotation.y += sp;
        m.position.x += vx;
        m.position.y += vy;
        if (Math.abs(m.position.x) > 17) m.position.x *= -0.98;
        if (Math.abs(m.position.y) > 11) m.position.y *= -0.98;
      });

      rings[0].rotation.z += 0.006;
      rings[1].rotation.y += 0.004;
      rings[2].rotation.x += 0.007;

      camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.03;
      camera.position.z = 18 + Math.sin(t * 0.12) * 0.8;
      camera.lookAt(0, 0, 0);

      bl.intensity = 3.2 + Math.sin(t * 1.1) * 0.9;
      pl.intensity = 2.2 + Math.cos(t * 0.85) * 0.7;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMouse);
      removeEventListener("resize", onResize);
      geos.forEach(g => g.dispose());
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ──────────────────────────────────────────────────
   Single feature card
   ────────────────────────────────────────────────── */
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "38px 32px",
        borderRadius: 22,
        border: `1px solid ${hovered ? feature.accent + "50" : "rgba(255,255,255,0.07)"}`,
        background: hovered
          ? `linear-gradient(145deg, rgba(255,255,255,0.06) 0%, ${feature.accent}0d 100%)`
          : "rgba(255,255,255,0.025)",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
        cursor: "default",
        transition: "border-color 0.35s ease, background 0.35s ease, transform 0.35s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        animation: `featCardIn 0.65s ease ${index * 0.08}s both`,
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${feature.accent}, transparent)`,
        opacity: hovered ? 1 : 0.4,
        transition: "opacity 0.35s ease",
      }} />

      {/* Number watermark */}
      <div style={{
        position: "absolute", top: 18, right: 22,
        fontSize: 64, fontWeight: 900,
        fontFamily: "var(--font-display, 'Syne', sans-serif)",
        color: feature.accent, opacity: 0.06,
        lineHeight: 1, userSelect: "none",
        letterSpacing: "-0.04em",
      }}>
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Icon badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 56, height: 56, borderRadius: 16,
        border: `1px solid ${feature.accent}40`,
        background: `${feature.accent}14`,
        color: feature.accent,
        marginBottom: 28,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "scale(1.12) rotate(6deg)" : "scale(1)",
        boxShadow: hovered ? `0 0 22px ${feature.accent}40` : "none",
      }}>
        {feature.icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 21,
        fontWeight: 700,
        fontFamily: "var(--font-display, 'Syne', sans-serif)",
        color: "#ffffff",
        margin: "0 0 14px",
        lineHeight: 1.2,
        letterSpacing: "-0.018em",
      }}>
        {feature.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: 14.5,
        color: "rgba(255,255,255,0.48)",
        lineHeight: 1.75,
        margin: 0,
        fontWeight: 300,
      }}>
        {feature.paragraph}
      </p>

      {/* Arrow link indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginTop: 26,
        fontSize: 12,
        color: feature.accent,
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateX(0)" : "translateX(-6px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        Learn more
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* Corner glow */}
      <div style={{
        position: "absolute", bottom: -40, right: -40,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${feature.accent}22 0%, transparent 70%)`,
        pointerEvents: "none",
        opacity: hovered ? 1 : 0.4,
        transition: "opacity 0.35s ease",
      }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main Features component
   Replace featuresData with your actual import.
   ────────────────────────────────────────────────── */
interface FeaturesProps {
  /* Pass your real feature data here, or remove the
     prop and import featuresData directly */
  features?: Feature[];
}

export default function Features({ features = defaultFeatures }: FeaturesProps) {
  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes featCardIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes featHeaderIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes featGlow {
          0%,100% { opacity: 0.3; }
          50%      { opacity: 0.65; }
        }
        @keyframes featPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.35); opacity: 0.5; }
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
      `}</style>

      <section
        id="features"
        style={{
          position: "relative",
          background: "#020816",
          padding: "120px 0 140px",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Three.js 3-D background ── */}
        <ThreeBackground />

        {/* ── Scanline overlay ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }} />

        {/* ── Background grid ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(79,142,247,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,142,247,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }} />

        {/* ── Radial glows ── */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 1000, height: 350, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(79,142,247,0.1) 0%, transparent 70%)",
          zIndex: 1, pointerEvents: "none", animation: "featGlow 5s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: "10%",
          width: 500, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(159,92,247,0.07) 0%, transparent 70%)",
          zIndex: 1, pointerEvents: "none", animation: "featGlow 6s ease-in-out infinite 2s",
        }} />

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>

          {/* Section header */}
          <div style={{ maxWidth: 660, marginBottom: 80 }}>
            {/* Eyebrow badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "7px 18px", borderRadius: 100,
              border: "1px solid rgba(79,142,247,0.32)",
              background: "rgba(79,142,247,0.08)",
              marginBottom: 30,
              animation: "featHeaderIn 0.7s ease both",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#4f8ef7",
                animation: "featPulse 2.2s ease-in-out infinite",
                display: "inline-block",
              }} />
              <span style={{
                fontSize: 10.5, fontWeight: 600, color: "#4f8ef7",
                letterSpacing: "0.18em", textTransform: "uppercase",
                fontFamily: "'Syne', sans-serif",
              }}>Pharmacy System</span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: "clamp(38px, 5vw, 64px)",
              fontWeight: 800,
              fontFamily: "'Syne', sans-serif",
              lineHeight: 1.0,
              letterSpacing: "-0.032em",
              margin: "0 0 24px",
              animation: "featHeaderIn 0.8s ease 0.1s both",
            }}>
              <span style={{ color: "#ffffff" }}>Pharmacy System</span>
              <br />
              <span style={{
                background: "linear-gradient(135deg, #4f8ef7 0%, #9f5cf7 50%, #00d4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Features</span>
            </h2>

            {/* Body */}
            <p style={{
              fontSize: 17,
              fontWeight: 300,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.78,
              margin: 0,
              animation: "featHeaderIn 0.9s ease 0.2s both",
            }}>
              Explore the core capabilities of our pharmacy management system,
              including advanced geolocation services to track nearby pharmacies
              and optimise every delivery.
            </p>
          </div>

          {/* Feature cards grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}>
            {features.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div style={{
            marginTop: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            animation: "featCardIn 0.7s ease 0.55s both",
          }}>
            <div style={{ height: 1, width: 80, background: "linear-gradient(to right, transparent, rgba(79,142,247,0.4))" }} />
            <button
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(79,142,247,0.18)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(79,142,247,0.08)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
              style={{
                padding: "14px 40px", borderRadius: 14,
                border: "1px solid rgba(79,142,247,0.35)",
                background: "rgba(79,142,247,0.08)",
                color: "#4f8ef7",
                fontSize: 14, fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em",
                fontFamily: "'Syne', sans-serif",
                transition: "background 0.25s ease, transform 0.25s ease",
              }}
            >
              Explore All Features →
            </button>
            <div style={{ height: 1, width: 80, background: "linear-gradient(to left, transparent, rgba(79,142,247,0.4))" }} />
          </div>
        </div>
      </section>
    </>
  );
}