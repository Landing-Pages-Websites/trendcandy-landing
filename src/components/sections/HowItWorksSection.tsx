"use client";

import { Reveal } from "@/components/Reveal";
import { HOW_IT_WORKS, BRAND } from "@/lib/content";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative bg-[var(--color-surface-alt)] py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="max-w-3xl mx-auto text-center mb-12">
          <p className="eyebrow justify-center">How it works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-ink)] mt-4 leading-tight">
            One survey. A year of superior content.
          </h2>
          <p className="text-lg text-[var(--color-ink-muted)] mt-5">
            From kickoff to a published headline bank in 2-3 weeks — without
            you writing a single research question.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 relative">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.step} delay={i * 100}>
              <div className="h-full bg-white border border-[var(--color-line)] rounded-3xl p-7 shadow-sm hover:shadow-lg transition relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white text-lg font-extrabold flex items-center justify-center">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-ink)]">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[var(--color-ink-muted)] leading-relaxed">
                  {step.body}
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
            href="#deliverables"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4 decoration-2 decoration-[var(--color-primary)]/40 transition"
          >
            See what you actually get
          </a>
        </div>
      </div>
    </section>
  );
}
