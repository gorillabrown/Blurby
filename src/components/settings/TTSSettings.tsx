import { useState, useEffect, useCallback, useRef } from "react";
import type { BlurbySettings, KokoroStatusSnapshot, PronunciationOverride } from "../../types";
import { KOKORO_VOICE_NAMES, TTS_MAX_RATE, TTS_MIN_RATE, TTS_PAUSE_COMMA_MS, TTS_PAUSE_CLAUSE_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS, TTS_DIALOGUE_SENTENCE_THRESHOLD, MAX_NARRATION_PROFILES, profileFromSettings } from "../../constants";
import { KokoroStatusSection } from "./KokoroStatusSection";
import { NarrationDataSection } from "./NarrationDataSection";
import { PauseSettingsSection } from "./PauseSettingsSection";
import { PronunciationOverridesEditor } from "./PronunciationOverridesEditor";
import {
  DEFAULT_KOKORO_STATUS_SNAPSHOT,
  getKokoroStatusError,
  normalizeKokoroStatusSnapshot,
  snapshotFromKokoroErrorResponse,
  snapshotFromLegacyKokoroDownloadError,
} from "../../utils/kokoroStatus";
import { KOKORO_UI_SPEEDS, normalizeKokoroUiSpeed, resolveKokoroRatePlan } from "../../utils/kokoroRatePlan";
import { applyKokoroTempoStretch } from "../../utils/audio/tempoStretch";
import "../../styles/tts-settings.css";

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
  const [kokoroStatus, setKokoroStatus] = useState<KokoroStatusSnapshot>(DEFAULT_KOKORO_STATUS_SNAPSHOT);
  const [kokoroDownloading, setKokoroDownloading] = useState(false);
  const [kokoroProgress, setKokoroProgress] = useState(0);
  const [kokoroVoices, setKokoroVoices] = useState<string[]>([]);
  const [kokoroError, setKokoroError] = useState<string | null>(null);
  const [kokoroStalled, setKokoroStalled] = useState(false);
  const kokoroStatusRef = useRef<KokoroStatusSnapshot>(DEFAULT_KOKORO_STATUS_SNAPSHOT);
  const kokoroReady = kokoroStatus.ready;
  const kokoroWarming = kokoroStatus.status === "warming" || kokoroStatus.status === "retrying";
  const kokoroBusy = kokoroDownloading || kokoroStatus.loading;
  const kokoroBusyLabel = kokoroDownloading
    ? `Downloading voice model... ${kokoroProgress}%`
    : kokoroStatus.status === "retrying"
      ? "Retrying Kokoro setup..."
      : kokoroStatus.status === "warming"
        ? "Warming up voice model..."
        : "Preparing voice model...";

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

  const loadKokoroVoices = useCallback(async () => {
    if (!api?.kokoroVoices) return;
    const vr = await api.kokoroVoices();
    if (vr.voices) setKokoroVoices(vr.voices);
  }, []);

  const applyKokoroStatusSnapshot = useCallback((snapshotLike?: Partial<KokoroStatusSnapshot> | null) => {
    const snapshot = normalizeKokoroStatusSnapshot(snapshotLike);
    kokoroStatusRef.current = snapshot;
    setKokoroStatus(snapshot);

    const error = getKokoroStatusError(snapshot);
    if (error) {
      setKokoroError(error);
      setKokoroDownloading(false);
      return;
    }

    if (snapshot.ready) {
      setKokoroError(null);
      setKokoroDownloading(false);
      setKokoroStalled(false);
      void loadKokoroVoices();
      return;
    }

    if (snapshot.loading || snapshot.status === "idle") {
      setKokoroDownloading(false);
      setKokoroStalled(false);
      if (snapshot.loading || snapshot.status === "idle") {
        setKokoroError(null);
      }
    }
  }, [loadKokoroVoices]);

  // Check Kokoro model status
  useEffect(() => {
    if (!api?.kokoroModelStatus) return;
    api.kokoroModelStatus().then((r) => {
      applyKokoroStatusSnapshot(r);
    }).catch(() => {});

    const cleanups: (() => void)[] = [];
    if (api.onKokoroDownloadProgress) {
      cleanups.push(api.onKokoroDownloadProgress((progress: number) => {
        setKokoroProgress(progress);
        setKokoroStalled(false);
        setKokoroDownloading(true);
      }));
    }
    if (api.onKokoroDownloadError) {
      cleanups.push(api.onKokoroDownloadError((error: string) => {
        applyKokoroStatusSnapshot(
          snapshotFromLegacyKokoroDownloadError(kokoroStatusRef.current, error),
        );
      }));
    }
    if (api.onKokoroEngineStatus) {
      cleanups.push(api.onKokoroEngineStatus((data) => {
        applyKokoroStatusSnapshot(data);
      }));
    }
    return () => cleanups.forEach((c) => c());
  }, [applyKokoroStatusSnapshot]);

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
        applyKokoroStatusSnapshot(snapshotFromKokoroErrorResponse(result));
        return;
      }
      if (api.kokoroModelStatus) {
        const snapshot = await api.kokoroModelStatus();
        applyKokoroStatusSnapshot(snapshot);
      }
    } catch {
      applyKokoroStatusSnapshot(snapshotFromKokoroErrorResponse({}, "Download failed"));
    }
  };

  const handleTestVoice = async () => {
    if (engine === "kokoro" && kokoroReady && api?.kokoroGenerate) {
      setTestPlaying(true);
      try {
        const voice = settings.ttsVoiceName || "af_bella";
        const ratePlan = resolveKokoroRatePlan(settings.ttsRate || 1.0);
        const result = await api.kokoroGenerate(
          "The quick brown fox jumps over the lazy dog.",
          voice,
          ratePlan.generationBucket
        );
        if (!result.error && result.audio) {
          const { playBuffer } = await import("../../utils/audioPlayer");
          const playback = applyKokoroTempoStretch({
            audio: result.audio,
            sampleRate: result.sampleRate ?? 24000,
            durationMs: result.durationMs ?? 0,
            wordTimestamps: result.wordTimestamps,
            kokoroRatePlan: ratePlan,
          });
          playBuffer(
            playback.audio,
            result.sampleRate ?? 24000,
            playback.durationMs,
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
      <div className="tts-profile-row">
        <select
          className="settings-select tts-profile-select"
          value={activeProfileId || ""}
          onChange={(e) => handleSelectProfile(e.target.value || null)}
          aria-label="Narration profile"
        >
          <option value="">No profile (flat settings)</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {profiles.length < MAX_NARRATION_PROFILES && (
          <button
            onClick={handleCreateProfile}
            className="tts-profile-new-btn"
            aria-label="Create narration profile"
          >+ New</button>
        )}
      </div>
      {activeProfileId && profiles.find(p => p.id === activeProfileId) && (
        <div className="tts-profile-actions-row">
          {renamingId === activeProfileId ? (
            <>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRenameProfile(activeProfileId, renameValue); if (e.key === "Escape") setRenamingId(null); }}
                autoFocus
                className="tts-profile-rename-input"
                aria-label="Profile name"
              />
              <button
                onClick={() => handleRenameProfile(activeProfileId, renameValue)}
                className="tts-profile-action-btn"
              >Save</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setRenamingId(activeProfileId); setRenameValue(profiles.find(p => p.id === activeProfileId)?.name || ""); }}
                className="tts-profile-action-btn"
                aria-label="Rename profile"
              >Rename</button>
              <button
                onClick={() => { if (confirm(`Delete profile "${profiles.find(p => p.id === activeProfileId)?.name}"?`)) handleDeleteProfile(activeProfileId); }}
                className="tts-profile-action-btn tts-profile-action-btn--danger"
                aria-label="Delete profile"
              >Delete</button>
            </>
          )}
        </div>
      )}
      <div className="tts-profile-hint">
        {activeProfileId ? "Changes below are saved to this profile." : "Save your voice and timing settings as a named profile for quick switching."}
      </div>

      {/* Book-level profile assignment */}
      {activeBookTitle && onBookNarrationProfileChange && profiles.length > 0 && (
        <>
          <div className="settings-toggle-row tts-book-profile-row">
            <span className="settings-toggle-label tts-book-profile-label">Profile for this book</span>
            <select
              className="settings-select tts-book-profile-select"
              value={bookNarrationProfileId || ""}
              onChange={(e) => onBookNarrationProfileChange(e.target.value || null)}
              aria-label="Book narration profile"
            >
              <option value="">Use default</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="tts-book-profile-hint">
            Override the default profile when narrating "{activeBookTitle}".
          </div>
        </>
      )}

      <div className="settings-section-label">Voice Engine</div>

      {/* Engine selector */}
      <div className="settings-mode-toggle tts-engine-toggle">
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
            if (!kokoroReady && !kokoroBusy) {
              handleDownloadKokoro();
            }
          }}
        >
          Kokoro AI
        </button>
      </div>

      {/* Kokoro download progress */}
      {engine === "kokoro" && !kokoroReady && (
        <KokoroStatusSection
          kokoroBusy={kokoroBusy}
          kokoroBusyLabel={kokoroBusyLabel}
          kokoroProgress={kokoroProgress}
          kokoroError={kokoroError}
          kokoroStalled={kokoroStalled}
          onDownload={handleDownloadKokoro}
        />
      )}

      {/* Voice picker — changes based on engine */}
      {engine === "kokoro" && kokoroReady && (
        <div className="settings-toggle-row tts-voice-picker-row">
          <span className="settings-toggle-label">Voice</span>
          <select
            className="settings-select tts-voice-select"
            value={settings.ttsVoiceName || "af_bella"}
            onChange={(e) => handleTtsChange({ ttsVoiceName: e.target.value })}
            aria-label="Kokoro voice"
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
        <div className="settings-toggle-row tts-voice-picker-row">
          <span className="settings-toggle-label">Voice</span>
          <select
            className="settings-select tts-voice-select"
            value={settings.ttsVoiceName || ""}
            onChange={(e) => handleTtsChange({ ttsVoiceName: e.target.value || null })}
            aria-label="TTS voice"
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
        <span className="tts-rate-value">{(settings.ttsRate || 1.0).toFixed(1)}x</span>
      </div>
      {engine === "kokoro" ? (
        <div className="settings-mode-toggle tts-rate-bucket-toggle">
          {KOKORO_UI_SPEEDS.map((speed) => (
            <button
              key={speed}
              className={`settings-mode-btn${normalizeKokoroUiSpeed(settings.ttsRate || 1.0) === speed ? " active" : ""}`}
              onClick={() => handleTtsChange({ ttsRate: speed })}
            >
              {speed.toFixed(1)}x
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
        className="settings-btn-secondary tts-test-btn"
        onClick={handleTestVoice}
        disabled={testPlaying}
      >
        {testPlaying ? "Playing..." : "Test voice"}
      </button>
      <div className="tts-test-hint">
        Press N in the reader to toggle narration. WPM is capped at 400 when narration is active.
        {engine === "kokoro" && kokoroReady && !kokoroWarming && " Using Kokoro AI voices."}
        {engine === "kokoro" && kokoroWarming && " Kokoro is warming up..."}
      </div>

      <PauseSettingsSection settings={settings} onTtsChange={handleTtsChange} />

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
      <div className="tts-cache-hint">
        When enabled, books in "Reading Now" are cached in the background for instant narration playback.
      </div>

      <CacheSizeDisplay />

      <NarrationDataSection settings={settings} onSettingsChange={onSettingsChange} />
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
    <div className="tts-cache-size-row">
      <span className="tts-cache-size-label">
        {info.bookCount} {info.bookCount === 1 ? "book" : "books"} cached — {info.totalMB}MB
      </span>
      <button
        className="settings-btn-secondary tts-cache-clear-btn"
        onClick={async () => {
          if (!confirm("Clear all cached narration audio?")) return;
          setClearing(true);
          // Evict all cached books (would need a "clear all" IPC — use per-book eviction for now)
          // For now, just refresh the display
          setClearing(false);
        }}
        disabled={clearing}
      >
        Clear cache
      </button>
    </div>
  );
}
