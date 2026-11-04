import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookedMark } from "@/components/thanks/BookedMark";
import { ThanksNextSteps } from "@/components/thanks/ThanksNextSteps";
import { ThanksPrep } from "@/components/thanks/ThanksPrep";
import { AUTHORITY, BRAND } from "@/lib/content";

// Post-booking confirmation (Atlas 12b337ca). Reached only after Calendly
// confirms a booking; deliberately emits no conversion events of its own
// and carries no booking CTA. Kept out of search results.
export const metadata: Metadata = {
  title: "You're booked",
  description:
    "Your Dream Headlines Session with TrendCandy is on the calendar. Here's what happens next and how to prepare for the call.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThanksPage(): React.JSX.Element {
  return (
    <>
      <Header showBookingCta={false} />
      <main className="flex-1 bg-[var(--color-surface-alt)] pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <section id="confirmation" aria-labelledby="confirmation-title">
            <BookedMark />
            <h1
              id="confirmation-title"
              className="mt-8 text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] text-[var(--color-ink)] sm:text-6xl lg:text-7xl"
            >
              You&apos;re booked.
            </h1>
            <p className="mt-5 max-w-[30ch] text-balance text-xl font-medium leading-snug text-[var(--color-ink)] sm:text-2xl">
              Your Dream Headlines Session is on the calendar.
            </p>
            <p className="mt-6 text-base leading-[1.65] text-[var(--color-ink-muted)]">
              A call with {AUTHORITY.name}, founder&nbsp;of&nbsp;{BRAND.name}.
            </p>
            <p className="mt-1 text-balance text-sm font-semibold text-[var(--color-primary-700)]">{BRAND.ctaSubLabel}</p>
          </section>

          <ThanksNextSteps />
          <ThanksPrep />

          <p className="mt-12 text-base leading-[1.65] text-[var(--color-ink-muted)]">
            Want to look around before the call?{" "}
            <a
              href={BRAND.parentSite}
              rel="noopener"
              className="rounded-sm font-semibold text-[var(--color-primary-700)] underline decoration-2 decoration-[var(--color-primary)]/40 underline-offset-4 transition-colors duration-200 hover:text-[var(--color-primary-800)] hover:decoration-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
            >
              Visit trendcandy.io
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
