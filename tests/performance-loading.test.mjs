// Run with: node --test tests/performance-loading.test.mjs  (Node >= 22.18)
// Demand-loaded Calendly widget and the Meta VSL poster hint. Source files are
// transpiled with the repo's own TypeScript and server-rendered with next/*
// stubbed; the browser (window, document, IntersectionObserver, Element) is a
// local fake. No network, no real widget, no booking.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const WIDGET_SCRIPT = "https://assets.calendly.com/assets/external/widget.js";
const WIDGET_STYLE = "https://assets.calendly.com/assets/external/widget.css";
const VSL_POSTER = "/images/trendcandy-vsl-poster.jpg";
const VSL_SRC = "/videos/trendcandy-vsl-july-2026.mp4";
const ROUTING_URLS = {
  meta: "https://calendly.com/d/dwqf-y9m-tcg",
  google: "https://calendly.com/d/dt8q-7c7-9vm",
};
// The VSL exactly as production serves it (QA's LCP element snippet).
const VSL_MARKUP =
  '<video class="absolute inset-0 h-full w-full object-contain" src="/videos/trendcandy-vsl-july-2026.mp4" poster="/images/trendcandy-vsl-poster.jpg" controls="" playsInline="" preload="none" aria-label="TrendCandy video: how done-for-you survey data becomes your content"></video>';

const read = (path) => readFileSync(join(ROOT, path), "utf8");

// The Script stub records every server render so tests can see it is absent.
const STUBS = {
  "next/script": "export default function Script(props) { (globalThis.__scriptRenders ??= []).push(props); return null; }\n",
};
const COMPILER_OPTIONS = {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
};
const stubFile = (dir, spec) => join(dir, `${spec.replace("/", "-")}.mjs`);

/** Transpile src/<rel> into dir, recursing into its "@/..." imports once each. */
function emitSource(dir, rel, done) {
  if (done.has(rel)) return;
  done.add(rel);
  const file = [".tsx", ".ts"].map((ext) => `src/${rel}${ext}`).find((p) => existsSync(join(ROOT, p)));
  const { outputText } = ts.transpileModule(read(file), { compilerOptions: COMPILER_OPTIONS });
  const source = outputText.replace(/from "([^"]+)"/g, (match, spec) => {
    if (STUBS[spec]) return `from "${pathToFileURL(stubFile(dir, spec)).href}"`;
    if (!spec.startsWith("@/")) return `from "${import.meta.resolve(spec)}"`;
    emitSource(dir, spec.slice(2), done);
    return `from "${pathToFileURL(join(dir, `${spec.slice(2)}.mjs`)).href}"`;
  });
  const out = join(dir, `${rel}.mjs`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, source);
}

