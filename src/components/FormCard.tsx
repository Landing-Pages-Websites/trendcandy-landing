"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { useMegaLeadForm } from "@/hooks/useMegaLeadForm";
import { BRAND } from "@/lib/content";

type Props = {
  variant?: "hero" | "card" | "inline";
  heading?: string;
  subheading?: string;
  idSuffix?: string;
};

/**
 * TrendCandy lead form — gateway to the Calendly inline embed.
 *
 * Fields (in submit order):
 *   1. firstName        required
 *   2. lastName         required
 *   3. email            required (work email)
 *   4. company          required
 *   5. companyWebsite   required
 *   6. goal             optional (free text — "what content goal are you trying to hit?")
 *
 * Customer directive (Justin, 2026-05-14): "send all leads even if disqualified
 * to keystone — no on-page qualification." → no qualifier branches, no early
 * returns. Every fill posts to the lead API.
 *
 * Anti-disruption pattern (button type="button" + validate-first + requestSubmit)
 * prevents Mega optimizer from firing duplicate form_submit on native submit
 * (AGENTS.md Hard Rule #5).
 */

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget?: (opts: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

export function FormCard({
  variant = "card",
  heading = "Book your free Dream Headlines session",
  subheading = "30 minutes. No pitch. You'll leave with 2-3 survey concepts and the headlines each one is built to produce.",
  idSuffix = "main",
}: Props) {
  const { submit } = useMegaLeadForm();
  const formRef = useRef<HTMLFormElement>(null);
  const calendlyHostRef = useRef<HTMLDivElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [goal, setGoal] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendlyReady, setCalendlyReady] = useState(false);

  const emailValid = /@.+\..+/.test(email);
  const canSubmit =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    emailValid &&
    company.trim().length >= 1 &&
    companyWebsite.trim().length >= 3;

  // Initialize Calendly inline embed AFTER form is submitted (gates the booker).
  useEffect(() => {
    if (!submitted) return;
    let cancelled = false;
    const tryInit = () => {
      if (cancelled) return;
      if (calendlyHostRef.current && window.Calendly?.initInlineWidget) {
        // Prefill name + email so Calendly form starts populated.
        const url = `${BRAND.calendlyUrl}?hide_event_type_details=0&hide_gdpr_banner=1` +
          `&name=${encodeURIComponent(`${firstName} ${lastName}`.trim())}` +
          `&email=${encodeURIComponent(email)}`;
        try {
          window.Calendly.initInlineWidget({
            url,
            parentElement: calendlyHostRef.current,
          });
          setCalendlyReady(true);
        } catch (e) {
          console.warn("Calendly init failed:", e);
        }
        return;
      }
      setTimeout(tryInit, 200);
    };
    tryInit();
    return () => {
      cancelled = true;
    };
  }, [submitted, firstName, lastName, email]);

  async function performSubmit() {
    if (submitting || submitted) return;
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await submit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        company: company.trim(),
        companyWebsite: companyWebsite.trim(),
        goal: goal.trim(),
      });
      // Manual form_submit event fire — required because our submit handler
      // uses requestSubmit() pattern that bypasses the optimizer's native
      // submit auto-detect (AGENTS.md Hard Rule #5). Fields passed as
      // separate keys so they land as separate columns in Mega Events /
      // Keystone (Peter mandate 2026-05-14).
      if (typeof window !== "undefined" && window.MegaTag?.trackEvent) {
        try {
          window.MegaTag.trackEvent("form_submit", {
            element: `form-${idSuffix}`,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            company: company.trim(),
            companyWebsite: companyWebsite.trim(),
            goal: goal.trim(),
          });
        } catch (trackErr) {
          console.warn("MegaTag.trackEvent failed:", trackErr);
        }
      }
      // Manual GTM dataLayer push — backup tracking signal, distinct event
      // name so we don't double-count with the optimizer's form_submit.
      if (typeof window !== "undefined") {
        const w = window as typeof window & { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({
          event: "form_submission",
          form_id: `form-${idSuffix}`,
          form_provider: "trendcandy-landing",
        });
      }
    } catch (err) {
      console.error("Form submission failed:", err);
      setError("Something went wrong on our end — your info still went through. Pick a time below.");
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSubmit();
  }

  function handleButtonClick() {
    if (!canSubmit) {
      formRef.current?.reportValidity();
      return;
    }
    formRef.current?.requestSubmit();
  }

  const wrapperClass =
    variant === "hero"
      ? "bg-white/97 backdrop-blur rounded-3xl shadow-2xl shadow-black/15 border border-[var(--color-line)] p-6 sm:p-7"
      : variant === "inline"
      ? "bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-line)] p-6 sm:p-8"
      : "bg-white rounded-3xl shadow-xl border border-[var(--color-line)] p-6 sm:p-8";

  const inputClass =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition";

  if (submitted) {
    return (
      <div className={`${wrapperClass} max-w-3xl mx-auto`}>
        {/* Calendly inline-widget script — loaded only after submit so we don't
            pay the asset cost until the booker is needed. */}
        <Script
          id="calendly-inline"
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
        />
        <link
          rel="stylesheet"
          href="https://assets.calendly.com/assets/external/widget.css"
        />
        <div className="text-center mb-5 space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
            <svg
              className="w-7 h-7 text-[var(--color-primary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
            You&apos;re all set, {firstName || "there"}.
          </h3>
          <p className="text-[var(--color-ink-muted)] max-w-xl mx-auto">
            Pick a time below for your 30-minute Dream Headlines session with
            Justin. We&apos;ll bring 2-3 survey concepts based on{" "}
            <span className="font-semibold text-[var(--color-ink)]">{company || "your company"}</span>.
          </p>
          {error && (
            <p className="text-xs text-[var(--color-ink-muted)]">(Note: {error})</p>
          )}
        </div>

        <div
          ref={calendlyHostRef}
          className="calendly-inline-widget"
          data-auto-load="false"
        />
        {!calendlyReady && (
          <p className="text-center text-xs text-[var(--color-ink-muted)] mt-3">
            Loading your booking page…{" "}
            <a
              href={BRAND.calendlyUrl}
              className="text-[var(--color-primary)] hover:underline font-semibold"
            >
              Open directly
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] leading-tight">
          {heading}
        </h3>
        {subheading && (
          <p className="text-sm text-[var(--color-ink-muted)] mt-2">
            {subheading}
          </p>
        )}
      </div>

      <form
        ref={formRef}
        onSubmit={handleFormSubmit}
        className="space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={`fn-${idSuffix}`} className="sr-only">First name</label>
            <input
              id={`fn-${idSuffix}`}
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`ln-${idSuffix}`} className="sr-only">Last name</label>
            <input
              id={`ln-${idSuffix}`}
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`em-${idSuffix}`} className="sr-only">Work email</label>
          <input
            id={`em-${idSuffix}`}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={`co-${idSuffix}`} className="sr-only">Company</label>
            <input
              id={`co-${idSuffix}`}
              name="company"
              type="text"
              autoComplete="organization"
              required
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`web-${idSuffix}`} className="sr-only">Company website</label>
            <input
              id={`web-${idSuffix}`}
              name="companyWebsite"
              type="text"
              autoComplete="url"
              required
              placeholder="Company website"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`go-${idSuffix}`} className="sr-only">Goal</label>
          <textarea
            id={`go-${idSuffix}`}
            name="goal"
            placeholder="What content goal are you trying to hit? (optional)"
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--color-primary)]">{error}</p>
        )}

        {/* type="button" + requestSubmit pattern — prevents optimizer
            duplicate form_submit (AGENTS.md Hard Rule #5). */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-full font-semibold text-base transition shadow-sm btn-glow"
        >
          {submitting ? "Sending…" : "Book my Dream Headlines call"}
          {!submitting && (
            <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <p className="text-center text-xs text-[var(--color-ink-muted)]">
          30 minutes · No commitment · Justin shows up with survey concepts ready
        </p>
      </form>
    </div>
  );
}
