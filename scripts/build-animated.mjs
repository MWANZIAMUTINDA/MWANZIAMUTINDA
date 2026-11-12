// Builds the animated profile: seven SVG sections plus the footer link cards.
//
//   npm install                                   (once: installs subset-font)
//   GH_TOKEN=$(gh auth token) node scripts/build-animated.mjs
//
// Without a token it reuses data/contributions.json. The GitHub Action in
// .github/workflows/animated-profile.yml runs this every day, so the ID badge
// dashboard and the contribution city follow your real commits.
//
// GitHub strips JavaScript from READMEs, so everything here is plain SVG with
// SMIL and CSS animation, and every font and image is embedded in the file.
//
// Your own art, when you have it (all optional, see assets/source/README.md):
//   assets/source/clip/*.jpg|png   frames of the 2-second waving clip (hero)
//   assets/source/portrait.png     portrait for the ID badge
//   assets/source/pointing.png     pointing pose for the footer
// Anything missing is drawn as a placeholder character.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import subsetFont from "subset-font";

const LOGIN = "MWANZIAMUTINDA";
const OUT = "assets/animated";
const SRC = "assets/source";
const CACHE = "data/contributions.json";

// ---------------------------------------------------------------- content

const NAME = "Sylvester Mutinda";
const ROLES = [
  "Full-stack engineer at Wakandi Kenya",
  "M-Pesa payments that never lose a shilling",
  "Software for SACCOs, chamas and churches",
  "Laravel · Next.js · Kotlin · Supabase",
];

const BUILDING = [
  { title: "CRB Lookup", meta: "Wakandi · credit checks", status: "Shipped Oct 2026", done: true },
  { title: "M-Pesa SMS top-ups", meta: "Wakandi · STK Push", status: "Live", done: true },
  { title: "Support chatbot", meta: "Wakandi · Brevo + knowledge base", status: "Live", done: true },
  { title: "SOKA", meta: "EA SPORTS FC friends' leagues", status: "Sprint 1", done: false },
  { title: "Mandai", meta: "Car imports for Kenya", status: "In progress", done: false },
];

const HOBBIES = [
  { title: "Football", line1: "I play, follow the tactics,", line2: "and build tools for my club.", art: "ball" },
  { title: "Streetwear", line1: "Sneakers and caps.", line2: "Jordans, mostly.", art: "sneaker" },
  { title: "Learning", line1: "Distributed systems", line2: "and AI agents.", art: "graph" },
];

// Brand colours for the orbit. Labels instead of logos keep this file free of trademarks.
const ORBIT = [
  [
    { label: "PHP", color: "#777BB4" },
    { label: "Lar", color: "#FF2D20" },
    { label: "JS", color: "#F7DF1E", ink: "#111" },
  ],
  [
    { label: "TS", color: "#3178C6" },
    { label: "Next", color: "#111111", ring: "#e6edf3" },
    { label: "Py", color: "#3776AB" },
  ],
  [
    { label: "Kt", color: "#7F52FF" },
    { label: "PG", color: "#4169E1" },
    { label: "SB", color: "#3ECF8E", ink: "#0b1d14" },
  ],
];

const STACK = [
  ["Frontend", ["TypeScript", "React", "Next.js", "Tailwind"]],
  ["Backend", ["PHP", "Laravel", "Node.js", "Python", "Flask"]],
  ["Mobile & data", ["Kotlin", "Android", "PostgreSQL", "Supabase", "MySQL"]],
  ["Payments", ["M-Pesa Daraja", "STK Push", "Brevo", "SMS"]],
  ["Delivery", ["Docker", "Coolify", "Vercel", "Linux", "GitHub"]],
];

const NOW = ["SOKA, sprint 1", "CRB Lookup, shipped Oct 2026"];

const LINKS = [
  { file: "link-github", title: "GitHub", sub: "@MWANZIAMUTINDA · follow along", color: "#22d3ee", glyph: "gh" },
  { file: "link-repos", title: "Repositories", sub: "{repos} public projects", color: "#f472b6", glyph: "{}" },
  { file: "link-soka", title: "SOKA", sub: "Run your EA SPORTS FC league", color: "#3fb950", glyph: "⚽" },
];

// ---------------------------------------------------------------- look

const C = {
  bg: "#0a0e1a",
  panel: "#0f1526",
  line: "#24304a",
  text: "#e6edf3",
  dim: "#8b97ad",
  faint: "#56627a",
  cyan: "#22d3ee",
  pink: "#f472b6",
  green: "#3fb950",
  yellow: "#facc15",
  red: "#ef4444",
};

const FONTS = {
  serif: { file: "fonts/instrument-serif-latin-400-normal.woff2", family: "AnimSerif", stack: "AnimSerif, Georgia, serif" },
  sans: { file: "fonts/geist-latin-400-normal.woff2", family: "AnimSans", stack: "AnimSans, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" },
  mono: { file: "fonts/geist-mono-latin-400-normal.woff2", family: "AnimMono", stack: "AnimMono, ui-monospace, Menlo, Consolas, monospace" },
};
const SERIF = `font-family="${FONTS.serif.stack}"`;
const MONO = `font-family="${FONTS.mono.stack}"`;

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const f = (n) => +n.toFixed(2);

// Small seeded random, so a rebuild with the same data draws the same city.
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Visible from window i of n, over a cycle; for SMIL opacity.
function windowAnim(i, n, dur, fade = 0.025) {
  const s = i / n;
  const t = (i + 1) / n;
  const values = i === 0 ? "1;1;0;0;1" : "0;0;1;1;0;0";
  const times = i === 0 ? `0;${f(t - fade)};${f(t)};${f(1 - fade)};1` : `0;${f(s)};${f(s + fade)};${f(t - fade)};${f(t)};1`;
  return `<animate attributeName="opacity" values="${values}" keyTimes="${times}" dur="${dur}s" repeatCount="indefinite"/>`;
}

const GLOW = (id, sd = 4) =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

function frame(w, h, label, body, defs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONTS.sans.stack}">
  <title>${esc(label)}</title>
  <defs>/*FONTS*/${defs}</defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="14" fill="${C.bg}" stroke="${C.line}"/>
