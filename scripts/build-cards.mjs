// Builds the README's header and cards, once for GitHub's light theme and
// once for its dark theme, then refreshes the live numbers in README.md.
//
//   npm install            (once: installs subset-font)
//   npm run stats          (optional: refresh data/stats.json, needs GH_TOKEN)
//   npm run cards
//
// Projects and the header are written by hand below. Every number comes from
// data/stats.json, which scripts/fetch-stats.mjs writes and the nightly
// workflow (.github/workflows/profile-cards.yml) refreshes.
//
// The look: a quiet frame with a hairline border, one green accent (money,
// M-Pesa), and a receipt-style status line with a dotted leader, like the
// M-Pesa receipts this work produces. Type: Instrument Serif for titles and
// big figures, Geist for text, Geist Mono for stacks and figures.
//
// GitHub shows README images without loading web fonts, so each card embeds
// the fonts it uses, cut down to the characters the cards actually contain.
// Motion is CSS inside the SVG, which GitHub plays in README images; every
// card stops moving for people who ask their system for reduced motion.
// The fonts are under the SIL Open Font License (fonts/OFL-*.txt).
//
// Made with unslop by Damir Sokolovsky (@heydamir), CC BY 4.0.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import subsetFont from "subset-font";

const DATA = JSON.parse(readFileSync("data/stats.json", "utf8"));

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
    onAccent: "#ffffff",
    // Contribution levels, empty to busiest, as on GitHub's own calendar.
    levels: ["#ebeef1", "#aceebb", "#4ac26b", "#2da44e", "#116329"],
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
    onAccent: "#0d1117",
    levels: ["#1c2128", "#0e4429", "#006d32", "#26a641", "#39d353"],
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
// Geist Mono advances 0.6em per character, which the typing ticker relies on.
const MONO_ADVANCE = 0.6;

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const fmt = (n) => n.toLocaleString("en-GB");
const kilo = (n) => (n >= 10000 ? `${Math.round(n / 1000)}k` : fmt(n));
const day = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const monthName = (ym, style = "long") =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: style,
    timeZone: "UTC",
  });

const HEADER = {
  name: "Sylvester Mutinda",
  line: "Full-stack engineer at Wakandi Kenya, in Nairobi",
  focus: "Software for SACCOs, chamas, M-Pesa and credit",
};

// What the header's ticker types out, one after another. Keep each short.
const NOW_SHIPPING = [
  "CRB Lookup at Wakandi",
  "M-Pesa top-ups, Jamii Connect",
  "SOKA, Sprint 1",
];

