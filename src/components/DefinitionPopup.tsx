import { useEffect, useState } from "react";

const api = (window as any).electronAPI;

interface DefinitionData {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition?: string;
  example?: string;
  synonyms?: string[];
}

interface DefinitionPopupProps {
  word: string;
  position: { x: number; y: number };
  onSaveWithDefinition: (text: string) => void;
  onClose: () => void;
}

export default function DefinitionPopup({ word, position, onSaveWithDefinition, onClose }: DefinitionPopupProps) {
  const [data, setData] = useState<DefinitionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    api.defineWord(word).then((result: any) => {
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setError("Definition unavailable");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [word]);

  const handleSave = () => {
    if (!data) return;
    const parts = [
      `"${data.word}"`,
      data.phonetic ? ` ${data.phonetic}` : "",
      data.partOfSpeech ? ` — ${data.partOfSpeech}` : "",
      data.definition ? `: ${data.definition}` : "",
    ];
    onSaveWithDefinition(parts.join(""));
  };

  return (
    <div
      className="definition-popup"
      style={{ left: position.x, top: position.y + 44 }}
      role="dialog"
      aria-label={`Definition of ${word}`}
    >
      {loading && (
        <div className="definition-loading">Looking up "{word}"…</div>
      )}
      {error && (
        <div className="definition-error">{error}</div>
      )}
      {data && (
        <>
          <div className="definition-header">
            <span className="definition-word">{data.word}</span>
            {data.phonetic && <span className="definition-phonetic">{data.phonetic}</span>}
          </div>
          {data.partOfSpeech && (
            <div className="definition-pos">{data.partOfSpeech}</div>
          )}
          {data.definition && (
            <div className="definition-text">{data.definition}</div>
          )}
          {data.example && (
            <div className="definition-example">"{data.example}"</div>
          )}
          {data.synonyms && data.synonyms.length > 0 && (
            <div className="definition-synonyms">
              Synonyms: {data.synonyms.join(", ")}
            </div>
          )}
          <div className="definition-actions">
            <button className="definition-save-btn" onClick={handleSave}>Save word</button>
            <button className="definition-close-btn" onClick={onClose}>Close</button>
          </div>
        </>
      )}
    </div>
  );
}
