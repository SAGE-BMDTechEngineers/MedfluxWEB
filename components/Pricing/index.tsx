"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cinematic Pricing Section  –  Three.js edition
   Dark-cosmos design system: complete page suite
   ───────────────────────────────────────────────────────────── */

/* ── 3-D background: floating gem crystals + data planes ── */
function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020816, 0.026);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 20);

    const accentCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];

    /* Octahedron gems */
    const gems: { m: THREE.Mesh; sp: number; ax: THREE.Vector3; ph: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const col = accentCols[i % 6];
      const sc = 0.18 + Math.random() * 0.32;
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(sc, 0),
        new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.18 + Math.random() * 0.18, shininess: 120, wireframe: Math.random() > 0.5 })
      );
      m.position.set((Math.random() - 0.5) * 46, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18 - 5);
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      gems.push({ m, sp: 0.004 + Math.random() * 0.008, ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), ph: i * 0.6 });
      scene.add(m);
    }

    /* Coin/disc shapes (pricing motif) */
    const coins: { m: THREE.Mesh; sp: number; ph: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const col = accentCols[i % 6];
      const r = 0.3 + Math.random() * 0.3;
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, 0.06, 24),
        new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.12 + Math.random() * 0.1, shininess: 80 })
      );
      m.position.set((Math.random() - 0.5) * 42, (Math.random() - 0.5) * 28, (Math.random() - 0.5) * 14 - 5);
      m.rotation.set(Math.random() * Math.PI, 0, Math.random() * 0.5);
      coins.push({ m, sp: 0.005 + Math.random() * 0.006, ph: i * 0.9 });
      scene.add(m);
    }

    /* Torus rings depth */
    const rings: THREE.Mesh[] = [];
    [[10, 0.012, 0x4f8ef7, 0.08], [14, 0.007, 0x9f5cf7, 0.055], [7, 0.016, 0x00d4ff, 0.1]].forEach(([r, t, c, o]) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r as number, t as number, 6, 100), new THREE.MeshBasicMaterial({ color: c as number, transparent: true, opacity: o as number }));
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0); m.position.z = -12;
      rings.push(m); scene.add(m);
    });

    /* Stars */
    const sg = new THREE.BufferGeometry(); const sp: number[] = [];
    for (let i = 0; i < 2800; i++) sp.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 45 - 14);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.024, color: 0xffffff, transparent: true, opacity: 0.2 })));

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const bl = new THREE.PointLight(0x4f8ef7, 4, 55); bl.position.set(8, 5, 7); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 45); pl.position.set(-8, -4, 5); scene.add(pl);
    scene.add(new THREE.PointLight(0x5ff7c4, 1.8, 35)).position.set(0, 10, 4);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => { mouse.x = (e.clientX / innerWidth - 0.5) * 2; mouse.y = -(e.clientY / innerHeight - 0.5) * 2; };
    addEventListener("mousemove", onMouse);
    const onResize = () => { const W2 = el.clientWidth, H2 = el.clientHeight; renderer.setSize(W2, H2); camera.aspect = W2 / H2; camera.updateProjectionMatrix(); };
    addEventListener("resize", onResize);

    const clock = new THREE.Clock(); let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      gems.forEach(({ m, sp, ax, ph }) => { m.rotateOnAxis(ax, sp); m.position.y += Math.sin(t * 0.4 + ph) * 0.002; });
      coins.forEach(({ m, sp, ph }) => { m.rotation.y += sp; m.position.y += Math.sin(t * 0.35 + ph) * 0.002; });
      rings[0].rotation.z += 0.004; rings[1].rotation.y += 0.003; rings[2].rotation.x += 0.005;
      camera.position.x += (mouse.x * 0.65 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.025;
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

/* ── Offer list item ── */
function OfferItem({ text, active }: { text: string; active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: active ? "linear-gradient(135deg,#4f8ef7,#9f5cf7)" : "rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {active
          ? <svg width="11" height="11" viewBox="0 0 20 16" fill="white"><path d="M7.5 12.5L2.5 7.5L4 6L7.5 9.5L16 1L17.5 2.5L7.5 12.5Z" /></svg>
          : <svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)" stroke="none"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
        }
      </div>
      <span style={{ fontSize: 13.5, color: active ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.28)", fontWeight: active ? 400 : 300 }}>{text}</span>
    </div>
  );
}

