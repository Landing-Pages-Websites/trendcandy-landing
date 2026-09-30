// Run with: node --test tests/google-calendly.test.mjs  (Node >= 22.18 strips the helper's TS types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildGoogleCalendlyUrl,
  isGoogleLandingPath,
  readStoredAttribution,
} from "../src/lib/googleCalendly.ts";

const BASE = "https://calendly.com/trendcandy/trendcandy-google";
const NO_STORED = { landingParams: null, megaAttribution: null };

const build = (query, stored = NO_STORED) =>
  buildGoogleCalendlyUrl(BASE, new URLSearchParams(query), stored);

test("no params anywhere yields the bare Google URL", () => {
  assert.equal(build(""), BASE);
});

for (const clickId of ["gclid", "gbraid", "wbraid"]) {
  test(`forwards ${clickId} alone`, () => {
    assert.equal(build(`?${clickId}=abc-123_X`), `${BASE}?${clickId}=abc-123_X`);
  });
}

test("forwards every utm_* key with correct encoding and drops everything else", () => {
  const query =
    "?utm_source=google&utm_medium=cpc&utm_campaign=Spring%20Sale%2B2026" +
    "&utm_term=b2b+survey&utm_content=a%26b%3Dc&utm_id=42" +
    "&gclid=G1&email=a%40b.com&fbclid=F1&ref=x&source=y";
  const url = new URL(build(query));
  assert.equal(url.origin + url.pathname, BASE);
  assert.deepEqual([...url.searchParams], [
    ["utm_source", "google"],
    ["utm_medium", "cpc"],
    ["utm_campaign", "Spring Sale+2026"],
    ["utm_term", "b2b survey"],
    ["utm_content", "a&b=c"],
    ["utm_id", "42"],
    ["gclid", "G1"],
  ]);
  assert.match(url.search, /utm_campaign=Spring\+Sale%2B2026/);
  assert.match(url.search, /utm_content=a%26b%3Dc/);
});

test("drops empty values and repeated keys (first value wins)", () => {
  assert.equal(build("?utm_source=&gclid=A&gclid=B"), `${BASE}?gclid=A`);
});

test("never carries a hash or extra path into the destination", () => {
  const url = new URL(build("?gclid=A#section"));
  assert.equal(url.hash, "");
  assert.equal(url.pathname, "/trendcandy/trendcandy-google");
});

test("falls back to session landing_params when the URL is queryless", () => {
  const stored = { landingParams: "?utm_source=google&gbraid=GB&name=Jo", megaAttribution: null };
  assert.equal(build("", stored), `${BASE}?utm_source=google&gbraid=GB`);
});

test("falls back to _mega_attr, skipping nulls and non-strings", () => {
  const megaAttribution = JSON.stringify({
    utm_source: "google", utm_medium: null, utm_campaign: "Q3 push",
    gclid: "G9", wbraid: 7, fbclid: "F", fbp: "fb.1.x",
  });
  assert.equal(
    build("", { landingParams: null, megaAttribution }),
    `${BASE}?utm_source=google&utm_campaign=Q3+push&gclid=G9`,
  );
});

test("landing_params wins over _mega_attr", () => {
  const stored = {
    landingParams: "?gclid=SESSION",
    megaAttribution: JSON.stringify({ gclid: "PERSISTED" }),
  };
  assert.equal(build("", stored), `${BASE}?gclid=SESSION`);
});

test("stored sources without attribution keys are skipped", () => {
  const stored = {
    landingParams: "?fbclid=F&ref=x",
    megaAttribution: JSON.stringify({ gclid: "PERSISTED" }),
  };
  assert.equal(build("", stored), `${BASE}?gclid=PERSISTED`);
});

test("current URL values take precedence and are never mixed with stale storage", () => {
  const stored = {
    landingParams: "?utm_source=old&utm_campaign=old&gclid=OLD",
    megaAttribution: JSON.stringify({ utm_term: "old", wbraid: "OLD" }),
  };
  assert.equal(build("?utm_source=google", stored), `${BASE}?utm_source=google`);
});

test("corrupt _mega_attr is ignored without throwing", () => {
  for (const megaAttribution of ["{not json", "null", "\"str\"", "[1,2]"]) {
    assert.equal(build("", { landingParams: null, megaAttribution }), BASE);
  }
});

test("readStoredAttribution returns nulls when storage access throws", (t) => {
  const throwing = { get() { throw new Error("SecurityError"); }, configurable: true };
  t.after(() => {
    delete globalThis.sessionStorage;
    delete globalThis.localStorage;
  });
  Object.defineProperty(globalThis, "sessionStorage", throwing);
  Object.defineProperty(globalThis, "localStorage", throwing);
  assert.deepEqual(readStoredAttribution(), NO_STORED);
});

test("readStoredAttribution reads both stores read-only", (t) => {
  const store = (value) => ({
    getItem: () => value,
    setItem: () => assert.fail("must not write"),
    removeItem: () => assert.fail("must not write"),
  });
  t.after(() => {
    delete globalThis.sessionStorage;
    delete globalThis.localStorage;
  });
  Object.defineProperty(globalThis, "sessionStorage", { value: store("?gclid=A"), configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: store("{}"), configurable: true });
  assert.deepEqual(readStoredAttribution(), { landingParams: "?gclid=A", megaAttribution: "{}" });
});

test("readStoredAttribution tolerates missing storage (SSR/unsupported)", () => {
  assert.deepEqual(readStoredAttribution(), NO_STORED);
});

test("isGoogleLandingPath matches /google only", () => {
  assert.equal(isGoogleLandingPath("/google"), true);
  assert.equal(isGoogleLandingPath("/google/"), true);
  assert.equal(isGoogleLandingPath("/"), false);
  assert.equal(isGoogleLandingPath("/google-ads"), false);
  assert.equal(isGoogleLandingPath("/privacy-policy"), false);
});
