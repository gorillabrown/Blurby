---
epic: blurby-server
id: BLURBY-SERVER-1 (provisional; the review assigns the id)
item: BLURBY-SERVER-1
origin: held plan 2026-10-23-blurby-server (storyboard aligned 2026-10-23, owner "a")
created: 2026-10-23
status: draft   # not a launched charter; /epic sets active when it scaffolds the packet after /roadmap-review places the item as Path: epic
---

# Epic Charter Draft — One library on every device (blrby.app server)

<!-- Written by /write-plan on 2026-10-23 against main @ ac9dc539, at the owner's request
     ("the full plan now"). The held entry is epic-scale, which /write-plan never plans
     in the entry itself, so the plan is this charter draft beside it. It is not a launched
     charter: /roadmap-review places the item as Path: epic, and /epic adopts, tightens or
     re-cuts this draft. Until then nothing here is on the roadmap or the register.
     Owner decisions come from the storyboard and are not reopened here. Items marked
     "Open question" are the owner's (CLAUDE.md Rule 11, tiers 2 and 3); each carries a
     recommendation. Technical choices (tier 1) are decided here and logged under
     "Planner decisions". -->

## Outcome

A reader signs in to blrby.app on any device and sees the same books, reading positions, highlights, notes and settings. A Blurby server on Cloudflare is the hub. It replaces the desktop's own-cloud sync engine. Books come in through a drag-and-drop window, plan limits apply, and downloaded books read offline. The work is built in four phases:

1. Server foundation and plan limits.
2. Desktop sign-in, the drag-and-drop window, sync and offline books.
3. Payments, with ads on Free.
4. Server narration: the Kokoro speed-and-cost test, then hosting.

The alignment record in `../2026-10-23-blurby-server.md` (Storyboard) is the source of every owner decision, frame, plan value and out-of-scope line. Where this draft is shorter, the storyboard governs. Where they conflict, the storyboard governs until the owner amends it.

## What the code is today (investigation, `main` @ `ac9dc539`, grep-verified 2026-10-23)

This is what the edit sites hold now. Phase specs cite it. Each run re-greps its lines before editing (standing rule 36).

- **Sign-in (`main/auth.js`, 426 lines).**
  - Providers: Microsoft through `@azure/msal-node` and Google through `googleapis`.
  - The client IDs are placeholders (`:14`, `:19-20` `"YOUR_…"`), so cloud sign-in has never worked in a real build.
  - Scopes are app-folder only (`:17`, `:22-26`).
  - The redirect is caught in an embedded `BrowserWindow` (`openAuthWindow` `:302-350`), with PKCE S256 (`:122-128`) and a CSRF state check (`:328`). Google and Apple expect the system browser instead (RFC 8252).
  - Tokens are encrypted with `safeStorage` into `auth-tokens.json` (`:73`, `:100-112`). When encryption is unavailable they are dropped silently (`:83`, `:104`).
  - Exports: `signIn`, `signOut`, `getAccessToken`, `getAuthState`, `onAuthRequired`, `initAuth` (`:419-426`).
- **Sync (`main/sync-engine.js`, 1148 lines; `main/sync-queue.js`, 227 lines).** Sync works on whole-file snapshots of `settings.json` (cross-device keys only), `library.json` (with tombstones), `history.json` and a manifest, written to the provider's hidden app folder.
  - **Library merge** (`mergeLibrary` `:253-365`):
    - A higher `doc.revision` wins.
    - The position takes the larger value (`Math.max`).
    - The highlights union targets a doc field that does not exist, so that branch is dead.
  - **Settings merge** (`mergeSettings` `:373-389`): reads `fieldTimestamps` that nothing writes, so it is effectively dead.
  - **What is never synced:** book files, highlights and notes.
  - **The queue** (`sync-queue.js`) records ops but is never replayed. Imports never enqueue.
  - **Lifecycle:**
    - Auto-sync runs on `setInterval` (`:952-960`), started at `main.js:611-615`.
    - The quit step runs a full `startSync()` inside the 3 s quit cap (`main.js:647`), followed by the "library after sync" flush (`main.js:648`, LL-159).
- **Cloud storage (`main/cloud-storage.js`, `cloud-onedrive.js`, `cloud-google.js`, `cloud-retry.js`).** These are sync-hub transports only (`approot` and `appDataFolder`); none of them imports books. The only book source today is the local `settings.sourceFolder` (`main/folder-watcher.js`, `main/folder-sync.js`).
- **Extension bridge (`main/ws-server.js`, 581 lines).** A loopback WebSocket on `127.0.0.1:48924/blurby` with short-code pairing.
  - `handleAddArticle` (`:304-429`) is a second library intake path: it converts the page to EPUB, then calls `addDocToLibrary`, `saveLibrary` and `broadcastLibrary`.
  - The pairing token is `settings._wsPairingToken`.
  - Three items in the post-freeze merge train edit this area: WS-TOKEN-REGEN-1, WS-PAIR-LOG-1 and LIBRARY-WRITE-RACE-1.
- **Library and import IPC.**
  - `main/ipc/library.js` `import-dropped-files` (`:245-357`):
    - It filters by `SUPPORTED_EXT` (`main/folder-watcher.js:9`, 13 extensions).
    - It copies the file into `sourceFolder` (or keeps it in place), extracts it, converts non-EPUB files to EPUB, and saves.
    - It enforces no limits and enqueues no sync op.
  - The renderer's `src/components/DropZone.tsx:3` allows only 8 of those 13 extensions. The two lists disagree.
  - `main/ipc/documents.js` `update-doc-progress` (`:15`) writes `position`, `cfi`, `modified`, `lastReadAt` and `revision`.
  - `main/ipc/cloud.js` registers 11 `cloud-*` channels and 2 push events; the matching preload methods are at `preload.js:132-133,153-162,198-203`.
  - The settings UI for the old sync is `src/components/settings/CloudSyncSettings.tsx`, plus `CloudSyncIndicator.tsx`.
- **Highlights and notes are files, not records.**
  - `save-highlight` (`main/ipc/reader.js:50-69`) appends markdown to `<sourceFolder or data>/Blurby Highlights.md`, and `get-all-highlights` (`:117-152`) parses it back.
  - Notes are `<data>/notes-{docId}.json` (`:167`), plus a regenerated `{title} — Reading Notes.docx`.
- **Data model.**
  - `BlurbyDoc` is defined in `src/types.ts:68-119`; `src/types.ts` is in the shared-core freeze set.
  - `coverPath`, `filepath` and `convertedEpubPath` are absolute local paths.
  - `CURRENT_SETTINGS_SCHEMA = 13` and `CURRENT_LIBRARY_SCHEMA = 6` (`main/migrations.js:6-7`).
  - Cross-device settings are picked by `pickUserSettings` (`:334`).
- **Nothing server-side exists.** There is no `server/` or `workers/` directory.

## Planner decisions (tier 1, technical; recorded here, adoptable by `/epic`)

