"use client";

import { CalendlyEmbed, type CalendlyDestination } from "@/components/CalendlyEmbed";
import { FormCard } from "@/components/FormCard";
import { Reveal } from "@/components/Reveal";

type BookSectionProps = {
  /**
   * "form" (default): two-step flow, the on-page lead form then a redirect to
   * Calendly. "calendly" (root page and /google): the visitor picks a time
   * directly in the inline Calendly widget, with no form.
   */
  booking?: "form" | "calendly";
  /** Calendly booking page for "calendly": Meta (default, root) or Google (/google). */
  destination?: CalendlyDestination;
};

const FORM_INTRO =
  "Two quick steps. First, tell us where to reach you below. Then pick a time for your 30-minute Dream Headlines session with Justin.";
const DIRECT_INTRO =
  "Pick a time below for your 30-minute Dream Headlines session with Justin.";
const INTRO_REMAINDER =
  "We'll come to the call with 2-3 survey concepts tailored to your category, plus the headlines each one is built to produce. No brand ever became a thought leader by pointing to someone else's thought leadership.";

/**
 * Booking section: the page's primary CTA target. All page CTAs point to
 * #book and land on the booking surface chosen by `booking`.
 */
export function BookSection({
  booking = "form",
  destination = "meta",
}: BookSectionProps): React.JSX.Element {
  const isDirect = booking === "calendly";
  return (
    <section className="relative overflow-hidden bg-[var(--color-surface)] py-20 sm:py-24">
      <div className="aurora-warm pointer-events-none opacity-60" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10">
        <Reveal className="text-center max-w-3xl mx-auto mb-10">
          <p className="eyebrow justify-center">Book a Call</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-ink)] mt-4 leading-tight">
            Today&apos;s the day you create better content.
          </h2>
          <p className="text-lg text-[var(--color-ink-muted)] mt-5">
            {`${isDirect ? DIRECT_INTRO : FORM_INTRO} ${INTRO_REMAINDER}`}
          </p>
          <p className="text-sm text-[var(--color-ink-muted)] mt-3">
            30 minutes · No commitment · Free survey concepts
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div id="book" className="max-w-2xl mx-auto scroll-mt-28">
            {isDirect ? (
              <CalendlyEmbed destination={destination} />
            ) : (
              <FormCard variant="hero" idSuffix="book" />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
