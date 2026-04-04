import { useState, useEffect, useCallback } from "react";
import type { BlurbySettings, PronunciationOverride, NarrationProfile } from "../../types";
import { KOKORO_VOICE_NAMES, TTS_MAX_RATE, TTS_MIN_RATE, TTS_PAUSE_COMMA_MS, TTS_PAUSE_CLAUSE_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS, TTS_DIALOGUE_SENTENCE_THRESHOLD, KOKORO_RATE_BUCKETS, resolveKokoroBucket, MAX_PRONUNCIATION_OVERRIDES, MAX_NARRATION_PROFILES, createDefaultNarrationProfile, profileFromSettings } from "../../constants";
import { applyPronunciationOverrides } from "../../utils/pronunciationOverrides";

const api = window.electronAPI;

interface TTSSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
  /** Per-book pronunciation overrides for the currently open book (if any) */
  bookOverrides?: PronunciationOverride[];
  /** Called when user edits per-book overrides */
  onBookOverridesChange?: (overrides: PronunciationOverride[]) => void;
  /** Title of the currently open book (for display) */
  activeBookTitle?: string;
  /** Per-book narration profile ID */
  bookNarrationProfileId?: string | null;
  /** Called when user assigns/clears a profile for the active book */
  onBookNarrationProfileChange?: (profileId: string | null) => void;
}