${body}
</svg>
`;
}

const kicker = (x, y, text, color = C.cyan) =>
  `<text x="${x}" y="${y}" ${MONO} font-size="11" letter-spacing="1.5" fill="${color}">// ${esc(text)}</text>`;

// ---------------------------------------------------------------- your art

function dataUri(path) {
  const ext = extname(path).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}
const art = (name) => {
  for (const ext of [".png", ".webp", ".jpg", ".jpeg"]) if (existsSync(join(SRC, name + ext))) return dataUri(join(SRC, name + ext));
  return null;
};
const clipFrames = () => {
  const dir = join(SRC, "clip");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => /\.(png|jpe?g|webp)$/i.test(n))
    .sort()
    .map((n) => dataUri(join(dir, n)));
};

// ---------------------------------------------------------------- the placeholder character
// Drawn around the head centre (0,0). Long dark hair, sunglasses on the head,
// white zip hoodie over a yellow tee. Replace with your own art any time.

const P = {
  skin: "#9a5b34",
  skinShade: "#7c4526",
  hair: "#15111d",
  hoodie: "#f4f5f7",
  hoodieShade: "#cfd5de",
  tee: C.yellow,
  ink: "#1d1720",
  jeans: "#1e3a8a",
  jeansShade: "#172f70",
};

function face({ wink = false } = {}) {
  const blink = `<animate attributeName="ry" values="5;5;0.6;5" keyTimes="0;0.93;0.96;1" dur="4.2s" repeatCount="indefinite"/>`;
  const eyeL = `<ellipse cx="-12" cy="6" rx="4" ry="5" fill="${P.ink}">${blink}</ellipse><circle cx="-10.6" cy="4.2" r="1.3" fill="#fff"/>`;
  const eyeR = wink
    ? `<path d="M7 7 Q12 1 17 7" fill="none" stroke="${P.ink}" stroke-width="2.6" stroke-linecap="round"/>`
    : `<ellipse cx="12" cy="6" rx="4" ry="5" fill="${P.ink}">${blink}</ellipse><circle cx="13.4" cy="4.2" r="1.3" fill="#fff"/>`;
  return `
    <circle cx="-34" cy="6" r="7" fill="${P.skin}"/><circle cx="34" cy="6" r="7" fill="${P.skin}"/>
    <ellipse cx="0" cy="0" rx="34" ry="40" fill="${P.skin}"/>
    <path d="M-36 -4 Q-40 -48 0 -47 Q40 -48 36 -4 Q32 -28 10 -29 Q-8 -20 -36 -4 Z" fill="${P.hair}"/>
    <g>
      <rect x="-27" y="-37" width="23" height="13" rx="5" fill="#111827" stroke="${C.cyan}" stroke-width="1.4"/>
      <rect x="4" y="-37" width="23" height="13" rx="5" fill="#111827" stroke="${C.cyan}" stroke-width="1.4"/>
      <path d="M-4 -31 Q0 -34 4 -31" fill="none" stroke="${C.cyan}" stroke-width="1.4"/>
      <path d="M-22 -33 l5 0 M9 -33 l5 0" stroke="#7dd3fc" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
    </g>
    <path d="M-18 -6 Q-12 -9 -6 -6 M6 -6 Q12 -9 18 -6" fill="none" stroke="${P.hair}" stroke-width="2.4" stroke-linecap="round"/>
    ${eyeL}${eyeR}
    <circle cx="-20" cy="16" r="5" fill="${C.pink}" opacity="0.35"/><circle cx="20" cy="16" r="5" fill="${C.pink}" opacity="0.35"/>
    <path d="M-10 19 Q0 32 10 19 Z" fill="#5b1f1f" stroke="${P.ink}" stroke-width="2" stroke-linejoin="round"/>`;
}

function torso(bottom) {
  return `
    <path d="M-46 -10 Q-52 40 -44 ${bottom > 120 ? 92 : 80} L44 ${bottom > 120 ? 92 : 80} Q52 40 46 -10 Z" fill="${P.hair}"/>
    <rect x="-11" y="30" width="22" height="24" fill="${P.skinShade}"/>
    <path d="M-62 ${bottom} L-62 112 Q-60 62 -22 52 L22 52 Q60 62 62 112 L62 ${bottom} Z" fill="${P.hoodie}"/>
    <path d="M-14 54 L0 80 L14 54 Z" fill="${P.tee}"/>
    <path d="M-26 52 Q0 76 26 52 Q30 45 22 43 Q0 62 -22 43 Q-30 45 -26 52 Z" fill="${P.hoodieShade}"/>
    <path d="M0 80 L0 ${bottom}" stroke="${P.hoodieShade}" stroke-width="2"/>
    <path d="M-9 62 L-11 92 M9 62 L11 92" stroke="${P.hoodieShade}" stroke-width="2" stroke-linecap="round"/>`;
}

const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="${P.skin}"/>`;
const sleeve = (d) => `<path d="${d}" fill="none" stroke="${P.hoodie}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`;

// Waving, holding an open laptop. Upper body, ends at y=170.
function characterWave() {
  return `
  ${torso(170)}
  <g>
    <animateTransform attributeName="transform" type="rotate" values="-10 50 70;16 50 70;-10 50 70" dur="1.1s" repeatCount="indefinite"/>
    ${sleeve("M50 70 L78 12")}
    <circle cx="80" cy="0" r="12" fill="${P.skin}"/>
    <path d="M72 -8 l-3 -9 M78 -11 l-1 -10 M85 -10 l1 -9 M91 -5 l4 -7" stroke="${P.skin}" stroke-width="5" stroke-linecap="round"/>
  </g>
  ${sleeve("M-50 70 L-52 128")}
  <g>
    <rect x="-46" y="98" width="74" height="50" rx="5" fill="#c9ced8" stroke="#8f99aa" stroke-width="1.5"/>
    <text x="-9" y="128" text-anchor="middle" ${MONO} font-size="13" fill="${C.cyan}">&lt;/&gt;</text>
  </g>
  ${hand(-44, 140)}${hand(24, 140)}
  <g>${face()}</g>`;
}

