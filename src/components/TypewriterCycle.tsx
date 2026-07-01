"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

/**
 * Typewriter that cycles through a list of phrases:
 * types phrase -> holds -> backspaces -> short gap -> types the next phrase,
 * on infinite loop.
 *
 * Respects prefers-reduced-motion: renders the first phrase statically.
 *
 * Layout note (zero CLS): the animated text is NOT allowed to drive layout.
 * We render an invisible reservation copy of every phrase stacked in a single
 * `inline-grid` cell — the cell sizes itself to the WIDEST phrase (caret
 * included) and never changes. The live, animating text is overlaid in that
 * same cell, so the headline occupies a constant width / line count no matter
 * which phrase is currently typed. When the visible text is empty we still
 * render a non-breaking space so the live layer keeps its line box.
 */
type Phase = "typing" | "holding" | "deleting" | "gap";

type Props = {
  phrases: readonly string[];
  /** ms per character while typing */
  typeMs?: number;
  /** ms per character while deleting */
  deleteMs?: number;
  /** ms to hold after fully typing a phrase */
  holdMs?: number;
  /** ms to hold after fully deleting a phrase (before next phrase starts) */
  gapMs?: number;
  className?: string;
};

/* prefers-reduced-motion via useSyncExternalStore — avoids setState-in-effect. */
const PRM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(cb: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(PRM_QUERY);
  mq.addEventListener?.("change", cb);
  return () => mq.removeEventListener?.("change", cb);
}
function getReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(PRM_QUERY).matches;
}
function getReducedMotionServer() {
  return false;
}

export function TypewriterCycle({
  phrases,
  typeMs = 70,
  deleteMs = 38,
  holdMs = 1400,
  gapMs = 260,
  className = "",
}: Props) {
  const safePhrases = useMemo(
    () => (phrases && phrases.length > 0 ? phrases : [""]),
    [phrases],
  );

  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  );

  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const current = safePhrases[index % safePhrases.length];
    const clear = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    if (phase === "typing") {
      if (text.length < current.length) {
        timerRef.current = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typeMs,
        );
      } else {
        timerRef.current = setTimeout(() => setPhase("deleting"), holdMs);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timerRef.current = setTimeout(
          () => setText(current.slice(0, text.length - 1)),
          deleteMs,
        );
      } else {
        timerRef.current = setTimeout(() => setPhase("gap"), gapMs);
      }
    } else if (phase === "gap") {
      // Move to the next phrase and start typing again — scheduled, not sync.
      timerRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % safePhrases.length);
        setPhase("typing");
      }, 0);
    } else if (phase === "holding") {
      // Defensive — current state machine never lands here, but if it does,
      // bridge it straight into the delete phase.
      timerRef.current = setTimeout(() => setPhase("deleting"), holdMs);
    }

    return clear;
  }, [
    text,
    phase,
    index,
    safePhrases,
    typeMs,
    deleteMs,
    holdMs,
    gapMs,
    reduceMotion,
  ]);

  // For reduce-motion, show first phrase statically (derived, no setState).
  const display = reduceMotion ? safePhrases[0] : text;
  const visible = display.length > 0 ? display : "\u00A0"; // nbsp preserves line height

  const caret = !reduceMotion && (
    <span className="typewriter-caret" aria-hidden>
      |
    </span>
  );

  return (
    <span
      className="typewriter-slot"
      aria-label={safePhrases.join(", ")}
      aria-live="polite"
    >
      {/*
        Reservation layer: every phrase, invisible, each on its own line so the
        grid cell sizes to the widest phrase + caret. Never animates, so the
        reserved footprint is constant across the whole cycle. `aria-hidden`
        keeps it out of the accessibility tree (the label above covers it).
      */}
      {safePhrases.map((phrase, i) => (
        <span key={i} className={`${className} typewriter-reserve`} aria-hidden>
          {phrase}
          {caret}
        </span>
      ))}

      {/* Live animating text, overlaid in the same grid cell. */}
      <span className={className} aria-hidden>
        {visible}
        {caret}
      </span>
    </span>
  );
}
