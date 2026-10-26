import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { FILTER_MENU_HOVER_CLOSE_MS } from "../constants";

// APP-TABS-1: the filter icon's dropdown. It opens on hover, click or Enter and closes on Escape or an outside click.
// State is how it opened: a hover-opened menu closes when the pointer leaves, a click or key-opened one does not.
// A touch tap fires mouseenter then click, so a click on a hover-opened menu keeps it open as "click" (E-ink).
export interface FilterMenuItem {
  value: string;
  label: string;
  /** The first item after a separator starts a new group. */
  separatorBefore?: boolean;
}

interface FilterMenuProps {
  items: FilterMenuItem[];
  value: (item: FilterMenuItem) => boolean;
  onSelect: (item: FilterMenuItem) => void;
  disabled?: boolean;
}

type OpenState = null | "hover" | "click" | "key";

export default function FilterMenu({ items, value, onSelect, disabled }: FilterMenuProps) {
  const [open, setOpen] = useState<OpenState>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  useEffect(() => clearTimer, []);
  useEffect(() => { if (disabled) { clearTimer(); setOpen(null); } }, [disabled]);

  // Enter or Space opens the menu and puts focus on its first item
  useEffect(() => {
    if (open === "key") itemRefs.current[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  const onEnter = useCallback(() => {
    if (disabled) return;
    clearTimer();
    setOpen((prev) => prev ?? "hover");
  }, [disabled]);

  const onLeave = useCallback(() => {
    clearTimer();
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setOpen((prev) => (prev === "hover" ? null : prev));
    }, FILTER_MENU_HOVER_CLOSE_MS);
  }, []);

  const onButtonClick = () => {
    if (disabled) return;
    clearTimer();
    setOpen((prev) => (prev === "click" ? null : "click"));
  };

  const onButtonKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      clearTimer();
      setOpen("key");
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const at = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      itemRefs.current[Math.min(at + 1, items.length - 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      itemRefs.current[Math.max(at - 1, 0)]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(null);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className="filter-menu-wrap" ref={wrapRef} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        ref={buttonRef}
        type="button"
        className="btn filter-menu-button"
        aria-label="Filter"
        title="Filter"
        aria-haspopup="menu"
        aria-expanded={open !== null}
        aria-disabled={disabled ? "true" : undefined}
        onClick={onButtonClick}
        onKeyDown={onButtonKeyDown}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>
      {open && !disabled && (
        <div className="filter-menu" role="menu" aria-label="Filter" onKeyDown={onMenuKeyDown}>
          {items.map((item, i) => (
            <Fragment key={item.value}>
              {item.separatorBefore && <div className="filter-menu-sep" role="separator" />}
              <button
                ref={(el) => { itemRefs.current[i] = el; }}
                type="button"
                role="menuitemradio"
                aria-checked={value(item)}
                className="filter-menu-item"
                onClick={() => { onSelect(item); setOpen(null); buttonRef.current?.focus(); }}
              >{item.label}</button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
