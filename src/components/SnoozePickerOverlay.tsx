import { useEffect, useCallback } from "react";

interface SnoozePickerOverlayProps {
  onSelect: (until: number) => void;
  onClose: () => void;
}

interface SnoozeOption {
  key: string;
  label: string;
  sublabel: string;
  getTimestamp: () => number;
}

function nextOccurrenceOf(hour: number, minute = 0): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

function nextWeekday(dayOfWeek: number, hour: number, minute = 0): number {
  // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  const daysUntil = (dayOfWeek - now.getDay() + 7) % 7;
  // If today is the target day but time has already passed, go to next week
  target.setDate(
    now.getDate() + (daysUntil === 0 && target <= now ? 7 : daysUntil)
  );
  return target.getTime();
}

const SNOOZE_OPTIONS: SnoozeOption[] = [
  {
    key: "1",
    label: "In 1 hour",
    sublabel: "Back in 60 minutes",
    getTimestamp: () => Date.now() + 60 * 60 * 1000,
  },
  {
    key: "2",
    label: "Tonight",
    sublabel: "8:00 PM today",
    getTimestamp: () => nextOccurrenceOf(20, 0),
  },
  {
    key: "3",
    label: "Tomorrow morning",
    sublabel: "8:00 AM tomorrow",
    getTimestamp: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      return tomorrow.getTime();
    },
  },
  {
    key: "4",
    label: "This weekend",
    sublabel: "Saturday at 9:00 AM",
    getTimestamp: () => nextWeekday(6, 9, 0), // 6 = Saturday
  },
  {
    key: "5",
    label: "Next week",
    sublabel: "Monday at 8:00 AM",
    getTimestamp: () => {
      // Always go to next Monday (not today even if today is Monday)
      const now = new Date();
      const target = new Date(now);
      target.setHours(8, 0, 0, 0);
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7; // 1=Monday
      target.setDate(now.getDate() + daysUntilMonday);
      return target.getTime();
    },
  },
];

export default function SnoozePickerOverlay({ onSelect, onClose }: SnoozePickerOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      const optionIndex = parseInt(e.key, 10) - 1;
      if (optionIndex >= 0 && optionIndex < SNOOZE_OPTIONS.length) {
        e.preventDefault();
        const opt = SNOOZE_OPTIONS[optionIndex];
        onSelect(opt.getTimestamp());
      }
    },
    [onSelect, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="snooze-picker-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Snooze document"
      onClick={onClose}
    >
      <div
        className="snooze-picker-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="snooze-picker-header">
          <span className="snooze-picker-title">Snooze until&hellip;</span>
          <span className="snooze-picker-hint">Press 1–5 or click</span>
        </div>

        <ul className="snooze-picker-list" role="listbox" aria-label="Snooze options">
          {SNOOZE_OPTIONS.map((opt, i) => (
            <li
              key={opt.key}
              className="snooze-option"
              role="option"
              aria-label={`${opt.label} — ${opt.sublabel}`}
              onClick={() => onSelect(opt.getTimestamp())}
            >
              <span className="snooze-option-key" aria-hidden="true">
                {i + 1}
              </span>
              <span className="snooze-option-body">
                <span className="snooze-option-label">{opt.label}</span>
                <span className="snooze-option-sublabel">{opt.sublabel}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
