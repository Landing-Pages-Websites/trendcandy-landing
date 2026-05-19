import Image from "next/image";
import { BRAND } from "@/lib/content";

/**
 * Legal-only footer per landing-page-architect Rule #4.
 * Logo NOT inverted (prior QA R1 failure on inherited build).
 */
export function Footer() {
  return (
    <footer id="legal" className="bg-[var(--color-surface-dark)] text-[var(--color-ink-on-dark)] py-12 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="inline-flex items-center gap-3 bg-white rounded-xl px-6 py-4">
            <Image
              src="/images/trendcandy-logo.png"
              alt="TrendCandy"
              width={220}
              height={72}
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>
          <p className="text-sm max-w-2xl text-white/75">
            Done-for-you B2B survey research that becomes a year of thought-leadership content,
            press citations, and AI-search visibility.
          </p>
          <p className="text-xs text-white/55">
            © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
            {" · "}
            <a href={BRAND.parentSite} className="hover:text-white underline">{BRAND.parentSite.replace("https://", "")}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
