"use client";

import SingleBlog from "@/components/Blog/SingleBlog";
import blogData from "@/components/Blog/blogData";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cinematic Blog Page  –  Three.js edition
   Dark-cosmos design system: full blog listing page
   ───────────────────────────────────────────────────────────── */

/* ── 3-D hero background ── */
function ThreeHero() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H); 
    renderer.setPixelRatio(typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1);
    renderer.setClearColor(0x000000, 0); el.appendChild(renderer.domElement);

    const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x020816, 0.028);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 180);
    camera.position.set(0, 0, 16);

    const cols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];

    /* Floating editorial planes */
    const planes: { m: THREE.Mesh; ax: THREE.Vector3; ph: number }[] = [];
    for (let i = 0; i < 20; i++) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8 + Math.random() * 0.7, 1.0 + Math.random() * 0.6),
        new THREE.MeshBasicMaterial({ color: cols[i % 6], transparent: true, opacity: 0.03 + Math.random() * 0.06, side: THREE.DoubleSide })
      );
      m.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 12 - 4);
      m.rotation.set(Math.random() * Math.PI * 0.3, Math.random() * Math.PI, 0);
      planes.push({ m, ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), ph: i * 0.8 });
      scene.add(m);
    }

    /* Icosahedra floaters */
    const floaters: { m: THREE.Mesh; sp: number; ax: THREE.Vector3 }[] = [];
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.13 + Math.random() * 0.16, 0),
        new THREE.MeshPhongMaterial({ color: cols[i % 6], transparent: true, opacity: 0.1 + Math.random() * 0.11, wireframe: Math.random() > 0.45 })
      );
      m.position.set((Math.random() - 0.5) * 36, (Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12 - 4);
      floaters.push({ m, sp: 0.004 + Math.random() * 0.007, ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() });
      scene.add(m);
    }

    /* Torus rings */
    const rings: THREE.Mesh[] = [];
    [[8, 0.011, 0x4f8ef7, 0.08], [12, 0.007, 0x9f5cf7, 0.055]].forEach(([r, t, c, o]) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r as number, t as number, 6, 100), new THREE.MeshBasicMaterial({ color: c as number, transparent: true, opacity: o as number }));
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0); m.position.z = -10;
      rings.push(m); scene.add(m);
    });

    /* Stars */
    const sg = new THREE.BufferGeometry(); const sp: number[] = [];
    for (let i = 0; i < 2000; i++) sp.push((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 35 - 10);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.024, color: 0xffffff, transparent: true, opacity: 0.18 })));

    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const bl = new THREE.PointLight(0x4f8ef7, 4, 45); bl.position.set(7, 4, 5); scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 38); pl.position.set(-7, -3, 4); scene.add(pl);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => { mouse.x = (e.clientX / innerWidth - 0.5) * 2; mouse.y = -(e.clientY / innerHeight - 0.5) * 2; };
    addEventListener("mousemove", onMouse);
    const onResize = () => { const W2 = el.clientWidth, H2 = el.clientHeight; renderer.setSize(W2, H2); camera.aspect = W2 / H2; camera.updateProjectionMatrix(); };
    addEventListener("resize", onResize);

    const clock = new THREE.Clock(); let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick); const t = clock.getElapsedTime();
      planes.forEach(({ m, ax, ph }) => { m.rotateOnAxis(ax, 0.002); m.position.y += Math.sin(t * 0.3 + ph) * 0.0015; });
      floaters.forEach(({ m, sp, ax }) => m.rotateOnAxis(ax, sp));
      rings[0].rotation.z += 0.004; rings[1].rotation.y += 0.003;
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.022;
      camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.022;
      camera.position.z = 16 + Math.sin(t * 0.1) * 0.6;
      camera.lookAt(0, 0, 0);
      bl.intensity = 4 + Math.sin(t * 1.0) * 0.9; pl.intensity = 2.5 + Math.cos(t * 0.8) * 0.7;
      renderer.render(scene, camera);
    };
    tick();
    return () => { cancelAnimationFrame(raf); removeEventListener("mousemove", onMouse); removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

/* ── Pagination button ── */
function PageBtn({ label, active = false, disabled = false, onClick }: { label: string | number; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 38, minWidth: 38, padding: "0 14px",
        borderRadius: 10,
        border: active
          ? "1px solid rgba(79,142,247,0.6)"
          : hov ? "1px solid rgba(79,142,247,0.4)" : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "linear-gradient(135deg,#4f8ef7,#7c3aed)"
          : hov ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.04)",
        color: active ? "#fff" : disabled ? "rgba(255,255,255,0.2)" : hov ? "#4f8ef7" : "rgba(255,255,255,0.45)",
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        backdropFilter: "blur(12px)",
        boxShadow: active ? "0 4px 20px rgba(79,142,247,0.35)" : "none",
        fontFamily: "'Syne',sans-serif",
        letterSpacing: "0.02em",
      }}
    >{label}</button>
  );
}

