import { useEffect, useRef } from "react";

type Variant = "donut" | "wave" | "tesseract" | "field" | "gothic";

const DONUT_GLYPHS = ".,-~:;=!*#$@";
const HYPER_GLYPHS = ".,-~:;=+*#%@";
const FIELD_GLYPHS = "·.,:;~-=+*#";

/** Intensity buckets for the field: [upper bound, color mix, alpha]. */
const FIELD_BUCKETS: Array<[number, number, number]> = [
  [0.58, 0.08, 0.26],
  [0.74, 0.3, 0.38],
  [0.88, 0.58, 0.52],
  [1.01, 1, 0.7],
];
const FIELD_THRESHOLD = 0.42;
const FIELD_RIPPLE_RADIUS = 26;

const GOTHIC_SWAY = 0.004; // wind drift, fraction of columns

// Close-up rose traced from the reference bloom (pale petal edges, deep core).
const ROSE_RAMP = ".,:;~-=+*#%@";
const ROSE_TEMPLATE: string[] = [
  "",
  "",
  "",
  "",
  "                          *-==--+#%+++===+*",
  "                    #***+=-=+*#%@ %-;~-==++",
  "               @++=----======+*#%  *,;;~==+* #",
  "           %###+=###%#+====-~~-=%@ -..,;~-=**#",
  "          @#**=*@% #=:..,:;--::;+  .....:~-=**@",
  "          %**++@  *=:;;:,,,,;~..*  ;;...,;~++%%",
  "       %%@%**+%   *-:,..,...,;.-  ~;--:.,;~+#@~;~=+#",
  "      *-=#@@#++   #-,...,..,;.-@ --~;~-;.;~#*;;~--=+*",
  "     #*+-~+###=*   #+;,,.,...;@+=+=~;;;-,~+~.;~~==++*%",
  "   @#*#*=-;;%@@@       #+=--:#*=#*=;:;~::-,.,;~===++#",
  "   @##**+-~;~~=@   ##****###=*+#*+-;:;~,~,.:;~===++#",
  "     %#*++=~::,:-*+=+**##%%%%%**=-~;;,.::.,;~====++*",
  "      @%#*+=~;:,,~=+++++++++**-;~;:,......,~=++++**@",
  "       @@@%#*+---,:;~-===--~~-:...,::,,:;~=+******#",
  "       #+*#%@%#*+++;,,:;;;::~:,:..,;~~~=*####%%%+~*",
  "       %=--~~~;:,:;:,,,,:;;~,.:~,,:-+*-~~---~--~-#",
  "       %+**+==--~~;;~~~=+;;,.,;;,;-*#%@@%#@*==+*",
  "        ##********+*#%@#:.:;:,:~-=**#%  ##@",
  "          %%%%%#%%@@@#+::;;:;~=*****%@ #+#%",
  "               @   %;:~-~~~-+**####%@@@+*%",
  "                    #=~~--=**##**##@%%#%@",
  "                      %#**+**+=+",
  "",
  "",
  "",
];
// Glyph index per template cell (-1 = empty), and the template's width.
const ROSE_ROWS: Int8Array[] = ROSE_TEMPLATE.map((row) =>
  Int8Array.from([...row].map((c) => ROSE_RAMP.indexOf(c))),
);
const ROSE_W = ROSE_ROWS.reduce((m, r) => Math.max(m, r.length), 0);

const TESS_DIST = 5;
const TESS_SCALE = 0.188;

const TESS_VERTICES: number[][] = [];
for (let i = 0; i < 16; i++) {
  TESS_VERTICES.push([
    i & 1 ? 1 : -1,
    i & 2 ? 1 : -1,
    i & 4 ? 1 : -1,
    i & 8 ? 1 : -1,
  ]);
}

const TESS_EDGES: Array<[number, number]> = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    let diff = 0;
    for (let k = 0; k < 4; k++) if (TESS_VERTICES[i][k] !== TESS_VERTICES[j][k]) diff++;
    if (diff === 1) TESS_EDGES.push([i, j]);
  }
}

