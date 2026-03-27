import { useState, useEffect } from "react";
import type { BlurbySettings } from "../../types";
import { KOKORO_VOICE_NAMES } from "../../constants";

const api = (window as any).electronAPI;

interface SpeedReadingSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function SpeedReadingSettings({ settings, onSettingsChange }: SpeedReadingSettingsProps) {
  const rp = settings.rhythmPauses;
  const engine = settings.ttsEngine || "web";

  // Web Speech API voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testPlaying, setTestPlaying] = useState(false);

  // Kokoro state
  const [kokoroReady, setKokoroReady] = useState(false);
  const [kokoroDownloading, setKokoroDownloading] = useState(false);
  const [kokoroProgress, setKokoroProgress] = useState(0);
  const [kokoroVoices, setKokoroVoices] = useState<string[]>([]);

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

    if (api.onKokoroDownloadProgress) {
      const cleanup = api.onKokoroDownloadProgress((progress: number) => {
        setKokoroProgress(progress);
        if (progress >= 100) {
          setKokoroReady(true);
          setKokoroDownloading(false);
        }
      });
      return cleanup;
    }
  }, []);

  const handleDownloadKokoro = async () => {
    if (!api?.kokoroDownload) return;
    setKokoroDownloading(true);
    setKokoroProgress(0);
    try {
      const result = await api.kokoroDownload();
      if (!result.error) {
        setKokoroReady(true);
        if (api.kokoroVoices) {
          const vr = await api.kokoroVoices();
          if (vr.voices) setKokoroVoices(vr.voices);
        }
      }
    } catch { /* handled by progress listener */ }
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
          settings.ttsRate || 1.0
        );
        if (!result.error) {
          const { playBuffer } = await import("../../utils/audioPlayer");
          playBuffer(
            result.audio,
            result.sampleRate,
            result.durationMs,
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

  return (
    <div>
      <div className="settings-section-label">Reading Mode</div>
      <div className="settings-mode-toggle">
        <button
          className={`settings-mode-btn${settings.readingMode === "focus" ? " active" : ""}`}
          onClick={() => onSettingsChange({ readingMode: "focus" })}
        >
          Focus
        </button>
        <button
          className={`settings-mode-btn${settings.readingMode === "flow" ? " active" : ""}`}
          onClick={() => onSettingsChange({ readingMode: "flow" })}
        >
          Flow
        </button>
      </div>

      <div className="settings-section-label" style={{ marginTop: 16 }}>EPUB Renderer</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Use legacy renderer</span>
        <div
          className={`settings-toggle${settings.useLegacyRenderer ? " active" : ""}`}
          onClick={() => onSettingsChange({ useLegacyRenderer: !settings.useLegacyRenderer })}
          role="switch"
          tabIndex={0}
          aria-checked={!!settings.useLegacyRenderer}
          aria-label="Use legacy renderer"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ useLegacyRenderer: !settings.useLegacyRenderer }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>
        Fall back to word-by-word text rendering instead of the EPUB reader.
      </div>

      <div className="settings-section-label">Focus Mode Options</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Focus Marks</span>
        <div
          className={`settings-toggle${settings.focusMarks ? " active" : ""}`}
          onClick={() => onSettingsChange({ focusMarks: !settings.focusMarks })}
          role="switch"
          tabIndex={0}
          aria-checked={settings.focusMarks}
          aria-label="Focus Marks"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ focusMarks: !settings.focusMarks }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Reading Ruler</span>
        <div
          className={`settings-toggle${settings.readingRuler ? " active" : ""}`}
          onClick={() => onSettingsChange({ readingRuler: !settings.readingRuler })}
          role="switch"
          tabIndex={0}
          aria-checked={settings.readingRuler}
          aria-label="Reading Ruler"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ readingRuler: !settings.readingRuler }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Focus Span</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{Math.round(settings.focusSpan * 100)}%</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0.1}
        max={1}
        step={0.1}
        value={settings.focusSpan}
        onChange={(e) => onSettingsChange({ focusSpan: Number(e.target.value) })}
        aria-label="Focus span"
      />

      <div className="settings-section-label" style={{ marginTop: 16 }}>Flow Mode Options</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Words per highlight</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{Math.max(3, settings.flowWordSpan || 3)} words</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={3}
        max={5}
        step={1}
        value={Math.max(3, settings.flowWordSpan || 3)}
        onChange={(e) => onSettingsChange({ flowWordSpan: Number(e.target.value) })}
        aria-label="Flow mode words per highlight"
      />
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>
        How many words the sliding cursor spans. The highlight advances one word at a time.
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Cursor style</span>
        <select
          className="settings-select"
          value={settings.flowCursorStyle || "underline"}
          onChange={(e) => onSettingsChange({ flowCursorStyle: e.target.value as "underline" | "highlight" })}
          aria-label="Flow cursor style"
        >
          <option value="underline">Underline</option>
          <option value="highlight">Highlight</option>
        </select>
      </div>

      <div className="settings-section-label" style={{ marginTop: 16 }}>Rhythm Pauses</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Commas, colons, semicolons</span>
        <div
          className={`settings-toggle${rp.commas ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, commas: !rp.commas } })}
          role="switch"
          tabIndex={0}
          aria-checked={rp.commas}
          aria-label="Commas, colons, semicolons"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, commas: !rp.commas } }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Sentence endings</span>
        <div
          className={`settings-toggle${rp.sentences ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, sentences: !rp.sentences } })}
          role="switch"
          tabIndex={0}
          aria-checked={rp.sentences}
          aria-label="Sentence endings"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, sentences: !rp.sentences } }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Paragraph breaks</span>
        <div
          className={`settings-toggle${rp.paragraphs ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, paragraphs: !rp.paragraphs } })}
          role="switch"
          tabIndex={0}
          aria-checked={rp.paragraphs}
          aria-label="Paragraph breaks"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, paragraphs: !rp.paragraphs } }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Numbers</span>
        <div
          className={`settings-toggle${rp.numbers ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, numbers: !rp.numbers } })}
          role="switch"
          tabIndex={0}
          aria-checked={rp.numbers}
          aria-label="Numbers"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, numbers: !rp.numbers } }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Longer words (&gt;8 chars)</span>
        <div
          className={`settings-toggle${rp.longerWords ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, longerWords: !rp.longerWords } })}
          role="switch"
          tabIndex={0}
          aria-checked={rp.longerWords}
          aria-label="Longer words"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, longerWords: !rp.longerWords } }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-section-label" style={{ marginTop: 16 }}>Narration (Text-to-Speech)</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Enable TTS</span>
        <div
          className={`settings-toggle${settings.ttsEnabled ? " active" : ""}`}
          onClick={() => onSettingsChange({ ttsEnabled: !settings.ttsEnabled })}
          role="switch"
          tabIndex={0}
          aria-checked={settings.ttsEnabled}
          aria-label="Enable text-to-speech"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ ttsEnabled: !settings.ttsEnabled }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      {/* Engine selector */}
      <div className="settings-toggle-row" style={{ marginTop: 8 }}>
        <span className="settings-toggle-label">Voice engine</span>
      </div>
      <div className="settings-mode-toggle" style={{ marginBottom: 12 }}>
        <button
          className={`settings-mode-btn${engine === "web" ? " active" : ""}`}
          onClick={() => onSettingsChange({ ttsEngine: "web", ttsVoiceName: null })}
        >
          System
        </button>
        <button
          className={`settings-mode-btn${engine === "kokoro" ? " active" : ""}`}
          onClick={() => {
            if (kokoroReady) {
              onSettingsChange({ ttsEngine: "kokoro", ttsVoiceName: "af_bella" });
            } else if (!kokoroDownloading) {
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
              Download voice model (92 MB)
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
            onChange={(e) => onSettingsChange({ ttsVoiceName: e.target.value })}
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
            onChange={(e) => onSettingsChange({ ttsVoiceName: e.target.value || null })}
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
      <input
        type="range"
        className="settings-slider"
        min={0.5}
        max={2.0}
        step={0.1}
        value={settings.ttsRate || 1.0}
        onChange={(e) => onSettingsChange({ ttsRate: Number(e.target.value) })}
        aria-label="TTS speech rate"
      />

      <button
        className="settings-btn-secondary"
        onClick={handleTestVoice}
        disabled={testPlaying}
        style={{ marginTop: 8, padding: "6px 14px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", cursor: "pointer", fontSize: 12 }}
      >
        {testPlaying ? "Playing..." : "Test voice"}
      </button>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
        Press N in the reader to toggle narration. WPM is capped at 400 when narration is active.
        {engine === "kokoro" && kokoroReady && " Using Kokoro AI voices."}
      </div>
    </div>
  );
}