const CONTACT = {
  title: "Let's build something",
  line: "Open to full-stack, fintech and payments work, and applied AI.",
  button: "Email me",
  email: "smutinda301@gmail.com",
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

// What each GitHub achievement is for, in a few words.
const ACHIEVEMENTS = {
  "Pull Shark": "Merged pull requests",
  Quickdraw: "Closed an issue or PR within 5 minutes",
  YOLO: "Merged a pull request without review",
  "Pair Extraordinaire": "Co-authored merged pull requests",
  Starstruck: "A repository with 16+ stars",
  "Galaxy Brain": "Accepted answers in Discussions",
  "Public Sponsor": "Sponsored open source work",
  "Heart On Your Sleeve": "Reacted with a heart",
  "Open Sourcerer": "Merged PRs in many public repos",
  "Arctic Code Vault Contributor": "Code in the 2020 Arctic Vault",
  "Mars 2020 Contributor": "Code on the Mars 2020 mission",
};

// ---------------------------------------------------------------- shared

function frame(t, w, h, title, body, css = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONTS.sans.stack}">
  <title>${esc(title)}</title>
  <style>/*FONTS*/${css}</style>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${t.surface}" stroke="${t.border}"/>
${body}
</svg>
`;
}

/** The title at the top left of a card, and a note at the top right. */
function heading(t, w, title, note) {
  return `  <text x="23" y="38" font-size="22" ${SERIF} fill="${t.text}">${esc(title)}</text>
  <text x="${w - 24}" y="36" text-anchor="end" font-size="11.5" fill="${t.muted}">${esc(note)}</text>`;
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

const REDUCED = "@media (prefers-reduced-motion:reduce){*{animation:none!important}}";

/** Mix a hex colour towards black (f > 0) to shade the sides of a block. */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - f)));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// ---------------------------------------------------------------- header

/**
 * The name, and below it a line that types out what I'm shipping now, one
 * item after another. Each item is revealed by a surface-coloured cover that
 * shrinks in steps, one character at a time, with a caret riding its edge.
 * Without motion, the first item simply shows.
 */
function headerCard(t) {
  const w = 860;
  const h = 196;
  const x = 142;
  const size = 13;
  const advance = size * MONO_ADVANCE;
  const n = NOW_SHIPPING.length;
  const slot = 100 / n;
  const p = (v) => `${+v.toFixed(2)}%`;

  let css = `.cur{animation:blink 1s steps(1,end) infinite}@keyframes blink{50%{opacity:0}}`;
  const items = NOW_SHIPPING.map((item, i) => {
    const width = item.length * advance;
    const s = i * slot;
    const typed = s + slot * 0.3;
    const hold = s + slot * 0.82;
    const gone = s + slot * 0.96;
    const typing = `animation-timing-function:steps(${item.length},end)`;
    css += `@keyframes show${i}{0%{opacity:${i === 0 ? 1 : 0}}${i === 0 ? "" : `${p(s)}{opacity:1}`}${p(s + slot)}{opacity:0}100%{opacity:0}}`;
    css += `@keyframes type${i}{0%,${p(s)}{transform:scaleX(1);${typing}}${p(typed)}{transform:scaleX(0);animation-timing-function:linear}${p(hold)}{transform:scaleX(0);${typing}}${p(gone)},100%{transform:scaleX(1)}}`;
    css += `@keyframes caret${i}{0%,${p(s)}{transform:translateX(0);${typing}}${p(typed)}{transform:translateX(${width}px);animation-timing-function:linear}${p(hold)}{transform:translateX(${width}px);${typing}}${p(gone)},100%{transform:translateX(0)}}`;
    css += `.i${i}{animation:show${i} ${n * 4}s steps(1,end) infinite}`;
    css += `.c${i}{transform-box:fill-box;transform-origin:100% 50%;animation:type${i} ${n * 4}s infinite}`;
    css += `.k${i}{animation:caret${i} ${n * 4}s infinite}`;
    // Static state, for no motion: the first item, fully typed.
    const still = i === 0 ? "" : ` opacity="0"`;
    const cover = i === 0 ? ` transform="scale(0 1)"` : "";
    return `  <g class="i${i}"${still}>
    <text x="${x}" y="172" font-size="${size}" ${MONO} fill="${t.text}">${esc(item)}</text>
    <rect class="c${i}" x="${x - 1}" y="158" width="${(width + 2).toFixed(1)}" height="20" fill="${t.surface}"${cover}/>
    <g class="k${i}"${i === 0 ? ` transform="translate(${width.toFixed(1)} 0)"` : ""}><rect class="cur" x="${x + 1}" y="160" width="7" height="15" rx="1" fill="${t.accent}"/></g>
  </g>`;
  }).join("\n");

  const body = `  <text x="32" y="58" font-size="13" fill="${t.muted}">${esc(HEADER.line)}</text>
  <text x="30" y="122" font-size="64" ${SERIF} fill="${t.text}" letter-spacing="-0.5">${esc(HEADER.name)}</text>
  <line x1="32" y1="146" x2="${w - 32}" y2="146" stroke="${t.border}"/>
  <circle cx="37" cy="168" r="4" fill="${t.accent}"/>
  <text x="48" y="172" font-size="12.5" fill="${t.muted}">Now shipping</text>
${items}
  <text x="${w - 32}" y="172" text-anchor="end" font-size="13" fill="${t.secondary}">${esc(HEADER.focus)}</text>`;
  return frame(t, w, h, HEADER.name, body, css + REDUCED);
}

// ---------------------------------------------------------------- projects

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

// ---------------------------------------------------------------- numbers

const STATS = [
  {
    value: fmt(DATA.contributions),
    label: "Contributions",
    note: "last 12 months",
    lead: true,
  },
  {
    value: fmt(DATA.pullRequestsMerged),
    label: "PRs merged",
    note: `of ${fmt(DATA.pullRequests)} opened`,
  },
  {
    value: `${DATA.streak.current}`,
    unit: DATA.streak.current === 1 ? "day" : "days",
    label: "Current streak",
    note: `longest ${DATA.streak.longest} days`,
  },
  {
    value: `+${kilo(DATA.lines.added)}`,
    label: "Lines added",
    note: `${kilo(DATA.lines.removed)} removed`,
  },
  {
    value: fmt(DATA.activeDays),
    label: "Active days",
    note: DATA.firstActive ? `since ${monthName(DATA.firstActive.slice(0, 7))} ${DATA.firstActive.slice(0, 4)}` : "",
  },
];

/** The five numbers under the header. They count up when the card loads. */
function statsCard(t) {
  const w = 860;
  const h = 158;
  const col = (w - 48) / STATS.length;
  const css = `.n{animation:up .9s cubic-bezier(.2,.7,.2,1) both}@keyframes up{from{opacity:0;transform:translateY(10px)}}`;
  const cells = STATS.map((s, i) => {
    const x = 24 + i * col;
    const divider =
      i > 0 ? `  <line x1="${x}" y1="64" x2="${x}" y2="132" stroke="${t.border}"/>\n` : "";
    const pad = i > 0 ? 18 : 0;
    const unitX = x + pad + s.value.length * 17 + 6;
    const unit = s.unit
      ? `\n  <text class="n" style="animation-delay:${i * 90}ms" x="${unitX}" y="114" font-size="16" ${SERIF} fill="${t.secondary}">${s.unit}</text>`
      : "";
    return `${divider}  <text x="${x + pad}" y="78" font-size="12" fill="${t.muted}">${esc(s.label)}</text>
  <text class="n" style="animation-delay:${i * 90}ms" x="${x + pad}" y="114" font-size="38" ${SERIF} fill="${s.lead ? t.accent : t.text}">${esc(s.value)}</text>${unit}
  <text x="${x + pad}" y="132" font-size="11.5" fill="${t.muted}">${esc(s.note)}</text>`;
  }).join("\n");
  const body = `${heading(t, w, "GitHub at a glance", `Including private repos · updated ${day(DATA.updated)}`)}
${cells}`;
  return frame(t, w, h, "GitHub at a glance", body, css + REDUCED);
}

// ---------------------------------------------------------------- skyline

/**
 * The last twelve months of contributions as an isometric city: one block
 * per day, height by contributions, rising week by week when the card loads.
 */
function skylineCard(t) {
  const w = 860;
  const h = 420;
  const days = DATA.days;
  const max = Math.max(1, ...days.map((d) => d.count));
  const startDow = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cw = 10;
  const ch = 5;
  const tall = 104;

  const blocks = days.map((d, i) => {
    const week = Math.floor((i + startDow) / 7);
    const dow = (i + startDow) % 7;
    const r = d.count / max;
    const level = d.count === 0 ? 0 : Math.min(4, 1 + Math.floor(Math.sqrt(r) * 4));
    const height = d.count === 0 ? 1.5 : 3 + Math.sqrt(r) * tall;
    return { ...d, week, dow, level, height, cx: (week - dow) * cw, cy: (week + dow) * ch };
  });

  // Fit the city into the right-hand area.
  const minX = Math.min(...blocks.map((b) => b.cx)) - cw;
  const maxX = Math.max(...blocks.map((b) => b.cx)) + cw;
  const minY = Math.min(...blocks.map((b) => b.cy - ch - b.height)) - 26;
  const maxY = Math.max(...blocks.map((b) => b.cy)) + ch + 22;
  const area = { x: 268, y: 58, w: w - 268 - 20, h: h - 58 - 16 };
  const scale = Math.min(area.w / (maxX - minX), area.h / (maxY - minY), 1.25);
  const ox = area.x + (area.w - (maxX - minX) * scale) / 2 - minX * scale;
  const oy = area.y + (area.h - (maxY - minY) * scale) / 2 - minY * scale;

  const g = 0.86; // gap between blocks
  const pt = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const css = `.b{transform-box:fill-box;transform-origin:50% 100%;animation:rise 1s cubic-bezier(.2,.7,.2,1) both}@keyframes rise{from{transform:scaleY(.04)}}`;

  const city = [...blocks]
    .sort((a, b) => a.week + a.dow - (b.week + b.dow) || a.week - b.week)
    .map((b) => {
      const top = t.levels[b.level];
      const x = b.cx;
      const y = b.cy;
      const H = b.height;
      const a = cw * g;
      const c = ch * g;
      const faces = `<polygon points="${pt(x - a, y - H)} ${pt(x, y + c - H)} ${pt(x, y + c)} ${pt(x - a, y)}" fill="${shade(top, 0.14)}"/><polygon points="${pt(x, y + c - H)} ${pt(x + a, y - H)} ${pt(x + a, y)} ${pt(x, y + c)}" fill="${shade(top, 0.3)}"/><polygon points="${pt(x, y - c - H)} ${pt(x + a, y - H)} ${pt(x, y + c - H)} ${pt(x - a, y - H)}" fill="${top}"/>`;
      return b.count
        ? `<g class="b" style="animation-delay:${b.week * 22}ms">${faces}</g>`
        : faces;
    })
    .join("\n    ");

  // Month initials along the front-left edge, and the best day called out.
  const months = [];
  let lastMonth = "";
  for (const b of blocks) {
    const m = b.date.slice(0, 7);
    if (m !== lastMonth && b.dow === 0) {
      lastMonth = m;
      const x = (b.week - 6) * cw - cw - 4;
      const y = (b.week + 6) * ch + ch + 14;
      months.push(
        `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="end" font-size="${(10 / scale).toFixed(1)}" fill="${t.muted}">${monthName(m, "short").slice(0, 3)}</text>`,
      );
    }
  }
  const best = blocks.find((b) => b.date === DATA.bestDay.date);
  const callout = best
    ? `<line x1="${best.cx}" y1="${(best.cy - ch - best.height - 3).toFixed(1)}" x2="${best.cx}" y2="${(best.cy - ch - best.height - 15).toFixed(1)}" stroke="${t.accent}"/>
    <text x="${best.cx}" y="${(best.cy - ch - best.height - 19).toFixed(1)}" text-anchor="middle" font-size="${(11 / scale).toFixed(1)}" ${MONO} fill="${t.accent}">${best.count} on ${esc(day(best.date).replace(/ \d{4}$/, ""))}</text>`
    : "";

  // The facts on the left, receipt style.
  const busiest = DATA.months.reduce((a, b) => (b.count > a.count ? b : a));
  const facts = [
    ["Longest streak", `${DATA.streak.longest} days`],
    ["Best day", `${DATA.bestDay.count} · ${day(DATA.bestDay.date).replace(/ \d{4}$/, "")}`],
    ["Busiest month", `${monthName(busiest.month, "short")} · ${busiest.count}`],
    ["Active days", `${DATA.activeDays}`],
  ];
  const left = 24;
  const right = 236;
  const factRows = facts
    .map(([label, value], i) => {
      const y = 214 + i * 30;
      return `  <text x="${left}" y="${y}" font-size="12.5" fill="${t.secondary}">${esc(label)}</text>
${leader(t, left + label.length * 6.6 + 8, right - value.length * 7.2 - 8, y - 4)}
  <text x="${right}" y="${y}" text-anchor="end" font-size="12" ${MONO} fill="${t.text}">${esc(value)}</text>`;
    })
    .join("\n");
  const legend = t.levels
    .map((c, i) => `<rect x="${left + 34 + i * 16}" y="${h - 42}" width="11" height="11" rx="2" fill="${c}"/>`)
    .join("");

  const body = `  <text x="23" y="38" font-size="22" ${SERIF} fill="${t.text}">A year of shipping</text>
  <text x="${w - 24}" y="36" text-anchor="end" font-size="11.5" fill="${t.muted}">Contributions per day · last 12 months · including private repos</text>
  <text x="${left}" y="94" font-size="12" fill="${t.muted}">Current streak</text>
  <text x="${left - 1}" y="150" font-size="64" ${SERIF} fill="${t.accent}">${DATA.streak.current}</text>
  <text x="${left + String(DATA.streak.current).length * 29 + 8}" y="150" font-size="22" ${SERIF} fill="${t.secondary}">${DATA.streak.current === 1 ? "day" : "days"}</text>
  <text x="${left}" y="174" font-size="12" fill="${t.muted}">${fmt(DATA.contributions)} contributions this year</text>
${factRows}
  <text x="${left}" y="${h - 32}" font-size="11" fill="${t.muted}">Less</text>${legend}<text x="${left + 34 + 5 * 16 + 4}" y="${h - 32}" font-size="11" fill="${t.muted}">More</text>
  <g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)}) scale(${scale.toFixed(3)})">
    ${city}
    ${months.join("\n    ")}
    ${callout}
  </g>`;
  return frame(t, w, h, "A year of shipping", body, css + REDUCED);
}

// ---------------------------------------------------------------- lines

/** Lines added above the line and removed below it, month by month. */
function linesCard(t) {
  const w = 425;
  const h = 280;
  const L = DATA.lines;
  const months = DATA.months.slice(-12).map((m) => ({
    month: m.month,
    added: L.byMonth[m.month]?.added ?? 0,
    removed: L.byMonth[m.month]?.removed ?? 0,
  }));
  const max = Math.max(1, ...months.map((m) => m.added), ...months.map((m) => m.removed));
  const base = 196;
  const up = 64;
  const step = (w - 48) / months.length;
  const css = `.u{transform-box:fill-box;transform-origin:50% 100%;animation:g .8s cubic-bezier(.2,.7,.2,1) both}.d{transform-box:fill-box;transform-origin:50% 0;animation:g .8s cubic-bezier(.2,.7,.2,1) both}@keyframes g{from{transform:scaleY(0)}}`;
  const bars = months
    .map((m, i) => {
      const x = 24 + i * step + step * 0.2;
      const bw = step * 0.6;
      const a = m.added ? Math.max(2, (m.added / max) * up) : 0;
      const r = m.removed ? Math.max(2, (m.removed / max) * up) : 0;
      const delay = `style="animation-delay:${i * 40}ms"`;
      return [
        a && `  <rect class="u" ${delay} x="${x.toFixed(1)}" y="${(base - a).toFixed(1)}" width="${bw.toFixed(1)}" height="${a.toFixed(1)}" rx="2" fill="${t.accent}"/>`,
        r && `  <rect class="d" ${delay} x="${x.toFixed(1)}" y="${base + 1}" width="${bw.toFixed(1)}" height="${r.toFixed(1)}" rx="2" fill="${t.muted}" fill-opacity="0.6"/>`,
        `  <text x="${(x + bw / 2).toFixed(1)}" y="${h - 18}" text-anchor="middle" font-size="10.5" fill="${t.muted}">${monthName(m.month, "narrow")}</text>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  const added = `+${kilo(L.added)}`;
  const body = `${heading(t, w, "Lines changed", "Last 12 months · all repos")}
  <text x="23" y="102" font-size="46" ${SERIF} fill="${t.accent}">${added}</text>
  <text x="${24 + added.length * 21 + 10}" y="102" font-size="26" ${SERIF} fill="${t.secondary}">−${kilo(L.removed)}</text>
  <text x="24" y="124" font-size="11.5" fill="${t.muted}">Added and removed, as GitHub counts them</text>
${bars}
  <line x1="24" y1="${base + 0.5}" x2="${w - 24}" y2="${base + 0.5}" stroke="${t.border}"/>`;
  return frame(t, w, h, "Lines changed", body, css + REDUCED);
}

