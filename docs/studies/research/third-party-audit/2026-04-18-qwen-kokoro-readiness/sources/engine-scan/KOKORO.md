# Kokoro

## Snapshot
- Track: baseline
- Current verdict: full-corpus control captured; still the current leader on this host
- Last verified: 2026-04-18

## Official Sources
- Primary repo/model page: https://github.com/hexgrad/kokoro
- License page: https://huggingface.co/hexgrad/Kokoro-82M
- Runtime docs: https://github.com/hexgrad/kokoro

## Hard-Gate Screen
- Commercial posture: pass. The official model card lists `apache-2.0`, and the official repo describes Kokoro as deployable in production environments and personal projects.
- Local/offline viability: pass. The official repo documents local Python usage plus Windows installation notes.
- Audible disclaimer/watermark risk: pass. No official watermark or audible disclosure requirement was found in the official repo or model card.

## Runtime Shape
- Host OS: Windows, macOS, and Linux are all plausible from the official repo; Windows installation notes are explicitly documented.
- CPU path: yes, lightweight local inference is part of the official positioning.
- GPU path: optional; the repo documents Apple Silicon MPS acceleration as an example.
- Python / Node / ONNX / other: official Python inference library, with the upstream repo also containing `kokoro.js`.
- Weight size: 82M parameters.

## Blurby-Relevant Questions
- Long usable inference window: short relative to the new challengers; still the current control.
- Punctuation prosody expectation: known-good baseline but already the source of current long-form complaints.
- Timing metadata availability: no official timestamp API is documented; the Python generator exposes graphemes, phonemes, and audio chunks.
- Exact-speed compatibility risk: low. The official advanced example exposes a `speed=` control.
- Packaging/distribution burden: low. This is already Blurby's live baseline.

## Commands Used
The commands below are derived from the official quickstart examples, with Blurby-local fixture and artifact paths substituted in.

Smoke synthesis:
```powershell
python -c "from pathlib import Path; import soundfile as sf; from kokoro import KPipeline; text = Path(r'C:\Users\estra\Projects\Blurby\tests\fixtures\narration\engine-scan\literary-punctuation.txt').read_text(encoding='utf-8'); pipeline = KPipeline(lang_code='a'); audio = next(iter(pipeline(text, voice='af_heart', speed=1, split_pattern=r'\n+')))[2]; out = Path(r'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\kokoro\audio\literary-punctuation.wav'); out.parent.mkdir(parents=True, exist_ok=True); sf.write(out, audio, 24000)"
```

Full-corpus synthesis:
```powershell
powershell -NoProfile -Command "$root = 'C:\Users\estra\Projects\Blurby'; $fixtures = Get-ChildItem \"$root\\tests\\fixtures\\narration\\engine-scan\" -Filter *.txt; foreach ($fixture in $fixtures) { python -c \"from pathlib import Path; import soundfile as sf; from kokoro import KPipeline; path = Path(r'$($fixture.FullName)'); text = path.read_text(encoding='utf-8'); pipeline = KPipeline(lang_code='a'); audio = next(iter(pipeline(text, voice='af_heart', speed=1, split_pattern=r'\\n+')))[2]; out = Path(r'C:\\Users\\estra\\Projects\\Blurby\\artifacts\\tts-eval\\engine-scan\\kokoro\\audio') / f'{path.stem}.wav'; out.parent.mkdir(parents=True, exist_ok=True); sf.write(out, audio, 24000)\" }"
```

Dispatch B empirical run:
```text
node worker harness using main/tts-worker.js, node_modules/ as modulePath, and %APPDATA%\Blurby\models as the cacheDir
```

## Findings
- Wins over Kokoro: it still wins the practical bootstrap contest on this Windows host. The worker-thread CPU path that Blurby already ships produced 6/6 engine-scan fixtures without extra environment surgery once the standard model cache was reused.
- Losses versus Kokoro: the known product issues are still present. Dispatch B did not change the long-form seam burden or the exact-speed limitations already documented in Blurby.
- Open concerns: the pre-recorded Python command from Dispatch A was not runnable on this host, so the empirical control used Blurby's already-installed `kokoro-js` worker path instead. Manual listening review is still pending even though the capture pass completed.