/* ── Single pricing card ── */
const plans = [
  {
    name: "Lite", monthly: "20", yearly: "250", accent: "#4f8ef7",
    subtitle: "Perfect for small-scale businesses looking to explore key features.",
    badge: null, popular: false,
    features: [
      { text: "Inventory Management", active: true },
      { text: "Prescription Handling", active: true },
      { text: "AI Health Assistant", active: true },
      { text: "Basic Analytics", active: true },
      { text: "Chat Support", active: false },
      { text: "Delivery Management", active: false },
    ],
  },
  {
    name: "Basic", monthly: "35", yearly: "450", accent: "#9f5cf7",
    subtitle: "Designed for growing businesses with moderate usage.",
    badge: "Most Popular", popular: true,
    features: [
      { text: "Inventory Management", active: true },
      { text: "Prescription Handling", active: true },
      { text: "AI Health Assistant", active: true },
      { text: "Advanced Analytics", active: true },
      { text: "Chat Support", active: true },
      { text: "Delivery Management", active: true },
    ],
  },
  {
    name: "Plus", monthly: "45", yearly: "550", accent: "#00d4ff",
    subtitle: "Best for enterprises requiring full-scale integration and premium features.",
    badge: "Enterprise", popular: false,
    features: [
      { text: "Inventory Management & Invoice", active: true },
      { text: "Prescription Handling", active: true },
      { text: "AI Health Assistant", active: true },
      { text: "Advanced Analytics & Reports", active: true },
      { text: "Chat & Delivery Management", active: true },
      { text: "Rapid Test Integration", active: true },
    ],
  },
];

