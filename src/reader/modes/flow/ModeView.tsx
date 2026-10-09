// Flow mode view (READER-MODE-SEPARATION-2 design §B.0, §B.3): the mode root and this mode's own
// FoliateView (scrolled surface, shrink cursor, chunk visuals). Non-EPUB documents render nothing
// here; the shell keeps the re-import fallback (Q-A).
import type { ReaderModeViewProps } from "../ReaderModeAdapter";
import FlowFoliateView from "./FoliateView";
import { FlowModeRuntime } from "./ModeRuntime";
import { useFlowModeBindings } from "./useModeBindings";
import "./mode.css";

function FlowModeBody({ runtime }: { runtime: FlowModeRuntime }) {
  const { useFoliate, viewProps } = useFlowModeBindings(runtime);
  return (
    <div className="rm-flow-root">
      {useFoliate && <FlowFoliateView {...viewProps} />}
    </div>
  );
}

export function FlowModeView({ runtime }: ReaderModeViewProps) {
  if (!(runtime instanceof FlowModeRuntime)) throw new Error(`FlowModeView cannot render a ${runtime.mode} runtime`);
  return <FlowModeBody runtime={runtime} />;
}
