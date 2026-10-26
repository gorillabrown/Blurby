// APP-TABS-1 — live frames on a packaged Blurby build, over CDP. Dev tooling only: scripts/ is not in build.files.
// Reuses the UI-SWEEP session (profile preflight, LL-165). Verdicts read state (LL-166): aria-selected, [data-doc-id]
// sets, the scratch library.json and settings.json, computed styles. Never a screenshot.
//
//   node scripts/app-tabs/live-check.mjs --exe <copy of release\win-arm64-unpacked\Blurby.exe> --scratch <dir>
//        --live-profile <%APPDATA%\blurby\blurby-data> --out <results.json> [--port 9467] [--only L1,L2,...]
//
// Exit 0: every row passed. Exit 1: a row failed (named in the output, the run stops). Exit 4: the profile
// preflight could not prove the scratch profile (LL-165); nothing was touched.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Session, hashLive, sleep, log } from "../ui-sweep/sweep.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseArgs(argv) {
  const out = { port: 9467 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const v = () => argv[++i];
    if (a === "--exe") out.exe = v();
    else if (a === "--scratch") out.scratch = v();
    else if (a === "--live-profile") out.liveProfile = v();
    else if (a === "--out") out.out = v();
    else if (a === "--port") out.port = Number(v());
    else if (a === "--only") out.only = v().split(",");
    else throw new Error(`unknown argument ${a}`);
  }
  if (!out.exe || !out.scratch || !out.liveProfile || !out.out) throw new Error("--exe, --scratch, --live-profile and --out are required");
  return out;
}
const args = parseArgs(process.argv.slice(2));
const results = [];
const wanted = (id) => !args.only || args.only.includes(id);

// ── scratch profiles ─────────────────────────────────────────────────────────────────────────────────────────────
const writeJson = (file, obj) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj, null, 2)); };
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const baseSettings = (extra) => ({ schemaVersion: 13, theme: "dark", firstRunCompleted: true, viewMode: "grid", wpm: 300, folderName: "My reading list", ...extra });

function seedProfileOne(dir) {
  const books = path.join(dir, "books");
  fs.mkdirSync(books, { recursive: true });
  const pdf = path.join(books, "Superhuman_Keyboard_Shortcuts.pdf");
  fs.copyFileSync(path.join(REPO, "docs", "Superhuman_Keyboard_Shortcuts.pdf"), pdf);
  const stat = fs.statSync(pdf);
  const docs = [
    { id: "f-pdf", title: "Field Notes", filepath: pdf, filename: path.basename(pdf), ext: ".pdf", size: stat.size, modified: Math.round(stat.mtimeMs),
      wordCount: 5400, position: 40, created: 1760000300000, source: "folder", author: null, coverPath: null, lastReadAt: 1760400000000, revision: 4,
      cfi: "epubcfi(/6/4!/4/2:0)", furthestPosition: 0.2, deleted: false, syncContent: false, contentHash: null, unread: false, snoozedUntil: null, tags: [], collection: null },
    { id: "sample-meditations", title: "Meditations", filepath: path.join(REPO, "resources", "sample-meditations.epub"), wordCount: 3000, position: 0, created: 1759000000000,
      source: "sample", author: "Marcus Aurelius", coverPath: null, lastReadAt: null, deleted: false, syncContent: true, contentHash: null, unread: false, snoozedUntil: null, tags: [], collection: null },
    { id: "u-art", title: "Meditations on modern Stoicism", content: "A short article about stoicism. ".repeat(40), wordCount: 240, sourceUrl: "https://example.com/stoicism",
      position: 0, created: 1760600000000, source: "url", author: "Doe", authorFull: "Jane Doe", sourceDomain: "example.com", coverPath: null, lastReadAt: null,
      deleted: false, syncContent: true, contentHash: null, unread: false, snoozedUntil: null, tags: [], collection: null },
    { id: "m-text", title: "Pasted Note", content: "Some pasted text about reading. ".repeat(20), wordCount: 100, position: 0, created: 1760900000000, source: "manual",
      author: null, coverPath: null, lastReadAt: null, deleted: false, syncContent: true, contentHash: null, unread: false, snoozedUntil: null, tags: [], collection: null },
  ];
  // The seeded profile imports nothing, so main never creates covers; make it, as the sweep's seeding does. The
  // preflight's proof of the profile is the main process's own userData path plus the live profile's unmoved hashes.
  fs.mkdirSync(path.join(dir, "blurby-data", "covers"), { recursive: true });
  writeJson(path.join(dir, "blurby-data", "library.json"), { schemaVersion: 6, docs });
  writeJson(path.join(dir, "blurby-data", "settings.json"), baseSettings({ sourceFolder: books, recentFolders: [books] }));
  return books;
}

