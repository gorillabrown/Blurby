# Held Plan — First finish line: Windows app, website, browser extension, Android with Android Auto

<!-- virtuoso-held-plan v1 -->
<!-- One file per piece of ad hoc work, saved in the registered holdingBay role as
     <yyyy-mm-dd>-<slug>.md. The Trail changes only through
     `virtuoso_registry holding --record`; never edit or delete a row. Nothing in this
     file is on the roadmap until roadmap-review absorbs it. -->

- **Entry:** 2026-11-03-first-finish-line
- **Size:** item set (4): two epics (BLURBY-SERVER-1, ANDROID-APP-1), two dispatch-sized or item-set items (BROWSER-EXT-FINALIZE-1, a new website item). Three already exist on the roadmap; this entry re-scopes them and adds one.
- **Origin:** storyboard 2026-11-03. The owner set a new first finish line in the 2026-11-03 roadmap review (Phase B and C checkpoints). The three design questions that review left open (extension scope, server scope, Android build) had to be settled before any of these items could be specified.

## Trail

| Date | State | By | Note |
|---|---|---|---|
| 2026-11-03 | storyboarded | storyboard | aligned; 4 items (server P1-2, website, extension, Android + Android Auto) |

## Storyboard

### Alignment record

**Outcome:** a reader can install Blurby on Windows from blrby.app, sign in, save pages and selections from Chrome or Firefox to their account, and read and listen to the same synced library on an Android phone, including narration started from the Android Auto car screen.

**Why now:** the owner made these four surfaces the first finish line on 2026-11-03. Blurby Business, RSS, podcasts, cloud connectors, iOS, Apple CarPlay and queue sync follow it. The extension, server and Android items could not be specified without these decisions.

**Done looks like:** frames 1–12 below hold on released builds.

