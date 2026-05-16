"use client";

import { Reveal } from "@/components/Reveal";
import { DELIVERABLES, BRAND } from "@/lib/content";

export function DeliverablesSection() {
  return (
    <section id="deliverables" className="relative bg-[var(--color-surface)] py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="max-w-3xl mx-auto text-center mb-12">
          <p className="eyebrow justify-center">Done-for-you</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-ink)] mt-4 leading-tight">
            Everything you need to ship a year of survey-backed content.
          </h2>
          <p className="text-lg text-[var(--color-ink-muted)] mt-5">
            TrendCandy delivers the data and the headlines. Your team ships
            the campaigns.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DELIVERABLES.map((d, i) => (
            <Reveal key={d.title} delay={i * 60}>
              <div className="h-full bg-[var(--color-surface-alt)] border border-[var(--color-line)] rounded-3xl p-7 hover:shadow-lg hover:-translate-y-0.5 transition">
                <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary-100)] text-[var(--color-primary)] flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5"
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
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">
                  {d.title}
                </h3>
                <p className="text-[var(--color-ink-muted)] leading-relaxed text-[15px]">
                  {d.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <a
            href="#book"
            className="btn-glow inline-flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 rounded-full font-semibold text-base transition shadow-sm"
          >
            {BRAND.primaryCtaLabel}
          </a>
          <a
            href="#guarantee"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4 decoration-2 decoration-[var(--color-primary)]/40 transition"
          >
            Read the Dream Headlines guarantee
          </a>
        </div>
      </div>
    </section>
  );
}