// ---------------------------------------------------------------- achievements

function achievementsCard(t) {
  const w = 425;
  const h = 280;
  const list = [...DATA.achievements].sort((a, b) => b.tier - a.tier).slice(0, 5);
  const rowH = list.length > 4 ? 42 : 50;
  const rows = list
    .map((a, i) => {
      const y = 76 + i * rowH;
      const ring = a.tier > 1;
      return `  <circle cx="44" cy="${y + 8}" r="16" fill="${ring ? t.accent : t.track}" fill-opacity="${ring ? 0.12 : 1}" stroke="${ring ? t.accent : t.border}"/>
  <text x="44" y="${y + 15}" text-anchor="middle" font-size="19" ${SERIF} fill="${ring ? t.accent : t.text}">${esc(a.name[0])}</text>
  <text x="72" y="${y + 4}" font-size="17" ${SERIF} fill="${t.text}">${esc(a.name)}</text>
  <text x="72" y="${y + 22}" font-size="11.5" fill="${t.secondary}">${esc(ACHIEVEMENTS[a.name] ?? "GitHub achievement")}</text>
  <text x="${w - 24}" y="${y + 13}" text-anchor="end" font-size="12" ${MONO} fill="${ring ? t.accent : t.muted}">x${a.tier}</text>`;
    })
    .join("\n");
  const body = `${heading(t, w, "Achievements", "Earned on GitHub")}
${rows || `  <text x="24" y="90" font-size="13" fill="${t.secondary}">None yet.</text>`}`;
  return frame(t, w, h, "Achievements", body);
}

