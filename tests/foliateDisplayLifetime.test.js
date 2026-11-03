import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
import { describe, it, expect } from 'vitest';

const require = createRequire(import.meta.url);
const filename = process.env.FOLIATE_TEST_SOURCE || require.resolve('foliate-js/paginator.js');
const source = fs.readFileSync(filename, 'utf8');
console.info('L1-L7 production source', filename, crypto.createHash('sha256').update(source).digest('hex'));
console.info('L1-L7 detector SHA256', crypto.createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).digest('hex'));
// Brain-approved SOLE private-path facade. One call, unchanged arguments, no
// algorithm/branch/ownership copy. Identical transform on base and candidate.
// This does not ship and does not claim a naturally animated display route.
const facade = '    __testScroll(...args) { return this.#scrollTo(...args) }\n';
if (!source.includes('    getContents() {')) throw new Error('production Paginator facade boundary missing');
const evaluatedSource = source.replace('export class Paginator', 'class Paginator')
  .replace('    getContents() {', facade + '    getContents() {')
  + ';window.Production = {View, Paginator};';
console.info('test-only facade/exposure transform', JSON.stringify(facade), 'export class Paginator -> class Paginator; append window.Production = {View, Paginator}');
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

// Full production module with ESM export removal, the exact approved one-call
// private scroll facade insertion above, and class exposure for realm evaluation.
// DOM, computed viewport values, geometry, observer delivery, RAF and font delivery
// are controlled infrastructure. No production navigation/layout algorithm is copied
// or replaced. Native Chromium timing remains a separate package qualification.
function fixture() {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://fixture.invalid/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const errors = [], raf = [], observers = [], views = [], loads = [], frameRealms = [], fontGates = [], frameListeners = new Map();
  function observeErrors(window) {
    window.addEventListener('error', e => { errors.push(e.error ?? e.message); e.preventDefault(); });
    window.addEventListener('unhandledrejection', e => { errors.push(e.reason); e.preventDefault(); });
  }
  observeErrors(w);
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.requestAnimationFrame = callback => { raf.push(callback); return raf.length; };
  w.ResizeObserver = class {
    constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
    observe(target) { if (!target || target.nodeType !== 1) throw new TypeError('invalid observer target'); this.targets.add(target); }
    unobserve(target) { if (!target || target.nodeType !== 1) throw new TypeError('invalid observer target'); this.targets.delete(target); }
    disconnect() { this.targets.clear(); this.disconnects = (this.disconnects || 0) + 1; }
  };
  const rect = () => ({ left: 0, top: 0, right: 800, bottom: 1000, width: 800, height: 1000 });
  w.HTMLElement.prototype.getBoundingClientRect = rect;
  w.Range.prototype.getBoundingClientRect = rect;
  w.Range.prototype.getClientRects = () => [rect()];
  // Brain-approved constructor accommodation: jsdom does not create browsing
  // contexts for shadow-tree iframes. Each REAL iframe retains its EventTarget
  // and receives a dedicated REAL jsdom Window/Document. Never fake connectedness.
  const createElement = w.document.createElement.bind(w.document);
  w.document.createElement = function(name, ...args) {
    const element = createElement(name, ...args);
    if (name.toLowerCase() === 'iframe') {
      const frameRealm = new JSDOM('<!doctype html><body></body>', { url: `https://fixture.invalid/frame-${frameRealms.length}`, runScripts: 'outside-only', pretendToBeVisual: true });
      frameRealms.push(frameRealm); observeErrors(frameRealm.window);
      Object.defineProperty(element, 'contentDocument', { configurable: true, get: () => frameRealm.window.document });
      Object.defineProperty(element, 'contentWindow', { configurable: true, get: () => frameRealm.window });
      const listeners = { adds: 0, removes: 0 }, add = element.addEventListener.bind(element), remove = element.removeEventListener.bind(element);
      frameListeners.set(element, listeners);
      element.addEventListener = (name, ...values) => { if (name === 'load') listeners.adds++; return add(name, ...values); };
      element.removeEventListener = (name, ...values) => { if (name === 'load') listeners.removes++; return remove(name, ...values); };
    }
    return element;
  };
  const computed = w.getComputedStyle.bind(w);
  w.getComputedStyle = element => {
    const style = computed(element);
    if (element.id !== 'top') return style;
    return new Proxy(style, { get(target, key) {
      if (key === 'getPropertyValue') return name => target.getPropertyValue(name) || ({ '--_max-inline-size': '600', '--_max-column-count-spread': '2', '--_margin': '20', '--_gap': '5' }[name] ?? '');
      const value = target[key]; return typeof value === 'function' ? value.bind(target) : value;
    } });
  };
  const attach = w.HTMLElement.prototype.attachShadow;
  let root;
  w.HTMLElement.prototype.attachShadow = function(options) { const result = attach.call(this, options); root = result; return result; };
  w.eval(evaluatedSource);
  const originalLoad = w.Production.View.prototype.load;
  w.Production.View.prototype.load = function(...args) {
    views.push(this);
    const expand = this.onExpand;
    this.onExpand = (...values) => {
      const result = expand(...values);
      result?.catch?.(error => errors.push(error));
      return result;
    };
    const entry = { view: this, settled: false, settlements: 0, result: undefined };
    loads.push(entry);
    const promise = originalLoad.apply(this, args);
    promise.then(result => { entry.settled = true; entry.settlements++; entry.result = result; });
    return promise;
  };
  const p = new w.Production.Paginator();
  const navigate = p.goTo.bind(p);
  p.goTo = (...args) => { const pending = navigate(...args); pending.catch(error => errors.push(error)); return pending; };
  w.document.body.append(p);
  p.setAttribute('flow', 'scrolled');
  const sections = [0, 1, 2].map(index => ({ load: () => `https://fixture.invalid/section-${index}`, unload() {} }));
  p.open({ sections, dir: 'ltr' });
  const overlays = [], relocations = [];
  p.addEventListener('create-overlayer', e => overlays.push(e.detail));
  p.addEventListener('relocate', e => relocations.push(e.detail));
  function deliverLoad(view = views.at(-1), beforeEvent) {
    const frame = view.element.querySelector('iframe'), doc = view.document;
    if (!doc.body) doc.documentElement.append(doc.createElement('body'));
    doc.body.textContent = 'Retained native document positive control words';
    const fonts = deferred();
    fontGates.push(fonts);
    Object.defineProperty(doc, 'fonts', { configurable: true, value: { ready: fonts.promise } });
    Object.defineProperty(doc, 'readyState', { configurable: true, value: 'complete' });
    doc.defaultView.Range.prototype.getBoundingClientRect = rect;
    doc.defaultView.Range.prototype.getClientRects = () => [rect()];
    beforeEvent?.(doc);
    frame.dispatchEvent(new w.Event('load'));
    if (errors.length) throw errors[0];
    return { doc, frame, fonts };
  }
  return { dom, w, p, sections, views, loads, overlays, relocations, observers, raf, deliverLoad, frameListeners,
    root: () => root, flushRaf: (now = w.performance.now() + 1000) => { const batch = raf.splice(0); for (const f of batch) f(now); },
    close: async () => { try {
      for (const fonts of fontGates) fonts.resolve();
      for (const callback of raf.splice(0)) { try { callback(w.performance.now() + 1000); } catch (error) { errors.push(error); } }
      await tick();
      expect(errors.length, 'realm errors after task/font/RAF settlement: ' + errors.map(error => String(error?.message ?? error)).join(' | ')).toBe(0); }
      finally { w.document.createElement = createElement; w.HTMLElement.prototype.attachShadow = attach;
        for (const realm of frameRealms) realm.window.close(); dom.window.close(); } }, errors };
}
async function active(f, index = 0) {
  const pending = f.p.goTo({ index }); await tick();
  const loaded = f.deliverLoad(); await pending;
  expect(f.p.getContents()[0]?.doc === loaded.doc).toBe(true);
  expect(f.overlays.length).toBeGreaterThan(0);
  return loaded;
}
function publicBounds(p) {
  const position = p.containerPosition;
  p.scrollBy(-1e6, 0); const low = p.containerPosition;
  p.scrollBy(1e6, 0); const high = p.containerPosition;
  p.containerPosition = position;
  return [low, high];
}

