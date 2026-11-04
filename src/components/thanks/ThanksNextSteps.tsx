const NEXT_STEPS: { title: string; body: string }[] = [
  {
    title: "Check your inbox",
    body: "Your calendar invite is on its way to the email you booked with.",
  },
  {
    title: "Accept the invite",
    body: "Accept it so the call lands on your work calendar.",
  },
  {
    title: "Watch for reminders",
    body: "You'll get reminders by email before the call.",
  },
];

/** The three things that happen between booking and the call, in order. */
export function ThanksNextSteps(): React.JSX.Element {
  return (
    <section id="next-steps" aria-labelledby="next-steps-title" className="mt-16 border-t border-[var(--color-line)] pt-12 sm:mt-20 sm:pt-14">
      <h2 id="next-steps-title" className="text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        What happens next
      </h2>
      <ol className="mt-8 space-y-7">
        {NEXT_STEPS.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 sm:grid-cols-[3rem_1fr] sm:gap-x-5">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full border-2 border-[var(--color-primary-200)] bg-[var(--color-surface)] text-base font-bold text-[var(--color-primary-700)] sm:size-12 sm:text-lg"
            >
              {index + 1}
            </span>
            <div className="pt-1.5 sm:pt-2.5">
              <h3 className="text-lg font-semibold leading-snug text-[var(--color-ink)]">{step.title}</h3>
              <p className="mt-1 text-base leading-[1.65] text-[var(--color-ink-muted)]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