**Must never happen:**
- Windows reading or Narrate starts requiring sign-in for local books.
- Payments, ads or plan-limit screens appear before the payments phase.
- Android Narrate ships with estimated word timing (owner ruling #31) or quietly degraded after a failed phone speed test.
- The site serves a build that has not passed the Windows release gates.
- A save from the extension is lost silently.

**Out of scope:**
- server phases 3 (payments and ads) and 4 (server narration);
- reading inside the browser;
- a web library or account page, and marketing pages;
- public Play production listing;
- iOS and Apple CarPlay;
- RSS, podcasts, Blurby Business, cloud connectors and queue sync.

**You said:**
- Server: "Phases 1–2 only".
- Android Narrate: "On-device Kokoro". Build: "React Native rewrite". Distribution, first: "Signed APK, sideloaded", then, for Android Auto: "Play internal testing", then, for the website: "Open testing". Modes: "All four".
- "On car audio, we must have google car play compatibility on day 1, as in it's seen as a viable app to be used on Android Auto with a simple wrapper that allows narration launch from the android auto car touch screen."
- Extension target: "Your account via the server". Publishing: "Chrome + Firefox, store listed". Features: "Save a selection or link", "Saved confirmation + open in Blurby", and "WIth a pop up on selected text with a prompt to save".
- "We also need to establish the Blurby.app website, with a direct download desktop app and link to google play download". Signing: "Azure Trusted Signing". Site: "One landing page".

**Assumed — each one confirmed, corrected, or accepted with a guard before the verdict:**

| Assumption | Resolution |
|---|---|
| A1: the extension's account saving needs server phase 2, so the extension follows the server in order; desktop pairing stays as the fallback | confirmed |
| A2: Android syncs books, positions, highlights, notes and settings like the desktop, and downloaded books read offline | confirmed |
| A3: Android and the extension use the 2026-10-23 sign-ins: Google, Microsoft, email and Apple | confirmed |
| A4: Android Narrate keeps the exact word-table cursor (owner ruling #31) | confirmed |
| A5: the phone speed test runs on the owner's Android phone; a failure returns to the owner, with no silent fallback | confirmed |
| A6: plan limits exist only as settings, with everyone Unlimited, and no limit or upgrade screens | confirmed |
| A7: iOS, car audio, queue sync, Business, RSS and podcasts all stay after the finish line | corrected → Android Auto is in the first finish line (narration from the car screen); Apple CarPlay stays later |
| Selection saving is a right-click action | corrected → a pop-up appears on selected text with a prompt to save; right-click stays |
| W1: the domain is blrby.app (on Cloudflare per the server charter) | confirmed |
| W2: installers stay on GitHub Releases on the public repo; the site links to the latest release, so auto-update keeps working | confirmed |
| W3: downloads go live only after the Windows release gates; no version number shown | confirmed |
| W4: Android moves to Play open testing | accepted — guard: a new personal Play account may need a 14-day closed test with at least 12 testers first; an organization account avoids it |
| W5: the landing page carries the privacy policy, terms and the server's sign-in pages | confirmed |

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| Server scope for the first finish line | Phases 1–2: sign-in and sync, everyone Unlimited | the user | 2026-11-03 |
| Android Narrate | On-device Kokoro, behind a phone speed test | the user | 2026-11-03 |
| Android build | React Native rewrite (the March design archive's route) | the user | 2026-11-03 |
| Android distribution | Google Play open testing | the user | 2026-11-03 |
| Android reading modes | All four | the user | 2026-11-03 |
| Android Auto | Day 1: a media app that browses books and starts, pauses and skips narration from the car screen | the user | 2026-11-03 |
| Extension save target | The account via the server, with desktop pairing as fallback | the user | 2026-11-03 |
| Extension browsers and publishing | Chrome and Firefox, store listed | the user | 2026-11-03 |
| Extension features | Save page, selection or link; a pop-up on selected text; a saved confirmation with open-in-Blurby | the user | 2026-11-03 |
| Website | One landing page at blrby.app, with downloads and store links | the user | 2026-11-03 |
| Windows signing | Azure Trusted Signing | the user | 2026-11-03 |

The agent noted the React Native risk once (every screen rebuilt; the Kokoro phone test is the gate, with no fallback until server narration). The user kept the choice.

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | Stage 8 Windows release (RC integration window, gates (1) and (2)) | prerequisite | the website's download and server phase 2's desktop sign-in follow a released desktop | ROADMAP.md finish line; 2026-11-03 plan |
| Upstream | One library on every device (BLURBY-SERVER-1) phases 1–2 | prerequisite | the extension's account save, Android sync and the site's sign-in pages | charter draft `docs/planning/holding/2026-10-23-blurby-server/charter-draft.md` |
| Upstream | Four tabs (APP-TABS-1) | prerequisite | saved articles land in Newsroom | register prerequisite of BROWSER-EXT-FINALIZE-1 |
| Downstream | BLURBY-SERVER-1 charter | scope | phases 3 and 4 move after the finish line; P4b no longer serves the first phone app | charter Q11 |
| Downstream | Car audio (CAR-AUDIO-1) | scope split | narrows to Apple CarPlay; Android Auto moves into ANDROID-APP-1 | ROADMAP.md#car-audio-1 |
| Downstream | Android app card (ANDROID-APP-1) | stale text | "depends on how sync is settled (CLOUD-CONNECTORS-1)" is stale; sync is the server | ROADMAP.md#android-app-1 |
| Downstream | Listening queue (QUEUE-SYNC-1) | consumer | the car plays from the library at first; the listening queue stays later | ROADMAP.md#queue-sync-1 |
| Downstream | ROADMAP finish line and register order | sequence | server 142, website and extension after it, Android 144 | 2026-11-03 plan C.4 |
| Downstream | Memory "Blurby not public, no versioning" | policy | Blurby becomes publicly downloadable; still no version numbers shown | owner memory |
| Sideways | NARRATE-CPU-PROFILE-1 (Seq 95) | measurement | its desktop CPU findings inform the phone speed test's targets | ROADMAP.md |
| External | Cloudflare Workers Paid and Pages; Google, Microsoft and Apple sign-in registrations; email domain | owner accounts | needed for server phases 1–2 and the site | charter draft |
| External | Google Play developer account; Android Auto media-app review; open-testing listing | owner accounts | Android distribution and Android Auto | this storyboard |
| External | Chrome Web Store and Firefox Add-ons developer accounts; privacy policy | owner accounts | extension listings | this storyboard |
| External | Azure Trusted Signing with identity validation | owner account | the signed Windows installer | this storyboard |
| Deadline | none declared | — | pace not computable: no `policy.roadmap.deadlines` | kpis pace block |

### Frames

1. **Sign in and sync.** Given you sign in on Windows with Google, when you then sign in on the Android app with the same account, then your books, reading position, highlights and notes appear there; no limit or upgrade screen appears anywhere. *(confirmed)*
2. **Reading on the phone.** Given Blurby installed from the Play open-testing link, when you open a synced book and switch between Page, Focus, Flow and Narrate, then each works as on desktop, and Narrate's cursor follows the spoken word; closing on the phone and reopening on Windows lands on the same word. *(confirmed; corrected: Play, not sideloaded)*
3. **Offline.** Given a downloaded book and the phone in airplane mode, when you open it, then it reads, and the position syncs when you are back online. *(confirmed)*
4. **Phone too slow for Kokoro.** Given the phone speed test misses its targets, when it is reported, then Narrate on Android does not ship quietly degraded; the measured numbers return to the owner. *(confirmed)*
5. **Saving a selection.** Given you highlight a paragraph in Chrome or Firefox, when the "Save to Blurby" pop-up appears beside it and you click it, then just that passage is saved, a "Saved to your library" notice links to open it in Blurby, and it appears on desktop and Android even with the desktop app closed. *(confirmed; corrected: pop-up)*
6. **Signed out or offline.** Given you are not signed in or the server is unreachable, when you save, then the extension says so and offers to sign in, or to send to the paired desktop app if it is running; nothing is lost silently. *(confirmed)*
7. **What doesn't change.** Given Windows, when you read or use Narrate, then Narrate runs locally as today and local books need no sign-in; no payments, ads or server narration exist anywhere yet. *(confirmed)*
8. **Android Auto.** Given the phone connected to the car and a synced book, when you open Blurby on the car's touchscreen and tap the book, then narration starts at your saved position; play, pause and skip work from the screen and steering wheel; the position saves as it plays; the car shows only the audio view. *(confirmed)*
9. **Locked phone.** Given narration playing in the car, when the phone locks or another app opens, then narration continues and the car controls keep working. *(confirmed)*
10. **Desktop download.** Given a Windows PC on blrby.app, when you click Download, then you get the signed installer for your architecture (x64 or ARM64), and it installs without an "Unknown publisher" warning. *(confirmed)*
11. **Other devices.** Given an Android phone on blrby.app, when you visit, then the Google Play button opens the open-testing listing, and the installed app appears in Android Auto; on any device, the Windows, Chrome and Firefox links are present and none is broken. *(confirmed)*
12. **Before release.** Given the Windows release has not passed its gates, when someone visits, then the page shows no live download link and never serves an unreleased build. *(confirmed)*

### Approach

The server is the existing four-phase charter, cut to phases 1–2 for this finish line. The extension is today's Manifest V3 Chrome extension, extended with account saving, the selection pop-up and the saved notice, ported to Firefox and store listed. Android is the March design's React Native rewrite, with Kokoro on the phone through ONNX Runtime behind a phone speed test, background playback, and an Android Auto media surface. Distribution is Play open testing. The website is one landing page on Cloudflare, with the installer signed through Azure Trusted Signing.

Considered and set aside:
- **Wrapping the desktop reader in Capacitor:** faster and one reader codebase; the owner chose the native-feel rewrite.
- **Native Kotlin:** nothing shared with the desktop; the largest build.
- **Android system voices:** would break owner ruling #31.
- **A sideloaded APK:** Android Auto ignores sideloaded apps by default.
- **Shipping the installer unsigned:** SmartScreen warns every new user.
- **Server payments or narration in the first finish line:** cost and accounts before the basics.

### Draft stub

#### One library on every device: sign-in and sync (BLURBY-SERVER-1; first finish line = phases 1–2)

- **What:** a Cloudflare server (Workers, D1, R2) and desktop sign-in with Google, Microsoft, email and Apple. It syncs books, positions, highlights, notes and settings, with offline books. Plan limits exist only as settings, and everyone is Unlimited.
- **Why:** the account and sync carrier for the extension and Android.
- **Done when (draft):** 1. Frame 1. 2. Frame 7.
- **Out of scope:** phase 3 (payments and ads) and phase 4 (server narration), now after the first finish line.
- **Edit sites (expected):** per the charter draft: a new server project; desktop sign-in in `main/auth.js`; the desktop sync engine it replaces.
- **Prerequisites:** the Stage 8 Windows release (phase 1 may overlap it); owner accounts (Cloudflare Workers Paid, the sign-in registrations, the email domain).
- **Effort:** max.

#### Blurby website with downloads (new item; provisional id BLURBY-SITE-1)

- **What:** a one-page site at blrby.app on Cloudflare Pages. It offers the Windows download (x64 or ARM64, chosen automatically, from the latest GitHub release); Google Play (open testing), Chrome Web Store and Firefox Add-ons links; privacy policy and terms pages; and the sign-in pages the server needs. The Windows installer is signed with Azure Trusted Signing.
- **Why:** the public front door for every surface of the first finish line.
- **Done when (draft):** 1. Frame 10. 2. Frame 11. 3. Frame 12.
- **Out of scope:** a web library or account page; marketing pages (features, FAQ, blog).
- **Edit sites (expected):** a new site folder; `package.json` `build.win` signing settings; `docs/governance/RELEASE_RUNBOOK.md` (signing and publish steps).
- **Prerequisites:** the Stage 8 Windows release, before the download goes live; owner accounts (Azure Trusted Signing with identity validation, Cloudflare Pages); server phase 2, for the sign-in pages; each store link is added as its listing goes live.
- **Effort:** high.

#### Save pages and selections to your Blurby account (BROWSER-EXT-FINALIZE-1)

- **What:** sign in to the account from the extension. Save a page, a selection or a link. A pop-up appears on selected text with a prompt to save, and right-click saving stays. A "Saved to your library" notice links to open the item in Blurby. Desktop pairing stays as the fallback. Port to Firefox, and list on the Chrome Web Store and Firefox Add-ons.
- **Why:** captured reading reaches every device without the desktop running.
- **Done when (draft):** 1. Frame 5. 2. Frame 6.
- **Out of scope:** reading inside the browser (the old EXT-ENR-C idea).
- **Edit sites (expected):** `chrome-extension/` (`manifest.json`, `content-script.js`, `service-worker.js`, `popup.js` and `popup.html`, `options.js`); a Firefox build of the same sources.
- **Prerequisites:** server phase 2; Four tabs (APP-TABS-1), so saved articles land in Newsroom; owner store accounts and a privacy policy.
- **Effort:** high.

#### Blurby on Android, with Android Auto (ANDROID-APP-1)

- **What:** a React Native app distributed through Google Play open testing. It has all four reading modes (Page, Focus, Flow and Narrate) and the synced library with offline books. Kokoro runs on the phone with the exact word-table cursor. Playback continues in the background. An Android Auto media app browses books and starts, pauses and skips narration from the car screen.
- **Why:** the phone surface of the first finish line, with listening in the car on day 1.
- **Done when (draft):** 1. Frame 2. 2. Frame 3. 3. Frame 4 (the phone speed test is the first phase; a failure returns to the owner). 4. Frame 8. 5. Frame 9.
- **Out of scope:** iOS; Apple CarPlay; reading text in the car; a public Play production listing; server narration.
- **Edit sites (expected):** a new React Native app with logic shared from the desktop; ONNX Runtime for Kokoro on the phone; an Android media service for background playback and Android Auto.
- **Prerequisites:** server phase 2; a Google Play developer account (see guard W4); Android Auto media-app review; the phone speed test passing.
- **Effort:** max.

**Placement recommendation (for the next roadmap review):**
- **Order:** the Stage 8 Windows release, then the desktop repairs, then BLURBY-SERVER-1 phases 1–2, the website, the extension and Android. The website's download may go live right after the Windows release, ahead of the server; it gains the sign-in pages and store links as those land.
- **Register changes for the review to decide:**
  - swap the server and the extension (server 142, extension 143);
  - Android stays at 144;
  - create the website item (provisional BLURBY-SITE-1).

**Impact actions (for the review; neither this entry nor /write-plan edits other items):**
- Narrow CAR-AUDIO-1 to Apple CarPlay.
- Record in BLURBY-SERVER-1's charter that phases 3 and 4 follow the finish line.
- Correct ANDROID-APP-1's stale CLOUD-CONNECTORS-1 sync text.
- Update the ROADMAP finish line to add the website and Android Auto.
- Update the owner memory: Blurby becomes publicly downloadable, still with no version numbers shown.

### Alignment verdict

Aligned — 2026-11-03. The user approved: "Approve (Recommended)" (first three draft stubs), then "Approve (Recommended)" (the website stub and the four-item storyboard).

## Plan

<!-- Filled by write-plan: readiness, roadmap placement, the kickoff (one block
     carrying its repository-reconciliation recipe), and one specification per
     draft-stub item, each headed
     `#### HB-<n> — Title`. Empty until then. An epic-scale entry is never planned here.
     Only the virtuoso skill executes the plan, and it records the run in the trail. -->
