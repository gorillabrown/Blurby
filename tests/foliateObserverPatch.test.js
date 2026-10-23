import fs from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// FOLIATE-OBSERVER-LEAK-1 (BUG-187): foliate-js 1.0.1's View.destroy() unobserves only `if (this.document)`, and our
// teardown detaches the frame first, so a View's ResizeObserver stays on a dead section body and error.log floods.
// patches/foliate-js+1.0.1.patch makes View.destroy() and Paginator.destroy() disconnect their observers. View is not
// exported and jsdom has no ResizeObserver, so this reads the installed file as text (the file Vite bundles).

const require = createRequire(import.meta.url);
const source = fs.readFileSync(require.resolve("foliate-js/paginator.js"), "utf-8");

/** The body of the first `destroy() { … }` after `classHeader`, by brace depth. */
function destroyBody(classHeader) {
  const classAt = source.indexOf(classHeader);
  expect(classAt).toBeGreaterThanOrEqual(0);
  const methodAt = source.indexOf("destroy() {", classAt);
  expect(methodAt).toBeGreaterThan(classAt);
  let depth = 0;
  for (let i = source.indexOf("{", methodAt); i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(methodAt, i + 1);
  }
  throw new Error(`unterminated destroy() after ${classHeader}`);
}

describe("foliate-js observers are disconnected on destroy (FOLIATE-OBSERVER-LEAK-1)", () => {
  it("View.destroy() disconnects its ResizeObserver", () => {
    expect(destroyBody("class View {")).toContain("this.#observer.disconnect()");
  });

  it("Paginator.destroy() disconnects its ResizeObserver", () => {
    expect(destroyBody("class Paginator extends HTMLElement {")).toContain("this.#observer.disconnect()");
  });
});
