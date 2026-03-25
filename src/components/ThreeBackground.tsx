import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020816, 0.025);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 20);

    const cols = [0x4f8ef7, 0x9f5cf7, 0x00d4ff, 0x5ff7c4, 0xf7c14f, 0xf75f8e];

    // Pills
    const pills: { m: THREE.Group; sp: number; ph: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const col = cols[i % 6], sc = 0.35 + Math.random() * 0.5;
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.16 + Math.random() * 0.14, shininess: 90 });
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1 * sc, 0.1 * sc, 0.38 * sc, 12), mat));
      const cT = new THREE.Mesh(new THREE.SphereGeometry(0.1 * sc, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      cT.position.y = 0.19 * sc;
      const cB = new THREE.Mesh(new THREE.SphereGeometry(0.1 * sc, 12, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat);
      cB.position.y = -0.19 * sc;
      g.add(cT, cB);
      g.position.set((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 28, (Math.random() - 0.5) * 16 - 5);
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      pills.push({ m: g, sp: 0.003 + Math.random() * 0.006, ph: i * 0.7 });
      scene.add(g);
    }

    // Cross shapes
    const crosses: { m: THREE.Group; sp: number; ax: THREE.Vector3 }[] = [];
    for (let i = 0; i < 14; i++) {
      const col = cols[i % 6], sc = 0.5 + Math.random() * 0.7;
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.1 + Math.random() * 0.1, shininess: 60 });
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6 * sc, 0.16 * sc, 0.08 * sc), mat));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.16 * sc, 0.6 * sc, 0.08 * sc), mat));
      g.position.set((Math.random() - 0.5) * 48, (Math.random() - 0.5) * 32, (Math.random() - 0.5) * 18 - 5);
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      crosses.push({ m: g, sp: 0.003 + Math.random() * 0.007, ax: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() });
      scene.add(g);
    }

    // Torus rings
    const rings: THREE.Mesh[] = [];
    ([[10, 0.012, 0x4f8ef7, 0.08], [14, 0.007, 0x9f5cf7, 0.055], [7, 0.016, 0x00d4ff, 0.1]] as const).forEach(([r, t, c, o]) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 6, 100), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o }));
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      m.position.z = -12;
      rings.push(m);
      scene.add(m);
    });

    // Stars
    const sg = new THREE.BufferGeometry();
    const sp: number[] = [];
    for (let i = 0; i < 2600; i++) sp.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 45 - 14);
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.024, color: 0xffffff, transparent: true, opacity: 0.18 })));

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const bl = new THREE.PointLight(0x4f8ef7, 4, 55);
    bl.position.set(8, 5, 7);
    scene.add(bl);
    const pl = new THREE.PointLight(0x9f5cf7, 2.5, 45);
    pl.position.set(-8, -4, 5);
    scene.add(pl);
    const cl = new THREE.PointLight(0x00d4ff, 2, 35);
    cl.position.set(0, 9, 4);
    scene.add(cl);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / innerHeight - 0.5) * 2;
    };
    addEventListener("mousemove", onMouse);

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
      pills.forEach(({ m, sp: s, ph }) => {
        m.rotation.x += s * 0.6;
        m.rotation.z += s * 0.9;
        m.position.y += Math.sin(t * 0.5 + ph) * 0.003;
      });
      crosses.forEach(({ m, sp: s, ax }) => m.rotateOnAxis(ax, s));
      rings[0].rotation.z += 0.004;
      rings[1].rotation.y += 0.003;
      rings[2].rotation.x += 0.005;
      camera.position.x += (mouse.x * 0.7 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.45 - camera.position.y) * 0.025;
      camera.position.z = 20 + Math.sin(t * 0.1) * 0.8;
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

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
