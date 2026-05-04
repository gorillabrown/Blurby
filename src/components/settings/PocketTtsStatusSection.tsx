interface PocketTtsStatusSectionProps {
  ready: boolean;
  title: string;
  detail: string;
}

export function PocketTtsStatusSection({ ready, title, detail }: PocketTtsStatusSectionProps) {
  return (
    <div className="tts-runtime-status">
      <div className="tts-runtime-status-title">{title}</div>
      <div className="tts-test-hint">
        {detail}
        {!ready && " Pocket preview becomes available only after the sidecar reports ready."}
        {ready && " Bounded lifecycle is enabled through the local sidecar contract."}
      </div>
    </div>
  );
}
