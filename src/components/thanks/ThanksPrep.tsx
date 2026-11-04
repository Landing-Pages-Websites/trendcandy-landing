import { AUTHORITY } from "@/lib/content";

const FOUNDER_FIRST_NAME = AUTHORITY.name.split(" ")[0];

// Drawn from the "Discovery & survey strategy" step (HOW_IT_WORKS[0]) on the booking pages.
const BRING: { title: string; body: string }[] = [
  { title: "Your goals", body: "What you want your content to achieve." },
  { title: "Your audience", body: "Who you most want to reach." },
  { title: "The headlines you wish you owned", body: "The stories you'd love to see your brand behind." },
];

/** What to bring so the session's discovery and survey strategy goes further. */
export function ThanksPrep(): React.JSX.Element {
  return (
    <section
      id="prepare"
      aria-labelledby="prepare-title"
      className="mt-16 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_18px_40px_-24px_rgba(132,50,8,0.25)] sm:mt-20 sm:p-10"
    >
      <h2 id="prepare-title" className="text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        Make the 30&nbsp;minutes&nbsp;count
      </h2>
      <p className="mt-3 max-w-[60ch] text-base leading-[1.65] text-[var(--color-ink-muted)]">
        {FOUNDER_FIRST_NAME} starts with discovery and survey strategy, so it helps to bring:
      </p>
      <ul className="mt-7 space-y-5">
        {BRING.map((item) => (
          <li key={item.title} className="flex gap-3.5">
            <span aria-hidden="true" className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-100)]">
              <svg
                className="size-3.5 text-[var(--color-accent-700)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p className="text-base leading-[1.65] text-[var(--color-ink-muted)]">
              <span className="font-semibold text-[var(--color-ink)]">{item.title}.</span> {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
