"use client";

import { Reveal } from "@/components/Reveal";
import { PROBLEMS, BRAND } from "@/lib/content";

/**
 * "Content Black Hole" problem framing — sets up why original survey data
 * is the only thing that consistently breaks through right now.
 */
export function ProblemSection() {
  return (
    <section id="content-black-hole" className="relative bg-[var(--color-surface)] py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="max-w-3xl mx-auto text-center mb-12">
          <p className="eyebrow justify-center">The Content Black Hole</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-ink)] mt-4 leading-tight">
            Most B2B content disappears the day it&apos;s published.
          </h2>
          <p className="text-lg text-[var(--color-ink-muted)] mt-5 leading-relaxed">
            Generic LLM-written posts. Opinion blogs nobody links to. PDFs that
            never get cited. Without an original-data hook, your content
            marketing keeps shouting into a void — while AI-search and the
            press keep citing the brands that bring numbers.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="h-full bg-[var(--color-surface-alt)] border border-[var(--color-line)] rounded-3xl p-7 hover:shadow-lg transition">
                <div className="text-3xl font-extrabold text-[var(--color-primary)] mb-3">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-xl font-bold text-[var(--color-ink)] mb-3">
                  {p.title}
                </h3>
                <p className="text-[var(--color-ink-muted)] leading-relaxed">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Dual CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <a
            href="#book"
            className="btn-glow inline-flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 rounded-full font-semibold text-base transition shadow-sm"
          >
            {BRAND.primaryCtaLabel}
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4 decoration-2 decoration-[var(--color-primary)]/40 transition"
          >
            See how a survey becomes a year of content
          </a>
        </div>
      </div>
    </section>
  );
}
