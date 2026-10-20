// Run with: node --test tests/floating-cta.test.mjs  (Node >= 22.18)
// FloatingCTA is transpiled with the repo's own TypeScript. The window,
// document and IntersectionObserver below are local fakes driven by the tests.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(ROOT, path), "utf8");

/** Transpile FloatingCTA.tsx to ESM with resolvable imports and load it. */
async function loadFloatingCTA() {
  const dir = mkdtempSync(join(tmpdir(), "floating-cta-"));
  const specifiers = {
    "@/lib/content": pathToFileURL(join(ROOT, "src/lib/content.ts")).href,
    react: import.meta.resolve("react"),
    "react/jsx-runtime": import.meta.resolve("react/jsx-runtime"),
  };
  const { outputText } = ts.transpileModule(read("src/components/FloatingCTA.tsx"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const source = outputText.replace(/from "([^"]+)"/g, (match, spec) =>
    specifiers[spec] ? `from "${specifiers[spec]}"` : match,
  );
  const file = join(dir, "FloatingCTA.mjs");
  writeFileSync(file, source);
  try {
    return await import(pathToFileURL(file).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const floating = await loadFloatingCTA();

/** Root (default) markup captured from main d4c78d3 before this change. */
const ROOT_HIDDEN_MARKUP =
  '<div class="fixed bottom-5 right-5 z-40 transition-all duration-300 opacity-0 translate-y-3 pointer-events-none"><a href="#book" class="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-3 rounded-full font-semibold shadow-lg shadow-[var(--color-primary)]/25 transition"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>Book a Call</a></div>';

const VIEWPORT = { width: 390, height: 844 };
const BOOK_HEIGHT = 1002;
// Existing behavior: the CTA shows once scrollY passes 60% of the viewport.
const PAST_THRESHOLD = 600;
const BEFORE_THRESHOLD = 400;

/**
 * Fake browser: a page whose #book element sits at `bookTop` (document
 * coordinates). scrollTo/resize move the viewport; the fake observer only
 * calls back when the test triggers it, like a real IntersectionObserver.
 */
function createBrowser({ bookTop = 5000, scrollY = 0, withBook = true } = {}) {
  const listeners = new Map();
  const observers = [];
  const win = { scrollY, innerHeight: VIEWPORT.height, innerWidth: VIEWPORT.width };
  win.addEventListener = (type, fn, options) => listeners.set(type, { fn, options });
  win.removeEventListener = (type, fn) => {
    if (listeners.get(type)?.fn === fn) listeners.delete(type);
  };
  const book = {
    getBoundingClientRect: () => {
      const top = bookTop - win.scrollY;
      return { top, bottom: top + BOOK_HEIGHT, left: 16, right: 359 };
    },
  };
  const doc = { getElementById: (id) => (withBook && id === "book" ? book : null) };
  class FakeObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.targets = [];
      this.disconnected = false;
      observers.push(this);
    }
    observe(target) {
      this.targets.push(target);
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  return {
    globals: { window: win, document: doc, IntersectionObserver: FakeObserver },
    listeners,
    observers,
    book,
    scrollTo(y) {
      win.scrollY = y;
      listeners.get("scroll")?.fn();
    },
    resize(height) {
      win.innerHeight = height;
      for (const o of observers) if (!o.disconnected) o.callback([]);
    },
  };
}

/** Install the fake browser globals for fn, restoring them afterwards. */
function withBrowser(browser, fn) {
  const keys = Object.keys(browser.globals);
  const saved = keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  for (const key of keys) {
    Object.defineProperty(globalThis, key, {
      value: browser.globals[key],
      configurable: true,
      writable: true,
    });
  }
  try {
    return fn();
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

/** Start watching and record every visibility value reported. */
function watch(browser, hideWhileInViewId) {
  const seen = [];
  const stop = withBrowser(browser, () =>
    floating.watchFloatingVisibility((visible) => seen.push(visible), hideWhileInViewId),
  );
  const step = (fn) => withBrowser(browser, fn);
  return { seen, last: () => seen.at(-1), stop: () => step(stop), step };
}

// --- Page wiring -------------------------------------------------------------

test("/google opts the floating CTA into hiding while #book is in view", () => {
  assert.match(read("src/app/google/page.tsx"), /<FloatingCTA hideWhileInViewId="book" \/>/);
});

test("root keeps the default floating CTA with no booking opt-in", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /<FloatingCTA \/>/);
  assert.doesNotMatch(page, /hideWhileInViewId/);
});

// --- Markup ------------------------------------------------------------------

test("root default markup is byte-identical to main", () => {
  assert.equal(renderToStaticMarkup(createElement(floating.FloatingCTA)), ROOT_HIDDEN_MARKUP);
});

test("opt-in hidden CTA is inert and pointer-transparent, label and href unchanged", () => {
  const html = renderToStaticMarkup(
    createElement(floating.FloatingCTA, { hideWhileInViewId: "book" }),
  );
  assert.match(html, /^<div class="[^"]*opacity-0[^"]*pointer-events-none"[^>]* inert="">/);
  assert.match(html, /<a href="#book"[^>]*>.*Book a Call<\/a>/);
  assert.equal(html.replace(' inert=""', ""), ROOT_HIDDEN_MARKUP);
});

// --- Root default behavior ---------------------------------------------------

test("root default follows the scroll threshold only, even over #book", () => {
  const browser = createBrowser({ bookTop: 900 });
  const run = watch(browser);
  assert.equal(run.last(), false);
  run.step(() => browser.scrollTo(PAST_THRESHOLD));
  assert.equal(run.last(), true);
  run.step(() => browser.scrollTo(BEFORE_THRESHOLD));
  assert.equal(run.last(), false);
  assert.equal(browser.observers.length, 0);
  run.stop();
});

// --- Booking-aware behavior --------------------------------------------------

test("stays hidden before the hero threshold", () => {
  const browser = createBrowser({ bookTop: 5000 });
  const run = watch(browser, "book");
  assert.equal(run.last(), false);
  run.step(() => browser.scrollTo(BEFORE_THRESHOLD));
  assert.equal(run.last(), false);
  run.stop();
});

test("shows past the threshold away from booking", () => {
  const browser = createBrowser({ bookTop: 5000 });
  const run = watch(browser, "book");
  run.step(() => browser.scrollTo(PAST_THRESHOLD));
  assert.equal(run.last(), true);
  run.stop();
});

test("hides as soon as 1px of #book enters, and returns after it fully leaves", () => {
  const bookTop = 5000;
  const browser = createBrowser({ bookTop });
  const run = watch(browser, "book");
  const enterAt = bookTop - VIEWPORT.height; // book top exactly at viewport bottom
  run.step(() => browser.scrollTo(enterAt));
  assert.equal(run.last(), true, "touching the edge is not yet visible");
  run.step(() => browser.scrollTo(enterAt + 1));
  assert.equal(run.last(), false, "one visible pixel hides the CTA");
  run.step(() => browser.scrollTo(bookTop + BOOK_HEIGHT - 1));
  assert.equal(run.last(), false, "last visible pixel keeps it hidden");
  run.step(() => browser.scrollTo(bookTop + BOOK_HEIGHT));
  assert.equal(run.last(), true, "reappears once #book has scrolled away");
  run.step(() => browser.scrollTo(enterAt - 100));
  assert.equal(run.last(), true, "return-scroll above #book shows it again");
  run.stop();
});

test("initial deep link to #book starts hidden without waiting for the observer", () => {
  const browser = createBrowser({ bookTop: 13300, scrollY: 13224 });
  const run = watch(browser, "book");
  assert.deepEqual(run.seen, [false]);
  run.stop();
});

test("resize that brings #book into view hides the CTA via the observer", () => {
  const browser = createBrowser({ bookTop: 1600, scrollY: 700 });
  const run = watch(browser, "book");
  assert.equal(run.last(), true);
  assert.equal(browser.observers[0].targets[0], browser.book);
  const [edge, firstPixel] = browser.observers[0].options.threshold;
  assert.ok(edge === 0 && firstPixel > 0, "fires on edge contact and first visible pixel");
  run.step(() => browser.resize(1024));
  assert.equal(run.last(), false);
  run.stop();
});

test("missing booking target falls back to the threshold behavior", () => {
  const browser = createBrowser({ withBook: false, scrollY: PAST_THRESHOLD });
  const run = watch(browser, "book");
  assert.equal(run.last(), true);
  assert.equal(browser.observers.length, 0);
  run.stop();
});

test("cleanup removes the scroll listener and disconnects the observer", () => {
  const browser = createBrowser();
  const run = watch(browser, "book");
  assert.equal(browser.listeners.get("scroll").options.passive, true);
  run.stop();
  assert.equal(browser.listeners.has("scroll"), false);
  assert.equal(browser.observers[0].disconnected, true);
});
