// Run with: node --test tests/free-respondents-offer.test.mjs  (Node >= 22.18)
// Root-only "50 free survey respondents" offer line. Source-level checks: the
// root page opts in, the shared sections default the offer off, and /google
// and /thanks never render it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OFFER = "Book a call, get 50 free survey respondents";
const HELPER = "30 minutes · No commitment · Free survey concepts";
const OFFER_TONE = "font-semibold text-[var(--color-primary)]";

const read = (path) => readFileSync(join(ROOT, path), "utf8");

/** The JSX line holding the offer constant, guarded by the showOffer flag. */
function offerParagraph(source) {
  const match = source.match(/\{showOffer && \(\s*<p className="([^"]+)">\s*\{(\w+)\}\s*<\/p>\s*\)\}/);
  assert.ok(match, "offer paragraph is rendered only behind showOffer");
  return { classes: match[1], name: match[2], index: match.index };
}

test("root page opts both sections into the offer", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /<HeroSection showVsl showOffer \/>/);
  assert.match(page, /<BookSection booking="calendly" showOffer \/>/);
});

test("/google and /thanks never show the offer", () => {
  for (const path of ["src/app/google/page.tsx", "src/app/thanks/page.tsx"]) {
    const source = read(path);
    assert.ok(!source.includes("showOffer"), `${path} does not opt in`);
    assert.ok(!source.includes(OFFER), `${path} has no offer copy`);
  }
});

test("hero offer: default off, xs semibold orange, directly below the helper", () => {
  const hero = read("src/components/sections/HeroSection.tsx");
  assert.match(hero, /showOffer = false/);
  const { classes, name, index } = offerParagraph(hero);
  assert.ok(hero.includes(`const ${name} = "${OFFER}";`), "offer text is exact");
  assert.ok(classes.includes("text-xs") && classes.includes(OFFER_TONE));
  const helper = hero.indexOf("{BRAND.ctaSubLabel}");
  assert.ok(helper > 0 && helper < index, "offer follows the helper line");
  assert.ok(hero.slice(helper, index).includes("</p>"), "helper paragraph closes before offer");
});

test("booking offer: default off, sm semibold orange, directly below the helper", () => {
  const book = read("src/components/sections/BookSection.tsx");
  assert.match(book, /showOffer = false/);
  assert.equal(book.split(HELPER).length - 1, 1, "helper line is unchanged");
  const { classes, index } = offerParagraph(book);
  assert.ok(classes.includes("text-sm") && classes.includes(OFFER_TONE));
  const helper = book.indexOf(HELPER);
  assert.ok(helper < index && !book.slice(helper, index).includes("<p"), "nothing between");
});

test("booking offer: exact wording, last two words bound so neither strands alone", () => {
  const book = read("src/components/sections/BookSection.tsx");
  // Ordinary spaces only: renders as OFFER, with "survey respondents" kept on one line.
  assert.match(
    book,
    /const OFFER_LABEL = \(\s*<>\s*Book a call, get 50 free\{" "\}\s*<span className="whitespace-nowrap">survey respondents<\/span>\s*<\/>\s*\);/,
  );
  assert.equal(book.split("whitespace-nowrap").length - 1, 1, "exactly one bound group");
});

test("hero 8x stat: root only binds \"data-backed\" so it never splits at the hyphen", () => {
  const hero = read("src/components/sections/HeroSection.tsx");
  const content = read("src/lib/content.ts");
  assert.ok(
    content.includes('{ value: "8x", label: "more engagement on data-backed content vs opinion posts" }'),
    "sourced stat copy is unchanged",
  );
  // Opt-in only: /google (showOffer=false) keeps rendering the plain stat.label.
  assert.ok(hero.includes('const BOUND_PHRASE = "data-backed";'));
  assert.ok(hero.includes("showOffer && stat.label.includes(BOUND_PHRASE) ?"));
  assert.ok(hero.includes('<span className="whitespace-nowrap">{BOUND_PHRASE}</span>'));
  assert.match(hero, /:\s*\(\s*stat\.label\s*\)\}/, "falls back to the plain label");
  const stats = hero.slice(hero.indexOf("{/* Stats row */}"));
  assert.equal(stats.split("whitespace-nowrap").length - 1, 1, "only this phrase is bound in the stats");
});
