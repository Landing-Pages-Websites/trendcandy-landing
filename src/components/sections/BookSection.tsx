"use client";

import { FormCard } from "@/components/FormCard";
import { Reveal } from "@/components/Reveal";
import { BRAND } from "@/lib/content";

/**
 * Booking section — form is the gateway. On submit, the FormCard swaps in
 * the Calendly inline embed (prefilled with name + email). Per customer
 * directive 2026-05-14, every fill posts to Keystone — no on-page qualifying.
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
            Tell us a bit about your brand and we&apos;ll come to the call with
            2-3 survey concepts tailored to your category — plus the
            headlines each one is built to produce. No brand ever became a
            thought leader by pointing to someone else&apos;s thought leadership.
          </p>
          <p className="text-sm text-[var(--color-ink-muted)] mt-3">
            Want to skip the form?{" "}
            <a
              href={BRAND.calendlyUrl}
              className="text-[var(--color-primary)] font-semibold underline underline-offset-4 hover:text-[var(--color-primary-hover)]"
            >
              Go directly to Justin&apos;s calendar
            </a>
            .
          </p>
        </Reveal>

        <Reveal delay={120}>
          <FormCard variant="hero" idSuffix="book" />
        </Reveal>
      </div>
    </section>
  );
}
