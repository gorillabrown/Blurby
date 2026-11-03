// READER-VISUAL-DIAG-1 instrumentation (scratch; injected through CDP before the page loads; never committed).
(() => {
  if (window.__rvd) return;
  const S = (window.__rvd = { sites: {}, attr: {}, props: {}, errors: 0, errorSamples: [], t0: performance.now() });
  const siteOf = () => {
    const lines = (new Error().stack || "").split("\n").slice(2).map((l) => l.trim());
    const app = lines.find((l) => !l.includes("ro-wrap") && !l.includes("<anonymous>")) || lines[0] || "?";
    return app.replace(/^at\s+/, "").replace(/\?t=\d+/, "").slice(0, 160);
  };
  const Native = window.ResizeObserver;
  S.live = [];
  window.__rvdLive = () => S.live.filter((o) => !o.disconnected).map((o) => ({
    site: o.site, calls: o.calls,
    targets: [...o.targets].map((t) => ({ el: `${t.tagName.toLowerCase()}.${String(t.className).split(" ")[0]}`, connected: t.isConnected, w: t.clientWidth, h: t.clientHeight })),
  }));
  // Diagnostic intervention: disconnect observers whose every target is detached or a 0x0 body of a dead frame.
  window.__rvdDisconnectLeaked = () => {
    const leaked = S.live.filter((o) => !o.disconnected && o.targets.size > 0 && [...o.targets].every((t) => !t.isConnected || (t.tagName === "BODY" && t.clientWidth === 0 && t.clientHeight === 0)));
    for (const o of leaked) o.obs.disconnect();
    return leaked.map((o) => o.site.replace(/.*assets\//, ""));
  };
  window.ResizeObserver = class extends Native {
    observe(target, opts) { this.__rec?.targets.add(target); return super.observe(target, opts); }
    unobserve(target) { this.__rec?.targets.delete(target); return super.unobserve(target); }
    disconnect() { if (this.__rec) { this.__rec.disconnected = true; this.__rec.targets.clear(); } return super.disconnect(); }
    constructor(cb) {
      const site = siteOf();
      const rec = (S.sites[site] ||= { created: 0, calls: 0, entries: 0, sizes: {}, lastSec: {} });
      rec.created++;
      const live = { site, calls: 0, targets: new Set(), disconnected: false };
      super((entries, obs) => {
        rec.calls++;
        live.calls++;
        rec.entries += entries.length;
        const sec = Math.floor((performance.now() - S.t0) / 1000);
        rec.lastSec[sec] = (rec.lastSec[sec] || 0) + 1;
        for (const e of entries) {
          const k = `${e.target.tagName.toLowerCase()}.${String(e.target.className).split(" ")[0]} ${Math.round(e.contentRect.width)}x${Math.round(e.contentRect.height)}`;
          rec.sizes[k] = (rec.sizes[k] || 0) + 1;
        }
        return cb(entries, obs);
      });
      this.__rec = live;
      live.obs = this;
      S.live.push(live);
    }
  };
  const setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (name === "max-block-size" || name === "max-column-count" || name === "margin" || name === "gap") {
      const r = (S.attr[name] ||= { writes: 0, changed: 0, values: {} });
      r.writes++;
      if (this.getAttribute(name) !== String(value)) r.changed++;
      r.values[String(value)] = (r.values[String(value)] || 0) + 1;
    }
    return setAttr.call(this, name, value);
  };
  const setProp = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (name, value, prio) {
    if (name.startsWith("--flow-zone")) {
      const r = (S.props[name] ||= { writes: 0, changed: 0, values: {} });
      r.writes++;
      if (this.getPropertyValue(name) !== String(value)) r.changed++;
      r.values[String(value)] = (r.values[String(value)] || 0) + 1;
    }
    return setProp.call(this, name, value, prio);
  };
  window.addEventListener("error", (e) => {
    if (String(e.message).includes("ResizeObserver")) {
      S.errors++;
      if (S.errorSamples.length < 3) S.errorSamples.push({ t: Math.round(performance.now() - S.t0), msg: e.message });
    }
  }, true);
})();
