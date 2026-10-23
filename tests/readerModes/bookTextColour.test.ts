// @vitest-environment jsdom
// BOOK-TEXT-COLOUR-1 (BUG-208): book text takes the theme's text colour. A book's own colour rule on a descendant
// (Project Gutenberg's `#pg-header div { color: initial }`, which computes to black) beat the injected
// `html, body { color: fg !important }`, so the header and licence pages rendered black on the dark Blurby background.
// The general rule `body *:not(a) { color: inherit !important; }` (owner decision 2026-10-23) makes every descendant
// but a link inherit the theme colour; links keep the accent. jsdom resolves neither `inherit` nor `initial` to a
// colour, so this file pins the injected rules; the contrast itself is measured in the packaged app (the memo).
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { injectStyles as pageInject } from "../../src/reader/modes/page/helpers/foliateStyles";
import { injectStyles as focusInject } from "../../src/reader/modes/focus/helpers/foliateStyles";
import { injectStyles as flowInject } from "../../src/reader/modes/flow/helpers/foliateStyles";
import { injectStyles as narrateInject } from "../../src/reader/modes/narrate/helpers/foliateStyles";

const INHERIT_RULE = /body \*:not\(a\) \{ color: inherit !important; \}/;
const MODES = [["page", pageInject], ["focus", focusInject], ["flow", flowInject], ["narrate", narrateInject]] as const;

function sectionDoc(): Document {
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.head.innerHTML = "<style>#pg-header div, #pg-footer div { color: initial; }</style>";
  doc.body.innerHTML = '<div id="pg-header"><div>The Project Gutenberg eBook</div></div><p><a href="#"><span>a link</span></a></p>';
  return doc;
}

afterEach(() => { document.body.innerHTML = ""; });

describe("BOOK-TEXT-COLOUR-1: book text takes the theme's text colour", () => {
  for (const [mode, inject] of MODES) {
    it(`${mode}: the injected theme makes every descendant but a link inherit the theme colour, after the html, body rule`, () => {
      const doc = sectionDoc();
      inject(doc, DEFAULT_SETTINGS, 100);
      const css = doc.getElementById("blurby-theme")?.textContent ?? "";
      expect(css, `${mode} injects no inherit rule for book descendants`).toMatch(INHERIT_RULE);
      const htmlBody = css.indexOf("html, body {");
      const inherit = css.search(INHERIT_RULE);
      expect(htmlBody).toBeGreaterThanOrEqual(0);
      expect(inherit, "the inherit rule comes after the html, body rule that sets the theme colour").toBeGreaterThan(htmlBody);
      // Links keep the accent: the inherit rule excludes <a>, and a <span> inside a link inherits the link's accent.
      expect(css).toMatch(/\ba \{ color: [^;]+ !important; \}/);
    });
  }
});
