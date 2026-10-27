import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
import { describe, it, expect } from 'vitest';

const require = createRequire(import.meta.url);
const filename = process.env.FOLIATE_TEST_SOURCE || require.resolve('foliate-js/paginator.js');
const source = fs.readFileSync(filename, 'utf8');
if (source.indexOf('// NOTE: everything here') < 0) throw new Error('production View extraction boundary missing');
console.info('R1 production source', filename, crypto.createHash('sha256').update(source).digest('hex'));
console.info('R1 detector SHA256', crypto.createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).digest('hex'));

// Expose the unexported production class without changing any method/helper.
// jsdom supplies DOM/synthetic load-event delivery, not Chromium layout or parser timing.
function fixture() {
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const observations = [], errors = [];
  const observeErrors = window => {
    window.addEventListener('error', event => { errors.push(event.error ?? event.message); event.preventDefault(); });
    window.addEventListener('unhandledrejection', event => { errors.push(event.reason); event.preventDefault(); });
  };
  observeErrors(w);
  w.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observations.push(this); }
    observe(target) { if (!target || target.nodeType !== 1) throw new TypeError('invalid observer target'); this.target = target; }
    unobserve(target) { if (!target || target.nodeType !== 1) throw new TypeError('invalid observer target'); this.target = null; }
    disconnect() { this.target = null; this.disconnected = true; }
  };
  // Geometry-only shims: actual scrolled/columnize/setImageSize/expand execute.
  w.Range.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 600, bottom: 900, width: 600, height: 900 });
  w.eval(source.slice(0, source.indexOf('// NOTE: everything here')) + ';window.ProductionView = View;');
  const view = new w.ProductionView({ container: {}, onExpand() {} });
  w.document.body.append(view.element);
  return { dom, w, view, observations, observeErrors,
    close: () => { try { expect(errors, 'all realm errors/rejections').toEqual([]); } finally { dom.window.close(); } } };
}

const layouts = [
  ['scrolled', { flow: 'scrolled', width: 800, height: 1000, margin: 20, gap: 30, columnWidth: 600 }],
  ['columnized', { width: 800, height: 1000, margin: 20, gap: 30, columnWidth: 600 }],
];
function readiness(doc, state) { Object.defineProperty(doc, 'readyState', { configurable: true, value: state }); }
function readyDocument(f, state = 'complete') {
  const doc = f.view.document;
  if (!doc.documentElement) doc.append(doc.createElement('html'));
  if (!doc.body) doc.documentElement.append(doc.createElement('body'));
  doc.body.textContent = 'Actual production layout positive words';
  Object.defineProperty(doc, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
  readiness(doc, state);
  f.observeErrors(doc.defaultView);
  return doc;
}

describe('R1 actual View readiness and simulated load-event continuation', () => {
  for (const [name, layout] of layouts) {
    it(`R1 ${name}: loading body-null defers; simulated same-document load event forwards actual styles/text`, async () => {
      const f = fixture();
      try {
        const pending = f.view.load('https://fixture.invalid/r1', undefined, () => layout);
        const frame = f.view.element.querySelector('iframe');
        const doc = f.view.document;
        readiness(doc, 'loading');
        doc.body?.remove();
        expect(() => f.view.render(layout)).not.toThrow();
        readyDocument(f);
        frame.dispatchEvent(new f.w.Event('load'));
        await pending;
        expect(f.view.document).toBe(doc);
        expect(frame.contentDocument).toBe(doc);
        expect(doc.body.textContent.split(' ')).toHaveLength(5);
        expect(doc.body.style.margin).toBe(name === 'scrolled' ? 'auto' : '0px');
        expect(doc.documentElement.style.columnWidth).toBe(name === 'scrolled' ? 'auto' : '600px');
        expect(f.observations[0].target).toBe(doc.body);
      } finally { f.close(); }
    });
    for (const state of ['complete', 'interactive', 'loading']) {
      it(`R1 ${name}: ${state} body-present forwards`, () => {
        const f = fixture();
        try {
          const doc = readyDocument(f, state);
          f.view.render(layout);
          expect(doc.body.style.margin).toBe(name === 'scrolled' ? 'auto' : '0px');
        } finally { f.close(); }
      });
    }
    for (const state of ['complete', 'interactive']) {
      it(`R1 opposite ${name}: malformed ${state} body-null remains an error`, () => {
        const f = fixture();
        try {
          readiness(f.view.document, state);
          f.view.document.body.remove();
          expect(() => f.view.render(layout)).toThrow();
        } finally { f.close(); }
      });
    }
  }
  it('R1 absent layout and absent document retain no-op behavior', () => {
    const f = fixture();
    try {
      expect(() => f.view.render()).not.toThrow();
      Object.defineProperty(f.view, 'document', { value: null });
      expect(() => f.view.render(layouts[0][1])).not.toThrow();
    } finally { f.close(); }
  });
});