// Full body, winking, pointing to the right with one hand on the hip. Feet at y≈262.
function characterPoint() {
  return `
  <path d="M-38 168 L-36 248 L-8 248 L-2 176 L2 176 L8 248 L36 248 L38 168 Z" fill="${P.jeans}"/>
  <path d="M0 176 L0 246" stroke="${P.jeansShade}" stroke-width="2"/>
  <g>
    <path d="M-44 248 Q-46 262 -42 264 L-2 264 Q0 254 -10 248 Z" fill="#f8fafc"/>
    <path d="M-38 255 Q-26 250 -14 257" fill="none" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>
    <rect x="-44" y="262" width="44" height="5" rx="2" fill="${C.red}"/>
    <path d="M44 248 Q46 262 42 264 L2 264 Q0 254 10 248 Z" fill="#f8fafc"/>
    <path d="M38 255 Q26 250 14 257" fill="none" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>
    <rect x="0" y="262" width="44" height="5" rx="2" fill="${C.red}"/>
  </g>
  ${torso(174)}
  ${sleeve("M-50 70 L-72 112 L-52 140")}
  ${hand(-50, 142)}
  <g>
    <animateTransform attributeName="transform" type="rotate" values="0 50 70;-5 50 70;0 50 70" dur="1.6s" repeatCount="indefinite"/>
    ${sleeve("M50 70 L112 58")}
    <circle cx="120" cy="58" r="11" fill="${P.skin}"/>
    <rect x="122" y="51" width="22" height="7" rx="3.5" fill="${P.skin}"/>
    <path d="M118 66 q6 3 10 -1" fill="none" stroke="${P.skinShade}" stroke-width="2" stroke-linecap="round"/>
  </g>
  <g>${face({ wink: true })}</g>`;
}

// Head and shoulders, for the ID badge.
function characterBust() {
  return `${torso(150)}<g>${face()}</g>`;
}

// ---------------------------------------------------------------- 1. hero

function hero(frames, still) {
  const W = 860;
  const H = 300;
  // Viewfinder: x 28..318, y 28..272
  const vx = 28, vy = 28, vw = 290, vh = 244;
  const corner = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 22} L${x} ${y} L${x + dx * 22} ${y}" fill="none" stroke="${C.cyan}" stroke-width="2.5" stroke-linecap="round"/>`;

  let subject;
  if (frames.length) {
    const dur = 2;
    subject = frames
      .map((src, i) => `<image href="${src}" x="${vx}" y="${vy}" width="${vw}" height="${vh}" preserveAspectRatio="xMidYMid slice" opacity="${i === 0 ? 1 : 0}">
        <animate attributeName="opacity" values="${frames.map((_, j) => (j === i ? 1 : 0)).join(";")}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/></image>`)
      .join("\n");
  } else if (still) {
    subject = `<image href="${still}" x="${vx}" y="${vy}" width="${vw}" height="${vh}" preserveAspectRatio="xMidYMid slice"/>`;
  } else {
    subject = `<g transform="translate(173 112) scale(0.95)">
      <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 -3;0 0" dur="2.2s" repeatCount="indefinite"/>
      ${characterWave()}</g>`;
  }

  const roles = ROLES.map(
    (r, i) => `<g opacity="${i === 0 ? 1 : 0}">${windowAnim(i, ROLES.length, ROLES.length * 3)}
      <text x="372" y="190" ${MONO} font-size="17" fill="${C.text}"><tspan fill="${C.pink}">&gt; </tspan>${esc(r)}</text></g>`,
  ).join("\n");

  const body = `
  <defs>
    <clipPath id="vf"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="8"/></clipPath>
    <radialGradient id="spot" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#1b2a4a"/><stop offset="1" stop-color="${C.panel}"/></radialGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0 L0 0 0 24" fill="none" stroke="#141c30" stroke-width="1"/></pattern>
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="url(#grid)"/>
  <g clip-path="url(#vf)">
    <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#spot)"/>
    ${subject}
    <rect x="${vx}" y="${vy}" width="${vw}" height="3" fill="${C.cyan}" opacity="0.10">
      <animate attributeName="y" values="${vy};${vy + vh};${vy}" dur="4s" repeatCount="indefinite"/>
    </rect>
  </g>
  ${corner(vx + 8, vy + 8, 1, 1)}${corner(vx + vw - 8, vy + 8, -1, 1)}${corner(vx + 8, vy + vh - 8, 1, -1)}${corner(vx + vw - 8, vy + vh - 8, -1, -1)}
  <circle cx="${vx + 26}" cy="${vy + 26}" r="5" fill="${C.red}"><animate attributeName="opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite"/></circle>
  <text x="${vx + 36}" y="${vy + 30}" ${MONO} font-size="11" fill="${C.text}">REC</text>
  <text x="${vx + vw - 24}" y="${vy + 30}" text-anchor="end" ${MONO} font-size="11" fill="${C.text}">00:00:02</text>
    <text x="${vx + vw - 24}" y="${vy + vh - 18}" text-anchor="end" ${MONO} font-size="10" fill="${C.dim}">4K · 60</text>
  <rect x="${vx + vw / 2 - 16}" y="${vy + vh / 2 - 16}" width="32" height="32" fill="none" stroke="${C.cyan}" stroke-width="1" opacity="0.35"/>

  ${kicker(372, 76, "HELLO, WORLD · I'M")}
  <text x="370" y="138" ${SERIF} font-size="58" fill="${C.text}">${esc(NAME)}</text>
  ${roles}
  <rect x="372" y="202" width="9" height="2" fill="${C.pink}"><animate attributeName="opacity" values="1;0;1" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect>
  <g ${MONO} font-size="12" fill="${C.dim}">
    <text x="372" y="244">Wakandi Kenya · Nairobi</text>
    <text x="372" y="264">SACCOs · chamas · M-Pesa · credit</text>
  </g>
  <g transform="translate(784 240)">
    ${ROLES.map((_, i) => `<rect x="${i * 12}" y="0" width="8" height="8" rx="4" fill="${C.line}"/><rect x="${i * 12}" y="0" width="8" height="8" rx="4" fill="${C.cyan}" opacity="${i === 0 ? 1 : 0}">${windowAnim(i, ROLES.length, ROLES.length * 3)}</rect>`).join("")}
  </g>`;
  return frame(W, H, `${NAME}: ${ROLES.join(", ")}`, body);
}