// ---------------------------------------------------------------- languages

function languagesCard(t) {
  const w = 425;
  const h = 280;
  const langs = DATA.languages;
  const max = langs[0].pct;
  const rows = langs
    .map(({ name, pct }, i) => {
      const y = 70 + i * 22;
      const barX = 190;
      const barW = 156;
      return `  <text x="24" y="${y}" font-size="12.5" fill="${t.secondary}">${esc(name)}</text>
  <rect x="${barX}" y="${y - 8}" width="${barW}" height="6" rx="3" fill="${t.track}"/>
  <rect x="${barX}" y="${y - 8}" width="${((pct / max) * barW).toFixed(1)}" height="6" rx="3" fill="${i === 0 ? t.accent : t.muted}"/>
  <text x="${w - 24}" y="${y}" text-anchor="end" font-size="11.5" ${MONO} fill="${t.text}">${pct.toFixed(1)}%</text>`;
    })
    .join("\n");
  const recent = DATA.recentLanguages
    .slice(0, 3)
    .map((l) => `${l.name} ${Math.round(l.pct)}%`)
    .join(" · ");
  const body = `${heading(t, w, "Languages I write", "Weighted by my commits")}
${rows}
  <line x1="24" y1="${h - 46}" x2="${w - 24}" y2="${h - 46}" stroke="${t.border}"/>
  <text x="24" y="${h - 22}" font-size="11.5" fill="${t.muted}">Last 60 days</text>
  <text x="${w - 24}" y="${h - 22}" text-anchor="end" font-size="11.5" ${MONO} fill="${t.accent}">${esc(recent)}</text>`;
  return frame(t, w, h, "Languages I write", body);
}

