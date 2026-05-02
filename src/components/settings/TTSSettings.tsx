import { useState, useEffect, useCallback, useRef } from "react";
import type { BlurbySettings, KokoroStatusSnapshot, PronunciationOverride } from "../../types";
import { KOKORO_VOICE_NAMES, QWEN_DEFAULT_SPEAKER, TTS_MAX_RATE, TTS_MIN_RATE, TTS_PAUSE_COMMA_MS, TTS_PAUSE_CLAUSE_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS, TTS_DIALOGUE_SENTENCE_THRESHOLD, MAX_NARRATION_PROFILES, profileFromSettings } from "../../constants";
import { KokoroStatusSection } from "./KokoroStatusSection";
import { QwenStatusSection } from "./QwenStatusSection";
import { QwenRuntimeSetupSection } from "./QwenRuntimeSetupSection";
import { getQwenStatusPresentation } from "./qwenStatusPresentation";
import { MossNanoStatusSection } from "./MossNanoStatusSection";
import { NarrationDataSection } from "./NarrationDataSection";
import { PauseSettingsSection } from "./PauseSettingsSection";
import { PronunciationOverridesEditor } from "./PronunciationOverridesEditor";
import { CacheSizeDisplay } from "./CacheSizeDisplay";
import {
  DEFAULT_KOKORO_STATUS_SNAPSHOT,
  getKokoroStatusError,
  normalizeKokoroStatusSnapshot,
  snapshotFromKokoroErrorResponse,
  snapshotFromLegacyKokoroDownloadError,
} from "../../utils/kokoroStatus";
import { KOKORO_UI_SPEEDS, normalizeKokoroUiSpeed } from "../../utils/kokoroRatePlan";
import { useQwenPrototypeStatus } from "../../hooks/useQwenPrototypeStatus";
import { useMossNanoSettingsStatus } from "./useMossNanoSettingsStatus";
import { previewSelectedTtsVoice } from "./ttsPreview";
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
  const engine = settings.ttsEngine || "qwen";
  // Web Speech API voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testPlaying, setTestPlaying] = useState(false);
  const [showQwenSetupGuidance, setShowQwenSetupGuidance] = useState(false);
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
  const {
    qwenStatus,
    qwenVoices,
    qwenError,
    qwenPreflightReport,
    qwenPreflightBusy,
    qwenReady,
    qwenWarming,
    qwenBusy,
    handlePreloadQwen,
    handlePreflightQwen,
  } = useQwenPrototypeStatus();
  const { nanoReady, nanoStatusTitle, nanoStatusDetail } = useMossNanoSettingsStatus();
  const preferredQwenVoice =
    settings.ttsVoiceName && qwenVoices.includes(settings.ttsVoiceName)
      ? settings.ttsVoiceName
      : qwenVoices.includes(QWEN_DEFAULT_SPEAKER)
        ? QWEN_DEFAULT_SPEAKER
        : qwenVoices[0] || QWEN_DEFAULT_SPEAKER;
  const qwenStatusPresentation = getQwenStatusPresentation(qwenStatus, qwenError);
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
    await previewSelectedTtsVoice({
      engine,
      settings,
      voices,
      kokoroReady,
      qwenReady,
      nanoReady,
      preferredQwenVoice,
      onPlaybackStateChange: setTestPlaying,
    });
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
            ttsEngine: merged.ttsEngine || "qwen",
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
          className={`settings-mode-btn${engine === "qwen" ? " active" : ""}`}
          onClick={() => {
            handleTtsChange({
              ttsEngine: "qwen",
              ttsVoiceName: qwenReady ? preferredQwenVoice : null,
            });
            if (!qwenReady && !qwenBusy) {
              void handlePreloadQwen();
            }
          }}
        >
          Qwen AI
        </button>
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
          Kokoro AI (Legacy)
        </button>
        <button
          className={`settings-mode-btn${engine === "nano" ? " active" : ""}`}
          onClick={() => {
            if (!nanoReady) return;
            handleTtsChange({ ttsEngine: "nano", ttsVoiceName: null });
          }}
          disabled={!nanoReady}
          aria-disabled={!nanoReady}
        >
          Nano AI (Experimental)
        </button>
      </div>
      <div className="tts-test-hint">
        Qwen is Blurby's default narration engine.
        Kokoro remains available as a deprecated fallback while retirement gates are still open.
        Nano is experimental and requires the local MOSS Nano sidecar.
        {!nanoReady && ` ${nanoStatusDetail}`}
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

      {engine === "qwen" && !qwenReady && (
        <QwenStatusSection
          qwenWarming={qwenWarming}
          qwenPreflightBusy={qwenPreflightBusy}
          qwenStatusReason={qwenStatus.reason ?? null}
          qwenStatusTitle={qwenStatusPresentation.title}
          qwenStatusDetail={qwenStatusPresentation.detail}
          onValidateRuntime={() => void handlePreflightQwen()}
          onViewSetupGuidance={() => setShowQwenSetupGuidance(true)}
        />
      )}

      {engine === "qwen" && (!qwenReady || showQwenSetupGuidance) && (
        <QwenRuntimeSetupSection
          report={qwenPreflightReport}
          expanded={showQwenSetupGuidance}
        />
      )}

      {engine === "nano" && (
        <MossNanoStatusSection
          ready={nanoReady}
          title={nanoStatusTitle}
          detail={nanoStatusDetail}
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

      {engine === "qwen" && qwenReady && (
        <div className="settings-toggle-row tts-voice-picker-row">
          <span className="settings-toggle-label">Voice</span>
          <select
            className="settings-select tts-voice-select"
            value={preferredQwenVoice}
            onChange={(e) => handleTtsChange({ ttsVoiceName: e.target.value || null })}
            aria-label="Qwen voice"
          >
            {qwenVoices.map((voice) => (
              <option key={voice} value={voice}>
                {voice}
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
        disabled={testPlaying || (engine === "qwen" && !qwenReady) || (engine === "nano" && !nanoReady)}
      >
        {testPlaying ? "Playing..." : "Test voice"}
      </button>
      <div className="tts-test-hint">
        Press N in the reader to toggle narration. WPM is capped at 400 when narration is active.
        {engine === "kokoro" && kokoroReady && !kokoroWarming && " Using legacy Kokoro voices."}
        {engine === "kokoro" && kokoroWarming && " Legacy Kokoro is warming up..."}
        {engine === "qwen" && qwenReady && " Using Qwen for live narration playback."}
        {engine === "qwen" && !qwenReady && " Qwen becomes playable once the local external runtime is available and warmed."}
        {engine === "nano" && nanoReady && " Using experimental Nano through the local sidecar."}
        {engine === "nano" && !nanoReady && " Nano remains selected only as a blocked experimental option until the sidecar is ready."}
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
