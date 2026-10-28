# Desktop v2.0 Release Checklist

Status: current release checklist for the 1.75.1 packaged release candidate.

## Completed Truth Checks

- [x] Package metadata is aligned at 1.75.1 in `package.json` and `package-lock.json`.
- [x] Release-facing engine posture is Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, Qwen retired/disabled.
- [x] `npm run typecheck` is a meaningful release gate and currently passes for the Desktop v2 engine/type-contract surface.
- [x] MOSS-Nano and Pocket TTS Python bridge scripts are included in package files and unpacked for Python execution.
- [x] Packaged sidecar defaults no longer point at development checkout paths.
- [x] Renderer install affordances are gated on `update-downloaded`.

## Manual Checks Before Publishing

- [ ] Build installers with `npm run package:win` or the target platform package script.
- [ ] Run `npm run typecheck`, `npm test`, and `npm run build` on the final release candidate.
- [ ] Generated audio, traces, profiles, and temp evidence remain untracked by default. Canonical release summaries stay reviewable as intentional `summary.json`, `summary.txt`, gate report, or promotion decision artifacts.
- [ ] Install the packaged app on a clean machine.
- [ ] Verify Settings > Help shows version 1.75.1.
- [ ] Verify Kokoro remains selectable/default.
- [ ] Verify MOSS-Nano and Pocket TTS show truthful blocked/ready status based on local runtime assets.
- [ ] Verify update-available UI does not offer install before download completion.
- [ ] Verify update-downloaded UI offers install/restart.

## Deferred Release Workflow Work

- [ ] Add a real GitHub Actions release workflow that builds, signs or explicitly records unsigned status, uploads installer assets, and publishes `latest*.yml`.
- [ ] Run the manual auto-update E2E procedure against two published test versions.
- [ ] Decide whether runtime assets are shipped, downloaded by setup, or provisioned separately for each opt-in sidecar engine.
