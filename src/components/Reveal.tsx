"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  as?: "div" | "section" | "article" | "header" | "footer" | "main";
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      queueMicrotask(() => setVisible(true));
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const style = `transition-all duration-700 ease-out ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
  }`;

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${style} ${className}`}
    >
      {children}
    </Tag>
  );
}
