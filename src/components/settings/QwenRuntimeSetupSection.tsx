import type { QwenPreflightReport } from "../../types";

interface QwenRuntimeSetupSectionProps {
  report: QwenPreflightReport | null;
  expanded: boolean;
}

export function QwenRuntimeSetupSection({
  report,
  expanded,
}: QwenRuntimeSetupSectionProps) {
  return (
    <div className="tts-status-card tts-qwen-setup-card">
      <div className="tts-status-title">Qwen runtime setup</div>
      <div className="tts-status-detail">
        Supported in this phase: a pre-provisioned local Python runtime on either a CPU-backed host or a CUDA-visible NVIDIA host.
        CUDA is preferred for speed, but CPU-backed Qwen can be used for live narration on this machine.
      </div>
      <div className="tts-status-detail">
        Blurby does not install Python, CUDA, or model weights during narration. Provision the runtime first,
        then use Validate runtime to confirm the host is healthy.
      </div>
      {report && (
        <>
          <div className="tts-qwen-setup-meta">
            <strong>Current result:</strong> {report.detail}
          </div>
          {report.configPath && (
            <div className="tts-qwen-setup-meta">
              <strong>Config path:</strong> {report.configPath}
            </div>
          )}
          {report.requestedDevice && (
            <div className="tts-qwen-setup-meta">
              <strong>Configured device:</strong> {report.requestedDevice}
            </div>
          )}
          <div className="tts-qwen-setup-meta">
            <strong>Last validation:</strong> {new Date(report.checkedAt).toLocaleString()}
          </div>
        </>
      )}
      {expanded && (
        <>
          <div className="tts-qwen-setup-heading">Setup checklist</div>
          <div className="tts-qwen-setup-step">1. Create the local runtime config at `.runtime/qwen/config.json` for development or `userData/qwen/config.json` in packaged mode.</div>
          <div className="tts-qwen-setup-step">2. Point `pythonExe` at the provisioned Python environment that has `torch` and `qwen_tts` installed.</div>
          <div className="tts-qwen-setup-step">3. Set `device` to the host you intend to use, such as `cpu` for local CPU playback or `cuda:0` for faster NVIDIA-backed playback.</div>
          <div className="tts-qwen-setup-step">4. Pre-download the configured Qwen model weights locally before testing. Blurby preflight does not fetch them for you.</div>
          <div className="tts-qwen-setup-step">5. Run Validate runtime again after fixing any failed checks below.</div>
        </>
      )}
      {report?.checks?.length ? (
        <>
          <div className="tts-qwen-setup-heading">Validation checks</div>
          <div className="tts-qwen-check-list">
            {report.checks.map((check) => (
              <div key={`${check.key}-${check.label}`} className={`tts-qwen-check tts-qwen-check--${check.status}`}>
                <div className="tts-qwen-check-label">
                  {check.label}
                </div>
                <div className="tts-qwen-check-detail">
                  {check.detail}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
