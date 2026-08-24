"use client";

import { useRef, useState } from "react";
import {
  useMegaLeadForm,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  isValidEmail,
  isValidUsPhone,
  formatUsPhone,
} from "@/hooks/useMegaLeadForm";
import { BRAND } from "@/lib/content";

type Props = {
  variant?: "hero" | "card" | "inline";
  heading?: string;
  subheading?: string;
  idSuffix?: string;
};

const FORM_PROVIDER = "trendcandy-landing";

/**
 * TrendCandy lead form: step one of the booking flow.
 *
 * Fields (in submit order):
 *   1. firstName   required
 *   2. lastName    required
 *   3. email       required
 *   4. phone       required (US 10-digit)
 *
 * On a genuinely successful lead-API response we fire a single manual
 * `form_submit` (MegaTag + GTM dataLayer, structural metadata only, no PII)
 * and then redirect to Justin's Calendly (step two) to pick a time. Nothing
 * fires on validation failure, empty submit, an in-flight click, or API error.
 *
 * Anti-disruption pattern: the button is type="button" and calls the submit
 * routine directly and we never programmatically request a native `submit`
 * event, so the Mega optimizer cannot auto-fire a false, pre-API
 * `form_submit` conversion (AGENTS.md Hard Rule #5). Only a successful API
 * response can cause form_submit, a dataLayer conversion, or the redirect.
 */
export function FormCard({
  variant = "card",
  heading = "Book your free Dream Headlines session",
  subheading = "Step one: tell us where to reach you. Step two: pick a time on the next screen for your 30-minute call with Justin.",
  idSuffix = "main",
}: Props) {
  const { submit } = useMegaLeadForm();
  const formRef = useRef<HTMLFormElement>(null);
  // Synchronous guard: React state updates are batched, so several clicks in
  // the same tick all see submitting=false. This ref flips synchronously and
  // gates duplicate sends so rapid repeated clicks produce one request.
  const inFlightRef = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = isValidEmail(email);
  const phoneValid = isValidUsPhone(phone);
  const canSubmit =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    emailValid &&
    phoneValid;

  const formId = `form-${idSuffix}`;

  // Manual conversion signal: structural metadata only, never PII. Required
  // because our validate-first pattern bypasses the optimizer's native-submit
  // auto-detect, so the successful `form_submit` must be fired by hand for the
  // sibling Meta / GTM instrumentation to receive it.
  function fireConversion() {
    const meta = {
      form_id: formId,
      form_provider: FORM_PROVIDER,
      destination: BRAND.calendlyUrl,
    };
    try {
      window.MegaTag?.trackEvent?.("form_submit", meta);
    } catch (trackErr) {
      void trackErr; // analytics must never block the redirect
    }
    const w = window as typeof window & { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "form_submit", ...meta });
  }

  async function performSubmit() {
    if (inFlightRef.current || !canSubmit) return;
    inFlightRef.current = true;
    setError(null);
    setSubmitting(true);
    try {
      await submit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: formatUsPhone(phone),
      });
      // Success only past this point: fire once, then hand off to Calendly.
      // We intentionally leave inFlightRef/submitting set so the in-progress
      // navigation cannot be double-triggered.
      fireConversion();
      window.location.assign(BRAND.calendlyUrl);
    } catch (err) {
      // Keep the real error in the console for developer diagnostics, but never
      // surface raw HTTP status or exception text to the visitor.
      if (process.env.NODE_ENV !== "production") {
        console.error("Lead submission failed", err);
      }
      setError(
        "We couldn't submit your details right now. Please try again in a moment.",
      );
      setSubmitting(false);
      inFlightRef.current = false; // allow a retry after a failed attempt
    }
  }

  function handleSubmit() {
    if (!canSubmit) {
      formRef.current?.reportValidity();
      return;
    }
    performSubmit();
  }

  function handleFormSubmit(e: React.FormEvent) {
    // Defensive only: Enter is intercepted at keydown (handleKeyDown) before the
    // browser can dispatch a native submit, and the button uses type="button".
    // So this should never drive the API. If a native submit ever slips
    // through, swallow it entirely rather than leak a pre-API optimizer
    // conversion. It intentionally does NOT call performSubmit/handleSubmit.
    e.preventDefault();
    e.stopPropagation();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    // Stop Enter's implicit native submit before the browser dispatches it,
    // then route through the same validate-first handler as the button.
    if (e.key !== "Enter") return;
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    e.preventDefault();
    handleSubmit();
  }

  const wrapperClass =
    variant === "hero"
      ? "bg-white/97 backdrop-blur rounded-3xl shadow-2xl shadow-black/15 border border-[var(--color-line)] p-6 sm:p-7"
      : variant === "inline"
        ? "bg-[var(--color-surface-alt)] rounded-3xl border border-[var(--color-line)] p-6 sm:p-8"
        : "bg-white rounded-3xl shadow-xl border border-[var(--color-line)] p-6 sm:p-8";

  const inputClass =
    "w-full rounded-xl border-2 border-[var(--color-line)] bg-white px-4 py-3 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition";

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
        onKeyDown={handleKeyDown}
        className="space-y-3"
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={`fn-${idSuffix}`} className="sr-only">
              First name
            </label>
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
            <label htmlFor={`ln-${idSuffix}`} className="sr-only">
              Last name
            </label>
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
          <label htmlFor={`em-${idSuffix}`} className="sr-only">
            Email
          </label>
          <input
            id={`em-${idSuffix}`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="Email"
            value={email}
            pattern={EMAIL_PATTERN}
            onChange={(e) => setEmail(e.target.value)}
            title="Enter a valid email address (e.g. you@company.com)"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`ph-${idSuffix}`} className="sr-only">
            Phone
          </label>
          <input
            id={`ph-${idSuffix}`}
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            placeholder="Phone (10 digits)"
            value={phone}
            pattern={PHONE_PATTERN}
            onChange={(e) => setPhone(formatUsPhone(e.target.value))}
            title="Enter a 10-digit US phone number, e.g. (555) 123-4567"
            aria-describedby={error ? `err-${idSuffix}` : undefined}
            className={inputClass}
          />
        </div>

        {error && (
          <p
            id={`err-${idSuffix}`}
            role="alert"
            aria-live="assertive"
            className="text-sm text-[var(--color-primary)]"
          >
            {error}
          </p>
        )}

        {/* type="button" + direct call: never dispatches a native submit
            event, so the optimizer cannot fire a false pre-API conversion. */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-full font-semibold text-base transition shadow-sm btn-glow"
        >
          {submitting ? "Sending…" : "Book my Dream Headlines call"}
          {!submitting && (
            <svg
              className="ml-2 w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M3 10a1 1 0 011-1h10.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
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