describe('L1-L7 actual Paginator public navigation and simulated load-event continuations', () => {
  it('active opposite: real load, styles, overlay attach, anchor and retained text work', async () => {
    const f = fixture(); try {
      const loaded = await active(f);
      const overlay = { element: f.w.document.createElement('div'), redraw() {} };
      f.overlays[0].attach(overlay);
      expect(f.p.getContents()[0].overlayer === overlay).toBe(true);
      f.p.setStyles('body { color: red; }');
      expect(loaded.doc.head.lastElementChild.textContent).toContain('red');
      await f.p.goTo({ index: 0, anchor: 0.25 });
      expect(f.p.getContents()[0].doc.body.textContent).toContain('positive control');
      expect(f.relocations.at(-1).reason).toBe('navigation');
    } finally { await f.close(); }
  });
  it('L1 delayed section resolution after destroy cannot create/publish a View', async () => {
    const f = fixture(); try {
      await active(f); const result = deferred(); f.sections[1].load = () => result.promise;
      const old = f.p.goTo({ index: 1 }); await tick(); f.p.destroy();
      const count = f.views.length; result.resolve('https://fixture.invalid/late'); await tick();
      expect(f.views.length).toBe(count); expect(f.p.getContents().length).toBe(0); await old;
    } finally { await f.close(); }
  });
  it('L1 delayed first section is inert after newer active request', async () => {
    const f = fixture(); try {
      const result = deferred(); f.sections[0].load = () => result.promise;
      const old = f.p.goTo({ index: 0 }); await tick(); await active(f, 1);
      const current = f.p.getContents()[0].doc, count = f.views.length;
      result.resolve('https://fixture.invalid/late'); await tick();
      expect(f.views.length).toBe(count); expect(f.p.getContents()[0].doc === current).toBe(true); await old;
    } finally { await f.close(); }
  });
  it('L2 close from real onLoad event prevents later native layout and observation', async () => {
    const f = fixture(); try {
      f.p.addEventListener('load', () => f.p.destroy(), { once: true });
      const pending = f.p.goTo({ index: 0 }); await tick();
      f.deliverLoad(); await tick();
      expect(f.p.getContents().length).toBe(0);
      expect(f.overlays.length).toBe(0);
      expect(f.observers.every(o => o.targets.size === 0)).toBe(true); await pending;
    } finally { await f.close(); }
  });
  it('L3 fulfilled native load stays fulfilled when close precedes display microtask', async () => {
    const f = fixture(); try {
      const pending = f.p.goTo({ index: 0 }); await tick(); f.deliverLoad(); f.p.destroy(); await pending;
      expect(f.loads[0].settled).toBe(true); expect(f.loads[0].result).not.toEqual({ canceled: true });
      expect(f.p.getContents().length).toBe(0); expect(f.overlays.length).toBe(0);
    } finally { await f.close(); }
  });
  it('L3 pending load cancellation settles once; late event cannot resurrect it', async () => {
    const f = fixture(); try {
      const pending = f.p.goTo({ index: 0 }); await tick(); const view = f.views[0];
      f.p.destroy(); await tick();
      expect(f.loads[0].settled).toBe(true); expect(f.loads[0].result).toEqual({ canceled: true });
      expect(() => view.element.querySelector('iframe').dispatchEvent(new f.w.Event('load'))).not.toThrow();
      expect(f.errors.length).toBe(0); expect(f.overlays.length).toBe(0); await pending; await tick();
      expect(f.loads[0].settlements).toBe(1);
      expect(f.frameListeners.get(view.element.querySelector('iframe'))).toEqual({ adds: 1, removes: 1 });
      f.p.destroy(); expect(f.observers.every(o => o.disconnects === 1)).toBe(true);
    } finally { await f.close(); }
  });
  it('L4 actual same-Paginator replacement retains successor through old continuation', async () => {
    const f = fixture(); try {
      const old = f.p.goTo({ index: 0 }); await tick(); const retired = f.views[0];
      const next = f.p.goTo({ index: 1 }); await tick();
      // Deliver old load only AFTER the same Paginator has replaced its View.
      // Earlier legitimate publication is not forbidden by this assertion.
      f.deliverLoad(retired); await tick(); const current = f.deliverLoad(f.views[1]); await next; await old;
      expect(f.p.getContents()[0].doc === current.doc).toBe(true); expect(f.p.getContents()[0].index).toBe(1);
      expect(f.views[1].element.isConnected).toBe(true); expect(f.views[0].element.isConnected).toBe(false);
      expect(f.overlays.every(o => o.doc === current.doc)).toBe(true);
    } finally { await f.close(); }
  });
  it('L5 retained View expand survives same-View anchor with fresh scroll authority', async () => {
    const f = fixture(); try {
      await active(f); await f.p.goTo({ index: 0, anchor: 0.5 });
      const count = f.relocations.length; f.views[0].expand(); await tick();
      expect(f.relocations.length).toBeGreaterThan(count); expect(f.p.getContents().length).toBe(1);
    } finally { await f.close(); }
  });
  it('L5 public styles RAF/fonts stay captured to intended View across replacement', async () => {
    const f = fixture(); try {
      const first = await active(f); f.p.setStyles('body { color: blue; }');
      const next = f.p.goTo({ index: 1 }); await tick(); const second = f.deliverLoad(); await next;
      let successorExpands = 0; const expand = f.views[1].expand.bind(f.views[1]);
      f.views[1].expand = () => { successorExpands++; return expand(); };
      first.fonts.resolve(); await tick(); expect(successorExpands).toBe(0);
      f.flushRaf(); expect(f.p.getContents()[0].doc === second.doc).toBe(true);
      second.fonts.resolve(); await tick(); expect(successorExpands).toBeGreaterThan(0);
    } finally { await f.close(); }
  });
  it('L6 pending src-less anchor adopts same native load and publishes exactly once', async () => {
    const f = fixture(); try {
      const first = f.p.goTo({ index: 0 }); await tick(); const view = f.views[0];
      const second = f.p.goTo({ index: 0, anchor: 0.5 }); await tick();
      expect(f.relocations.length).toBe(0); expect(f.views.length).toBe(1);
      const ready = f.deliverLoad(view); await first; await second;
      expect(f.p.getContents()[0].doc === ready.doc).toBe(true); expect(f.overlays.length).toBe(1);
      expect(f.relocations.at(-1).fraction).toBe(0.5);
    } finally { await f.close(); }
  });
  it('L6 close during adoption settles both operations without publication', async () => {
    const f = fixture(); try {
      const first = f.p.goTo({ index: 0 }); await tick();
      const second = f.p.goTo({ index: 0, anchor: 0.5 }); await tick(); f.p.destroy(); await tick();
      expect(f.loads[0].settled).toBe(true); expect(f.p.getContents().length).toBe(0);
      expect(f.overlays.length).toBe(0); await first; await second;
    } finally { await f.close(); }
  });
  it('L6 overlay same-View reentry invalidates deferred old attach but allows new attach', async () => {
    const f = fixture(); try {
      let reentry;
      f.p.addEventListener('create-overlayer', () => { if (!reentry) reentry = f.p.goTo({ index: 0, anchor: 0.5 }); });
      const first = f.p.goTo({ index: 0 }); await tick(); f.deliverLoad(); await first; await reentry;
      const oldOverlay = { element: f.w.document.createElement('div'), redraw() {} };
      f.overlays[0].attach(oldOverlay);
      expect(f.p.getContents()[0].overlayer === oldOverlay).toBe(false);
      const current = { element: f.w.document.createElement('div'), redraw() {} };
      f.overlays.at(-1).attach(current); expect(f.p.getContents()[0].overlayer === current).toBe(true);
    } finally { await f.close(); }
  });
  it('L7 function anchor close blocks subsequent scroll and post-await focus', async () => {
    const f = fixture(); try {
      const ready = await active(f); Object.defineProperty(ready.doc, 'hasFocus', { value: () => true });
      let focused = 0; f.p.focusView = () => { focused++; };
      const count = f.relocations.length;
      await f.p.goTo({ index: 0, anchor: () => { f.p.destroy(); return 0.5; } });
      expect(focused).toBe(0); expect(f.relocations.length).toBe(count); expect(f.p.getContents().length).toBe(0);
    } finally { await f.close(); }
  });
  it('L7 destroy is idempotent with body-null loading View and both observers disconnect', async () => {
    const f = fixture(); try {
      f.p.goTo({ index: 0 }); await tick(); f.views[0].document.body?.remove();
      expect(() => f.p.destroy()).not.toThrow(); expect(() => f.p.destroy()).not.toThrow();
      expect(f.observers.every(o => o.targets.size === 0 && o.disconnects === 1)).toBe(true);
    } finally { await f.close(); }
  });
  for (const boundary of ['afterLoad', 'beforeRender', 'render']) {
    it(`L2 ${boundary} real callback reentry closes before later old effects`, async () => {
      const f = fixture(); try {
        const pending = f.p.goTo({ index: 0 }); await tick();
        const view = f.views[0]; let closed = false;
        if (boundary === 'afterLoad') {
          const prepend = view.document.head.prepend.bind(view.document.head);
          view.document.head.prepend = (...args) => { prepend(...args); closed = true; f.p.destroy(); };
        } else if (boundary === 'beforeRender') {
          const set = f.p.setAttribute.bind(f.p);
          f.p.setAttribute = (...args) => { set(...args); if (args[0] === 'dir' && !closed) { closed = true; f.p.destroy(); } };
        } else {
          const render = view.render.bind(view);
          view.render = (...args) => { const result = render(...args); closed = true; f.p.destroy(); return result; };
        }
        f.deliverLoad(view); await tick();
        expect(closed).toBe(true); expect(f.p.getContents().length).toBe(0);
        expect(f.overlays.length).toBe(0); expect(f.observers.every(o => o.targets.size === 0)).toBe(true);
        await pending;
      } finally { await f.close(); }
    });
  }
  it('R1/L2 pending resize and flow use current beforeRender layout at load delivery', async () => {
    const f = fixture(); try {
      const pending = f.p.goTo({ index: 0 }); await tick(); const view = f.views[0], doc = view.document;
      Object.defineProperty(doc, 'readyState', { configurable: true, value: 'loading' }); doc.body.remove();
      expect(() => f.p.setAttribute('flow', 'paginated')).not.toThrow();
      f.deliverLoad(view); await pending;
      expect(doc.documentElement.style.columnWidth).toBe('357px');
      expect(doc.body.style.margin).toBe('0px');
    } finally { await f.close(); }
  });
  it('L5 closed View late expand and public style RAF/font callbacks stay inert', async () => {
    const f = fixture(); try {
      const ready = await active(f); const view = f.views[0]; f.p.setStyles('body { color: green; }');
      f.p.destroy(); const count = f.relocations.length;
      expect(() => view.expand()).not.toThrow(); f.flushRaf(); ready.fonts.resolve(); await tick();
      expect(f.relocations.length).toBe(count); expect(f.p.getContents().length).toBe(0);
      expect(f.observers.every(o => o.targets.size === 0)).toBe(true);
    } finally { await f.close(); }
  });
  it('L6 replacement while src-less adoption waits settles retired operations only', async () => {
    const f = fixture(); try {
      const first = f.p.goTo({ index: 0 }); await tick();
      const second = f.p.goTo({ index: 0, anchor: 0.5 }); await tick();
      const third = f.p.goTo({ index: 1 }); await tick(); const current = f.deliverLoad(f.views.at(-1));
      expect(f.loads[0].settled).toBe(true); await third; await first; await second;
      expect(f.p.getContents()[0].doc === current.doc).toBe(true); expect(f.p.getContents()[0].index).toBe(1);
    } finally { await f.close(); }
  });
  it('L7 synchronous overlay close and delayed attach cannot restore a retired View', async () => {
    const f = fixture(); try {
      f.p.addEventListener('create-overlayer', () => f.p.destroy(), { once: true });
      const pending = f.p.goTo({ index: 0 }); await tick(); f.deliverLoad(); await pending;
      const layer = { element: f.w.document.createElement('div'), redraw() {} };
      f.overlays[0].attach(layer); expect(layer.element.isConnected).toBe(false);
      expect(f.p.getContents().length).toBe(0);
    } finally { await f.close(); }
  });
  it('L7 close from relocation blocks after-await focus', async () => {
    const f = fixture(); try {
      const ready = await active(f); Object.defineProperty(ready.doc, 'hasFocus', { value: () => true });
      let focused = 0; f.p.focusView = () => { focused++; };
      f.p.addEventListener('relocate', () => f.p.destroy(), { once: true });
      await f.p.goTo({ index: 0, anchor: 0.5 }); expect(focused).toBe(0);
    } finally { await f.close(); }
  });
  for (const boundary of ['afterLoad', 'onLoad', 'beforeRender', 'render', 'anchor', 'overlay']) {
    it(`L2/L4/L7 ${boundary} public replacement reentry preserves successor and retires old work`, async () => {
      const f = fixture(); try {
        let replacement;
        const replace = () => { replacement ??= f.p.goTo({ index: 1 }); };
        if (boundary === 'onLoad') f.p.addEventListener('load', replace, { once: true });
        if (boundary === 'overlay') f.p.addEventListener('create-overlayer', replace, { once: true });
        const first = f.p.goTo({ index: 0, anchor: boundary === 'anchor' ? () => { replace(); return 0.25; } : 0 });
        await tick(); const old = f.views[0];
        if (boundary === 'afterLoad') {
          const prepend = old.document.head.prepend.bind(old.document.head);
          old.document.head.prepend = (...args) => { prepend(...args); replace(); };
        }
        if (boundary === 'beforeRender') {
          const set = f.p.setAttribute.bind(f.p);
          f.p.setAttribute = (...args) => { set(...args); if (args[0] === 'dir') replace(); };
        }
        if (boundary === 'render') {
          const render = old.render.bind(old); old.render = (...args) => { const result = render(...args); replace(); return result; };
        }
        f.deliverLoad(old); await tick(); expect(f.views.length).toBe(2);
        const current = f.deliverLoad(f.views[1]); await replacement; await first;
        const before = { doc: f.p.getContents()[0].doc, index: f.p.getContents()[0].index,
          background: f.root().getElementById('background').innerHTML, header: f.root().getElementById('header').innerHTML,
          relocations: f.relocations.length };
        for (const overlay of f.overlays.filter(value => value.doc === old.document))
          overlay.attach({ element: f.w.document.createElement('div'), redraw() {} });
        old.expand(); await tick();
        expect(f.p.getContents()[0].doc === current.doc).toBe(true); expect(before.doc === current.doc).toBe(true);
        expect(f.p.getContents()[0].index).toBe(1); expect(before.index).toBe(1);
        expect(f.root().getElementById('background').innerHTML).toBe(before.background);
        expect(f.root().getElementById('header').innerHTML).toBe(before.header);
        expect(f.relocations.length).toBe(before.relocations);
        expect(f.observers[1].targets.size).toBe(0); expect(f.observers[1].disconnects).toBe(1);
        expect(f.views[1].element.isConnected).toBe(true);
      } finally { await f.close(); }
    });
  }
  it('L5 style RAF actual background writes stay bound to captured live View', async () => {
    const f = fixture(); try {
      f.p.setAttribute('flow', 'paginated');
      const first = await active(f); f.flushRaf();
      f.views[0].docBackground = 'rgb(255, 0, 0)'; f.p.setStyles('body { color: red; }');
      const next = f.p.goTo({ index: 1 }); await tick(); const current = f.deliverLoad(f.views[1]); await next;
      f.views[1].docBackground = 'rgb(0, 0, 255)';
      const background = f.root().getElementById('background');
      background.innerHTML = '<span>successor untouched</span>';
      const oldCallback = f.raf.shift(); oldCallback(1000);
      expect(background.textContent).toBe('successor untouched');
      f.p.setStyles('body { color: blue; }'); f.flushRaf();
      expect(background.firstElementChild.style.background).toBe('rgb(0, 0, 255)');
      let redraws = 0; const layer = { element: f.w.document.createElement('div'), redraw() { redraws++; } };
      f.overlays.at(-1).attach(layer); f.views[1].expand(); expect(redraws).toBeGreaterThan(0);
      const count = redraws; first.fonts.resolve(); await tick(); expect(redraws).toBe(count);
      current.fonts.resolve(); await tick(); expect(redraws).toBeGreaterThan(count);
    } finally { await f.close(); }
  });
  it('L5 active same-View anchor preserves pending style RAF and font expansion', async () => {
    const f = fixture(); try {
      f.p.setAttribute('flow', 'paginated'); const ready = await active(f); f.flushRaf();
      f.views[0].docBackground = 'rgb(0, 128, 0)'; f.p.setStyles(['/* before */', 'body { color: green; }']);
      await f.p.goTo({ index: 0, anchor: 0.5 }); f.flushRaf();
      expect(f.root().getElementById('background').firstElementChild.style.background).toBe('rgb(0, 128, 0)');
      expect(ready.doc.head.firstElementChild.textContent).toBe('/* before */');
      expect(ready.doc.head.lastElementChild.textContent).toContain('green');
      const count = f.relocations.length; ready.fonts.resolve(); await tick();
      expect(f.relocations.length).toBeGreaterThan(count); expect(f.views.length).toBe(1);
    } finally { await f.close(); }
  });
  it('L2 display-owned unload reentry closes before old style/event publication', async () => {
    const f = fixture(); try {
      await active(f); let events = 0; f.p.addEventListener('load', () => events++);
      f.sections[0].unload = () => f.p.destroy();
      const second = f.p.goTo({ index: 1 }); await tick(); f.deliverLoad(f.views[1]); await second;
      expect(events).toBe(0); expect(f.p.getContents().length).toBe(0);
      expect(f.overlays.length).toBe(1); expect(f.observers.every(o => o.targets.size === 0)).toBe(true);
    } finally { await f.close(); }
  });
  it('L3 successful load listener is removed and fulfillment cannot be canceled later', async () => {
    const f = fixture(); try {
      await active(f); const view = f.views[0], frame = view.element.querySelector('iframe');
      expect(f.frameListeners.get(frame)).toEqual({ adds: 1, removes: 1 });
      expect(f.loads[0].settlements).toBe(1); const outcome = f.loads[0].result;
      f.p.destroy(); f.p.destroy(); frame.dispatchEvent(new f.w.Event('load')); await tick();
      expect(f.loads[0].settlements).toBe(1); expect(f.loads[0].result).toBe(outcome);
      expect(f.observers.every(o => o.disconnects === 1)).toBe(true);
    } finally { await f.close(); }
  });
  it('L7 public anchor reentry invalidates display function-anchor and focus without retiring View', async () => {
    const f = fixture(); try {
      const ready = await active(f); Object.defineProperty(ready.doc, 'hasFocus', { value: () => true });
      let focused = 0; f.p.focusView = () => { focused++; };
      await f.p.goTo({ index: 0, anchor: () => { f.p.scrollToAnchor(0.75); return 0.25; } });
      expect(f.p.containerPosition).toBe(750); expect(f.relocations.at(-1).fraction).toBe(0.75);
      expect(focused).toBe(0); expect(f.p.getContents()[0].doc === ready.doc).toBe(true); expect(f.views.length).toBe(1);
    } finally { await f.close(); }
  });
  it('L7 public anchor during actual display relocation invalidates old post-await focus', async () => {
    const f = fixture(); try {
      const ready = await active(f); Object.defineProperty(ready.doc, 'hasFocus', { value: () => true });
      let focused = 0; f.p.focusView = () => { focused++; };
      f.p.addEventListener('relocate', () => f.p.scrollToAnchor(0.75), { once: true });
      await f.p.goTo({ index: 0, anchor: 0.25 });
      expect(f.p.containerPosition).toBe(750); expect(focused).toBe(0);
    } finally { await f.close(); }
  });
  it('L5/L7 onExpand captures current anchor intent; newer public anchor cancels old writes', async () => {
    const f = fixture(); try {
      await active(f); await f.p.goTo({ index: 0, anchor: 0.5 }); f.p.containerPosition = 100;
      const position = Object.getOwnPropertyDescriptor(f.w.Production.Paginator.prototype, 'containerPosition');
      let reentered = false;
      Object.defineProperty(f.p, 'containerPosition', { configurable: true,
        get() { return position.get.call(this); },
        set(value) { position.set.call(this, value); if (!reentered) { reentered = true; this.scrollToAnchor(0.8); } },
      });
      const count = f.relocations.length; f.views[0].expand(); await tick();
      expect(f.p.containerPosition).toBe(800); expect(f.relocations.length).toBe(count + 1);
      expect(f.relocations.at(-1).fraction).toBe(0.8);
      f.views[0].expand(); await tick(); expect(f.relocations.length).toBe(count + 2);
    } finally { await f.close(); }
  });
  it('L7 defensive private facade: actual animate active completion writes position/bounds/relocate', async () => {
    const f = fixture(); try {
      await active(f); f.flushRaf(); f.p.setAttribute('animated', '');
      const oldBounds = publicBounds(f.p);
      const count = f.relocations.length;
      const pending = f.p.__testScroll(500, 'navigation', true, () => true);
      f.flushRaf(0); f.flushRaf(150); expect(f.p.containerPosition).toBe(375);
      f.flushRaf(300); await pending;
      expect(f.p.containerPosition).toBe(500); expect(f.relocations.length).toBe(count + 1);
      expect(f.relocations.at(-1).reason).toBe('navigation');
      expect(publicBounds(f.p)).not.toEqual(oldBounds);
    } finally { await f.close(); }
  });
  it('L7 defensive private facade: invalidation between real animate frames blocks position/bounds/relocate', async () => {
    const f = fixture(); try {
      await active(f); f.flushRaf(); f.p.setAttribute('animated', ''); let current = true;
      const oldBounds = publicBounds(f.p);
      const count = f.relocations.length;
      const pending = f.p.__testScroll(500, 'navigation', true, () => current);
      f.flushRaf(0); f.flushRaf(150); const position = f.p.containerPosition;
      expect(position).toBe(375); current = false; f.flushRaf(300); await pending;
      expect(f.p.containerPosition).toBe(position); expect(f.relocations.length).toBe(count);
      // Extreme public clamps distinguish both bounds; compare observed baseline,
      // not a duplicated private bounds formula or an ambiguous interior point.
      expect(publicBounds(f.p)).toEqual(oldBounds);
    } finally { await f.close(); }
  });
  it('L7 ordinary public animated next/prev/snap keep their default behavior', async () => {
    const f = fixture(); try {
      await active(f); f.flushRaf(); f.p.setAttribute('animated', '');
      f.views[0].element.getBoundingClientRect = () => ({ left: 0, top: 0, right: 800, bottom: 3000, width: 800, height: 3000 });
      const next = f.p.next(500); f.flushRaf(0); f.flushRaf(300); await next;
      expect(f.p.containerPosition).toBe(500);
      const prev = f.p.prev(500); f.flushRaf(400); f.flushRaf(700); await prev;
      expect(f.p.containerPosition).toBe(0);
      // Snap inside the book, where no missing previous-section request occurs.
      f.p.containerPosition = 1500; f.p.snap(0, 0); f.flushRaf(800); f.flushRaf(1100); await tick();
      expect(f.relocations.at(-1).reason).toBe('snap');
    } finally { await f.close(); }
  });
});
