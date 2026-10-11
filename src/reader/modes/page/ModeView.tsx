// Page mode view (READER-MODE-SEPARATION-2 design §B.0): the mode root and this mode's own FoliateView.
// Non-EPUB documents render nothing here; the shell keeps the re-import fallback (Q-A).
import type { ReaderModeViewProps } from "../ReaderModeAdapter";
import PageFoliateView from "./FoliateView";
import { PageModeRuntime } from "./ModeRuntime";
import { usePageModeBindings } from "./useModeBindings";
import "./mode.css";

function PageModeBody({ runtime }: { runtime: PageModeRuntime }) {
  const { useFoliate, viewProps } = usePageModeBindings(runtime);
  return (
    <div className="rm-page-root">
      {useFoliate && <PageFoliateView {...viewProps} />}
    </div>
  );
}

export function PageModeView({ runtime }: ReaderModeViewProps) {
  if (!(runtime instanceof PageModeRuntime)) throw new Error(`PageModeView cannot render a ${runtime.mode} runtime`);
  return <PageModeBody runtime={runtime} />;
}
