# Roadmap review 2026-11-03-2 — Phase D brief

*Provenance.* Register is connector+snapshot `notion:database/3f87c96cc31e800580cfe019c89a56ca`, re-imported 2026-11-03T17:36:38Z (203 items). Recovery is empty. The helper is qualified, with the guard passing at `fcfa9295`.

## Goal

The owner's first finish line, now fully placed. In order:
1. the RC merge (wave D green at `70d64237`; rule 53 running on RodneySr);
2. the five post-RC desktop repairs, run one at a time;
3. sign-in and sync (BLURBY-SERVER-1, 142);
4. the website (BLURBY-SITE-1, 142.5);
5. the extension (BROWSER-EXT-FINALIZE-1, 143);
6. Android with Android Auto (ANDROID-APP-1, 144).

## Dispatch buffer

The buffer is unchanged from [2026-11-03-phase-brief.md](2026-11-03-phase-brief.md): 5 of 5 specified, all waiting on the RC merge. In Seq order, run one at a time on RodneySr per Brain1's ruling:
- A library edit stamps only what the reader changed (LIBRARY-WRITE-RACE-3, 89);
- An arrow with a modifier pauses Narrate (NARRATE-ARROW-PAUSE-1, 99);
- Narrate resumes from the word selected while paused (NARRATE-PAUSED-CLICK-1, 117);
- Page receives section keys before wrapping completes (PAGE-ENTRY-KEYS-1, 119);
- Focus keeps its word cursor without a dimming band (FOCUS-WORD-ONLY-1, 123).

## First finish line items (beyond the buffer)

| Seq | Item | Path | Next step | Owner gates |
|---|---|---|---|---|
| 142 | One library on every device: sign-in and sync (BLURBY-SERVER-1) | epic | `/epic BLURBY-SERVER-1`: turn the charter draft into the launched charter, scoped to phases 1–2 | Cloudflare Workers Paid; the Google, Microsoft and Apple sign-in registrations; the email domain |
| 142.5 | Blurby website with downloads (BLURBY-SITE-1) | dispatch | `/write-plan` (download half can follow the Windows release) | Azure Trusted Signing (identity validation); Cloudflare Pages |
| 143 | Save pages and selections to your Blurby account (BROWSER-EXT-FINALIZE-1) | dispatch | `/write-plan` after server phase 2 is specified | Chrome Web Store and Firefox Add-ons accounts |
| 144 | Blurby on Android, with Android Auto (ANDROID-APP-1) | epic | `/epic ANDROID-APP-1`. The phone speed test is phase 1, and a failure returns to the owner | Google Play developer account (an organization account avoids the 14-day closed test) |

## Top risks

1. **Owner accounts are on the critical path.** Every first-finish-line item waits on at least one account the owner must open. Start the Azure identity validation and the Play organization account early, because both take days.
2. **The ROADMAP is at its 2,000-line ceiling.** The next review must snapshot and trim before it adds anything.

## Buffer gaps

There are no new gaps. BLOCK-TEXT-ORDER-1 (87.5) stays a stub under the word-index contract.
