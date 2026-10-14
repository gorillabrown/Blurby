# Blurby — Project Constitution

**Established:** 2026-03-21 (Session 1)
**Authority:** Supreme governing document. All implementation decisions, architecture choices, and process rules derive from these articles. When rules conflict, earlier articles take precedence.
**Scope:** Applies to all contributors — human, Cowork, Claude Code agents.

---

## Preamble

Blurby is a desktop RSVP speed reading application. Its purpose is to let users consume written content at their chosen pace through word-by-word presentation with Optimal Recognition Point (ORP) highlighting, backed by a robust library management system that handles multiple document formats.

This constitution consolidates governing principles, rules, and guardrails into a single authoritative hierarchy so that any contributor can understand the rules, their rationale, and how they relate to each other.

---

## Article I — Core Imperatives

*These two rules govern everything. They sit above engineering philosophy because they are about character, not technique.*

### CI-1: Do the right thing fully — no shortcuts — at the right time, in the right way
Every task deserves complete execution. Cutting corners creates debt that compounds across sprints. If something is worth doing, it's worth doing right. If it's not worth doing right, it's not worth doing at all. This applies to code, documentation, testing, and communication equally.

### CI-2: Eat the Frog First
Tackle the most challenging, important, and procrastinated task first. Don't warm up on easy wins while the hard problem festers. The hardest task gets the freshest mind, the most focus, and the least accumulated fatigue. Completing it first eliminates the drag of avoidance, lowers stress for the rest of the session, and builds momentum. When planning sprint order, the frog goes first. When planning within a sprint, the frog goes first. When in doubt about what to work on next — find the frog.

---

## Article II — Engineering Philosophy

*Rob Pike's Rules of Programming, applied to Blurby.*

### Rule E-1: Don't guess where the bottleneck is
Measure first. Profile before optimizing. The bottleneck is almost never where you think it is.

**Application to Blurby:** The app has two process boundaries (main ↔ renderer via IPC) and a React rendering pipeline. Don't assume IPC is slow or React re-renders are the problem — instrument and measure.

### Rule E-2: Measure before you tune
Don't tune for speed until you've measured, and even then don't unless one part overwhelms the rest.

**Application to Blurby:** Before optimizing any component, measure with React DevTools Profiler and Electron's process metrics. This extends to UX — before redesigning a flow, observe how users actually interact with it.

### Rule E-3: Fancy algorithms are slow when n is small
Keep it simple until complexity is proven necessary.

**Application to Blurby:** A library of 1,000 documents is small. A book of 100K words is moderate. Linear scans, simple sorts, and flat arrays are fine at these scales. Virtual windowing is the exception — proven necessary for smooth scroll on 100K+ word documents.

### Rule E-4: Simple algorithms, simple data structures
Fancy code is buggier and harder to maintain.

**Application to Blurby:** This is why settings.json and library.json are flat JSON files, not SQLite. This is why the migration framework is a simple sequential array of functions. This is why CSS custom properties handle theming instead of a CSS-in-JS runtime.

### Rule E-5: Data dominates
Right data structures make algorithms self-evident.

**Application to Blurby:** The library.json schema defines the entire library experience. The settings.json schema defines the entire preference system. When a feature doesn't work, ask "is the data structure wrong?" before "is the algorithm wrong?"

---

## Article III — Architecture Principles

### AP-1: Electron's process model is the law
Main process (Node.js/CommonJS) and renderer (browser/ESM/React) are separate worlds. preload.js is the only bridge. No Node.js imports in renderer code. No DOM access from main process. Every system operation goes through IPC.

### AP-2: The IPC pattern is sacred
1. Add handler in `main.js` → `ipcMain.handle("channel-name", ...)`
2. Expose in `preload.js` → `contextBridge.exposeInMainWorld("electronAPI", { ... })`
3. Call in renderer → `window.electronAPI.channelName(...)`

Never shortcut this. Never use `remote`. Never expose `ipcRenderer` directly.

### AP-3: File I/O is always async
All file operations in main.js use `fs.promises`. No `readFileSync`, no `writeFileSync`, no `existsSync` in hot paths. The main process thread must never block — it freezes the entire app.

### AP-4: Content is loaded on demand
Folder-sourced documents store only metadata in library.json. Content is loaded via `load-doc-content` IPC when the user opens a document. Manual and URL documents store content inline (they have no persistent filepath).

### AP-5: CSS custom properties are the theming system
All colors, spacing, and visual tokens are CSS custom properties in `:root`. Components reference variables, not literal values. Theme switching swaps the variable values. No inline styles.

### AP-6: Schema versioning protects user data
Both settings.json and library.json carry `schemaVersion` fields. Migrations run automatically on startup. Before any migration, the framework backs up the existing file. Migrations are sequential and additive — never destructive.

### AP-7: Types live in types.ts
Shared TypeScript types for the renderer are defined in `src/types.ts`. Component-specific types can live in the component file but shared interfaces (Document, Settings, etc.) must be in types.ts.

### AP-8: One component, one responsibility
Each React component does one thing. ReaderView reads. LibraryView browses. MenuFlap navigates settings. DocCard displays a document. If a component grows beyond ~500 lines, it's doing too much — extract.

---

## Article IV — UX Principles

### UX-1: Reading is the product
Every design decision must serve the reading experience. The library, settings, and management features exist to support reading — they are never the main event.

