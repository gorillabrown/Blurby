interface QwenStatusSectionProps {
  qwenWarming: boolean;
  qwenPreflightBusy: boolean;
  qwenStatusReason?: string | null;
  qwenStatusTitle: string;
  qwenStatusDetail: string;
  onValidateRuntime: () => void;
  onViewSetupGuidance: () => void;
}

export function QwenStatusSection({
  qwenWarming,
  qwenPreflightBusy,
  qwenStatusReason,
  qwenStatusTitle,
  qwenStatusDetail,
  onValidateRuntime,
  onViewSetupGuidance,
}: QwenStatusSectionProps) {
  const secondaryCopy =
    qwenStatusReason === "python-missing"
      ? "Qwen runs through a local external runtime on this machine. Finish the local Python and runtime setup before Blurby can use it."
      : qwenStatusReason === "device-unsupported" || qwenStatusReason === "cuda-unavailable"
        ? "Qwen runs through a local external runtime on this machine. Check the configured device and runtime health before Blurby can use it for live narration."
      : "Qwen runs through a local external runtime on this machine. Preview and live narration become available once that runtime is configured and warmed.";

  return (
    <div className="tts-status-card">
      <div className="tts-status-title">{qwenStatusTitle}</div>
      <div className="tts-status-detail">
        {qwenStatusDetail}
      </div>
      <div className="tts-status-detail">
        {secondaryCopy}
      </div>
      <div className="tts-status-detail">
        Validation checks the configured runtime and supported-host policy without starting narration.
      </div>
      <div className="tts-qwen-action-row">
        {!qwenWarming && (
          <button
            className="settings-btn-secondary"
            onClick={onValidateRuntime}
            disabled={qwenPreflightBusy}
          >
            {qwenPreflightBusy ? "Validating..." : "Validate runtime"}
          </button>
        )}
        <button
          className="settings-btn-secondary"
          onClick={onViewSetupGuidance}
        >
          View setup guidance
        </button>
      </div>
    </div>
  );
}
