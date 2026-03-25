"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cinematic About Section One – v2  Three.js edition
   Fresh redesign: DNA helix background + holographic image card
   ───────────────────────────────────────────────────────────── */

function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020816, 0.022);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 18);

    /* ── DNA Double Helix (right side) ── */
    const N = 320;
    const s1p: number[] = [], s2p: number[] = [], rp: number[] = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 10 - Math.PI * 5;
      const y = t * 0.42, r = 1.5;
      const x1 = Math.cos(t) * r, z1 = Math.sin(t) * r;
      const x2 = Math.cos(t + Math.PI) * r, z2 = Math.sin(t + Math.PI) * r;
      s1p.push(x1, y, z1); s2p.push(x2, y, z2);
      if (i % 18 === 0) rp.push(x1, y, z1, x2, y, z2);
    }
    const mkPts = (pos: number[], col: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, color: col, transparent: true, opacity: 0.9, sizeAttenuation: true }));
    };
    const dna = new THREE.Group();
    dna.add(mkPts(s1p, 0x4f8ef7), mkPts(s2p, 0x9f5cf7));
    const rg = new THREE.BufferGeometry();
    rg.setAttribute("position", new THREE.Float32BufferAttribute(rp, 3));
    dna.add(new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0x4f8ef7, transparent: true, opacity: 0.18 })));
    dna.position.set(5.5, 0, -1);
    scene.add(dna);

    /* ── Orbit rings around DNA ── */
    [2.4, 3.2].forEach((r, i) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.01, 4, 80),
        new THREE.MeshBasicMaterial({ color: [0x4f8ef7, 0x9f5cf7][i], transparent: true, opacity: 0.12 })
      );
      m.rotation.x = Math.PI / 2.5 + i * 0.5; m.position.copy(dna.position);
      scene.add(m);
    });

    /* ── Floating geometric shapes ── */
    const shapes: { m: THREE.Mesh; sp: number; ax: THREE.Vector3; vy: number }[] = [];
    const shapeCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f];
    for (let i = 0; i < 18; i++) {
      const geo = i % 3 === 0
        ? new THREE.IcosahedronGeometry(0.14 + Math.random() * 0.18, 0)
        : i % 3 === 1
          ? new THREE.OctahedronGeometry(0.15 + Math.random() * 0.15, 0)
          : new THREE.TetrahedronGeometry(0.18 + Math.random() * 0.15, 0);
      const m = new THREE.Mesh(geo,
        new THREE.MeshPhongMaterial({ color: shapeCols[i % 5], transparent: true, opacity: 0.14 + Math.random() * 0.14, wireframe: Math.random() > 0.5 })
      );
      m.position.set((Math.random() - 0.5) * 36, (Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12 - 4);
      shapes.push({ m, sp: 0.004 + Math.random() * 0.007, ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), vy: (Math.random() - 0.5) * 0.003 });
      scene.add(m);
    }

    /* ── Stars ── */
    const sg = new THREE.BufferGeometry(); const sp: number[] = [];
    for (let i = 0; i < 2400; i++) sp.push((Math.random() - 0.5) * 95, (Math.random() - 0.5) * 65, (Math.random() - 0.5) * 42 - 12);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.026, color: 0xffffff, transparent: true, opacity: 0.2 })));

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const bl = new THREE.PointLight(0x4f8ef7, 4.5, 50); bl.position.set(8, 5, 6); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.8, 42); pl.position.set(-8, -4, 4); scene.add(pl);
    const cl = new THREE.PointLight(0x00d4ff, 2, 32); cl.position.set(0, 8, 3); scene.add(cl);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => { mouse.x = (e.clientX / innerWidth - 0.5) * 2; mouse.y = -(e.clientY / innerHeight - 0.5) * 2; };
    addEventListener("mousemove", onMouse);
    const onResize = () => { const W2 = el.clientWidth, H2 = el.clientHeight; renderer.setSize(W2, H2); camera.aspect = W2 / H2; camera.updateProjectionMatrix(); };
    addEventListener("resize", onResize);

    const clock = new THREE.Clock(); let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick); const t = clock.getElapsedTime();
      dna.rotation.y = t * 0.2;
      shapes.forEach(({ m, sp, ax, vy }) => { m.rotateOnAxis(ax, sp); m.position.y += vy; if (Math.abs(m.position.y) > 12) m.position.y *= -0.97; });
      camera.position.x += (mouse.x * 0.65 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.42 - camera.position.y) * 0.025;
      camera.position.z = 18 + Math.sin(t * 0.1) * 0.7;
      camera.lookAt(0, 0, 0);
      bl.intensity = 4 + Math.sin(t * 1.1) * 1.0; pl.intensity = 2.5 + Math.cos(t * 0.8) * 0.7;
      renderer.render(scene, camera);
    };
    tick();

    return () => { cancelAnimationFrame(raf); removeEventListener("mousemove", onMouse); removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ── Holographic image card with scan + tilt ── */
function ImageCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const c = cardRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const rx = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -13;
    const ry = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 13;
    c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
  };
  const onLeave = () => { if (cardRef.current) cardRef.current.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)"; setHov(false); };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => setHov(true)}
      style={{
        position: "relative", borderRadius: 24, padding: 3,
        background: `linear-gradient(135deg, rgba(79,142,247,${hov ? 0.65 : 0.4}), rgba(159,92,247,${hov ? 0.45 : 0.25}), rgba(0,212,255,${hov ? 0.55 : 0.35}))`,
        boxShadow: hov ? "0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(79,142,247,0.28)" : "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(79,142,247,0.15)",
        transition: "transform 0.15s ease, background 0.4s, box-shadow 0.4s",
        animation: "a1ImgIn 0.9s ease 0.4s both", cursor: "default", willChange: "transform",
      }}
    >
      <div style={{ borderRadius: 22, overflow: "hidden", aspectRatio: "1/1", position: "relative", background: "#020816" }}>
        <Image src="/lightm.jpg" alt="Pharmacy geolocation interface" fill style={{ objectFit: "cover" }} className="dark:hidden" />
        <Image src="/darkm.jpg" alt="Dark mode pharmacy interface" fill style={{ objectFit: "cover" }} className="hidden dark:block" />

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,transparent 45%,rgba(2,8,22,0.6) 100%)", transition: "opacity 0.4s", opacity: hov ? 0.6 : 1, pointerEvents: "none" }} />

        {/* Scan line sweep */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 3, opacity: hov ? 0.07 : 0.04, transition: "opacity 0.4s", pointerEvents: "none" }}>
          <div style={{ width: "100%", height: "40%", background: "linear-gradient(to bottom,transparent,rgba(79,142,247,0.9),transparent)", animation: "a1Scan 6s linear infinite" }} />
        </div>

        {/* CinemaScope bars */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "7%", background: "#020816", opacity: 0.85, zIndex: 2 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "7%", background: "#020816", opacity: 0.85, zIndex: 2 }} />

        {/* HUD corners – all four ── */}
        {[
          { top: 16, left: 16, borderTop: "1.5px solid #4f8ef7", borderLeft: "1.5px solid #4f8ef7", borderRadius: "3px 0 0 0" },
          { top: 16, right: 16, borderTop: "1.5px solid #4f8ef7", borderRight: "1.5px solid #4f8ef7", borderRadius: "0 3px 0 0" },
          { bottom: 16, left: 16, borderBottom: "1.5px solid #4f8ef7", borderLeft: "1.5px solid #4f8ef7", borderRadius: "0 0 0 3px" },
          { bottom: 16, right: 16, borderBottom: "1.5px solid #4f8ef7", borderRight: "1.5px solid #4f8ef7", borderRadius: "0 0 3px 0" },
        ].map((s, i) => <div key={i} style={{ position: "absolute", width: 22, height: 22, zIndex: 5, opacity: hov ? 0.85 : 0.5, transition: "opacity 0.4s", ...s }} />)}

        {/* Stat badge */}
        <div style={{ position: "absolute", bottom: "14%", left: 20, zIndex: 8, padding: "10px 16px", borderRadius: 13, background: "rgba(2,8,22,0.8)", border: "1px solid rgba(79,142,247,0.35)", backdropFilter: "blur(14px)", animation: "a1Float 3.5s ease-in-out infinite" }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#4f8ef7", fontFamily: "'Syne',sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>50K+</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>Active Users</div>
        </div>

        {/* Live badge */}
        <div style={{ position: "absolute", top: "14%", right: 20, zIndex: 8, display: "flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 100, background: "rgba(2,8,22,0.8)", border: "1px solid rgba(0,212,255,0.3)", backdropFilter: "blur(12px)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", display: "inline-block", animation: "a1Dot 1.8s ease-in-out infinite" }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#00d4ff", letterSpacing: "0.12em", textTransform: "uppercase" }}>Live</span>
        </div>

        {/* Holographic shimmer on hover */}
        <div style={{ position: "absolute", inset: 0, zIndex: 4, background: hov ? "linear-gradient(135deg,rgba(79,142,247,0.06),rgba(159,92,247,0.04),rgba(0,212,255,0.06))" : "transparent", transition: "background 0.4s", pointerEvents: "none" }} />
      </div>

      {/* Ground glow */}
      <div style={{ position: "absolute", bottom: -24, left: "10%", right: "10%", height: 40, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(79,142,247,0.24) 0%,transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
    </div>
  );
}

/* ── Feature list item ── */
function ListItem({ text, index }: { text: string; index: number }) {
  const [hov, setHov] = useState(false);
  const accent = ["#4f8ef7", "#9f5cf7", "#00d4ff", "#5ff7c4", "#f7c14f", "#f75f8e"][index % 6];

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 15px", borderRadius: 13, border: `1px solid ${hov ? accent + "45" : "rgba(255,255,255,0.06)"}`, background: hov ? `${accent}0e` : "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)", transition: "all 0.3s ease", transform: hov ? "translateX(6px)" : "translateX(0)", animation: `a1ListIn 0.55s ease ${index * 0.08}s both`, cursor: "default" }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${accent}99)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: hov ? `0 0 18px ${accent}55` : "none", transition: "box-shadow 0.3s,transform 0.3s", transform: hov ? "scale(1.12) rotate(8deg)" : "scale(1)" }}>
        <svg width="13" height="11" viewBox="0 0 20 16" fill="white"><path d="M7.5 12.5L2.5 7.5L4 6L7.5 9.5L16 1L17.5 2.5L7.5 12.5Z" /></svg>
      </div>
      <span style={{ fontSize: 14.5, fontWeight: 500, color: hov ? "#fff" : "rgba(255,255,255,0.62)", transition: "color 0.3s", letterSpacing: "0.01em" }}>{text}</span>
    </div>
  );
}

