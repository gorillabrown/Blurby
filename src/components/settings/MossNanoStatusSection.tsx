interface MossNanoStatusSectionProps {
  ready: boolean;
  title: string;
  detail: string;
  providerLabel?: string;
  readyHint?: string;
  blockedHint?: string;
}

export function MossNanoStatusSection({
  ready,
  title,
  detail,
  providerLabel = "Nano",
  readyHint = "Bounded lifecycle is enabled through the local sidecar contract.",
  blockedHint = "Nano preview becomes available only after the sidecar reports ready.",
}: MossNanoStatusSectionProps) {
  return (
    <div className="tts-runtime-status">
      <div className="tts-runtime-status-title">{title}</div>
      <div className="tts-test-hint">
        {detail}
        {!ready && ` ${blockedHint}`}
        {ready && ` ${readyHint}`}
        <span className="sr-only">{providerLabel} capability status</span>
      </div>
    </div>
  );
}
