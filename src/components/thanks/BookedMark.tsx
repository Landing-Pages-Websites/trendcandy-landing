/**
 * Confirmation mark for /thanks: an orange check set inside a ring of the
 * brand's candy-strip pattern. Decorative; the headline carries the meaning.
 */
export function BookedMark(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="candy-strip inline-flex size-[72px] items-center justify-center rounded-full p-[5px] shadow-[0_10px_30px_-12px_rgba(255,105,25,0.45)] sm:size-20"
    >
      <span className="flex size-full items-center justify-center rounded-full bg-[var(--color-surface)]">
        <svg
          className="size-8 text-[var(--color-primary)] sm:size-9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </div>
  );
}
