// Builds the README's cards, once for GitHub's light theme and once for its
// dark theme, from the data below. Run: node scripts/build-cards.mjs
//
// The look: a quiet frame with a hairline border, sentence-case meta text,
// one green accent (money, M-Pesa), and a receipt-style status line with a
// dotted leader, like the M-Pesa receipts this work produces.
//
// Made with unslop by Damir Sokolovsky (@heydamir), CC BY 4.0.

import { mkdirSync, writeFileSync } from "node:fs";

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

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

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

function frame(t, w, h, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONT}">
  <title>${esc(title)}</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${t.surface}" stroke="${t.border}"/>
${body}
</svg>
`;
}

/** "Status ········ Live": the label, a dotted leader, the value in green. */
function statusLine(t, x, y, right, value) {
  const valueWidth = value.length * 6.9;
  const leaderStart = x + 52;
  const leaderEnd = right - valueWidth - 8;
  return `  <text x="${x}" y="${y}" font-size="12" fill="${t.muted}">Status</text>
  <line x1="${leaderStart}" y1="${y - 3.5}" x2="${leaderEnd}" y2="${y - 3.5}" stroke="${t.leader}" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="0.01 4"/>
  <text x="${right}" y="${y}" text-anchor="end" font-size="12" font-family="${MONO}" fill="${t.accent}">${esc(value)}</text>`;
}

function projectCard(t, p) {
  const w = p.wide ? 860 : 420;
  const h = p.wide ? 210 : 230;
  const x = 24;
  const right = w - 24;
  const body = [
    `  <text x="${x}" y="36" font-size="12" fill="${t.muted}">${esc(p.meta)}</text>`,
    `  <text x="${x}" y="62" font-size="18" font-weight="600" fill="${t.text}">${esc(p.title)}</text>`,
    ...p.lines.map(
      (line, i) =>
        `  <text x="${x}" y="${92 + i * 20}" font-size="13.5" fill="${t.secondary}">${esc(line)}</text>`,
    ),
    `  <line x1="${x}" y1="${h - 62}" x2="${right}" y2="${h - 62}" stroke="${t.border}"/>`,
    `  <text x="${x}" y="${h - 40}" font-size="12" font-family="${MONO}" fill="${t.secondary}">${esc(p.stack)}</text>`,
    statusLine(t, x, h - 18, right, p.status),
  ].join("\n");
  return frame(t, w, h, p.title, body);
}

// Numbers only: a label, the figure, what it compares to. One figure, the
// year's contributions, carries the accent.
const STATS = [
  { value: "557", label: "Contributions", note: "last 12 months", lead: true },
  { value: "48", label: "Pull requests", note: "46 merged" },
  { value: "21", label: "Repositories", note: "7 private" },
  { value: "62", label: "Active days", note: "since March 2026" },
  { value: "43", label: "Best day", note: "9 Oct 2026" },
];

function statsCard(t) {
  const w = 860;
  const h = 150;
  const col = (w - 48) / STATS.length;
  const cells = STATS.map((s, i) => {
    const x = 24 + i * col;
    const divider =
      i > 0
        ? `  <line x1="${x}" y1="64" x2="${x}" y2="124" stroke="${t.border}"/>\n`
        : "";
    const pad = i > 0 ? 18 : 0;
    return `${divider}  <text x="${x + pad}" y="78" font-size="12" fill="${t.muted}">${s.label}</text>
  <text x="${x + pad}" y="108" font-size="28" font-weight="600" fill="${s.lead ? t.accent : t.text}" style="font-variant-numeric:tabular-nums">${s.value}</text>
  <text x="${x + pad}" y="124" font-size="11.5" fill="${t.muted}">${s.note}</text>`;
  }).join("\n");
  const body = `  <text x="24" y="36" font-size="15" font-weight="600" fill="${t.text}">GitHub at a glance</text>
  <text x="${w - 24}" y="36" text-anchor="end" font-size="11.5" fill="${t.muted}">Including private repos · 28 Oct 2026</text>
${cells}`;
  return frame(t, w, h, "GitHub at a glance", body);
}

// A ranked list with thin bars: the top language leads in green, the rest
// are neutral.
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

function languagesCard(t) {
  const w = 425;
  const h = 250;
  const max = LANGUAGES[0][1];
  const rows = LANGUAGES.map(([name, pct], i) => {
    const y = 66 + i * 22;
    const barX = 190;
    const barW = 160;
    return `  <text x="24" y="${y}" font-size="12.5" fill="${t.secondary}">${esc(name)}</text>
  <rect x="${barX}" y="${y - 8}" width="${barW}" height="6" rx="3" fill="${t.track}"/>
  <rect x="${barX}" y="${y - 8}" width="${((pct / max) * barW).toFixed(1)}" height="6" rx="3" fill="${i === 0 ? t.accent : t.muted}"/>
  <text x="${w - 24}" y="${y}" text-anchor="end" font-size="12" font-family="${MONO}" fill="${t.text}">${pct.toFixed(1)}%</text>`;
  }).join("\n");
  const body = `  <text x="24" y="36" font-size="15" font-weight="600" fill="${t.text}">Languages I write</text>
  <text x="${w - 24}" y="36" text-anchor="end" font-size="11.5" fill="${t.muted}">Including private repos</text>
${rows}`;
  return frame(t, w, h, "Languages I write", body);
}

// Contributions by weekday: Tuesday, the busiest, leads in green.
const WEEKDAYS = [
  ["Mon", 118],
  ["Tue", 152],
  ["Wed", 93],
  ["Thu", 59],
  ["Fri", 121],
  ["Sat", 7],
  ["Sun", 7],
];

function weekdaysCard(t) {
  const w = 425;
  const h = 250;
  const max = Math.max(...WEEKDAYS.map(([, n]) => n));
  const base = 206;
  const chartH = 130;
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
  <text x="${(x + bw / 2).toFixed(1)}" y="${(base - bh - 6).toFixed(1)}" text-anchor="middle" font-size="11" font-family="${MONO}" fill="${lead ? t.accent : t.secondary}">${n}</text>
  <text x="${(x + bw / 2).toFixed(1)}" y="${base + 18}" text-anchor="middle" font-size="11.5" fill="${t.muted}">${day}</text>`;
  }).join("\n");
  const body = `  <text x="24" y="36" font-size="15" font-weight="600" fill="${t.text}">When I ship</text>
  <text x="${w - 24}" y="36" text-anchor="end" font-size="11.5" fill="${t.muted}">Contributions by weekday</text>
${grid}
  <line x1="24" y1="${base}" x2="${w - 24}" y2="${base}" stroke="${t.border}"/>
${bars}`;
  return frame(t, w, h, "When I ship", body);
}

mkdirSync("assets/cards", { recursive: true });
for (const [theme, t] of Object.entries(THEMES)) {
  const out = (name, svg) =>
    writeFileSync(`assets/cards/${name}-${theme}.svg`, svg);
  for (const p of PROJECTS) out(p.file, projectCard(t, p));
  out("stats", statsCard(t));
  out("languages", languagesCard(t));
  out("weekdays", weekdaysCard(t));
}
console.log(`Built ${(PROJECTS.length + 3) * 2} cards in assets/cards/`);
