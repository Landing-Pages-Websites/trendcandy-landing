// Run with: node --test tests/privacy-links.test.mjs  (Node >= 22.18)
// Privacy Policy links beside the Calendly booking widget and in the shared
// footer. Source files are transpiled with the repo's own TypeScript and
// server-rendered with next/* stubbed. No network, no widget, no booking.
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
const PRIVACY_PATH = "/privacy-policy";
const PRIVACY_LINK = /<a\b[^>]*href="\/privacy-policy"[^>]*>([^<]*)<\/a>/g;
const DESTINATIONS = ["meta", "google"];
const ROUTING_URLS = {
  meta: "https://calendly.com/d/dwqf-y9m-tcg",
  google: "https://calendly.com/d/dt8q-7c7-9vm",
};
// Readable type, a 44px touch target, and visible hover/focus states.
const REQUIRED_LINK_CLASSES = ["text-sm", "min-h-11", "underline", "focus-visible:outline-2"];

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

/** Transpile src/ entry modules to ESM in a temp dir and import them. */
async function loadSources(entries) {
  const dir = mkdtempSync(join(tmpdir(), "privacy-links-"));
  for (const [spec, body] of Object.entries(STUBS)) writeFileSync(stubFile(dir, spec), body);
  const done = new Set();
  for (const entry of entries) emitSource(dir, entry, done);
  try {
    return await Promise.all(entries.map((entry) => import(pathToFileURL(join(dir, `${entry}.mjs`)).href)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const [embed, footer] = await loadSources(["components/CalendlyEmbed", "components/Footer"]);

const renderEmbed = (destination) =>
  renderToStaticMarkup(createElement(embed.CalendlyEmbed, { destination }));
const renderFooter = () => renderToStaticMarkup(createElement(footer.Footer));
const privacyLinks = (html) => [...html.matchAll(PRIVACY_LINK)];

function assertPrivacyLink([tag, text]) {
  assert.equal(text, "Privacy Policy");
  assert.match(tag, /target="_blank"/);
  assert.match(tag, /rel="noopener noreferrer"/);
  const classes = tag.match(/class="([^"]*)"/)[1].split(/\s+/);
  for (const required of REQUIRED_LINK_CLASSES) assert.ok(classes.includes(required), `missing ${required}`);
}

for (const destination of DESTINATIONS) {
  test(`${destination} embed renders exactly one Privacy Policy link, above the widget`, () => {
    const html = renderEmbed(destination);
    const links = privacyLinks(html);
    assert.equal(links.length, 1);
    assertPrivacyLink(links[0]);
    assert.ok(links[0].index < html.indexOf("calendly-inline-widget"), "link precedes the widget");
  });

  test(`${destination} embed keeps its widget, fallback link and adds no form controls`, () => {
    const html = renderEmbed(destination);
    assert.doesNotMatch(html, /<(input|button|select|textarea|form)\b/);
    assert.match(html, /class="calendly-inline-widget w-full h-\[1000px\] md:h-\[720px\] rounded-2xl overflow-hidden"/);
    assert.match(html, /aria-label="Choose a time for your Dream Headlines session"/);
    assert.ok(html.includes(`href="${ROUTING_URLS[destination]}"`), "fallback keeps the routing form URL");
    assert.match(html, /Open it in a new tab/);
  });
}

test("footer renders exactly one Privacy Policy link and keeps its existing content", () => {
  const html = renderFooter();
  const links = privacyLinks(html);
  assert.equal(links.length, 1);
  assertPrivacyLink(links[0]);
  assert.match(html, /<footer id="legal"/);
  assert.match(html, /alt="TrendCandy"/);
  assert.match(html, /Done-for-you B2B survey research that becomes a year of thought-leadership content,/);
  assert.match(html, /All rights reserved\./);
  assert.match(html, /<a href="https:\/\/www\.trendcandy\.io" class="hover:text-white underline">www\.trendcandy\.io<\/a>/);
  assert.doesNotMatch(html, /<(input|button|select|textarea|form)\b/);
});

test("privacy links point at the existing TrendCandy policy covering booking details", () => {
  const policy = read(`src/app${PRIVACY_PATH}/page.tsx`);
  assert.match(policy, /<h1[^>]*>Privacy Policy<\/h1>/);
  assert.match(policy, /Welcome to TrendCandy/);
  assert.match(policy, /<li>Name<\/li>/);
  assert.match(policy, /<li>Email address<\/li>/);
  assert.match(policy, /<li>Company or role details you choose to provide<\/li>/);
});
