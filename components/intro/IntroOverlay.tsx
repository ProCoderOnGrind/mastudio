"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { hasPlayedIntro, markIntroPlayed } from "@/lib/intro";

/* ═══════════════════════════════════════════════════════════════════════════
   The construction intro.

   A masterplan draws itself, builds itself, and then becomes the page:

     set-out   the site grid and a circular plaza, in hairline
     frame     wireframe volumes extrude outward from the plaza
     mass      solid blocks rise inside them, lagging the drawing
     mark      the seal resolves above the model, on clear paper
     hold      the beat a visitor reads it
     plan      camera rotates axonometric → plan; the mark descends into the
               plaza, which is the one moment that circle is a true circle
     tile      the footprints re-tile into the hero photograph's rectangle

   The last move is the point: nothing fades to white and there is no cut. One
   grid becomes another grid — the masterplan becomes the index of the work.

   Silent, and plays once per session (lib/intro.ts) — never for visitors who
   have asked for reduced motion.
   ═════════════════════════════════════════════════════════════════════════ */

const PAPER = "#ffffff";
const SEAL_SRC = "/mastudio/logo-seal.png";

/** Phase lengths, in seconds. The whole choreography is tunable from here. */
const T = {
  setout: 0.95,
  frame: 2.3,
  mass: 2.1, // starts partway through `frame`
  mark: 1.2,
  hold: 1.15,
  plan: 1.0,
  tile: 1.65,
};

