# Desktop v2.0 Release Notes

Status: packaged release candidate truth, not a published release.
Package version: 1.75.1.

## Engine Posture

- Kokoro remains the default and supported local narration engine.
- MOSS-Nano is a recommended opt-in engine when its local runtime is provisioned.
- Pocket TTS is available as an opt-in engine path, with upstream adapter expansion deferred.
- Qwen is retired/disabled for Desktop v2.

## Packaged Sidecar Truth

The packaged app now includes and unpacks the Python bridge scripts used by the MOSS-Nano and Pocket TTS sidecars. Packaged sidecar defaults resolve bridge scripts and runtime directories under Electron packaged resources instead of a development checkout path.

MOSS-Nano and Pocket TTS still require their respective local runtime/model assets to exist under the packaged runtime root. This remediation does not add a complete runtime download/provisioning release workflow.

## Update Truth

Update installation is offered only after the updater reports that a download completed. An available-update event may notify that a download is in progress, but it must not expose an install action.

## Release Process Limitation

This checkout has no automated GitHub release workflow. The existing auto-update documentation is a manual candidate procedure until a release workflow is added and verified.