| # | Decision | Why |
|---|---|---|
| T1 | **Server code lives in this repository under `server/`**, as its own package (TypeScript, ESM, its own `package.json`, `wrangler.jsonc` and Vitest config with `@cloudflare/vitest-pool-workers`). The desktop's `npm test` is unchanged; the server's suite is `npm --prefix server test`, plus its own CI job. A shared contract module, `server/src/contract/` (request/response types and validators), is imported by the server and copied into the desktop main process at build time as generated CommonJS (`main/server-contract.js`). | One review surface for API changes, without crossing the CommonJS/ESM boundary (CLAUDE.md standing rule). |
| T2 | **Stack:** Workers (Hono router) + D1 (one database per environment) + R2 (one private bucket per environment) + Queues (account deletion, R2 cleanup). Durable Objects only where a strict limit is needed (sign-in code and OTP rate limits). Environments are `staging` (staging.blrby.app) and `production` (blrby.app, api.blrby.app). | Matches the owner's hosting decision. D1's 10 GB per database is ample at launch (metadata only; book bytes live in R2). Splitting the database is a later, measured step (Pike rule 1). |
| T3 | **Sign-in:** Better Auth on Hono with D1 (Kysely adapter), handling Google, Microsoft, Apple and email (one-time code). The **Worker is the OAuth client for every provider**: provider secrets stay in Worker secrets, and the desktop holds no shared secret. The desktop flow is RFC 8252: it opens the system browser at `https://blrby.app/auth/start?challenge=<S256>&port=<loopback>`; after sign-in the Worker redirects to `http://127.0.0.1:<port>/cb?code=<one-time>`; the app exchanges the code plus its PKCE verifier for a session. The embedded `BrowserWindow` flow is deleted. Apple needs https return URLs, which this Worker hop provides. | Auth.js is in maintenance, Lucia is deprecated and OpenAuth is still beta (research 2026-10-23). The hosted options add a vendor and per-user cost for something Better Auth does on D1. |
| T4 | **Session storage on the desktop:** the session and refresh token are encrypted with `safeStorage`. When encryption is unavailable, the session lives in memory only, and the app says so once ("You'll need to sign in again next time"). Never in plaintext and never silently dropped. | Fixes the silent drop at `main/auth.js:83,104`, the same class as WS-PAIR-LOG-1. |
| T5 | **Isolation by construction:** every account-owned table carries `account_id`, and every query goes through a repository layer that takes the session's `accountId` as a required first argument (no raw `env.DB` outside `server/src/repo/`, enforced by a source-text test). Ids are random UUIDv4s, never content hashes or sequences. R2 keys are `a/<accountId>/<bookId>/<file>`. The bucket is never public. Downloads use presigned GET URLs with a 5-minute expiry, issued only after the ownership check. A request for another account's id returns 404, never 403, so ids cannot be probed. | Must-never #1 and frame 5. A guessed link fails three ways: the id is unguessable, the route checks ownership, and the R2 URL is short-lived and signed. |
| T6 | **Uploads go straight to R2.** The client asks `POST /v1/intake` for a reservation for the whole drop (counts, sizes, types). The server checks the plan limit for all of them in one D1 `batch()` transaction and either reserves every slot or refuses the whole drop. It returns one presigned PUT (or multipart part URLs) per file. The client uploads, then calls `POST /v1/books/{id}/finalize`, and the server checks the object's size, its SHA-256 and its magic bytes. Reservations not finalized within 24 h are released by a cron. | Frames 2 and 4 ("refused whole"). Worker body limits (100 MB on Free/Pro zones) never apply. A reservation stops two devices from overshooting the limit at once. |
| T7 | **What a book is on the server:** one record per book. It stores the original file plus the canonical reading EPUB the desktop produces at intake (`convertToEpub`, unchanged), and it counts as one book. Dedupe within an account is by the SHA-256 of the original; a duplicate drop reports "already in your library" and does not count twice. Covers are uploaded as a separate small object. Local absolute paths (`filepath`, `coverPath`, `convertedEpubPath`) become device-local cache fields and never sync. | Every device reads the same bytes, so a word index means the same word everywhere (LL-160). |
| T8 | **Sync model: ordered change log, not file snapshots.** Each change is an op `{opId (UUID), deviceId, kind, target, payload, changedAt}`. The client persists an op to a local journal (`sync-journal.json`, atomic, serialized writer) **before** applying it to its local state. The server applies ops idempotently by `opId` and gives each accepted op an account sequence number. Clients pull `GET /v1/changes?since=<seq>` (paged). Rules: positions and settings fields go to the most recent `changedAt` (owner rule), with ties broken by server sequence. Highlights, notes and reading sessions are records with their own ids, never merged by value: every device's records are kept, and a delete is a tombstone op. `changedAt` later than the server's receive time is clamped to the receive time, so a fast clock cannot win forever. | Must-never #2 and frame 3. It replaces the dead merge branches and the never-replayed queue. Paged pulls also remove the whole-library transfer the storyboard names. |
| T9 | **Position payload** is `{wordIndex, cfi, anchorText (≤ 12 words around the word), furthestWordIndex}`. A receiver that does not share the sender's word numbering lands by `cfi`, then by `anchorText`. | LL-160 and LL-161: the phone epics will run another runtime and ICU, so word indices alone are not portable. |
| T10 | **Highlights and notes become records** in a local `annotations.json` (per doc, each with an id), and that file is the authority. `Blurby Highlights.md` and the Reading Notes `.docx` become exports generated from the records, written only to `<data>` and never into `sourceFolder`. *(The look of the export is unchanged; whether it keeps being written automatically is open question Q4.)* | Today's markdown append cannot be synced without loss. |
| T11 | **The quit path never syncs over the network.** The "cloud sync" step at `main.js:647` becomes "journal flush": the journal and the debounced library save are drained (LL-157, LL-159), and the upload happens on next launch or reconnect. | A network call inside a 3 s cap either loses ops or blocks quit. The journal makes it safe to wait. |
| T12 | **Plan limits are server data**: a `plans` table (`free`, `plus`, `unlimited`) holding the storyboard's approved values, plus a per-account `plan_override` (the owner's account is permanently `unlimited`). Until Phase 3 every new account's plan is `unlimited` (storyboard assumption). The enforcement code is still built and tested in Phase 1 against `free` and `plus` fixtures. Values change through `wrangler d1 execute` on an audited admin script (`server/scripts/set-plan.ts`), never in code. | "Adjustable starting settings" (storyboard). |
| T13 | **Intake rules** (supported types) come from one shared list, `server/src/contract/fileTypes.ts`, which generates `main/server-contract.js`. `main/folder-watcher.js:9`, `DropZone.tsx:3` and the server all import it, which removes today's two-list disagreement. | Frame 2 ("unsupported types are named and refused"). |
| T14 | **Narrate usage**: the desktop records Narrate playback seconds per month locally, as journal ops (`narrate-usage`). The server adds them into a monthly balance. Offline use is allowed and reconciles later; a small overrun is accepted. | Frame 6; the storyboard says desktop minutes count. |
| T15 | **Account deletion** removes the account's D1 rows in one batch, then queues the R2 prefix `a/<accountId>/` for deletion, with retries until the prefix lists empty. The account is unusable from the first step. A test proves that after deletion every former id returns 404 and the prefix is empty. | Must-never #1 and frame 5. |

## Definition of Done — epic level (each phase adds its own rows below)

Commands name their shell and pass only on their exact exit code (standing rule 44). Every check script is first shown to record a failure (LL-151).