// ---------------------------------------------------------------- weekdays

function weekdaysCard(t) {
  const w = 425;
  const h = 280;
  const WEEKDAYS = DATA.weekdays;
  const max = Math.max(...WEEKDAYS.map(([, n]) => n));
  const base = 236;
  const chartH = 140;
  const step = (w - 48) / WEEKDAYS.length;
  const css = `.u{transform-box:fill-box;transform-origin:50% 100%;animation:g .8s cubic-bezier(.2,.7,.2,1) both}@keyframes g{from{transform:scaleY(0)}}`;
  const grid = [0.5, 1]
    .map(
      (f) =>
        `  <line x1="24" y1="${base - f * chartH}" x2="${w - 24}" y2="${base - f * chartH}" stroke="${t.track}"/>`,
    )
    .join("\n");
  const bars = WEEKDAYS.map(([name, n], i) => {
    const x = 24 + i * step + step * 0.25;
    const bw = step * 0.5;
    const bh = Math.max(2, (n / max) * chartH);
    const lead = n === max;
    return `  <rect class="u" style="animation-delay:${i * 60}ms" x="${x.toFixed(1)}" y="${(base - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${lead ? t.accent : t.muted}" fill-opacity="${lead ? 1 : 0.55}"/>
  <text x="${(x + bw / 2).toFixed(1)}" y="${(base - bh - 6).toFixed(1)}" text-anchor="middle" font-size="11" ${MONO} fill="${lead ? t.accent : t.secondary}">${n}</text>
  <text x="${(x + bw / 2).toFixed(1)}" y="${base + 18}" text-anchor="middle" font-size="11.5" fill="${t.muted}">${name}</text>`;
  }).join("\n");
  const body = `${heading(t, w, "When I ship", "Contributions by weekday")}
${grid}
  <line x1="24" y1="${base}" x2="${w - 24}" y2="${base}" stroke="${t.border}"/>
${bars}`;
  return frame(t, w, h, "When I ship", body, css + REDUCED);
}

