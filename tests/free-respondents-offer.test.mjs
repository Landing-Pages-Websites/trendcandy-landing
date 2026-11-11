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

/** The JSX line holding the offer text, guarded by the showOffer flag. */
function offerParagraph(source) {
  const match = source.match(/\{showOffer && \(\s*<p className="([^"]+)">\s*\{(\w+)\}\s*<\/p>\s*\)\}/);
  assert.ok(match, "offer paragraph is rendered only behind showOffer");
  assert.ok(source.includes(`const ${match[2]} = "${OFFER}";`), "offer text is exact");
  return { classes: match[1], index: match.index };
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
  const { classes, index } = offerParagraph(hero);
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
