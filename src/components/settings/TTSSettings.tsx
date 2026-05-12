import { useState, useEffect, useCallback } from "react";
import type { BlurbySettings, PronunciationOverride } from "../../types";
import { KOKORO_VOICE_NAMES, QWEN_DEFAULT_SPEAKER, QWEN_TTS_DISABLED, TTS_DEFAULT_ENGINE, TTS_MAX_RATE, TTS_MIN_RATE, TTS_PAUSE_COMMA_MS, TTS_PAUSE_CLAUSE_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS, TTS_DIALOGUE_SENTENCE_THRESHOLD, MAX_NARRATION_PROFILES, normalizeSelectableTtsEngine, profileFromSettings } from "../../constants";
import { KokoroStatusSection } from "./KokoroStatusSection";
import { QwenStatusSection } from "./QwenStatusSection";
import { QwenRuntimeSetupSection } from "./QwenRuntimeSetupSection";
import { getQwenStatusPresentation } from "./qwenStatusPresentation";
import { MossNanoStatusSection } from "./MossNanoStatusSection";
import { PocketTtsStatusSection } from "./PocketTtsStatusSection";
import { TtsEngineSelector } from "./TtsEngineSelector";
import { NarrationDataSection } from "./NarrationDataSection";
import { PauseSettingsSection } from "./PauseSettingsSection";
import { PronunciationOverridesEditor } from "./PronunciationOverridesEditor";
import { CacheSizeDisplay } from "./CacheSizeDisplay";
import { KOKORO_UI_SPEEDS, normalizeKokoroUiSpeed } from "../../utils/kokoroRatePlan";
import { useQwenPrototypeStatus } from "../../hooks/useQwenPrototypeStatus";
import { useKokoroSettingsStatus } from "./useKokoroSettingsStatus";
import { useMossNanoSettingsStatus } from "./useMossNanoSettingsStatus";
import { usePocketTtsSettingsStatus } from "./usePocketTtsSettingsStatus";
import { previewSelectedTtsVoice } from "./ttsPreview";
import { getTtsProviderOrThrow } from "../../utils/ttsProviderRegistry";
import "../../styles/tts-settings.css";

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
  const engine = normalizeSelectableTtsEngine(settings.ttsEngine || TTS_DEFAULT_ENGINE);
  const kokoroProvider = getTtsProviderOrThrow("kokoro");
  const qwenProvider = getTtsProviderOrThrow("qwen");
  const nanoProvider = getTtsProviderOrThrow("nano");
  const pocketProvider = getTtsProviderOrThrow("pocket-tts");
  // Web Speech API voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testPlaying, setTestPlaying] = useState(false);
  const [showQwenSetupGuidance, setShowQwenSetupGuidance] = useState(false);
  const {
    kokoroBusy,
    kokoroBusyLabel,
    kokoroError,
    kokoroPreflightBusy,
    kokoroPreflightReport,
    kokoroProgress,
    kokoroReady,
    kokoroStalled,
    kokoroVoices,
    kokoroWarming,
    handleDownloadKokoro,
    handlePreflightKokoro,
  } = useKokoroSettingsStatus(engine);
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
  const { nanoSelectable, nanoReady, nanoStatusTitle, nanoStatusDetail } = useMossNanoSettingsStatus();
  const { pocketSelectable, pocketReady, pocketStatusTitle, pocketStatusDetail } = usePocketTtsSettingsStatus();
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
  const handleTestVoice = async () => {
    await previewSelectedTtsVoice({
      engine,
      settings,
      voices,
      kokoroReady,
      qwenReady,
      nanoReady,
      pocketReady,
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
      ttsEngine: normalizeSelectableTtsEngine(profile.ttsEngine),
      ttsVoiceName: normalizeSelectableTtsEngine(profile.ttsEngine) === "nano" || normalizeSelectableTtsEngine(profile.ttsEngine) === "pocket-tts" ? null : profile.ttsVoiceName,
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
            ttsEngine: normalizeSelectableTtsEngine(merged.ttsEngine),
            ttsVoiceName: normalizeSelectableTtsEngine(merged.ttsEngine) === "nano" || normalizeSelectableTtsEngine(merged.ttsEngine) === "pocket-tts" ? null : merged.ttsVoiceName || null,
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

      <TtsEngineSelector
        engine={engine}
        qwenDisabled={QWEN_TTS_DISABLED}
        nanoSelectable={nanoSelectable}
        pocketSelectable={pocketSelectable}
        onSelect={(nextEngine) => {
          if (nextEngine === "kokoro") {
            handleTtsChange({ ttsEngine: "kokoro", ttsVoiceName: kokoroReady ? "af_bella" : null });
            if (!kokoroReady && !kokoroBusy) handleDownloadKokoro();
            return;
          }
          handleTtsChange({ ttsEngine: nextEngine, ttsVoiceName: null });
        }}
      />
      <div className="tts-test-hint">
        {qwenProvider.copy.posture}
        {" "}
        {kokoroProvider.copy.posture}
        {" "}
        {nanoProvider.copy.posture}
        {" "}
        {pocketProvider.copy.posture}
        {!nanoReady && ` ${nanoStatusDetail}`}
        {!pocketReady && ` ${pocketStatusDetail}`}
      </div>

      {/* Kokoro download progress */}
      {engine === "kokoro" && (
        <KokoroStatusSection
          kokoroReady={kokoroReady}
          kokoroBusy={kokoroBusy}
          kokoroBusyLabel={kokoroBusyLabel}
          kokoroProgress={kokoroProgress}
          kokoroError={kokoroError}
          kokoroStalled={kokoroStalled}
          preflightReport={kokoroPreflightReport}
          preflightBusy={kokoroPreflightBusy}
          providerLabel={kokoroProvider.capabilities.label}
          onDownload={handleDownloadKokoro}
          onPreflight={() => void handlePreflightKokoro()}
        />
      )}

      {engine === "qwen" && !qwenReady && (
        <QwenStatusSection
          qwenWarming={qwenWarming}
          qwenPreflightBusy={qwenPreflightBusy}
          qwenStatusReason={qwenStatus.reason ?? null}
          qwenStatusTitle={qwenStatusPresentation.title}
          qwenStatusDetail={qwenStatusPresentation.detail}
          providerLabel={qwenProvider.capabilities.label}
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
          providerLabel={nanoProvider.capabilities.label}
          readyHint={nanoProvider.copy.readyHint}
          blockedHint={nanoProvider.copy.blockedHint}
        />
      )}

      {engine === "pocket-tts" && (
        <PocketTtsStatusSection
          ready={pocketReady}
          title={pocketStatusTitle}
          detail={pocketStatusDetail}
          providerLabel={pocketProvider.capabilities.label}
          readyHint={pocketProvider.copy.readyHint}
          blockedHint={pocketProvider.copy.blockedHint}
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
        disabled={testPlaying || (engine === "qwen" && !qwenReady) || (engine === "nano" && !nanoReady) || (engine === "pocket-tts" && !pocketReady)}
      >
        {testPlaying ? "Playing..." : "Test voice"}
      </button>
      <div className="tts-test-hint">
        Press N in the reader to toggle narration. WPM is capped at 400 when narration is active.
        {engine === "kokoro" && kokoroReady && !kokoroWarming && ` ${kokoroProvider.copy.readyHint}`}
        {engine === "kokoro" && kokoroWarming && " Kokoro is warming up..."}
        {engine === "qwen" && qwenReady && ` ${qwenProvider.copy.readyHint}`}
        {engine === "qwen" && !qwenReady && ` ${qwenProvider.copy.blockedHint}`}
        {engine === "nano" && nanoReady && ` ${nanoProvider.copy.readyHint}`}
        {engine === "nano" && !nanoReady && ` ${nanoProvider.copy.blockedHint}`}
        {engine === "pocket-tts" && pocketReady && ` ${pocketProvider.copy.readyHint}`}
        {engine === "pocket-tts" && !pocketReady && ` ${pocketProvider.copy.blockedHint}`}
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
