// Flow reading mode (READER-MODE-SEPARATION-2): the only entry point the router may import.
import { READER_MODE_RUNTIME_CONTRACT_VERSION, type ReaderModeModule } from "../ReaderModeAdapter";
import { createFlowRuntime } from "./ModeRuntime";
import { FlowModeView } from "./ModeView";

export const flowMode: ReaderModeModule<"flow"> = Object.freeze({
  id: "flow" as const,
  contractVersion: READER_MODE_RUNTIME_CONTRACT_VERSION,
  createRuntime: createFlowRuntime,
  View: FlowModeView,
});

export { createFlowRuntime, FlowModeView };
