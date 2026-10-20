"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { BRAND, CALENDLY_URL_GOOGLE } from "@/lib/content";
import { resolveGoogleCalendlyUrl } from "@/lib/googleCalendly";

/**
 * CalendlyEmbed: inline Calendly booking widget for a page's #book section.
 * Booking happens entirely inside Calendly: no lead form, no
 * form_submit / form_submission event.
 *
 * `destination` picks the booking page: "meta" (default, root page) embeds
 * the Meta page verbatim; "google" (/google only) embeds the Google page with
 * the visit's allow-listed ad attribution (utm_*, gclid/gbraid/wbraid)
 * forwarded, resolved in the browser so current attribution wins.
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
const EMBED_OPTIONS = { hide_event_type_details: "0", hide_gdpr_banner: "1" } as const;

// Per-destination booking page and how its link is resolved in the browser:
// Meta is used verbatim; Google forwards the visit's allow-listed attribution.
const DESTINATIONS = {
  meta: { baseUrl: BRAND.calendlyUrl, resolve: (url: string): string => url },
  google: { baseUrl: CALENDLY_URL_GOOGLE, resolve: resolveGoogleCalendlyUrl },
} as const;

export type CalendlyDestination = keyof typeof DESTINATIONS;

type CalendlyEmbedProps = { destination?: CalendlyDestination };

type DataLayerWindow = Window & { dataLayer?: unknown[] };

/** Bookable page for the new-tab fallback link (browser only for "google"). */
export function resolveBookingUrl(destination: CalendlyDestination): string {
  const { baseUrl, resolve } = DESTINATIONS[destination];
  return resolve(baseUrl);
}

/** Inline-widget URL: the booking page plus Calendly's embed display options. */
export function resolveEmbedUrl(destination: CalendlyDestination): string {
  const url = new URL(resolveBookingUrl(destination));
  for (const [key, value] of Object.entries(EMBED_OPTIONS)) url.searchParams.set(key, value);
  return url.toString();
}

// The snapshot re-reads location/storage on render; there are no change events.
const subscribeNoop = (): (() => void) => () => {};

/**
 * Mount the inline widget into `host` unless one is already there. Returns
 * whether a widget is present; false while Calendly's script isn't loaded.
 * The iframe check makes repeat calls (onLoad + onReady, remounts) no-ops.
 */
export function initCalendlyWidget(
  host: HTMLElement | null,
  destination: CalendlyDestination,
): boolean {
  if (!host || !window.Calendly?.initInlineWidget) return false;
  if (host.querySelector("iframe")) return true;
  window.Calendly.initInlineWidget({ url: resolveEmbedUrl(destination), parentElement: host });
  return true;
}

/** Calendly lifecycle event name from an authentic widget message, else null. */
export function readCalendlyEvent(e: MessageEvent, host: HTMLElement | null): string | null {
  if (e.origin !== CALENDLY_ORIGIN) return null;
  const frame = host?.querySelector("iframe");
  if (!frame || e.source !== frame.contentWindow) return null;
  const event: unknown = (e.data as { event?: unknown } | null)?.event;
  if (typeof event !== "string" || !event.startsWith(CALENDLY_EVENT_PREFIX)) return null;
  return event;
}

export function relayCalendlyEvent(calendlyEvent: string): void {
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

export function CalendlyEmbed({
  destination = "meta",
}: CalendlyEmbedProps): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const fallbackUrl = useSyncExternalStore(
    subscribeNoop,
    () => resolveBookingUrl(destination),
    () => DESTINATIONS[destination].baseUrl,
  );

  // Wired to both onLoad and onReady: onReady covers first load and remounts
  // after load, onLoad covers a remount while the script is still in flight.
  // The URL is resolved at call time, so attribution is never a stale snapshot.
  const initWidget = useCallback((): void => {
    try {
      if (initCalendlyWidget(hostRef.current, destination)) setReady(true);
    } catch {
      setReady(false); // keep the new-tab fallback link visible
    }
  }, [destination]);

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
            href={fallbackUrl}
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
