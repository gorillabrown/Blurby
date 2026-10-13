// Narrate reading mode (READER-MODE-SEPARATION-2): the only entry point the router may import.
import { READER_MODE_RUNTIME_CONTRACT_VERSION, type ReaderModeModule } from "../ReaderModeAdapter";
import { createNarrateRuntime } from "./ModeRuntime";
import { NarrateModeView } from "./ModeView";

export const narrateMode: ReaderModeModule<"narrate"> = Object.freeze({
  id: "narrate" as const,
  contractVersion: READER_MODE_RUNTIME_CONTRACT_VERSION,
  createRuntime: createNarrateRuntime,
  View: NarrateModeView,
});

export { createNarrateRuntime, NarrateModeView };
