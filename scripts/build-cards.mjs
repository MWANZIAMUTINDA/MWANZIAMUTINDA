// Builds the README's header and cards, once for GitHub's light theme and
// once for its dark theme, from the data below.
//
//   npm install            (once: installs subset-font)
//   node scripts/build-cards.mjs
//
// The look: a quiet frame with a hairline border, one green accent (money,
// M-Pesa), and a receipt-style status line with a dotted leader, like the
// M-Pesa receipts this work produces. Type: Instrument Serif for titles and
// big figures, Geist for text, Geist Mono for stacks and figures.
//
// GitHub shows README images without loading web fonts, so each card embeds
// the fonts it uses, cut down to the characters the cards actually contain.
// The fonts are under the SIL Open Font License (fonts/OFL-*.txt).
//
// Made with unslop by Damir Sokolovsky (@heydamir), CC BY 4.0.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import subsetFont from "subset-font";

const THEMES = {
  light: {
    surface: "#ffffff",
    border: "#d0d7de",
    text: "#1f2328",
    secondary: "#59636e",
    muted: "#6e7781",
    accent: "#1a7f37",
    track: "#eaeef2",
    leader: "#8c959f",
  },
  dark: {
    surface: "#0d1117",
    border: "#30363d",
    text: "#e6edf3",
    secondary: "#9198a1",
    muted: "#7d8590",
    accent: "#3fb950",
    track: "#21262d",
    leader: "#484f58",
  },
};

