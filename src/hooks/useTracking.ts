"use client";

import { useEffect } from "react";

interface TrackingConfig {
  siteKey?: string;
  gtmId?: string;
  gaId?: string;
  pixelId?: string;
}

declare global {
  interface Window {
    MEGA_TAG_CONFIG?: TrackingConfig;
    API_ENDPOINT?: string;
    TRACKING_API_ENDPOINT?: string;
    /**
     * Mega optimizer global. The optimizer normally auto-detects native form
     * submits and fires `form_submit` itself, but our forms use the
     * validate-first + requestSubmit + type="button" pattern (AGENTS.md Hard
     * Rule #5) — which intentionally bypasses the native submit event to
     * prevent duplicate-firing. That means callers MUST manually invoke
     * `window.MegaTag?.trackEvent("form_submit", {...})` on a successful
     * submission so the event still lands in Mega Events / GTM / Pixel.
     */
    MegaTag?: {
      trackEvent?: (
        eventName: string,
        payload?: Record<string, unknown>,
      ) => void;
    };
  }
}

/**
 * useTracking — backup layer. Primary MegaTag config + optimizer script
 * live in layout.tsx <head> (per the lint enforcement + working repower-
 * landing pattern, see memory/skill-gotchas.md).
 */
export function useTracking(config: TrackingConfig) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("optimizer-script")) return;

    if (config.siteKey) {
      window.MEGA_TAG_CONFIG = {
        siteKey: config.siteKey,
        gtmId: config.gtmId,
        gaId: config.gaId,
        pixelId: config.pixelId,
      };
    }

    window.API_ENDPOINT = "https://optimizer.gomega.ai";
    window.TRACKING_API_ENDPOINT = "https://events-api.gomega.ai";

    const script = document.createElement("script");
    script.id = "optimizer-script";
    script.src = "https://cdn.gomega.ai/scripts/optimizer.min.js";
    script.async = true;
    document.head.appendChild(script);
  }, [config]);
}

export default useTracking;
