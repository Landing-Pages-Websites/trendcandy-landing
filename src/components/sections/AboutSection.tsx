"use client";

import { Reveal } from "@/components/Reveal";
import { AUTHORITY, BRAND, WHO_FOR } from "@/lib/content";

export function AboutSection() {
  return (
    <section id="about" className="relative bg-[var(--color-surface)] py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
        <Reveal>
          <p className="eyebrow">About TrendCandy</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-ink)] mt-4 leading-tight">
            Built by a content marketer who got tired of waiting on data.
          </h2>
          <p className="text-lg text-[var(--color-ink-muted)] mt-5 leading-relaxed">
            {AUTHORITY.name} spent a decade running survey research and
            content programs inside one of B2B&apos;s most cited research
            engines. He started {BRAND.name} to bring that same headline-grade
            survey work to brands without a research team — at a budget that
            makes sense for a marketing department, not a McKinsey engagement.
          </p>

          <ul className="mt-7 space-y-3">
            {AUTHORITY.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <svg
                  className="mt-1 w-5 h-5 text-[var(--color-primary)] flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-[var(--color-ink-muted)] leading-relaxed">{b}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href="#book"
              className="btn-glow inline-flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 rounded-full font-semibold text-base transition shadow-sm"
            >
              {AUTHORITY.cta}
            </a>
            <a
              href={BRAND.parentSite}
              className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4 decoration-2 decoration-[var(--color-primary)]/40 transition"
            >
              Visit trendcandy.io
            </a>
          </div>
        </Reveal>

        {/* Who this IS / IS NOT for */}
        <Reveal delay={120}>
          <div className="bg-[var(--color-surface-alt)] border border-[var(--color-line)] rounded-3xl p-7 sm:p-9 shadow-sm">
            <p className="eyebrow">Who this is for</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] mt-3 leading-snug">
              We&apos;re for brands that want to <span className="underline-brush">publish</span> data — not just collect it.
            </h3>
            <div className="grid sm:grid-cols-2 gap-5 mt-7">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600 mb-3">
                  YES — a fit
                </p>
                <ul className="space-y-3">
                  {WHO_FOR.yes.map((y) => (
                    <li key={y} className="flex gap-2 text-sm text-[var(--color-ink)] leading-relaxed">
                      <svg className="mt-0.5 w-4 h-4 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{y}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-primary)] mb-3">
                  NOT a fit
                </p>
                <ul className="space-y-3">
                  {WHO_FOR.no.map((n) => (
                    <li key={n} className="flex gap-2 text-sm text-[var(--color-ink-muted)] leading-relaxed">
                      <svg className="mt-0.5 w-4 h-4 text-[var(--color-primary)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
