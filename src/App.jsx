import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_WPM = 300;
const MIN_WPM = 100;
const MAX_WPM = 1200;
const WPM_STEP = 25;
const REWIND_WORDS = 5;

const api = window.electronAPI;

function tokenize(text) {
  return (text || "").split(/\s+/).filter(Boolean);
}

function formatTime(words, wpm) {
  if (!wpm || !words) return "0m";
  const mins = Math.round(words / wpm);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/* ── Tiny components ─────────────────────────────────────────────────────────── */

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "#e8e4de", borderRadius: 2, transition: "width 0.15s ease" }} />
    </div>
  );
}

function WpmGauge({ wpm }) {
  const pct = ((wpm - MIN_WPM) / (MAX_WPM - MIN_WPM)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 80, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#c4a882", borderRadius: 2, transition: "width 0.12s ease" }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#c4a882", minWidth: 65, textAlign: "right" }}>{wpm} wpm</span>
    </div>
  );
}

function Badge({ children, color = "#888" }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: "var(--mono)", background: `${color}18`,
      color, padding: "2px 8px", borderRadius: 4, fontWeight: 500, letterSpacing: 0.5,
    }}>{children}</span>
  );
}

/* ── Optimal recognition point ───────────────────────────────────────────────── */

function focusChar(word) {
  if (!word) return { before: "", focus: "", after: "" };
  const len = word.length;
  let pivot;
  if (len <= 1) pivot = 0;
  else if (len <= 5) pivot = 1;
  else if (len <= 9) pivot = 2;
  else if (len <= 13) pivot = 3;
  else pivot = 4;
  return { before: word.slice(0, pivot), focus: word[pivot], after: word.slice(pivot + 1) };
}

/* ── App ─────────────────────────────────────────────────────────────────────── */

