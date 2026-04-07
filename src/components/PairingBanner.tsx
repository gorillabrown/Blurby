import { useState, useEffect } from "react";

interface PairingBannerProps {
  visible: boolean;
  code: string;
  expiresAt: number;
  onDismiss: () => void;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PairingBanner({ visible, code, expiresAt, onDismiss }: PairingBannerProps) {
  const [countdown, setCountdown] = useState(() => formatCountdown(expiresAt - Date.now()));

  useEffect(() => {
    if (!visible) return;

    const tick = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        setCountdown("00:00");
        onDismiss();
        return;
      }
      setCountdown(formatCountdown(remaining));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [visible, expiresAt, onDismiss]);

  if (!visible) return null;

  return (
    <div className="pairing-banner">
      <div className="pairing-banner__icon">🔗</div>
      <div className="pairing-banner__body">
        <div className="pairing-banner__title">Chrome Extension wants to connect</div>
        <div className="pairing-banner__details">
          Enter code: <span className="pairing-banner__code">{code}</span>
          <span className="pairing-banner__countdown">Expires in {countdown}</span>
        </div>
      </div>
      <button className="pairing-banner__dismiss" onClick={onDismiss}>Dismiss</button>
    </div>
  );
}