// ---------------------------------------------------------------- 2. what I build

function building() {
  const W = 425;
  const H = 360;
  const rows = BUILDING.map((b, i) => {
    const y = 74 + i * 56;
    const barW = W - 56;
    const bar = b.done
      ? `<rect x="28" y="${y + 30}" width="0" height="5" rx="2.5" fill="${C.green}">
          <animate attributeName="width" from="0" to="${barW}" begin="${0.3 + i * 0.35}s" dur="1.1s" fill="freeze"/></rect>`
      : `<g clip-path="url(#bar${i})"><rect x="${28 - 120}" y="${y + 30}" width="120" height="5" rx="2.5" fill="${C.pink}">
          <animate attributeName="x" values="${28 - 120};${28 + barW}" dur="${1.8 + i * 0.3}s" repeatCount="indefinite"/></rect></g>`;
    return `
    <clipPath id="bar${i}"><rect x="28" y="${y + 30}" width="${barW}" height="5" rx="2.5"/></clipPath>
    <text x="28" y="${y}" font-size="15" fill="${C.text}">${esc(b.title)}</text>
    <text x="${W - 28}" y="${y}" text-anchor="end" ${MONO} font-size="11" fill="${b.done ? C.green : C.pink}">${esc(b.status)}</text>
    <text x="28" y="${y + 18}" ${MONO} font-size="11" fill="${C.dim}">${esc(b.meta)}</text>
    <rect x="28" y="${y + 30}" width="${barW}" height="5" rx="2.5" fill="#1a2338"/>
    ${bar}`;
  }).join("\n");
  const body = `
  ${kicker(28, 38, "WHAT I BUILD")}
  ${rows}`;
  return frame(W, H, `What I build: ${BUILDING.map((b) => `${b.title} (${b.status})`).join(", ")}`, body);
}

// ---------------------------------------------------------------- 3. hobbies carousel

