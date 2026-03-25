"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cinematic Testimonials Section  –  Three.js edition
   Dark-cosmos design system: Hero / Features / Video / Brands / About
   ───────────────────────────────────────────────────────────── */

const testimonialData = [
  {
    id: 1,
    name: "Mr. Ray",
    designation: "Founder @ Raydos Pharmacy",
    content:
      "This system has transformed how we operate. It's intuitive, user-friendly, and beautifully designed, allowing our members to focus on what truly matters. A game-changer for community building!",
    image: "/images/blog/blog5.jpg",
    star: 5,
    accent: "#4f8ef7",
  },
  {
    id: 2,
    name: "Mr. Awatey",
    designation: "Founder @ Klan Pharmacy",
    content:
      "Our entire team is amazed by the simplicity and effectiveness of this system. It's not just clean and distraction-free—it's a tool that redefines convenience and efficiency.",
    image: "/images/blog/blog2.jpg",
    star: 5,
    accent: "#9f5cf7",
  },
  {
    id: 3,
    name: "Mr. Micheal",
    designation: "Founder @ Hail Pharmacy",
    content:
      "We've seen a remarkable improvement in how our members engage and interact thanks to this system. It's intuitive and delivers exactly what we needed to enhance productivity.",
    image: "/images/blog/blog3.jpg",
    star: 5,
    accent: "#00d4ff",
  },
];