### UX-2: Speed reading must feel effortless
The RSVP reader should produce a flow state. Transitions, controls, and visual noise must be minimized during active reading. The ORP highlight is the focal point — everything else recedes.

### UX-3: Format should be invisible
Users don't care if their book is EPUB, MOBI, PDF, or TXT. The app handles format differences silently. The reading experience is format-agnostic.

### UX-4: Keyboard-first, mouse-friendly
Power users live on the keyboard. All reading controls have keyboard shortcuts. All navigation is keyboard-accessible. Mouse/trackpad works everywhere but is never required.

### UX-5: Settings are discoverable but not intrusive
The Menu Flap provides access to all settings without leaving the current context. Settings changes take effect immediately (no "Save" button).

---

## Article V — Process & Governance

### Operational Rules (CLAUDE.md §0-8)

| # | Rule |
|---|------|
| 0 | Speak freely during brainstorming |
| 1 | Always update documentation after changes |
| 2 | Always review CLAUDE.md and LESSONS_LEARNED.md before sessions |
| 3 | Tag completed roadmap items with ✅ COMPLETED |
| 4 | Use plain language with codebase terms parenthetical |
| 5 | Roadmap specs three sprints ahead |
| 6 | Aggressively parallelize Cowork and Claude Code CLI work |
| 7 | CLAUDE.md stays under ~20k chars — archive completed sprints |
| 8 | Always print CLI-formatted sprint dispatches |

### Division of Labor

**Cowork** = architect and reviewer. Plans, reviews, interprets. Does NOT write code unless user directly asks.

**Claude Code CLI** = all execution. Agents dispatched via Sprint Dispatch Template (WHAT/WHERE/HOW/WHEN/DONE WHEN).

### Decision Authority (owner ruling 2026-10-14, CLAUDE.md §11)

Claude and the owner split decisions in three tiers:

1. **Fully technical back-end** — Claude decides unilaterally, for the best version of Blurby.
2. **Hybrid** — a technical change with a user-visible effect, or one that touches an owner ruling. Claude elevates for discussion, with a recommendation.
3. **Design and functionality** (front of house) — Claude elevates for the owner's decision.

### Standing Rules
- After any code change → `npm test` before proceeding
- After any UI/build change → `npm run build` verification
- Haiku for lightweight, Sonnet for focused, Opus only for cross-system reasoning
- Parallelize independent work. Sequence dependent work
- LESSONS_LEARNED updated immediately on non-trivial discovery

---

## Article VI — Known Traps

*Check before working in the relevant area.*

| Trap | Area | Mitigation |
|------|------|------------|
| OneDrive sync issues | File I/O | Files may be cloud-only; always handle read errors gracefully |
| Synchronous file reads in main.js | Electron main | Audit for any remaining `readFileSync` — all must be async |
| IPC channel name mismatch | Electron IPC | Channel names must match exactly across main.js, preload.js, and renderer |
| React state during playback | Reader | Setting word index every tick causes full re-renders — use refs for hot-path updates |
| CSS specificity wars | Theming | Use custom properties, not `!important`. Theme class on `:root`, not nested selectors |
| EPUB NCX vs nav TOC | Format parsing | Some EPUBs have NCX only, some nav only, some both — handle all cases |
| PDF text extraction order | Format parsing | Multi-column PDFs extract in wrong reading order — no reliable fix, document limitation |
| DRM-protected files | Format parsing | Detect and show clear message — never attempt to bypass |
| preload.js size creep | Security | Keep preload minimal — it's the attack surface |
| node_modules in asar | Packaging | Ensure electron-builder correctly bundles native deps |

---

## Article VII — Development Workflow

### OneDrive-First, Git to Publish
This is a solo developer project worked across two machines. The working directory lives on OneDrive for cross-machine access. Git pushes to GitHub mark completed phases of work.

**Workflow:**
1. Working directory: `C:\Users\estra\OneDrive\Projects\Blurby` (synced via OneDrive across machines)
2. Claude Code CLI runs directly against the OneDrive working directory
3. Commit locally as work progresses
4. Push to GitHub (`gorillabrown/Blurby`) when a sprint or phase is complete
5. Cowork reviews via GitHub or direct file access

**Previous workflow (retired):** Claude Code pushed directly to GitHub from its own context, then user pulled to OneDrive. This is reversed — OneDrive is the source of truth for active work, GitHub is the publication target.

**Known limitation:** Cowork's Linux VM cannot read OneDrive-synced files that are cloud-only (LL-001). When Cowork needs to read code, it accesses via GitHub browser or the user provides file contents. This does not affect Claude Code CLI, which runs natively on Windows against the OneDrive path.

---

## Article VIII — Amendment Process

1. **New rule discovered** → Add to LESSONS_LEARNED.md with full context
2. **Rule validated across sessions** → Promote to relevant Article in this constitution
3. **Rule conflicts with existing article** → Resolve explicitly with documented rationale
4. **Article I (Pike's Rules)** → Immutable

### Hierarchy of Authority

1. **This Constitution** — supreme authority for "how we work"
2. **CLAUDE.md** — current system state and operational instructions
3. **ROADMAP.md** — implementation plans and acceptance criteria
4. **LESSONS_LEARNED.md** — accumulated wisdom and guardrails

When documents conflict, higher-numbered documents yield to lower-numbered ones.