export function TTSSettings({ settings, onSettingsChange, bookOverrides, onBookOverridesChange, activeBookTitle, bookNarrationProfileId, onBookNarrationProfileChange }: TTSSettingsProps) {
  const engine = settings.ttsEngine || "web";

  // Web Speech API voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testPlaying, setTestPlaying] = useState(false);

  // Kokoro state
  const [kokoroReady, setKokoroReady] = useState(false);
  const [kokoroDownloading, setKokoroDownloading] = useState(false);
  const [kokoroProgress, setKokoroProgress] = useState(0);
  const [kokoroVoices, setKokoroVoices] = useState<string[]>([]);
  const [kokoroWarming, setKokoroWarming] = useState(false);
  const [kokoroError, setKokoroError] = useState<string | null>(null);
  const [kokoroStalled, setKokoroStalled] = useState(false);

  // Load Web Speech voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Check Kokoro model status
  useEffect(() => {
    if (!api?.kokoroModelStatus) return;
    api.kokoroModelStatus().then((r: { ready: boolean }) => {
      setKokoroReady(r.ready);
      if (r.ready && api.kokoroVoices) {
        api.kokoroVoices().then((vr: { voices?: string[] }) => {
          if (vr.voices) setKokoroVoices(vr.voices);
        });
      }
    }).catch(() => {});

    const cleanups: (() => void)[] = [];
    if (api.onKokoroDownloadProgress) {
      cleanups.push(api.onKokoroDownloadProgress((progress: number) => {
        setKokoroProgress(progress);
        setKokoroStalled(false);
        if (progress >= 100) {
          setKokoroReady(true);
          setKokoroDownloading(false);
        }
      }));
    }
    if (api.onKokoroDownloadError) {
      cleanups.push(api.onKokoroDownloadError((error: string) => {
        setKokoroError(error);
        setKokoroDownloading(false);
      }));
    }
    if (api.onKokoroEngineStatus) {
      cleanups.push(api.onKokoroEngineStatus((data: { status: string }) => {
        setKokoroWarming(data.status === "warming");
        if (data.status === "ready") { setKokoroReady(true); setKokoroWarming(false); }
      }));
    }
    return () => cleanups.forEach((c) => c());
  }, []);

  // Stall detection: if downloading and progress stays at 0% for 30s
  useEffect(() => {
    if (!kokoroDownloading || kokoroProgress > 0) {
      setKokoroStalled(false);
      return;
    }
    const timer = setTimeout(() => setKokoroStalled(true), 30000);
    return () => clearTimeout(timer);
  }, [kokoroDownloading, kokoroProgress]);

  const handleDownloadKokoro = async () => {
    if (!api?.kokoroDownload) return;
    setKokoroDownloading(true);
    setKokoroProgress(0);
    setKokoroError(null);
    setKokoroStalled(false);
    try {
      const result = await api.kokoroDownload();
      if (result.error) {
        setKokoroError(result.error);
      } else {
        setKokoroReady(true);
        if (api.kokoroVoices) {
          const vr = await api.kokoroVoices();
          if (vr.voices) setKokoroVoices(vr.voices);
        }
      }
    } catch { /* handled by error listener */ }
    setKokoroDownloading(false);
  };

  const handleTestVoice = async () => {
    if (engine === "kokoro" && kokoroReady && api?.kokoroGenerate) {
      setTestPlaying(true);
      try {
        const voice = settings.ttsVoiceName || "af_bella";
        const result = await api.kokoroGenerate(
          "The quick brown fox jumps over the lazy dog.",
          voice,
          resolveKokoroBucket(settings.ttsRate || 1.0)
        );
        if (!result.error && result.audio) {
          const { playBuffer } = await import("../../utils/audioPlayer");
          playBuffer(
            result.audio,
            result.sampleRate ?? 24000,
            result.durationMs ?? 0,
            9, // word count of test sentence
            undefined,
            () => setTestPlaying(false),
          );
        } else {
          setTestPlaying(false);
        }
      } catch {
        setTestPlaying(false);
      }
    } else {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("The quick brown fox jumps over the lazy dog.");
      const voice = voices.find((v) => v.name === settings.ttsVoiceName);
      if (voice) utterance.voice = voice;
      utterance.rate = settings.ttsRate || 1.0;
      utterance.onend = () => setTestPlaying(false);
      utterance.onerror = () => setTestPlaying(false);
      setTestPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // ── Profile management ──────────────────────────────────────────────────
  const profiles = settings.narrationProfiles || [];
  const activeProfileId = settings.activeNarrationProfileId || null;
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleCreateProfile = useCallback(() => {
    if (profiles.length >= MAX_NARRATION_PROFILES) return;
    const profile = profileFromSettings(`Profile ${profiles.length + 1}`, settings);
    onSettingsChange({
      narrationProfiles: [...profiles, profile],
      activeNarrationProfileId: profile.id,
    });
  }, [profiles, settings, onSettingsChange]);

  const handleSelectProfile = useCallback((id: string | null) => {
    if (id === null) {
      onSettingsChange({ activeNarrationProfileId: null });
      return;
    }
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    // Apply profile settings to flat settings for immediate effect
    onSettingsChange({
      activeNarrationProfileId: id,
      ttsEngine: profile.ttsEngine,
      ttsVoiceName: profile.ttsVoiceName,
      ttsRate: profile.ttsRate,
      ttsPauseCommaMs: profile.ttsPauseCommaMs,
      ttsPauseClauseMs: profile.ttsPauseClauseMs,
      ttsPauseSentenceMs: profile.ttsPauseSentenceMs,
      ttsPauseParagraphMs: profile.ttsPauseParagraphMs,
      ttsDialogueSentenceThreshold: profile.ttsDialogueSentenceThreshold,
      pronunciationOverrides: profile.pronunciationOverrides,
    });
  }, [profiles, onSettingsChange]);

  const handleDeleteProfile = useCallback((id: string) => {
    const next = profiles.filter(p => p.id !== id);
    const updates: Partial<BlurbySettings> = { narrationProfiles: next };
    if (activeProfileId === id) updates.activeNarrationProfileId = null;
    onSettingsChange(updates);
  }, [profiles, activeProfileId, onSettingsChange]);

  const handleRenameProfile = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;
    onSettingsChange({
      narrationProfiles: profiles.map(p =>
        p.id === id ? { ...p, name: newName.trim(), updatedAt: Date.now() } : p
      ),
    });
    setRenamingId(null);
  }, [profiles, onSettingsChange]);

  // Sync changes back to the active profile when user adjusts flat TTS settings
  const syncToActiveProfile = useCallback((updates: Partial<BlurbySettings>) => {
    onSettingsChange(updates);
    if (!activeProfileId) return;
    // Mirror TTS-related changes into the active profile
    const ttsKeys: (keyof BlurbySettings)[] = [
      "ttsEngine", "ttsVoiceName", "ttsRate",
      "ttsPauseCommaMs", "ttsPauseClauseMs", "ttsPauseSentenceMs",
      "ttsPauseParagraphMs", "ttsDialogueSentenceThreshold", "pronunciationOverrides",
    ];
    const hasTtsChange = ttsKeys.some(k => k in updates);
    if (hasTtsChange) {
      const merged = { ...settings, ...updates };
      onSettingsChange({
        narrationProfiles: profiles.map(p =>
          p.id === activeProfileId ? {
            ...p,
            ttsEngine: merged.ttsEngine || "web",
            ttsVoiceName: merged.ttsVoiceName || null,
            ttsRate: merged.ttsRate || 1.0,
            ttsPauseCommaMs: merged.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS,
            ttsPauseClauseMs: merged.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS,
            ttsPauseSentenceMs: merged.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS,
            ttsPauseParagraphMs: merged.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS,
            ttsDialogueSentenceThreshold: merged.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD,
            pronunciationOverrides: merged.pronunciationOverrides ? [...merged.pronunciationOverrides] : [],
            updatedAt: Date.now(),
          } : p
        ),
      });
    }
  }, [activeProfileId, settings, profiles, onSettingsChange]);

  // Use syncToActiveProfile instead of raw onSettingsChange for TTS controls
  const handleTtsChange = activeProfileId ? syncToActiveProfile : onSettingsChange;

  return (
    <div>
      {/* Narration Profiles (TTS-6L) */}
      <div className="settings-section-label">Narration Profile</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <select
          className="settings-select"
          value={activeProfileId || ""}
          onChange={(e) => handleSelectProfile(e.target.value || null)}
          aria-label="Narration profile"
          style={{ flex: 1, padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: 12 }}
        >
          <option value="">No profile (flat settings)</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {profiles.length < MAX_NARRATION_PROFILES && (
          <button
            onClick={handleCreateProfile}
            style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}
            aria-label="Create narration profile"
          >+ New</button>
        )}
      </div>
      {activeProfileId && profiles.find(p => p.id === activeProfileId) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          {renamingId === activeProfileId ? (
            <>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRenameProfile(activeProfileId, renameValue); if (e.key === "Escape") setRenamingId(null); }}
                autoFocus
                style={{ flex: 1, padding: "4px 6px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: 11 }}
                aria-label="Profile name"
              />
              <button
                onClick={() => handleRenameProfile(activeProfileId, renameValue)}
                style={{ padding: "3px 8px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", cursor: "pointer", fontSize: 11 }}
              >Save</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setRenamingId(activeProfileId); setRenameValue(profiles.find(p => p.id === activeProfileId)?.name || ""); }}
                style={{ padding: "3px 8px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", cursor: "pointer", fontSize: 11 }}
                aria-label="Rename profile"
              >Rename</button>
              <button
                onClick={() => { if (confirm(`Delete profile "${profiles.find(p => p.id === activeProfileId)?.name}"?`)) handleDeleteProfile(activeProfileId); }}
                style={{ padding: "3px 8px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--error, #c44)", cursor: "pointer", fontSize: 11 }}
                aria-label="Delete profile"
              >Delete</button>
            </>
          )}
        </div>
      )}
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>
        {activeProfileId ? "Changes below are saved to this profile." : "Save your voice and timing settings as a named profile for quick switching."}
      </div>

      {/* Book-level profile assignment */}
      {activeBookTitle && onBookNarrationProfileChange && profiles.length > 0 && (
        <>
          <div className="settings-toggle-row" style={{ marginBottom: 8 }}>
            <span className="settings-toggle-label" style={{ fontSize: 12 }}>Profile for this book</span>
            <select
              className="settings-select"
              value={bookNarrationProfileId || ""}
              onChange={(e) => onBookNarrationProfileChange(e.target.value || null)}
              aria-label="Book narration profile"
              style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: 11 }}
            >
              <option value="">Use default</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>
            Override the default profile when narrating "{activeBookTitle}".
          </div>
        </>
      )}

      <div className="settings-section-label">Voice Engine</div>

      {/* Engine selector */}
      <div className="settings-mode-toggle" style={{ marginBottom: 12 }}>
        <button
          className={`settings-mode-btn${engine === "web" ? " active" : ""}`}
          onClick={() => handleTtsChange({ ttsEngine: "web", ttsVoiceName: null })}
        >
          System
        </button>
        <button
          className={`settings-mode-btn${engine === "kokoro" ? " active" : ""}`}
          onClick={() => {
            handleTtsChange({ ttsEngine: "kokoro", ttsVoiceName: kokoroReady ? "af_bella" : null });
            if (!kokoroReady && !kokoroDownloading) {
              handleDownloadKokoro();
            }
          }}
        >
          Kokoro AI
        </button>
      </div>

      {/* Kokoro download progress */}
      {engine === "kokoro" && !kokoroReady && (
        <div style={{ marginBottom: 12 }}>
          {kokoroError && (
            <div style={{ fontSize: 11, color: "var(--error, #c44)", marginBottom: 8 }}>
              Download failed: {kokoroError}
            </div>
          )}
          {kokoroStalled && !kokoroError && (
            <div style={{ fontSize: 11, color: "var(--warning, #b80)", marginBottom: 8 }}>
              Download may be blocked by your network or firewall. Check your connection and try again.
            </div>
          )}
          {kokoroDownloading ? (
            <>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>
                Downloading voice model... {kokoroProgress}%
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "var(--bg-raised)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${kokoroProgress}%`, background: "var(--accent)", transition: "width 0.3s" }} />
              </div>
            </>
          ) : (
            <button
              className="settings-btn-secondary"
              onClick={handleDownloadKokoro}
              style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", cursor: "pointer", fontSize: 12 }}
            >
              {kokoroError ? "Retry download (92 MB)" : "Download voice model (92 MB)"}
            </button>
          )}
        </div>
      )}

      {/* Voice picker — changes based on engine */}
      {engine === "kokoro" && kokoroReady && (
        <div className="settings-toggle-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
          <span className="settings-toggle-label">Voice</span>
          <select
            className="settings-select"
            value={settings.ttsVoiceName || "af_bella"}
            onChange={(e) => handleTtsChange({ ttsVoiceName: e.target.value })}
            aria-label="Kokoro voice"
            style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: 12 }}
          >
            {(kokoroVoices.length > 0 ? kokoroVoices : Object.keys(KOKORO_VOICE_NAMES)).map((id) => (
              <option key={id} value={id}>
                {KOKORO_VOICE_NAMES[id] || id}
              </option>
            ))}
          </select>
        </div>
      )}

      {engine === "web" && voices.length > 0 && (
        <div className="settings-toggle-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
          <span className="settings-toggle-label">Voice</span>
          <select
            className="settings-select"
            value={settings.ttsVoiceName || ""}
            onChange={(e) => handleTtsChange({ ttsVoiceName: e.target.value || null })}
            aria-label="TTS voice"
            style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: 12 }}
          >
            <option value="">System default</option>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Speech rate</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{(settings.ttsRate || 1.0).toFixed(1)}x</span>
      </div>
      {engine === "kokoro" ? (
        <div className="settings-mode-toggle" style={{ marginBottom: 4 }}>
          {KOKORO_RATE_BUCKETS.map((bucket) => (
            <button
              key={bucket}
              className={`settings-mode-btn${resolveKokoroBucket(settings.ttsRate || 1.0) === bucket ? " active" : ""}`}
              onClick={() => handleTtsChange({ ttsRate: bucket })}
            >
              {bucket.toFixed(1)}x
            </button>
          ))}
        </div>
      ) : (
        <input
          type="range"
          className="settings-slider"
          min={TTS_MIN_RATE}
          max={TTS_MAX_RATE}
          step={0.1}
          value={settings.ttsRate || 1.0}
          onChange={(e) => handleTtsChange({ ttsRate: Number(e.target.value) })}
          aria-label="TTS speech rate"
        />
      )}

      <button
        className="settings-btn-secondary"
        onClick={handleTestVoice}
        disabled={testPlaying}
        style={{ marginTop: 8, padding: "6px 14px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", cursor: "pointer", fontSize: 12 }}
      >
        {testPlaying ? "Playing..." : "Test voice"}
      </button>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6, marginBottom: 16 }}>
        Press N in the reader to toggle narration. WPM is capped at 400 when narration is active.
        {engine === "kokoro" && kokoroReady && !kokoroWarming && " Using Kokoro AI voices."}
        {engine === "kokoro" && kokoroWarming && " Kokoro is warming up..."}
      </div>

      <div className="settings-section-label">Pause Timing</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Comma pause</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{settings.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS}ms</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={500}
        step={25}
        value={settings.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS}
        onChange={(e) => handleTtsChange({ ttsPauseCommaMs: Number(e.target.value) })}
        aria-label="Comma pause duration"
      />

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Clause pause</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{settings.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS}ms</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={500}
        step={25}
        value={settings.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS}
        onChange={(e) => handleTtsChange({ ttsPauseClauseMs: Number(e.target.value) })}
        aria-label="Clause pause duration"
      />
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
        Pause after colons and closing parentheses.
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Sentence pause</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{settings.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS}ms</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={1500}
        step={50}
        value={settings.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS}
        onChange={(e) => handleTtsChange({ ttsPauseSentenceMs: Number(e.target.value) })}
        aria-label="Sentence pause duration"
      />

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Paragraph pause</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{settings.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS}ms</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={2000}
        step={50}
        value={settings.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS}
        onChange={(e) => handleTtsChange({ ttsPauseParagraphMs: Number(e.target.value) })}
        aria-label="Paragraph pause duration"
      />

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Dialogue threshold</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{settings.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD} sentences</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={1}
        max={5}
        step={1}
        value={settings.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD}
        onChange={(e) => handleTtsChange({ ttsDialogueSentenceThreshold: Number(e.target.value) })}
        aria-label="Dialogue sentence threshold"
      />
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>
        Paragraphs with this many sentences or fewer are treated as dialogue and get a shorter pause.
      </div>

      <PronunciationOverridesEditor
        globalOverrides={settings.pronunciationOverrides || []}
        onGlobalChange={(overrides) => handleTtsChange({ pronunciationOverrides: overrides })}
        bookOverrides={bookOverrides}
        onBookChange={onBookOverridesChange}
        activeBookTitle={activeBookTitle}
      />

      <div className="settings-section-label">Narration Cache</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Cache books for offline narration</span>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={settings.ttsCacheEnabled !== false}
            onChange={(e) => onSettingsChange({ ttsCacheEnabled: e.target.checked })}
          />
          <span className="settings-toggle-slider" />
        </label>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>
        When enabled, books in "Reading Now" are cached in the background for instant narration playback.
      </div>

      <CacheSizeDisplay />
    </div>
  );
}