// Each family falls back to a system face if the embedded font fails.
const FONTS = {
  serif: {
    file: "fonts/instrument-serif-latin-400-normal.woff2",
    family: "CardSerif",
    weight: 400,
    stack: "CardSerif, Georgia, 'Times New Roman', serif",
  },
  sans: {
    file: "fonts/geist-latin-400-normal.woff2",
    family: "CardSans",
    weight: 400,
    stack: "CardSans, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  mono: {
    file: "fonts/geist-mono-latin-400-normal.woff2",
    family: "CardMono",
    weight: 400,
    stack: "CardMono, ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  },
};

const SERIF = `font-family="${FONTS.serif.stack}"`;
const MONO = `font-family="${FONTS.mono.stack}"`;

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const HEADER = {
  name: "Sylvester Mutinda",
  line: "Full-stack engineer at Wakandi Kenya, in Nairobi",
  place: "Nairobi, Kenya",
  focus: "Software for SACCOs, chamas, M-Pesa and credit",
};

const PROJECTS = [
  {
    file: "wakandi-crb",
    wide: true,
    meta: "Wakandi Kenya · Jamii platform",
    title: "CRB Lookup: check before you lend",
    status: "Shipped Oct 2026",
    lines: [
      "Credit-bureau checks for SACCOs, MFIs and chamas. Credit officers run a check inside a loan",
      "application, results expire on a set retention period, every access is audited, and loan",
      "products call it as a system through API keys.",
    ],
    stack: "Next.js 16 · TypeScript · Supabase · PostgreSQL RLS · REST API · Audit log",
  },
  {
    file: "wakandi-payments",
    meta: "Wakandi · Jamii Connect",
    title: "M-Pesa SMS top-ups",
    status: "Live",
    lines: [
      "STK Push checkout per bundle, the number confirmed",
      "before the prompt, unconfirmed payments recovered",
      "by status query, masked references and history.",
    ],
    stack: "M-Pesa Daraja · STK Push · Next.js · Supabase",
  },
  {
    file: "wakandi-chatbot",
    meta: "Wakandi · Jamii Connect",
    title: "Chatbot and knowledge base",
    status: "Live",
    lines: [
      "Brevo chat onboarding with scroll-triggered",
      "prompts and visitor identity, backed by a knowledge",
      "base rewritten against the live app.",
    ],
    stack: "Brevo · TypeScript",
  },
  {
    file: "soka",
    meta: "Personal · mobile app",
    title: "SOKA",
    status: "Sprint 1 · Nov 2026",
    lines: [
      "Run your EA SPORTS FC friends' league: fair",
      "fixtures, results both players confirm, live",
      "tables, rivalry head-to-heads, XP and badges.",
    ],
    stack: "TypeScript · Mobile · Realtime",
  },
  {
    file: "mandai",
    meta: "Personal · web platform",
    title: "Mandai",
    status: "In progress",
    lines: [
      "Car imports for Kenya made transparent: listings,",
      "international sourcing, landed-cost estimates,",
      "quotations, import tracking and payments.",
    ],
    stack: "TypeScript · Next.js · Payments",
  },
  {
    file: "beijing-fc",
    meta: "Personal · Android and Laravel",
    title: "Beijing FC",
    status: "Active",
    lines: [
      "Football club operations: M-Pesa contributions",
      "and fines, match days and availability, team",
      "generation, league standings and expenses.",
    ],
    stack: "Kotlin · Android · Laravel · M-Pesa",
  },
  {
    file: "fundi",
    meta: "Personal · marketplace",
    title: "Kenyan Fundi Marketplace",
    status: "In progress",
    lines: [
      "Connects customers with verified plumbers,",
      "electricians and builders: location search,",
      "bookings, M-Pesa, messaging and ratings.",
    ],
    stack: "Marketplace · Geo search · M-Pesa",
  },
  {
    file: "kyeteni",
    meta: "Client · payments",
    title: "Kyeteni Pay",
    status: "Live",
    lines: [
      "QR-code M-Pesa payments with digital receipts",
      "that anyone can verify, built for a local",
      "business.",
    ],
    stack: "Laravel · MySQL · Daraja API · Tailwind",
  },
  {
    file: "sacco-health",
    meta: "Fintech · analytics",
    title: "SACCO Health Check",
    status: "Demo",
    lines: [
      "A 46-point automated diagnostic of a SACCO's",
      "liquidity and operations, with a plain-language",
      "summary for the board.",
    ],
    stack: "React · TypeScript · Tailwind",
  },
  {
    file: "garbage",
    meta: "Applied AI · computer vision",
    title: "Nairobi Garbage Detection",
    status: "Open source",
    lines: [
      "Report illegal dumping with a photo: a fine-tuned",
      "MobileNetV2 classifies the waste and the site is",
      "pinned on a live map.",
    ],
    stack: "Python · MobileNetV2 · Flask · Leaflet",
  },
  {
    file: "muthurwa",
    meta: "Civic tech · Nairobi County",
    title: "Muthurwa Smart Stalls",
    status: "Open source",
    lines: [
      "Digital revenue collection for Muthurwa Market:",
      "live stall booking, M-Pesa payments recorded",
      "automatically, and dashboards for the county.",
    ],
    stack: "Laravel · MariaDB · M-Pesa · JavaScript",
  },
];

// Numbers only: a label, the figure, what it compares to. One figure, the
// year's contributions, carries the accent.
const STATS = [
  { value: "557", label: "Contributions", note: "last 12 months", lead: true },
  { value: "48", label: "Pull requests", note: "46 merged" },
  { value: "21", label: "Repositories", note: "7 private" },
  { value: "62", label: "Active days", note: "since March 2026" },
  { value: "43", label: "Best day", note: "9 Oct 2026" },
];

// A ranked list with thin bars: the top language leads in green.
const LANGUAGES = [
  ["Blade (Laravel views)", 27.7],
  ["TypeScript", 24.8],
  ["PHP", 19.4],
  ["Kotlin", 14.8],
  ["Python", 5.0],
  ["PL/pgSQL", 4.2],
  ["CSS and JS", 2.1],
  ["HTML", 1.9],
];

// Contributions by weekday: the busiest day leads in green.
const WEEKDAYS = [
  ["Mon", 118],
  ["Tue", 152],
  ["Wed", 93],
  ["Thu", 59],
  ["Fri", 121],
  ["Sat", 7],
  ["Sun", 7],
];

function frame(t, w, h, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONTS.sans.stack}">
  <title>${esc(title)}</title>
  <style>/*FONTS*/</style>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${t.surface}" stroke="${t.border}"/>
${body}
</svg>
`;
}

/** A dotted leader between two x positions, as on a receipt. */
function leader(t, x1, x2, y) {
  return `  <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${t.leader}" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="0.01 4"/>`;
}