// ---------------------------------------------------------------- contact

function contactCard(t) {
  const w = 860;
  const h = 150;
  const bw = 132;
  const bx = w - 32 - bw;
  const body = `  <text x="30" y="70" font-size="38" ${SERIF} fill="${t.text}">${esc(CONTACT.title)}</text>
  <text x="32" y="102" font-size="14" fill="${t.secondary}">${esc(CONTACT.line)}</text>
  <rect x="${bx}" y="46" width="${bw}" height="40" rx="20" fill="${t.accent}"/>
  <text x="${bx + bw / 2}" y="71" text-anchor="middle" font-size="14" fill="${t.onAccent}">${esc(CONTACT.button)}</text>
  <text x="${w - 32}" y="110" text-anchor="end" font-size="11.5" ${MONO} fill="${t.muted}">${esc(CONTACT.email)}</text>`;
  return frame(t, w, h, CONTACT.title, body);
}

// ---------------------------------------------------------------- build

const cards = [];
for (const [theme, t] of Object.entries(THEMES)) {
  const add = (name, svg) => cards.push({ path: `assets/cards/${name}-${theme}.svg`, svg });
  add("header", headerCard(t));
  for (const p of PROJECTS) add(p.file, projectCard(t, p));
  add("stats", statsCard(t));
  add("skyline", skylineCard(t));
  add("lines", linesCard(t));
  add("achievements", achievementsCard(t));
  add("languages", languagesCard(t));
  add("weekdays", weekdaysCard(t));
  add("contact", contactCard(t));
}