/* ── Stat chip ── */
function StatChip({ val, label, accent }: { val: string; label: string; accent: string }) {
  return (
    <div style={{ textAlign: "center", padding: "16px 24px", borderRadius: 15, border: `1px solid ${accent}28`, background: `${accent}08`, backdropFilter: "blur(12px)" }}>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne',sans-serif", letterSpacing: "-0.025em", background: `linear-gradient(135deg,${accent},#fff)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1, marginBottom: 5 }}>{val}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────── */
const features = [
  "Locate nearby pharmacies instantly",
  "Real-time medicine availability",
  "Intuitive user interface",
  "Reliable geolocation services",
  "24/7 accessibility",
  "Secure and private data",
];

export default function AboutSectionOne() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes a1FadeUp  { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes a1Glow    { 0%,100%{opacity:.28} 50%{opacity:.65} }
        @keyframes a1Dot     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.5} }
        @keyframes a1Float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes a1ImgIn   { from{opacity:0;transform:perspective(900px) rotateY(-15deg) translateX(30px)} to{opacity:1;transform:perspective(900px) rotateY(0) translateX(0)} }
        @keyframes a1ListIn  { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes a1LineExp { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes a1Scan    { from{transform:translateY(-100%)} to{transform:translateY(250%)} }
      `}</style>

      <section id="about" style={{ position: "relative", background: "#020816", padding: "160px 0 140px", overflow: "hidden", fontFamily: "'DM Sans',sans-serif" }}>
        <ThreeBackground />

        {/* Grid + scanlines */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(79,142,247,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.028) 1px,transparent 1px)`, backgroundSize: "64px 64px" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.022) 3px,rgba(0,0,0,.022) 4px)" }} />

        {/* Glows */}
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 1000, height: 320, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(79,142,247,.1) 0%,transparent 68%)", zIndex: 1, pointerEvents: "none", animation: "a1Glow 5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: 0, left: "5%", width: 480, height: 240, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,92,247,.07) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "a1Glow 7s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", top: "30%", right: "5%", width: 360, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(0,212,255,.06) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "a1Glow 6s ease-in-out infinite 1s" }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 72, alignItems: "center" }}>

            {/* ── LEFT: copy ── */}
            <div style={{ animation: "a1FadeUp 0.8s ease both" }}>
              {/* Eyebrow */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 18px", borderRadius: 100, border: "1px solid rgba(79,142,247,.32)", background: "rgba(79,142,247,.08)", marginBottom: 30 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "a1Dot 2.2s ease-in-out infinite" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f8ef7", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>Healthcare Innovation</span>
              </div>

              {/* Headline */}
              <h2 style={{ fontSize: "clamp(36px,5vw,62px)", fontWeight: 800, fontFamily: "'Syne',sans-serif", lineHeight: 1.02, letterSpacing: "-0.032em", margin: "0 0 22px" }}>
                <span style={{ color: "#ffffff" }}>Revolutionizing</span><br />
                <span style={{ background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Pharmacy Services</span>
              </h2>

              {/* Divider */}
              <div style={{ width: 72, height: 2, borderRadius: 2, background: "linear-gradient(90deg,#4f8ef7,#9f5cf7)", marginBottom: 22, animation: "a1LineExp 0.9s ease 0.25s both", transformOrigin: "left" }} />

              {/* Body */}
              <p style={{ fontSize: 17, fontWeight: 300, color: "rgba(255,255,255,.47)", lineHeight: 1.78, maxWidth: 490, marginBottom: 36 }}>
                Our system combines cutting-edge geolocation tools with reliable pharmacy services to bring convenience and accessibility to healthcare.
              </p>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 36, animation: "a1FadeUp 0.9s ease 0.35s both" }}>
                <StatChip val="50K+" label="Active Users" accent="#4f8ef7" />
                <StatChip val="98%" label="Satisfaction" accent="#9f5cf7" />
                <StatChip val="24/7" label="Support" accent="#00d4ff" />
              </div>

              {/* Features label */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.32)", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>Key Features</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {features.map((text, i) => <ListItem key={text} text={text} index={i} />)}
              </div>

              {/* CTAs */}
              <div style={{ marginTop: 42, display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "linear-gradient(135deg,#4f8ef7,#7c3aed)"; b.style.color = "#fff"; b.style.transform = "translateY(-2px)"; b.style.boxShadow = "0 14px 36px rgba(79,142,247,.42)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(79,142,247,.08)"; b.style.color = "#4f8ef7"; b.style.transform = "translateY(0)"; b.style.boxShadow = "none"; }}
                  style={{ padding: "14px 36px", borderRadius: 14, border: "1px solid rgba(79,142,247,.35)", background: "rgba(79,142,247,.08)", color: "#4f8ef7", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Syne',sans-serif", transition: "all 0.28s ease" }}>
                  Explore Platform →
                </button>
                <button
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(255,255,255,.28)"; b.style.color = "#fff"; b.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(255,255,255,.1)"; b.style.color = "rgba(255,255,255,.52)"; b.style.transform = "translateY(0)"; }}
                  style={{ padding: "14px 36px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.52)", fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Syne',sans-serif", transition: "all 0.28s ease" }}>
                  Watch Demo
                </button>
              </div>
            </div>

            {/* ── RIGHT: image ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 480 }}>
                <ImageCard />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}