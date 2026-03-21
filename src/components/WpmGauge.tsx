import { MIN_WPM, MAX_WPM } from "../utils/text";

interface WpmGaugeProps {
  wpm: number;
}

export default function WpmGauge({ wpm }: WpmGaugeProps) {
  const pct = ((wpm - MIN_WPM) / (MAX_WPM - MIN_WPM)) * 100;
  return (
    <div className="wpm-gauge" role="meter" aria-valuenow={wpm} aria-valuemin={MIN_WPM} aria-valuemax={MAX_WPM} aria-label={`Reading speed: ${wpm} words per minute`}>
      <div className="wpm-gauge-track" aria-hidden="true">
        <div className="wpm-gauge-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="wpm-gauge-label">{wpm} wpm</span>
    </div>
  );
}
