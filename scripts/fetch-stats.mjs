// Fetches the live numbers behind the README cards and writes data/stats.json.
//
//   GH_TOKEN=... node scripts/fetch-stats.mjs
//
// The token should belong to the profile owner, with the `repo` and
// `read:user` scopes (and `read:org` for organisation repos), so private work
// counts. Locally, `GH_TOKEN=$(gh auth token)` works. In GitHub Actions the
// workflow passes the PROFILE_TOKEN secret.
//
// Everything here is read-only. Achievements have no API, so they are read
// from the public profile page; if that fails, the previous list is kept.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("Set GH_TOKEN (locally: GH_TOKEN=$(gh auth token)).");
  process.exit(1);
}
const OUT = "data/stats.json";
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

const headers = {
  Authorization: `bearer ${TOKEN}`,
  "User-Agent": "profile-readme-cards",
  Accept: "application/vnd.github+json",
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function rest(path) {
  // The statistics endpoints answer 202 while GitHub computes them.
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    if (res.status === 202) {
      await sleep(3000);
      continue;
    }
    if (!res.ok) return null;
    return res.status === 204 ? null : res.json();
  }
  return null;
}

const iso = (d) => d.toISOString().slice(0, 10);
const now = new Date();
const yearAgo = new Date(now);
yearAgo.setUTCFullYear(now.getUTCFullYear() - 1);

// 1. Profile, calendar, totals and the repos committed to this year.
const { viewer } = await gql(
  `query($from: DateTime!, $to: DateTime!) {
    viewer {
      id
      login
      repositories(ownerAffiliations: OWNER, first: 100) {
        totalCount
        nodes { isPrivate }
      }
      contributionsCollection(from: $from, to: $to) {
        restrictedContributionsCount
        totalPullRequestContributions
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }`,
  { from: yearAgo.toISOString(), to: now.toISOString() },
);
const login = viewer.login;
const cc = viewer.contributionsCollection;

// The contributions API hides which private repos the work went to, so count
// my commits in every repo the token can see: owned, collaborator and
// organisation repos. Forks are skipped (their commits are copies) and so is
// this profile repo (its commits are the cards themselves).
const recentSince = new Date(now);
recentSince.setUTCDate(now.getUTCDate() - 60);
const repos = [];
for (let after = null; ; ) {
  const page = await gql(
    `query($id: ID!, $year: GitTimestamp!, $recent: GitTimestamp!, $after: String) {
      viewer {
        repositories(first: 50, after: $after,
          affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER],
          ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
          pageInfo { hasNextPage endCursor }
          nodes {
            nameWithOwner
            isPrivate
            isFork
            languages(first: 12, orderBy: { field: SIZE, direction: DESC }) {
              edges { size node { name color } }
            }
            defaultBranchRef { target { ... on Commit {
              year: history(author: { id: $id }, since: $year) { totalCount }
              recent: history(author: { id: $id }, since: $recent) { totalCount }
            } } }
          }
        }
      }
    }`,
    { id: viewer.id, year: yearAgo.toISOString(), recent: recentSince.toISOString(), after },
  );
  const { nodes, pageInfo } = page.viewer.repositories;
  for (const r of nodes) {
    const target = r.defaultBranchRef?.target;
    if (r.isFork || !target || r.nameWithOwner.toLowerCase() === `${login}/${login}`.toLowerCase()) continue;
    if (!target.year.totalCount) continue;
    repos.push({
      repository: r,
      commits: target.year.totalCount,
      recentCommits: target.recent.totalCount,
    });
  }
  if (!pageInfo.hasNextPage) break;
  after = pageInfo.endCursor;
}

const days = cc.contributionCalendar.weeks
  .flatMap((w) => w.contributionDays)
  .map((d) => ({ date: d.date, count: d.contributionCount }));

// 2. Pull requests, from search (counts private repos the token can see).
const prs = await gql(
  `query($all: String!, $merged: String!) {
    all: search(query: $all, type: ISSUE, first: 0) { issueCount }
    merged: search(query: $merged, type: ISSUE, first: 0) { issueCount }
  }`,
  { all: `author:${login} is:pr`, merged: `author:${login} is:pr is:merged` },
);

// 3. Streaks, best day, weekdays, months.
const active = days.filter((d) => d.count > 0);
const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
let longest = 0;
let run = 0;
for (const d of days) {
  run = d.count > 0 ? run + 1 : 0;
  longest = Math.max(longest, run);
}
// Today is still in progress, so an empty today does not end the streak.
let current = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].count > 0) current++;
  else if (i === days.length - 1) continue;
  else break;
}
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekdayTotals = Object.fromEntries(WEEKDAY_NAMES.map((n) => [n, 0]));
const months = {};
for (const d of days) {
  const date = new Date(`${d.date}T00:00:00Z`);
  weekdayTotals[WEEKDAY_NAMES[date.getUTCDay()]] += d.count;
  const m = d.date.slice(0, 7);
  months[m] = (months[m] || 0) + d.count;
}
const firstActive = active[0]?.date ?? null;