/** Where the mark sits: above the model, then down in the plaza for plan view. */
const SEAL_ISO = { y: 0.238, frac: 0.215 };
const SEAL_PLAN = { y: 0.5, frac: 0.3 };

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function IntroOverlay() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  const stageRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef<(() => void) | null>(null);

  useIsoLayoutEffect(() => setMounted(true), []);

  useEffect(() => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hasPlayedIntro() || reduce) {
      markIntroPlayed();
      // Gated on browser-only APIs, so this must run post-hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !visible) return;
    const stage = stageRef.current;
    const sealEl = sealRef.current;
    const typeEl = typeRef.current;
    if (!stage || !sealEl || !typeEl) return;

    let disposed = false;
    let raf = 0;
    let cleanup: (() => void) | null = null;

    // three is ~150KB gzip and only ever needed for this one animation, so it
    // is code-split out of the initial bundle rather than shipped to every page.
    // If anything at all goes wrong — WebGL blocked, an old device, a shader
    // that will not compile — the visitor must still get the site. The intro is
    // decoration; it is never allowed to be a gate.
    const bail = () => {
      markIntroPlayed();
      if (!disposed) setVisible(false);
    };

    // And if the run stalls for any reason, clear it anyway. The sequence is
    // ~9s; this is a backstop, not a schedule.
    const watchdog = window.setTimeout(() => finishRef.current?.() ?? bail(), 16000);

    import("three")
      .then((THREE) => {
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      stage.insertBefore(renderer.domElement, stage.firstChild);
      Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -400, 400);

      /* ── the masterplan ───────────────────────────────────────────────────
         Blocks ringing a circular plaza. Build order is radial: the plaza
         exists first and the city grows outward from it, which makes the void
         read as the reason for the plan rather than a hole left in it. */
      const N = 30,
        CELL = 1.0,
        GAP = 0.16,
        STOREY = 0.3;
      const PLAZA_R = 6.3;
      const half = (N * CELL) / 2;

      // Seeded, so every visitor sees the same masterplan.
      let seed = 20260823;
      const rand = () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };

      type Block = { x: number; z: number; r: number; storeys: number; order: number; pu: number; pv: number };
      const blocks: Block[] = [];
      let maxR = 0;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const x = -half + CELL * (i + 0.5);
          const z = -half + CELL * (j + 0.5);
          const r = Math.hypot(x, z);
          if (r < PLAZA_R || r > half * 1.02 || rand() < 0.1) continue;
          const dens = 1 - clamp01((r - PLAZA_R) / (half - PLAZA_R));
          blocks.push({
            x, z, r,
            storeys: 1 + Math.round(rand() * 3 + dens * 7),
            order: 0, pu: 0, pv: 0,
          });
          maxR = Math.max(maxR, r);
        }
      }
      blocks.forEach((b) => (b.order = clamp01((b.r - PLAZA_R) / (maxR - PLAZA_R))));
      const COUNT = blocks.length;

      // Dense pack for the final re-tiling. The plan is a ring, so mapping grid
      // position into the target rectangle would leave a doughnut with bare
      // corners; packing by index fills it completely.
      const PACK_COLS = Math.ceil(Math.sqrt(COUNT * 1.9));
      const PACK_ROWS = Math.ceil(COUNT / PACK_COLS);
      blocks.forEach((b, i) => {
        b.pu = ((i % PACK_COLS) + 0.5) / PACK_COLS;
        b.pv = (Math.floor(i / PACK_COLS) + 0.5) / PACK_ROWS;
      });

      /* Shared build maths — the drawing and the model must rise identically. */
      const BUILD_GLSL = `
        uniform float uFrame, uMass, uFlat, uGather, uTileScale;
        uniform vec4  uTarget;
        float easeOutCubic(float t){ return 1.0 - pow(1.0 - t, 3.0); }
        float wave(float order, float front){
          return easeOutCubic(clamp((front - order) / 0.34, 0.0, 1.0));
        }
        /* Starts spread across 55% of the phase, so the plan flows into the
           rectangle instead of snapping into it. */
        float gatherK(float order){
          const float SPREAD = 0.55;
          float k = clamp((uGather - order * SPREAD) / (1.0 - SPREAD), 0.0, 1.0);
          return k * k * (3.0 - 2.0 * k);
        }
        vec2 gathered(vec2 cell, vec2 uv, float order){
          vec2 t = uTarget.xy + (uv - 0.5) * uTarget.zw * 2.0;
          return mix(cell, t, gatherK(order));
        }`;

      /* ── wireframe: the drawing ─────────────────────────────────────────── */
      const wpos: number[] = [], wY: number[] = [], wH: number[] = [], wO: number[] = [], wC: number[] = [], wU: number[] = [];
      const wedge = (a: number[], b: number[], blk: Block, h: number) => {
        for (const p of [a, b]) {
          wpos.push(p[0], p[1], p[2]);
          wY.push(p[1]); wH.push(h); wO.push(blk.order);
          wC.push(blk.x, blk.z); wU.push(blk.pu, blk.pv);
        }
      };
      for (const b of blocks) {
        const h = b.storeys * STOREY;
        const w = (CELL - GAP) / 2;
        const c = [[-w, -w], [w, -w], [w, w], [-w, w]];
        for (let i = 0; i < 4; i++) {
          const [ax, az] = c[i], [bx, bz] = c[(i + 1) % 4];
          wedge([ax, 0, az], [bx, 0, bz], b, h);
          wedge([ax, 1, az], [bx, 1, bz], b, h);
          wedge([ax, 0, az], [ax, 1, az], b, h);
          for (let s = 1; s < b.storeys; s++) {
            const y = s / b.storeys;
            wedge([ax, y, az], [bx, y, bz], b, h);
          }
        }
      }

      const wgeo = new THREE.BufferGeometry();
      wgeo.setAttribute("position", new THREE.Float32BufferAttribute(wpos, 3));
      wgeo.setAttribute("aYNorm", new THREE.Float32BufferAttribute(wY, 1));
      wgeo.setAttribute("aHeight", new THREE.Float32BufferAttribute(wH, 1));
      wgeo.setAttribute("aOrder", new THREE.Float32BufferAttribute(wO, 1));
      wgeo.setAttribute("aCell", new THREE.Float32BufferAttribute(wC, 2));
      wgeo.setAttribute("aUV", new THREE.Float32BufferAttribute(wU, 2));

      const buildUniforms = () => ({
        uFrame: { value: 0 }, uMass: { value: 0 }, uFlat: { value: 0 },
        uGather: { value: 0 }, uTileScale: { value: 0.6 },
        uTarget: { value: new THREE.Vector4(0, 0, 1, 1) },
      });

      const wireMat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          ...buildUniforms(),
          uFade: { value: 1 },
          uInk: { value: new THREE.Color(0x5d7f16) },
          uAccent: { value: new THREE.Color(0x94c52d) },
        },
        vertexShader: `
          attribute float aYNorm, aHeight, aOrder;
          attribute vec2 aCell, aUV;
          ${BUILD_GLSL}
          varying float vLive, vHot;
          void main(){
            float k = wave(aOrder, uFrame);
            vLive = k;
            vHot = exp(-abs(uFrame - aOrder) * 22.0);
            vec3 p = position;
            p.y = aYNorm * aHeight * k * (1.0 - uFlat);
            float gk = gatherK(aOrder);
            vec2 xz = gathered(aCell, aUV, aOrder);
            float s = mix(1.0, uTileScale, gk);
            gl_Position = projectionMatrix * modelViewMatrix
                        * vec4(xz.x + p.x * s, p.y, xz.y + p.z * s, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 uInk, uAccent; uniform float uFade;
          varying float vLive, vHot;
          void main(){
            vec3 c = mix(uInk, uAccent, vHot * 0.9);
            float a = (0.30 * vLive + vHot * 0.55) * uFade;
            if (a < 0.004) discard;
            gl_FragColor = vec4(c, a);
          }`,
      });
      scene.add(new THREE.LineSegments(wgeo, wireMat));

      /* ── mass: the model ────────────────────────────────────────────────── */
      const bgeo = new THREE.BoxGeometry(CELL - GAP, 1, CELL - GAP);
      bgeo.translate(0, 0.5, 0);
      const iO = new Float32Array(COUNT), iH = new Float32Array(COUNT);
      const iC = new Float32Array(COUNT * 2), iU = new Float32Array(COUNT * 2);
      blocks.forEach((b, i) => {
        iO[i] = b.order; iH[i] = b.storeys * STOREY;
        iC[i * 2] = b.x; iC[i * 2 + 1] = b.z;
        iU[i * 2] = b.pu; iU[i * 2 + 1] = b.pv;
      });
      bgeo.setAttribute("aOrder", new THREE.InstancedBufferAttribute(iO, 1));
      bgeo.setAttribute("aHeight", new THREE.InstancedBufferAttribute(iH, 1));
      bgeo.setAttribute("aCell", new THREE.InstancedBufferAttribute(iC, 2));
      bgeo.setAttribute("aUV", new THREE.InstancedBufferAttribute(iU, 2));

      const massMat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          ...buildUniforms(),
          uPlate: { value: 0 },
          uLight: { value: new THREE.Vector3(0.42, 0.84, 0.34).normalize() },
        },
        vertexShader: `
          attribute float aOrder, aHeight;
          attribute vec2 aCell, aUV;
          ${BUILD_GLSL}
          varying vec3 vN;
          varying float vTone, vY, vEdge, vLive, vArrived;
          void main(){
            float k = wave(aOrder, uMass);
            vLive = k;
            vTone = clamp(aHeight / 3.0, 0.0, 1.0);
            vec3 p = position;
            p.y *= aHeight * k * (1.0 - uFlat);
            vY = position.y;
            vEdge = max(abs(position.x), abs(position.z)) / ${((CELL - GAP) / 2).toFixed(3)};
            float gk = gatherK(aOrder);
            vec2 xz = gathered(aCell, aUV, aOrder);
            float s = mix(1.0, uTileScale, gk);
            vArrived = gk;
            vN = normal;
            gl_Position = projectionMatrix * modelViewMatrix
                        * vec4(xz.x + p.x * s, p.y, xz.y + p.z * s, 1.0);
          }`,
        fragmentShader: `
          precision highp float;
          uniform vec3 uLight; uniform float uPlate;
          varying vec3 vN;
          varying float vTone, vY, vEdge, vLive, vArrived;
          void main(){
            if (vLive < 0.002) discard;
            vec3 n = normalize(vN);
            float diff = clamp(dot(n, uLight), 0.0, 1.0);
            // The studio's green, held as a tonal range so volumes read as volumes.
            vec3 base = mix(vec3(0.404, 0.553, 0.106), vec3(0.812, 0.894, 0.612), vTone);
            vec3 c = base * (0.52 + 0.52 * diff);
            c *= 0.52 + 0.52 * smoothstep(0.0, 0.62, vY);
            c = mix(c, vec3(0.278, 0.400, 0.063), smoothstep(0.88, 1.0, vEdge) * 0.34);
            c = mix(c, vec3(0.580, 0.700, 0.361), uPlate);
            float fade = 1.0 - smoothstep(0.62, 1.0, vArrived);
            gl_FragColor = vec4(c, vLive * 0.97 * fade);
          }`,
      });
      const mass = new THREE.InstancedMesh(bgeo, massMat, COUNT);
      mass.frustumCulled = false;
      const m4 = new THREE.Matrix4();
      for (let i = 0; i < COUNT; i++) mass.setMatrixAt(i, m4); // position is in-shader
      mass.instanceMatrix.needsUpdate = true;
      scene.add(mass);

      /* ── ground: site grid and the plaza edge ───────────────────────────── */
      const gpos: number[] = [], gOrd: number[] = [];
      for (let i = 0; i <= N; i++) {
        const p = -half + i * CELL, e = half + 0.7;
        gpos.push(p, 0, -e, p, 0, e); gOrd.push(Math.abs(p) / e, Math.abs(p) / e);
        gpos.push(-e, 0, p, e, 0, p); gOrd.push(Math.abs(p) / e, Math.abs(p) / e);
      }
      const ggeo = new THREE.BufferGeometry();
      ggeo.setAttribute("position", new THREE.Float32BufferAttribute(gpos, 3));
      ggeo.setAttribute("aOrd", new THREE.Float32BufferAttribute(gOrd, 1));
      const gridMat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { uSet: { value: 0 }, uFade: { value: 1 } },
        vertexShader: `
          attribute float aOrd; uniform float uSet; varying float vOn;
          void main(){
            vOn = clamp((uSet - aOrd) / 0.3, 0.0, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform float uFade; varying float vOn;
          void main(){ gl_FragColor = vec4(vec3(0.62, 0.63, 0.60), vOn * 0.34 * uFade); }`,
      });
      scene.add(new THREE.LineSegments(ggeo, gridMat));

      // The plaza, drawn like a compass arc during set-out — established as
      // architecture long before it is a logo.
      const cpts: number[] = [];
      for (let i = 0; i <= 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        cpts.push(Math.cos(a) * PLAZA_R, 0.002, Math.sin(a) * PLAZA_R);
      }
      const cgeo = new THREE.BufferGeometry();
      cgeo.setAttribute("position", new THREE.Float32BufferAttribute(cpts, 3));
      const plazaMat = new THREE.ShaderMaterial({
        transparent: true,
        glslVersion: THREE.GLSL3,
        uniforms: { uDraw: { value: 0 }, uFade: { value: 1 } },
        vertexShader: `
          out float vT;
          void main(){
            vT = float(gl_VertexID) / 160.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          precision highp float;
          uniform float uDraw, uFade;
          in float vT;
          out vec4 fragColor;
          void main(){
            if (vT > uDraw) discard;
            fragColor = vec4(0.58, 0.77, 0.18, 0.85 * uFade);
          }`,
      });
      scene.add(new THREE.Line(cgeo, plazaMat));

      /* ── framing ────────────────────────────────────────────────────────── */
      let V = 36;
      const sealBox = (k: number) => {
        const size = window.innerHeight * mix(SEAL_ISO.frac, SEAL_PLAN.frac, k);
        const cy = window.innerHeight * mix(SEAL_ISO.y, SEAL_PLAN.y, k);
        return { x: window.innerWidth / 2 - size / 2, y: cy - size / 2, size };
      };
      const layout = () => {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        const a = w / h;
        V = a > 1 ? 36 : 46;
        camera.left = (-V * a) / 2; camera.right = (V * a) / 2;
        camera.top = V / 2; camera.bottom = -V / 2;
        camera.updateProjectionMatrix();
        const b = sealBox(0);
        typeEl.style.top = `${Math.round(b.y + b.size + h * 0.038)}px`;
      };
      window.addEventListener("resize", layout);

      /** The hero photo's rect in world XZ under the plan camera. */
      const targetRect = () => {
        const el = document.querySelector("[data-hero-shot]");
        const r = el
          ? el.getBoundingClientRect()
          : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight } as DOMRect;
        const a = window.innerWidth / window.innerHeight;
        const wpp = (V * a) / window.innerWidth;
        const hpp = V / window.innerHeight;
        return new THREE.Vector4(
          (r.left + r.width / 2 - window.innerWidth / 2) * wpp,
          (r.top + r.height / 2 - window.innerHeight / 2) * hpp,
          (r.width / 2) * wpp,
          (r.height / 2) * hpp
        );
      };

      const ISO = new THREE.Vector3(20, 16.5, 20);
      const PLAN = new THREE.Vector3(0, 34, 0.001);
      const setCamera = (k: number) => {
        const e = easeInOutCubic(k);
        camera.position.lerpVectors(ISO, PLAN, e);
        camera.up.set(0, mix(1, 0, e), mix(0, -1, e)).normalize();
        camera.lookAt(0, mix(7.4, 0, e), 0);
      };

      /* ── the run ────────────────────────────────────────────────────────── */
      let phase = "setout";
      let phaseT0 = performance.now() / 1000;
      let nowSec = phaseT0;
      let handed = false;
      const go = (p: string) => { phase = p; phaseT0 = nowSec; };

      camera.position.copy(ISO);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 7.4, 0);
      layout();

      const finish = () => {
        if (!stage) return;
        markIntroPlayed();
        stage.style.transition = "opacity .5s cubic-bezier(.4,0,.2,1)";
        stage.style.opacity = "0";
        stage.style.pointerEvents = "none";
        window.setTimeout(() => setVisible(false), 560);
      };
      finishRef.current = finish;

      const handOff = () => {
        if (handed) return;
        handed = true;
        const b = sealBox(1);
        Object.assign(sealEl.style, {
          left: `${b.x}px`, top: `${b.y}px`,
          width: `${b.size}px`, height: `${b.size}px`,
          opacity: "1", transition: "none", transform: "none",
        });
        requestAnimationFrame(() => {
          const logo = document.getElementById("site-logo");
          if (!logo) return;
          const r = logo.getBoundingClientRect();
          const dx = r.left + r.width / 2 - (b.x + b.size / 2);
          const dy = r.top + r.height / 2 - (b.y + b.size / 2);
          sealEl.style.transition =
            "transform 1.05s cubic-bezier(.4,0,.2,1), opacity .3s cubic-bezier(.4,0,.2,1) .85s";
          sealEl.style.transform = `translate(${dx}px, ${dy}px) scale(${r.width / b.size})`;
          sealEl.style.opacity = "0";
        });
      };

      const W = wireMat.uniforms, M = massMat.uniforms;

      const frame = () => {
        if (disposed) return;
        nowSec = performance.now() / 1000;
        const t = nowSec - phaseT0;

        if (phase === "setout") {
          const k = clamp01(t / T.setout);
          gridMat.uniforms.uSet.value = smoothstep(k);
          plazaMat.uniforms.uDraw.value = easeOutExpo(clamp01(k / 0.85));
          if (k >= 1) go("frame");
        } else if (phase === "frame") {
          const k = clamp01(t / T.frame);
          W.uFrame.value = M.uFrame.value = k;
          // Mass starts before the drawing finishes, so the model is always
          // chasing the line — the whole reason for showing both.
          const mk = clamp01((t - T.frame * 0.42) / T.mass);
          W.uMass.value = M.uMass.value = mk;
          if (k >= 1 && mk >= 1) go("mark");
        } else if (phase === "mark") {
          const k = clamp01(t / T.mark);
          W.uFrame.value = M.uFrame.value = 1;
          W.uMass.value = M.uMass.value = 1;
          W.uFade.value = mix(1, 0.34, smoothstep(k));
          plazaMat.uniforms.uFade.value = mix(1, 0.45, smoothstep(clamp01((k - 0.3) / 0.7)));
          const b = sealBox(0);
          Object.assign(sealEl.style, {
            left: `${b.x}px`, top: `${b.y}px`,
            width: `${b.size}px`, height: `${b.size}px`,
            opacity: String(smoothstep(k)),
            transition: "none",
            transform: `scale(${mix(0.9, 1, easeOutExpo(k))})`,
          });
          if (k > 0.35) typeEl.dataset.on = "1";
          if (k >= 1) go("hold");
        } else if (phase === "hold") {
          if (t >= T.hold) go("plan");
        } else if (phase === "plan") {
          const k = clamp01(t / T.plan);
          setCamera(k);
          const b = sealBox(easeInOutCubic(k));
          Object.assign(sealEl.style, {
            left: `${b.x}px`, top: `${b.y}px`,
            width: `${b.size}px`, height: `${b.size}px`,
            opacity: "1", transform: "none",
          });
          W.uFlat.value = M.uFlat.value = smoothstep(clamp01((k - 0.3) / 0.7));
          gridMat.uniforms.uFade.value = 1 - smoothstep(k);
          if (k > 0.15) delete typeEl.dataset.on;
          if (k >= 1) {
            go("tile");
            const tr = targetRect();
            M.uTarget.value.copy(tr); W.uTarget.value.copy(tr);
            const scale = ((tr.z * 2) / PACK_COLS) / (CELL - GAP);
            M.uTileScale.value = W.uTileScale.value = scale;
          }
        } else if (phase === "tile") {
          const k = clamp01(t / T.tile);
          setCamera(1);
          // Release the plaza edge with the tiles, or it is left behind as a
          // bare circle once they have dissolved.
          plazaMat.uniforms.uFade.value = 0.45 * (1 - smoothstep(clamp01(k / 0.5)));
          const veil = 1 - smoothstep(clamp01((k - 0.25) / 0.55));
          stage.style.background = `rgba(255,255,255,${veil.toFixed(3)})`;
          W.uGather.value = M.uGather.value = clamp01(easeInOutCubic(k) / 0.92);
          W.uFade.value = 0.34 * (1 - smoothstep(clamp01(k / 0.45)));
          M.uPlate.value = smoothstep(clamp01((k - 0.18) / 0.62));
          if (k > 0.42) handOff();
          if (k >= 1) { go("done"); finish(); return; }
        }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        window.clearTimeout(watchdog);
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", layout);
        wgeo.dispose(); bgeo.dispose(); ggeo.dispose(); cgeo.dispose();
        wireMat.dispose(); massMat.dispose(); gridMat.dispose(); plazaMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      })
      .catch(bail);

    return () => {
      disposed = true;
      window.clearTimeout(watchdog);
      cleanup?.();
    };
  }, [mounted, visible]);

  if (!mounted || !visible) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes ma-intro-none { from { opacity: 1 } to { opacity: 1 } }
        [data-intro-type][data-on] { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>
      <div
        ref={stageRef}
        data-intro="stage"
        style={{
          position: "fixed", inset: 0, zIndex: 100, background: PAPER,
        }}
      >
        <div
          ref={sealRef}
          style={{ position: "fixed", zIndex: 120, pointerEvents: "none", opacity: 0, willChange: "transform, opacity" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SEAL_SRC} alt="" aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />
        </div>

        <div
          ref={typeRef}
          data-intro-type
          style={{
            position: "fixed", zIndex: 118, left: 0, right: 0, textAlign: "center",
            pointerEvents: "none", opacity: 0, transform: "translateY(10px)",
            transition: "opacity .9s cubic-bezier(.4,0,.2,1), transform .9s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <b className="label" style={{ display: "block", letterSpacing: ".44em", color: "#12100e" }}>
            MA Studio &amp; Partners
          </b>
          <span className="label meta" style={{ display: "block", marginTop: 9, letterSpacing: ".2em" }}>
            Architecture · Urbanism · Landscape · Interiors — Tirana
          </span>
        </div>

      </div>
    </>,
    document.body
  );
}

