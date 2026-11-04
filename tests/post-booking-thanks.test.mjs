// Run with: node --test tests/post-booking-thanks.test.mjs  (Node >= 22.18)
// Post-booking /thanks page and the confirmed-booking redirect. Source files
// are transpiled with the repo's own TypeScript; next/* are stubbed and every
// window, dataLayer, MegaTag and Calendly message is a local fake. No network,
// no real widget, no booking and no conversion is created.
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
const CALENDLY_ORIGIN = "https://calendly.com";
const SCHEDULED = "calendly.event_scheduled";
const NON_SCHEDULED_STEPS = [
  "calendly.profile_page_viewed",
  "calendly.event_type_viewed",
  "calendly.date_and_time_selected",
  "calendly.page_height",
];
const STEP = (step) => ({ event: "calendly_event", calendly_step: step, form_provider: "trendcandy-landing" });
const MEGATAG_BOOKED = ["calendly_booked", { element: "calendly-inline", provider: "calendly" }];
const CONFIRMED_TIMEOUT_MS = 2000;

const read = (path) => readFileSync(join(ROOT, path), "utf8");

const STUBS = {
  "next/script": "export default function Script() { return null; }\n",
  "next/image":
    `import { createElement } from "${import.meta.resolve("react")}";\n` +
    "export default function Image({ priority, ...props }) { return createElement('img', props); }\n",
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

/**
 * Transpile src/ entry modules (sharing one module graph) to ESM in a temp
 * dir so the real component tree can be imported and server-rendered.
 */
async function loadSources(entries) {
  const dir = mkdtempSync(join(tmpdir(), "thanks-"));
  for (const [spec, body] of Object.entries(STUBS)) writeFileSync(stubFile(dir, spec), body);
  const done = new Set();
  for (const entry of entries) emitSource(dir, entry, done);
  try {
    return await Promise.all(entries.map((entry) => import(pathToFileURL(join(dir, `${entry}.mjs`)).href)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const [embed, header, thanks] = await loadSources([
  "components/CalendlyEmbed",
  "components/Header",
  "app/thanks/page",
]);

// --- Fake browser --------------------------------------------------------------

// Fake GTM behaviours: how (and whether) GTM calls the confirmed eventCallback.
const GTM = {
  sync: (cb) => cb("GTM-TEST"),
  syncDuplicate: (cb) => { cb("GTM-A"); cb("GTM-B"); },
  late: (cb) => setTimeout(() => cb("GTM-TEST"), 500),
  afterFallback: (cb) => setTimeout(() => cb("GTM-TEST"), 3000),
};

/** A dataLayer whose push behaves like loaded GTM, recording into `order`. */
function fakeGtmDataLayer(gtm, order) {
  const dataLayer = [];
  dataLayer.push = (entry) => {
    order.push(`push:${entry.event}`);
    Array.prototype.push.call(dataLayer, entry);
    if (typeof entry.eventCallback === "function") gtm(entry.eventCallback);
    order.push(`returned:${entry.event}`);
    return dataLayer.length;
  };
  return dataLayer;
}

// The LP page the booking happens on, and where its redirect must land.
const LP_URL = "https://lp.trendcandy.example/google?utm_source=google#book";
const THANKS_URL = "https://lp.trendcandy.example/thanks";

/**
 * A fake Location at `href` whose navigations are recorded under `name`.
 * `refuse` makes navigation throw, like a browser blocking a framed page.
 */
function fakeLocation(href, name, record, { refuse = false } = {}) {
  return {
    get href() {
      return href;
    },
    set href(url) {
      if (refuse) throw new Error("SecurityError: top navigation blocked");
      record.order.push(`navigate:${url}`);
      record.navigations.push(url);
      record.frames.push(name);
    },
  };
}

/**
 * Install a fake window for fn(win, record) and restore it afterwards.
 * `gtm` is a GTM behaviour or null (GTM absent). `top` is "self" (unframed),
 * "framed" (a distinct top window), "framedRefused" (top navigation throws)
 * or "null". Returns the record; `frames` says which window navigated.
 */
function withWindow({ gtm = null, megaTagThrows = false, top = "self" } = {}, fn) {
  const record = { order: [], megaTag: [], navigations: [], frames: [] };
  const win = {
    dataLayer: gtm ? fakeGtmDataLayer(gtm, record.order) : undefined,
    location: fakeLocation(LP_URL, "self", record),
    MegaTag: {
      trackEvent: (...args) => {
        record.order.push(`megatag:${args[0]}`);
        record.megaTag.push(args);
        if (megaTagThrows) throw new Error("MegaTag down");
      },
    },
  };
  const parentUrl = "https://publisher.example/article";
  win.top = {
    self: win,
    framed: { location: fakeLocation(parentUrl, "top", record) },
    framedRefused: { location: fakeLocation(parentUrl, "top", record, { refuse: true }) },
    null: null,
  }[top];
  const saved = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { value: win, configurable: true, writable: true });
  try {
    fn(win, record);
  } finally {
    if (saved) Object.defineProperty(globalThis, "window", saved);
    else delete globalThis.window;
  }
  return { ...record, dataLayer: win.dataLayer };
}

function fakeHost() {
  const frame = { contentWindow: { id: "calendly-frame" } };
  return { frame, host: { querySelector: (sel) => (sel === "iframe" ? frame : null) } };
}

const message = (frame, event, overrides = {}) => ({
  origin: CALENDLY_ORIGIN,
  source: frame.contentWindow,
  data: { event },
  ...overrides,
});

/** Strip the callback so payload fields can be compared exactly. */
const fields = (entry) => {
  const { eventCallback, ...rest } = entry;
  return { ...rest, ...(eventCallback ? { eventCallback: typeof eventCallback } : {}) };
};

// --- Message authentication (exact production handler) -------------------------

test("authenticated scheduled message relays and redirects once after the fallback", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { frame, host } = fakeHost();
  const run = withWindow({}, (win, live) => {
    embed.handleCalendlyMessage(message(frame, SCHEDULED), host);
    t.mock.timers.tick(1999);
    assert.deepEqual(live.navigations, [], "no redirect before the bounded fallback");
    t.mock.timers.tick(1);
    assert.deepEqual(live.navigations, [THANKS_URL]);
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.navigations, [THANKS_URL]);
  assert.equal(run.megaTag.length, 1);
});

test("forged origin, forged source, missing frame and non-string events are ignored", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { frame, host } = fakeHost();
  const forged = [
    [message(frame, SCHEDULED, { origin: "https://evil.example" }), host],
    [message(frame, SCHEDULED, { origin: "https://calendly.com.evil.example" }), host],
    [message(frame, SCHEDULED, { source: {} }), host],
    [message(frame, SCHEDULED, { source: null }), host],
    [message(frame, SCHEDULED), { querySelector: () => null }],
    [message(frame, SCHEDULED), null],
    [message(frame, null, { data: { event: 42 } }), host],
    [message(frame, null, { data: { event: { toString: () => SCHEDULED } } }), host],
    [message(frame, null, { data: SCHEDULED }), host],
    [message(frame, null, { data: null }), host],
    [message(frame, "other.event_scheduled"), host],
  ];
  const run = withWindow({ gtm: GTM.sync }, () => {
    for (const [e, h] of forged) embed.handleCalendlyMessage(e, h);
    t.mock.timers.tick(10000);
  });
  assert.equal(run.dataLayer.length, 0);
  assert.deepEqual(run.megaTag, []);
  assert.deepEqual(run.navigations, []);
});

for (const step of NON_SCHEDULED_STEPS) {
  test(`${step} relays its step only: no conversion, no redirect`, (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const { frame, host } = fakeHost();
    const run = withWindow({ gtm: GTM.sync }, () => {
      embed.handleCalendlyMessage(message(frame, step), host);
      t.mock.timers.tick(10000);
    });
    assert.deepEqual(run.dataLayer.map(fields), [STEP(step)]);
    assert.deepEqual(run.megaTag, []);
    assert.deepEqual(run.navigations, []);
  });
}

// --- Scheduled: order, payloads, callback and fallback -------------------------

test("scheduled keeps relay order and exact payloads, adding only callback + timeout", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ gtm: GTM.late }, () => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.dataLayer.map(fields), [
    STEP(SCHEDULED),
    {
      event: "calendly_booking_confirmed",
      form_provider: "trendcandy-landing",
      eventCallback: "function",
      eventTimeout: CONFIRMED_TIMEOUT_MS,
    },
  ]);
  assert.deepEqual(run.megaTag, [MEGATAG_BOOKED]);
  assert.deepEqual(run.order, [
    "push:calendly_event",
    "returned:calendly_event",
    "megatag:calendly_booked",
    "push:calendly_booking_confirmed",
    "returned:calendly_booking_confirmed",
    `navigate:${THANKS_URL}`,
  ]);
});

