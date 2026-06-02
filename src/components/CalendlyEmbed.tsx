"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { BRAND } from "@/lib/content";

/**
 * CalendlyEmbed — inline Calendly booking widget. This is the LP's ONLY CTA
 * target (per task 346346fc: form removed, Calendly is the sole conversion
 * path). No lead form, no form_submit event — booking happens entirely inside
 * Calendly, and Calendly's own conversion tracking handles the scheduled event.
 *
 * We additionally relay Calendly's postMessage lifecycle events into GTM's
 * dataLayer and MegaTag so the existing analytics stack keeps an on-page
 * signal for each booking step (view → date/time → scheduled).
 */

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget?: (opts: { url: string; parentElement: HTMLElement }) => void;
    };
    MegaTag?: {
      trackEvent?: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

const CALENDLY_EVENTS = {
  viewed: "calendly.profile_page_viewed",
  eventTypeViewed: "calendly.event_type_viewed",
  dateAndTimeSelected: "calendly.date_and_time_selected",
  scheduled: "calendly.event_scheduled",
} as const;

export function CalendlyEmbed() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Initialize the inline widget once Calendly's script is available.
  useEffect(() => {
    let cancelled = false;
    const tryInit = () => {
      if (cancelled) return;
      if (hostRef.current && window.Calendly?.initInlineWidget) {
        const url =
          `${BRAND.calendlyUrl}?hide_event_type_details=0&hide_gdpr_banner=1`;
        try {
          window.Calendly.initInlineWidget({
            url,
            parentElement: hostRef.current,
          });
          setReady(true);
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
  }, []);

  // Relay Calendly lifecycle events into dataLayer + MegaTag so the booking
  // funnel stays tracked even though the on-page form is gone.
  useEffect(() => {
    const isCalendlyEvent = (e: MessageEvent): boolean =>
      typeof e.data === "object" &&
      e.data !== null &&
      typeof (e.data as { event?: unknown }).event === "string" &&
      (e.data as { event: string }).event.indexOf("calendly.") === 0;

    const onMessage = (e: MessageEvent) => {
      if (!isCalendlyEvent(e)) return;
      const calendlyEvent = (e.data as { event: string }).event;

      // GTM dataLayer push — distinct event names per Calendly step.
      const w = window as typeof window & { dataLayer?: unknown[] };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: "calendly_event",
        calendly_step: calendlyEvent,
        form_provider: "trendcandy-landing",
      });

      // MegaTag signal — fire a conversion-grade event on a confirmed booking.
      if (calendlyEvent === CALENDLY_EVENTS.scheduled) {
        try {
          window.MegaTag?.trackEvent?.("calendly_booked", {
            element: "calendly-inline",
            provider: "calendly",
          });
        } catch (trackErr) {
          console.warn("MegaTag.trackEvent failed:", trackErr);
        }
        w.dataLayer.push({
          event: "calendly_booking_confirmed",
          form_provider: "trendcandy-landing",
        });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <>
      <Script
        id="calendly-inline"
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
      <link
        rel="stylesheet"
        href="https://assets.calendly.com/assets/external/widget.css"
      />
      <div
        ref={hostRef}
        className="calendly-inline-widget"
        data-auto-load="false"
      />
      {!ready && (
        <p className="text-center text-sm text-[var(--color-ink-muted)] mt-4">
          Loading Justin&apos;s calendar…{" "}
          <a
            href={BRAND.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline font-semibold"
          >
            Open it in a new tab
          </a>
        </p>
      )}
    </>
  );
}
