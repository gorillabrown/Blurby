// Focus reading mode (READER-MODE-SEPARATION-2): the only entry point the router may import.
import { READER_MODE_RUNTIME_CONTRACT_VERSION, type ReaderModeModule } from "../ReaderModeAdapter";
import { createFocusRuntime } from "./ModeRuntime";
import { FocusModeView } from "./ModeView";

export const focusMode: ReaderModeModule<"focus"> = Object.freeze({
  id: "focus" as const,
  contractVersion: READER_MODE_RUNTIME_CONTRACT_VERSION,
  createRuntime: createFocusRuntime,
  View: FocusModeView,
});

export { createFocusRuntime, FocusModeView };