test("GTM callback after the push redirects immediately, timer does not repeat it", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ gtm: GTM.late }, (win, live) => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(499);
    assert.deepEqual(live.navigations, []);
    t.mock.timers.tick(1);
    assert.deepEqual(live.navigations, [THANKS_URL], "callback redirects before the fallback");
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.navigations, [THANKS_URL], "callback + fallback navigate once");
});

test("a synchronous callback inside push navigates only after the push returns", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ gtm: GTM.sync }, () => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.navigations, [THANKS_URL]);
  assert.deepEqual(run.order.slice(-3), [
    "push:calendly_booking_confirmed",
    "returned:calendly_booking_confirmed",
    `navigate:${THANKS_URL}`,
  ]);
});

test("duplicate callbacks (one per GTM container) navigate once", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ gtm: GTM.syncDuplicate }, () => {
    embed.relayCalendlyEvent(SCHEDULED);
    const [, confirmed] = globalThis.window.dataLayer;
    confirmed.eventCallback("GTM-C");
    t.mock.timers.tick(10000);
    confirmed.eventCallback("GTM-D");
  });
  assert.deepEqual(run.navigations, [THANKS_URL]);
});

test("a callback arriving after the fallback does not navigate again", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ gtm: GTM.afterFallback }, (win, live) => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(2000);
    assert.deepEqual(live.navigations, [THANKS_URL]);
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.navigations, [THANKS_URL]);
});

