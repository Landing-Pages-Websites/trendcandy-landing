// Run with: node --test tests/google-direct-booking.test.mjs  (Node >= 22.18)
// Direct-booking /google: CalendlyEmbed is transpiled with the repo's own
// TypeScript, next/script is stubbed, and every Calendly message below is a
// local fixture object. No network, no real widget, no booking is created.
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
const GOOGLE_BASE = "https://calendly.com/trendcandy/trendcandy-google";
const META_BASE = "https://calendly.com/trendcandy/trendcandy-call-meta";
const EMBED_OPTIONS = "hide_event_type_details=0&hide_gdpr_banner=1";
const CALENDLY_ORIGIN = "https://calendly.com";

const read = (path) => readFileSync(join(ROOT, path), "utf8");

/** Transpile CalendlyEmbed.tsx to ESM with resolvable imports and load it. */
async function loadCalendlyEmbed() {
  const dir = mkdtempSync(join(tmpdir(), "calendly-embed-"));
  const scriptStub = join(dir, "next-script.mjs");
  writeFileSync(scriptStub, "export default function Script() { return null; }\n");
  const specifiers = {
    "next/script": pathToFileURL(scriptStub).href,
    "@/lib/content": pathToFileURL(join(ROOT, "src/lib/content.ts")).href,
    "@/lib/googleCalendly": pathToFileURL(join(ROOT, "src/lib/googleCalendly.ts")).href,
    react: import.meta.resolve("react"),
    "react/jsx-runtime": import.meta.resolve("react/jsx-runtime"),
  };
  const { outputText } = ts.transpileModule(read("src/components/CalendlyEmbed.tsx"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const source = outputText.replace(/from "([^"]+)"/g, (match, spec) =>
    specifiers[spec] ? `from "${specifiers[spec]}"` : match,
  );
  const file = join(dir, "CalendlyEmbed.mjs");
  writeFileSync(file, source);
  try {
    return await import(pathToFileURL(file).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const embed = await loadCalendlyEmbed();

/** Run fn with a fake browser location/storage, restoring globals afterwards. */
function withBrowser({ search = "", session = {}, local = {} }, fn) {
  const store = (items) => ({ getItem: (key) => items[key] ?? null });
  const saved = ["window", "sessionStorage", "localStorage"].map((key) => [
    key,
    Object.getOwnPropertyDescriptor(globalThis, key),
  ]);
  const define = (key, value) =>
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  define("window", { location: { search } });
  define("sessionStorage", store(session));
  define("localStorage", store(local));
  try {
    return fn();
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

const GOOGLE_VISIT = "?utm_source=google&utm_campaign=Q4&gclid=G1&gbraid=B1&wbraid=W1&fbclid=F&email=a%40b.com";

// --- Page wiring -------------------------------------------------------------

test("/google mounts the Google direct-booking section and no native form", () => {
  const page = read("src/app/google/page.tsx");
  assert.match(page, /<BookSection booking="calendly" destination="google" \/>/);
  assert.doesNotMatch(page, /FormCard|useMegaLeadForm|form_submi/);
});

test("/google keeps its hero without the VSL", () => {
  const page = read("src/app/google/page.tsx");
  assert.match(page, /<HeroSection \/>/);
  assert.doesNotMatch(page, /showVsl/);
});

test("root keeps the Meta direct-booking section and its VSL", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /<BookSection booking="calendly" \/>/);
  assert.match(page, /<HeroSection showVsl \/>/);
});

test("BookSection defaults stay form-first and Meta", () => {
  const section = read("src/components/sections/BookSection.tsx");
  assert.match(section, /booking = "form"/);
  assert.match(section, /destination = "meta"/);
});

// --- Destinations ------------------------------------------------------------

test("Google iframe URL forwards current attribution only, with embed options", () => {
  const url = withBrowser({ search: GOOGLE_VISIT }, () => embed.resolveEmbedUrl("google"));
  assert.equal(
    url,
    `${GOOGLE_BASE}?utm_source=google&utm_campaign=Q4&gclid=G1&gbraid=B1&wbraid=W1&${EMBED_OPTIONS}`,
  );
});

test("Google fallback URL forwards the same attribution without embed options", () => {
  const url = withBrowser({ search: GOOGLE_VISIT }, () => embed.resolveBookingUrl("google"));
  assert.equal(url, `${GOOGLE_BASE}?utm_source=google&utm_campaign=Q4&gclid=G1&gbraid=B1&wbraid=W1`);
});

test("current URL attribution wins over stored attribution", () => {
  const visit = {
    search: "?gclid=CURRENT",
    session: { landing_params: "?gclid=SESSION&utm_source=old" },
    local: { _mega_attr: JSON.stringify({ gclid: "LOCAL" }) },
  };
  assert.equal(
    withBrowser(visit, () => embed.resolveEmbedUrl("google")),
    `${GOOGLE_BASE}?gclid=CURRENT&${EMBED_OPTIONS}`,
  );
});

test("falls back to session landing_params, then local _mega_attr", () => {
  const session = { landing_params: "?gbraid=SESSION" };
  const local = { _mega_attr: JSON.stringify({ wbraid: "LOCAL" }) };
  assert.equal(
    withBrowser({ session, local }, () => embed.resolveBookingUrl("google")),
    `${GOOGLE_BASE}?gbraid=SESSION`,
  );
  assert.equal(
    withBrowser({ local }, () => embed.resolveBookingUrl("google")),
    `${GOOGLE_BASE}?wbraid=LOCAL`,
  );
});

test("Google with no attribution anywhere uses the bare Google page", () => {
  assert.equal(withBrowser({}, () => embed.resolveEmbedUrl("google")), `${GOOGLE_BASE}?${EMBED_OPTIONS}`);
  assert.equal(withBrowser({}, () => embed.resolveBookingUrl("google")), GOOGLE_BASE);
});

test("Meta destination is unchanged and ignores Google params", () => {
  const visit = { search: GOOGLE_VISIT, session: { landing_params: "?gclid=S" } };
  assert.equal(withBrowser(visit, () => embed.resolveEmbedUrl("meta")), `${META_BASE}?${EMBED_OPTIONS}`);
  assert.equal(withBrowser(visit, () => embed.resolveBookingUrl("meta")), META_BASE);
});

// --- Server markup -----------------------------------------------------------

const renderEmbed = (props) => renderToStaticMarkup(createElement(embed.CalendlyEmbed, props));

test("Google embed renders a labelled region with a Google fallback link", () => {
  const html = renderEmbed({ destination: "google" });
  assert.match(html, /role="region"/);
  assert.match(html, /aria-label="Choose a time for your Dream Headlines session"/);
  assert.match(html, new RegExp(`href="${GOOGLE_BASE}"`));
  assert.doesNotMatch(html, /trendcandy-call-meta/);
  assert.doesNotMatch(html, /<form|<input|<button/);
});

test("default embed markup is identical to the explicit Meta destination", () => {
  const html = renderEmbed({});
  assert.equal(html, renderEmbed({ destination: "meta" }));
  assert.match(html, new RegExp(`href="${META_BASE}"`));
  assert.doesNotMatch(html, /trendcandy-google/);
});

// --- Lifecycle relay (fixtures only) -----------------------------------------

function fakeHost() {
  const frame = { contentWindow: { id: "calendly-frame" } };
  return { frame, host: { querySelector: (sel) => (sel === "iframe" ? frame : null) } };
}

test("accepts only Calendly-origin messages from the embedded iframe", () => {
  const { frame, host } = fakeHost();
  const ok = { origin: CALENDLY_ORIGIN, source: frame.contentWindow, data: { event: "calendly.date_and_time_selected" } };
  assert.equal(embed.readCalendlyEvent(ok, host), "calendly.date_and_time_selected");
  assert.equal(embed.readCalendlyEvent({ ...ok, origin: "https://evil.example" }, host), null);
  assert.equal(embed.readCalendlyEvent({ ...ok, source: {} }, host), null);
  assert.equal(embed.readCalendlyEvent({ ...ok, data: { event: "other.event" } }, host), null);
  assert.equal(embed.readCalendlyEvent(ok, { querySelector: () => null }), null);
});

test("relays lifecycle names and the booked payload unchanged", () => {
  const megaTagCalls = [];
  const win = {
    dataLayer: [],
    MegaTag: { trackEvent: (...args) => megaTagCalls.push(args) },
  };
  withBrowser({}, () => {
    Object.assign(globalThis.window, win);
    embed.relayCalendlyEvent("calendly.profile_page_viewed");
    embed.relayCalendlyEvent("calendly.event_scheduled");
    assert.deepEqual(globalThis.window.dataLayer, [
      { event: "calendly_event", calendly_step: "calendly.profile_page_viewed", form_provider: "trendcandy-landing" },
      { event: "calendly_event", calendly_step: "calendly.event_scheduled", form_provider: "trendcandy-landing" },
      { event: "calendly_booking_confirmed", form_provider: "trendcandy-landing" },
    ]);
  });
  assert.deepEqual(megaTagCalls, [["calendly_booked", { element: "calendly-inline", provider: "calendly" }]]);
});

// --- Widget initialization (fake Calendly, no network) -------------------------

test("initializes the Google widget once across onLoad + onReady", () => {
  const children = [];
  const host = { querySelector: (sel) => (sel === "iframe" ? children[0] ?? null : null) };
  const calls = [];
  const initInlineWidget = (opts) => {
    calls.push(opts);
    children.push({ tagName: "IFRAME" });
  };
  withBrowser({ search: "?gclid=G1" }, () => {
    globalThis.window.Calendly = { initInlineWidget };
    assert.equal(embed.initCalendlyWidget(host, "google"), true);
    assert.equal(embed.initCalendlyWidget(host, "google"), true);
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${GOOGLE_BASE}?gclid=G1&${EMBED_OPTIONS}`);
  assert.equal(calls[0].parentElement, host);
});

test("waits for Calendly's script and a host before initializing", () => {
  withBrowser({}, () => {
    assert.equal(embed.initCalendlyWidget({ querySelector: () => null }, "google"), false);
    globalThis.window.Calendly = { initInlineWidget: () => assert.fail("no host") };
    assert.equal(embed.initCalendlyWidget(null, "google"), false);
  });
});
