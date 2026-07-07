"use client";

import { Reveal } from "@/components/Reveal";
import { TypewriterCycle } from "@/components/TypewriterCycle";
import { BRAND, HERO_STATS } from "@/lib/content";

/**
 * Hero — TrendCandy.
 *   - Big editorial headline + sub
 *   - Sky-to-peach gradient with warm aurora glow (brand colors)
 *   - Top stats strip
 *   - Dual CTA — primary "Book a Dream Headlines Session" + secondary "See client wins"
 */
export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-28 pb-20 sm:pt-32 lg:pt-36 lg:pb-28 bg-[var(--color-surface-alt)]"
    >
      <div className="aurora-warm pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <Reveal className="max-w-4xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--color-line)] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--color-primary)]">
            <span className="dot-pulse" aria-hidden />
            <span>Done-For-You B2B Survey Data</span>
          </div>

          <h1 className="text-[2.4rem] sm:text-5xl lg:text-[3.8rem] xl:text-[4.4rem] font-extrabold leading-[1.04] tracking-tight text-[var(--color-ink)]">
            Make survey data that becomes your{" "}
            <TypewriterCycle
              phrases={[
                "content asset",
                "AI-search citation",
                "PR magnet",
                "sales narrative",
                "category POV",
              ]}
              className="underline-brush text-[var(--color-primary)] whitespace-nowrap"
            />
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-ink-muted)] max-w-3xl mx-auto leading-relaxed">
            We run the survey, find the headline stats, and turn them into the content your team publishes all year — and AI search engines cite.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 pt-2">
            <a
              href="#book"
              className="btn-glow inline-flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-7 py-4 rounded-full font-semibold text-base sm:text-lg transition shadow-lg shadow-[var(--color-primary)]/30"
            >
              {BRAND.primaryCtaLabel}
              <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="#client-wins"
              className="text-base font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4 decoration-2 decoration-[var(--color-primary)]/40 transition"
            >
              See client wins
            </a>
          </div>

          <p className="text-xs text-[var(--color-ink-muted)] pt-1">
            {BRAND.ctaSubLabel}
          </p>
        </Reveal>

        {/* Stats row */}
        <Reveal
          delay={140}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto"
        >
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[var(--color-line)] rounded-2xl px-6 py-5 text-center shadow-sm"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--color-primary)] tracking-tight">
                {stat.value}
              </div>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1 leading-snug">
                {stat.label}
              </p>
            </div>
          ))}
        </Reveal>
      </div>

      {/* Candy-strip accent at bottom */}
      <div className="candy-strip h-2 mt-12" aria-hidden />
    </section>
  );
}
