# **Technical Analysis of Discrete Neural Speech Synthesis Architectures for Local Long-Form Narration within Electron-Based Desktop Environments**

The landscape of neural text-to-speech synthesis has transitioned from traditional concatenative and parametric systems toward a paradigm of generative speech language models. For an application such as Blurby, which aims to convert e-book content into high-fidelity audiobooks locally on Windows hardware, the selection of a synthesis engine is no longer merely a question of phonetic accuracy. It involves a complex negotiation between naratological continuity, computational efficiency, and the strict architectural constraints of an Electron three-layer process model. The shift from Generative Adversarial Network (GAN)-based vocoders to discrete, autoregressive transformers using Residual Vector Quantization (RVQ) marks a fundamental change in how speech is modeled, allowing for long-range prosodic consistency that was previously impossible in local deployments.1

## **The Evolution of Local Neural Synthesis Paradigms**

To understand the current state of open-source TTS, one must recognize the movement away from two-stage pipelines. Historically, systems like Tacotron 2 or FastSpeech generated mel-spectrograms that required a second, computationally intensive step—the neural vocoder—to produce a waveform. Modern candidates such as Qwen3-TTS and ResembleAI’s Chatterbox leverage a unified approach where the model predicts discrete audio tokens directly from text or phoneme sequences.2 This architecture allows the model to capture paralinguistic nuances—breathing, hesitation, and emotional shifts—as a cohesive sequence, which is essential for the "spoken, not assembled" feel required for audiobook narration.2

The adoption of RVQ within neural audio codecs like the Qwen-TTS-Tokenizer-12Hz represents a breakthrough in compression without the loss of semantic or acoustic detail.1 By discretizing audio into multi-layered codebooks, these models can represent 24 kHz or 48 kHz audio at extremely low bitrates, facilitating real-time streaming with latencies as low as 97 milliseconds.1 For Blurby, this technical shift enables a responsive user interface where synthesis can begin almost instantly upon a "play" command, avoiding the significant pre-computation delays inherent in older architectures.

## **Hard-Gate Screening: Legal and Environmental Viability**

Before evaluating qualitative performance, each model must satisfy the "Hard Gates" of commercial shipability and local execution within the Blurby environment. The Blurby Technical Reference specifies a native Windows desktop application with an Electron-based runtime, requiring all processing to occur locally to ensure privacy and offline availability.8

### **Commercial Posture and Licensing**

The commercial viability of Blurby depends on a licensing structure that permits distribution without prohibitive royalties or restrictive use cases. Qwen3-TTS, OpenMOSS, hexgrad (Kokoro), and nari-labs (Dia) all utilize the Apache License 2.0.3 This license provides a perpetual, worldwide, no-charge, royalty-free, and irrevocable copyright license, making it ideal for product integration.12 resmble-ai’s Chatterbox and MyShell’s MeloTTS use the MIT License, which is even more permissive, requiring only the inclusion of the original copyright and permission notice in all copies or substantial portions of the software.13

### **Local Execution and Offline Capability**

Blurby’s mandate for local processing is met by most candidates, though with varying degrees of hardware dependency. Qwen3-TTS provides a robust local installation path, and its dual-track LM architecture is optimized for real-time synthesis on consumer GPUs.2 OpenMOSS takes a significant step further by offering a "torch-free" inference path using llama.cpp and ONNX Runtime, which allows the model to run without a full PyTorch installation—a major advantage for reducing the packaging burden on a Windows installer.12 MeloTTS and Chatterbox are similarly designed for local execution, with MeloTTS being specifically optimized for real-time inference on ordinary CPUs, ensuring accessibility for users without dedicated graphics hardware.16

### **Audible Watermarks and Forensic Accountability**

The user experience of an audiobook is uniquely sensitive to audible interruptions. While some commercial APIs include audible disclaimers, the open-source candidates analyzed here produce clean audio. ResembleAI’s Chatterbox includes an "implicit neural watermark" (PerTh) that embeds data into the audio using psychoacoustic principles.18 This signal is inaudible to human listeners and does not degrade the narration quality but allows for forensic verification of AI origin.18 Qwen3-TTS and Kokoro generate unmarked audio, though they emphasize ethical guidelines for use.18

### **Windows-Local Execution Path and Packaging Burden**

