"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cinematic Contact + Newsletter Section  –  Three.js edition
   Dark-cosmos design system: final section of the full suite
   ───────────────────────────────────────────────────────────── */

/* ── 3-D background: signal rings + floating message planes ── */
function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x020816, 0.026);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 180); camera.position.set(0, 0, 18);

    /* Concentric signal rings (support / broadcast motif) */
    const signalRings: THREE.Mesh[] = [];
    [3.5, 5.5, 7.5, 9.5, 11.5].forEach((r, i) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.016 - i * 0.002, 4, 80),
        new THREE.MeshBasicMaterial({ color: [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0x4f8ef7][i], transparent: true, opacity: 0.14 - i * 0.018 })
      );
      m.rotation.x = Math.PI / 2; m.position.set(6, -1, -6);
      signalRings.push(m); scene.add(m);
    });

    /* Floating message / envelope planes */
    const planes: { m: THREE.Mesh; sp: number; ax: THREE.Vector3; ph: number }[] = [];
    const planeCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f];
    for (let i = 0; i < 20; i++) {
      const w = 0.7 + Math.random() * 0.6, h = 0.45 + Math.random() * 0.4;
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: planeCols[i % 5], transparent: true, opacity: 0.04 + Math.random() * 0.065, side: THREE.DoubleSide })
      );
      m.position.set((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 28, (Math.random() - 0.5) * 14 - 4);
      m.rotation.set(Math.random() * Math.PI * 0.4, Math.random() * Math.PI, Math.random() * Math.PI * 0.4);
      const ax = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      planes.push({ m, sp: 0.002 + Math.random() * 0.004, ax, ph: i * 0.8 });
      scene.add(m);
    }

    /* Icosahedra floaters */
    const floaters: { m: THREE.Mesh; sp: number; ax: THREE.Vector3 }[] = [];
    const fCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.13 + Math.random() * 0.17, 0),
        new THREE.MeshPhongMaterial({ color: fCols[i % 6], transparent: true, opacity: 0.11 + Math.random() * 0.12, wireframe: Math.random() > 0.4 })
      );
      m.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14 - 4);
      floaters.push({ m, sp: 0.004 + Math.random() * 0.007, ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() });
      scene.add(m);
    }

    /* Stars */
    const sg = new THREE.BufferGeometry(); const sp: number[] = [];
    for (let i = 0; i < 2500; i++) sp.push((Math.random() - 0.5) * 95, (Math.random() - 0.5) * 65, (Math.random() - 0.5) * 42 - 12);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.025, color: 0xffffff, transparent: true, opacity: 0.19 })));

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const bl = new THREE.PointLight(0x4f8ef7, 4, 50); bl.position.set(8, 5, 6); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 42); pl.position.set(-8, -4, 4); scene.add(pl);
    scene.add(new THREE.PointLight(0x00d4ff, 2, 32)).position.set(0, 9, 3);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => { mouse.x = (e.clientX / innerWidth - 0.5) * 2; mouse.y = -(e.clientY / innerHeight - 0.5) * 2; };
    addEventListener("mousemove", onMouse);
    const onResize = () => { const W2 = el.clientWidth, H2 = el.clientHeight; renderer.setSize(W2, H2); camera.aspect = W2 / H2; camera.updateProjectionMatrix(); };
    addEventListener("resize", onResize);
    const clock = new THREE.Clock(); let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick); const t = clock.getElapsedTime();
      signalRings.forEach((r, i) => {
        r.scale.setScalar(1 + Math.sin(t * 0.8 + i * 0.7) * 0.04);
        (r.material as THREE.MeshBasicMaterial).opacity = (0.14 - i * 0.018) * (0.6 + Math.sin(t * 0.6 + i) * 0.4);
      });
      planes.forEach(({ m, sp, ax, ph }) => { m.rotateOnAxis(ax, sp * 0.5); m.position.y += Math.sin(t * 0.3 + ph) * 0.002; });
      floaters.forEach(({ m, sp, ax }) => m.rotateOnAxis(ax, sp));
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.024;
      camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.024;
      camera.position.z = 18 + Math.sin(t * 0.1) * 0.6;
      camera.lookAt(0, 0, 0);
      bl.intensity = 3.5 + Math.sin(t * 1.0) * 1.0; pl.intensity = 2.2 + Math.cos(t * 0.8) * 0.7;
      renderer.render(scene, camera);
    };
    tick();
    return () => { cancelAnimationFrame(raf); removeEventListener("mousemove", onMouse); removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ── Styled input / textarea field ── */
function Field({ label, type = "text", placeholder, rows, icon }: {
  label: string; type?: string; placeholder: string; rows?: number; icon: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const base: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused ? "rgba(79,142,247,0.65)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 13, padding: "13px 16px 13px 46px",
    color: "#fff", fontSize: 14, outline: "none",
    fontFamily: "'DM Sans',sans-serif",
    transition: "border-color 0.3s, box-shadow 0.3s",
    boxShadow: focused ? "0 0 0 3px rgba(79,142,247,0.12)" : "none",
    resize: "none" as const, backdropFilter: "blur(12px)",
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: focused ? "#4f8ef7" : "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 9, transition: "color 0.3s", fontFamily: "'Syne',sans-serif" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: rows ? 14 : "50%", transform: rows ? "none" : "translateY(-50%)", color: focused ? "#4f8ef7" : "rgba(255,255,255,0.25)", transition: "color 0.3s", pointerEvents: "none" }}>{icon}</div>
        {rows
          ? <textarea rows={rows} placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />
          : <input type={type} placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...base, lineHeight: "normal" }} />
        }
      </div>
    </div>
  );
}