// Cut each font down to the characters the cards use.
const decode = (s) =>
  s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&");
const used = new Set(
  cards.flatMap(({ svg }) =>
    [...svg.matchAll(/<(?:text|title)[^>]*>([^<]*)<\/(?:text|title)>/g)].flatMap((m) => [
      ...decode(m[1]),
    ]),
  ),
);
const chars = [...used].join("") + "0123456789";

const faces = [];
for (const font of Object.values(FONTS)) {
  const subset = await subsetFont(readFileSync(font.file), chars, { targetFormat: "woff2" });
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

// Refresh the live blocks in README.md, so the alt text says the same as the
// cards: everything between <!-- live:NAME --> and <!-- /live:NAME -->.
const picture = (name, alt, width) => `  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/${name}-dark.svg">
    <img src="assets/cards/${name}-light.svg" alt="${esc(alt)}" width="${width}">
  </picture>`;
const busiest = DATA.months.reduce((a, b) => (b.count > a.count ? b : a));
const activeMonths = DATA.months
  .filter((m) => m.count)
  .map((m) => `${monthName(m.month, "short")} ${m.count}`)
  .join(", ");
const LIVE = {
  stats: `<p>
${picture(
  "stats",
  `${fmt(DATA.contributions)} contributions in the last 12 months, ${DATA.pullRequestsMerged} pull requests merged of ${DATA.pullRequests}, current streak ${DATA.streak.current} days (longest ${DATA.streak.longest}), ${fmt(DATA.lines.added)} lines added and ${fmt(DATA.lines.removed)} removed, ${DATA.activeDays} active days. Updated ${day(DATA.updated)}.`,
  "100%",
)}
</p>`,
  year: `<p>
${picture(
  "skyline",
  `Contributions per day over the last 12 months, drawn as an isometric city. By month: ${activeMonths}. Busiest month ${monthName(busiest.month)} with ${busiest.count}; best day ${DATA.bestDay.count} on ${day(DATA.bestDay.date)}; longest streak ${DATA.streak.longest} days.`,
  "100%",
)}
</p>
<p>
${picture(
  "lines",
  `Lines changed in the last 12 months: ${fmt(DATA.lines.added)} added, ${fmt(DATA.lines.removed)} removed.`,
  "49%",
)}
${picture(
  "achievements",
  `GitHub achievements: ${DATA.achievements.map((a) => (a.tier > 1 ? `${a.name} x${a.tier}` : a.name)).join(", ") || "none yet"}.`,
  "49%",
)}
</p>
<p>
${picture(
  "languages",
  `Languages, weighted by my commits: ${DATA.languages.map((l) => `${l.name} ${l.pct}%`).join(", ")}. Last 60 days: ${DATA.recentLanguages
    .slice(0, 3)
    .map((l) => `${l.name} ${Math.round(l.pct)}%`)
    .join(", ")}.`,
  "49%",
)}
${picture(
  "weekdays",
  `Contributions by weekday: ${DATA.weekdays.map(([d, n]) => `${d} ${n}`).join(", ")}.`,
  "49%",
)}
</p>`,
};
let readme = readFileSync("README.md", "utf8");
for (const [name, html] of Object.entries(LIVE)) {
  const re = new RegExp(`(<!-- live:${name} -->)[\\s\\S]*?(<!-- /live:${name} -->)`);
  if (re.test(readme)) readme = readme.replace(re, `$1\n${html}\n$2`);
}
writeFileSync("README.md", readme);

console.log(
  `Built ${cards.length} cards in assets/cards/ (${Math.round(bytes / cards.length / 1024)} KB each on average)`,
);
