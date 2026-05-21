import { FOLIATE_TWO_COLUMN_BREAKPOINT_PX } from "../constants";

/**
 * Foliate's scrolled flow surface is shared by Flow and Narrate. That surface
 * must always stay single-column so the active chunk/word can be followed as
 * one infinite reading column. Paginated Page/Focus may still use two columns.
 */
export function getFoliateMaxColumnCount(flowSurfaceMode: boolean, containerWidth: number): "1" | "2" {
  if (flowSurfaceMode) return "1";
  return containerWidth >= FOLIATE_TWO_COLUMN_BREAKPOINT_PX ? "2" : "1";
}
