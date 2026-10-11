// Page reading mode (READER-MODE-SEPARATION-2): the only entry point the router may import.
import { READER_MODE_RUNTIME_CONTRACT_VERSION, type ReaderModeModule } from "../ReaderModeAdapter";
import { createPageRuntime } from "./ModeRuntime";
import { PageModeView } from "./ModeView";

export const pageMode: ReaderModeModule<"page"> = Object.freeze({
  id: "page" as const,
  contractVersion: READER_MODE_RUNTIME_CONTRACT_VERSION,
  createRuntime: createPageRuntime,
  View: PageModeView,
});

export { createPageRuntime, PageModeView };
