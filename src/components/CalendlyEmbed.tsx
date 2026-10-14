"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { BRAND } from "@/lib/content";

/**
 * CalendlyEmbed: inline Calendly booking widget for the root page's #book
 * section. Booking happens entirely inside Calendly: no lead form, no
 * form_submit / form_submission event.
 *
 * Calendly's postMessage lifecycle events are relayed into GTM's dataLayer
 * (and a confirmed booking into MegaTag) so the analytics stack keeps an
 * on-page signal for each booking step (view → date/time → scheduled). Only
 * messages from the embedded Calendly iframe on calendly.com are accepted.
 */

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget?: (opts: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_STYLE_HREF = "https://assets.calendly.com/assets/external/widget.css";
const CALENDLY_ORIGIN = "https://calendly.com";
const CALENDLY_EVENT_PREFIX = "calendly.";
const CALENDLY_SCHEDULED_EVENT = "calendly.event_scheduled";
const FORM_PROVIDER = "trendcandy-landing";
const DATALAYER_STEP_EVENT = "calendly_event";
const DATALAYER_BOOKED_EVENT = "calendly_booking_confirmed";
const MEGATAG_BOOKED_EVENT = "calendly_booked";
const MEGATAG_BOOKED_PAYLOAD = { element: "calendly-inline", provider: "calendly" };
const EMBED_URL = `${BRAND.calendlyUrl}?hide_event_type_details=0&hide_gdpr_banner=1`;

type DataLayerWindow = Window & { dataLayer?: unknown[] };

/** Calendly lifecycle event name from an authentic widget message, else null. */
function readCalendlyEvent(e: MessageEvent, host: HTMLElement | null): string | null {
  if (e.origin !== CALENDLY_ORIGIN) return null;
  const frame = host?.querySelector("iframe");
  if (!frame || e.source !== frame.contentWindow) return null;
  const event: unknown = (e.data as { event?: unknown } | null)?.event;
  if (typeof event !== "string" || !event.startsWith(CALENDLY_EVENT_PREFIX)) return null;
  return event;
}

function relayCalendlyEvent(calendlyEvent: string): void {
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: DATALAYER_STEP_EVENT,
    calendly_step: calendlyEvent,
    form_provider: FORM_PROVIDER,
  });
  if (calendlyEvent !== CALENDLY_SCHEDULED_EVENT) return;

  try {
    window.MegaTag?.trackEvent?.(MEGATAG_BOOKED_EVENT, MEGATAG_BOOKED_PAYLOAD);
  } catch {
    // A MegaTag failure must not block the GTM backup signal below.
  }
  w.dataLayer.push({
    event: DATALAYER_BOOKED_EVENT,
    form_provider: FORM_PROVIDER,
  });
}

export function CalendlyEmbed(): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Wired to both onLoad and onReady: onReady covers first load and remounts
  // after load, onLoad covers a remount while the script is still in flight.
  // The iframe check keeps repeat calls from initializing a second widget.
  const initWidget = useCallback((): void => {
    const host = hostRef.current;
    if (!host || !window.Calendly?.initInlineWidget) return;
    if (host.querySelector("iframe")) {
      setReady(true);
      return;
    }
    try {
      window.Calendly.initInlineWidget({ url: EMBED_URL, parentElement: host });
      setReady(true);
    } catch {
      setReady(false); // keep the new-tab fallback link visible
    }
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent): void => {
      const calendlyEvent = readCalendlyEvent(e, hostRef.current);
      if (calendlyEvent) relayCalendlyEvent(calendlyEvent);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="bg-white/97 backdrop-blur rounded-3xl shadow-2xl shadow-black/15 border border-[var(--color-line)] relative sm:p-3 overflow-hidden">
      <Script
        id="calendly-inline"
        src={CALENDLY_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={initWidget}
        onReady={initWidget}
      />
      <link rel="stylesheet" href={CALENDLY_STYLE_HREF} />
      <div
        ref={hostRef}
        // Fixed heights reserve space before load (no layout shift): Calendly's
        // stacked mobile layout needs ~1000px, its desktop view ~720px.
        className="calendly-inline-widget w-full h-[1000px] md:h-[720px] rounded-2xl overflow-hidden"
        data-auto-load="false"
        aria-label="Choose a time for your Dream Headlines session"
        role="region"
      />
      {!ready && (
        <p className="absolute inset-x-0 top-0 px-4 py-6 text-center text-sm text-[var(--color-ink-muted)]">
          Loading Justin&apos;s calendar…{" "}
          <a
            href={BRAND.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline focus-visible:underline font-semibold"
          >
            Open it in a new tab
          </a>
        </p>
      )}
    </div>
  );
}
