# Held Plan — One library on every device (blrby.app server)

<!-- virtuoso-held-plan v1 -->

- **Entry:** 2026-10-23-blurby-server
- **Size:** epic-scale
- **Origin:** storyboard 2026-10-23. The owner directed a shift to a Blurby server so access isn't tied to one device. It came up while deciding LARGE-FOLDER-SYNC-1's design half, and it reshapes Stage 9, so it needed aligning before the next review.

## Trail

| Date | State | By | Note |
|---|---|---|---|
| 2026-10-23 | storyboarded | storyboard | aligned; epic-scale; 1 item (BLURBY-SERVER-1, provisional); 4 phases |
| 2026-10-23 | planned | write-plan | epic-scale: 4 phase specs written as an epic charter draft beside the entry (`2026-10-23-blurby-server/charter-draft.md`); 11 owner questions with recommendations; prerequisites pending: Stage 8 release, post-freeze merge train |
| 2026-10-23 | storyboarded | write-plan | epic-scale stays held (corrects the hand-written planned row above): 4 phase specs as an epic charter draft at 2026-10-23-blurby-server/charter-draft.md for /roadmap-review then /epic; 11 owner questions |
| 2026-10-23 | storyboarded | write-plan | owner rulings 2026-10-23 folded into the alignment record: server narration Kokoro only (MeloTTS dropped); no desktop ads for now; Q1-Q8, Q10, Q11 as recommended; charter draft updated; 0 open questions |
| 2026-10-23 | absorbed | roadmap-review | as BLURBY-SERVER-1 (queued, Path: epic, Seq 97) |

## Storyboard

### Alignment record

**Outcome:** a reader signs in to blrby.app on a computer, tablet or phone and sees the same books, reading positions, highlights, notes and settings. The Blurby server is the hub.

**Why now:** the owner's direction (2026-10-23) is to "remove barriers to access between devices". The phone apps, Newsroom, Podcasts and the browser extension (Stage 9) all assume cross-device sync. It also replaces the local large-folder problem (120,000 EPUBs in one Drive folder) with paged, searchable server queries, instead of `broadcastLibrary` sending the whole library on every save.

**Done looks like:** reading on one device and opening the same book on another lands at the same place, with the same highlights and notes. Books are added through a drag-and-drop window, and plan limits apply.

**Must never happen:**
- one account's books, notes or data reachable by another account, including through a guessed link;
- a position, highlight or note lost in sync;
- ads on the reading page or during Narrate, on any plan.