function PricingCard({ plan, isMonthly, index }: { plan: typeof plans[0]; isMonthly: boolean; index: number }) {
  const [hov, setHov] = useState(false);
  const price = isMonthly ? plan.monthly : plan.yearly;
  const period = isMonthly ? "/ mo" : "/ yr";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        borderRadius: 24,
        padding: plan.popular ? "3px" : "0",
        background: plan.popular
          ? `linear-gradient(135deg, ${plan.accent}, rgba(159,92,247,0.8), rgba(0,212,255,0.6))`
          : "transparent",
        animation: `pCardIn 0.65s ease ${index * 0.12}s both`,
        transform: hov ? "translateY(-10px)" : plan.popular ? "translateY(-6px)" : "translateY(0)",
        transition: "transform 0.4s ease",
        boxShadow: hov || plan.popular ? `0 30px 80px ${plan.accent}25` : "none",
      }}
    >
      <div style={{
        borderRadius: plan.popular ? 22 : 24,
        padding: "36px 32px 32px",
        border: `1px solid ${hov ? plan.accent + "55" : plan.popular ? "transparent" : "rgba(255,255,255,0.08)"}`,
        background: plan.popular
          ? `linear-gradient(155deg, rgba(20,12,40,0.97), rgba(10,8,30,0.99))`
          : hov
            ? `linear-gradient(155deg, rgba(255,255,255,0.05), ${plan.accent}0e)`
            : "rgba(255,255,255,0.025)",
        backdropFilter: "blur(20px)",
        height: "100%",
        display: "flex", flexDirection: "column",
        transition: "border-color 0.35s, background 0.35s",
        position: "relative", overflow: "hidden",
      }}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${plan.accent},transparent)`, opacity: hov || plan.popular ? 1 : 0.3, transition: "opacity 0.35s" }} />

        {/* Badge */}
        {plan.badge && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100, background: `linear-gradient(135deg,${plan.accent}25,${plan.accent}10)`, border: `1px solid ${plan.accent}45`, color: plan.accent }}>
              {plan.popular && <svg width="10" height="10" viewBox="0 0 24 24" fill={plan.accent}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
              {plan.badge}
            </span>
          </div>
        )}

        {/* Plan name */}
        <div style={{ fontSize: 14, fontWeight: 700, color: plan.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>{plan.name}</div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 400, alignSelf: "flex-start", marginTop: 12 }}>$</span>
          <span style={{ fontSize: 58, fontWeight: 800, fontFamily: "'Syne',sans-serif", letterSpacing: "-0.04em", lineHeight: 1, color: "#fff", transition: "all 0.4s ease" }}>{price}</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 400, marginBottom: 4 }}>{period}</span>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>{plan.subtitle}</p>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg,${plan.accent}35,transparent)`, marginBottom: 22 }} />

        {/* Features */}
        <div style={{ flex: 1, marginBottom: 28 }}>
          {plan.features.map(f => <OfferItem key={f.text} text={f.text} active={f.active} />)}
        </div>

        {/* CTA */}
        <button
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            if (!plan.popular) { b.style.background = `linear-gradient(135deg,${plan.accent},${plan.accent}cc)`; b.style.color = "#fff"; b.style.transform = "translateY(-2px)"; b.style.boxShadow = `0 12px 30px ${plan.accent}45`; }
            else { b.style.transform = "translateY(-2px)"; b.style.boxShadow = `0 12px 30px ${plan.accent}55`; }
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.transform = "translateY(0)"; b.style.boxShadow = plan.popular ? `0 8px 24px ${plan.accent}35` : "none";
            if (!plan.popular) { b.style.background = "rgba(255,255,255,0.04)"; b.style.color = "rgba(255,255,255,0.55)"; }
          }}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 14,
            border: plan.popular ? "none" : `1px solid ${plan.accent}40`,
            background: plan.popular ? `linear-gradient(135deg,${plan.accent},#7c3aed)` : "rgba(255,255,255,0.04)",
            color: plan.popular ? "#fff" : "rgba(255,255,255,0.55)",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            letterSpacing: "0.04em", fontFamily: "'Syne',sans-serif",
            transition: "all 0.28s ease",
            boxShadow: plan.popular ? `0 8px 24px ${plan.accent}35` : "none",
          }}
        >
          Get Started with {plan.name} →
        </button>

        {/* Corner glow */}
        <div style={{ position: "absolute", bottom: -35, right: -35, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle,${plan.accent}22 0%,transparent 70%)`, opacity: hov || plan.popular ? 1 : 0.3, transition: "opacity 0.35s", pointerEvents: "none" }} />

        {/* Big watermark number */}
        <div style={{ position: "absolute", bottom: 60, right: 18, fontSize: 90, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: plan.accent, opacity: 0.04, lineHeight: 1, userSelect: "none", letterSpacing: "-0.04em" }}>{index + 1}</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main Pricing component
   ────────────────────────────────────────────────── */
export default function Pricing() {
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes pFadeUp  { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pGlow    { 0%,100%{opacity:.28} 50%{opacity:.65} }
        @keyframes pDot     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.5} }
        @keyframes pCardIn  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pLineExp { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes pPriceFlip { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <section id="pricing" style={{ position: "relative", background: "#020816", padding: "120px 0 160px", overflow: "hidden", fontFamily: "'DM Sans',sans-serif" }}>
        <ThreeBackground />

        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(79,142,247,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.028) 1px,transparent 1px)`, backgroundSize: "64px 64px" }} />
        {/* Scanlines */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px)" }} />

        {/* Glows */}
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 1100, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(79,142,247,.1) 0%,transparent 68%)", zIndex: 1, pointerEvents: "none", animation: "pGlow 5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: 0, right: "6%", width: 520, height: 280, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(95,247,196,.06) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "pGlow 7s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "4%", width: 400, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,92,247,.07) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "pGlow 6s ease-in-out infinite 1s" }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>

          {/* Header */}
          <div style={{ maxWidth: 660, marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 18px", borderRadius: 100, border: "1px solid rgba(95,247,196,.32)", background: "rgba(95,247,196,.07)", marginBottom: 28, animation: "pFadeUp .7s ease both" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5ff7c4", display: "inline-block", animation: "pDot 2.2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#5ff7c4", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>Pricing Plans</span>
            </div>

            <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 800, fontFamily: "'Syne',sans-serif", lineHeight: 1.0, letterSpacing: "-0.032em", margin: "0 0 20px", animation: "pFadeUp .85s ease .1s both" }}>
              <span style={{ color: "#ffffff" }}>Simple &</span>{" "}
              <span style={{ background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Affordable</span>
              <br />
              <span style={{ color: "#ffffff" }}>Pricing</span>
            </h2>

            <div style={{ width: 72, height: 2, borderRadius: 2, background: "linear-gradient(90deg,#5ff7c4,#4f8ef7)", marginBottom: 22, animation: "pLineExp .9s ease .25s both", transformOrigin: "left" }} />

            <p style={{ fontSize: 17, fontWeight: 300, color: "rgba(255,255,255,.46)", lineHeight: 1.78, margin: 0, animation: "pFadeUp .9s ease .2s both" }}>
              Our pricing is designed to be simple and accessible for all users,
              ensuring affordability without compromising on quality.
            </p>
          </div>

          {/* Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 60, animation: "pFadeUp .9s ease .3s both" }}>
            <span
              onClick={() => setIsMonthly(true)}
              style={{ fontSize: 14, fontWeight: 700, color: isMonthly ? "#4f8ef7" : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "'Syne',sans-serif", letterSpacing: "0.04em", transition: "color 0.3s", userSelect: "none" }}
            >Monthly</span>

            {/* Toggle switch */}
            <div onClick={() => setIsMonthly(v => !v)} style={{ position: "relative", width: 56, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", transition: "border-color 0.3s" }}>
              <div style={{
                position: "absolute", top: 3, left: isMonthly ? 3 : 27, width: 20, height: 20, borderRadius: "50%",
                background: "linear-gradient(135deg,#4f8ef7,#9f5cf7)",
                boxShadow: "0 0 12px rgba(79,142,247,0.6)",
                transition: "left 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                onClick={() => setIsMonthly(false)}
                style={{ fontSize: 14, fontWeight: 700, color: !isMonthly ? "#4f8ef7" : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "'Syne',sans-serif", letterSpacing: "0.04em", transition: "color 0.3s", userSelect: "none" }}
              >Yearly</span>
              {!isMonthly && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "rgba(95,247,196,0.12)", border: "1px solid rgba(95,247,196,0.3)", color: "#5ff7c4", letterSpacing: "0.1em", textTransform: "uppercase" }}>Save 30%</span>
              )}
            </div>
          </div>

          {/* Cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 24, alignItems: "start" }}>
            {plans.map((plan, i) => (
              <PricingCard key={plan.name} plan={plan} isMonthly={isMonthly} index={i} />
            ))}
          </div>

          {/* Bottom note */}
          <div style={{ textAlign: "center", marginTop: 60, animation: "pFadeUp .8s ease .55s both" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", margin: "0 0 20px" }}>All plans include a 14-day free trial. No credit card required.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ height: 1, width: 80, background: "linear-gradient(to right,transparent,rgba(79,142,247,.4))" }} />
              <button
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(79,142,247,0.16)"; b.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(79,142,247,0.08)"; b.style.transform = "translateY(0)"; }}
                style={{ padding: "12px 36px", borderRadius: 14, border: "1px solid rgba(79,142,247,.35)", background: "rgba(79,142,247,.08)", color: "#4f8ef7", fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Syne',sans-serif", transition: "all 0.28s ease" }}
              >
                Compare All Features →
              </button>
              <div style={{ height: 1, width: 80, background: "linear-gradient(to left,transparent,rgba(79,142,247,.4))" }} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}