/** Transpile src/ entry modules to ESM in a temp dir and import them. */
async function loadSources(entries) {
  const dir = mkdtempSync(join(tmpdir(), "performance-loading-"));
  for (const [spec, body] of Object.entries(STUBS)) writeFileSync(stubFile(dir, spec), body);
  const done = new Set();
  for (const entry of entries) emitSource(dir, entry, done);
  try {
    return await Promise.all(entries.map((entry) => import(pathToFileURL(join(dir, `${entry}.mjs`)).href)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const [embed, hero] = await loadSources(["components/CalendlyEmbed", "components/sections/HeroSection"]);

// --- Fake browser --------------------------------------------------------------

class FakeElement {
  constructor(matches = () => false) {
    this.matches = matches;
  }
  closest(selector) {
    return this.matches(selector) ? this : null;
  }
}

/** Listener registry for window/document with add/remove bookkeeping. */
function eventTarget() {
  const listeners = [];
  return {
    listeners,
    addEventListener: (type, fn, options) => listeners.push({ type, fn, options }),
    removeEventListener: (type, fn, options) => {
      const capture = (o) => (typeof o === "boolean" ? o : Boolean(o?.capture));
      const i = listeners.findIndex((l) => l.type === type && l.fn === fn && capture(l.options) === capture(options));
      if (i >= 0) listeners.splice(i, 1);
    },
    dispatch: (type, event) => [...listeners].filter((l) => l.type === type).forEach((l) => l.fn(event)),
  };
}

/** IntersectionObserver fake: records instances; `fire` delivers entries. */
function fakeObserverClass({ throwOn } = {}) {
  const instances = [];
  class FakeIntersectionObserver {
    constructor(callback, options) {
      if (throwOn === "construct") throw new Error("fixture IO construct failure");
      Object.assign(this, { callback, options, targets: [], disconnected: false });
      instances.push(this);
    }
    observe(target) {
      if (throwOn === "observe") throw new Error("fixture IO observe failure");
      this.targets.push(target);
    }
    disconnect() {
      this.disconnected = true;
    }
    fire(isIntersecting) {
      this.callback(this.targets.map((target) => ({ target, isIntersecting })), this);
    }
  }
  return { FakeIntersectionObserver, instances };
}

/** Run fn with a fake window/document/IO/Element, restoring globals afterwards. */
function withFakeBrowser({ hash = "", observer = fakeObserverClass() } = {}, fn) {
  const win = { ...eventTarget(), location: { hash, search: "" } };
  const doc = eventTarget();
  const keys = ["window", "document", "IntersectionObserver", "Element"];
  const saved = keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  const define = (key, value) =>
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  define("window", win);
  define("document", doc);
  define("IntersectionObserver", observer?.FakeIntersectionObserver);
  define("Element", FakeElement);
  try {
    return fn({ win, doc, instances: observer?.instances ?? [] });
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

const listenerCount = ({ win, doc }) => win.listeners.length + doc.listeners.length;
const bookLink = () => new FakeElement((selector) => selector === 'a[href="#book"]');
const clickOn = (target) => ({
  target,
  preventDefault: () => assert.fail("intent listener must not block the native anchor"),
  stopPropagation: () => assert.fail("intent listener must not stop the click"),
});

// --- Activation lifecycle --------------------------------------------------------

test("far from #book: observes the card near the viewport and stays inert", () => {
  withFakeBrowser({}, (env) => {
    const target = new FakeElement();
    let activations = 0;
    embed.watchBookingIntent(target, () => activations++);
    assert.equal(env.instances.length, 1);
    const [io] = env.instances;
    assert.deepEqual(io.targets, [target]);
    assert.match(io.options.rootMargin, /^\d+px 0px$/, "a near-viewport margin, vertical only");
    io.fire(false);
    env.doc.dispatch("click", clickOn(new FakeElement()));
    env.win.location.hash = "#faq";
    env.win.dispatch("hashchange", {});
    assert.equal(activations, 0, "no intent signal yet");
  });
});

test("nearing the viewport activates once, then tears everything down", () => {
  withFakeBrowser({}, (env) => {
    let activations = 0;
    embed.watchBookingIntent(new FakeElement(), () => activations++);
    const [io] = env.instances;
    io.fire(true);
    io.fire(true);
    env.doc.dispatch("click", clickOn(bookLink()));
    assert.equal(activations, 1);
    assert.equal(io.disconnected, true);
    assert.equal(listenerCount(env), 0, "click + hashchange listeners removed");
  });
});

test("a pointer or keyboard click on an in-page #book CTA activates without blocking it", () => {
  withFakeBrowser({}, (env) => {
    let activations = 0;
    embed.watchBookingIntent(new FakeElement(), () => activations++);
    const click = env.doc.listeners.find((l) => l.type === "click");
    assert.ok(click.options === true || click.options?.capture, "capture phase: sees every CTA");
    env.doc.dispatch("click", clickOn(new FakeElement()));
    env.doc.dispatch("click", clickOn({ closest: () => assert.fail("non-Element targets are ignored") }));
    assert.equal(activations, 0);
    env.doc.dispatch("click", clickOn(bookLink()));
    assert.equal(activations, 1);
    assert.equal(env.instances[0].disconnected, true);
    assert.equal(listenerCount(env), 0);
  });
});

test("arriving with #book activates immediately, with nothing left to observe", () => {
  withFakeBrowser({ hash: "#book" }, (env) => {
    let activations = 0;
    const stop = embed.watchBookingIntent(new FakeElement(), () => activations++);
    assert.equal(activations, 1);
    assert.equal(env.instances.every((io) => io.disconnected), true);
    assert.equal(listenerCount(env), 0);
    stop();
    assert.equal(activations, 1);
  });
});

test("a later navigation to #book activates; other hashes do not", () => {
  withFakeBrowser({}, (env) => {
    let activations = 0;
    embed.watchBookingIntent(new FakeElement(), () => activations++);
    env.win.location.hash = "#client-wins";
    env.win.dispatch("hashchange", {});
    assert.equal(activations, 0);
    env.win.location.hash = "#book";
    env.win.dispatch("hashchange", {});
    assert.equal(activations, 1);
    assert.equal(listenerCount(env), 0);
  });
});

test("teardown before intent disconnects, removes listeners and ignores stale callbacks", () => {
  withFakeBrowser({}, (env) => {
    let activations = 0;
    const stop = embed.watchBookingIntent(new FakeElement(), () => activations++);
    const [io] = env.instances;
    stop();
    assert.equal(io.disconnected, true);
    assert.equal(listenerCount(env), 0);
    io.fire(true); // a callback already queued before disconnect
    assert.equal(activations, 0, "an unmounted card is never activated");
    stop();
  });
});

test("remount: a fresh watcher on the new card works independently", () => {
  withFakeBrowser({}, (env) => {
    const calls = [];
    const stopFirst = embed.watchBookingIntent(new FakeElement(), () => calls.push("first"));
    stopFirst();
    embed.watchBookingIntent(new FakeElement(), () => calls.push("second"));
    assert.equal(env.instances.length, 2);
    env.instances[1].fire(true);
    assert.deepEqual(calls, ["second"]);
  });
});

test("fails open: no IntersectionObserver means the widget loads right away", () => {
  withFakeBrowser({ observer: null }, (env) => {
    let activations = 0;
    embed.watchBookingIntent(new FakeElement(), () => activations++);
    assert.equal(activations, 1);
    assert.equal(listenerCount(env), 0);
  });
});

for (const throwOn of ["construct", "observe"]) {
  test(`fails open: an IntersectionObserver ${throwOn} error loads the widget right away`, () => {
    withFakeBrowser({ observer: fakeObserverClass({ throwOn }) }, (env) => {
      let activations = 0;
      embed.watchBookingIntent(new FakeElement(), () => activations++);
      assert.equal(activations, 1);
      assert.equal(listenerCount(env), 0);
    });
  });
}

// --- Server render: nothing from Calendly before intent ---------------------------

for (const destination of ["meta", "google"]) {
  test(`${destination}: initial HTML has no Calendly script or stylesheet, card intact`, () => {
    globalThis.__scriptRenders = [];
    const html = renderToStaticMarkup(createElement(embed.CalendlyEmbed, { destination }));
    assert.deepEqual(globalThis.__scriptRenders, [], "next/script (and its SSR preload) not rendered");
    assert.ok(!html.includes(WIDGET_STYLE) && !html.includes(WIDGET_SCRIPT));
    assert.ok(!html.includes("<iframe"));
    assert.match(html, /class="calendly-inline-widget w-full h-\[1000px\] md:h-\[720px\] rounded-2xl overflow-hidden"/);
    assert.ok(html.includes(`Loading Justin&#x27;s calendar…`));
    assert.ok(html.includes(`href="${ROUTING_URLS[destination]}"`), "new-tab fallback unchanged");
    assert.equal(html.split('href="/privacy-policy"').length - 1, 1, "privacy link painted");
  });
}

test("once active, the same Script/stylesheet mount with one idempotent init", () => {
  const source = read("src/components/CalendlyEmbed.tsx");
  const gated = source.match(/\{active && \(\s*<>\s*<Script([\s\S]*?)\/>\s*<link rel="stylesheet" href=\{CALENDLY_STYLE_HREF\} \/>\s*<\/>\s*\)\}/);
  assert.ok(gated, "Script + stylesheet render only behind the activation flag");
  for (const prop of ['id="calendly-inline"', "src={CALENDLY_SCRIPT_SRC}", 'strategy="afterInteractive"', "onLoad={initWidget}", "onReady={initWidget}"]) {
    assert.ok(gated[1].includes(prop), `Script keeps ${prop}`);
  }
  assert.match(source, /const active = useBookingIntent\(hostRef\);/);
});

test("remount after the script loaded: a card with a widget is never re-initialized", () => {
  const calls = [];
  withFakeBrowser({}, ({ win }) => {
    win.Calendly = { initInlineWidget: (opts) => calls.push(opts) };
    const fresh = { querySelector: () => null };
    const mounted = { querySelector: (sel) => (sel === "iframe" ? {} : null) };
    assert.equal(embed.initCalendlyWidget(fresh, "meta"), true);
    assert.equal(embed.initCalendlyWidget(mounted, "meta"), true);
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${ROUTING_URLS.meta}?hide_event_type_details=0&hide_gdpr_banner=1`);
});

// --- Meta VSL poster discovery ------------------------------------------------------

const renderHero = (props) => renderToStaticMarkup(createElement(hero.HeroSection, props));
const posterPreloads = (html) => html.match(/<link rel="preload"[^>]*trendcandy-vsl-poster\.jpg[^>]*\/>/g) ?? [];

test("Meta hero hints the existing VSL poster early at high priority, video untouched", () => {
  const html = renderHero({ showVsl: true, showOffer: true });
  const preloads = posterPreloads(html);
  assert.equal(preloads.length, 1);
  assert.match(preloads[0], new RegExp(`href="${VSL_POSTER}"`));
  assert.match(preloads[0], /as="image"/);
  assert.match(preloads[0], /fetchpriority="high"/i);
  assert.ok(!/<link[^>]*\.mp4/.test(html), "the MP4 itself is never preloaded");
  assert.ok(html.includes(VSL_MARKUP), "same video element, preload=none, native controls");
  assert.equal(html.split(VSL_SRC).length - 1, 1);
});

test("Google hero has no VSL and no poster hint", () => {
  const html = renderHero({});
  assert.deepEqual(posterPreloads(html), []);
  assert.ok(!html.includes("<video") && !html.includes(VSL_POSTER));
});