**Out of scope:**
- Blurby checking or judging what users upload;
- sharing between users;
- the phone apps and the browser extension themselves (their own epics, which use this server);
- Marketplace purchasing;
- a browser-based reader;
- migrating existing local libraries (the app isn't live; there are no users);
- the time-limited Unlimited trial (a future follow-up, below).

**You said:**
- Outcome: "a" (one library on every device: sign in anywhere and see the same books, positions, highlights and notes).
- Files: "B but any user can upload any material, without any determination around legal matters like copyrighted files by Blurby." The website is blrby.app.
- On private uploads, terms and a takedown contact: "We will do this." / "Yes".
- Sign-in: "a, and add Apple sign-in" (Google, Microsoft, email and Apple).
- Accounts and offline: "b" (an account is required, and downloaded books read offline).
- Plans: "research analogues services and provide a proposal. Include advertisements on the free plan, with limits on number of active uploads and TTS time, which scales to two tiers, the final being unlimited everything".
- Plus books: "100", then "Let's move this down to 25, as I think anything over this would be a poweruser."
- On the tabs: "Also consider the different modalities: library, newsroom (Extension access with URL hosting + RSS feed subscriptions), podcast, and …" (the fourth is Marketplace). The per-tab limits were approved ("a").
- Hosting: "A, It's on cloudflare".
- Narration: on server narration costs, "Where are these costs coming from?"; on Kokoro, "So you're saying we cannot run Kokoro from cloudflare?"; then "a" (desktop first, then Kokoro hosted on Cloudflare Containers).
- Placement: "a" (after the Stage 8 release and the merge train, ahead of the rest of Stage 9).
- On the plan's MeloTTS fallback (write-plan, 2026-10-23): "Drop this. Only focus on kokoro".
- On desktop ads (write-plan, 2026-10-23): "What if we did a chromium app? If that doesn't work, we can likely drop ads on the desktop app for now". The agent checked: Blurby is already a Chromium (Electron) app. AdSense bans ads "integrated into a software application", and its only app exception (the WebView API for Ads) needs the Google Mobile Ads SDK, which is mobile-only. So the fallback applies.
- On the plan's other open questions (Q1–Q8, Q10, Q11): "Agree with the rest".
- Books per plan: "move this down to 5 personal books, with unlimited purchased books through Blurby's marketplace. Same for the 25 on tier 1."
- Onboarding: "Blurby should be a drag and drop, so the onboarding consists of a drag and drop window, which is also available at any further stage, with document type limitations. If the drag and drop is larger than the allowed capacity of the user's plan, it is denyed for now."
- Trial: "Perhaps in the future, we allow a trial mode for new users on the unlimited plan, with a timer that backs out at expiry asking users to remove books or upgrade to a new plan." Then: "Add to future roadmap, holding".
- On the limit message: "or cancel option". On Marketplace books: "They would own this book." On devices: "computer, tablet, mobile device, etc."
- On migration: "The app isn't live. There are no users."

**Assumed — each one confirmed, corrected, or accepted with a guard before the verdict:**

| Assumption | Resolution |
|---|---|
| The Blurby server replaces today's own-cloud sync (`main/sync-engine.js` through the user's OneDrive or Drive). Drive and OneDrive stay as book sources (CLOUD-CONNECTORS-1, folded in). | confirmed |
| Sync conflicts: the most recent change wins for positions and settings; highlights and notes from every device are kept. | confirmed |
| Stack: Cloudflare Workers (server), D1 (database), R2 (files), plus a sign-in library. The vendor details are picked at planning. | confirmed |
| Payments and ads come in a later phase; until then every account is Unlimited (the owner and testers). | confirmed |
| The owner's own account stays Unlimited permanently. | confirmed |
| Narrate time on the desktop counts toward the plan, even though it costs blrby.app nothing to serve. | confirmed |
| Deleting an account deletes all of its uploads and data. | confirmed |
| Existing desktop users are offered a library upload at first sign-in. | corrected → there's no migration. Onboarding is a drag-and-drop window, and the app has no users yet. |

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| First outcome | One library on every device | the user | 2026-10-23 |
| Where book files live | On the server. Any material may be uploaded; Blurby makes no legal determination | the user | 2026-10-23 |
| Upload privacy and legal | Each upload private to its account. Terms of use and a takedown contact on blrby.app (the agent flagged safe-harbour risk once; it is not legal advice) | the user | 2026-10-23 |
| Sign-in | Google, Microsoft, email and Apple | the user | 2026-10-23 |
| Account and offline | An account is required; downloaded books read offline | the user | 2026-10-23 |
| Plans | Three plans: Free (ads) / Plus / Unlimited, with the values below as adjustable starting settings | the user | 2026-10-23 |
| Hosting | A managed backend on Cloudflare, where blrby.app is | the user | 2026-10-23 |
| Library intake | A drag-and-drop window, at onboarding and at any time. Unsupported types are refused. A drop over the plan limit is refused whole (upgrade or cancel) | the user | 2026-10-23 |
| Narration beyond the desktop | Desktop first. A later phase hosts Kokoro on Cloudflare Containers, starting with a speed-and-cost test, with MeloTTS on Workers AI as the fallback | the user | 2026-10-23 |
| Placement | After the Stage 8 release and the post-freeze merge train, ahead of the rest of Stage 9, as an epic | the user | 2026-10-23 |
| Server narration engine (supersedes the MeloTTS fallback in "Narration beyond the desktop") | Kokoro only. MeloTTS is dropped. If the Kokoro speed-and-cost test fails, server narration comes back to the owner, with no fallback engine | the user | 2026-10-23 |
| Ads on the desktop (amends the Plans table's Ads row) | No ads on the desktop app for now: a "Chromium app" is still software under AdSense policy. Free keeps its limits. Ads return when a surface that allows them exists (the phone apps with AdMob, or a future web reader) | the user | 2026-10-23 |
| The plan's open questions Q1–Q8, Q10, Q11 | As the plan recommends (charter draft → Owner rulings) | the user | 2026-10-23 |

**Plans (approved starting values; stored as adjustable server settings):**

| | Free (ads) | Plus ($4.99/mo, $49/yr) | Unlimited ($9.99/mo, $99/yr) |
|---|---|---|---|
| Personal (uploaded) books | 5 | 25 | Unlimited |
| Marketplace books | Unlimited, owned by the buyer, never counted | same | same |
| Newsroom saved articles / RSS feeds | 50 / 5 | 1,000 / 50 | Unlimited |
| Podcast follows / offline downloads | 5 / none | 50 / yes | Unlimited |
| Narrate time | 5 h a month | 30 h a month | Unlimited |
| Devices | 3 | Unlimited | Unlimited |
| Ads | Library and between books only (**desktop: none for now**, decision 2026-10-23) | none | none |

**Research behind the plans (third-party figures; check before launch):**
- [BookFusion](https://www.bookfusion.com/): free tier of 10 uploads and 3 devices; paid from $1.99 a month.
- [Speechify](https://costbench.com/software/ai-voice-tools/speechify/): $139 a year.
- [ElevenReader](https://sonetho.com/en/post/43): 10 free hours; $99 a year, unlimited.
- [Readwise Reader](https://textivore.com/blog/readwise-reader-pricing-2026): $9.99 a month, billed yearly.

**Narration cost research (2026-10-23):**
- Kokoro is Apache 2.0 and free; its only cost is the machine it runs on.
- Cloudflare Workers AI rates: [MeloTTS](https://developers.cloudflare.com/workers-ai/models/melotts/) $0.0002 per audio minute (about 1.2¢ an hour); [Deepgram Aura-1](https://developers.cloudflare.com/workers-ai/models/aura-1/) about $0.75 an hour; [Aura-2](https://developers.cloudflare.com/workers-ai/models/aura-2-en/) about $1.50 an hour.
- Kokoro is not in the Workers AI catalog. It can run in [Cloudflare Containers](https://developers.cloudflare.com/containers/platform/pricing/) on CPU at an estimated 2–5¢ an hour of audio. That estimate is unmeasured; the server-narration phase measures it first.

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | The Stage 8 release (gate (1) and the owner's smoke re-check) | prerequisite | the desktop is stable before sign-in is added | ROADMAP.md Stage 8 |
| Upstream | The post-freeze merge train (19 held branches) | prerequisite | it lands before this epic edits the same desktop files | `docs/planning/roadmap-reviews/2026-10-23-plan.md` |
| Downstream | Four tabs (APP-TABS-1), RSS aggregator (RSS-AGGREGATOR-1), Podcasts (PODCAST-SOURCE-1), browser extension (BROWSER-EXT-FINALIZE-1) | consume accounts and plan limits | their specs gain sign-in and per-tab limits | ROADMAP.md Stage 9 |
| Downstream | Android app (ANDROID-APP-1), iOS app (IOS-APP-1) | consume the sync service | their sync dependency becomes this server, not CLOUD-CONNECTORS-1 | ROADMAP.md Stage 9 |
| Downstream | LARGE-FOLDER-SYNC-1's design half | superseded | the large-library question moves to the server | ROADMAP.md (design-half entry) |
| Sideways | Cloud connectors (CLOUD-CONNECTORS-1) and the deferred Cloud Sync lane | absorbed | Drive and OneDrive become book sources; own-cloud sync is replaced | ROADMAP.md Stage 9; `main/sync-engine.js` |
| Sideways | Pairing token items (WS-TOKEN-REGEN-1, WS-PAIR-LOG-1), library write races (LIBRARY-WRITE-RACE-1, -2) | same files (`main/ws-server.js`, library writes) | they merge first, in the train | 2026-10-23 plan |
| External | Cloudflare (Workers, D1, R2, Containers) | hosting | account and billing on the blrby.app zone | owner |
| External | Google, Microsoft and Apple developer sign-in registrations | credentials | an app registration per provider | owner |
| External | A payments provider and an ad network | later phase | accounts and terms | owner |
| External | Terms of use and a takedown contact | legal | published on blrby.app before uploads open | owner |
| Deadline | `mode-separation` | out of scope (met) | none; the Stage 8 release has no dated deadline | `kpis --json` pace block |

### Frames

1. **Main success.** Given the reader is signed in to blrby.app on a computer and on a second device, when they read to page 120 of a book on the computer and close it, then the other device opens that book at page 120, with their highlights and notes. *(confirmed)*
2. **Onboarding.** Given a new sign-in on any device, when the drag-and-drop window opens, then dropping supported files (EPUB, PDF and the other types Blurby reads) adds them to the library, and unsupported files are named and refused. The same window is available at any time from the library. If a drop holds more books than the plan has room for, the whole drop is refused, with a message naming the limit and offering upgrade or cancel, and nothing in it is added. *(corrected: it replaced the library-upload migration)*
3. **Offline.** Given a book downloaded to a device, when the reader reads on a plane and adds two highlights, then nothing is lost. On reconnect, the highlights and the new position sync. If another device moved the position meanwhile, the most recent change wins, and both devices' highlights are kept. *(confirmed)*
4. **Plan limit.** Given a Free account with 5 personal books, when the reader uploads a sixth, then the upload is blocked with a clear message offering upgrade, delete or cancel, and nothing already uploaded is affected. Buying a Marketplace book still works; the buyer owns it, and it never counts toward the limit. *(corrected: cancel added; Marketplace books are owned)*
5. **Privacy (must never happen).** Given two accounts, when user A uploads a book, then user B can never see, search or open it, including through a guessed link. Deleting account A removes all of its books and data. *(confirmed)*
6. **What doesn't change.** Given any device (computer, tablet or phone), when the reader uses Narrate, then its minutes count toward the plan. The reading page and Narrate never show ads on any plan. On a computer, Narrate runs locally as today; tablets and phones get it from the server-narration phase. *(corrected: generalised from "computer")*

### Approach

A Blurby server on Cloudflare (Workers, D1, R2, plus a sign-in library) becomes the single store for each account's library and reading state. It replaces the desktop's own-cloud sync engine. It is built in four phases:
1. Server foundation and plan limits (as adjustable settings).
2. Desktop sign-in, the drag-and-drop window, sync and offline books.
3. Payments, with ads on Free.
4. Server narration: Kokoro on Cloudflare Containers, measured first, with MeloTTS as the fallback.

Considered and set aside:
- **Keeping own-cloud sync** (the user's Drive or OneDrive as the hub): it couldn't carry plans, Marketplace ownership or phone apps without a server anyway.
- **A major cloud (AWS, Azure, GCP) or a self-run server:** more to build and run. blrby.app is already on Cloudflare.
- **Server narration from day one:** the costliest part, built before the basics.

### Draft stub

#### One library on every device (blrby.app server) — BLURBY-SERVER-1 (provisional id)

- **What:** a Blurby server on Cloudflare that holds each account's books, positions, highlights, notes and settings. It adds sign-in with Google, Microsoft, Apple or email on the desktop, a drag-and-drop window for adding books, and plan limits as adjustable settings. Later phases add payments with ads on Free, then Kokoro narration on the server.
- **Why:** one library across devices; the foundation the phone apps, Newsroom, Podcasts and the extension depend on; and it removes the local large-folder bottleneck.
- **Done when (draft):**
  1. A position, highlights and notes made on one signed-in device appear on another (frame 1).
  2. Onboarding and the library offer a drag-and-drop window. Unsupported types are named and refused. A drop over the plan limit is refused whole, with upgrade or cancel (frame 2).
  3. Offline changes sync on reconnect. The most recent change wins for positions and settings, and highlights and notes from every device are kept (frame 3).
  4. Uploads past the plan limit are blocked with upgrade, delete or cancel. Marketplace books are owned and never count (frame 4).
  5. No account can reach another's books or data, even by a guessed link. Deleting an account removes everything (frame 5).
  6. Narrate minutes count toward the plan on every device. The reading page and Narrate never show ads (frame 6).
  7. blrby.app publishes terms of use and a takedown contact before uploads open.
- **Phases:**
  1. Server foundation and plan limits.
  2. Desktop sign-in, drag-and-drop, sync and offline books.
  3. Payments and ads.
  4. Server narration: the Kokoro speed-and-cost test on Cloudflare Containers, then hosting, with MeloTTS as the fallback.
- **Out of scope:**
  - Blurby judging uploads;
  - sharing between users;
  - the phone apps and the browser extension themselves;
  - Marketplace purchasing;
  - a browser-based reader;
  - migration (no users);
  - the Unlimited trial.
- **Edit sites (expected):**
  - New: a server codebase.
  - Desktop sign-in: `main/auth.js`.
  - Replaced: `main/sync-engine.js`, `main/sync-queue.js`, `main/cloud-google.js`, `main/cloud-onedrive.js`, `main/cloud-storage.js`.
  - `main/ws-server.js` (pairing).
  - The library and import IPC: `main/ipc/library.js`, `main/ipc/documents.js`, `main/ipc/cloud.js`.
  - Settings: `main/migrations.js`.
  - A new drag-and-drop window in the renderer.
- **Prerequisites:** the Stage 8 release; the post-freeze merge train.
- **Effort:** max (epic).
- **Path:** epic. The roadmap review places it, and `/epic` charters it from this alignment record.

**Placement (recommendation for the review):** after the Stage 8 release and the post-freeze merge train, ahead of the rest of Stage 9, as `Path: epic`.

**Impact actions (for the review; this entry edits no other item):**
- Fold CLOUD-CONNECTORS-1 and the Cloud Sync lane into this epic.
- Mark LARGE-FOLDER-SYNC-1's design half superseded by it.
- Add accounts and per-tab limits to APP-TABS-1, RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1.
- Point ANDROID-APP-1's and IOS-APP-1's sync dependency at this server.

**Follow-up flags (for the review's non-blocking follow-up queue):**
- **Ads on Free (owner, 2026-10-23):** deferred off the desktop. Revisit with the phone apps (AdMob, in the library and between books only) or a future web reader.
- **Unlimited trial for new users (owner, 2026-10-23: "Add to future roadmap, holding"):** a time-limited Unlimited plan for new accounts. At expiry, it asks the user to remove books down to their plan's limit or upgrade.

### Alignment verdict

Aligned — 2026-10-23. The user approved: "a".

## Plan

<!-- Epic-scale: never planned here. The next roadmap review places it as Path: epic, and /epic charters it from this alignment record. -->

Written by `/write-plan` on 2026-10-23 against `main` @ `ac9dc539`, at the owner's request for the full plan while they are offline. The entry is epic-scale, so it gets no HB number and no in-entry specification. The four phase specifications are written as an **epic charter draft** beside this entry: [`2026-10-23-blurby-server/charter-draft.md`](2026-10-23-blurby-server/charter-draft.md). `/roadmap-review` places the item as `Path: epic`, and `/epic` adopts, tightens or re-cuts the draft.

### Readiness

| Finding | Result |
|---|---|
| **Specification** | The charter draft has: the epic DoD (E1–E9); planner decisions T1–T15 (tier 1); and four phases, each with What, Why, Done when, edit sites, tests, failure handling, a task list and Lessons applied. Edit-site anchors were grep-verified on `ac9dc539` (2026-10-23). Cloudflare, auth, payments and ads facts come from the vendors' docs, read 2026-10-23. |
| **Owner questions** | All 11 ruled on 2026-10-23 (recorded in the alignment record above): Q9, Kokoro only, MeloTTS dropped; Q7, no ads on the desktop for now; the rest as recommended. None is open. |
| **Prerequisites** | **Pending, with the wait encoded:** the Stage 8 release and the post-freeze merge train. Phase 1 is server-only and may overlap the train. |
| **External** | Owner actions: Cloudflare Workers Paid; Google, Microsoft and Apple registrations; the email domain; terms and takedown text. Later: a payment provider and an ad source (draft → External prerequisites). |
| **Register** | Not read or written by this plan (planning only). |

**Not executable now:** the item is not on the roadmap, the Stage 8 release has not shipped, and the merge train has not run.

### Roadmap placement

`Placement: after the Stage 8 release and the post-freeze merge train, ahead of the rest of Stage 9 — Path: epic; Lane: Platform & Maintenance (primary), Library & Content (secondary); no declared deadline; placed by the owner 2026-10-23 ("a").`

Inside the epic, phases run P1 → P2 → P3 → P4a, then P4b when the first phone epic needs it (Q11). The storyboard's impact actions stand unchanged.

### Pointer

```
One library on every device (blrby.app server)  (BLURBY-SERVER-1, provisional)
Origin: held plan — 2026-10-23-blurby-server, not yet on the roadmap
Placement: after the Stage 8 release and the post-freeze merge train, ahead of the rest of Stage 9 — for the review to apply
Path: epic (4 phases) | Effort: max
Specification: docs/planning/holding/2026-10-23-blurby-server/charter-draft.md
Status: storyboarded — held for roadmap review (epic-scale; never `planned` here) | Prerequisites: Stage 8 release ✗; merge train ✗
Readiness: specification ✓ (draft) · prerequisites ✗ (wait encoded) · owner questions 0 open (ruled 2026-10-23) · register not touched
```