interface AsciiArtProps {
  variant?: Variant;
  className?: string;
  fontSize?: number;
  speed?: number;
  /** Frame cap — lower it for large/ambient canvases. */
  fps?: number;
  /** Pointer drag to rotate + scroll-driven W-axis. Tesseract only. */
  interactive?: boolean;
}

type RGB = [number, number, number];

const FALLBACK_FROM: RGB = [139, 147, 165];
const FALLBACK_TO: RGB = [79, 70, 229];
const FALLBACK_BLOOD_FROM: RGB = [67, 16, 26];
const FALLBACK_BLOOD_TO: RGB = [122, 27, 43];

let rampKey = "__init";
let rampFrom: RGB = FALLBACK_FROM;
let rampTo: RGB = FALLBACK_TO;
let bloodFrom: RGB = FALLBACK_BLOOD_FROM;
let bloodTo: RGB = FALLBACK_BLOOD_TO;
let darkMode = false;

function parseHex(value: string, fallback: RGB): RGB {
  const hex = value.trim().replace(/^#/, "");
  const ok = hex.length === 3 || hex.length === 6;
  if (!ok) return fallback;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return fallback;
  return [r, g, b];
}

/** Re-reads the theme ramp only when the root theme class changes. */
function ensureRamp(): void {
  const el = document.documentElement;
  const key = el.className;
  if (key === rampKey) return;
  const style = getComputedStyle(el);
  rampFrom = parseHex(style.getPropertyValue("--color-latte"), FALLBACK_FROM);
  rampTo = parseHex(style.getPropertyValue("--color-ember"), FALLBACK_TO);
  bloodFrom = parseHex(
    style.getPropertyValue("--color-blood-deep"),
    FALLBACK_BLOOD_FROM,
  );
  bloodTo = parseHex(style.getPropertyValue("--color-blood"), FALLBACK_BLOOD_TO);
  darkMode = el.classList.contains("dark");
  rampKey = key;
}

/** Quiet two-stop ramp: muted slate at low intensity, accent indigo at full. */
function rampColor(mix: number, alpha = 1): string {
  ensureRamp();
  const t = mix < 0 ? 0 : mix > 1 ? 1 : mix;
  const r = Math.round(rampFrom[0] + (rampTo[0] - rampFrom[0]) * t);
  const g = Math.round(rampFrom[1] + (rampTo[1] - rampFrom[1]) * t);
  const b = Math.round(rampFrom[2] + (rampTo[2] - rampFrom[2]) * t);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Oxblood ramp for the stained-glass rose window. */
function bloodColor(mix: number, alpha?: number): string {
  ensureRamp();
  const t = mix < 0 ? 0 : mix > 1 ? 1 : mix;
  // Light parchment needs a whisper of tint; near-black can take more glow.
  const a = alpha ?? (darkMode ? 0.36 + 0.5 * t : 0.26 + 0.5 * t);
  const r = Math.round(bloodFrom[0] + (bloodTo[0] - bloodFrom[0]) * t);
  const g = Math.round(bloodFrom[1] + (bloodTo[1] - bloodFrom[1]) * t);
  const b = Math.round(bloodFrom[2] + (bloodTo[2] - bloodFrom[2]) * t);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Animated ASCII art rendered to a canvas for performance.
 * Two-tone accent ramp, DPR-aware, pauses off-screen / hidden,
 * and renders a single static frame when reduced motion is requested.
 */
export function AsciiArt({
  variant = "donut",
  className = "",
  fontSize = 13,
  speed = 1,
  fps = 30,
  interactive = false,
}: AsciiArtProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cols = 0;
    let rows = 0;
    let cellW = fontSize * 0.62;
    let cellH = fontSize * 1.05;
    let aspect = cellW / cellH;
    let running = false;
    let visible = true;
    let raf = 0;
    let lastDraw = 0;

    const draggable = interactive && variant === "tesseract" && !reduced;
    let dragging = false;
    let hovered = false;
    let yaw = 0;
    let pitch = 0;
    let yawVel = 0;
    let pitchVel = 0;
    let wTarget = 0;
    let wOffset = 0;
    let lastX = 0;
    let lastY = 0;

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cellW = fontSize * 0.62;
      cellH = fontSize * 1.05;
      aspect = cellW / cellH;
      cols = Math.max(12, Math.floor(rect.width / cellW));
      rows = Math.max(6, Math.floor(rect.height / cellH));
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
    };

    const zbuf = () => new Float32Array(cols * rows);
    let z = zbuf();
    let lum = new Float32Array(cols * rows);
    let hit = new Uint8Array(cols * rows);
    let cellBucket = new Uint8Array(cols * rows);
    let cellGlyph = new Uint8Array(cols * rows);
    let pointerX = -99999;
    let pointerY = -99999;

    const ensureCellBuffers = () => {
      const total = cols * rows;
      if (cellBucket.length !== total) {
        cellBucket = new Uint8Array(total);
        cellGlyph = new Uint8Array(total);
      }
    };

    const paintCell = (
      idx: number,
      value: number,
      threshold: number,
      buckets: Array<[number, number, number]>,
      glyphs: string,
    ) => {
      const v = value < 0 ? 0 : value > 1 ? 1 : value;
      if (v < threshold) {
        cellBucket[idx] = 255;
        return;
      }
      let bucket = buckets.length - 1;
      for (let b = 0; b < buckets.length; b++) {
        if (v < buckets[b][0]) {
          bucket = b;
          break;
        }
      }
      cellBucket[idx] = bucket;
      cellGlyph[idx] = Math.min(glyphs.length - 1, Math.floor(v * glyphs.length));
    };

    const paintBuckets = (
      buckets: Array<[number, number, number]>,
      glyphs: string,
    ) => {
      for (let b = 0; b < buckets.length; b++) {
        ctx.fillStyle = rampColor(buckets[b][1], buckets[b][2]);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = x + y * cols;
            if (cellBucket[idx] !== b) continue;
            ctx.fillText(
              glyphs[cellGlyph[idx]],
              x * cellW + cellW / 2,
              y * cellH + cellH / 2,
            );
          }
        }
      }
    };

    const drawDonut = (time: number) => {
      if (z.length !== cols * rows) {
        z = zbuf();
        lum = new Float32Array(cols * rows);
        hit = new Uint8Array(cols * rows);
      }
      z.fill(-1e9);
      hit.fill(0);
      lum.fill(0);

      const R1 = 1;
      const R2 = 2;
      const K2 = 5;
      const scale = 0.3 * Math.min(cols, rows / aspect);
      const A = time * 0.75;
      const B = time * 0.4;
      const cosA = Math.cos(A);
      const sinA = Math.sin(A);
      const cosB = Math.cos(B);
      const sinB = Math.sin(B);
      const cx = cols / 2;
      const cy = rows / 2;

      for (let theta = 0; theta < 6.2832; theta += 0.06) {
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        for (let phi = 0; phi < 6.2832; phi += 0.02) {
          const cp = Math.cos(phi);
          const sp = Math.sin(phi);
          const circleX = R2 + R1 * ct;
          const circleY = R1 * st;
          const x = circleX * (cosB * cp + sinA * sinB * sp) - circleY * cosA * sinB;
          const y = circleX * (sinB * cp - sinA * cosB * sp) + circleY * cosA * cosB;
          const depth = K2 + cosA * circleX * sp + circleY * sinA;
          const ooz = 1 / depth;
          const xp = Math.round(cx + scale * ooz * x);
          const yp = Math.round(cy - scale * ooz * y * aspect);
          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;
          const idx = xp + yp * cols;
          if (ooz <= z[idx]) continue;
          const l =
            cp * ct * sinB -
            cosA * ct * sp -
            sinA * st +
            cosB * (cosA * st - ct * sp);
          z[idx] = ooz;
          lum[idx] = l;
          hit[idx] = 1;
        }
      }

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = x + y * cols;
          if (!hit[idx]) continue;
          const n = Math.min(1, Math.max(0, (lum[idx] + 1.42) / 2.84));
          const gi = Math.min(
            DONUT_GLYPHS.length - 1,
            Math.floor(n * DONUT_GLYPHS.length)
          );
          ctx.fillStyle = rampColor(n, 0.35 + n * 0.65);
          ctx.fillText(DONUT_GLYPHS[gi], x * cellW + cellW / 2, y * cellH + cellH / 2);
        }
      }
    };

    const drawTesseract = (time: number) => {
      if (z.length !== cols * rows) {
        z = zbuf();
        lum = new Float32Array(cols * rows);
        hit = new Uint8Array(cols * rows);
      }
      z.fill(-1e9);
      hit.fill(0);
      lum.fill(0);

      const scale = TESS_SCALE * Math.min(cols, rows / aspect);
      const cx = cols / 2;
      const cy = rows / 2;

      const a = time * 0.62 + pitch;
      const b = time * 0.44 + yaw;
      const c = time * 0.27 + wOffset;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const cb = Math.cos(b);
      const sb = Math.sin(b);
      const cc = Math.cos(c);
      const sc = Math.sin(c);

      const px = new Float32Array(16);
      const py = new Float32Array(16);
      const pw = new Float32Array(16);
      const po = new Float32Array(16);

      for (let i = 0; i < 16; i++) {
        const v = TESS_VERTICES[i];
        const x1 = v[0] * ca - v[3] * sa;
        const w1 = v[0] * sa + v[3] * ca;
        const y1 = v[1] * cb - v[2] * sb;
        const z1 = v[1] * sb + v[2] * cb;
        const z2 = z1 * cc - w1 * sc;
        const w2 = z1 * sc + w1 * cc;
        const k4 = TESS_DIST / (TESS_DIST - w2);
        const ox = x1 * k4;
        const oy = y1 * k4;
        const oz = z2 * k4;
        const k3 = TESS_DIST / (TESS_DIST - oz);
        px[i] = cx + scale * ox * k3;
        py[i] = cy - scale * oy * k3 * aspect;
        pw[i] = w2;
        po[i] = k3;
      }

      const plot = (x: number, y: number, o: number, w: number) => {
        const xi = Math.round(x);
        const yi = Math.round(y);
        if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) return;
        const idx = xi + yi * cols;
        if (o <= z[idx]) return;
        z[idx] = o;
        lum[idx] = w;
        hit[idx] = 1;
      };

      const steps = Math.max(24, Math.round(scale * 6));
      for (const [i, j] of TESS_EDGES) {
        for (let s = 0; s <= steps; s++) {
          const k = s / steps;
          plot(
            px[i] + (px[j] - px[i]) * k,
            py[i] + (py[j] - py[i]) * k,
            po[i] + (po[j] - po[i]) * k,
            pw[i] + (pw[j] - pw[i]) * k
          );
        }
      }

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = x + y * cols;
          if (!hit[idx]) continue;
          const mix = Math.min(1, Math.max(0, (lum[idx] + 2) / 4));
          const gi = Math.min(HYPER_GLYPHS.length - 1, Math.floor(mix * HYPER_GLYPHS.length));
          const alpha = Math.min(1, Math.max(0.25, 0.3 + 0.55 * (z[idx] - 0.72)));
          ctx.fillStyle = rampColor(mix, alpha);
          ctx.fillText(HYPER_GLYPHS[gi], x * cellW + cellW / 2, y * cellH + cellH / 2);
        }
      }
    };

    const drawWave = (time: number) => {
      const mid = rows / 2;
      for (let x = 0; x < cols; x++) {
        const p = x / cols;
        const amp = rows * 0.32;
        const y1 = mid + Math.sin(p * 9 + time * 1.6) * amp;
        const y2 = mid + Math.sin(p * 7 - time * 1.1 + 1.6) * amp * 0.7;
        for (let y = 0; y < rows; y++) {
          const d1 = Math.abs(y - y1);
          const d2 = Math.abs(y - y2);
          const d = Math.min(d1, d2);
          if (d > 1.6) continue;
          const inten = 1 - d / 1.6;
          if (inten < 0.28) continue;
          const glyph = d < 0.7 ? "●" : d < 1.2 ? "•" : "·";
          ctx.fillStyle = rampColor(p, 0.25 + inten * 0.75);
          ctx.fillText(glyph, x * cellW + cellW / 2, y * cellH + cellH / 2);
        }
      }
    };

    const drawField = (time: number) => {
      ensureCellBuffers();
      const cx = cols / 2;
      const cy = rows / 2;
      const pcx = pointerX / cellW;
      const pcy = pointerY / cellH;
      const hasPointer = pointerX > -9999;

      for (let y = 0; y < rows; y++) {
        const dy = (y - cy) * 1.5;
        const pdy = (y - pcy) * 1.5;
        for (let x = 0; x < cols; x++) {
          const dx = x - cx;
          const r = Math.sqrt(dx * dx + dy * dy);
          let v =
            Math.sin(x * 0.16 + time * 0.3) *
              Math.cos(y * 0.2 - time * 0.22) *
              0.55 +
            Math.sin((x + y * 0.8) * 0.1 - time * 0.26) * 0.35 +
            Math.sin(r * 0.3 - time * 0.7) * 0.45;
          if (hasPointer) {
            const pdx = x - pcx;
            const pr = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pr < FIELD_RIPPLE_RADIUS) {
              v +=
                Math.cos(pr * 0.6 - time * 1.5) *
                (1 - pr / FIELD_RIPPLE_RADIUS) *
                0.5;
            }
          }

          paintCell(
            x + y * cols,
            (v + 1.35) / 2.7,
            FIELD_THRESHOLD,
            FIELD_BUCKETS,
            FIELD_GLYPHS,
          );
        }
      }

      paintBuckets(FIELD_BUCKETS, FIELD_GLYPHS);
    };

    const drawGothic = (time: number) => {
      const narrow = cols < 90;
      const blooms = narrow
        ? [
            { x: 0.72, y: 0.24, flip: false, ph: 0.4, s: 0.5 },
            { x: 0.45, y: 0.8, flip: true, ph: 2.1, s: 0.7 },
          ]
        : [
            { x: 0.035, y: 0.22, flip: false, ph: 0.4, s: 0.65 },
            { x: 0.4, y: 0.794, flip: false, ph: 2.1, s: 0.97 },
            { x: 0.965, y: 0.6, flip: true, ph: 3.6, s: 0.65 },
          ];
      const sway = GOTHIC_SWAY * cols;

      for (const b of blooms) {
        const s = b.s;
        const oW = Math.max(1, Math.round(ROSE_W * s));
        const oH = Math.max(1, Math.round(ROSE_ROWS.length * s));
        const x0 = Math.round(
          cols * b.x - oW / 2 + sway * Math.sin(time * 0.5 + b.ph),
        );
        const y0 = Math.round(
          rows * b.y -
            oH / 2 +
            sway * 0.35 * Math.sin(time * 0.8 + b.ph * 1.3),
        );
        for (let oy = 0; oy < oH; oy++) {
          const y = y0 + oy;
          if (y < 0 || y >= rows) continue;
          const row = ROSE_ROWS[Math.min(ROSE_ROWS.length - 1, Math.floor(oy / s))];
          for (let ox = 0; ox < oW; ox++) {
            const sx = Math.floor(ox / s);
            if (sx >= row.length) continue;
            const gi = row[sx];
            if (gi < 0) continue;
            const x = x0 + (b.flip ? oW - 1 - ox : ox);
            if (x < 0 || x >= cols) continue;
            ctx.fillStyle = bloodColor(gi / (ROSE_RAMP.length - 1));
            ctx.fillText(
              ROSE_RAMP[gi],
              x * cellW + cellW / 2,
              y * cellH + cellH / 2,
            );
          }
        }
      }
    };

    let time = 0.35;

    const frame = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (t - lastDraw < 1000 / fps) return;
      const dt = lastDraw ? (t - lastDraw) / 1000 : 1 / fps;
      lastDraw = t;
      if (!draggable || (!dragging && !hovered)) time += dt * speed;
      if (draggable) {
        if (!dragging) {
          yaw += yawVel;
          pitch += pitchVel;
          yawVel *= 0.94;
          pitchVel *= 0.94;
        }
        wOffset += (wTarget - wOffset) * Math.min(1, dt * 3);
      }
      ctx.clearRect(0, 0, cols * cellW, rows * cellH);
      if (variant === "wave") drawWave(time);
      else if (variant === "tesseract") drawTesseract(time);
      else if (variant === "field") drawField(time);
      else if (variant === "gothic") drawGothic(time);
      else drawDonut(time);
    };

    const renderOnce = () => {
      ctx.clearRect(0, 0, cols * cellW, rows * cellH);
      if (variant === "wave") drawWave(1.2);
      else if (variant === "tesseract") drawTesseract(1.1);
      else if (variant === "field") drawField(1.5);
      else if (variant === "gothic") drawGothic(1.5);
      else drawDonut(0.9);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      lastDraw = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const updateWTarget = () => {
      if (!draggable) return;
      const rect = wrap.getBoundingClientRect();
      const span = window.innerHeight + rect.height;
      const rel = span > 0 ? (window.innerHeight - rect.top) / span : 0.5;
      const clamped = rel < 0 ? 0 : rel > 1 ? 1 : rel;
      wTarget = (clamped - 0.5) * Math.PI * 1.5;
    };

    const relayout = () => {
      layout();
      updateWTarget();
      if (!running) renderOnce();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!draggable) return;
      dragging = true;
      hovered = true;
      lastX = e.clientX;
      lastY = e.clientY;
      yawVel = 0;
      pitchVel = 0;
      wrap.style.cursor = "grabbing";
      wrap.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!draggable || !dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.pointerType === "touch" ? 0 : e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      yaw += dx * 0.012;
      pitch += dy * 0.012;
      yawVel = dx * 0.012;
      pitchVel = dy * 0.012;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      hovered = wrap.matches(":hover");
      wrap.style.cursor = "grab";
      if (wrap.hasPointerCapture(e.pointerId)) wrap.releasePointerCapture(e.pointerId);
    };
    const onPointerEnter = () => {
      if (draggable) hovered = true;
    };
    const onPointerLeave = () => {
      if (!dragging) hovered = false;
    };

    const trackField = variant === "field" && !reduced;
    const onFieldMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
    };
    const onFieldLeave = () => {
      pointerX = -99999;
      pointerY = -99999;
    };

    layout();
    if (draggable) {
      updateWTarget();
      wrap.style.cursor = "grab";
      wrap.style.touchAction = "pan-y";
      wrap.addEventListener("pointerdown", onPointerDown);
      wrap.addEventListener("pointermove", onPointerMove);
      wrap.addEventListener("pointerup", onPointerUp);
      wrap.addEventListener("pointercancel", onPointerUp);
      wrap.addEventListener("pointerenter", onPointerEnter);
      wrap.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("scroll", updateWTarget, { passive: true });
      window.addEventListener("resize", updateWTarget);
    }
    if (trackField) {
      window.addEventListener("pointermove", onFieldMove, { passive: true });
      document.addEventListener("pointerleave", onFieldLeave);
    }
    if (reduced) {
      renderOnce();
    } else {
      start();
    }

    const ro = new ResizeObserver(() => {
      relayout();
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (reduced) return;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    const onVis = () => {
      if (reduced) return;
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerup", onPointerUp);
      wrap.removeEventListener("pointercancel", onPointerUp);
      wrap.removeEventListener("pointerenter", onPointerEnter);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", updateWTarget);
      window.removeEventListener("resize", updateWTarget);
      window.removeEventListener("pointermove", onFieldMove);
      document.removeEventListener("pointerleave", onFieldLeave);
    };
  }, [variant, fontSize, speed, fps, interactive]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
