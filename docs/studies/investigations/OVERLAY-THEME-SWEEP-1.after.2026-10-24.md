# OVERLAY-THEME-SWEEP-1 — after observation (Done-when 5), 2026-10-24

**Build:** the same recipe as the base (`OVERLAY-THEME-SWEEP-1.base.2026-10-24.md`) on the tip `0379b6ca` (fix `7d044063` with `origin/main` `574f20ef` merged in; the merge brings only ROADMAP and `Virtuoso/.recovery` files). `npx electron-builder --win --dir --arm64 -c.directories.output=release-tip`, run from the copy `C:\Projects\Blurby-artifacts\overlay-theme-sweep-1\tip-unpacked`.
**Profile, preflight, route and probe:** identical to the base (fresh `profile-tip-1`; `userData` read back equal to the scratch profile; covers present; live `library.json` `d4b884bd…` and `settings.json` `2e1d5245…` unchanged). Same `OVERLAY-THEME-SWEEP-1.probe.mjs.txt`, same ports. Run 03:03:43–03:04:22Z; repeated as `profile-tip-2` with the same figures.

## Pass conditions
| Condition | Base | After | Pass |
|---|---|---|---|
| (c1) `--bg` Light → Dark | `#f5f3ef` → `#0f0f0f` | `#f5f3ef` → `#0f0f0f` | yes |
| (c2) Escape with no overlay exits the reader | `.rbb-mode-btn` gone | `.rbb-mode-btn` gone | yes |
| (b1) `;`, Escape in `.highlights-search` | reader exited, overlay left over the library | overlay gone, `.rbb-mode-btn` present (reader open), focus back on `BODY` | yes |
| (b2) quick settings, Escape | reader exited, popover left over the library | popover gone, `.rbb-mode-btn` present | yes |
| Five panels × four themes: background = `--bg-raised`, border-top = `--border`, color = `--text` | 0 of 20 | 20 of 20 | yes |
| Hovered mode button = `--border` | `rgb(68, 68, 68)` in all four | equals `--border` in all four, E-ink included | yes |
| Live profile hashes | unchanged | unchanged | yes |

- **E-ink hover:** the hovered Focus button reads `rgb(184, 180, 168)` = E-ink's `--border`, so the E-ink no-hover rule (`themes.css:146-148`) does not override it here; recorded as "equals `--border`".
- (b2) uses the same quick-settings route as the base (BUG-215: no app route).

## Tables (tip run 1)
| Theme | data-theme / data-eink | --bg-raised | --border | --text | Panel | background | border-top | color | bg=raised | border=border | color=text |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | goto † | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | true | true | true |
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | snooze | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | true | true | true |
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | tag | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | true | true | true |
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | highlights | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | true | true | true |
| Blurby | blurby / - | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | quickSettings | rgb(34, 52, 86) | rgb(45, 74, 110) | rgb(255, 255, 255) | true | true | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | goto † | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | true | true | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | snooze | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | true | true | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | tag | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | true | true | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | highlights | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | true | true | true |
| Dark | dark / - | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | quickSettings | rgb(24, 24, 24) | rgb(42, 42, 42) | rgb(232, 228, 222) | true | true | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | goto † | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | true | true | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | snooze | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | true | true | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | tag | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | true | true | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | highlights | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | true | true | true |
| Light | light / - | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | quickSettings | rgb(255, 255, 255) | rgb(212, 208, 202) | rgb(26, 26, 26) | true | true | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | goto † | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | true | true | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | snooze | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | true | true | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | tag | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | true | true | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | highlights | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | true | true | true |
| E-ink | eink / true | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | quickSettings | rgb(222, 218, 208) | rgb(184, 180, 168) | rgb(26, 26, 26) | true | true | true |

| Theme | hovered button | :hover | backgroundColor | --border | equal |
|---|---|---|---|---|---|
| Blurby | Focus mode | true | rgb(45, 74, 110) | rgb(45, 74, 110) | true |
| Dark | Focus mode | true | rgb(42, 42, 42) | rgb(42, 42, 42) | true |
| Light | Focus mode | true | rgb(212, 208, 202) | rgb(212, 208, 202) | true |
| E-ink | Focus mode | true | rgb(184, 180, 168) | rgb(184, 180, 168) | true |

- Page exceptions: one in run 1 and two in run 2, all `TypeError: Cannot destructure property 'style' of 'r' as it is null.` from foliate's `paginator` chunk, during a reader open/close round; the base control run `profile-base-4` logged the same exception, so it is not caused by this change. App log: only `[ws-server] … EADDRINUSE 127.0.0.1:48924` (the owner's installed Blurby holds the port; known noise).