/** "Status ········ Live": the label, a dotted leader, the value in green. */
function statusLine(t, x, y, right, value) {
  const valueWidth = value.length * 7.2;
  return `  <text x="${x}" y="${y}" font-size="12" fill="${t.muted}">Status</text>
${leader(t, x + 52, right - valueWidth - 10, y - 3.5)}
  <text x="${right}" y="${y}" text-anchor="end" font-size="12" ${MONO} fill="${t.accent}">${esc(value)}</text>`;
}

function headerCard(t) {
  const w = 860;
  const h = 196;
  const body = `  <text x="32" y="58" font-size="13" fill="${t.muted}">${esc(HEADER.line)}</text>
  <text x="30" y="122" font-size="64" ${SERIF} fill="${t.text}" letter-spacing="-0.5">${esc(HEADER.name)}</text>
  <line x1="32" y1="146" x2="${w - 32}" y2="146" stroke="${t.border}"/>
  <text x="32" y="172" font-size="12.5" ${MONO} fill="${t.secondary}">${esc(HEADER.place)}</text>
${leader(t, 160, w - 32 - HEADER.focus.length * 6.9 - 12, 168)}
  <text x="${w - 32}" y="172" text-anchor="end" font-size="13" fill="${t.text}">${esc(HEADER.focus)}</text>`;
  return frame(t, w, h, HEADER.name, body);
}

function projectCard(t, p) {
  const w = p.wide ? 860 : 420;
  const h = p.wide ? 214 : 236;
  const x = 24;
  const right = w - 24;
  const body = [
    `  <text x="${x}" y="36" font-size="12" fill="${t.muted}">${esc(p.meta)}</text>`,
    `  <text x="${x - 1}" y="68" font-size="26" ${SERIF} fill="${t.text}">${esc(p.title)}</text>`,
    ...p.lines.map(
      (line, i) =>
        `  <text x="${x}" y="${98 + i * 20}" font-size="13.5" fill="${t.secondary}">${esc(line)}</text>`,
    ),
    `  <line x1="${x}" y1="${h - 62}" x2="${right}" y2="${h - 62}" stroke="${t.border}"/>`,
    `  <text x="${x}" y="${h - 40}" font-size="11.5" ${MONO} fill="${t.secondary}">${esc(p.stack)}</text>`,
    statusLine(t, x, h - 18, right, p.status),
  ].join("\n");
  return frame(t, w, h, p.title, body);
}

function statsCard(t) {
  const w = 860;
  const h = 158;
  const col = (w - 48) / STATS.length;
  const cells = STATS.map((s, i) => {
    const x = 24 + i * col;
    const divider =
      i > 0
        ? `  <line x1="${x}" y1="64" x2="${x}" y2="132" stroke="${t.border}"/>\n`
        : "";
    const pad = i > 0 ? 18 : 0;
    return `${divider}  <text x="${x + pad}" y="78" font-size="12" fill="${t.muted}">${s.label}</text>
  <text x="${x + pad}" y="114" font-size="38" ${SERIF} fill="${s.lead ? t.accent : t.text}">${s.value}</text>
  <text x="${x + pad}" y="132" font-size="11.5" fill="${t.muted}">${s.note}</text>`;
  }).join("\n");
  const body = `  <text x="23" y="38" font-size="22" ${SERIF} fill="${t.text}">GitHub at a glance</text>
  <text x="${w - 24}" y="36" text-anchor="end" font-size="11.5" fill="${t.muted}">Including private repos · 28 Oct 2026</text>
${cells}`;
  return frame(t, w, h, "GitHub at a glance", body);
}

