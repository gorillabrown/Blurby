import { describe, expect, it } from "vitest";
import { resolveLoadedDocResult } from "../src/utils/loadDocResult";
import type { BlurbyDoc } from "../src/types";

function makeDoc(overrides: Partial<BlurbyDoc> = {}): BlurbyDoc {
  return {
    id: "doc-1",
    title: "Sample",
    wordCount: 100,
    position: 0,
    created: 1,
    source: "folder",
    ...overrides,
  };
}

describe("resolveLoadedDocResult", () => {
  it("returns inline text content as the active document", () => {
    const resolved = resolveLoadedDocResult(makeDoc(), "hello world");
    expect(resolved && "activeDoc" in resolved ? resolved.activeDoc.content : null).toBe("hello world");
  });

  it("maps EPUB file payloads into a safe active document", () => {
    const resolved = resolveLoadedDocResult(
      makeDoc({ filepath: "C:\\books\\sample.docx", ext: ".docx" }),
      { filepath: "C:\\books\\converted\\sample.epub", ext: ".epub" }
    );

    expect(resolved && "activeDoc" in resolved ? resolved.activeDoc.filepath : null).toBe("C:\\books\\converted\\sample.epub");
    expect(resolved && "activeDoc" in resolved ? resolved.activeDoc.ext : null).toBe(".epub");
    expect(resolved && "activeDoc" in resolved ? resolved.activeDoc.content : null).toBe("");
    expect(resolved && "activeDoc" in resolved ? resolved.activeDoc.convertedEpubPath : null).toBe("C:\\books\\converted\\sample.epub");
  });

  it("passes through user-facing errors", () => {
    const resolved = resolveLoadedDocResult(makeDoc(), { userError: "Nope" });
    expect(resolved).toEqual({ userError: "Nope" });
  });
});
