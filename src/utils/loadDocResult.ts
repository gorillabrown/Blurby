import type { BlurbyDoc, LoadDocContentResult } from "../types";

export type ResolvedLoadedDoc = {
  activeDoc: BlurbyDoc & { content: string };
  libraryUpdates?: Partial<BlurbyDoc>;
};

export function resolveLoadedDocResult(
  doc: BlurbyDoc,
  result: LoadDocContentResult
): ResolvedLoadedDoc | { userError: string } | null {
  if (result && typeof result === "object") {
    if ("userError" in result) {
      return { userError: result.userError };
    }

    if ("filepath" in result) {
      const libraryUpdates: Partial<BlurbyDoc> = {
        filepath: result.filepath,
        ext: result.ext,
      };

      if (!doc.convertedEpubPath && doc.ext !== result.ext && result.ext === ".epub") {
        libraryUpdates.convertedEpubPath = result.filepath;
      }

      return {
        activeDoc: {
          ...doc,
          ...libraryUpdates,
          content: typeof doc.content === "string" ? doc.content : "",
        },
        libraryUpdates,
      };
    }
  }

  if (typeof result === "string") {
    return { activeDoc: { ...doc, content: result } };
  }

  if (typeof doc.content === "string") {
    return { activeDoc: { ...doc, content: doc.content } };
  }

  return null;
}