test("absent GTM: dataLayer is created, the bounded fallback redirects once", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({}, () => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(1999);
    assert.equal(globalThis.window.dataLayer.length, 2);
    t.mock.timers.tick(10001);
  });
  assert.deepEqual(run.dataLayer.map(fields).map((e) => e.event), ["calendly_event", "calendly_booking_confirmed"]);
  assert.deepEqual(run.navigations, [THANKS_URL]);
});

test("MegaTag failure still pushes the GTM backup and still redirects", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ megaTagThrows: true }, () => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.megaTag, [MEGATAG_BOOKED]);
  assert.equal(run.dataLayer.at(-1).event, "calendly_booking_confirmed");
  assert.deepEqual(run.navigations, [THANKS_URL]);
});

test("missing MegaTag still pushes the GTM backup and still redirects", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({}, (win) => {
    delete win.MegaTag;
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(10000);
  });
  assert.equal(run.dataLayer.at(-1).event, "calendly_booking_confirmed");
  assert.deepEqual(run.navigations, [THANKS_URL]);
});

// --- Which window navigates ------------------------------------------------------

test("unframed: the page's own (top) window navigates once, to its absolute /thanks", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ gtm: GTM.late }, () => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.navigations, [THANKS_URL]);
  assert.deepEqual(run.frames, ["self"]);
});

// [name, GTM behaviour, navigations already made when relayCalendlyEvent returns]
const FRAMED_CASES = [["late callback", GTM.late, 0], ["sync callback", GTM.sync, 1], ["absent GTM", null, 0]];
for (const [name, gtm, navigatedOnReturn] of FRAMED_CASES) {
  test(`framed (${name}): only the distinct top window navigates, once, to the LP's /thanks`, (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const run = withWindow({ gtm, top: "framed" }, (win, live) => {
      embed.relayCalendlyEvent(SCHEDULED);
      assert.equal(live.navigations.length, navigatedOnReturn, "sync callback navigates as the push returns, others wait");
      t.mock.timers.tick(10000);
      win.dataLayer.at(-1).eventCallback?.("GTM-LATE");
    });
    assert.deepEqual(run.navigations, [THANKS_URL], "LP origin, not the parent page's");
    assert.deepEqual(run.frames, ["top"], "the framed LP window itself never navigates");
    assert.equal(run.order.at(-1), `navigate:${THANKS_URL}`, "navigation is the last step");
    if (gtm) assert.equal(run.order.at(-2), "returned:calendly_booking_confirmed");
  });
}

test("framed but top navigation refused: this frame navigates once instead", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ gtm: GTM.syncDuplicate, top: "framedRefused" }, () => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.navigations, [THANKS_URL]);
  assert.deepEqual(run.frames, ["self"]);
});

test("window.top null: falls back to this window, once", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const run = withWindow({ top: "null" }, () => {
    embed.relayCalendlyEvent(SCHEDULED);
    t.mock.timers.tick(10000);
  });
  assert.deepEqual(run.navigations, [THANKS_URL]);
  assert.deepEqual(run.frames, ["self"]);
});

test("the redirect has a single navigation function, called from one place", () => {
  const source = read("src/components/CalendlyEmbed.tsx");
  assert.equal(source.match(/location\.assign|location\.replace/g), null);
  assert.equal(source.match(/navigateTopToThanks\(\)/g)?.length, 2, "definition + one call");
});

// --- Header ----------------------------------------------------------------------