// ── page helpers ─────────────────────────────────────────────────────────────────────────────────────────────────
let sess = null;
const ev = (expr, ms) => sess.cdp.eval(expr, ms);
const tabState = () => ev(`[...document.querySelectorAll('.app-tab-bar [role=tab]')].map(t => t.textContent + ':' + t.getAttribute('aria-selected')).join(',')`);
const selectedTab = async () => (await tabState()).split(",").find((t) => t.endsWith(":true"))?.split(":")[0] ?? null;
const ids = async () => JSON.parse(await ev(`JSON.stringify([...new Set([...document.querySelectorAll('[data-doc-id]')].map(e => e.dataset.docId))].sort())`));
const has = (sel) => ev(`!!document.querySelector(${JSON.stringify(sel)})`);
async function waitFor(fn, what, ms = 8000) {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) { try { last = await fn(); if (last) return last; } catch { /* retry */ } await sleep(150); }
  throw new Error(`timed out waiting for ${what}`);
}
// Tag the first element under `scope` whose text matches, so the sweep's box() can find and scroll to it.
async function tagByText(scope, re, tag = "lc") {
  return ev(`(() => { document.querySelectorAll('[data-${tag}]').forEach(e => e.removeAttribute('data-${tag}'));
    const els = [...document.querySelectorAll(${JSON.stringify(scope)})].filter(e => ${re}.test((e.innerText || '').trim()));
    const el = els.find((e) => !els.some((o) => o !== e && e.contains(o))) || els[0];
    if (!el) return false; el.setAttribute('data-${tag}', '1'); return true; })()`);
}
async function mouse(type, x, y, button = "left") {
  await sess.cdp.send("Input.dispatchMouseEvent", { type, x, y, button: type === "mouseMoved" ? "none" : button, buttons: type === "mousePressed" ? (button === "right" ? 2 : 1) : 0, clickCount: 1 });
}
async function clickSel(sel) {
  const b = await sess.sw(`box(${JSON.stringify(sel)})`);
  if (!b) throw new Error(`no element ${sel}`);
  if (b.covered) throw new Error(`${sel} is covered by ${b.coveredBy}`);
  await sess.click(b.x, b.y);
  await sleep(250);
}
async function rightClickSel(sel) {
  const b = await sess.sw(`box(${JSON.stringify(sel)})`);
  if (!b) throw new Error(`no element ${sel}`);
  await mouse("mouseMoved", b.x, b.y);
  await mouse("mousePressed", b.x, b.y, "right");
  await mouse("mouseReleased", b.x, b.y, "right");
  await sleep(300);
}
async function hoverSel(sel) {
  const b = await sess.sw(`box(${JSON.stringify(sel)})`);
  if (!b) throw new Error(`no element ${sel}`);
  await mouse("mouseMoved", 5, 5); // leave first, so the enter is a fresh one
  await sleep(100);
  await mouse("mouseMoved", b.x, b.y);
  await sleep(300);
}
const clickText = async (scope, re) => { if (!(await tagByText(scope, re))) throw new Error(`no ${scope} matching ${re}`); await clickSel('[data-lc="1"]'); };
async function typeText(text) { await sess.cdp.send("Input.insertText", { text }); await sleep(300); }
const ctrlDigit = async (n) => { await sess.key(`Ctrl+${n}`); await sleep(300); };

async function launch(profile, tag) {
  sess = new Session({ exe: args.exe, profile, port: args.port, liveProfile: args.liveProfile });
  await sess.start(); // the profile preflight exits 4 here unless the scratch profile is proved (LL-165)
  await waitFor(() => has(".app-tab-bar"), `the tab bar (${tag})`, 30000);
  await sleep(1500);
}
async function relaunch(profile, tag) {
  await sess.stop();
  await sleep(1500);
  await launch(profile, tag);
}

