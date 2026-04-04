import { useState, useEffect } from "react";
import type { BlurbySettings } from "../../types";
import { KOKORO_VOICE_NAMES, TTS_MAX_RATE, TTS_MIN_RATE, TTS_PAUSE_COMMA_MS, TTS_PAUSE_CLAUSE_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS, TTS_DIALOGUE_SENTENCE_THRESHOLD, KOKORO_RATE_BUCKETS, resolveKokoroBucket } from "../../constants";

const api = window.electronAPI;

interface TTSSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function TTSSettings({ settings, onSettingsChange }: TTSSettingsProps) {
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

  return (
    <div>
      <div className="settings-section-label">Voice Engine</div>

      {/* Engine selector */}
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
            onSettingsChange({ ttsEngine: "kokoro", ttsVoiceName: kokoroReady ? "af_bella" : null });
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
      {engine === "kokoro" ? (
        <div className="settings-mode-toggle" style={{ marginBottom: 4 }}>
          {KOKORO_RATE_BUCKETS.map((bucket) => (
            <button
              key={bucket}
              className={`settings-mode-btn${resolveKokoroBucket(settings.ttsRate || 1.0) === bucket ? " active" : ""}`}
              onClick={() => onSettingsChange({ ttsRate: bucket })}
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
          onChange={(e) => onSettingsChange({ ttsRate: Number(e.target.value) })}
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
        onChange={(e) => onSettingsChange({ ttsPauseCommaMs: Number(e.target.value) })}
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
        onChange={(e) => onSettingsChange({ ttsPauseClauseMs: Number(e.target.value) })}
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
        onChange={(e) => onSettingsChange({ ttsPauseSentenceMs: Number(e.target.value) })}
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
        onChange={(e) => onSettingsChange({ ttsPauseParagraphMs: Number(e.target.value) })}
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
        onChange={(e) => onSettingsChange({ ttsDialogueSentenceThreshold: Number(e.target.value) })}
        aria-label="Dialogue sentence threshold"
      />
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>
        Paragraphs with this many sentences or fewer are treated as dialogue and get a shorter pause.
      </div>

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