/** Default Header markup rendered from main da4f084 before this change. */
const MAIN_HEADER_MARKUP =
  '<link rel="preload" as="image" href="/images/trendcandy-logo-tight.png"/><header class="fixed top-0 inset-x-0 z-40 transition-colors duration-200 bg-white/90 backdrop-blur"><div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3"><a href="https://www.trendcandy.io/" rel="noopener" aria-label="TrendCandy home page" class="flex items-center gap-2 group"><img src="/images/trendcandy-logo-tight.png" alt="TrendCandy" width="896" height="379" class="h-14 sm:h-16 w-auto object-contain"/></a><div class="flex items-center gap-2 sm:gap-3"><a href="#book" class="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition shadow-sm">Book a Call</a></div></div></header>';

test("Header default markup keeps its booking CTA; opt-out removes it only", () => {
  const withCta = renderToStaticMarkup(createElement(header.Header));
  assert.equal(withCta, MAIN_HEADER_MARKUP, "default Header is byte-identical to main");
  const without = renderToStaticMarkup(createElement(header.Header, { showBookingCta: false }));
  assert.equal(renderToStaticMarkup(createElement(header.Header, { showBookingCta: true })), withCta);
  assert.doesNotMatch(without, /#book|Book a Call/);
  assert.match(without, /href="https:\/\/www\.trendcandy\.io\/"/);
  assert.match(without, /src="\/images\/trendcandy-logo-tight\.png"[^>]*width="896"[^>]*height="379"/);
});

test("root and /google keep the default Header", () => {
  for (const page of ["src/app/page.tsx", "src/app/google/page.tsx"]) {
    assert.match(read(page), /<Header \/>/);
  }
});

// --- /thanks page ------------------------------------------------------------------

const thanksHtml = renderToStaticMarkup(createElement(thanks.default));

test("/thanks metadata replaces the booking title/description and is noindex", () => {
  const { metadata } = thanks;
  assert.equal(metadata.title, "You're booked");
  assert.doesNotMatch(metadata.description, /Book a/i);
  assert.match(metadata.description, /Dream Headlines Session/);
  assert.deepEqual(metadata.robots, { index: false, follow: false });
});

test("/thanks renders no booking CTA, anchor, embed or Calendly reference", () => {
  assert.doesNotMatch(thanksHtml, /calendly/i);
  assert.doesNotMatch(thanksHtml, /#book|Book a Call|Book a Dream/i);
  assert.doesNotMatch(thanksHtml, /<form|<button|<iframe/);
  const source = read("src/app/thanks/page.tsx");
  assert.doesNotMatch(source, /CalendlyEmbed|FloatingCTA|BookSection|HeroSection|useMegaLeadForm|useTracking|MegaTag|dataLayer/);
});

test("/thanks carries the confirmation, next steps and preparation copy", () => {
  const text = thanksHtml.replace(/<[^>]+>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, " ");
  for (const copy of [
    "You're booked.",
    "Your Dream Headlines Session is on the calendar.",
    "30 minutes · No commitment · Free survey concepts",
    "Justin",
    "calendar invite",
    "work calendar",
    "reminders by email",
    "goals",
    "audience",
    "headlines you wish you owned",
    "Visit trendcandy.io",
  ]) {
    assert.ok(text.includes(copy), `missing copy: ${copy}`);
  }
  assert.doesNotMatch(text, /[–—]/, "no en/em dashes in visitor copy");
});

test("/thanks links out only to the main site and keeps the header logo link", () => {
  const hrefs = [...thanksHtml.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length > 0);
  for (const href of hrefs) assert.match(href, /^https:\/\/www\.trendcandy\.io\/?$/);
});

test("no sitemap is created for /thanks", () => {
  for (const file of ["src/app/sitemap.ts", "src/app/sitemap.xml", "public/sitemap.xml"]) {
    assert.throws(() => read(file));
  }
});

test("/thanks uses its legal-only footer, not the booking pages' marketing Footer", () => {
  const source = read("src/app/thanks/page.tsx");
  assert.doesNotMatch(source, /components\/Footer"/);
  assert.match(source, /<ThanksFooter \/>/);
  const footer = thanksHtml.match(/<footer[^>]*>[\s\S]*<\/footer>/)?.[0] ?? "";
  assert.match(footer, /© \d{4} TrendCandy\. All rights reserved\./);
  assert.doesNotMatch(thanksHtml, /\bB2B\b|\bAI\b|thought-leadership/i, "no inherited marketing line");
  assert.doesNotMatch(footer, /<img/, "the header logo is the only logo");
});
