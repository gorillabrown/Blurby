// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { getOverlayPosition } from "../src/utils/getOverlayPosition";

describe("getOverlayPosition", () => {
  it("returns null for a disconnected range", () => {
    // Create a detached DOM node (not connected to any document)
    const detachedNode = document.createTextNode("hello");
    const range = document.createRange();
    range.setStart(detachedNode, 0);
    range.setEnd(detachedNode, 5);

    const container = document.createElement("div");
    const result = getOverlayPosition(range, container);
    expect(result).toBeNull();
  });

  it("returns OverlayRect when range and getBoundingClientRect work", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const textNode = document.createTextNode("test text");
    container.appendChild(textNode);

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 4);

    // jsdom does not implement getBoundingClientRect on Range, so mock it
    range.getBoundingClientRect = () => ({
      top: 10, left: 20, width: 50, height: 16,
      bottom: 26, right: 70, x: 20, y: 10,
      toJSON: () => {},
    });

    const result = getOverlayPosition(range, container);
    expect(result).not.toBeNull();
    expect(result!.top).toBe(10);
    expect(result!.left).toBe(20);
    expect(result!.width).toBe(50);
    expect(result!.height).toBe(16);

    document.body.removeChild(container);
  });

  it("returns null when getBoundingClientRect throws", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const textNode = document.createTextNode("test");
    container.appendChild(textNode);

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 4);
    // Override getBoundingClientRect to throw
    range.getBoundingClientRect = () => { throw new Error("stale"); };

    const result = getOverlayPosition(range, container);
    expect(result).toBeNull();

    document.body.removeChild(container);
  });
});
