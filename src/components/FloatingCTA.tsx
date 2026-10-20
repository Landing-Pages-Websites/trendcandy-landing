"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/content";

/** The CTA appears once the visitor scrolls past this fraction of the viewport. */
const SHOW_AFTER_VIEWPORT_RATIO = 0.6;
/**
 * Observer thresholds that fire on edge contact (0) and again on the first
 * visible pixel (> 0), so a resize or layout shift can't skip the transition.
 */
const ANY_PIXEL_THRESHOLDS = [0, Number.MIN_VALUE];

type FloatingCTAProps = {
  /**
   * Opt-in: id of an element (e.g. the booking widget) that the CTA must
   * never cover. While any part of it is in the viewport the CTA is hidden
   * and inert. Omitted (root default): threshold-only behavior.
   */
  hideWhileInViewId?: string;
};

/** True when any part of el is inside the viewport (edge contact excluded). */
function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

/**
 * Reports whether the floating CTA should show, on scroll and, when
 * hideWhileInViewId resolves to an element, whenever its viewport
 * intersection changes (resize, layout shifts). Returns a cleanup function.
 */
export function watchFloatingVisibility(
  onChange: (visible: boolean) => void,
  hideWhileInViewId?: string,
): () => void {
  const target = hideWhileInViewId ? document.getElementById(hideWhileInViewId) : null;
  const update = () => {
    const pastThreshold = window.scrollY > window.innerHeight * SHOW_AFTER_VIEWPORT_RATIO;
    onChange(pastThreshold && !(target && isInViewport(target)));
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  let observer: IntersectionObserver | undefined;
  if (target) {
    observer = new IntersectionObserver(update, { threshold: ANY_PIXEL_THRESHOLDS });
    observer.observe(target);
  }
  return () => {
    window.removeEventListener("scroll", update);
    observer?.disconnect();
  };
}

/**
 * Floating sticky CTA: form-only (task has_phone_leads=false).
 * Appears after user scrolls past hero.
 */
export function FloatingCTA({ hideWhileInViewId }: FloatingCTAProps): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  useEffect(
    () => watchFloatingVisibility(setVisible, hideWhileInViewId),
    [hideWhileInViewId],
  );

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      inert={hideWhileInViewId !== undefined && !visible}
    >
      <a
        href="#book"
        className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-3 rounded-full font-semibold shadow-lg shadow-[var(--color-primary)]/25 transition"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        {BRAND.primaryCtaShort}
      </a>
    </div>
  );
}
