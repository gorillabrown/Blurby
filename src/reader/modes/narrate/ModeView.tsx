// Narrate mode view (READER-MODE-SEPARATION-2 design §B.0, §B.4): the mode root and this mode's own
// FoliateView (scrolled surface, narration highlight and scroll-follow, chunk visuals). Non-EPUB
// documents render nothing here; the shell keeps the re-import fallback (Q-A).
import type { ReaderModeViewProps } from "../ReaderModeAdapter";
import NarrateFoliateView from "./FoliateView";
import { NarrateModeRuntime } from "./ModeRuntime";
import { useNarrateModeBindings } from "./useModeBindings";
import "./mode.css";

function NarrateModeBody({ runtime }: { runtime: NarrateModeRuntime }) {
  const { useFoliate, viewProps } = useNarrateModeBindings(runtime);
  return (
    <div className="rm-narrate-root">
      {useFoliate && <NarrateFoliateView {...viewProps} />}
    </div>
  );
}

export function NarrateModeView({ runtime }: ReaderModeViewProps) {
  if (!(runtime instanceof NarrateModeRuntime)) throw new Error(`NarrateModeView cannot render a ${runtime.mode} runtime`);
  return <NarrateModeBody runtime={runtime} />;
}
