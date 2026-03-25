"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Blog } from "@/types/blog";

/* ─────────────────────────────────────────────────────────────
   Cinematic SingleBlog  –  Three.js edition
   Dark-cosmos design system: blog card component
   ───────────────────────────────────────────────────────────── */

/* ── Micro Three.js scene that pulses inside the image ── */
function CardScene({ accent, active }: { accent: string; active: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth || 400, H = el.clientHeight || 220;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1);
    renderer.setClearColor(0x000000, 0); el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 0, 8);

    const col = parseInt(accent.replace("#", ""), 16);

    /* Orbiting node cluster */
    const nodes: { m: THREE.Mesh; r: number; sp: number; ph: number; y: number }[] = [];
    [{ r: 1.8, sp: 0.6, ph: 0, y: 0.2, sz: 0.14 },
     { r: 1.8, sp: 0.6, ph: Math.PI * 2/3, y: -0.3, sz: 0.11 },
     { r: 1.8, sp: 0.6, ph: Math.PI * 4/3, y: 0.15, sz: 0.12 },
     { r: 2.8, sp: 0.35, ph: Math.PI / 4, y: 0.5, sz: 0.09 },
    ].forEach(({ r, sp, ph, y, sz }) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(sz, 10, 10),
        new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.85, shininess: 100 })
      );
      nodes.push({ m, r, sp, ph, y }); scene.add(m);
    });

    /* Orbit ring */
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.008, 4, 80),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.15 })
    );
    ring.rotation.x = Math.PI / 2.2; scene.add(ring);

    /* Stars */
    const sg = new THREE.BufferGeometry(); const sp: number[] = [];
    for (let i = 0; i < 200; i++) sp.push((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6 - 2);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.3 })));

    const pl = new THREE.PointLight(col, active ? 5 : 2, 18); pl.position.set(3, 2, 3); scene.add(pl);
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    const clock = new THREE.Clock(); let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick); const t = clock.getElapsedTime();
      nodes.forEach(({ m, r, sp, ph, y }) => {
        const a = t * sp + ph;
        m.position.set(Math.cos(a) * r, y + Math.sin(t * 0.5 + ph) * 0.1, Math.sin(a) * r * 0.45);
        m.rotation.y = t;
      });
      ring.rotation.z = t * 0.1;
      pl.intensity = (active ? 5 : 2) + Math.sin(t * 1.2) * 0.8;
      renderer.render(scene, camera);
    };
    tick();
    return () => { cancelAnimationFrame(raf); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, [accent, active]);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ── Accent colors cycling per blog index ── */
const ACCENTS = ["#4f8ef7", "#9f5cf7", "#00d4ff", "#5ff7c4", "#f7c14f", "#f75f8e"];