The complexity of setting up a local machine-learning environment is a known barrier to entry for desktop applications. Qwen3-TTS historically faced challenges on Windows, but dedicated forks like Qwen3-TTS-JP have emerged to provide native Windows support without the need for Windows Subsystem for Linux (WSL).25 OpenMOSS’s support for GGUF weights via llama.cpp allows for extreme VRAM optimization, fitting an 8B model onto 8GB GPUs, which aligns with standard consumer hardware.12 MeloTTS and Kokoro are the least burdensome, fitting in small footprints and running across a wide range of Python environments.9 Nari-labs (Dia2) presents a higher burden due to its 10GB VRAM requirement and the current lack of a quantized version, which may exclude a portion of Blurby’s target audience.23

| Provider | License | Offline | No Audible Watermark | Windows Path | Pass/Fail |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Qwen3-TTS | Apache 2.0 | Yes | Yes | Yes (Native Fork) | **PASS** |
| OpenMOSS-Team | Apache 2.0 | Yes | Yes | Yes (llama.cpp) | **PASS** |
| MeloTTS | MIT | Yes | Yes | Yes | **PASS** |
| hexgrad | Apache 2.0 | Yes | Yes | Yes | **PASS** |
| nari-labs | Apache 2.0 | Yes | Yes | Yes (High VRAM) | **PASS** |
| ResembleAI | MIT | Yes | Yes | Yes | **PASS** |

## **Acoustic and Linguistic Performance: The Narrator’s Craft**

The "spoken, not assembled" feel is the primary differentiator for high-quality audiobook narration. This quality is determined by a model’s ability to handle punctuation prosody, maintain cadence over long sentences, and avoid voice fatigue during extended listening sessions.

### **Punctuation Prosody and Sentence Cadence**

Acoustic naturalness is often lost at the boundaries of phrases. Qwen3-TTS excels in this area by using a semantic-acoustic neural audio codec that preserves the paralinguistic information of the training data.1 This allows the model to adjust its tone, speaking rate, and emotional expression based on the text semantics.6 Kokoro, despite its small parameter count, has achieved high ELO rankings in competitive arenas because its StyleTTS2-based architecture is specifically trained for natural prosody, though it lacks the fine-grained control of larger models.29

Chatterbox provides a unique mechanism for controlling this cadence through its "exaggeration" parameter.4 By adjusting intensity from monotone to dramatically expressive, a user can tailor the narration to the genre of the book—using more dynamic range for fiction and a steadier pace for non-fiction. This level of control prevents the "robotic" feel that often plagues simpler TTS systems when they encounter complex sentence structures in literature.

### **Long-Form Continuity and Voice Fatigue**

Listening to a synthetic voice for 5 to 10 minutes reveals subtle repetitions that lead to listener fatigue. OpenMOSS addresses this through its "structural stability" focus. The MOSS-TTSD model is specifically designed for ultra-long dialogues and sustained coherence, maintaining speaker identity and contextual consistency for durations of up to 60 minutes in a single session.33 This is achieved by maintaining Key-Value (KV) caches from previous turns, preventing the "acoustic amnesia" common in models that reset their internal state every few sentences.34

Qwen3-TTS similarly supports long-form generation, maintaining a low Word Error Rate (WER) of 2.81% in English over 10 minutes of continuous speech.2 In contrast, models like Dia2 are currently limited to two minutes of generation, which would require Blurby to frequently re-initialize the synthesis engine, potentially creating audible seams at chunk boundaries.11

### **Dialogue Handling and Non-Verbal Cues**

Audiobooks are frequently multi-vocal, requiring the narrator to distinguish between characters. Nari-labs (Dia) and OpenMOSS (TTSD) are the specialists in this domain. Dia can produce non-verbal communications like laughter, coughing, and clearing its throat, using specific tags such as (laughs) or (coughs) embedded within the text script.23 This capability, coupled with the ability to switch between and tags for different speakers, allows for an immersive, cinematic experience that traditional TTS cannot replicate.23

OpenMOSS-TTSD supports up to five speakers with flexible control over turn-taking and persona maintenance.33 This is critical for e-books with heavy dialogue, as it ensures character voices remain distinct and consistent throughout a chapter. Chatterbox-Turbo also includes native support for paralinguistic tags, allowing for realistic inclusions of \[cough\] or \[laugh\] to add realism to voice agents or character dialogue.36

| Model | Prosody | Long-Form Stability | Dialogue Handling | Fatigue Resistance | Narrative Score |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Qwen3-TTS | 5 | 5 | 4 | 5 | **4.75** |
| OpenMOSS | 4 | 5 | 5 | 5 | **4.75** |
| MeloTTS | 3 | 3 | 2 | 2 | **2.50** |
| Kokoro | 4 | 3 | 2 | 3 | **3.00** |
| Dia2 | 5 | 2 | 5 | 4 | **4.00** |
| Chatterbox | 5 | 4 | 4 | 4 | **4.25** |