async function row(id, title, fn) {
  if (!wanted(id)) return;
  const t0 = Date.now();
  try {
    const detail = await fn();
    results.push({ id, title, pass: true, detail, ms: Date.now() - t0 });
    log(`PASS ${id} ${title}`, detail ? JSON.stringify(detail) : "");
  } catch (e) {
    results.push({ id, title, pass: false, detail: String(e.message || e), ms: Date.now() - t0 });
    log(`FAIL ${id} ${title}: ${e.message || e}`);
    finish(1);
  }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
const eq = (a, b, msg) => expect(JSON.stringify(a) === JSON.stringify(b), `${msg}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);

function finish(code) {
  fs.writeFileSync(args.out, JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
  try { sess?.proc?.kill(); } catch { /* gone */ }
  const after = JSON.stringify(hashLive(args.liveProfile));
  const unchanged = after === liveBefore;
  console.log(`live profile hashes ${unchanged ? "unchanged" : "CHANGED"}: ${after}`);
  process.exit(unchanged ? code : 5);
}

// ── run ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const liveBefore = JSON.stringify(hashLive(args.liveProfile));
console.log(`live profile hashes before: ${liveBefore}`);
const P1 = path.join(args.scratch, "p1");
fs.rmSync(P1, { recursive: true, force: true });
seedProfileOne(P1);
const LIB1 = path.join(P1, "blurby-data", "library.json");
const SET1 = path.join(P1, "blurby-data", "settings.json");
const rec = (id) => readJson(LIB1).docs.find((d) => d.id === id);

await launch(P1, "p1");

await row("L1", "frame 1: launch on Library; Newsroom; article reader is full-screen; Escape returns to Newsroom", async () => {
  eq(await selectedTab(), "Library", "selected tab at launch");
  const lib = await ids();
  expect(lib.includes("f-pdf") && lib.includes("sample-meditations"), `Library lists f-pdf and the sample: ${lib}`);
  expect(!lib.includes("u-art") && !lib.includes("m-text"), "Library lists no Newsroom item");
  await clickSel('.app-tab-bar [role=tab]:nth-child(2)');
  eq(await selectedTab(), "Newsroom", "selected after click");
  eq(await ids(), ["m-text", "u-art"], "Newsroom ids");
  await clickSel('[data-doc-id="u-art"]');
  await waitFor(async () => !(await has('[role="tablist"]')), "the reader (no tablist)");
  expect(!(await has('[role="tablist"]')), "a [role=tablist] exists in the reader");
  for (let i = 0; i < 6 && !(await has(".app-tab-bar")); i++) { await sess.key("Escape"); await sleep(700); }
  await waitFor(() => has(".app-tab-bar"), "the tab bar after Escape");
  eq(await selectedTab(), "Newsroom", "selected after the reader exits");
});

await row("L7", "frame 5: Ctrl+3 Podcasts, Ctrl+4 Marketplace, Ctrl+1 Library", async () => {
  await ctrlDigit(3);
  eq(await selectedTab(), "Podcasts", "Ctrl+3");
  expect(await ev(`document.querySelector('#app-tabpanel-podcasts')?.innerText.includes('No podcasts yet')`), "Podcasts empty state");
  await ctrlDigit(4);
  eq(await selectedTab(), "Marketplace", "Ctrl+4");
  eq(await ev(`document.querySelector('#app-tabpanel-marketplace [role=status]')?.innerText.trim()`), "Coming soon", "Marketplace banner");
  await ctrlDigit(1);
  eq(await selectedTab(), "Library", "Ctrl+1");
});

await row("L4", "frame 3: search on the Library tab lists both tabs, and a Newsroom result opens on Newsroom", async () => {
  await clickSel('.app-tab-bar [aria-label="Search"]');
  await typeText("meditations");
  const rows = JSON.parse(await ev(`JSON.stringify([...document.querySelectorAll('.search-result-item')].map(r => [r.querySelector('.search-result-title')?.innerText, r.querySelector('.search-result-tab')?.innerText]))`));
  eq(rows.map((r) => r[1]).sort(), ["Library", "Newsroom"], "result labels");
  await ev(`(() => { const r = [...document.querySelectorAll('.search-result-item')].find(r => r.querySelector('.search-result-tab')?.innerText === 'Newsroom'); r.setAttribute('data-lc','1'); })()`);
  await clickSel('[data-lc="1"]');
  await waitFor(async () => !(await has('[role="tablist"]')), "the reader");
  for (let i = 0; i < 6 && !(await has(".app-tab-bar")); i++) { await sess.key("Escape"); await sleep(700); }
  await waitFor(() => has(".app-tab-bar"), "the tab bar after the reader");
  eq(await selectedTab(), "Newsroom", "tab after opening the Newsroom result");
});

await row("L5", "frame 4: hover opens the filter menu, Escape closes it; with E-ink on a click opens it", async () => {
  await hoverSel('.app-tab-bar [aria-label="Filter"]');
  await waitFor(() => has('[role="menu"]'), "the menu on hover");
  const texts = JSON.parse(await ev(`JSON.stringify([...document.querySelectorAll('[role=menu] [role=menuitemradio]')].map(e => e.innerText))`));
  eq(texts, ["All", "New", "Favorites", "Archived"], "Newsroom filters");
  await sess.key("Escape");
  await sleep(300);
  expect(!(await has('[role="menu"]')), "Escape left the menu open");
  // Turn E-ink on in Settings
  await clickSel('.app-tab-bar [aria-label="Settings"]');
  await waitFor(() => has(".menu-flap.open"), "the settings flap");
  await clickText(".menu-flap button, .menu-flap [role=button], .menu-flap li", /^theme$/i);
  await sleep(500);
  await clickSel('[aria-label="Toggle E-Ink display mode"]');
  await sleep(500);
  expect(await ev(`document.documentElement.getAttribute('data-eink') === 'true'`), "E-ink did not turn on");
  await sess.key("Escape"); await sleep(400);
  if (await has(".menu-flap.open")) { await clickSel(".menu-flap-close-btn"); await sleep(400); }
  await hoverSel('.app-tab-bar [aria-label="Filter"]');
  await clickSel('.app-tab-bar [aria-label="Filter"]');
  await sleep(400);
  expect(await has('[role="menu"]'), "E-ink: a click left the menu closed");
  await sess.key("Escape"); await sleep(300);
  // Turn E-ink off again
  await clickSel('.app-tab-bar [aria-label="Settings"]');
  await waitFor(() => has(".menu-flap.open"), "the settings flap");
  await clickText(".menu-flap button, .menu-flap [role=button], .menu-flap li", /^theme$/i);
  await sleep(500);
  await clickSel('[aria-label="Toggle E-Ink display mode"]');
  await sleep(500);
  expect(await ev(`document.documentElement.getAttribute('data-eink') !== 'true'`), "E-ink did not turn off");
  await sess.key("Escape"); await sleep(400);
  if (await has(".menu-flap.open")) { await clickSel(".menu-flap-close-btn"); await sleep(400); }
});

await row("L6", "themes: the tab bar background is --bg in every theme, E-ink off and on; selected tab is 700 under E-ink", async () => {
  const bar = () => ev(`(() => { const probe = document.createElement('div'); probe.style.background = 'var(--bg)'; document.body.appendChild(probe);
    const want = getComputedStyle(probe).backgroundColor; probe.remove();
    const root = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    return JSON.stringify({ bar: getComputedStyle(document.querySelector('.app-tab-bar')).backgroundColor, want, root, weight: getComputedStyle(document.querySelector('.app-tab[aria-selected=true]')).fontWeight }); })()`).then(JSON.parse);
  const openTheme = async () => {
    await clickSel('.app-tab-bar [aria-label="Settings"]');
    await waitFor(() => has(".menu-flap.open"), "the settings flap");
    await clickText(".menu-flap button, .menu-flap [role=button], .menu-flap li", /^theme$/i);
    await sleep(400);
  };
  const closeFlap = async () => { await sess.key("Escape"); await sleep(400); if (await has(".menu-flap.open")) { await clickSel(".menu-flap-close-btn"); await sleep(400); } };
  const seen = {};
  for (const eink of [false, true]) {
    for (const theme of ["blurby", "dark", "light", "system"]) {
      await openTheme();
      const isOn = await ev(`document.documentElement.getAttribute('data-eink') === 'true'`);
      if (isOn !== eink) { await clickSel('[aria-label="Toggle E-Ink display mode"]'); await sleep(400); }
      await clickText(".menu-flap button, .menu-flap [role=button]", new RegExp(`^${theme}$`, "i"));
      await sleep(500);
      await closeFlap();
      const s = await bar();
      seen[`${theme}${eink ? "+eink" : ""}`] = s;
      expect(s.bar === s.want, `${theme} eink=${eink}: bar ${s.bar} vs --bg ${s.want}`);
      if (eink) eq(s.weight, "700", `${theme}+eink selected tab font-weight`);
    }
  }
  // Positive control (LL-166): the value changes between dark and light
  expect(seen["dark"].bar !== seen["light"].bar, `dark and light give the same bar colour ${seen["dark"].bar}: the detector cannot see a change`);
  // leave the profile as it was: dark, E-ink off
  await openTheme();
  if (await ev(`document.documentElement.getAttribute('data-eink') === 'true'`)) { await clickSel('[aria-label="Toggle E-Ink display mode"]'); await sleep(400); }
  await clickText(".menu-flap button, .menu-flap [role=button]", /^dark$/i);
  await closeFlap();
  return seen;
});

await row("L2", "frame 2: Move to Newsroom keeps position, cfi and revision; survives a rescan and a relaunch", async () => {
  await ctrlDigit(1);
  const before = rec("f-pdf");
  await rightClickSel('[data-doc-id="f-pdf"]');
  await waitFor(() => has(".doc-context-menu"), "the card menu");
  await clickText(".doc-context-menu button", /^Move to Newsroom$/);
  await waitFor(async () => rec("f-pdf").home === "newsroom", "home saved to library.json", 4000);
  const after = rec("f-pdf");
  for (const k of ["position", "cfi", "revision"]) eq(after[k], before[k], `f-pdf ${k}`);
  await clickSel('[aria-label="Rescan folder"]');
  await waitFor(() => ev(`document.querySelector('[aria-label="Rescan folder"]')?.innerText.trim() === '⟳'`), "the rescan to finish", 60000);
  await sleep(1500);
  eq(rec("f-pdf").home, "newsroom", "home after rescan");
  await relaunch(P1, "p1 relaunch");
  return { home: rec("f-pdf").home, position: rec("f-pdf").position, revision: rec("f-pdf").revision };
});

await row("L3", "last-used tab: Newsroom after the relaunch, saved in settings.json", async () => {
  eq(await selectedTab(), "Newsroom", "tab after relaunch");
  expect(Array.isArray(await ids()) && (await ids()).includes("f-pdf"), "f-pdf listed on Newsroom");
  eq(readJson(SET1).libraryTab, "newsroom", "settings.json libraryTab");
  await ctrlDigit(1);
  expect(!(await ids()).includes("f-pdf"), "f-pdf is on the Library tab");
});

await sess.stop();

// ── L8: the owner's real library, copied to a second scratch profile with no source folder (LL-158) ────────────────
await row("L8", "frame 6: the owner's library loads with every record unchanged and every id on exactly one tab", async () => {
  const P2 = path.join(args.scratch, "p2");
  fs.rmSync(P2, { recursive: true, force: true });
  fs.mkdirSync(path.join(P2, "blurby-data", "covers"), { recursive: true });
  fs.copyFileSync(path.join(args.liveProfile, "library.json"), path.join(P2, "blurby-data", "library.json"));
  const settings = readJson(path.join(args.liveProfile, "settings.json"));
  settings.sourceFolder = null;
  writeJson(path.join(P2, "blurby-data", "settings.json"), settings);
  const copy = readJson(path.join(P2, "blurby-data", "library.json"));
  const copyDocs = Array.isArray(copy) ? copy : copy.docs;
  await launch(P2, "p2");
  await sleep(4000);
  const afterRaw = readJson(path.join(P2, "blurby-data", "library.json"));
  const afterDocs = Array.isArray(afterRaw) ? afterRaw : afterRaw.docs;
  eq(afterDocs.map((d) => d.id), copyDocs.map((d) => d.id), "id list and order");
  expect(new Set(afterDocs.map((d) => d.id)).size === afterDocs.length, "an id appears twice");
  const differ = copyDocs.filter((d, i) => JSON.stringify(d) !== JSON.stringify(afterDocs[i])).length;
  expect(differ === 0, `${differ} of ${copyDocs.length} records differ from the copy`);
  const live = copyDocs.filter((d) => !d.deleted).map((d) => d.id).sort();
  const union = new Set();
  const perTab = {};
  for (const tab of [1, 2]) {
    await ctrlDigit(tab);
    perTab[tab] = new Set();
    for (const f of ["All", "Archived"]) {
      await clickSel('.app-tab-bar [aria-label="Filter"]');
      await waitFor(() => has('[role="menu"]'), "the filter menu");
      await clickText('[role=menu] [role=menuitemradio]', new RegExp(`^${f}$`));
      await sleep(600);
      for (const id of await ids()) { perTab[tab].add(id); union.add(id); }
    }
  }
  eq([...union].sort(), live, "union of ids on both tabs vs the copy's non-deleted ids");
  const both = [...perTab[1]].filter((id) => perTab[2].has(id));
  expect(both.length === 0, `${both.length} ids on both tabs`);
  return { records: copyDocs.length, live: live.length, library: perTab[1].size, newsroom: perTab[2].size, recordsDiffering: differ };
});

finish(0);
