"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/content";

/**
 * Landing-page header per landing-page-architect SKILL Rule #3:
 * logo + single CTA button. Mobile logo h-12 (prior QA R1 deduction was h-10).
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur border-b border-[var(--color-line)] shadow-sm"
          : "bg-white/90 backdrop-blur"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Link
          href="#hero"
          className="flex items-center gap-2 group"
          aria-label={`${BRAND.name} home`}
        >
          <Image
            src="/images/trendcandy-logo.png"
            alt="TrendCandy"
            width={160}
            height={48}
            className="h-12 sm:h-14 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#book"
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition shadow-sm"
          >
            {BRAND.primaryCtaShort}
          </a>
        </div>
      </div>
    </header>
  );
}