export default function App() {
  const [view, setView] = useState("library");
  const [library, setLibrary] = useState([]);
  const [settings, setSettings] = useState({ wpm: DEFAULT_WPM, sourceFolder: null, folderName: "My reading list" });
  const [activeDoc, setActiveDoc] = useState(null);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [wordIndex, setWordIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [folderName, setFolderName] = useState("My reading list");
  const [editFolder, setEditFolder] = useState(false);
  const [platform, setPlatform] = useState("win32");
  const [searchQuery, setSearchQuery] = useState("");

  const intervalRef = useRef(null);
  const wordsRef = useRef([]);
  const wordIndexRef = useRef(0);
  const playingRef = useRef(false);
  const wpmRef = useRef(DEFAULT_WPM);
  const containerRef = useRef(null);

  /* ── Load initial state ──────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const state = await api.getState();
      const plat = await api.getPlatform();
      setPlatform(plat);
      setSettings(state.settings);
      setLibrary(state.library);
      setWpm(state.settings.wpm || DEFAULT_WPM);
      wpmRef.current = state.settings.wpm || DEFAULT_WPM;
      setFolderName(state.settings.folderName || "My reading list");
      setLoaded(true);
    })();

    const unsub = api.onLibraryUpdated((lib) => setLibrary(lib));
    return () => unsub();
  }, []);

  /* ── Persist settings ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (loaded) {
      api.saveSettings({ wpm, folderName });
      wpmRef.current = wpm;
    }
  }, [wpm, folderName, loaded]);

  const words = activeDoc ? tokenize(activeDoc.content) : [];
  wordsRef.current = words;

  /* ── Playback engine ─────────────────────────────────────────────────────── */
  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    const ms = Math.round(60000 / wpmRef.current);
    intervalRef.current = setInterval(() => {
      setWordIndex((prev) => {
        const next = prev + 1;
        if (next >= wordsRef.current.length) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          playingRef.current = false;
          return prev;
        }
        wordIndexRef.current = next;
        return next;
      });
    }, ms);
  }, []);

  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      clearInterval(intervalRef.current);
      setPlaying(false);
      playingRef.current = false;
    } else {
      if (wordIndexRef.current >= wordsRef.current.length - 1) {
        setWordIndex(0);
        wordIndexRef.current = 0;
      }
      setPlaying(true);
      playingRef.current = true;
      startInterval();
    }
  }, [startInterval]);

  const adjustWpm = useCallback((delta) => {
    setWpm((prev) => {
      const next = Math.max(MIN_WPM, Math.min(MAX_WPM, prev + delta));
      wpmRef.current = next;
      if (playingRef.current) startInterval();
      return next;
    });
  }, [startInterval]);

  const seekWords = useCallback((delta) => {
    setWordIndex((prev) => {
      const next = Math.max(0, Math.min(wordsRef.current.length - 1, prev + delta));
      wordIndexRef.current = next;
      return next;
    });
  }, []);

  const exitReader = useCallback(() => {
    clearInterval(intervalRef.current);
    setPlaying(false);
    playingRef.current = false;
    if (activeDoc) {
      api.updateDocProgress(activeDoc.id, wordIndexRef.current);
      setLibrary((prev) =>
        prev.map((d) => (d.id === activeDoc.id ? { ...d, position: wordIndexRef.current } : d))
      );
    }
    setActiveDoc(null);
    setWordIndex(0);
    wordIndexRef.current = 0;
    setView("library");
  }, [activeDoc]);

  /* ── Reader hotkeys ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (view !== "reader") return;
    const handler = (e) => {
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); seekWords(-REWIND_WORDS); }
      else if (e.code === "ArrowRight") { e.preventDefault(); seekWords(REWIND_WORDS); }
      else if (e.code === "ArrowUp") { e.preventDefault(); adjustWpm(WPM_STEP); }
      else if (e.code === "ArrowDown") { e.preventDefault(); adjustWpm(-WPM_STEP); }
      else if (e.code === "Escape") { e.preventDefault(); exitReader(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, togglePlay, seekWords, adjustWpm, exitReader]);

  /* ── Alt+V quick read ────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.altKey || e.metaKey) && e.code === "KeyV") {
        e.preventDefault();
        const sel = window.getSelection().toString().trim();
        if (sel && view === "library") {
          (async () => {
            const title = sel.slice(0, 40) + (sel.length > 40 ? "..." : "");
            const doc = await api.addManualDoc(title, sel);
            setLibrary((prev) => [doc, ...prev]);
            openDoc(doc);
          })();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [library, view]);

  /* ── Library actions ─────────────────────────────────────────────────────── */
  const openDoc = (doc) => {
    setActiveDoc(doc);
    const pos = doc.position || 0;
    setWordIndex(pos);
    wordIndexRef.current = pos;
    setView("reader");
    setTimeout(() => containerRef.current?.focus(), 50);
  };

  const addDoc = async () => {
    if (!newTitle.trim() || !newText.trim()) return;
    if (editingId) {
      await api.updateDoc(editingId, newTitle.trim(), newText.trim());
      setLibrary((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, title: newTitle.trim(), content: newText.trim() } : d))
      );
      setEditingId(null);
    } else {
      const doc = await api.addManualDoc(newTitle.trim(), newText.trim());
      setLibrary((prev) => [doc, ...prev]);
    }
    setNewTitle("");
    setNewText("");
    setShowAdd(false);
  };

  const deleteDoc = async (id) => {
    await api.deleteDoc(id);
    setLibrary((prev) => prev.filter((d) => d.id !== id));
    setConfirmDelete(null);
  };

  const resetProgress = async (id) => {
    await api.resetProgress(id);
    setLibrary((prev) => prev.map((d) => (d.id === id ? { ...d, position: 0 } : d)));
  };

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setNewTitle(doc.title);
    setNewText(doc.content);
    setShowAdd(true);
  };

  const selectFolder = async () => {
    const folder = await api.selectFolder();
    if (folder) {
      setSettings((prev) => ({ ...prev, sourceFolder: folder }));
      const state = await api.getState();
      setLibrary(state.library);
    }
  };

  const filteredLibrary = library.filter((d) =>
    !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMac = platform === "darwin";

  /* ── CSS variables ───────────────────────────────────────────────────────── */
  const cssVars = {
    "--bg": "#0f0f0f",
    "--bg-raised": "#181818",
    "--bg-hover": "#1e1e1e",
    "--border": "#2a2a2a",
    "--border-light": "#222",
    "--text": "#e8e4de",
    "--text-dim": "#888",
    "--text-dimmer": "#555",
    "--accent": "#c4a882",
    "--accent-glow": "rgba(196,168,130,0.3)",
    "--danger": "#e24b4a",
    "--success": "#639922",
    "--mono": "'SF Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    "--serif": "'Georgia', 'Crimson Pro', 'Times New Roman', serif",
  };

  if (!loaded) {
    return (
      <div style={{ ...cssVars, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text-dim)", fontFamily: "var(--mono)", fontSize: 14 }}>
        loading...
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════ */
  /* ── READER VIEW                                                         ── */
  /* ══════════════════════════════════════════════════════════════════════════ */

  if (view === "reader" && activeDoc) {
    const currentWord = words[wordIndex] || "";
    const { before, focus, after } = focusChar(currentWord);
    const pct = words.length > 0 ? Math.round((wordIndex / words.length) * 100) : 0;
    const remaining = formatTime(words.length - wordIndex, wpm);

    return (
      <div
        ref={containerRef}
        tabIndex={0}
        style={{
          ...cssVars,
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#050505",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "var(--mono)",
          outline: "none", cursor: "none", userSelect: "none",
          WebkitAppRegion: "no-drag",
        }}
        onClick={togglePlay}
      >
        {/* ── Top bar ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: `${isMac ? 36 : 16}px 32px 16px`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          opacity: playing ? 0.12 : 0.55, transition: "opacity 0.5s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={(e) => { e.stopPropagation(); exitReader(); }}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#777", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)",
                padding: "5px 10px", borderRadius: 4, letterSpacing: 1,
              }}
            >ESC</button>
            <span style={{ color: "#444", fontSize: 13, maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeDoc.title}</span>
          </div>
          <WpmGauge wpm={wpm} />
        </div>

        {/* ── Word display ── */}
        <div style={{ position: "relative", width: "100%", maxWidth: 900, padding: "0 60px" }}>
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 1, height: 40, background: "rgba(196,168,130,0.2)" }} />

          <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", minHeight: 90 }}>
            <span style={{ fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 300, letterSpacing: 2, color: "var(--text)", textAlign: "right", minWidth: "40%", direction: "rtl", unicodeBidi: "bidi-override" }}>
              {before.split("").reverse().join("")}
            </span>
            <span style={{ fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 600, color: "var(--accent)", textShadow: `0 0 30px var(--accent-glow)`, margin: "0 1px" }}>
              {focus}
            </span>
            <span style={{ fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 300, letterSpacing: 2, color: "var(--text)", textAlign: "left", minWidth: "40%" }}>
              {after}
            </span>
          </div>

          <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 1, height: 40, background: "rgba(196,168,130,0.2)" }} />
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 32px 24px",
          opacity: playing ? 0.08 : 0.45, transition: "opacity 0.5s ease",
        }}>
          <ProgressBar current={wordIndex} total={words.length} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#555", fontFamily: "var(--mono)" }}>
            <span>{pct}%</span>
            <span style={{ display: "flex", gap: 20 }}>
              <span>← →  rewind</span>
              <span>↑ ↓  speed</span>
              <span>space  {playing ? "pause" : "play"}</span>
            </span>
            <span>{remaining} left</span>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════ */
  /* ── LIBRARY VIEW                                                        ── */
  /* ══════════════════════════════════════════════════════════════════════════ */

  const totalWords = library.reduce((a, d) => a + tokenize(d.content).length, 0);

  return (
    <div style={{
      ...cssVars,
      height: "100vh",
      display: "flex", flexDirection: "column",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--serif)",
    }}>
      {/* ── Draggable titlebar ── */}
      <div style={{ height: isMac ? 48 : 32, flexShrink: 0, WebkitAppRegion: "drag" }} />

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 40px 40px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            {editFolder ? (
              <input
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onBlur={() => setEditFolder(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditFolder(false)}
                style={{ fontSize: 26, fontWeight: 300, fontFamily: "var(--serif)", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "var(--text)", outline: "none", padding: "2px 0", width: 400, WebkitAppRegion: "no-drag" }}
              />
            ) : (
              <h1
                onClick={() => setEditFolder(true)}
                style={{ fontSize: 26, fontWeight: 300, margin: 0, cursor: "pointer", letterSpacing: -0.3, WebkitAppRegion: "no-drag" }}
                title="Click to rename"
              >{folderName}</h1>
            )}
            <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "6px 0 0", fontFamily: "var(--mono)" }}>
              {library.length} {library.length === 1 ? "source" : "sources"}
              {totalWords > 0 && <> · {formatTime(totalWords, wpm)} total at {wpm} wpm</>}
              {settings.sourceFolder && <> · <span style={{ color: "var(--accent)" }}>{settings.sourceFolder.split(/[/\\]/).pop()}</span></>}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, WebkitAppRegion: "no-drag" }}>
            <button onClick={() => setShowHelp(!showHelp)} style={btnStyle}>?</button>
            <button onClick={selectFolder} style={btnStyle}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: -1 }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              folder
            </button>
            <button onClick={() => { setShowAdd(true); setEditingId(null); setNewTitle(""); setNewText(""); }} style={btnFillStyle}>+ add</button>
          </div>
        </div>

        {/* ── Help panel ── */}
        {showHelp && (
          <div style={{
            background: "var(--bg-raised)", borderRadius: 8, border: "1px solid var(--border)",
            padding: "18px 22px", marginBottom: 20, fontSize: 12,
            fontFamily: "var(--mono)", color: "var(--text-dim)", lineHeight: 2.2,
          }}>
            <div style={{ fontWeight: 500, color: "var(--text)", marginBottom: 6, fontSize: 13 }}>Keyboard shortcuts</div>
            <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "0 16px" }}>
              <span style={{ color: "var(--text)" }}>Space</span><span>Play / Pause</span>
              <span style={{ color: "var(--text)" }}>← / →</span><span>Rewind / Forward {REWIND_WORDS} words</span>
              <span style={{ color: "var(--text)" }}>↑ / ↓</span><span>Speed ±{WPM_STEP} wpm</span>
              <span style={{ color: "var(--text)" }}>Esc</span><span>Exit reader (auto-saves position)</span>
              <span style={{ color: "var(--text)" }}>{isMac ? "⌥" : "Alt"}+V</span><span>Quick-read selected text</span>
            </div>
            <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <div style={{ fontWeight: 500, color: "var(--text)", marginBottom: 4, fontSize: 13 }}>Folder sync</div>
              <span>Click "folder" to pick a directory. Files (.txt, .md) are auto-imported and watched for changes.</span>
            </div>
          </div>
        )}

        {/* ── Search bar ── */}
        {library.length > 3 && (
          <div style={{ marginBottom: 16 }}>
            <input
              placeholder="Filter sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-raised)", border: "1px solid var(--border)",
                borderRadius: 6, fontSize: 13, fontFamily: "var(--mono)",
                color: "var(--text)", padding: "10px 14px", outline: "none",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>
        )}

        {/* ── Add / Edit panel ── */}
        {showAdd && (
          <div style={{
            background: "var(--bg-raised)", borderRadius: 8,
            border: "1px solid var(--border)",
            padding: 22, marginBottom: 20,
          }}>
            <input
              autoFocus
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                width: "100%", background: "transparent", border: "none",
                borderBottom: "1px solid var(--border)",
                fontSize: 17, fontFamily: "var(--serif)", fontWeight: 400,
                color: "var(--text)", padding: "8px 0", marginBottom: 14, outline: "none",
              }}
            />
            <textarea
              placeholder="Paste your reading material here..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={8}
              style={{
                width: "100%", background: "transparent",
                border: "1px solid var(--border)", borderRadius: 6,
                fontSize: 14, fontFamily: "var(--serif)", lineHeight: 1.7,
                color: "var(--text)", padding: 14, resize: "vertical", outline: "none",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
              <button onClick={() => { setShowAdd(false); setEditingId(null); }} style={btnStyle}>cancel</button>
              <button
                onClick={addDoc}
                disabled={!newTitle.trim() || !newText.trim()}
                style={{
                  ...btnFillStyle,
                  opacity: newTitle.trim() && newText.trim() ? 1 : 0.3,
                  cursor: newTitle.trim() && newText.trim() ? "pointer" : "default",
                }}
              >{editingId ? "save" : "add"}</button>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {library.length === 0 && !showAdd && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-dim)" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2, marginBottom: 16 }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <p style={{ fontSize: 16, marginBottom: 6 }}>Your library is empty</p>
            <p style={{ fontSize: 13 }}>Pick a source folder or add text manually to begin</p>
          </div>
        )}

        {/* ── Document list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredLibrary.map((doc) => {
            const docWords = tokenize(doc.content);
            const pos = doc.position || 0;
            const progress = docWords.length > 0 ? Math.round((pos / docWords.length) * 100) : 0;
            const isComplete = pos >= docWords.length - 1 && docWords.length > 0;
            const readTime = formatTime(docWords.length, wpm);

            return (
              <div key={doc.id} style={{ position: "relative" }}>
                <div
                  onClick={() => openDoc(doc)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 18px", borderRadius: 6, cursor: "pointer",
                    transition: "background 0.12s ease",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 17, fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.title}
                      </span>
                      {doc.source === "folder" && <Badge color="#c4a882">file</Badge>}
                      {isComplete && <Badge color="var(--success)">done</Badge>}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-dimmer)", display: "flex", gap: 14 }}>
                      <span>{docWords.length.toLocaleString()} words</span>
                      <span>{readTime}</span>
                      {doc.ext && <span>{doc.ext}</span>}
                      {pos > 0 && !isComplete && <span style={{ color: "var(--accent)" }}>{progress}%</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 2, marginLeft: 12 }} onClick={(e) => e.stopPropagation()}>
                    {pos > 0 && <IconBtn onClick={() => resetProgress(doc.id)} title="Reset" icon="reset" />}
                    {doc.source !== "folder" && <IconBtn onClick={() => startEdit(doc)} title="Edit" icon="edit" />}
                    <IconBtn onClick={() => setConfirmDelete(doc.id)} title="Delete" icon="delete" danger />
                  </div>
                </div>

                {confirmDelete === doc.id && (
                  <div style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "var(--bg-raised)", border: "1px solid #4a1515",
                    borderRadius: 6, padding: "8px 12px",
                    display: "flex", gap: 6, alignItems: "center", zIndex: 10,
                    fontFamily: "var(--mono)", fontSize: 11,
                  }}>
                    <span style={{ color: "var(--text-dim)" }}>Delete?</span>
                    <button onClick={() => deleteDoc(doc.id)} style={{ ...btnStyle, background: "#4a1515", color: "#e24b4a", border: "none", padding: "3px 10px" }}>yes</button>
                    <button onClick={() => setConfirmDelete(null)} style={{ ...btnStyle, padding: "3px 10px" }}>no</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer controls ── */}
        <div style={{
          marginTop: 36, paddingTop: 18,
          borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-dimmer)", display: "flex", alignItems: "center", gap: 14 }}>
            <span>speed</span>
            <input
              type="range" min={MIN_WPM} max={MAX_WPM} step={WPM_STEP} value={wpm}
              onChange={(e) => { setWpm(Number(e.target.value)); wpmRef.current = Number(e.target.value); }}
              style={{ width: 120, accentColor: "var(--accent)" }}
            />
            <span style={{ minWidth: 60 }}>{wpm} wpm</span>
          </div>
          {settings.sourceFolder && (
            <button onClick={selectFolder} style={{ ...btnStyle, fontSize: 10, color: "var(--text-dimmer)" }}>
              change folder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Icon button ─────────────────────────────────────────────────────────────── */

function IconBtn({ onClick, title, icon, danger }) {
  const paths = {
    reset: <><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    delete: <><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  };
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ background: "transparent", border: "none", color: "#444", cursor: "pointer", padding: 6, borderRadius: 4, transition: "color 0.15s" }}
      onMouseEnter={(e) => e.currentTarget.style.color = danger ? "var(--danger)" : "#888"}
      onMouseLeave={(e) => e.currentTarget.style.color = "#444"}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{paths[icon]}</svg>
    </button>
  );
}

/* ── Shared button styles ────────────────────────────────────────────────────── */

const btnStyle = {
  background: "transparent",
  border: "1px solid #2a2a2a",
  borderRadius: 6,
  padding: "7px 14px",
  fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
  fontSize: 11,
  color: "#888",
  cursor: "pointer",
  transition: "all 0.12s ease",
};

const btnFillStyle = {
  background: "#e8e4de",
  color: "#111",
  border: "none",
  borderRadius: 6,
  padding: "7px 16px",
  fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  letterSpacing: 0.3,
};