/** Shows current cache size and a clear button */
function CacheSizeDisplay() {
  const [info, setInfo] = useState<{ totalMB: number; bookCount: number } | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (api?.ttsCacheInfo) {
      api.ttsCacheInfo().then(setInfo).catch(() => {});
    }
  }, [clearing]);

  if (!info || info.totalMB === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
        {info.bookCount} {info.bookCount === 1 ? "book" : "books"} cached — {info.totalMB}MB
      </span>
      <button
        className="settings-btn-secondary"
        onClick={async () => {
          if (!confirm("Clear all cached narration audio?")) return;
          setClearing(true);
          // Evict all cached books (would need a "clear all" IPC — use per-book eviction for now)
          // For now, just refresh the display
          setClearing(false);
        }}
        disabled={clearing}
        style={{ fontSize: 11, padding: "3px 10px" }}
      >
        Clear cache
      </button>
    </div>
  );
}

/** Pronunciation overrides editor with Global / This Book scope toggle (TTS-6I) */
function PronunciationOverridesEditor({
  globalOverrides,
  onGlobalChange,
  bookOverrides,
  onBookChange,
  activeBookTitle,
}: {
  globalOverrides: PronunciationOverride[];
  onGlobalChange: (overrides: PronunciationOverride[]) => void;
  bookOverrides?: PronunciationOverride[];
  onBookChange?: (overrides: PronunciationOverride[]) => void;
  activeBookTitle?: string;
}) {
  const hasBookScope = !!onBookChange;
  const [scope, setScope] = useState<"global" | "book">("global");
  const overrides = scope === "book" && bookOverrides ? bookOverrides : globalOverrides;
  const onChange = scope === "book" && onBookChange ? onBookChange : onGlobalChange;

  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [previewText, setPreviewText] = useState("The CEO of NASA gave a TED talk.");
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    if (!newFrom.trim() || overrides.length >= MAX_PRONUNCIATION_OVERRIDES) return;
    const id = `po-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    onChange([...overrides, { id, from: newFrom.trim(), to: newTo.trim(), enabled: true }]);
    setNewFrom("");
    setNewTo("");
  }, [newFrom, newTo, overrides, onChange]);

  const handleRemove = useCallback((id: string) => {
    onChange(overrides.filter(o => o.id !== id));
  }, [overrides, onChange]);

  const handleToggle = useCallback((id: string) => {
    onChange(overrides.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o));
  }, [overrides, onChange]);

  const handleMoveUp = useCallback((idx: number) => {
    if (idx <= 0) return;
    const next = [...overrides];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }, [overrides, onChange]);

  // Preview uses the effective merged set (global + book)
  const effectiveOverrides = hasBookScope && bookOverrides
    ? [...globalOverrides, ...bookOverrides]
    : globalOverrides;

  const handlePreview = useCallback(() => {
    setPreviewResult(applyPronunciationOverrides(previewText, effectiveOverrides));
  }, [previewText, effectiveOverrides]);

  return (
    <>
      <div className="settings-section-label">Pronunciation Overrides</div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
        Replace words before TTS speaks them. Global overrides apply to all books. Book overrides apply only to the current book.
      </div>

      {/* Scope toggle */}
      {hasBookScope && (
        <div className="settings-mode-toggle" style={{ marginBottom: 8 }}>
          <button
            className={`settings-mode-btn${scope === "global" ? " active" : ""}`}
            onClick={() => setScope("global")}
          >Global</button>
          <button
            className={`settings-mode-btn${scope === "book" ? " active" : ""}`}
            onClick={() => setScope("book")}
          >{activeBookTitle ? `This Book` : "Book"}</button>
        </div>
      )}
      {scope === "book" && activeBookTitle && (
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6, fontStyle: "italic" }}>
          Overrides for: {activeBookTitle}
        </div>
      )}

      {overrides.map((o, idx) => (
        <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 12 }}>
          <button
            onClick={() => handleToggle(o.id)}
            style={{ width: 20, height: 20, border: "1px solid var(--border)", borderRadius: 3, background: o.enabled ? "var(--accent)" : "var(--bg-card)", color: o.enabled ? "#fff" : "var(--text-dim)", cursor: "pointer", fontSize: 10, padding: 0 }}
            title={o.enabled ? "Disable" : "Enable"}
            aria-label={o.enabled ? "Disable override" : "Enable override"}
          >{o.enabled ? "✓" : ""}</button>
          <span style={{ color: o.enabled ? "var(--text)" : "var(--text-dim)", textDecoration: o.enabled ? "none" : "line-through" }}>
            {o.from} → {o.to || "(remove)"}
          </span>
          <button
            onClick={() => handleMoveUp(idx)}
            disabled={idx === 0}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-dim)", cursor: idx > 0 ? "pointer" : "default", fontSize: 10, padding: "2px 4px" }}
            title="Move up"
            aria-label="Move up"
          >↑</button>
          <button
            onClick={() => handleRemove(o.id)}
            style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 10, padding: "2px 4px" }}
            title="Remove"
            aria-label="Remove override"
          >×</button>
        </div>
      ))}

      {overrides.length === 0 && (
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8, fontStyle: "italic" }}>
          No {scope === "book" ? "book-specific" : "global"} overrides yet.
        </div>
      )}

      {overrides.length < MAX_PRONUNCIATION_OVERRIDES && (
        <div style={{ display: "flex", gap: 6, marginTop: 6, marginBottom: 8 }}>
          <input
            type="text"
            placeholder="From"
            value={newFrom}
            onChange={(e) => setNewFrom(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            style={{ flex: 1, padding: "4px 6px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: 11 }}
            aria-label="Word to replace"
          />
          <input
            type="text"
            placeholder="Speak as"
            value={newTo}
            onChange={(e) => setNewTo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            style={{ flex: 1, padding: "4px 6px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: 11 }}
            aria-label="Replacement pronunciation"
          />
          <button
            onClick={handleAdd}
            disabled={!newFrom.trim()}
            style={{ padding: "4px 10px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", cursor: newFrom.trim() ? "pointer" : "default", fontSize: 11 }}
          >Add</button>
        </div>
      )}

      {/* Preview uses effective merged overrides */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input
          type="text"
          value={previewText}
          onChange={(e) => { setPreviewText(e.target.value); setPreviewResult(null); }}
          style={{ flex: 1, padding: "4px 6px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", fontSize: 11 }}
          aria-label="Preview text"
        />
        <button
          onClick={handlePreview}
          style={{ padding: "4px 10px", borderRadius: 3, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", cursor: "pointer", fontSize: 11 }}
        >Preview</button>
      </div>
      {previewResult !== null && (
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12, fontStyle: "italic" }}>
          TTS will read: "{previewResult}"
        </div>
      )}
    </>
  );
}
