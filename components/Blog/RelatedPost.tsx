"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cinematic RelatedPost  –  Three.js edition
   Dark-cosmos design system: sidebar / blog detail component
   ───────────────────────────────────────────────────────────── */

/* ── Micro Three.js scene inside the thumbnail ── */
function ThumbScene({ accent }: { accent: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth || 85, H = el.clientHeight || 75;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 50);
    camera.position.set(0, 0, 5);

    // Tiny orbiting sphere
    const col = parseInt(accent.replace("#", ""), 16);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.85, shininess: 100 })
    );
    scene.add(sphere);

    // Orbit ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.008, 4, 60),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3 })
    );
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // Star particles
    const sg = new THREE.BufferGeometry(); const sp: number[] = [];
    for (let i = 0; i < 120; i++) sp.push((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4 - 2);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.4 })));

    // Light
    const pl = new THREE.PointLight(col, 3, 12); pl.position.set(2, 2, 2); scene.add(pl);
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    const clock = new THREE.Clock(); let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick); const t = clock.getElapsedTime();
      sphere.position.set(Math.cos(t * 0.9) * 0.7, Math.sin(t * 0.9) * 0.35, 0);
      sphere.rotation.y = t * 1.2;
      ring.rotation.z = t * 0.2;
      pl.intensity = 3 + Math.sin(t * 1.5) * 0.8;
      renderer.render(scene, camera);
    };
    tick();
    return () => { cancelAnimationFrame(raf); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, [accent]);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ──────────────────────────────────────────────────
   Main RelatedPost component
   ────────────────────────────────────────────────── */
const ACCENTS = ["#4f8ef7", "#9f5cf7", "#00d4ff", "#5ff7c4", "#f7c14f", "#f75f8e"];

const RelatedPost = ({
  image,
  slug,
  title,
  date,
  index = 0,
}: {
  image: string;
  slug: string;
  title: string;
  date: string;
  index?: number;
}) => {
  const [hov, setHov] = useState(false);
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes rpFadeIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes rpGlow   { 0%,100%{opacity:.4} 50%{opacity:.8} }
      `}</style>

      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 16px",
          borderRadius: 16,
          border: `1px solid ${hov ? accent + "50" : "rgba(255,255,255,0.07)"}`,
          background: hov
            ? `linear-gradient(135deg,rgba(255,255,255,0.05),${accent}0e)`
            : "rgba(255,255,255,0.025)",
          backdropFilter: "blur(14px)",
          transition: "all 0.35s ease",
          transform: hov ? "translateX(5px)" : "translateX(0)",
          boxShadow: hov ? `0 10px 36px ${accent}18` : "none",
          cursor: "pointer",
          animation: `rpFadeIn 0.5s ease ${index * 0.08}s both`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left accent strip */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
          background: `linear-gradient(to bottom,${accent},transparent)`,
          borderRadius: "16px 0 0 16px",
          opacity: hov ? 1 : 0.25,
          transition: "opacity 0.35s",
        }} />

        {/* Thumbnail */}
        <div style={{
          position: "relative",
          width: 80, height: 68,
          borderRadius: 12,
          overflow: "hidden",
          flexShrink: 0,
          border: `1px solid ${accent}${hov ? "55" : "22"}`,
          boxShadow: hov ? `0 0 20px ${accent}40` : "none",
          transition: "border-color 0.35s, box-shadow 0.35s",
          background: "#0a1628",
        }}>
          {/* Three.js micro-scene behind image */}
          <ThumbScene accent={accent} />

          {/* Actual image on top */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            transition: "opacity 0.45s ease",
            opacity: hov ? 0.55 : 0.88,
          }}>
            <Image
              src={image}
              alt={title}
              fill
              style={{ objectFit: "cover", filter: hov ? "brightness(0.9)" : "brightness(0.75)" }}
            />
          </div>

          {/* Vignette */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: `radial-gradient(ellipse at center,transparent 40%,rgba(2,8,22,0.55) 100%)`,
            pointerEvents: "none",
          }} />

          {/* HUD corner top-right */}
          <div style={{
            position: "absolute", top: 5, right: 5, width: 10, height: 10,
            borderTop: `1.5px solid ${accent}`,
            borderRight: `1.5px solid ${accent}`,
            borderRadius: "0 3px 0 0",
            opacity: hov ? 0.8 : 0,
            transition: "opacity 0.35s",
            zIndex: 3,
          }} />
        </div>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={slug}
            style={{ textDecoration: "none", display: "block" }}
          >
            <h5 style={{
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "'Syne',sans-serif",
              color: hov ? "#fff" : "rgba(255,255,255,0.75)",
              lineHeight: 1.35,
              letterSpacing: "-0.012em",
              marginBottom: 7,
              transition: "color 0.3s",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {title}
            </h5>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill={`${accent}99`}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
            </svg>
            <p style={{
              fontSize: 10.5,
              fontWeight: 500,
              color: "rgba(255,255,255,0.32)",
              letterSpacing: "0.04em",
              margin: 0,
            }}>{date}</p>
          </div>
        </div>

        {/* Arrow on hover */}
        <div style={{
          flexShrink: 0,
          color: accent,
          opacity: hov ? 1 : 0,
          transform: hov ? "translateX(0)" : "translateX(-4px)",
          transition: "opacity 0.3s, transform 0.3s",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        {/* Corner glow */}
        <div style={{
          position: "absolute", bottom: -20, right: -20,
          width: 60, height: 60, borderRadius: "50%",
          background: `radial-gradient(circle,${accent}22 0%,transparent 70%)`,
          opacity: hov ? 1 : 0.3,
          transition: "opacity 0.35s",
          pointerEvents: "none",
        }} />
      </div>
    </>
  );
};

export default RelatedPost;

/* ─────────────────────────────────────────────────────────────
   RelatedPostList – optional wrapper that adds the section
   header and vertical list. Import and use instead of mapping
   RelatedPost manually if you want the full cinematic panel.
   ───────────────────────────────────────────────────────────── */
export function RelatedPostList({
  posts,
}: {
  posts: { image: string; slug: string; title: string; date: string }[];
}) {
  return (
    <>
      <style>{`
        @keyframes rpListIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rpBarExp { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>

      <div style={{
        position: "relative",
        padding: "28px 26px",
        borderRadius: 20,
        border: "1px solid rgba(79,142,247,0.18)",
        background: "linear-gradient(155deg,rgba(255,255,255,0.03),rgba(79,142,247,0.05))",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
        animation: "rpListIn 0.65s ease both",
      }}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#4f8ef7,#9f5cf7,transparent)", animation: "rpBarExp 0.8s ease 0.2s both", transformOrigin: "left" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4f8ef7", animation: "rpGlow 2.2s ease-in-out infinite" }} />
          <h4 style={{
            fontSize: 11, fontWeight: 700, color: "#4f8ef7",
            letterSpacing: "0.18em", textTransform: "uppercase",
            fontFamily: "'Syne',sans-serif", margin: 0,
          }}>Related Posts</h4>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,rgba(79,142,247,0.3),transparent)" }} />
        </div>

        {/* Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {posts.map((post, i) => (
            <RelatedPost key={i} {...post} index={i} />
          ))}
        </div>

        {/* Corner glow */}
        <div style={{ position: "absolute", bottom: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
      </div>
    </>
  );
}