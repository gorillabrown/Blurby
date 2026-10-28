interface PocketTtsStatusSectionProps {
  ready: boolean;
  title: string;
  detail: string;
  providerLabel?: string;
  readyHint?: string;
  blockedHint?: string;
}

export function PocketTtsStatusSection({
  ready,
  title,
  detail,
  providerLabel = "Pocket TTS",
  readyHint = "Local sidecar lifecycle is available through the app boundary.",
  blockedHint = "Preview becomes available only after the sidecar reports ready. Upstream synthesis remains scaffolded until adapter work is approved.",
}: PocketTtsStatusSectionProps) {
  return (
    <div className="tts-runtime-status">
      <div className="tts-runtime-status-title">{title}</div>
      <div className="tts-test-hint">
        {detail}
        {` ${providerLabel} is opt-in and wired at the app boundary.`}
        {!ready && ` ${blockedHint}`}
        {ready && ` ${readyHint}`}
      </div>
    </div>
  );
}