/* ── Ticker tag ── */
function TickerRow() {
  const tags = ["Pharmacy AI", "Geolocation", "Patient Care", "Digital Health", "Supply Chain", "Drug Delivery", "Smart Pharmacy", "Data Systems"];
  return (
    <div style={{ overflow: "hidden", position: "relative", marginBottom: 52 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: "linear-gradient(to right,#020816,transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: "linear-gradient(to left,#020816,transparent)", pointerEvents: "none" }} />
      <div style={{ display: "flex", gap: 10, animation: "bpScroll 22s linear infinite", width: "max-content" }}>
        {[...tags, ...tags].map((tag, i) => (
          <span key={i} style={{ flexShrink: 0, padding: "5px 15px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.36)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Main Blog Page
   ────────────────────────────────────────────────── */
const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(blogData.length / POSTS_PER_PAGE);
  const paginated = blogData.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes bpFadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bpGlow    { 0%,100%{opacity:.25} 50%{opacity:.65} }
        @keyframes bpDot     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.5} }
        @keyframes bpLineExp { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes bpScroll  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes bpCountIn { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
      `}} />

      <div style={{ background: "#020816", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>

        {/* ── HERO HEADER ── */}
        <div style={{ position: "relative", overflow: "hidden", paddingTop: 120, paddingBottom: 100 }}>
          <ThreeHero />

          {/* Grid overlay */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(79,142,247,.024) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.024) 1px,transparent 1px)`, backgroundSize: "64px 64px" }} />

          {/* Glows */}
          <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 900, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(79,142,247,.14) 0%,transparent 68%)", zIndex: 1, pointerEvents: "none", animation: "bpGlow 5s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: 0, right: "8%", width: 400, height: 220, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,92,247,.08) 0%,transparent 70%)", zIndex: 1, pointerEvents: "none", animation: "bpGlow 7s ease-in-out infinite 2s" }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>
            <div style={{ maxWidth: 680 }}>
              {/* Eyebrow */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 18px", borderRadius: 100, border: "1px solid rgba(79,142,247,.32)", background: "rgba(79,142,247,.09)", marginBottom: 28, animation: "bpFadeUp .7s ease both" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "bpDot 2.2s ease-in-out infinite" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f8ef7", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>
                  Pharmacy Insights
                </span>
              </div>

              {/* Headline */}
              <h1 style={{ fontSize: "clamp(36px,5.5vw,72px)", fontWeight: 800, fontFamily: "'Syne',sans-serif", lineHeight: 1.0, letterSpacing: "-0.034em", margin: "0 0 20px", animation: "bpFadeUp .85s ease .1s both" }}>
                <span style={{ color: "#ffffff" }}>Pharmacy</span>
                <br />
                <span style={{ background: "linear-gradient(135deg,#4f8ef7 0%,#9f5cf7 50%,#00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Blogs</span>
              </h1>

              {/* Divider */}
              <div style={{ width: 72, height: 2, borderRadius: 2, background: "linear-gradient(90deg,#4f8ef7,#9f5cf7)", marginBottom: 22, animation: "bpLineExp .9s ease .25s both", transformOrigin: "left" }} />

              <p style={{ fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,.47)", lineHeight: 1.78, maxWidth: 560, margin: "0 0 36px", animation: "bpFadeUp .9s ease .2s both" }}>
                Explore insights into pharmacy systems, healthcare innovations, and how geolocation is redefining access to medicines and services.
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 32, animation: "bpFadeUp 1s ease .35s both" }}>
                {[
                  [blogData.length.toString(), "Articles"],
                  ["6", "Categories"],
                  ["2025", "Latest"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne',sans-serif", letterSpacing: "-0.025em", background: "linear-gradient(135deg,#4f8ef7,#9f5cf7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.32)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 5, fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom,transparent,#020816)", pointerEvents: "none", zIndex: 8 }} />
        </div>

        {/* ── BLOG GRID SECTION ── */}
        <section style={{ position: "relative", padding: "0 0 120px", background: "#020816", overflow: "hidden" }}>
          {/* Grid bg */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(79,142,247,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.018) 1px,transparent 1px)`, backgroundSize: "64px 64px" }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: 1240, margin: "0 auto", padding: "0 6%" }}>

            {/* Ticker */}
            <TickerRow />

            {/* Post count */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", fontWeight: 500, letterSpacing: "0.06em" }}>
                Showing <span style={{ color: "#4f8ef7", fontWeight: 700 }}>{paginated.length}</span> of <span style={{ color: "#fff", fontWeight: 700 }}>{blogData.length}</span> articles
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", letterSpacing: "0.08em" }}>
                Page <span style={{ color: "#4f8ef7", fontWeight: 700 }}>{page}</span> / {totalPages}
              </div>
            </div>

            {/* Blog cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24, marginBottom: 72 }}>
              {paginated.map((blog, i) => (
                <SingleBlog key={blog.id} blog={blog} index={(page - 1) * POSTS_PER_PAGE + i} />
              ))}
            </div>

            {/* ── Cinematic pagination ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {/* Prev */}
              <PageBtn label="← Prev" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} />

              {/* Page numbers */}
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
                  const show = n === 1 || n === totalPages || Math.abs(n - page) <= 1;
                  const isEllipsis = !show && (n === 2 || n === totalPages - 1);
                  if (!show && !isEllipsis) return null;
                  if (isEllipsis) return (
                    <span key={n} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 38, minWidth: 38, color: "rgba(255,255,255,.25)", fontSize: 13 }}>…</span>
                  );
                  return <PageBtn key={n} label={n} active={n === page} onClick={() => setPage(n)} />;
                })}
              </div>

              {/* Next */}
              <PageBtn label="Next →" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
            </div>

            {/* Page indicator strip */}
            <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 20 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <div key={n} onClick={() => setPage(n)} style={{ height: 3, borderRadius: 2, background: n === page ? "#4f8ef7" : "rgba(255,255,255,0.12)", width: n === page ? 24 : 8, transition: "all 0.4s ease", cursor: "pointer" }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}