## **Technical Orchestration: Integrating the Model with Blurby**

The integration of a TTS model into the Blurby app requires more than just audio output; it necessitates alignment with the app's existing reading modes and technical constraints.

### **Usable Inference Windows and Orchestration**

Blurby must manage the parsing of large EPUB files and convert them into synthesizable chunks. Qwen3-TTS and OpenMOSS provide the most generous inference windows, reducing the orchestration burden on the Blurby main process. Qwen3’s 10-minute window and OpenMOSS’s 60-minute window allow entire book chapters to be processed in a single pass or a few large chunks.2 This significantly simplifies the "restart / resume" logic, as the model maintains the prosodic state for longer periods.

Models with shorter windows, such as MeloTTS or Kokoro, require Blurby to handle fine-grained chunking. This often leads to "seam audibility" where the prosody of a voice shifts unnaturally between sentences because the model treats each chunk as a new, independent problem.34

### **Timing Metadata and Word Highlighting**

A primary feature of the Blurby app is word highlighting during reading. To achieve this, the app requires precise timing metadata—the start and end times for each word.8 Most TTS models do not natively output these timestamps. Kokoro and MeloTTS generate raw .wav files, requiring Blurby to run an external forced aligner, such as WhisperX or Montreal Forced Aligner (MFA), to generate the necessary timing data.38

Qwen3-TTS provides a significant advantage here with its Qwen3-ForcedAligner-0.6B. This model is a non-autoregressive (NAR) timestamp predictor that can align text-speech pairs in 11 languages, providing accurate timestamps at word, sentence, and paragraph levels.41 Integrating this directly into the Blurby pipeline would eliminate the need for a secondary alignment process, reducing latency and complexity. ResembleAI also provides advanced chunking strategies and real-time progress monitoring through its FastAPI-based API, though the open-source version focuses more on the generation side.44

### **Speed Control and Determinism**

Speed control is a standard requirement for audiobook apps. MeloTTS and Kokoro support speed adjustment natively in their inference calls (e.g., speed=1.5).13 For the transformer-based models like Qwen3 and Chatterbox, speed is typically controlled by adjusting the sampling temperature or providing specific instructions.7 Determinism—the ability to reproduce the exact same audio from the same text and seed—is crucial for the Blurby cloud sync feature.8 Chatterbox explicitly supports a "random seed" parameter where setting a fixed number results in repeatable generations, ensuring that audio generated on one device will be identical to that generated on another if needed.46

| Model | Window Length | Metadata Support | Speed Control | Sync-Friendliness | Blurby-Fit Score |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Qwen3-TTS | High | Excellent (FA Model) | Instruction-based | High | **5.0** |
| OpenMOSS | High | Manual (Alignment) | Instruction-based | High | **4.0** |
| MeloTTS | Low | None | Native Parameter | Medium | **3.0** |
| Kokoro | Low | None | Native Parameter | Medium | **3.0** |
| Dia2 | Low | Native Streaming | Temperature | Low | **3.0** |
| Chatterbox | Medium | Manual (API Hooks) | CFG/Exaggeration | High | **4.5** |

## **Operational Engineering: Distribution and Deployment**

The "operational fit" considers how Blurby can bundle, update, and support these models on a Windows desktop. The Electron three-layer architecture places specific constraints on how sidecar processes—like a Python-based TTS engine—are managed.8

### **CPU Viability and GPU Dependence**

Blurby cannot guarantee that every user will have a high-end NVIDIA GPU. Kokoro and MeloTTS are the most operationally affordable in this regard, as they are fast enough for real-time inference on a standard CPU.9 OpenMOSS-TTS-Nano, at 0.1B parameters, is also designed for CPU-only instances, providing a high-quality alternative for users without dedicated graphics cards.12

Qwen3-TTS and Chatterbox are more intensive. While Qwen3-TTS-0.6B can run on budget GPUs with 4GB of VRAM, the higher-quality 1.7B variant ideally requires 8GB.3 Chatterbox-Turbo is optimized for low-latency voice agents and achieves sub-200ms latency, but it still benefits significantly from GPU acceleration.36

### **Model Size and Asset Staging Burden**