function languagesCard(t) {
  const w = 425;
  const h = 250;
  const max = LANGUAGES[0][1];
  const rows = LANGUAGES.map(([name, pct], i) => {
    const y = 70 + i * 22;
    const barX = 190;
    const barW = 156;
    return `  <text x="24" y="${y}" font-size="12.5" fill="${t.secondary}">${esc(name)}</text>
  <rect x="${barX}" y="${y - 8}" width="${barW}" height="6" rx="3" fill="${t.track}"/>
  <rect x="${barX}" y="${y - 8}" width="${((pct / max) * barW).toFixed(1)}" height="6" rx="3" fill="${i === 0 ? t.accent : t.muted}"/>
  <text x="${w - 24}" y="${y}" text-anchor="end" font-size="11.5" ${MONO} fill="${t.text}">${pct.toFixed(1)}%</text>`;
  }).join("\n");
  const body = `  <text x="23" y="38" font-size="22" ${SERIF} fill="${t.text}">Languages I write</text>
  <text x="${w - 24}" y="36" text-anchor="end" font-size="11.5" fill="${t.muted}">Including private repos</text>
${rows}`;
  return frame(t, w, h, "Languages I write", body);
}

function weekdaysCard(t) {
  const w = 425;
  const h = 250;
  const max = Math.max(...WEEKDAYS.map(([, n]) => n));
  const base = 206;
  const chartH = 126;
  const step = (w - 48) / WEEKDAYS.length;
  const grid = [0.5, 1]
    .map(
      (f) =>
        `  <line x1="24" y1="${base - f * chartH}" x2="${w - 24}" y2="${base - f * chartH}" stroke="${t.track}"/>`,
    )
    .join("\n");
  const bars = WEEKDAYS.map(([day, n], i) => {
    const x = 24 + i * step + step * 0.25;
    const bw = step * 0.5;
    const bh = Math.max(2, (n / max) * chartH);
    const lead = n === max;
    return `  <rect x="${x.toFixed(1)}" y="${(base - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${lead ? t.accent : t.muted}" fill-opacity="${lead ? 1 : 0.55}"/>
  <text x="${(x + bw / 2).toFixed(1)}" y="${(base - bh - 6).toFixed(1)}" text-anchor="middle" font-size="11" ${MONO} fill="${lead ? t.accent : t.secondary}">${n}</text>
  <text x="${(x + bw / 2).toFixed(1)}" y="${base + 18}" text-anchor="middle" font-size="11.5" fill="${t.muted}">${day}</text>`;
  }).join("\n");
  const body = `  <text x="23" y="38" font-size="22" ${SERIF} fill="${t.text}">When I ship</text>
  <text x="${w - 24}" y="36" text-anchor="end" font-size="11.5" fill="${t.muted}">Contributions by weekday</text>
${grid}
  <line x1="24" y1="${base}" x2="${w - 24}" y2="${base}" stroke="${t.border}"/>
${bars}`;
  return frame(t, w, h, "When I ship", body);
}

// Draw everything first, then cut each font down to the characters used.
const cards = [];
for (const [theme, t] of Object.entries(THEMES)) {
  const add = (name, svg) => cards.push({ path: `assets/cards/${name}-${theme}.svg`, svg });
  add("header", headerCard(t));
  for (const p of PROJECTS) add(p.file, projectCard(t, p));
  add("stats", statsCard(t));
  add("languages", languagesCard(t));
  add("weekdays", weekdaysCard(t));
}

const decode = (s) =>
  s.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
const used = new Set(
  cards.flatMap(({ svg }) =>
    [...svg.matchAll(/<(?:text|title)[^>]*>([^<]*)<\/(?:text|title)>/g)].flatMap(
      (m) => [...decode(m[1])],
    ),
  ),
);
const chars = [...used].join("") + "0123456789";

const faces = [];
for (const font of Object.values(FONTS)) {
  const subset = await subsetFont(readFileSync(font.file), chars, {
    targetFormat: "woff2",
  });
  faces.push(
    `@font-face{font-family:${font.family};font-weight:${font.weight};src:url(data:font/woff2;base64,${subset.toString("base64")}) format("woff2")}`,
  );
}
const style = faces.join("");

mkdirSync("assets/cards", { recursive: true });
let bytes = 0;
for (const { path, svg } of cards) {
  const out = svg.replace("/*FONTS*/", style);
  bytes += out.length;
  writeFileSync(path, out);
}
console.log(
  `Built ${cards.length} cards in assets/cards/ (${Math.round(bytes / cards.length / 1024)} KB each on average)`,
);