function hobbyArt(kind) {
  if (kind === "ball") {
    return `<g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -46;0 0" keyTimes="0;0.5;1" keySplines="0.2 0.7 0.4 1;0.6 0 0.8 0.3" calcMode="spline" dur="1s" repeatCount="indefinite"/>
      <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite"/>
        <circle r="34" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
        <path d="M0 -12 L11 -4 L7 10 L-7 10 L-11 -4 Z" fill="#0f172a"/>
        <path d="M0 -12 L0 -34 M11 -4 L32 -11 M7 10 L20 28 M-7 10 L-20 28 M-11 -4 L-32 -11" stroke="#0f172a" stroke-width="2"/>
      </g></g>
      <ellipse cx="0" cy="46" rx="30" ry="5" fill="#000" opacity="0.4"><animate attributeName="rx" values="30;16;30" dur="1s" repeatCount="indefinite"/></ellipse>`;
  }
  if (kind === "sneaker") {
    return `<g transform="translate(-62 -24)">
      <animateTransform attributeName="transform" type="rotate" additive="sum" values="-4 62 40;4 62 40;-4 62 40" dur="2s" repeatCount="indefinite"/>
      <path d="M4 50 L8 20 Q10 6 26 8 L44 12 Q52 30 76 34 L112 40 Q124 44 122 56 L122 62 L4 62 Z" fill="#f8fafc"/>
      <path d="M8 22 Q24 18 40 24 L44 12 Q30 6 16 8 Q8 10 8 22 Z" fill="${C.red}"/>
      <path d="M22 44 Q60 34 104 50" fill="none" stroke="${C.red}" stroke-width="7" stroke-linecap="round"/>
      <path d="M50 26 l10 -3 M56 32 l10 -3 M62 37 l10 -3" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="2" y="60" width="122" height="9" rx="4" fill="${C.red}"/>
    </g>`;
  }
  const nodes = [[-48, -22], [0, -40], [46, -18], [-30, 28], [28, 32], [0, 0]];
  const edges = [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [0, 1], [1, 2], [3, 4], [2, 4]];
  return `<g>
    ${edges.map(([a, b], i) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="${C.cyan}" stroke-width="1.5" opacity="0.5" stroke-dasharray="4 4"><animate attributeName="stroke-dashoffset" from="0" to="-16" dur="${1 + (i % 3) * 0.4}s" repeatCount="indefinite"/></line>`).join("")}
    ${nodes.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 5 ? 13 : 8}" fill="${i === 5 ? C.pink : C.panel}" stroke="${i === 5 ? C.pink : C.cyan}" stroke-width="2"><animate attributeName="r" values="${i === 5 ? "13;15;13" : "8;9.5;8"}" dur="${1.4 + i * 0.2}s" repeatCount="indefinite"/></circle>`).join("")}
  </g>`;
}

function hobbies() {
  const W = 425;
  const H = 360;
  const n = HOBBIES.length;
  const slide = 4;
  const total = n * slide;
  const segW = (W - 56 - (n - 1) * 6) / n;
  const bars = HOBBIES.map((_, i) => {
    const x = 28 + i * (segW + 6);
    const a = i / n;
    const b = (i + 1) / n;
    return `<rect x="${f(x)}" y="56" width="${f(segW)}" height="3" rx="1.5" fill="#1a2338"/>
      <rect x="${f(x)}" y="56" width="0" height="3" rx="1.5" fill="${C.text}">
        <animate attributeName="width" values="0;0;${f(segW)};${f(segW)}" keyTimes="0;${f(a)};${f(b)};1" dur="${total}s" repeatCount="indefinite"/></rect>`;
  }).join("");
  const slides = HOBBIES.map((h, i) => `<g opacity="${i === 0 ? 1 : 0}">${windowAnim(i, n, total, 0.02)}
      <g transform="translate(${W / 2} 172)">${hobbyArt(h.art)}</g>
      <text x="${W / 2}" y="270" text-anchor="middle" ${SERIF} font-size="30" fill="${C.text}">${esc(h.title)}</text>
      <text x="${W / 2}" y="298" text-anchor="middle" font-size="13" fill="${C.dim}">${esc(h.line1)}</text>
      <text x="${W / 2}" y="317" text-anchor="middle" font-size="13" fill="${C.dim}">${esc(h.line2)}</text>
    </g>`).join("\n");
  const body = `
  ${kicker(28, 38, "BEYOND CODE", C.pink)}
  ${bars}
  ${slides}`;
  return frame(W, H, `Beyond code: ${HOBBIES.map((h) => `${h.title}, ${h.line1} ${h.line2}`).join(" ")}`, body);
}

// ---------------------------------------------------------------- 4. tech orbit + chip grid

function techOrbit() {
  const W = 860;
  const H = 340;
  const cx = 200;
  const cy = 188;
  const rx = 136;
  const ry = 46;
  const tilts = [0, 60, -60];
  const durs = [14, 18, 22];

  const orbitPath = (tilt) => {
    const t = (tilt * Math.PI) / 180;
    const pts = [];
    for (let k = 0; k <= 96; k++) {
      const a = (k / 96) * Math.PI * 2;
      const x = rx * Math.cos(a);
      const y = ry * Math.sin(a);
      pts.push(`${f(cx + x * Math.cos(t) - y * Math.sin(t))} ${f(cy + x * Math.sin(t) + y * Math.cos(t))}`);
    }
    return `M${pts.join(" L")} Z`;
  };

  const orbits = tilts.map((tilt, o) => {
    const d = orbitPath(tilt);
    const icons = ORBIT[o].map((ic, k) => {
      const begin = -((durs[o] * (k + o / 3)) / ORBIT[o].length);
      return `<g>
        <animateMotion path="${d}" dur="${durs[o]}s" begin="${f(begin)}s" repeatCount="indefinite"/>
        <circle r="19" fill="${ic.color}" stroke="${ic.ring ?? "#0a0e1a"}" stroke-width="2"/>
        <text y="4.5" text-anchor="middle" ${MONO} font-size="${ic.label.length > 3 ? 10 : 12}" font-weight="700" fill="${ic.ink ?? "#fff"}">${esc(ic.label)}</text>
      </g>`;
    }).join("");
    return { ring: `<path d="${d}" fill="none" stroke="${o === 1 ? C.pink : C.cyan}" stroke-width="1.2" opacity="0.45" stroke-dasharray="3 6"/>`, icons };
  });

  let chipY = 78;
  const chips = STACK.map(([area, items]) => {
    const y = chipY;
    chipY += 50;
    let x = 460;
    const row = items.map((it) => {
      const w = it.length * 7.2 + 22;
      const out = `<rect x="${f(x)}" y="${y + 6}" width="${f(w)}" height="24" rx="12" fill="${C.panel}" stroke="${C.line}"/>
        <text x="${f(x + w / 2)}" y="${y + 22}" text-anchor="middle" ${MONO} font-size="12" fill="${C.text}">${esc(it)}</text>`;
      x += w + 8;
      return out;
    }).join("");
    return `<text x="460" y="${y}" ${MONO} font-size="10" letter-spacing="1" fill="${C.dim}">${esc(area.toUpperCase())}</text>${row}`;
  }).join("\n");

  const body = `
  ${kicker(28, 38, "TECH ORBIT")}
  ${orbits.map((o) => o.ring).join("")}
  <circle cx="${cx}" cy="${cy}" r="30" fill="url(#core)" filter="url(#glow)"><animate attributeName="r" values="28;33;28" dur="2.4s" repeatCount="indefinite"/></circle>
  <text x="${cx}" y="${cy + 5}" text-anchor="middle" ${MONO} font-size="14" font-weight="700" fill="#0a0e1a">&lt;/&gt;</text>
  ${orbits.map((o) => o.icons).join("")}
  <line x1="430" y1="60" x2="430" y2="310" stroke="${C.line}"/>
  ${kicker(460, 38, "STACK", C.pink)}
  ${chips}`;
  const defs = `${GLOW("glow", 6)}<radialGradient id="core"><stop offset="0" stop-color="#ecfeff"/><stop offset="0.55" stop-color="${C.cyan}"/><stop offset="1" stop-color="#0e7490"/></radialGradient>`;
  return frame(W, H, `Tech stack. ${STACK.map(([a, i]) => `${a}: ${i.join(", ")}`).join(". ")}.`, body, defs);
}

// ---------------------------------------------------------------- stats from the calendar

function stats(data) {
  const days = data.days;
  const total = days.reduce((s, d) => s + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;
  const best = days.reduce((b, d) => (d.count > b.count ? d : b), days[0]);
  let i = days.length - 1;
  if (days[i].count === 0) i--;
  let streak = 0;
  for (; i >= 0 && days[i].count > 0; i--) streak++;
  const months = new Map();
  for (const d of days) {
    const k = d.date.slice(0, 7);
    months.set(k, (months.get(k) ?? 0) + d.count);
  }
  const last8 = [...months.entries()].slice(-8);
  return { total, active, best, streak, months: last8 };
}

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTH[m - 1]} ${y}`;
};

// ---------------------------------------------------------------- 5. ID badge + dashboard