The size of the model assets directly impacts the initial load time and storage footprint of Blurby. Kokoro is the lightest at 82M parameters (under 500MB).9 MeloTTS is also relatively small. Qwen3-TTS models are larger, with the 0.6B model at 2.3GB and the 1.7B model at 4.2GB.24 OpenMOSS’s quantized weights (GGUF) and the Nano model offer a middle ground, with the 0.1B model providing a small footprint for edge deployment.12

### **Windows Setup Reliability and Packaging**

Packaging a Python-based machine learning project for Windows often involves "dependency hell," particularly with binary wheels like PyTorch and TorchVision.27 Qwen3-TTS and Chatterbox both recommend Python 3.11 for the best balance of stability and compatibility on Windows.27 OpenMOSS’s "torch-free" path is a major advantage here; by using llama.cpp and ONNX Runtime, Blurby could potentially bundle the TTS engine as a simple C++ sidecar, avoiding the weight and instability of a full Python environment within the Electron app.12

| Model | Parameter Size | Disk Footprint | Packaging Complexity | Operational Score |
| :---- | :---- | :---- | :---- | :---- |
| Qwen3-TTS | 0.6B / 1.7B | 2.3GB \- 4.2GB | High (Python/CUDA) | **3.5** |
| OpenMOSS | 0.1B \- 8B | 1GB \- 5GB | Low (llama.cpp) | **5.0** |
| MeloTTS | \~150M | \<1GB | Medium (Python) | **4.0** |
| Kokoro | 82M | \<500MB | Low (Python/ONNX) | **5.0** |
| Dia2 | 1B \- 2B | 4GB \- 8GB | High (10GB VRAM) | **2.0** |
| Chatterbox | 350M \- 500M | 1GB \- 2GB | Medium (Python) | **4.0** |

## **Second and Third-Order Insights: Trends in Local Synthesis**

The shift from VITS (MeloTTS, Kokoro) to Speech-LMs (Qwen3, Chatterbox, OpenMOSS) is not merely an incremental improvement; it is a structural revolution.

### **The "Acoustic Amnesia" Solution**

The primary technical problem in long-form TTS has been the loss of context. Earlier models treated each sentence as an isolated event. The use of KV caches in models like OpenMOSS and the dual-track LM architecture in Qwen3 represent a move toward "context-aware" synthesis.3 This suggests that as Blurby evolves, the ability to maintain state across a whole chapter will be the most significant factor in reducing voice fatigue.

### **The Convergence of TTS and ASR**

Qwen3’s strategy of releasing a "Forced Aligner" alongside its TTS indicates a trend toward unified speech understanding and generation.41 For Blurby, this means that the "audiobook of the future" will not just be audio; it will be a deeply indexed, time-aligned experience where the text and voice are inextricably linked by a single foundation model.

### **The Democratization of Voice Design**

Qwen3-TTS and OpenMOSS-VoiceGenerator are moving away from simple "voice cloning" toward "voice design" through natural language.2 This allows Blurby users to describe a narrator—e.g., "A gravelly, 50-year-old male with a slight British accent and a calm demeanor"—and generate a unique, rights-free voice.2 This shifts the product from a utility to a creative tool for personalization.

## **Strategic Comparison: The "Beyond Kokoro" Decision**

The central question for Blurby is whether these models provide a better long-form experience than the Kokoro baseline while remaining operationally viable.

* **Kokoro** is the "safe" choice: it is fast, small, and high-quality for its size. However, it lacks the emotional range, cloning capability, and multi-character handling that Speech-LMs provide.30  
* **Qwen3-TTS** provides the highest quality and most robust feature set, particularly for word-level highlighting, but carries a higher hardware and packaging burden.2  
* **OpenMOSS** offers the best operational path for a professional product, with its torch-free inference and long-form dialogue specialists.12

The causal relationship between model size and quality is beginning to decouple. Models like OpenMOSS-Nano and Chatterbox-Turbo demonstrate that 100M-350M parameters can produce "production-grade" results if the training data and architecture are sufficiently optimized.5

## **Strategic Conclusions and Final Verdict**

Based on the rubrics of Hard Gates, Narration Quality, Blurby-Specific Fit, and Operational Fit, the following verdict provides a roadmap for the Blurby TTS strategy.

### **Prototype Candidate: Qwen3-TTS (0.6B and 1.7B)**

Qwen3-TTS is the clear prototype candidate. Its native forced alignment model, 10-minute context window, and 10-language support make it the most feature-complete solution for an audiobook application.2 The 1.7B model should be used for the "High Fidelity" mode, while the 0.6B model serves as a balanced option for mid-range GPUs. Its ability to create "your own voice" through natural language descriptions (VoiceDesign) provides a unique marketing angle for Blurby.2