/* ── 3-D background: speech-bubble geometry + quote marks ── */
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

    /* ── Floating rounded cubes (quote-card motif) ── */
    const cubes: { m: THREE.Mesh; sp: number; ax: THREE.Vector3; vy: number; ph: number }[] = [];
    const cubeCols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];
    for (let i = 0; i < 20; i++) {
      const sc = 0.22 + Math.random() * 0.32;
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(sc * 1.6, sc, sc * 0.18),
        new THREE.MeshPhongMaterial({
          color: cubeCols[i % 6], transparent: true,
          opacity: 0.1 + Math.random() * 0.14, shininess: 80,
          wireframe: Math.random() > 0.55,
        })
      );
      m.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14 - 4);
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      cubes.push({
        m, sp: 0.003 + Math.random() * 0.006,
        ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        vy: (Math.random() - 0.5) * 0.003, ph: i * 0.65,
      });
      scene.add(m);
    }

    /* ── Five-pointed star particles (review stars motif) ── */
    const starPositions: number[] = [];
    for (let i = 0; i < 2600; i++)
      starPositions.push((Math.random() - 0.5) * 95, (Math.random() - 0.5) * 65, (Math.random() - 0.5) * 42 - 12);
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.026, color: 0xffffff, transparent: true, opacity: 0.2 })));

    /* ── Large sweeping torus arcs ── */
    const torii: THREE.Mesh[] = [];
    [[9, 0.012, 0x4f8ef7, 0.09], [13, 0.007, 0x9f5cf7, 0.06], [6, 0.016, 0x00d4ff, 0.11]].forEach(([r, t, c, o]) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r as number, t as number, 6, 100),
        new THREE.MeshBasicMaterial({ color: c as number, transparent: true, opacity: o as number })
      );
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      m.position.z = -12;
      torii.push(m); scene.add(m);
    });

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const bl = new THREE.PointLight(0x4f8ef7, 4, 50); bl.position.set(8, 5, 6); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 42); pl.position.set(-8, -4, 4); scene.add(pl);
    scene.add(new THREE.PointLight(0x00d4ff, 2, 32)).position.set(0, 9, 3);

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
      cubes.forEach(({ m, sp, ax, vy, ph }) => {
        m.rotateOnAxis(ax, sp);
        m.position.y += Math.sin(t * 0.4 + ph) * 0.002;
        m.position.x += Math.sin(t * 0.3 + ph * 0.5) * 0.001;
      });
      torii[0].rotation.z += 0.005;
      torii[1].rotation.y += 0.003;
      torii[2].rotation.x += 0.006;
      camera.position.x += (mouse.x * 0.65 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.025;
      camera.position.z = 18 + Math.sin(t * 0.1) * 0.7;
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

/* ── Star rating ── */
function Stars({ count, accent }: { count: number; accent: string }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < count ? accent : "rgba(255,255,255,0.15)"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Single testimonial card ── */
function TestimonialCard({
  testimonial,
  index,
  active,
  onHover,
}: {
  testimonial: typeof testimonialData[0];
  index: number;
  active: boolean;
  onHover: (i: number | null) => void;
}) {
  const { name, designation, content, image, star, accent } = testimonial;

  return (
    <div
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: "relative",
        padding: "38px 34px 32px",
        borderRadius: 22,
        border: `1px solid ${active ? accent + "55" : "rgba(255,255,255,0.07)"}`,
        background: active
          ? `linear-gradient(155deg, rgba(255,255,255,0.06), ${accent}0e)`
          : "rgba(255,255,255,0.025)",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
        transition: "all 0.4s ease",
        transform: active ? "translateY(-10px)" : "translateY(0)",
        boxShadow: active ? `0 28px 70px ${accent}20, 0 0 0 1px ${accent}18` : "none",
        animation: `tCardIn 0.65s ease ${index * 0.12}s both`,
        cursor: "default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
        opacity: active ? 1 : 0.3, transition: "opacity 0.4s",
      }} />

      {/* Giant quote mark */}
      <div style={{
        position: "absolute", top: 16, right: 24,
        fontSize: 110, lineHeight: 1, fontWeight: 900,
        fontFamily: "'Syne',sans-serif",
        color: accent, opacity: active ? 0.12 : 0.05,
        transition: "opacity 0.4s", userSelect: "none",
        letterSpacing: "-0.05em",
      }}>"</div>

      {/* Stars */}
      <Stars count={star} accent={accent} />

      {/* Quote */}
      <p style={{
        fontSize: 15.5,
        fontWeight: 300,
        color: active ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.46)",
        lineHeight: 1.78,
        margin: "0 0 32px",
        flex: 1,
        transition: "color 0.4s",
        fontStyle: "italic",
        position: "relative", zIndex: 1,
      }}>
        "{content}"
      </p>

      {/* Divider */}
      <div style={{
        height: 1, marginBottom: 24,
        background: `linear-gradient(90deg, ${accent}${active ? "50" : "20"}, transparent)`,
        transition: "background 0.4s",
      }} />

      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
        {/* Avatar */}
        <div style={{
          position: "relative", flexShrink: 0,
          width: 50, height: 50, borderRadius: "50%",
          border: `2px solid ${accent}${active ? "90" : "40"}`,
          overflow: "hidden",
          boxShadow: active ? `0 0 20px ${accent}40` : "none",
          transition: "border-color 0.4s, box-shadow 0.4s",
          transform: active ? "scale(1.08)" : "scale(1)",
        }}>
          <Image src={image} alt={name} fill style={{ objectFit: "cover" }} />
        </div>

        {/* Name + title */}
        <div>
          <div style={{
            fontSize: 15, fontWeight: 700,
            fontFamily: "'Syne',sans-serif",
            color: active ? "#fff" : "rgba(255,255,255,0.8)",
            transition: "color 0.3s",
            letterSpacing: "-0.01em",
          }}>{name}</div>
          <div style={{
            fontSize: 12, fontWeight: 500,
            color: active ? accent : "rgba(255,255,255,0.35)",
            transition: "color 0.4s",
            letterSpacing: "0.04em",
            marginTop: 2,
          }}>{designation}</div>
        </div>

        {/* Verified badge */}
        <div style={{
          marginLeft: "auto",
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 100,
          background: `${accent}18`,
          border: `1px solid ${accent}${active ? "40" : "20"}`,
          transition: "border-color 0.4s, opacity 0.4s",
          opacity: active ? 1 : 0.5,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill={accent}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Verified</span>
        </div>
      </div>

      {/* Corner glow */}
      <div style={{
        position: "absolute", bottom: -35, right: -35,
        width: 110, height: 110, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
        opacity: active ? 1 : 0.3, transition: "opacity 0.4s",
        pointerEvents: "none",
      }} />
    </div>
  );
}

/* ── Aggregate rating display ── */
function AggregateRating() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 16,
      padding: "14px 28px", borderRadius: 16,
      border: "1px solid rgba(247,193,79,0.3)",
      background: "rgba(247,193,79,0.06)",
      backdropFilter: "blur(14px)",
      animation: "tFadeUp 0.8s ease 0.5s both",
    }}>
      <div style={{ display: "flex", gap: 3 }}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#f7c14f">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <div style={{ height: 28, width: 1, background: "rgba(255,255,255,0.1)" }} />
      <div>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#f7c14f", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>5.0</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>/ 5.0</span>
      </div>
      <div style={{ height: 28, width: 1, background: "rgba(255,255,255,0.1)" }} />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
        <span style={{ color: "#fff", fontWeight: 700 }}>2,400+</span> reviews
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────── */
export default function Testimonials() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes tFadeUp  { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tGlow    { 0%,100%{opacity:.28} 50%{opacity:.65} }
        @keyframes tDot     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.5} }
        @keyframes tCardIn  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tLineExp { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes tFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      <section
        id="testimonials"
        style={{
          position: "relative",
          background: "#020816",
          padding: "120px 0 140px",
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

        {/* ── Glows ── */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 1000, height: 320, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(79,142,247,.1) 0%,transparent 68%)",
          zIndex: 1, pointerEvents: "none", animation: "tGlow 5s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: 0, right: "8%",
          width: 500, height: 260, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(159,92,247,.07) 0%,transparent 70%)",
          zIndex: 1, pointerEvents: "none", animation: "tGlow 7s ease-in-out infinite 2s",
        }} />
        {/* Star-accent glow (testimonial-specific gold) */}
        <div style={{
          position: "absolute", bottom: "20%", left: "5%",
          width: 380, height: 200, borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(247,193,79,.06) 0%,transparent 70%)",
          zIndex: 1, pointerEvents: "none", animation: "tGlow 6s ease-in-out infinite 1s",
        }} />

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>

          {/* ── Section header ── */}
          <div style={{ maxWidth: 680, marginBottom: 72 }}>
            {/* Eyebrow */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "7px 18px", borderRadius: 100,
              border: "1px solid rgba(247,193,79,.35)",
              background: "rgba(247,193,79,.07)",
              marginBottom: 28,
              animation: "tFadeUp 0.7s ease both",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f7c14f", display: "inline-block", animation: "tDot 2.2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#f7c14f", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>
                User Voices
              </span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: "clamp(36px,5vw,64px)",
              fontWeight: 800,
              fontFamily: "'Syne',sans-serif",
              lineHeight: 1.0,
              letterSpacing: "-0.032em",
              margin: "0 0 20px",
              animation: "tFadeUp 0.85s ease 0.1s both",
            }}>
              <span style={{ color: "#ffffff" }}>What Our</span>
              <br />
              <span style={{
                background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Users Say</span>
            </h2>

            {/* Divider */}
            <div style={{
              width: 72, height: 2, borderRadius: 2,
              background: "linear-gradient(90deg,#f7c14f,#4f8ef7)",
              marginBottom: 22,
              animation: "tLineExp 0.9s ease 0.25s both",
              transformOrigin: "left",
            }} />

            <p style={{
              fontSize: 17, fontWeight: 300,
              color: "rgba(255,255,255,.47)",
              lineHeight: 1.78,
              margin: "0 0 32px",
              animation: "tFadeUp 0.9s ease 0.2s both",
            }}>
              Nothing speaks louder than the voices of our users. Our system stands
              out as a powerful, intuitive, and impactful tool for pharmacies
              and communities alike.
            </p>

            <AggregateRating />
          </div>

          {/* ── Testimonial cards ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}>
            {testimonialData.map((t, i) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                index={i}
                active={activeCard === i}
                onHover={setActiveCard}
              />
            ))}
          </div>

          {/* ── Bottom CTA strip ── */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 16,
            marginTop: 72,
            animation: "tFadeUp 0.8s ease 0.55s both",
          }}>
            <div style={{ height: 1, width: 80, background: "linear-gradient(to right,transparent,rgba(79,142,247,.4))" }} />
            <button
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "linear-gradient(135deg,#4f8ef7,#7c3aed)";
                b.style.color = "#fff";
                b.style.transform = "translateY(-2px)";
                b.style.boxShadow = "0 14px 36px rgba(79,142,247,.42)";
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "rgba(79,142,247,.08)";
                b.style.color = "#4f8ef7";
                b.style.transform = "translateY(0)";
                b.style.boxShadow = "none";
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
              Read All Reviews →
            </button>
            <div style={{ height: 1, width: 80, background: "linear-gradient(to left,transparent,rgba(79,142,247,.4))" }} />
          </div>
        </div>
      </section>
    </>
  );
}