// 4. Languages, weighted by how many commits I made to each repo, so a big
//    repo I touched once does not outweigh the one I work in every day.
function languageShares(repos, commitsOf) {
  const totals = {};
  const colors = {};
  for (const r of repos) {
    const edges = r.repository.languages.edges;
    const size = edges.reduce((s, e) => s + e.size, 0);
    const commits = commitsOf(r);
    if (!size || !commits) continue;
    for (const e of edges) {
      totals[e.node.name] = (totals[e.node.name] || 0) + (e.size / size) * commits;
      colors[e.node.name] = e.node.color;
    }
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(totals)
    .map(([name, v]) => ({ name, pct: +((v / sum) * 100).toFixed(1), color: colors[name] }))
    .sort((a, b) => b.pct - a.pct);
}
const repoCommits = (r) => r.commits;
const recentCommits = (r) => r.recentCommits;

// 5. Lines added and removed, per repo and per month, from GitHub's
//    contributor statistics (weekly, default branch only).
const lines = { added: 0, removed: 0, byMonth: {}, byRepo: [] };
for (const r of repos) {
  const stats = await rest(`/repos/${r.repository.nameWithOwner}/stats/contributors`);
  const mine = Array.isArray(stats)
    ? stats.find((s) => s.author?.login?.toLowerCase() === login.toLowerCase())
    : null;
  if (!mine) continue;
  let added = 0;
  let removed = 0;
  for (const w of mine.weeks) {
    const week = new Date(w.w * 1000);
    if (week < yearAgo || (!w.a && !w.d)) continue;
    added += w.a;
    removed += w.d;
    const m = iso(week).slice(0, 7);
    lines.byMonth[m] ??= { added: 0, removed: 0 };
    lines.byMonth[m].added += w.a;
    lines.byMonth[m].removed += w.d;
  }
  lines.added += added;
  lines.removed += removed;
  if (added || removed) {
    lines.byRepo.push({
      repo: r.repository.isPrivate ? null : r.repository.nameWithOwner,
      private: r.repository.isPrivate,
      added,
      removed,
    });
  }
}
lines.byRepo.sort((a, b) => b.added + b.removed - (a.added + a.removed));

// 6. Achievements, from the public profile page.
let achievements = previous.achievements ?? [];
try {
  const html = await (
    await fetch(`https://github.com/${login}?tab=achievements`, {
      headers: { "User-Agent": "profile-readme-cards" },
    })
  ).text();
  const found = [];
  const re = /alt="Achievement: ([^"]+)"[\s\S]{0,1500}?(?=alt="Achievement: |$)/g;
  for (const m of html.matchAll(re)) {
    const name = m[1].trim();
    if (found.some((a) => a.name === name)) continue;
    const tier = m[0].match(/achievement-tier-label[^>]*>\s*x(\d+)/);
    found.push({ name, tier: tier ? Number(tier[1]) : 1 });
  }
  if (found.length) achievements = found;
} catch (err) {
  console.warn(`Achievements not updated: ${err.message}`);
}

const owned = viewer.repositories;
const stats = {
  login,
  updated: iso(now),
  contributions: cc.contributionCalendar.totalContributions,
  privateContributions: cc.restrictedContributionsCount,
  pullRequests: prs.all.issueCount,
  pullRequestsMerged: prs.merged.issueCount,
  repositories: owned.totalCount,
  privateRepositories: owned.nodes.filter((r) => r.isPrivate).length,
  activeDays: active.length,
  firstActive,
  bestDay: best,
  streak: { current, longest },
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((n) => [n, weekdayTotals[n]]),
  months: Object.entries(months).map(([month, count]) => ({ month, count })),
  days,
  languages: languageShares(repos, repoCommits).slice(0, 8),
  recentLanguages: languageShares(repos, recentCommits).slice(0, 5),
  lines,
  achievements,
};

mkdirSync("data", { recursive: true });
writeFileSync(OUT, `${JSON.stringify(stats, null, 2)}\n`);
console.log(
  `${login}: ${stats.contributions} contributions, ${stats.pullRequests} PRs, ` +
    `streak ${current}/${longest}, +${lines.added}/-${lines.removed} lines, ` +
    `${achievements.length} achievements → ${OUT}`,
);