function badge(data, portrait) {
  const W = 860;
  const H = 360;
  const s = stats(data);

  const face = portrait
    ? `<image href="${portrait}" x="-47" y="-47" width="94" height="94" preserveAspectRatio="xMidYMid slice" clip-path="url(#ph)"/>`
    : `<g clip-path="url(#ph)"><rect x="-47" y="-47" width="94" height="94" fill="#1b2a4a"/><g transform="translate(0 -4) scale(0.52)">${characterBust()}</g></g>`;

  const barcode = Array.from({ length: 34 }, (_, k) => {
    const w = [1, 2, 1, 3, 1, 2][(k * 7 + LOGIN.charCodeAt(k % LOGIN.length)) % 6];
    return `<rect x="${-70 + k * 4.1}" y="0" width="${w}" height="20" fill="#0a0e1a"/>`;
  }).join("");

  // The card swings from the lanyard clip at (170, 30).
  const card = `
  <g>
    <animateTransform attributeName="transform" type="rotate" values="-4 170 20;4 170 20;-4 170 20" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" calcMode="spline" dur="3.2s" repeatCount="indefinite"/>
    <path d="M150 -2 L166 52 M190 -2 L174 52" stroke="${C.pink}" stroke-width="5" stroke-linecap="round"/>
    <rect x="160" y="48" width="20" height="16" rx="3" fill="#94a3b8"/>
    <g transform="translate(170 0)">
      <rect x="-90" y="58" width="180" height="270" rx="14" fill="#e8edf5"/>
      <rect x="-90" y="58" width="180" height="270" rx="14" fill="url(#holo)"/>
      <rect x="-90" y="58" width="180" height="270" rx="14" fill="url(#sheen)"/>
      <rect x="-22" y="68" width="44" height="7" rx="3.5" fill="#94a3b8"/>
      <text x="0" y="98" text-anchor="middle" ${MONO} font-size="10" letter-spacing="2" fill="#334155">DEVELOPER ID</text>
      <g transform="translate(0 158)">
        <circle r="50" fill="none" stroke="${C.cyan}" stroke-width="3"/>
        ${face}
      </g>
      <text x="0" y="236" text-anchor="middle" ${SERIF} font-size="24" fill="#0a0e1a">${esc(NAME)}</text>
      <text x="0" y="254" text-anchor="middle" ${MONO} font-size="10" fill="#334155">FULL-STACK ENGINEER</text>
      <text x="0" y="270" text-anchor="middle" ${MONO} font-size="10" fill="#334155">NAIROBI · KE</text>
      <g transform="translate(0 284)">${barcode}</g>
      <text x="0" y="318" text-anchor="middle" ${MONO} font-size="8" letter-spacing="1" fill="#475569">@${LOGIN}</text>
    </g>
  </g>`;

  const tiles = [
    { label: "CONTRIBUTIONS", value: s.total, sub: "last 12 months" },
    { label: "ACTIVE DAYS", value: s.active, sub: "with a commit" },
    { label: "BEST DAY", value: s.best.count, sub: fmtDate(s.best.date) },
    { label: "STREAK", value: s.streak, sub: s.streak === 1 ? "day, current" : "days, current" },
  ].map((t, i) => {
    const x = 360 + i * 122;
    return `<rect x="${x}" y="56" width="112" height="78" rx="10" fill="${C.panel}" stroke="${C.line}"/>
      <text x="${x + 12}" y="76" ${MONO} font-size="9" letter-spacing="1" fill="${C.dim}">${t.label}</text>
      <text x="${x + 12}" y="108" ${SERIF} font-size="32" fill="${i % 2 ? C.pink : C.cyan}">${t.value}</text>
      <text x="${x + 12}" y="124" ${MONO} font-size="9.5" fill="${C.faint}">${esc(t.sub)}</text>`;
  }).join("\n");

  const max = Math.max(1, ...s.months.map(([, v]) => v));
  const chartX = 360;
  const chartBase = 302;
  const chartH = 110;
  const bw = 32;
  const gap = (300 - bw * s.months.length) / (s.months.length - 1 || 1);
  const bars = s.months.map(([k, v], i) => {
    const h = Math.max(2, (v / max) * chartH);
    const x = chartX + i * (bw + gap);
    return `<rect x="${f(x)}" y="${f(chartBase - h)}" width="${bw}" height="${f(h)}" rx="4" fill="url(#bar)">
        <animate attributeName="height" from="0" to="${f(h)}" begin="${0.2 + i * 0.12}s" dur="0.9s" fill="freeze"/>
        <animate attributeName="y" from="${chartBase}" to="${f(chartBase - h)}" begin="${0.2 + i * 0.12}s" dur="0.9s" fill="freeze"/></rect>
      <text x="${f(x + bw / 2)}" y="${f(chartBase - h - 6)}" text-anchor="middle" ${MONO} font-size="10" fill="${C.text}">${v}</text>
      <text x="${f(x + bw / 2)}" y="${chartBase + 16}" text-anchor="middle" ${MONO} font-size="10" fill="${C.dim}">${MONTH[Number(k.slice(5)) - 1]}</text>`;
  }).join("\n");

  const body = `
  ${card}
  ${kicker(360, 38, "DASHBOARD · LIVE")}
  <circle cx="${W - 34}" cy="34" r="4" fill="${C.green}"><animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/></circle>
  ${tiles}
  <text x="360" y="166" ${MONO} font-size="10" letter-spacing="1" fill="${C.dim}">CONTRIBUTIONS PER MONTH</text>
  ${bars}
  <line x1="${chartX}" y1="${chartBase}" x2="${chartX + 300}" y2="${chartBase}" stroke="${C.line}"/>
  <rect x="690" y="160" width="146" height="142" rx="10" fill="${C.panel}" stroke="${C.line}"/>
  <text x="704" y="182" ${MONO} font-size="10" letter-spacing="1" fill="${C.pink}">NOW</text>
  ${NOW.map((t, i) => `<text x="704" y="${206 + i * 34}" font-size="12.5" fill="${C.text}">${esc(t.split(", ")[0])}</text><text x="704" y="${221 + i * 34}" ${MONO} font-size="10" fill="${C.dim}">${esc(t.split(", ")[1] ?? "")}</text>`).join("")}
  <text x="704" y="290" ${MONO} font-size="9" fill="${C.faint}">updated ${fmtDate(data.fetchedAt)}</text>`;

  const defs = `
    <clipPath id="ph"><circle r="47"/></clipPath>
    <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity="0.35"/><stop offset="0.35" stop-color="#a78bfa" stop-opacity="0.18"/>
      <stop offset="0.7" stop-color="${C.pink}" stop-opacity="0.3"/><stop offset="1" stop-color="${C.yellow}" stop-opacity="0.25"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.4" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.75"/><stop offset="0.55" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;1 0" keyTimes="0;0.5;1" dur="3.5s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="#0e7490"/></linearGradient>`;

  const alt = `Developer ID badge for ${NAME}, full-stack engineer in Nairobi. ${s.total} contributions in the last 12 months over ${s.active} active days, best day ${s.best.count} on ${fmtDate(s.best.date)}. Monthly: ${s.months.map(([k, v]) => `${MONTH[Number(k.slice(5)) - 1]} ${v}`).join(", ")}.`;
  return { svg: frame(W, H, alt, body, defs), alt, stats: s };
}