### **Enablement / Watchlist: OpenMOSS-Team**

OpenMOSS is the strategic backup and "enablement" candidate. Its support for llama.cpp and ONNX Runtime provides a path to a lighter, more reliable Windows installer that doesn't depend on the complexity of a full Python/CUDA stack.12 The MOSS-TTSD model should be closely watched for its superior multi-speaker dialogue handling, which could be a key feature for Blurby's role-play or "dramatic" reading modes.33

### **Enablement / Watchlist: ResembleAI Chatterbox**

Chatterbox remains on the watchlist as a high-performance alternative for English-focused storytelling. Its unique "exaggeration" control and "alignment-informed generation" make it a strong contender for low-latency, expressive narration.4 Its MIT license and simple pip installation make it an excellent choice for rapid feature prototyping.14

### **Reject: nari-labs (Dia2) and MeloTTS**

Nari-labs’ Dia2 is rejected for the Blurby product lane due to its high VRAM requirements, English-only limitation, and generation instability over long sequences.11 MeloTTS, while fast and efficient, is rejected for high-end narration as it lacks the prosodic depth and voice cloning features of the newer Speech-LM generation.35

## **Final Summary Table**

| Provider | Pass/Fail | Narration | Blurby-Fit | Operational | Verdict |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Qwen3-TTS** | **PASS** | 5 | 5 | 3 | **PROTOTYPE** |
| **OpenMOSS** | **PASS** | 4 | 4 | 5 | **WATCHLIST** |
| **Chatterbox** | **PASS** | 5 | 4 | 4 | **WATCHLIST** |
| **Kokoro** | **PASS** | 3 | 3 | 5 | **WATCHLIST** |
| **MeloTTS** | **PASS** | 2 | 3 | 4 | **REJECT** |
| **nari-labs** | **PASS** | 4 | 3 | 2 | **REJECT** |

The recommendation for Blurby is to pursue a tiered architecture: using **Qwen3-TTS-1.7B** for users with dedicated NVIDIA GPUs to provide the highest quality "Narrative Theater" experience, while implementing a **MOSS-TTS-Nano** or **Kokoro** fallback for CPU-only users to ensure universal product viability. This approach leverages the cutting edge of neural synthesis while respecting the operational realities of local desktop software.

#### **Works cited**

