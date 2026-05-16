"use client";

import { useEffect } from "react";

/**
 * Preserve UTM / click-id query params across client-side navigation.
 * Drop <QueryParamPersistence /> once in the root layout.
 *
 * Minimum preserved params: utm_*, gclid, fbclid, msclkid, source, ref.
 */
export function QueryParamPersistence() {
  useEffect(() => {
    try {
      const params = window.location.search;
      if (params && params.length > 1) {
        sessionStorage.setItem("landing_params", params);
      }
    } catch {
      // sessionStorage can throw in some privacy modes — silently noop
    }

    const handleHashChange = () => {
      try {
        const stored = sessionStorage.getItem("landing_params");
        if (stored && !window.location.search) {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + stored + window.location.hash,
          );
        }
      } catch {
        // noop
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return null;
}
