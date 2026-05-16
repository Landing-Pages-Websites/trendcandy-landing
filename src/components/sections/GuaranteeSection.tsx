"use client";

import { Reveal } from "@/components/Reveal";
import { GUARANTEE, BRAND } from "@/lib/content";

export function GuaranteeSection() {
  return (
    <section id="guarantee" className="relative bg-[var(--color-primary)] text-white py-16 sm:py-20 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(45% 60% at 80% 0%, rgba(255,255,255,0.25), transparent 60%), radial-gradient(35% 60% at 0% 100%, rgba(105,193,225,0.6), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 z-10 text-center">
        <Reveal>
          <p className="eyebrow eyebrow-on-dark justify-center text-white">The Guarantee</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 leading-tight">
            {GUARANTEE.title}
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mt-6 max-w-3xl mx-auto leading-relaxed">
            {GUARANTEE.body}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <a
              href="#book"
              className="btn-glow inline-flex items-center bg-white hover:bg-white/95 text-[var(--color-primary)] px-7 py-3.5 rounded-full font-semibold text-base transition shadow-xl"
            >
              {BRAND.primaryCtaLabel}
            </a>
            <a
              href="#faq"
              className="text-base font-semibold text-white hover:text-white/80 underline underline-offset-4 decoration-2 decoration-white/60 transition"
            >
              Read the FAQ
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