1. Qwen3-TTS Technical Report \- arXiv, accessed April 18, 2026, [https://arxiv.org/html/2601.15621v1](https://arxiv.org/html/2601.15621v1)  
2. Qwen3-TTS: The Complete 2026 Guide to Open-Source Voice Cloning and AI Speech Generation | by cheng zhang | Medium, accessed April 18, 2026, [https://medium.com/@zh.milo/qwen3-tts-the-complete-2026-guide-to-open-source-voice-cloning-and-ai-speech-generation-1a2efca05cd6](https://medium.com/@zh.milo/qwen3-tts-the-complete-2026-guide-to-open-source-voice-cloning-and-ai-speech-generation-1a2efca05cd6)  
3. Qwen3-TTS: The Complete 2026 Guide to Open-Source Voice Cloning and AI Speech Generation \- DEV Community, accessed April 18, 2026, [https://dev.to/czmilo/qwen3-tts-the-complete-2026-guide-to-open-source-voice-cloning-and-ai-speech-generation-1in6](https://dev.to/czmilo/qwen3-tts-the-complete-2026-guide-to-open-source-voice-cloning-and-ai-speech-generation-1in6)  
4. ResembleAI/chatterbox \- Hugging Face, accessed April 18, 2026, [https://huggingface.co/ResembleAI/chatterbox](https://huggingface.co/ResembleAI/chatterbox)  
5. Best Open Source AI Voice Cloning Tools in 2026 \- Resemble AI, accessed April 18, 2026, [https://www.resemble.ai/best-open-source-ai-voice-cloning-tools/](https://www.resemble.ai/best-open-source-ai-voice-cloning-tools/)  
6. Qwen3-TTS: Multilingual, Real-Time Speech AI \- Webkul Blog, accessed April 18, 2026, [https://webkul.com/blog/qwen3-tts/](https://webkul.com/blog/qwen3-tts/)  
7. Kokoro TTS vs. Qwen3-TTS Comparison \- SourceForge, accessed April 18, 2026, [https://sourceforge.net/software/compare/Kokoro-TTS-vs-Qwen3-TTS/](https://sourceforge.net/software/compare/Kokoro-TTS-vs-Qwen3-TTS/)  
8. TECHNICAL\_REFERENCE.md  
9. Kokoro TTS | Guides \- Clore.ai, accessed April 18, 2026, [https://docs.clore.ai/guides/audio-and-voice/kokoro-tts](https://docs.clore.ai/guides/audio-and-voice/kokoro-tts)  
10. Apache License 2.0 \- OpenMOSS/MOSS-TTS \- GitHub, accessed April 18, 2026, [https://github.com/OpenMOSS/MOSS-TTS/blob/main/LICENSE](https://github.com/OpenMOSS/MOSS-TTS/blob/main/LICENSE)  
11. nari-labs/dia2: TTS model capable of streaming conversational audio in realtime. \- GitHub, accessed April 18, 2026, [https://github.com/nari-labs/dia2](https://github.com/nari-labs/dia2)  
12. MOSS‑TTS Family is an open‑source speech and sound generation model family from MOSI.AI and the OpenMOSS team. It is designed for high‑fidelity, high‑expressiveness, and complex real‑world scenarios, covering stable long‑form speech, multi‑speaker dialogue, voice/character design, environmental sound effects, and real‑time streaming TTS. · GitHub, accessed April 18, 2026, [https://github.com/OpenMOSS/MOSS-TTS](https://github.com/OpenMOSS/MOSS-TTS)  
13. myshell-ai/MeloTTS-English \- Hugging Face, accessed April 18, 2026, [https://huggingface.co/myshell-ai/MeloTTS-English](https://huggingface.co/myshell-ai/MeloTTS-English)  
14. MIT License \- resemble-ai/chatterbox \- GitHub, accessed April 18, 2026, [https://github.com/resemble-ai/chatterbox/blob/master/LICENSE](https://github.com/resemble-ai/chatterbox/blob/master/LICENSE)  
15. GitHub \- resemble-ai/chatterbox: SoTA open-source TTS, accessed April 18, 2026, [https://github.com/resemble-ai/chatterbox](https://github.com/resemble-ai/chatterbox)  
16. MeloTTS: A High-Quality Speech Synthesis Tool Developed by MyShell AI Supporting Mixed Chinese and English Pronunciation, accessed April 18, 2026, [https://www.aibase.com/news/5718](https://www.aibase.com/news/5718)  
17. myshell-ai/MeloTTS: High-quality multi-lingual text-to ... \- GitHub, accessed April 18, 2026, [https://github.com/myshell-ai/MeloTTS](https://github.com/myshell-ai/MeloTTS)  
18. Watermarking & Responsible AI \- Chatterbox TTS \- Mintlify, accessed April 18, 2026, [https://mintlify.com/yocxy2/chatterboxyocxy/guides/watermarking](https://mintlify.com/yocxy2/chatterboxyocxy/guides/watermarking)  
19. Protect your IP with Neural Audio Watermarker \- Resemble AI, accessed April 18, 2026, [https://www.resemble.ai/watermarker/](https://www.resemble.ai/watermarker/)  
20. Chatterbox \- Free Open Source Text to Speech Model \- Resemble AI, accessed April 18, 2026, [https://www.resemble.ai/chatterbox/](https://www.resemble.ai/chatterbox/)  
21. Proactive Detection Techniques for Watermarking Voice Cloning Output \- Resemble AI, accessed April 18, 2026, [https://www.resemble.ai/detect-watermarking-voice-cloning/](https://www.resemble.ai/detect-watermarking-voice-cloning/)  
22. resemble-ai/chatterbox: SoTA open-source TTS · GitHub \- GitHub, accessed April 18, 2026, [https://github.com/resemble-ai/chatterbox\#Built-in-PerTh-Watermarking-for-Responsible-AI](https://github.com/resemble-ai/chatterbox#Built-in-PerTh-Watermarking-for-Responsible-AI)  
23. nari-labs/dia: A TTS model capable of generating ultra ... \- GitHub, accessed April 18, 2026, [https://github.com/nari-labs/dia](https://github.com/nari-labs/dia)  
24. Qwen3-TTS: Surprised by the Quality of Japanese on Apple Silicon M3 — Creating Rights-Free Voices with VoiceDesign \- DEV Community, accessed April 18, 2026, [https://dev.to/tumf/qwen3-tts-surprised-by-the-quality-of-japanese-on-apple-silicon-m3-creating-rights-free-voices-k1d](https://dev.to/tumf/qwen3-tts-surprised-by-the-quality-of-japanese-on-apple-silicon-m3-creating-rights-free-voices-k1d)  
25. Run Qwen3-TTS on Windows with RTX 5090: The Complete Guide to Voice Cloning in 3 Seconds | by GeneLab | Medium, accessed April 18, 2026, [https://medium.com/@genelab\_999/run-qwen3-tts-on-windows-with-rtx-5090-the-complete-guide-to-voice-cloning-in-3-seconds-c584db1b78a4](https://medium.com/@genelab_999/run-qwen3-tts-on-windows-with-rtx-5090-the-complete-guide-to-voice-cloning-in-3-seconds-c584db1b78a4)  
26. EliseWindbloom/MeloTTS-Windows: High-quality multi-lingual text-to-speech library by MyShell.ai. Support English, Spanish, French, Chinese, Japanese and Korean. \- GitHub, accessed April 18, 2026, [https://github.com/EliseWindbloom/MeloTTS-Windows](https://github.com/EliseWindbloom/MeloTTS-Windows)  
27. Text-to-Speech on your PC: running Chatterbox Turbo locally on Windows – clean setup \+ known pitfalls | Emanuele Feronato, accessed April 18, 2026, [https://emanueleferonato.com/2026/01/07/text-to-speech-on-your-pc-running-chatterbox-turbo-locally-on-windows-clean-setup-known-pitfalls/](https://emanueleferonato.com/2026/01/07/text-to-speech-on-your-pc-running-chatterbox-turbo-locally-on-windows-clean-setup-known-pitfalls/)  
28. nari-labs/Dia-1.6B \- Hugging Face, accessed April 18, 2026, [https://huggingface.co/nari-labs/Dia-1.6B](https://huggingface.co/nari-labs/Dia-1.6B)  
29. Kokoro-82M: The best TTS model in just 82 Million parameters | by Mehul Gupta \- Medium, accessed April 18, 2026, [https://medium.com/data-science-in-your-pocket/kokoro-82m-the-best-tts-model-in-just-82-million-parameters-512b4ba4f94c](https://medium.com/data-science-in-your-pocket/kokoro-82m-the-best-tts-model-in-just-82-million-parameters-512b4ba4f94c)  
30. How is Kokoro TTS so good with so few parameters? : r/LocalLLaMA \- Reddit, accessed April 18, 2026, [https://www.reddit.com/r/LocalLLaMA/comments/1i06mew/how\_is\_kokoro\_tts\_so\_good\_with\_so\_few\_parameters/](https://www.reddit.com/r/LocalLLaMA/comments/1i06mew/how_is_kokoro_tts_so_good_with_so_few_parameters/)  
31. Best AI Voice Generators for Realistic, Low-Latency TTS (2026 Comparison \+ Benchmarks), accessed April 18, 2026, [https://inworld.ai/resources/best-ai-voice-generators](https://inworld.ai/resources/best-ai-voice-generators)  
32. Running local text to speech using chatterbox \- Tech Couch, accessed April 18, 2026, [https://tech-couch.com/post/running-local-text-to-speech-using-chatterbox](https://tech-couch.com/post/running-local-text-to-speech-using-chatterbox)  
33. README.md · OpenMOSS-Team/MOSS-TTSD-v1.0 at main \- Hugging Face, accessed April 18, 2026, [https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v1.0/blob/main/README.md](https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v1.0/blob/main/README.md)  
34. Audio Deepfake Detection in the Age of Advanced Text-to-Speech models \- ResearchGate, accessed April 18, 2026, [https://www.researchgate.net/publication/400178463\_Audio\_Deepfake\_Detection\_in\_the\_Age\_of\_Advanced\_Text-to-Speech\_models](https://www.researchgate.net/publication/400178463_Audio_Deepfake_Detection_in_the_Age_of_Advanced_Text-to-Speech_models)  
35. The Best Open-Source Text-to-Speech Models in 2026 \- BentoML, accessed April 18, 2026, [https://www.bentoml.com/blog/exploring-the-world-of-open-source-text-to-speech-models](https://www.bentoml.com/blog/exploring-the-world-of-open-source-text-to-speech-models)  
36. ResembleAI/chatterbox-turbo-ONNX \- Hugging Face, accessed April 18, 2026, [https://huggingface.co/ResembleAI/chatterbox-turbo-ONNX](https://huggingface.co/ResembleAI/chatterbox-turbo-ONNX)  
37. Best Audio Models \- Feb 2026 : r/LocalLLaMA \- Reddit, accessed April 18, 2026, [https://www.reddit.com/r/LocalLLaMA/comments/1r7bsfd/best\_audio\_models\_feb\_2026/](https://www.reddit.com/r/LocalLLaMA/comments/1r7bsfd/best_audio_models_feb_2026/)  
38. Recommendation for a TTS that can output timestamps for the words? : r/TextToSpeech, accessed April 18, 2026, [https://www.reddit.com/r/TextToSpeech/comments/1sk75f3/recommendation\_for\_a\_tts\_that\_can\_output/](https://www.reddit.com/r/TextToSpeech/comments/1sk75f3/recommendation_for_a_tts_that_can_output/)  
39. kokoro tts with timestamps? : r/LocalLLaMA \- Reddit, accessed April 18, 2026, [https://www.reddit.com/r/LocalLLaMA/comments/1qzqtkk/kokoro\_tts\_with\_timestamps/](https://www.reddit.com/r/LocalLLaMA/comments/1qzqtkk/kokoro_tts_with_timestamps/)  
40. MeloTTS/docs/install.md at main · myshell-ai/MeloTTS · GitHub, accessed April 18, 2026, [https://github.com/myshell-ai/MeloTTS/blob/main/docs/install.md](https://github.com/myshell-ai/MeloTTS/blob/main/docs/install.md)  
41. Qwen3-ASR & Qwen3-ForcedAligner is Now Open Sourced: Robust, Streaming and Multilingual\!, accessed April 18, 2026, [https://qwen.ai/blog?id=qwen3asr](https://qwen.ai/blog?id=qwen3asr)  
42. Qwen/Qwen3-ForcedAligner-0.6B \- Hugging Face, accessed April 18, 2026, [https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B](https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B)  
43. Qwen3-ASR Technical Report \- arXiv, accessed April 18, 2026, [https://arxiv.org/html/2601.21337v1](https://arxiv.org/html/2601.21337v1)  
44. Documentation \- Chatterbox TTS API, accessed April 18, 2026, [https://chatterboxtts.com/docs](https://chatterboxtts.com/docs)  
45. 10 Best AI Voice Generators in 2026 \- Fal.ai, accessed April 18, 2026, [https://fal.ai/learn/tools/ai-voice-generators](https://fal.ai/learn/tools/ai-voice-generators)  
46. GitHub \- petermg/Chatterbox-TTS-Extended: Modified version of Chatterbox that accepts text files as input and no character restrictions. I use it to make audiobooks, especially for my kids., accessed April 18, 2026, [https://github.com/petermg/Chatterbox-TTS-Extended](https://github.com/petermg/Chatterbox-TTS-Extended)  
47. MOSS-TTS-Nano: a 0.1B open-source multilingual TTS model that runs on 4-core CPU and supports realtime speech generation : r/LocalLLaMA \- Reddit, accessed April 18, 2026, [https://www.reddit.com/r/LocalLLaMA/comments/1sjdfp6/mossttsnano\_a\_01b\_opensource\_multilingual\_tts/](https://www.reddit.com/r/LocalLLaMA/comments/1sjdfp6/mossttsnano_a_01b_opensource_multilingual_tts/)  
48. Qwen3-TTS Voice Cloning | Guides \- Clore.ai, accessed April 18, 2026, [https://docs.clore.ai/guides/audio-and-voice/qwen3-tts](https://docs.clore.ai/guides/audio-and-voice/qwen3-tts)  
49. Chatterbox TTS: Open-Source Voice Synthesis Beats ElevenLabs | byteiota, accessed April 18, 2026, [https://byteiota.com/chatterbox-tts-open-source-voice-synthesis-beats-elevenlabs-2/](https://byteiota.com/chatterbox-tts-open-source-voice-synthesis-beats-elevenlabs-2/)  
50. Kokoro \- GitHub, accessed April 18, 2026, [https://github.com/hexgrad/kokoro](https://github.com/hexgrad/kokoro)  
51. chatterbox-tts \- PyPI, accessed April 18, 2026, [https://pypi.org/project/chatterbox-tts/](https://pypi.org/project/chatterbox-tts/)  
52. MOSS-VoiceGenerator: Create Realistic Voices with Natural Language Descriptions \- arXiv, accessed April 18, 2026, [https://arxiv.org/html/2603.28086v1](https://arxiv.org/html/2603.28086v1)  
53. Qwen/Qwen3-TTS-12Hz-0.6B-Base \- Hugging Face, accessed April 18, 2026, [https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base)  
54. OpenMOSS-Team/MOSS-TTSD-v0.5 \- Hugging Face, accessed April 18, 2026, [https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v0.5](https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v0.5)