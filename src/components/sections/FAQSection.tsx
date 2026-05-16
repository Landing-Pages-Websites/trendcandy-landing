"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { FAQS, BRAND } from "@/lib/content";

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative bg-[var(--color-surface-alt)] py-20 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12">
          <p className="eyebrow justify-center">FAQ</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-ink)] mt-4 leading-tight">
            Questions content teams ask before booking.
          </h2>
          <p className="text-lg text-[var(--color-ink-muted)] mt-5">
            If yours isn&apos;t answered here, ask Justin on the call — he&apos;d rather you have the right answer than a polished pitch.
          </p>
        </Reveal>

        <Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={faq.question}
                  className="bg-white border border-[var(--color-line)] rounded-2xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-[var(--color-ink)] pr-4">
                      {faq.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary)] flex items-center justify-center transition-transform ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                      aria-hidden
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 -mt-1 text-[var(--color-ink-muted)] leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <a
            href="#book"
            className="btn-glow inline-flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 rounded-full font-semibold text-base transition shadow-sm"
          >
            {BRAND.primaryCtaLabel}
          </a>
          <a
            href="#hero"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4 decoration-2 decoration-[var(--color-primary)]/40 transition"
          >
            Back to the top
          </a>
        </div>
      </div>
    </section>
  );
}