// ---------------------------------------------------------------- 6. 3D contribution city

function city(data) {
  const W = 860;
  const H = 380;
  const weeks = data.weeks;
  const c = 13; // cell pitch along x
  const s = 10; // building width
  const B = [5, -4]; // one step back
  const ground = 336;
  const width = weeks.length * c + 7 * B[0];
  const ox = Math.round((W - width) / 2);
  const max = Math.max(1, ...data.days.map((d) => d.count));
  const levels = ["#155e75", "#0891b2", "#22d3ee", "#a5f3fc"];
  const level = (n) => (n <= 0 ? -1 : Math.min(3, Math.floor((n / max) * 4)));
  const r = rng(data.days.length * 7919 + data.days.reduce((a, d) => a + d.count, 0));

  const buildings = [];
  for (let j = 0; j < 7; j++) {
    const back = 6 - j; // Sunday at the back, Saturday in front
    for (let i = 0; i < weeks.length; i++) {
      const day = weeks[i].find((d) => d.weekday === j);
      if (!day) continue;
      const x0 = ox + i * c + back * B[0];
      const y0 = ground + back * B[1];
      const lv = level(day.count);
      if (lv < 0) {
        buildings.push(`<path d="M${x0} ${y0} h${s} l${B[0]} ${B[1]} h${-s} Z" fill="#141c30"/>`);
        continue;
      }
      const h = f(6 + Math.sqrt(day.count / max) * 104);
      const top = y0 - h;
      const parts = [
        `<rect x="${x0}" y="${f(top)}" width="${s}" height="${h}" fill="#101a30"/>`,
        `<path d="M${x0 + s} ${y0} l${B[0]} ${B[1]} v${-h} l${-B[0]} ${-B[1]} Z" fill="#0a1222"/>`,
        `<path d="M${x0} ${f(top)} h${s} l${B[0]} ${B[1]} h${-s} Z" fill="${levels[lv]}"/>`,
      ];
      for (let wy = top + 5; wy < y0 - 4; wy += 6) {
        for (const wx of [x0 + 2, x0 + 6]) {
          const p = r();
          if (p < 0.45) continue;
          const flick = p > 0.97 ? `<animate attributeName="opacity" values="1;0.1;1;1" keyTimes="0;0.1;0.2;1" dur="${f(2 + r() * 5)}s" repeatCount="indefinite"/>` : "";
          parts.push(`<rect x="${wx}" y="${f(wy)}" width="2" height="2.5" fill="#fde68a" opacity="${p > 0.8 ? 0.95 : 0.55}">${flick}</rect>`);
        }
      }
      buildings.push(`<g><title>${day.date}: ${day.count} contribution${day.count === 1 ? "" : "s"}</title>${parts.join("")}</g>`);
    }
  }

  const stars = Array.from({ length: 70 }, () => {
    const x = f(20 + r() * (W - 40));
    const y = f(20 + r() * 150);
    const rad = f(0.5 + r() * 1.1);
    const tw = r() > 0.6 ? `<animate attributeName="opacity" values="0.2;1;0.2" dur="${f(2 + r() * 4)}s" begin="${f(-r() * 4)}s" repeatCount="indefinite"/>` : "";
    return `<circle cx="${x}" cy="${y}" r="${rad}" fill="#fff" opacity="0.6">${tw}</circle>`;
  }).join("");

  // Month labels under the front row, at the first week that starts a month.
  let lastMonth = "";
  const labels = weeks.map((w, i) => {
    const m = w[0].date.slice(5, 7);
    if (m === lastMonth) return "";
    lastMonth = m;
    if (i > weeks.length - 3) return "";
    return `<text x="${ox + i * c}" y="${ground + 22}" ${MONO} font-size="9.5" fill="${C.dim}">${MONTH[Number(m) - 1]}</text>`;
  }).join("");

  const s2 = stats(data);
  const body = `
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="url(#sky)"/>
  ${stars}
  <g transform="translate(770 72)"><circle r="22" fill="#fef3c7" filter="url(#glow)"/><circle cx="9" cy="-7" r="19" fill="#111a33"/></g>
  <g>
    <animateTransform attributeName="transform" type="translate" values="-60 0;${W + 60} -30" dur="22s" repeatCount="indefinite"/>
    <circle cx="0" cy="110" r="1.6" fill="${C.red}"><animate attributeName="opacity" values="1;0;1" dur="0.9s" repeatCount="indefinite"/></circle>
    <circle cx="-8" cy="111" r="1.2" fill="#fff"/>
  </g>
  ${kicker(28, 38, "3D CONTRIBUTION CITY · REBUILT DAILY")}
  <text x="28" y="66" ${SERIF} font-size="30" fill="${C.text}">${s2.total} contributions</text>
  <text x="28" y="86" ${MONO} font-size="11" fill="${C.dim}">one building per day · taller means more commits</text>
  <path d="M${ox - 6} ${ground + 4} L${ox + width + 6} ${ground + 4} L${ox + width + 6 - 7 * B[0] + B[0] * 7} ${ground + 4}" stroke="${C.line}"/>
  ${buildings.join("\n")}
  ${labels}
  <text x="${W - 28}" y="${H - 14}" text-anchor="end" ${MONO} font-size="9" fill="${C.faint}">updated ${fmtDate(data.fetchedAt)}</text>`;

  const defs = `${GLOW("glow", 6)}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070a14"/><stop offset="0.7" stop-color="#111a33"/><stop offset="1" stop-color="#1d1438"/></linearGradient>`;
  return frame(W, H, `A night skyline built from ${s2.total} GitHub contributions in the last 12 months, one building per day.`, body, defs);
}

// ---------------------------------------------------------------- 7. connect footer

