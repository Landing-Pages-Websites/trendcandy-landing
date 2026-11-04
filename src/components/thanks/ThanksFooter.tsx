import { BRAND } from "@/lib/content";

const PARENT_SITE_LABEL = new URL(BRAND.parentSite).hostname.replace(/^www\./, "");
const PRIVACY_POLICY_PATH = "/privacy-policy";
const LEGAL_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-sm font-semibold text-white/80 underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--color-primary)]";

/**
 * Legal-only footer for /thanks: copyright, the privacy policy and the
 * main-site link, in the booking pages' dark footer palette. The booking
 * pages' Footer (with its marketing line and repeated logo) is deliberately
 * not used here.
 */
export function ThanksFooter(): React.JSX.Element {
  return (
    <footer id="legal" className="bg-[var(--color-surface-dark)] py-8 text-[var(--color-ink-on-dark)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-white/65">
          © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-x-6">
          <a href={PRIVACY_POLICY_PATH} className={LEGAL_LINK_CLASS}>
            Privacy Policy
          </a>
          <a href={BRAND.parentSite} rel="noopener" className={LEGAL_LINK_CLASS}>
            {PARENT_SITE_LABEL}
          </a>
        </div>
      </div>
    </footer>
  );
}
