import type { ReaderModeId } from "../modes/ReaderModeAdapter";

export interface SurfaceHighlightCommand {
  kind: "highlight";
  wordIndex: number;
  mode: ReaderModeId;
  allowMotion: boolean;
}

export interface SurfaceScrollToCommand {
  kind: "scroll-to";
  wordIndex: number;
  mode: ReaderModeId;
}

export interface SurfaceClearCommand {
  kind: "clear";
  mode?: ReaderModeId;
}

export type SurfaceCommand =
  | SurfaceHighlightCommand
  | SurfaceScrollToCommand
  | SurfaceClearCommand;