const SingleBlog = ({ blog, index = 0 }: { blog: Blog; index?: number }) => {
  const { title, image, paragraph, author, tags, publishDate } = blog;
  const [hov, setHov] = useState(false);
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes sbCardIn  { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes sbTagPop  { from{opacity:0;transform:scale(.8) translateY(-4px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes sbDot     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }
        @keyframes sbScan    { from{transform:translateY(-100%)} to{transform:translateY(200%)} }
      `}} />

      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: "relative",
          borderRadius: 22,
          border: `1px solid ${hov ? accent + "52" : "rgba(255,255,255,0.07)"}`,
          background: hov
            ? `linear-gradient(155deg,rgba(255,255,255,0.05),${accent}0d)`
            : "rgba(255,255,255,0.025)",
          backdropFilter: "blur(18px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.4s ease",
          transform: hov ? "translateY(-8px)" : "translateY(0)",
          boxShadow: hov ? `0 28px 70px ${accent}1e, 0 0 0 1px ${accent}18` : "none",
          animation: `sbCardIn 0.6s ease ${index * 0.1}s both`,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Top accent bar ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 5,
          background: `linear-gradient(90deg,${accent},#9f5cf7,transparent)`,
          opacity: hov ? 1 : 0.3, transition: "opacity 0.4s",
        }} />

        {/* ── Thumbnail section ── */}
        <Link href={`/blog/${(blog as any).slug ?? ""}`} style={{ display: "block", textDecoration: "none" }}>
          <div style={{ position: "relative", aspectRatio: "37/22", overflow: "hidden", background: "#060e22" }}>
            {/* Three.js micro-scene */}
            <CardScene accent={accent} active={hov} />

            {/* Blog image on top */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 1,
              transition: "opacity 0.5s ease",
              opacity: hov ? 0.6 : 0.88,
            }}>
              <Image src={image} alt={title} fill style={{ objectFit: "cover", filter: hov ? "brightness(0.85)" : "brightness(0.72)", transform: hov ? "scale(1.04)" : "scale(1)", transition: "transform 0.8s ease, filter 0.5s" }} />
            </div>

            {/* Cinematic vignette */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 2,
              background: "radial-gradient(ellipse at center,transparent 40%,rgba(2,8,22,0.6) 100%)",
              transition: "opacity 0.4s", opacity: hov ? 0.6 : 1, pointerEvents: "none",
            }} />

            {/* Scan line sweep */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 3, opacity: 0.04, pointerEvents: "none" }}>
              <div style={{ width: "100%", height: "45%", background: `linear-gradient(to bottom,transparent,${accent}cc,transparent)`, animation: "sbScan 5s linear infinite" }} />
            </div>

            {/* HUD corner brackets */}
            {[
              { top: 14, left: 14, borderTop: `1.5px solid ${accent}`, borderLeft: `1.5px solid ${accent}`, borderRadius: "3px 0 0 0" },
              { top: 14, right: 14, borderTop: `1.5px solid ${accent}`, borderRight: `1.5px solid ${accent}`, borderRadius: "0 3px 0 0" },
              { bottom: 14, left: 14, borderBottom: `1.5px solid ${accent}`, borderLeft: `1.5px solid ${accent}`, borderRadius: "0 0 0 3px" },
              { bottom: 14, right: 14, borderBottom: `1.5px solid ${accent}`, borderRight: `1.5px solid ${accent}`, borderRadius: "0 0 3px 0" },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: 18, height: 18, opacity: hov ? 0.75 : 0, transition: "opacity 0.4s", zIndex: 4, ...s }} />
            ))}

            {/* Tag badge */}
            <div style={{
              position: "absolute", top: 16, right: 16, zIndex: 5,
              padding: "5px 14px", borderRadius: 100,
              background: `${accent}28`, border: `1px solid ${accent}55`,
              backdropFilter: "blur(14px)",
              fontSize: 10, fontWeight: 700, color: accent,
              letterSpacing: "0.12em", textTransform: "uppercase",
              fontFamily: "'Syne',sans-serif",
              animation: "sbTagPop 0.4s ease 0.3s both",
            }}>
              {tags[0]}
            </div>

            {/* Live dot indicator */}
            <div style={{
              position: "absolute", top: 16, left: 16, zIndex: 5,
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 11px", borderRadius: 100,
              background: "rgba(2,8,22,0.7)", border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              opacity: hov ? 1 : 0, transition: "opacity 0.3s",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, display: "inline-block", animation: "sbDot 1.8s ease-in-out infinite" }} />
              <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Article</span>
            </div>
          </div>
        </Link>

        {/* ── Card body ── */}
        <div style={{ padding: "26px 28px 24px", display: "flex", flexDirection: "column", flex: 1 }}>

          {/* Title */}
          <Link href={`/blog/${(blog as any).slug ?? ""}`} style={{ textDecoration: "none", marginBottom: 14, display: "block" }}>
            <h3 style={{
              fontSize: 19, fontWeight: 800,
              fontFamily: "'Syne',sans-serif",
              color: hov ? "#ffffff" : "rgba(255,255,255,0.85)",
              lineHeight: 1.28, letterSpacing: "-0.02em",
              margin: 0, transition: "color 0.3s",
            }}>
              {title}
            </h3>
          </Link>

          {/* Paragraph */}
          <p style={{
            fontSize: 14, fontWeight: 300,
            color: "rgba(255,255,255,0.42)",
            lineHeight: 1.76, margin: "0 0 22px",
          }}>
            {paragraph}
          </p>

          {/* Gradient divider */}
          <div style={{
            height: 1, marginBottom: 20,
            background: `linear-gradient(90deg,${accent}${hov ? "48" : "20"},transparent)`,
            transition: "background 0.4s",
          }} />

          {/* Author + date row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
              <div style={{
                position: "relative", width: 40, height: 40, borderRadius: "50%",
                flexShrink: 0, overflow: "hidden",
                border: `1.5px solid ${accent}${hov ? "70" : "30"}`,
                boxShadow: hov ? `0 0 16px ${accent}40` : "none",
                transition: "border-color 0.4s, box-shadow 0.4s",
              }}>
                <Image src={author.image} alt={author.name} fill style={{ objectFit: "cover" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {author.name}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 2, letterSpacing: "0.04em" }}>
                  {author.designation}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

            {/* Date */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Published</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: accent, letterSpacing: "0.04em" }}>{publishDate}</div>
            </div>
          </div>

          {/* Read more link */}
          <Link href={`/blog/${(blog as any).slug ?? ""}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 20, fontSize: 11, fontWeight: 700,
              color: accent, letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none",
              opacity: hov ? 1 : 0.45, transition: "opacity 0.3s",
              fontFamily: "'Syne',sans-serif",
            }}
          >
            Read Article
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Corner glow */}
        <div style={{
          position: "absolute", bottom: -32, right: -32,
          width: 110, height: 110, borderRadius: "50%",
          background: `radial-gradient(circle,${accent}20 0%,transparent 70%)`,
          opacity: hov ? 1 : 0.28, transition: "opacity 0.4s", pointerEvents: "none",
        }} />
      </div>
    </>
  );
};

export default SingleBlog;