/* ── Newsletter side panel ── */
function NewsletterPanel() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div style={{ position: "relative", padding: "34px 30px", borderRadius: 22, border: "1px solid rgba(159,92,247,0.22)", background: "linear-gradient(155deg,rgba(255,255,255,0.03),rgba(159,92,247,0.06))", backdropFilter: "blur(18px)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#9f5cf7,#4f8ef7,transparent)" }} />
      <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(159,92,247,0.16) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(159,92,247,0.12)", border: "1px solid rgba(159,92,247,0.32)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: "#9f5cf7" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Stay in the Loop</h3>
      <p style={{ fontSize: 13.5, fontWeight: 300, color: "rgba(255,255,255,0.42)", lineHeight: 1.72, marginBottom: 24 }}>Get pharmacy tech insights, product updates, and industry news delivered directly to your inbox.</p>

      {[{ label: "Weekly digest", color: "#4f8ef7" }, { label: "No spam, ever", color: "#5ff7c4" }, { label: "Unsubscribe anytime", color: "#9f5cf7" }].map(({ label, color }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.48)" }}>{label}</span>
        </div>
      ))}

      {!subscribed ? (
        <div style={{ marginTop: 24 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(159,92,247,0.6)" strokeWidth="1.8" strokeLinecap="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              placeholder="your@email.com"
              style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: 12, border: `1px solid ${focused ? "rgba(159,92,247,0.65)" : "rgba(255,255,255,0.1)"}`, background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13.5, outline: "none", fontFamily: "'DM Sans',sans-serif", backdropFilter: "blur(12px)", transition: "border-color 0.3s, box-shadow 0.3s", boxShadow: focused ? "0 0 0 3px rgba(159,92,247,0.12)" : "none" }}
            />
          </div>
          <button onClick={() => email.includes("@") && setSubscribed(true)}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 32px rgba(159,92,247,0.45)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#9f5cf7,#4f8ef7)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Syne',sans-serif", transition: "all 0.28s ease" }}>
            Subscribe →
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 24, padding: "16px 18px", borderRadius: 13, border: "1px solid rgba(95,247,196,0.3)", background: "rgba(95,247,196,0.06)", textAlign: "center", animation: "ctSuccess 0.5s ease both" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#5ff7c4", fontFamily: "'Syne',sans-serif" }}>✦ You're subscribed!</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>First issue arrives soon.</div>
        </div>
      )}

      <div style={{ display: "flex", marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {[["4.2K+", "Subscribers"], ["Weekly", "Cadence"], ["98%", "Open Rate"]].map(([val, label], i) => (
          <div key={label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em", background: "linear-gradient(135deg,#9f5cf7,#4f8ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{val}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: -32, left: -32, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(79,142,247,0.14) 0%,transparent 70%)", pointerEvents: "none" }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main Contact component
   ────────────────────────────────────────────────── */
export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setSending(true);
    setTimeout(() => { setSending(false); setSubmitted(true); }, 1800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes ctFadeUp  { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ctGlow    { 0%,100%{opacity:.28} 50%{opacity:.65} }
        @keyframes ctDot     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.5} }
        @keyframes ctSpin    { to{transform:rotate(360deg)} }
        @keyframes ctLineExp { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes ctSuccess { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
        input::placeholder,textarea::placeholder { color:rgba(255,255,255,.26)!important }
      `}</style>

      <section id="contact" style={{ position: "relative", background: "#020816", padding: "120px 0 150px", overflow: "hidden", fontFamily: "'DM Sans',sans-serif" }}>
        <ThreeBackground />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(79,142,247,.026) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.026) 1px,transparent 1px)`, backgroundSize: "64px 64px" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px)" }} />
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 1000, height: 340, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(79,142,247,.1) 0%,transparent 68%)", zIndex: 1, pointerEvents: "none", animation: "ctGlow 5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: 0, right: "6%", width: 500, height: 260, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,92,247,.08) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "ctGlow 7s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "4%", width: 380, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(0,212,255,.05) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "ctGlow 6s ease-in-out infinite 1s" }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 18px", borderRadius: 100, border: "1px solid rgba(79,142,247,.32)", background: "rgba(79,142,247,.08)", marginBottom: 26, animation: "ctFadeUp .7s ease both" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "ctDot 2.2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f8ef7", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>Support</span>
            </div>
            <h2 style={{ fontSize: "clamp(34px,5vw,62px)", fontWeight: 800, fontFamily: "'Syne',sans-serif", lineHeight: 1.0, letterSpacing: "-0.032em", margin: "0 0 18px", animation: "ctFadeUp .85s ease .1s both" }}>
              <span style={{ color: "#fff" }}>Open a</span>{" "}
              <span style={{ background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Support Ticket</span>
            </h2>
            <div style={{ width: 72, height: 2, borderRadius: 2, background: "linear-gradient(90deg,#4f8ef7,#9f5cf7)", margin: "0 auto 20px", animation: "ctLineExp .9s ease .25s both", transformOrigin: "center" }} />
            <p style={{ fontSize: 16.5, fontWeight: 300, color: "rgba(255,255,255,.46)", lineHeight: 1.78, maxWidth: 520, margin: "0 auto", animation: "ctFadeUp .9s ease .2s both" }}>
              Our dedicated support team is here to assist you with any issues or inquiries. Prompt, reliable help — always.
            </p>
          </div>

          {/* ── Two-column grid ── */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: 26, alignItems: "start" }}>

            {/* ── Contact form ── */}
            <div style={{ position: "relative", padding: "42px 38px", borderRadius: 22, border: "1px solid rgba(79,142,247,0.2)", background: "linear-gradient(155deg,rgba(255,255,255,0.04),rgba(79,142,247,0.05))", backdropFilter: "blur(20px)", overflow: "hidden", animation: "ctFadeUp .85s ease both" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#4f8ef7,#9f5cf7,transparent)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(79,142,247,0.11)", border: "1px solid rgba(79,142,247,0.32)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f8ef7", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: "#fff", margin: 0, letterSpacing: "-0.016em" }}>Need Help with Our Systems?</h3>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.36)", margin: "3px 0 0", fontWeight: 300 }}>We'll respond within 24 hours</p>
                </div>
              </div>

              <div style={{ height: 1, background: "linear-gradient(90deg,rgba(79,142,247,0.28),transparent)", marginBottom: 26 }} />

              {submitted ? (
                <div style={{ textAlign: "center", padding: "44px 20px", animation: "ctSuccess 0.5s ease both" }}>
                  <div style={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(95,247,196,0.1)", border: "1px solid rgba(95,247,196,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5ff7c4" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <h4 style={{ fontSize: 19, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: 10 }}>Ticket Submitted!</h4>
                  <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, maxWidth: 360, margin: "0 auto 24px" }}>Our team will review your request and get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} style={{ padding: "9px 26px", borderRadius: 11, border: "1px solid rgba(95,247,196,0.28)", background: "rgba(95,247,196,0.06)", color: "#5ff7c4", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", fontFamily: "'Syne',sans-serif" }}>Submit Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
                    <Field label="Your Name" placeholder="Enter your name"
                      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>}
                    />
                    <Field label="Your Email" type="email" placeholder="Enter your email"
                      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>}
                    />
                  </div>
                  <Field label="Your Message" placeholder="Describe your issue or provide feedback" rows={5}
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                  />
                  <button type="submit" disabled={sending}
                    onMouseEnter={e => { if (!sending) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(79,142,247,0.45)"; }}}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 34px", borderRadius: 14, border: "none", background: sending ? "rgba(79,142,247,0.4)" : "linear-gradient(135deg,#4f8ef7,#7c3aed)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", letterSpacing: "0.04em", fontFamily: "'Syne',sans-serif", transition: "all 0.28s ease" }}
                  >
                    {sending
                      ? <><div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "ctSpin 0.8s linear infinite" }} /> Sending…</>
                      : <>Submit Ticket <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg></>
                    }
                  </button>
                </form>
              )}
              <div style={{ position: "absolute", bottom: -35, right: -35, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
            </div>

            {/* ── Right column ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "ctFadeUp .85s ease .15s both" }}>
              <NewsletterPanel />

              {/* Quick-stat chips */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { icon: "#00d4ff", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z", label: "Response", value: "<24h", accent: "#00d4ff" },
                  { icon: "#5ff7c4", path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Uptime", value: "99.9%", accent: "#5ff7c4" },
                ].map(({ label, value, accent, path, icon }) => (
                  <div key={label} style={{ padding: "16px 14px", borderRadius: 14, border: `1px solid ${accent}22`, background: `${accent}08`, backdropFilter: "blur(12px)", textAlign: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={icon} strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }}><path d={path} /></svg>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: accent, letterSpacing: "-0.02em" }}>{value}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}