| # | Condition | Verify by | Expected evidence |
|---|---|---|---|
| E1 | Frame 1: page 120 on the computer opens at page 120 on a second signed-in device, with the same highlights and notes. | Phase 2 DoD row P2-D1 (two desktop profiles on two machines, owner-observed) | Owner pass recorded in state.md; the two-device test output |
| E2 | Frame 2: the drag-and-drop window works at onboarding and at any time; unsupported files are named and refused; a drop over the limit is refused whole, with upgrade or cancel, and nothing from it is added. | P1-D4 (server), P2-D3 (desktop) | Test output; owner pass recorded |
| E3 | Frame 3: offline highlights and position survive reconnect; the most recent position wins; every device's highlights are kept. | P2-D4 | Test output, including the kill-mid-write case |
| E4 | Frame 4: a sixth personal book on Free is blocked with upgrade, delete or cancel; Marketplace books are owned and never counted. | P1-D4, P2-D3; P3-D2 for the upgrade path | Test output; the test-mode purchase recorded |
| E5 | Frame 5 (must never): no account reaches another's books or data, even by a guessed link; deleting an account removes everything. | P1-D3 (route matrix), P1-D6 (deletion) | Matrix output, including its broken-route control exiting 1; the deletion test output |
| E6 | Frame 6: Narrate minutes count on every device; the reading page and Narrate never show ads. | P2-D6 (counting), P3-D4 (no ads on reading or Narrate surfaces) | Test output, including the injected-slot control exiting 1 |
| E7 | blrby.app publishes terms of use and a takedown contact before uploads open. | P1-D7 (the uploads flag cannot be turned on without them) | The gate test output; production `/terms` and `/takedown` returning 200 |
| E8 | Own-cloud sync is gone: `main/sync-engine.js`, `main/cloud-onedrive.js`, `main/cloud-google.js`, `main/cloud-storage.js`, `main/cloud-retry.js` and their IPC, preload and UI are deleted, with no dangling import. | P2-D7 | The census in the phase's first commit; the grep exits 1 (it exits 0 on the base) |
| E9 | Project gates: `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine; `npm --prefix server test` and `npm --prefix server run typecheck` exit 0 (LL-149). | Every phase | Exit 0 for each command, with the suite counts recorded |

## Constraints

- **Placement:** no phase opens before the Stage 8 release is published and the post-freeze merge train has landed, in particular the `main/ws-server.js` chain (WS-TOKEN-REGEN-1 → WS-PAIR-LOG-1 → LIBRARY-WRITE-RACE-1), RENAME-TMP-RACE-1 (sync-state and token saves) and LARGE-FOLDER-SYNC-3. Phase 1 is server-only and touches no desktop file, so it may open as soon as the release ships, in parallel with the train (Lane D, new files only).
- **Git (`policy.git` = push):** each phase P<n> works on `eb/blurby-server-1-p<n>`, cut from `origin/main` when the phase opens. The first commit ends with `BLURBY-SERVER-1-P<n>-Base: <sha>`, and the resume base comes from that trailer (LL-144). Stage exact paths only. Merge with `--no-ff` at the phase gate. Never force-push, rebase, reset, stash or clean (Rule 10).
- **Shared core:** Phase 2 edits `src/types.ts` (`BlurbyDoc` sync fields, the device-local path fields, annotation types). It needs a declared integration window, and no other sprint may edit `src/types.ts` while it is open. Phase 1 and Phase 4 touch no shared-core file.
- **Secrets:** no provider secret, R2 key or signing key ever ships in the desktop build or a committed file. Worker secrets go through `wrangler secret put`. CI holds a scoped Cloudflare API token for staging only. Production deploys are the owner's step.
- **Privacy:** server logs carry account ids and op kinds, never titles, text, highlights or note bodies (the diagnostics guardrail, applied to the server).
- **Register:** the run never writes the Notion register (LL-153).
- **Machines:** Phase 1 and the Phase 4 measurement are platform-neutral and may run in cloud sessions with a staging token. Phase 2 and Phase 3's desktop gates run in a local session on the owner's machine (LL-147).
- **Deadline:** none. The epic follows the Stage 8 release finish line.

## Non-goals (from the storyboard; not reopened)

- Blurby checking or judging uploads.
- Sharing between users.
- The phone apps and the browser extension themselves.
- Marketplace purchasing (Phase 1 only reserves the data shape: an `owned` book kind that never counts).
- A browser-based reader.
- Migrating existing local libraries: there are no users. The owner's own library is re-added by drag-and-drop.
- The Unlimited trial (a follow-up flag).
- Drive, OneDrive, Box, Dropbox and iCloud as book sources. CLOUD-CONNECTORS-1 is folded into this epic by the review, as a later phase it schedules. These four phases do not build it.

## Autonomy grants (the executor decides alone; log each in `state.md`)

- Module and file structure inside `server/`, route names under `/v1/`, the D1 schema and its migrations, and the test structure.
- The library choices within T2/T3. Swapping Better Auth needs a logged reason.
- Paging sizes, retry and backoff values, and expiry times (presign TTL 5 min, reservation 24 h). These live in constants files (the Constants Separation Rule), not in code.
- Merging a phase to `main` once its gate passes.

## Escalation triggers (STOP and surface to the owner)

- Any open question below that blocks the current phase.
- Gate G-P1: before the first production deploy (the owner provides the Cloudflare account access, domains and terms text).
- Gate G-P2: the two-device owner smoke (P2-D1).
- Gate G-P3: the payment provider and ad source choices (Q6, Q7), then a live test purchase.
- Gate G-P4: the Kokoro measurement verdict (P4-D1), and the MeloTTS conflict (Q9).
- A must-never row failing after one repair attempt.
- Any change to Page, Focus, Flow or Narrate runtime behaviour beyond the save and position calls named in Phase 2.

## Assumptions

| Assumption | Risk if wrong | Guard |
|---|---|---|
| A1 The owner's Cloudflare account can take Workers Paid ($5/mo), D1, R2, Queues and Containers on the blrby.app zone | Phase 1 cannot deploy | G-P1 checklist, first step |
| A2 Better Auth's D1 adapter supports the four providers and email OTP on Workers | T3 fails | P1 wave A starts with a staging spike that signs in with each provider. If one fails, the run logs it and swaps that provider's flow to Better Auth's generic OAuth plugin |
| A3 The canonical EPUB the desktop makes at intake is deterministic enough to read the same on every desktop | Positions drift between devices | T9 anchor fallback; P2-D1 checks by text (LL-161) |
| A4 Kokoro's producer (`main/narrate/capture.js` + `expose-durations.js`) runs in a linux/amd64 container under Node with `onnxruntime-node` | Phase 4 has nothing to measure | P4 wave A's first act; if it fails, report it as a harness repair, not an engine verdict (as in NARRATE-REBUILD-1, R2) |

## Lessons applied

| Lesson | Applied as |
|---|---|
| LL-006 / standing rule 3 — atomic JSON writes | The journal, `annotations.json` and the library cache go through `main/json-store.js` `writeJSON` |
| LL-157 — Electron does not wait for an async quit listener | T11: no network at quit; the journal drain runs in the cancelled quit |
| LL-159 — a flush must drain timer-armed writes | P2's quit step list names the journal's debounced write and the library save; a source-text test pins the list |
| LL-158 — trace a live row at the real data size | P2's sync rows are sized at 5,000 books and 50,000 ops, not 10 |
| LL-160, LL-161 — word numbering depends on the runtime; check words by text | T9; P2-D1 compares the landed word by text |
| LL-142 — a timing label is a declaration, not evidence | P4: server Kokoro must return the model's own durations, proven against the deployed image by hash; MeloTTS cannot (Q9) |
| LL-138 / standing rule 43 — positive controls | Every must-never test is first seen failing against a deliberately broken route or merge |
| LL-143 / standing rule 44 — dry-run gates, exact exit codes | Every DoD row names its shell and exit code |
| LL-151, LL-166 — prove a recorder can record failure and effect | The isolation matrix test fails on a route with the ownership check removed |
| LL-139 — cut deletions from an import census | P2's deletion of the sync engine starts from a resolved-import census |
| LL-150 — census selectors of deleted stylesheets | `CloudSyncSettings` CSS selectors are censused before deletion |
| LL-147 — owner-machine gates need a local session | Phase placement under Constraints |
| LL-149 — Done-when restates typecheck and build | Every phase's DoD |
| LL-146 / standing rule 52 — evidence named like a test is a test | Server fixtures and evidence are never `*.test.*` outside `server/test/` |
| LL-148 — a file never names its own merge | Merge shas go in state and close-out only |
| LL-153 / standing rule 46 — the run does not write the register | Constraints |
| LL-156 / standing rule 50 — waivers move with their code | The quit-flush tests (`tests/quitSequence.test.js`) are rewritten against the journal step, not waived |
| LL-165 — prove the profile before acting | Two-device smoke harnesses read back `userData` before signing in |
| LL-063 — never develop in a cloud-synced folder | `server/` builds and `.wrangler/` stay inside the worktree, outside Drive |

---

## Phase specifications

<!-- /epic's plan.md is phase-altitude (intent, exit gate, rough size). These specs are fuller at the owner's request; /epic derives plan.md from each phase's What and Done-when, and the task lists are pricing guidance, not a pre-built backlog. -->

### Phase 1 — Server foundation and plan limits

**What:** the Blurby server on Cloudflare: Workers + Hono, D1, R2 and Queues, in staging and production. It provides:
- accounts and sign-in (Google, Microsoft, Apple, email one-time code) with the desktop loopback handshake (T3);
- devices;
- books with direct-to-R2 intake reservations (T6, T7);
- the ordered change log (T8);
- plan limits as data (T12);
- account deletion (T15);
- the terms-of-use and takedown pages, with an `uploadsOpen` switch that needs them.

It ships no desktop change.

**Why:** everything else uses it. It is also the only phase that can run before the merge train lands, because it touches no desktop file.

**Done when:**

| # | Condition | Verify by (shell: bash in `server/`) |
|---|---|---|
| P1-D1 | Sign-in works on staging for Google, Microsoft, Apple and email code. The loopback handshake gives a session only to the holder of the PKCE verifier. A replayed or stale one-time code is refused. | `npm test -- auth` exits 0 (the handshake cases, each with a negative control). The owner signs in once per provider on staging through `server/scripts/loopback-client.mjs` (owner-observed, G-P1). |
| P1-D2 | Every route is declared in one route table, and the table matches the router. | `npm test -- routeTable` exits 0. A route added without a table entry makes it exit 1 (control). |
| P1-D3 | **Isolation matrix:** for every route that takes an id, account B's session on account A's id returns 404, and a presigned URL is never issued for it. List and change endpoints return none of A's records to B. | `npm test -- isolation` exits 0. The test runs over the whole route table. Control: with one route's ownership check removed, it exits 1. |
| P1-D4 | **Intake limits:** on `free`, a reservation for 6 personal books with 0 held is refused whole, and none is reserved. 5 held plus a drop of 1 is refused, with `{limit: 5, held: 5, requested: 1}`. A drop mixing supported and unsupported types names the unsupported files and refuses them. Two concurrent reservations cannot together exceed the limit. `owned` (Marketplace) books never count. Duplicates (same SHA-256) do not count twice. | `npm test -- intake` exits 0, including the concurrency case (two `batch()` calls in parallel against Miniflare's D1) |
| P1-D5 | **Change log:** ops are idempotent by `opId`. `since=` paging returns every op exactly once, in order. For positions and settings, the most recent `changedAt` wins, with clamping. Highlights, notes and sessions from two devices are all kept. A tombstone removes a record on every device. | `npm test -- changes` exits 0, with a 50,000-op fixture (LL-158) |
| P1-D6 | **Account deletion** leaves no D1 row with that `account_id`, and an empty R2 prefix. Former ids return 404. | `npm test -- deletion` exits 0 |
| P1-D7 | `uploadsOpen` cannot be true unless `/terms` and `/takedown` return 200 with the owner's text (no placeholder marker). While it is false, intake returns 503 "uploads not open yet". | `npm test -- uploadsGate` exits 0. Owner-observed on production at G-P1. |
| P1-D8 | The server's typecheck and suite pass; the desktop is untouched. | `npm --prefix server run typecheck` and `npm --prefix server test` exit 0; `git diff --name-only <base>... -- ':!server' ':!.github/workflows' ':!docs'` prints nothing |
| P1-D9 | A staging deploy from CI and a production deploy by the owner both serve `GET /v1/health`, with the build sha. | CI job log; the owner's curl at G-P1 |

**Edit sites (all new):**
- `server/package.json`, `server/wrangler.jsonc`, `server/tsconfig.json`, `server/vitest.config.ts`;
- `server/src/index.ts` (Hono app), `server/src/routes/{auth,devices,books,intake,changes,account,legal}.ts`, `server/src/routeTable.ts`;
- `server/src/repo/*.ts` (the only `env.DB` users, T5), `server/src/auth/` (Better Auth config, loopback handshake);
- `server/src/contract/` (types, validators, `fileTypes.ts`), `server/src/limits.ts`;
- `server/migrations/0001_init.sql` (accounts, sessions, devices, plans, books, reservations, ops, annotations, usage);
- `server/scripts/{set-plan.ts,loopback-client.mjs}`, `server/test/**`;
- `.github/workflows/ci.yml`: a `server` job (typecheck, test, staging deploy on `main` only).

**Tests:** under `server/test/`, run by `@cloudflare/vitest-pool-workers` (real D1, R2 and Queues in Miniflare):
- `auth.handshake.test.ts`
- `routeTable.test.ts`
- `isolation.matrix.test.ts`
- `intake.limits.test.ts`
- `changes.log.test.ts`
- `account.deletion.test.ts`
- `uploadsGate.test.ts`
- `repo.boundary.test.ts`: a source-text test; no `env.DB` outside `src/repo/`.

Each has a deliberately broken control, first seen failing (standing rule 43).

**Failure handling:**
- A provider that cannot be made to work on Better Auth: log it, use the generic OAuth plugin for it, and keep the other three moving. Two failed attempts → BLOCKER(USER).
- A D1 `batch()` that cannot hold the reservation atomically: move reservations to a per-account Durable Object (T2's exception path), and log it.
- A failed staging deploy never blocks the merge of tested code. A failed production deploy is the owner's, at G-P1.

**Task list:**

| # | Task | Class | Kind | Tier | Effort | Estimate | Group |
|---|---|---|---|---|---|---|---|
| 1 | Scaffold `server/` (Hono, D1/R2/Queues bindings, Vitest pool, CI job) and baseline green | calculable | scaffold | bounded | medium | 1h30m | — |
| 2 | Better Auth on D1 with four providers on staging; loopback handshake; spike result logged (A2) | investigative | auth | cross-cutting | high | 4h | — |
| 3 | Schema and repository layer; route table; isolation matrix with control | calculable | data + security | cross-cutting | high | 3h | — |
| 4 | Intake reservations, presigned PUT/GET, finalize checks, dedupe, cron release; limits from `plans` | calculable | feature | cross-cutting | high | 3h30m | — |
| 5 | Change log: ops, sequence, paging, LWW with clamping, record kinds, tombstones; 50k fixture | calculable | sync core | cross-cutting | high | 3h | — |
| 6 | Account deletion through Queues; legal pages; `uploadsOpen` gate | calculable | feature | bounded | medium | 2h | — |
| 7 | Spec compliance and code quality reviews (parallel, read-only) | calculable | review | bounded | medium | 40m | R |
| 8 | G-P1: owner deploys to production, signs in with each provider, publishes terms and takedown text | calculable | owner gate | mechanical | low | 30m (+ owner) | R |

**Lessons applied:** LL-138, LL-143, LL-151 (every test has a control); LL-158 (50k-op fixture); LL-146 (no `*.test.*` outside `server/test/`); LL-149 (typecheck row); LL-153.

---

### Phase 2 — Desktop sign-in, drag-and-drop, sync and offline books

**What:**
- **Sign-in:** the desktop requires an account. The first launch shows sign-in (Google, Microsoft, Apple, email) through the system browser (T3). Later launches use the stored session, offline too (T4).
- **Drag-and-drop window:** the onboarding drag-and-drop window, reachable at any time from the library, does the intake (T6, T7). It refuses unsupported types by name. It refuses an over-limit drop whole, with Upgrade and Cancel. Before Phase 3, Upgrade opens the plans page on blrby.app. The extension's `add-article` goes through the same intake as an article.
- **Sync:** the old own-cloud sync is deleted, and the journal and change-log client replaces it (T8–T11).
- **Highlights and notes:** they become synced records (T10).
- **Offline books:** books download for offline reading, and position and annotation changes made offline sync on reconnect.

**Why:** this is the owner's outcome ("one library on every device"), delivered on the only client that exists today.

**Done when:**

| # | Condition | Verify by |
|---|---|---|
| P2-D1 | Frame 1 on two machines, signed in to one staging account: read to a page in a book on machine A and close it; machine B opens that book on the same word (checked by text, LL-161), with A's highlights and notes. | Owner-observed at G-P2 on production builds of both machines (standing rule 45), plus `tests/serverSync.twoDevice.test.js` (two in-process clients against a Miniflare server) exits 0 |
| P2-D2 | Sign-in: the system browser opens, the loopback receives the code, and the session is stored encrypted. When `safeStorage` is unavailable, the session lives in memory and the notice shows once. No embedded auth window remains. | `npx vitest run tests/serverAuth.test.js` exits 0; `git grep -n "openAuthWindow" -- main src` exits 1 (on the base it finds `main/auth.js`, exit 0) |
| P2-D3 | Frame 2 and frame 4 on the desktop: the window shows at the first signed-in launch and from the library at any time. Unsupported files are listed by name and refused. A Free-fixture drop over the limit adds nothing and offers Upgrade or Cancel. A sixth book on Free offers Upgrade, Delete or Cancel. Nothing already uploaded changes. `ws-server` articles go through the same intake. | `npx vitest run tests/intakeWindow.test.tsx tests/intakeService.test.js` exits 0; owner-observed at G-P2 |
| P2-D4 | Frame 3: offline, two highlights and a new position are journaled before they are applied. On reconnect they upload exactly once. If another device moved the position in the meantime, the most recent change wins, and both devices' highlights are kept. | `npx vitest run tests/syncJournal.test.js tests/serverSync.twoDevice.test.js` exits 0, including a kill-mid-write case (the journal is read back after a simulated crash) |
| P2-D5 | Quit drains the journal and library writes and makes no network call (T11, LL-157, LL-159). | The rewritten `tests/quitSequence.test.js` exits 0. Its source-text check lists every deferred writer, and it fails when one is removed (control). |
| P2-D6 | Narrate playback seconds are journaled as `narrate-usage` and appear in the server's monthly balance. The reading page and Narrate show no ad surface (structural test). | `npx vitest run tests/narrateUsage.test.js` exits 0 |
| P2-D7 | E8: the old sync is deleted without dangling imports. The supported-type lists are one list. | Import census (LL-139) committed in the phase's first commit. `git grep -n -e sync-engine -e cloud-onedrive -e cloud-google -e cloud-storage -e cloud-retry -- main src preload.js main.js` exits 1 (on the base it finds them, exit 0). `npx vitest run tests/fileTypesSingleSource.test.js` exits 0. |
| P2-D8 | Large library: 5,000 books list, page and open without the whole library being sent on every save. The first sync of 5,000 books completes. | `npx vitest run tests/serverSync.scale.test.js` exits 0 (LL-158) |
| P2-D9 | Project gates on the owner's machine | `npm test`, `npm run typecheck` and `npm run build` exit 0 (pwsh) |

**Edit sites (re-grep before editing; anchors @ `ac9dc539`):**
- **Rewritten:** `main/auth.js`. The whole file becomes the system-browser and loopback client for blrby.app; provider SDK code goes. `msal-node` and `googleapis` leave `package.json` unless CLOUD-CONNECTORS-1 still needs them.
- **Deleted:** `main/sync-engine.js`, `main/cloud-storage.js`, `main/cloud-onedrive.js`, `main/cloud-google.js`, `main/cloud-retry.js`, and their tests: `tests/sync-hardening.test.js`, `tests/cloudGoogle.test.js`, `tests/cloudOnedrive.test.js`, `tests/cloudRetry.test.js`, and the cloud cases in `tests/fileHashesCleanup.test.ts`.
- **Mocks to edit:** `tests/epub-2b-pipeline.test.js`, `tests/pdfLoadDocContent.test.js`, `tests/hotfix14.test.ts` and `tests/author-normalize.test.ts` mock these modules.
- **`main/sync-queue.js` becomes the journal:** `main/sync-journal.js` (op persistence, replay, `deviceId` kept from `sync-queue.js:26`).
- **New:** `main/server-client.js` (fetch, auth refresh, paging, presign upload/download), `main/server-sync.js` (pull/push loop, apply ops to the library, settings, history and annotations), `main/intake.js` (one intake service used by `import-dropped-files`, `ws-server.js` `handleAddArticle` and the window), `main/annotations.js`, and `main/server-contract.js` (generated, T1).
- **`main/ipc/cloud.js`** becomes `main/ipc/account.js`: sign-in, sign-out, account state, plan and usage, devices, delete account. Push events: `account-state-changed`, `sync-status-changed`.
- **`main/ipc/library.js`:** `import-dropped-files` (`:245-357`) calls `main/intake.js`; `delete-doc` (`:92`) and `add-manual-doc` (`:71`) emit journal ops.
- **`main/ipc/documents.js`:** `update-doc-progress` (`:15`) and `reset-progress` (`:35`) emit position ops with the T9 payload.
- **`main/ipc/reader.js`:** `save-highlight` (`:50-69`), `get-all-highlights` (`:117-152`) and `save-reading-note` (`:158`) use `main/annotations.js`; the markdown and docx become exports (T10, Q4).
- **`main/ipc/state.js:47-50`:** settings ops.
- **`main/ws-server.js`:** `handleAddArticle` (`:304-429`) uses `main/intake.js`, after the WS chain in the merge train.
- **`main/migrations.js`:** library schema 7 adds the server id, device-local path fields and download state, and drops `syncContent`, `contentHash`, `deletedBy` and `deletedAtTimestamp`. Settings schema 14 drops `syncIntervalMinutes` and `syncOnMeteredConnection` from `SETTINGS_DEFAULTS` (`:299-321`). Tests: `tests/migrations.test.js`.
- **`main.js`:** startup at `:510`, `:538-543` and `:611-615` (auth init, then the sign-in gate, then sync start); the quit steps at `:647-648` become the journal flush (T11).
- **`main/folder-watcher.js:9`** imports the shared type list.
- **`preload.js`:** remove `:132-133`, `:153-162` and `:198-203`; add the `account*`, `intake*` and `onSyncStatus` methods. Three-way contract with `src/types.ts:301-366` (LL-106).
- **Renderer:**
  - New: `src/components/IntakeWindow.tsx`.
  - `src/components/DropZone.tsx:3` uses the shared list.
  - `src/components/OnboardingOverlay.tsx` gets the sign-in and intake steps.
  - New: `src/components/SignInScreen.tsx`.
  - `src/components/settings/CloudSyncSettings.tsx` is replaced by `AccountSettings.tsx` (account, plan, usage, devices, sign out, delete account); mounted at `SettingsMenu.tsx:9,76`.
  - `CloudSyncIndicator.tsx` (mounted at `LibraryView.tsx:13,419`) reads the new sync status.
  - `LibraryContainer.tsx:159-162` and `:516-523`: the auth-required toast and drop handling.
  - Styles in `src/styles/*.css` (no inline styles).
- **Shared core:** `src/types.ts:68-119` (`BlurbyDoc`) and the settings types. This needs a declared integration window.

**Tests (new, full paths):**
- `tests/serverAuth.test.js`
- `tests/syncJournal.test.js`
- `tests/serverSync.twoDevice.test.js`
- `tests/serverSync.scale.test.js`
- `tests/intakeService.test.js`
- `tests/intakeWindow.test.tsx`
- `tests/annotations.test.js`
- `tests/narrateUsage.test.js`
- `tests/fileTypesSingleSource.test.js`

Rewritten: `tests/quitSequence.test.js`, `tests/auth.test.js`, `tests/sync-queue.test.js` (→ journal), `tests/highlights.test.js`, `tests/notes-reading-log.test.js`, `tests/ws-server.test.js` (the add-article intake), `tests/migrations.test.js`. Each behaviour change gets a positive control first (standing rule 43).

**Failure handling:**
- **Server unreachable:** the app reads, highlights and notes from cache, and the journal grows. Intake is refused while offline ("Adding books needs a connection"), because the limit check is server-side.
- **Session expired offline:** the app keeps reading. On reconnect it asks for sign-in and keeps the journal; ops upload after sign-in to the same account. A different account → the journal is kept aside and the user is asked to sign in to the original account or discard it (an explicit choice, never silent).
- **Partial upload:** the reservation stays until finalize or expiry, and the window shows a per-file retry. A failed finalize hash → the file is re-uploaded once, then reported.
- **Journal corruption:** read the `.bak` (as `loadState` does at `main.js:274-292`), quarantine the bad file, and report it. Never drop ops silently.
- **Interrupted phase run:** resume from the base trailer (LL-144). Waves (standing rule 10): A = the server client, journal and auth; B = intake and the window; C = deletion of the old sync, migrations and the renderer settings; D = verification, the owner smoke and docs.

**Task list:**

| # | Task | Class | Kind | Tier | Effort | Estimate | Group |
|---|---|---|---|---|---|---|---|
| 1 | Import census of the sync, cloud and auth modules; base gates measured; positive-control tests committed failing | calculable | census + controls | bounded | medium | 1h30m | — |
| 2 | Wave A: `server-client.js`, `sync-journal.js`, `server-sync.js`, rewritten `auth.js` (system browser + loopback), T4 storage | calculable | sync client | cross-cutting | high | 6h | — |
| 3 | Wave A: annotations as records; position payload T9; settings and history ops | calculable | data model | cross-cutting | high | 3h | — |
| 4 | Wave B: `intake.js` shared by drop, extension and window; `IntakeWindow`, `SignInScreen`, onboarding steps | calculable | feature + UI | cross-cutting | high | 5h | — |
| 5 | Wave C: delete the old sync stack and its IPC, preload and UI; migrations (library 7, settings 14); `AccountSettings` | calculable | removal + migration | cross-cutting | high | 4h | — |
| 6 | Wave C: quit path rewrite (T11) with source-text pin | calculable | lifecycle | bounded | medium | 1h30m | — |
| 7 | Wave D: full gates; scale test; spec and quality reviews (parallel) | calculable | verify | bounded | medium | 2h | R |
| 8 | G-P2: owner two-machine smoke on production builds (frames 1–4) | calculable | owner smoke | mechanical | low | 45m (+ owner) | R |

**Lessons applied:** LL-157 and LL-159 (T11, P2-D5); LL-139 and LL-150 (census before deletion); LL-106 (preload three-way contract); LL-121 (normalize at ingress: migrations, not runtime aliases); LL-160 and LL-161 (T9, P2-D1); LL-158 (P2-D8); LL-147 (local session); LL-141 (owner-observed rows named up front); LL-165 (the smoke harness proves its profile); LL-156 (quit-test waivers move with the code); LL-006.

---

### Phase 3 — Payments and ads

**What:**
- **Plans become real:** new accounts start on Free.
- **Payments:**
  - Plus ($4.99/mo, $49/yr) and Unlimited ($9.99/mo, $99/yr) are bought through a hosted checkout in the system browser.
  - The payment provider's webhooks set the account's plan.
  - The desktop shows the plan and usage, with Upgrade and Manage.
  - Over-limit states follow Q5.
- **Ads (Free only):** a sponsor or house ad slot in the library and between books, served by the Worker, never on the reading page or in Narrate.
- **Narrate time is enforced** at the plan's monthly limit (Q8).

**Why:** the plans the owner approved. It is placed after Phase 2, so payments are never the first thing built (storyboard).

**Done when:**

| # | Condition | Verify by |
|---|---|---|
| P3-D1 | Webhooks are verified on the raw body and processed idempotently. Plan changes apply within one sync. A forged or replayed webhook changes nothing. | `npm --prefix server test -- billing` exits 0 (forged-signature and replay controls) |
| P3-D2 | Frame 4's Upgrade path: an over-limit drop → Upgrade → test-mode checkout → the plan becomes Plus, and the same drop then succeeds. Cancel adds nothing. | Owner-observed in the provider's test mode at G-P3, plus `tests/planUpgrade.test.js` exits 0 |
| P3-D3 | Downgrade and lapse follow the owner's Q5 ruling. Nothing is deleted without the user choosing it. | `npm --prefix server test -- downgrade` exits 0 |
| P3-D4 | Must-never #3: no ad element can render on the reading surfaces (Page, Focus, Flow, Narrate) on any plan. Plus and Unlimited render no ad element anywhere. | `npx vitest run tests/adPlacement.test.tsx` exits 0. The structural test enumerates the reader components; control: an ad slot injected into `ReaderContainer`'s tree makes it exit 1. |
| P3-D5 | The Narrate limit stops at the limit as Q8 rules, and shows upgrade or cancel. The owner's account is never limited. | `npx vitest run tests/narrateLimit.test.js` exits 0 |
| P3-D6 | Project gates: desktop `npm test`, `typecheck` and `build`; server `typecheck` and `test` | exit 0 each |

**Edit sites:**
- Server (new): `server/src/routes/billing.ts`, `server/src/billing/<provider>.ts`, `server/src/routes/ads.ts`, and `server/migrations/0002_billing.sql` (subscriptions, ad inventory).
- Desktop: `src/components/settings/AccountSettings.tsx` (plan, Upgrade, Manage), `src/components/IntakeWindow.tsx` (Upgrade wiring), a new `src/components/AdSlot.tsx` (mounted only in `LibraryView.tsx` and the between-books surface), and `main/ipc/account.js` (open checkout or portal in the system browser through `shell.openExternal` on an allow-listed blrby.app URL).
- Narrate enforcement: the usage check at the Narrate runtime's Play entry (`src/reader/modes/narrate/`). The Narrate runtime is touched only at its start gate (isolation rule).

**Tests:** `server/test/billing.webhooks.test.ts`, `server/test/downgrade.test.ts`, `tests/planUpgrade.test.js`, `tests/adPlacement.test.tsx`, `tests/narrateLimit.test.js`.

**Failure handling:**
- A webhook outage → the plan is reconciled hourly from the provider's API (cron).
- A provider outage → existing plans keep working, and checkout shows "try again later".
- An ad source outage → the slot collapses, never blank-boxes.
- Webhooks go through a dead-letter queue with alerts to the owner.

**Task list:**

| # | Task | Class | Kind | Tier | Effort | Estimate | Group |
|---|---|---|---|---|---|---|---|
| 1 | G-P3a: owner rulings Q5–Q8; provider account in test mode | calculable | owner gate | mechanical | low | 20m (+ owner) | — |
| 2 | Billing: checkout, portal, webhooks, reconcile cron, plan application | calculable | payments | cross-cutting | high | 5h | — |
| 3 | Downgrade and lapse rules (Q5) | calculable | feature | bounded | medium | 2h | — |
| 4 | Ad slot and serving route; placement structural test | calculable | feature | bounded | medium | 2h30m | — |
| 5 | Narrate limit at Play (Q8) | calculable | feature | bounded | medium | 1h30m | — |
| 6 | Reviews (parallel); G-P3b live test-mode purchase by the owner | calculable | review + owner | bounded | medium | 1h (+ owner) | R |

**Lessons applied:** LL-138 (forged and replayed controls); LL-151 (the ad placement test fails on an injected slot); LL-141 (owner-observed purchase); LL-149.

---

### Phase 4 — Server narration (the Kokoro speed-and-cost test, then hosting; MeloTTS fallback)

**What:**
- **4a, measure.** Package the existing Narrate producer (`main/narrate/capture.js`, `expose-durations.js`, `normalize.js`, `wordmap.js`, `chunker.js`; Kokoro q4 plus the exposed durations) in a linux/amd64 Cloudflare Container. Measure its speed and cost per audio hour on standard-2, standard-3 and standard-4 (CPU only; Containers have no GPU, research 2026-10-23). Report against fixed thresholds.
- **4b, host.** If 4a passes, serve `POST /v1/narrate/chunk` from the Worker through a Container class. It returns audio plus the model's own durations, with provenance, and fails closed exactly as the desktop does (F4). Usage counts against the plan.
- **MeloTTS:** the fallback is gated by Q9, because MeloTTS returns no word timing.

**Why:** tablets and phones get Narrate from the server (frame 6). The owner's decision is desktop first, with server narration later and measured first.

**Done when:**

| # | Condition | Verify by |
|---|---|---|
| P4-D1 | **4a verdict:** the container image's model and durations-exposed copy hash-match the desktop's pinned artefacts. The durations output is present and used on the production path (LL-142). Each instance type reports real-time factor, cold start to first voiced sample, warm first-chunk latency, and cost per audio hour, with the worst case reported, never a mean. The verdict is PASS only if every threshold in Q10 is met. | `server/narrate/measure.mjs` summary exits 0 on PASS and 1 on FAIL. Control: a container with the durations output stripped exits 1. The evidence is `docs/studies/blurby-server-1/phase4/VERDICT.md`. |
| P4-D2 | **4b:** the server's word table for the gate corpus is identical to the desktop producer's for the same text, voice and rate (same model bytes). Missing or mismatched durations fail closed. | `npm --prefix server test -- narrate` exits 0 (an identity check against tables the desktop produced, plus negative controls) |
| P4-D3 | Usage is counted from audio actually served. Cold instances sleep after `sleepAfter`, and idle cost is zero. | `npm --prefix server test -- narrateUsage` exits 0; the billing dashboard is checked at G-P4 |
| P4-D4 | The fallback behaves as the owner's Q9 ruling says. Under no ruling is an estimated table labelled exact. | `npm --prefix server test -- narrateFallback` exits 0 |

**Edit sites:**
- New: `server/narrate/Dockerfile`, `server/narrate/server.mjs` (an HTTP wrapper over the producer), `server/narrate/measure.mjs`, `server/src/routes/narrate.ts`, a Container class in `server/src/narrate/container.ts`, and `wrangler.jsonc` `containers` with `max_instances`.
- The desktop producer files are **read and copied at build time**, never forked: `server/narrate/sync-producer.mjs` copies `main/narrate/*.js` into the image, and a test asserts the copies are byte-identical.

**Tests:** `server/test/narrate.identity.test.ts`, `server/test/narrate.failClosed.test.ts`, `server/test/narrate.usage.test.ts`, `server/test/narrate.fallback.test.ts`. Measurement scripts are not `*.test.*` (LL-146).

**Failure handling:**
- The producer cannot run in the container (A4): repair it as a harness problem, twice, then BLOCKER(USER).
- 4a FAIL: stop and report. Server narration goes back to the owner with the measured numbers, and the options in Q9.
- Kokoro's licence (Apache-2.0) and the voice files' terms are re-checked before hosting.

**Task list:**

| # | Task | Class | Kind | Tier | Effort | Estimate | Group |
|---|---|---|---|---|---|---|---|
| 1 | Container image with the copied producer; hash checks; durations present (A4, LL-142) | investigative | harness | cross-cutting | high | 4h | — |
| 2 | Measurement harness and runs on standard-2/3/4; VERDICT.md | investigative | measurement | bounded | high | 3h | — |
| 3 | G-P4: owner reads the verdict; Q9 and Q10 confirmed | calculable | owner gate | mechanical | low | 20m (+ owner) | — |
| 4 | 4b route, Container class, fail-closed, identity test, usage | calculable | feature | cross-cutting | high | 4h | — |
| 5 | Reviews (parallel) | calculable | review | bounded | medium | 40m | R |

**Lessons applied:** LL-142 (provenance from the model's actual output; durations proven against the image by hash); LL-151 (a stripped-durations control); LL-162 (sweep the whole gate corpus, not samples); LL-160 (the identity test compares by text and table, not by index under another ICU); standing rule 38's successor (no hand-tuned lag).

---

## Open questions for the owner (each with a recommendation)

| # | Question | Tier | Recommendation | Blocks |
|---|---|---|---|---|
| Q1 | **Largest single file accepted?** | 3 | 200 MB per file. It covers illustrated EPUBs and most PDFs; larger files are refused by name with the limit shown. | P1 task 4 |
| Q2 | **What happens to the watched source folder (`sourceFolder`) once accounts exist?** Today it auto-imports, and the owner keeps it cleared. | 3 | Retire it as an intake path in Phase 2: drag-and-drop is the only way books come in (the owner's direction). Drive and OneDrive sources return with CLOUD-CONNECTORS-1, each import going through the same limits. | P2 wave C |
| Q3 | **The fourth device on Free (limit 3).** | 3 | Sign-in on the fourth device shows the three devices with "Remove one" or "Upgrade", or Cancel, mirroring the drop refusal. | P2 task 4 |
| Q4 | **Highlights markdown and Reading Notes `.docx`:** keep writing them automatically, or make them an Export action? | 2 | Make them an Export button (library and book menu). Auto-writing into a synced folder caused today's file sprawl, and records are now the authority (T10). | P2 task 3 |
| Q5 | **Downgrade or lapsed payment with more books than the new plan allows.** | 3 | Nothing is deleted or hidden. All books stay readable and downloadable, and new uploads are blocked until the count is under the limit, with "Remove books or upgrade". This matches the trial follow-up's wording. | P3 task 3 |
| Q6 | **Payment provider.** Stripe (2.9% + 30¢; Blurby files sales tax itself, or uses Stripe Tax at 0.5%) or a merchant of record (Paddle at 5% + 50¢, or Stripe Managed Payments at +3.5%) that handles global tax. | 3 (business and legal) | A merchant of record (Paddle or Stripe Managed Payments) for launch. At $4.99 the fee difference is about 15¢ a month, and it removes sales-tax and VAT registration across countries. | P3 |
| Q7 | **Ad source.** AdSense forbids ads in software applications, and AdMob has no desktop SDK (research 2026-10-23). | 3 | House ads and directly sold sponsor slots served by the Worker (for example Blurby's own Plus upsell and Marketplace titles), with an ad network only after a desktop-compatible one is confirmed in writing. | P3 task 4 |
| Q8 | **At the Narrate monthly limit.** | 3 | Narrate finishes the current sentence, pauses, and shows "Narrate time for this month is used up" with Upgrade or Cancel. The balance resets on the 1st, and remaining time shows in Account settings. | P3 task 5 |
| Q9 | **The MeloTTS fallback conflicts with Narrate's core rule** (the cursor is the word at the playing sample, from an exact table, with no estimated timing). MeloTTS and Aura return MP3 only, with no word timing. This does not reopen the decision; the plan needs the owner's reading of it. | 3 | Keep the decision's intent (an affordable fallback), but do not use MeloTTS for Narrate's word-following cursor. If Kokoro fails 4a, the fallback is a short bake-off of engines that expose predicted durations and can run on CPU (for example Piper or a smaller Kokoro quantization), measured against the same thresholds. MeloTTS stays available only if the owner wants a separate audio-only listening feature with no word cursor. | P4 task 3 |
| Q10 | **Phase 4 pass thresholds.** | 2 | Real-time factor ≥ 3× on the chosen instance. Warm request to first voiced sample ≤ 2.5 s (the desktop's mainstream budget, D6 of NARRATE-REBUILD-1). Cold start to first voiced sample ≤ 8 s. Cost ≤ 5¢ per audio hour at the measured factor. At 5¢, a 100-hour Unlimited user costs $5 a month against $9.99. | P4 task 2 |
| Q11 | **When Phase 4b is hosted.** No tablet or phone client exists until the phone epics. | 2 | Run 4a (the measurement) right after Phase 3 so the numbers are known. Build 4b when the first phone epic reaches its Narrate phase, so containers are never paid for with no client. | Placement |

## Roadmap placement (recommendation for `/roadmap-review`)

`Placement: after the Stage 8 release and the post-freeze merge train (2026-10-23 plan, steps 1–2), ahead of the rest of Stage 9 — Path: epic; Lane: Platform & Maintenance (primary), Library & Content (secondary); no declared deadline.`

- **Order inside the epic:** P1 → P2 → P3 → P4a → (P4b with the first phone epic, Q11).
- **P1 can overlap the merge train**, because it is server-only and edits no desktop file.
- **P2 needs** the WS chain, RENAME-TMP-RACE-1 and LARGE-FOLDER-SYNC-3 merged, and a declared `src/types.ts` integration window.
- **It runs before APP-TABS-1.** APP-TABS-1 then builds Newsroom on accounts and per-tab limits. The server's `kind` field already separates books and articles, so Newsroom's limits slot in.
- **Impact actions are the storyboard's, unchanged:** fold CLOUD-CONNECTORS-1 and the Cloud Sync lane in; mark LARGE-FOLDER-SYNC-1's design half superseded; add accounts and per-tab limits to APP-TABS-1, RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1; point ANDROID-APP-1's and IOS-APP-1's sync dependency here.
- **Two findings for the review:**
  1. WS-TOKEN-REGEN-1 already covers the extension-token regeneration bug the code map re-found (`main/ipc/misc.js:417-426`).
  2. P2 deletes the dead `stagingUpload` code, the unused constants (`CONTENT_SIZE_LIMIT`, `COVER_MAX_BYTES`) and the unwired `cloudDownloadDocContent`, so no separate cleanup item is needed.

## External prerequisites (owner actions, by phase)

- **P1:**
  - Cloudflare Workers Paid ($5/mo) on the blrby.app account, with R2, D1 and Queues enabled.
  - Google Cloud OAuth client (web).
  - Microsoft Entra app registration.
  - Apple Developer Program (about $99/yr; Services ID, domain verification, the private-relay email domain).
  - The email-sending domain (Cloudflare Email Sending is in public beta; SPF and DKIM on blrby.app).
  - Terms-of-use and takedown text, and the takedown contact address.
- **P3:** a payment provider account (Q6) and the ad source (Q7).
- **P4:** Containers enabled on the account (GA since 2026-04-13), and a spending alert.

## Research behind the technical choices (2026-10-23; third-party figures to re-check before launch)

- **Workers:** CPU limit up to 5 min per request; the request body limit is set by the zone's plan (100 MB on Free/Pro).
- **D1:** 10 GB per database; `batch()` is one transaction; foreign keys enforced; Time Travel 30 days.
- **R2:** presigned SigV4 URLs, up to 7 days; zero egress; $0.015/GB-month.
- **Containers:** GA 2026-04-13; up to 4 vCPU and 12 GiB; no GPU; 1–3 s cold start; `sleepAfter` scale to zero.
- **Workers AI:** MeloTTS $0.000205 per audio minute, MP3 only, no word timestamps; Aura MPEG only.
- **Auth:** Better Auth runs on Hono and D1. Auth.js is in maintenance. Lucia is deprecated. OpenAuth is still beta.
- **Payments and ads:** AdSense forbids software apps.

Sources: developers.cloudflare.com (Workers limits and pricing, D1 limits, R2 pricing and presigned URLs, Containers pricing, limits and changelog 2026-04-13, Workers AI MeloTTS and Aura), better-auth.com, RFC 8252 and Google's native-app OAuth guide, Apple's Sign in with Apple configuration docs, stripe.com/pricing, and support.google.com/adsense/answer/48182.
