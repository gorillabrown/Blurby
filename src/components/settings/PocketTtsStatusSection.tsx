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
        {" Pocket TTS is opt-in and wired at the app boundary."}
        {!ready && " Preview becomes available only after the sidecar reports ready."}
        {" Upstream synthesis remains scaffolded until adapter work is approved."}
        {ready && " Local sidecar lifecycle is available through the app boundary."}
      </div>
    </div>
  );
}
