import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { createFakeInfrastructure } from "./readerModes/harness/fakePorts";
import { createReaderPorts } from "../src/reader/ports/createReaderPorts";
import { createReaderModeHandoff } from "../src/reader/document/ReaderDocumentSnapshot";
import type { ReaderModeModule } from "../src/reader/modes/ReaderModeAdapter";
import { flowMode } from "../src/reader/modes/flow/index";
import { narrateMode } from "../src/reader/modes/narrate/index";
import { pageMode } from "../src/reader/modes/page/index";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");
// READER-MODE-SEPARATION-2 (OC-5): owners of behavior that left ReaderContainer at E1.
const readMode = (mode: string, file: string) => read(`src/reader/modes/${mode}/${file}`);
/** The body of a runtime's arrow-function member, from its declaration to the closing `  };`. */
const memberBody = (src: string, declaration: string) => {
  const start = src.indexOf(declaration);
  expect(start).toBeGreaterThan(-1);
  return src.slice(start, src.indexOf("\n  };", start));
};

describe("flow narration integration (NARR-LAYER-1B)", () => {
  it("ReaderContainer treats narrate as the architectural narration-selected mode", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("readingMode === \"narrate\"");
    // OC-5b: narration-selected speed keys are owned by the runtimes. Flow never narrates (the flow+narrating
    // hybrid is Narrate); Narrate's ↑/↓ store and apply the TTS rate.
    const flowRuntime = readMode("flow", "ModeRuntime.ts");
    const narrateRuntime = readMode("narrate", "ModeRuntime.ts");
    expect(flowRuntime).toContain("narrating: false,");
    expect(narrateRuntime).toContain("this.ports.settings.update({ ttsRate: newRate });");
    expect(narrateRuntime).toContain("this.ports.audio.adjustRate(newRate);");
    // OC-5b: Page's ↑/↓ adjust the TTS rate when Narrate is the last reading mode.
    const pageRuntime = readMode("page", "ModeRuntime.ts");
    expect(pageRuntime).toContain("if (settings.lastReadingMode === \"narrate\") {");
    expect(src).not.toContain("(readingMode === \"page\" && settings.isNarrating === true)");
  });

  it("ReaderContainer passes spoken-word truth into FoliatePageView while narration is active", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("readingMode={readingMode}");
    // OC-5b: each scrolled-surface mode (Focus, Flow, Narrate) owns a scrolled Foliate view; Page stays paginated.
    for (const mode of ["focus", "flow", "narrate"] as const) {
      expect(readMode(mode, "FoliateView.tsx")).toContain('view.renderer.setAttribute("flow", "scrolled");');
    }
    expect(readMode("page", "FoliateView.tsx")).toContain('view.renderer.setAttribute("flow", "paginated");');
    expect(src).toContain('readingMode === "focus" || readingMode === "flow" || readingMode === "narrate"');
    expect(src).toContain("isNarrating={isNarrating && narration.speaking && !narration.warming}");
    // OC-5b: Narrate's binding hands its view the spoken word read from the audio port while it speaks.
    expect(readMode("narrate", "useModeBindings.ts")).toContain("narrationWordIndex: runtime.readNarrationWordIndex(),");
    expect(readMode("narrate", "ModeRuntime.ts")).toContain("return audio.speaking ? audio.cursorWordIndex : undefined;");
    // OC-5b (dead path, design §B.5 item 4): the pause reason and audio progress fed only the legacy overlay
    // cursor, which never ran because Flow always passed flowMode. The retained legacy view keeps that gate,
    // and no mode tree consumes either value.
    expect(read("src/components/FoliatePageView.tsx")).toContain('if (flowMode || readingMode !== "flow" || !flowPlaying) {');
    for (const mode of ["page", "focus", "flow", "narrate"]) {
      for (const file of ["ModeRuntime.ts", "useModeBindings.ts", "ModeView.tsx", "FoliateView.tsx"]) {
        expect(readMode(mode, file), `${mode}/${file}`).not.toMatch(/\b(getAudioProgress|narrationPauseReason)\s*(=|:|\?\.|\()/);
      }
    }
  });

  it("ReaderContainer initializes narration before any derived mode state reads narration.speaking", () => {
    const src = read("src/components/ReaderContainer.tsx");
    const narrationDecl = src.indexOf("const narration = useNarration({");
    const modePlayingDecl = src.indexOf("const modePlaying =");
    const activelyReadingDecl = src.indexOf("const isActivelyReading =");

    expect(narrationDecl).toBeGreaterThan(-1);
    expect(modePlayingDecl).toBeGreaterThan(-1);
    expect(activelyReadingDecl).toBeGreaterThan(-1);
    expect(narrationDecl).toBeLessThan(modePlayingDecl);
    expect(narrationDecl).toBeLessThan(activelyReadingDecl);
  });

  it("ReaderContainer treats narrate as a flow-surface mode during Foliate onLoad", () => {
    const src = read("src/components/ReaderContainer.tsx");
    // OC-5b: section load is owned per mode. Only Page re-extracts words and restores on load; the
    // scrolled-surface modes (Focus, Flow, Narrate) only bump their render version.
    expect(memberBody(readMode("page", "ModeRuntime.ts"), "onSurfaceLoad = (): void => {")).toContain("this.surface.extractWords();");
    for (const mode of ["focus", "flow", "narrate"] as const) {
      const onLoad = memberBody(readMode(mode, "ModeRuntime.ts"), "onSurfaceLoad = (): void => {");
      expect(onLoad).toContain("this.state.renderVersion += 1;");
      expect(onLoad).not.toContain("extractWords");
    }
    expect(src).not.toContain("onLoad={() => {\n        // Extract words from DOM after each section loads\n        // BUT NOT during active narration/flow — rebuilding the word array mid-mode\n        // shifts all data-word-index attributes, causing highlight/page jumps.\n        // Uses ref (not state) because this callback is captured in a closure at render time.\n        setTimeout(() => {\n          setFoliateRenderVersion((prev) => prev + 1);\n          const mode = readingModeRef.current;\n          if (mode !== \"flow\") {");
  });

  it("FoliatePageView preserves global word indexing during active narrate section loads", () => {
    const src = read("src/components/FoliatePageView.tsx");
    expect(src).toContain("const isActiveMode = readingModeRef.current === \"flow\" || readingModeRef.current === \"narrate\";");
    expect(src).not.toContain("const isActiveMode = readingModeRef.current === \"flow\";");
  });

  it("ReaderContainer blocks passive relocate downgrades during narrate", () => {
    // OC-5b: behavioural at the new owners. With no resume anchor, a passive relocate does not move the
    // Flow or Narrate highlight (their word advance / audio truth owns it). Page is the positive control:
    // it takes floor(fraction × wordCount) = floor(0.8 × 25) = 20.
    for (const [module, expected] of [[flowMode, 7], [narrateMode, 7], [pageMode, 20]] as Array<[ReaderModeModule, number]>) {
      const fake = createFakeInfrastructure();
      const broker = createReaderPorts(fake.infra);
      const document = fake.infra.document.snapshot();
      broker.openDocument(document.documentId);
      const { key, ports } = broker.issue(module.id);
      const runtime = module.createRuntime({
        key,
        ports,
        document,
        settings: fake.infra.settings.read(),
        handoff: createReaderModeHandoff({
          source: null,
          canonicalWordIndex: 7,
          publishedWordIndex: 7,
          highlightedWordIndex: 7,
          softWordIndex: 7,
          resumeAnchor: null,
          explicitSelectionAnchor: null,
          cfi: null,
          engaged: false,
        }),
        arrival: "silent",
      }) as unknown as { onRelocate(detail: { cfi: string; fraction: number }): void } & ReturnType<ReaderModeModule["createRuntime"]>;
      runtime.select(7);
      runtime.onRelocate({ cfi: "epubcfi(/6/4!/4/2/1:0)", fraction: 0.8 });
      expect(runtime.getSnapshot().highlightedWordIndex).toBe(expected);
      runtime.destroy();
    }
  });

  it("useReaderMode no longer exposes startNarration", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).not.toContain("startNarration");
    expect(src).toContain("toggleNarrationInFlow");
  });

  it("orchestrator allows explicit paused narrate selection", () => {
    const src = read("src/reader/useReaderModeOrchestrator.ts");
    expect(src).toContain("handleSelectMode: (mode: \"focus\" | \"flow\" | \"narrate\") => void;");
    expect(src).toContain("const handleSelectMode = useCallback((target: \"focus\" | \"flow\" | \"narrate\") => {");
  });

  it("orchestrator cycles focus, flow, and narrate without auto-starting them", () => {
    const src = read("src/reader/useReaderModeOrchestrator.ts");
    expect(src).toContain("if (current === \"focus\") return \"flow\";");
    expect(src).toContain("if (current === \"flow\") return \"narrate\";");
    expect(src).toContain("return \"focus\";");
  });

  it("useReaderMode keeps flow playback dormant when starting narrate", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain("if (targetMode === \"flow\") {");
    expect(src).toContain("setFlowPlaying(true);");
    expect(src).toContain("modeInstance.startMode(\"flow\", startWord, effectiveWords, pBreaks);");
  });
});
