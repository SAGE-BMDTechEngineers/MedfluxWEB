"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   Cinematic Healthcare Hero – Three.js edition
   Requires: npm install three
   ───────────────────────────────────────────── */

export default function Hero() {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  /* ── Three.js scene ── */
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1);
    renderer.setClearColor(0x020816, 1);
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    /* Scene + fog */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020816, 0.045);

    /* Camera */
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 10);

    /* ── DNA Double Helix ── */
    const DNA_POINTS = 400;
    const dnaStrand1Pos = [];
    const dnaStrand2Pos = [];
    const rungPos = [];

    for (let i = 0; i < DNA_POINTS; i++) {
      const t = (i / DNA_POINTS) * Math.PI * 14 - Math.PI * 7;
      const y = t * 0.36;
      const r = 1.4;
      const x1 = Math.cos(t) * r;
      const z1 = Math.sin(t) * r;
      const x2 = Math.cos(t + Math.PI) * r;
      const z2 = Math.sin(t + Math.PI) * r;
      dnaStrand1Pos.push(x1, y, z1);
      dnaStrand2Pos.push(x2, y, z2);
      if (i % 18 === 0) {
        rungPos.push(x1, y, z1, x2, y, z2);
      }
    }

    const mkPoints = (positions, color) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      return new THREE.Points(
        geo,
        new THREE.PointsMaterial({ size: 0.07, color, transparent: true, opacity: 0.95, sizeAttenuation: true })
      );
    };

    const strand1 = mkPoints(dnaStrand1Pos, 0x4f8ef7);
    const strand2 = mkPoints(dnaStrand2Pos, 0x9f5cf7);

    const rungGeo = new THREE.BufferGeometry();
    rungGeo.setAttribute("position", new THREE.Float32BufferAttribute(rungPos, 3));
    const rungs = new THREE.LineSegments(
      rungGeo,
      new THREE.LineBasicMaterial({ color: 0x4f8ef7, transparent: true, opacity: 0.25 })
    );

    const dna = new THREE.Group();
    dna.add(strand1, strand2, rungs);
    dna.position.set(4.5, 0, -1);
    scene.add(dna);

    /* ── Orbiting Rings ── */
    const mkTorus = (r, tube, color, opacity) =>
      new THREE.Mesh(
        new THREE.TorusGeometry(r, tube, 6, 80),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity, wireframe: false })
      );

    const ring1 = mkTorus(2.2, 0.012, 0x4f8ef7, 0.35);
    const ring2 = mkTorus(3.0, 0.008, 0x9f5cf7, 0.2);
    const ring3 = mkTorus(1.6, 0.015, 0x00d4ff, 0.28);
    ring2.rotation.x = Math.PI / 2.5;
    ring3.rotation.z = Math.PI / 3;

    const rings = new THREE.Group();
    rings.add(ring1, ring2, ring3);
    rings.position.set(4.5, 0, -1);
    scene.add(rings);

    /* ── Floating Pill Capsules ── */
    const capsules = [];
    const capsuleData = [
      { pos: [-2, 2.5, -3], color: 0x4f8ef7 },
      { pos: [1.5, -3, -2], color: 0x9f5cf7 },
      { pos: [-3.5, -1, -4], color: 0x00d4ff },
      { pos: [2, 3.5, -5], color: 0x4f8ef7 },
      { pos: [-1.5, -3.5, -3], color: 0xd45ff7 },
      { pos: [5, 2, -4], color: 0x5ff7c4 },
    ];

    capsuleData.forEach(({ pos, color }, i) => {
      const mat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.55, shininess: 120 });
      const grp = new THREE.Group();
      grp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 14), mat));
      const capT = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      capT.position.y = 0.25;
      const capB = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat);
      capB.position.y = -0.25;
      grp.add(capT, capB);
      grp.position.set(...pos);
      grp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      grp._speed = 0.003 + i * 0.001;
      grp._phase = i * 1.2;
      capsules.push(grp);
      scene.add(grp);
    });

    /* ── Ambient Particles ── */
    const ambGeo = new THREE.BufferGeometry();
    const ambPos = [];
    for (let i = 0; i < 3000; i++) {
      ambPos.push((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30 - 5);
    }
    ambGeo.setAttribute("position", new THREE.Float32BufferAttribute(ambPos, 3));
    const ambParticles = new THREE.Points(
      ambGeo,
      new THREE.PointsMaterial({ size: 0.03, color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    scene.add(ambParticles);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    const blueLight = new THREE.PointLight(0x4f8ef7, 3, 30);
    blueLight.position.set(6, 4, 4);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x9f5cf7, 2, 25);
    purpleLight.position.set(-4, -3, 3);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x00d4ff, 1.5, 20);
    cyanLight.position.set(0, 6, 2);
    scene.add(cyanLight);

    /* ── Mouse parallax ── */
    const onMouse = (e) => {
      if (typeof window === "undefined") return;
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    /* ── Resize ── */
    const onResize = () => {
      const W2 = el.clientWidth, H2 = el.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener("resize", onResize);

    /* ── Animation loop ── */
    let frame;
    const clock = new THREE.Clock();

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      dna.rotation.y = t * 0.18;
      ring1.rotation.z = t * 0.12;
      ring2.rotation.y = t * 0.08;
      ring3.rotation.x = t * 0.1;
      rings.rotation.y = t * 0.18;
      ambParticles.rotation.y = t * 0.006;

      capsules.forEach((cap) => {
        cap.rotation.x += cap._speed;
        cap.rotation.z += cap._speed * 0.7;
        cap.position.y += Math.sin(t * 0.6 + cap._phase) * 0.004;
      });

      /* Cinematic camera drift */
      const targetX = mouse.current.x * 0.6;
      const targetY = mouse.current.y * 0.4;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.position.z = 10 + Math.sin(t * 0.15) * 0.5;
      camera.lookAt(0, 0, 0);

      /* Pulse lights */
      blueLight.intensity = 2.5 + Math.sin(t * 1.2) * 0.8;
      purpleLight.intensity = 1.8 + Math.cos(t * 0.9) * 0.6;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');
        .hero-root { font-family: 'Inter', sans-serif; }
        .hero-root h1, .hero-root h2, .hero-root h3 { font-family: 'Syne', sans-serif; }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes heroRotateSlow { to { transform: rotate(360deg); } }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.7; }
        }
        @keyframes stepSlide {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(79,142,247,0.45); }
        .hero-btn-ghost:hover   { background: rgba(255,255,255,0.1) !important; transform: translateY(-2px); }
        .hero-step:hover .step-num { transform: scale(1.15) rotate(10deg); }
        .hero-step:hover { transform: translateX(6px); }

        .gradient-text {
          background: linear-gradient(135deg, #4f8ef7 0%, #9f5cf7 50%, #00d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}} />

      {/* ══════════════════════════════════════════
          SECTION 1 – CINEMATIC HERO
          ══════════════════════════════════════════ */}
      <section className="hero-root" style={{
        position: "relative",
        minHeight: "100vh",
        background: "#020816",
        overflow: "hidden",
      }}>
        {/* Three.js canvas mount */}
        <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

        {/* Radial glow orbs */}
        <div style={{
          position: "absolute", top: "10%", right: "8%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 65%)",
          animation: "heroGlow 4s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", left: "5%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(159,92,247,0.1) 0%, transparent 70%)",
          animation: "heroGlow 5s ease-in-out infinite 1.5s", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "35%",
          width: 250, height: 250, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
          animation: "heroGlow 6s ease-in-out infinite 3s", pointerEvents: "none",
        }} />

        {/* Content overlay */}
        <div style={{
          position: "relative", zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "80px 6% 80px",
        }}>
          <div style={{ maxWidth: 640 }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "8px 20px", borderRadius: 100,
              border: "1px solid rgba(79,142,247,0.3)",
              background: "rgba(79,142,247,0.07)",
              marginBottom: 36,
              animation: "heroFadeUp 0.8s ease forwards",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#4f8ef7",
                animation: "heroPulse 2s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: 11, fontWeight: 500, color: "#4f8ef7",
                letterSpacing: "0.15em", textTransform: "uppercase",
                fontFamily: "Syne, sans-serif",
              }}>Healthcare Reimagined</span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(56px, 7.5vw, 100px)",
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              color: "#ffffff",
              margin: "0 0 28px",
              animation: "heroFadeUp 0.9s ease 0.1s both forwards",
            }}>
              Healthcare<br />
              <span className="gradient-text">At Home</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 18,
              fontWeight: 300,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.75,
              maxWidth: 480,
              margin: "0 0 52px",
              animation: "heroFadeUp 1s ease 0.2s both forwards",
            }}>
              Experience the future of healthcare with rapid testing,
              instant consultations, and prescription delivery — all from
              the comfort of your home.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: "flex", gap: 16, flexWrap: "wrap",
              marginBottom: 72,
              animation: "heroFadeUp 1s ease 0.35s both forwards",
            }}>
              <button className="hero-btn-primary" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "15px 32px", borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #4f8ef7 0%, #7c3aed 100%)",
                color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.01em",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                fontFamily: "Syne, sans-serif",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Download for iOS
              </button>

              <button className="hero-btn-ghost" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "15px 32px", borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff", fontSize: 15, fontWeight: 500,
                cursor: "pointer", letterSpacing: "0.01em",
                transition: "background 0.25s ease, transform 0.25s ease",
                backdropFilter: "blur(12px)",
                fontFamily: "Syne, sans-serif",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.83 1-1.3 1.66-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.66.03-1.66-.8z" />
                </svg>
                Download for Android
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: "flex", gap: 0,
              animation: "heroFadeUp 1s ease 0.5s both forwards",
            }}>
              {[["50K+", "Active Users"], ["98%", "Satisfaction"], ["24/7", "Support"]].map(([val, label], i) => (
                <div key={label} style={{
                  paddingRight: i < 2 ? 40 : 0,
                  marginRight: i < 2 ? 40 : 0,
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                }}>
                  <div className="gradient-text" style={{
                    fontSize: 38, fontWeight: 800, lineHeight: 1,
                    fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em",
                    marginBottom: 6,
                  }}>{val}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
          background: "linear-gradient(to bottom, transparent, #020816)",
          pointerEvents: "none", zIndex: 8,
        }} />

        {/* Scroll cue */}
        <div style={{
          position: "absolute", bottom: 36, left: "50%",
          transform: "translateX(-50%)", zIndex: 12,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{
            width: 1, height: 40,
            background: "linear-gradient(to bottom, rgba(79,142,247,0.6), transparent)",
            animation: "heroFloat 2s ease-in-out infinite",
          }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 – HOW IT WORKS
          ══════════════════════════════════════════ */}
      <section className="hero-root" style={{
        background: "#020816",
        padding: "120px 6%",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(79,142,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,142,247,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />

        {/* Glow accent */}
        <div style={{
          position: "absolute", top: -100, left: "50%",
          transform: "translateX(-50%)",
          width: 800, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(79,142,247,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>

          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              border: "1px solid rgba(159,92,247,0.3)",
              background: "rgba(159,92,247,0.07)",
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 10, color: "#9f5cf7", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500 }}>The Process</span>
            </div>
            <h2 style={{
              fontSize: "clamp(40px, 5vw, 68px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              margin: 0,
              fontFamily: "Syne, sans-serif",
            }}>
              <span style={{ color: "#fff" }}>How It</span>{" "}
              <span className="gradient-text">Works</span>
            </h2>
            <p style={{
              fontSize: 17, color: "rgba(255,255,255,0.45)",
              maxWidth: 480, margin: "20px auto 0",
              lineHeight: 1.7, fontWeight: 300,
            }}>
              Our platform simplifies the entire supply chain process from listing to delivery.
            </p>
          </div>

          {/* Steps grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}>
            {[
              {
                num: "01",
                title: "Suppliers List Inventory",
                desc: "Suppliers upload their products to our comprehensive marketplace with detailed specifications and real-time pricing.",
                accent: "#4f8ef7",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Pharmacies Browse & Order",
                desc: "Pharmacies search, compare, and order products they need through our intuitive, frictionless interface.",
                accent: "#9f5cf7",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "AI-Powered Insights",
                desc: "Our AI delivers smart recommendations and predictive market intelligence for better purchasing decisions.",
                accent: "#00d4ff",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" />
                  </svg>
                ),
              },
              {
                num: "04",
                title: "Fast & Reliable Delivery",
                desc: "Orders arrive within 48 hours through our dependable, temperature-controlled logistics network.",
                accent: "#5ff7c4",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect width="16" height="13" x="1" y="9" rx="2" />
                    <path d="M16 9V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4" />
                    <path d="M1 14h22" />
                  </svg>
                ),
              },
            ].map(({ num, title, desc, accent, icon }, i) => (
              <div
                key={num}
                className="hero-step"
                style={{
                  padding: "36px 32px",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.025)",
                  backdropFilter: "blur(20px)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  animation: `stepSlide 0.7s ease ${0.1 * i}s both forwards`,
                  cursor: "default",
                }}
              >
                {/* Top accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${accent}, transparent)`,
                }} />

                {/* Step number + icon */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                  <span
                    className="step-num"
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 13, fontWeight: 700,
                      color: accent,
                      letterSpacing: "0.1em",
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: `1px solid ${accent}40`,
                      background: `${accent}12`,
                      display: "inline-block",
                      transition: "transform 0.3s ease",
                    }}
                  >{num}</span>

                  <div style={{ color: accent, opacity: 0.7 }}>{icon}</div>
                </div>

                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "Syne, sans-serif",
                  color: "#fff",
                  margin: "0 0 14px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}>{title}</h3>

                <p style={{
                  fontSize: 14.5,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.7,
                  margin: 0,
                  fontWeight: 300,
                }}>{desc}</p>

                {/* Corner glow */}
                <div style={{
                  position: "absolute", bottom: -30, right: -30,
                  width: 100, height: 100, borderRadius: "50%",
                  background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ textAlign: "center", marginTop: 72 }}>
            <button style={{
              padding: "16px 48px",
              borderRadius: 14,
              border: "1px solid rgba(79,142,247,0.35)",
              background: "rgba(79,142,247,0.08)",
              color: "#4f8ef7",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.02em",
              fontFamily: "Syne, sans-serif",
              transition: "background 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(79,142,247,0.18)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(79,142,247,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Get Started Today →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}