function footer(pointing) {
  const W = 860;
  const H = 320;
  const who = pointing
    ? `<image href="${pointing}" x="40" y="20" width="260" height="290" preserveAspectRatio="xMidYMax meet"/>`
    : `<g transform="translate(150 66) scale(0.88)">${characterPoint()}</g>`;
  const sparkle = (x, y, sc, d, color) => `<path transform="translate(${x} ${y}) scale(${sc})" d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z" fill="${color}">
      <animate attributeName="opacity" values="0;1;0" dur="${d}s" repeatCount="indefinite"/></path>`;
  const heart = (x, y, d, begin) => `<path d="M0 3 C-6 -4 -12 2 0 10 C12 2 6 -4 0 3 Z" fill="${C.pink}" opacity="0">
      <animateTransform attributeName="transform" type="translate" values="${x} ${y};${x + 6} ${y - 50}" dur="${d}s" begin="${begin}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.9;0" dur="${d}s" begin="${begin}s" repeatCount="indefinite"/></path>`;
  const body = `
  ${who}
  <g filter="url(#neon)">
    <animate attributeName="opacity" values="1;1;0.35;1;1;0.55;1;1" keyTimes="0;0.6;0.62;0.64;0.8;0.81;0.83;1" dur="5s" repeatCount="indefinite"/>
    <rect x="352" y="70" width="460" height="128" rx="22" fill="none" stroke="${C.pink}" stroke-width="3"/>
    <text x="582" y="132" text-anchor="middle" ${SERIF} font-size="44" fill="#fdf2f8" stroke="${C.pink}" stroke-width="0.6">@${LOGIN}</text>
    <text x="582" y="170" text-anchor="middle" ${MONO} font-size="13" fill="${C.cyan}">let's build something that works</text>
  </g>
  ${sparkle(360, 60, 1, 1.8, C.yellow)}${sparkle(806, 212, 0.8, 2.3, C.cyan)}${sparkle(800, 58, 0.6, 1.4, C.pink)}${sparkle(344, 214, 0.7, 2.7, C.cyan)}
  ${heart(420, 240, 3, 0)}${heart(640, 236, 3.4, 1.2)}${heart(760, 250, 2.8, 2)}
  ${kicker(352, 262, "CONNECT")}
  <text x="352" y="284" ${MONO} font-size="12" fill="${C.dim}">open to full-stack, fintech, payments and applied AI work</text>`;
  return frame(W, H, `@${LOGIN}: open to full-stack, fintech, payments and applied AI work.`, body, GLOW("neon", 5));
}

function linkCard(l, data) {
  const W = 280;
  const H = 84;
  const sub = l.sub.replace("{repos}", data.publicRepos ?? "");
  const body = `
  <circle cx="40" cy="42" r="20" fill="none" stroke="${l.color}" stroke-width="2"/>
  <text x="40" y="47" text-anchor="middle" ${MONO} font-size="13" fill="${l.color}">${esc(l.glyph)}</text>
  <text x="72" y="38" font-size="16" fill="${C.text}">${esc(l.title)}</text>
  <text x="72" y="57" ${MONO} font-size="10" fill="${C.dim}">${esc(sub)}</text>
  <text x="${W - 22}" y="47" text-anchor="end" ${MONO} font-size="16" fill="${l.color}">→<animate attributeName="x" values="${W - 22};${W - 16};${W - 22}" dur="1.4s" repeatCount="indefinite"/></text>`;
  return frame(W, H, `${l.title}: ${sub}`, body);
}

// ---------------------------------------------------------------- data

async function loadData() {
  const token = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    console.log(`No token, using ${CACHE}`);
    return JSON.parse(readFileSync(CACHE, "utf8"));
  }
  const query = `query($login: String!) { user(login: $login) {
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
    contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount weekday } } } } } }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-readme-build" },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors || !json.data?.user) throw new Error(`GitHub API: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  const u = json.data.user;
  const weeks = u.contributionsCollection.contributionCalendar.weeks.map((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, weekday: d.weekday })),
  );
  const data = { fetchedAt: new Date().toISOString(), publicRepos: u.repositories.totalCount, weeks, days: weeks.flat() };
  mkdirSync("data", { recursive: true });
  writeFileSync(CACHE, JSON.stringify(data) + "\n");
  return data;
}

// ---------------------------------------------------------------- fonts

const fontCache = {};
async function withFonts(svg) {
  const chars = new Set();
  for (const m of svg.matchAll(/>([^<]+)</g)) for (const ch of m[1]) chars.add(ch);
  for (const ch of "0123456789&;ltg") chars.add(ch);
  const text = [...chars].join("") + "→·<>&";
  const faces = [];
  for (const font of Object.values(FONTS)) {
    if (!svg.includes(font.family)) continue;
    const key = font.family + text;
    fontCache[key] ??= (await subsetFont(readFileSync(font.file), text, { targetFormat: "woff2" })).toString("base64");
    faces.push(`@font-face{font-family:${font.family};font-weight:400;src:url(data:font/woff2;base64,${fontCache[key]}) format('woff2')}`);
  }
  return svg.replace("/*FONTS*/", `<style>${faces.join("")}</style>`);
}

// ---------------------------------------------------------------- build

const data = await loadData();
mkdirSync(OUT, { recursive: true });
const b = badge(data, art("portrait"));
const files = {
  "1-hero.svg": hero(clipFrames(), art("still")),
  "2-building.svg": building(),
  "3-hobbies.svg": hobbies(),
  "4-tech-orbit.svg": techOrbit(),
  "5-badge.svg": b.svg,
  "6-city.svg": city(data),
  "7-footer.svg": footer(art("pointing")),
};
for (const l of LINKS) files[`${l.file}.svg`] = linkCard(l, data);

for (const [name, svg] of Object.entries(files)) {
  const out = await withFonts(svg);
  writeFileSync(join(OUT, name), out);
  console.log(`${name.padEnd(18)} ${(out.length / 1024).toFixed(0)} KB`);
}
console.log(`${b.stats.total} contributions, ${b.stats.active} active days, data from ${data.fetchedAt}`);
