// Narrate mode view (NARRATE-REBUILD-1 P4; READER-MODE-SEPARATION-2 design §B.0, §B.4): the mode root, this
// mode's own FoliateView (scrolled surface, narration highlight and scroll-follow) and the two notices the
// charter names — F5 "voice loading" while the first word is on its way, F4 "couldn't be timed" when a chunk
// was refused. Non-EPUB documents render nothing here; the shell keeps the re-import fallback (Q-A).
import type { ReaderModeViewProps } from "../ReaderModeAdapter";
import NarrateFoliateView from "./FoliateView";
import { NarrateModeRuntime } from "./ModeRuntime";
import { useNarrateModeBindings } from "./useModeBindings";
import "./mode.css";

function NarrateModeBody({ runtime }: { runtime: NarrateModeRuntime }) {
  const { useFoliate, notice, viewProps } = useNarrateModeBindings(runtime);
  return (
    <div className="rm-narrate-root">
      {useFoliate && <NarrateFoliateView {...viewProps} />}
      {notice && (
        <div className={`rm-narrate-notice rm-narrate-notice--${notice.kind}`} role="status" aria-live="polite">
          {notice.text}
        </div>
      )}
    </div>
  );
}

export function NarrateModeView({ runtime }: ReaderModeViewProps) {
  if (!(runtime instanceof NarrateModeRuntime)) throw new Error(`NarrateModeView cannot render a ${runtime.mode} runtime`);
  return <NarrateModeBody runtime={runtime} />;
}
