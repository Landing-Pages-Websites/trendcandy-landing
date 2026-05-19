"use client";

import Image from "next/image";
import { CLIENT_LOGOS } from "@/lib/content";

/**
 * Trust bar — scrolling marquee of brands TrendCandy has shipped survey
 * content for. Sourced from www.trendcandy.io/our-clients block 2026-05-15.
 */
export function TrustBarSection() {
  // duplicate for seamless marquee loop
  const loop = [...CLIENT_LOGOS, ...CLIENT_LOGOS];
  return (
    <section
      id="trust-bar"
      className="relative bg-white py-10 sm:py-14 border-y border-[var(--color-line)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-8">
        <p className="eyebrow justify-center">Our Clients</p>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] mt-3 max-w-3xl mx-auto">
          The brands publishing TrendCandy survey data
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-2 max-w-2xl mx-auto">
          Survey content fielded for B2B leaders across SaaS, media, finance,
          and enterprise software.
        </p>
      </div>

      <div className="marquee">
        <div className="marquee-track">
          {loop.map((c, idx) => (
            <div
              key={`${c.name}-${idx}`}
              className="flex items-center justify-center min-w-[200px] sm:min-w-[240px] h-20 sm:h-28 opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition"
            >
              <Image
                src={c.src}
                alt={c.name}
                width={280}
                height={112}
                className="max-h-16 sm:max-h-24 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
