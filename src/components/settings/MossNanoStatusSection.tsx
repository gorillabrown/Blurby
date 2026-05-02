interface MossNanoStatusSectionProps {
  ready: boolean;
  title: string;
  detail: string;
}

export function MossNanoStatusSection({ ready, title, detail }: MossNanoStatusSectionProps) {
  return (
    <div className="tts-runtime-status">
      <div className="tts-runtime-status-title">{title}</div>
      <div className="tts-test-hint">
        {detail}
        {!ready && " Nano preview becomes available only after the sidecar reports ready."}
        {ready && " Bounded lifecycle is enabled through the local sidecar contract."}
      </div>
    </div>
  );
}
