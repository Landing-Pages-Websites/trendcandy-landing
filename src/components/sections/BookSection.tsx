"use client";

import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { Reveal } from "@/components/Reveal";

/**
 * Booking section — Calendly is the page's ONLY CTA (task 346346fc).
 * The previous lead-form gateway was removed per the original LP directive
 * ("no form — embed Justin's Calendly as the only CTA"). All page CTAs point
 * to #book and land here on Justin's inline Calendly booker.
 */
export function BookSection() {
  return (
    <section id="book" className="relative bg-[var(--color-surface)] py-20 sm:py-24 scroll-mt-20">
      <div className="aurora-warm pointer-events-none opacity-60" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10">
        <Reveal className="text-center max-w-3xl mx-auto mb-10">
          <p className="eyebrow justify-center">Book a Call</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-ink)] mt-4 leading-tight">
            Today&apos;s the day you create better content.
          </h2>
          <p className="text-lg text-[var(--color-ink-muted)] mt-5">
            Grab a time below for your 30-minute Dream Headlines session with
            Justin. We&apos;ll come to the call with 2-3 survey concepts
            tailored to your category — plus the headlines each one is built to
            produce. No brand ever became a thought leader by pointing to
            someone else&apos;s thought leadership.
          </p>
          <p className="text-sm text-[var(--color-ink-muted)] mt-3">
            30 minutes · No commitment · Free survey concepts
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="bg-white/97 backdrop-blur rounded-3xl shadow-2xl shadow-black/15 border border-[var(--color-line)] p-4 sm:p-6 max-w-4xl mx-auto">
            <CalendlyEmbed />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
