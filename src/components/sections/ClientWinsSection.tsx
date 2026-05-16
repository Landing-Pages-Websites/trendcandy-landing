"use client";

import { Reveal } from "@/components/Reveal";
import { RESULTS, BRAND } from "@/lib/content";

export function ClientWinsSection() {
  return (
    <section id="client-wins" className="relative bg-[var(--color-surface-dark)] text-white py-20 sm:py-24 overflow-hidden">
      {/* warm accent glow */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(45% 45% at 20% 30%, rgba(255,105,25,0.5), transparent 60%), radial-gradient(40% 45% at 80% 70%, rgba(105,193,225,0.45), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <Reveal className="max-w-3xl mx-auto text-center mb-12">
          <p className="eyebrow eyebrow-on-dark justify-center">Client wins</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 leading-tight">
            Survey-backed content that won the year.
          </h2>
          <p className="text-lg text-white/75 mt-5">
            A snapshot of campaigns built on TrendCandy survey data — from
            tier-1 media coverage to category-leading lead-gen pieces.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RESULTS.map((r, i) => (
            <Reveal key={r.headline} delay={i * 70}>
              <div className="h-full bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 hover:bg-white/8 hover:border-[var(--color-primary)]/40 transition">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center mb-4">
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-lg sm:text-xl font-bold leading-snug">
                  {r.headline}
                </p>
                <p className="text-sm text-white/65 mt-2 leading-relaxed">
                  {r.context}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <a
            href="#book"
            className="btn-glow inline-flex items-center bg-white hover:bg-white/95 text-[var(--color-primary)] px-6 py-3 rounded-full font-semibold text-base transition shadow-lg"
          >
            {BRAND.primaryCtaLabel}
          </a>
          <a
            href="#about"
            className="text-sm font-semibold text-white hover:text-[var(--color-primary-200)] underline underline-offset-4 decoration-2 decoration-white/60 transition"
          >
            Meet the founder
          </a>
        </div>
      </div>
    </section>
  );
}
