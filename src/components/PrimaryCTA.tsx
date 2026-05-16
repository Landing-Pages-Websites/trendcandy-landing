import { BRAND } from "@/lib/content";

type Props = {
  label?: string;
  secondaryLabel?: string;
  variant?: "default" | "onDark";
  align?: "center" | "start";
  className?: string;
  href?: string;
  secondaryHref?: string;
};

/**
 * Dual CTA — required division rule (button + secondary text link side by side
 * in every content section). Removes the prior R3 deduction on TrendCandy LP.
 */
export function PrimaryCTA({
  label = BRAND.primaryCtaLabel,
  secondaryLabel = "See how it works",
  variant = "default",
  align = "center",
  className = "",
  href = "#book",
  secondaryHref = "#how-it-works",
}: Props) {
  const onDark = variant === "onDark";
  const justify = align === "start" ? "justify-start" : "justify-center";
  return (
    <div
      className={`flex flex-wrap items-center ${justify} gap-x-5 gap-y-3 mt-8 ${className}`}
    >
      <a
        href={href}
        className={
          onDark
            ? "btn-glow inline-flex items-center bg-white hover:bg-white/95 text-[var(--color-primary)] px-7 py-3.5 rounded-full font-semibold text-base transition shadow-lg shadow-black/30"
            : "btn-glow inline-flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-7 py-3.5 rounded-full font-semibold text-base transition shadow-sm"
        }
      >
        {label}
        <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </a>
      <a
        href={secondaryHref}
        className={
          onDark
            ? "inline-flex items-center text-white hover:text-[var(--color-primary-200)] font-semibold text-sm underline underline-offset-4 decoration-2 decoration-white/60 hover:decoration-[var(--color-primary-200)] transition"
            : "inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold text-sm underline underline-offset-4 decoration-2 decoration-[var(--color-primary)]/40 hover:decoration-[var(--color-primary-hover)] transition"
        }
      >
        {secondaryLabel}
        <svg className="ml-1 w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </a>
    </div>
  );
}
