import { MIN_WPM, MAX_WPM } from "../utils/text";

interface WpmGaugeProps {
  wpm: number;
}

export default function WpmGauge({ wpm }: WpmGaugeProps) {
  const pct = ((wpm - MIN_WPM) / (MAX_WPM - MIN_WPM)) * 100;
  return (
    <div className="wpm-gauge">
      <div className="wpm-gauge-track">
        <div className="wpm-gauge-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="wpm-gauge-label">{wpm} wpm</span>
    </div>
  );
}
