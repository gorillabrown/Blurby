import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface TagPickerOverlayProps {
  mode: "tag" | "collection";
  currentTags: string[];
  currentCollection: string | null;
  allTags: string[];
  allCollections: string[];
  onToggleTag: (tag: string) => void;
  onMoveCollection: (collection: string | null) => void;
  onClose: () => void;
}

export default function TagPickerOverlay({
  mode,
  currentTags,
  currentCollection,
  allTags,
  allCollections,
  onToggleTag,
  onMoveCollection,
  onClose,
}: TagPickerOverlayProps) {
  const [filter, setFilter] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const isTagMode = mode === "tag";
  const baseItems = isTagMode ? allTags : allCollections;
  const filterLower = filter.toLowerCase().trim();

  // Filter existing items
  const filteredItems = baseItems.filter((item) =>
    filterLower === "" || item.toLowerCase().includes(filterLower)
  );

  // If the typed value doesn't match any existing item exactly, offer "Create" option
  const canCreate =
    filterLower !== "" &&
    !baseItems.some((item) => item.toLowerCase() === filterLower);

  // Final item list: existing matches + optional "create new" at bottom
  const displayItems: Array<{ value: string; isNew: boolean }> = [
    ...filteredItems.map((v) => ({ value: v, isNew: false })),
    ...(canCreate ? [{ value: filter.trim(), isNew: true }] : []),
  ];

  useFocusTrap(containerRef, [displayItems]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [filter]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[focusedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  const selectItem = useCallback(
    (item: { value: string; isNew: boolean }) => {
      if (isTagMode) {
        onToggleTag(item.value);
        // In tag mode, stay open to allow multi-tag selection
        setFilter("");
      } else {
        onMoveCollection(item.value);
        onClose();
      }
    },
    [isTagMode, onToggleTag, onMoveCollection, onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, displayItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = displayItems[focusedIndex];
        if (item) selectItem(item);
      }
    },
    [onClose, displayItems, focusedIndex, selectItem]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const title = isTagMode ? "Tag document" : "Move to collection";
  const placeholder = isTagMode
    ? "Filter or create tag..."
    : "Filter or create collection...";

  return (
    <div
      className="tag-picker-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="tag-picker-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tag-picker-header">
          <span className="tag-picker-title">{title}</span>
          {isTagMode && (
            <span className="tag-picker-hint">
              Press Enter to toggle. Escape to close.
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          className="tag-picker-input"
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-autocomplete="list"
          aria-controls="tag-picker-list"
          aria-activedescendant={
            displayItems[focusedIndex]
              ? `tag-item-${focusedIndex}`
              : undefined
          }
          spellCheck={false}
          autoComplete="off"
        />

        {displayItems.length === 0 ? (
          <div className="tag-picker-empty" role="status">
            {filterLower
              ? "No matches — type to create new"
              : isTagMode
              ? "No tags yet"
              : "No collections yet"}
          </div>
        ) : (
          <ul
            id="tag-picker-list"
            ref={listRef}
            className="tag-picker-list"
            role="listbox"
            aria-label={isTagMode ? "Tags" : "Collections"}
            aria-multiselectable={isTagMode}
          >
            {displayItems.map((item, i) => {
              const isSelected = isTagMode
                ? currentTags.includes(item.value)
                : currentCollection === item.value;
              const isFocused = i === focusedIndex;

              return (
                <li
                  key={`${item.value}-${i}`}
                  id={`tag-item-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    "tag-picker-item",
                    isFocused ? "tag-picker-item--focused" : "",
                    isSelected ? "tag-picker-item--selected" : "",
                    item.isNew ? "tag-picker-item--new" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => setFocusedIndex(i)}
                  onClick={() => selectItem(item)}
                >
                  {isTagMode && (
                    <span
                      className="tag-picker-checkbox"
                      aria-hidden="true"
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  )}
                  {!isTagMode && (
                    <span
                      className="tag-picker-radio"
                      aria-hidden="true"
                    >
                      {isSelected ? "●" : "○"}
                    </span>
                  )}
                  <span className="tag-picker-item-label">
                    {item.isNew ? `Create "${item.value}"` : item.value}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {isTagMode && currentTags.length > 0 && (
          <div className="tag-picker-current" aria-label="Current tags">
            {currentTags.map((tag) => (
              <span key={tag} className="tag-picker-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
