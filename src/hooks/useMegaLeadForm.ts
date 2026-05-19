"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * useMegaLeadForm — TrendCandy LP form submission hook.
 * Reference: landing-page-forms skill + Mega Admin site registration.
 *
 * Customer (TrendCandy) + site_id come from the existing Mega Admin record
 * — see layout.tsx for the matching MEGA_TAG_CONFIG values.
 */

const DEFAULTS = {
  CUSTOMER_ID: "a435618c-676f-4db6-ae7e-bf9e0926f28f", // TrendCandy
  SITE_ID: "673c7de2-4564-4233-aed5-8c8c836a5ab1",
  ENDPOINT: "https://analytics.gomega.ai/submission/submit",
};

const STORAGE_KEYS = {
  VISITOR_ID: "_mega_vid",
  SESSION_ID: "_mega_sid",
  ATTRIBUTION: "_mega_attr",
} as const;

interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
}

interface SubmissionPayload {
  customer_id: string;
  site_id: string;
  source_provider: string;
  form_data: Record<string, unknown>;
  url: string;
  referrer_url: string | null;
  session_id: string;
  visitor_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
}

export interface SubmissionResponse {
  ok: boolean;
  id?: string;
}

const generateId = (prefix: string): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    },
  )}`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

const getVisitorId = (): string => {
  if (typeof localStorage === "undefined") return generateId("vis");
  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
  if (!visitorId) {
    visitorId = generateId("vis");
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId);
  }
  return visitorId;
};

const getSessionId = (): string => {
  if (typeof sessionStorage === "undefined") return generateId("sess");
  let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = generateId("sess");
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
};

const captureAttribution = (): Attribution => {
  if (typeof window === "undefined") {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      gclid: null,
      gbraid: null,
      wbraid: null,
      fbclid: null,
      fbp: null,
      fbc: null,
    };
  }
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const attribution: Attribution = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    gclid: params.get("gclid"),
    gbraid: params.get("gbraid"),
    wbraid: params.get("wbraid"),
    fbclid: params.get("fbclid"),
    fbp: getCookie("_fbp"),
    fbc: getCookie("_fbc"),
  };
  if (attribution.fbclid && !attribution.fbc) {
    attribution.fbc = `fb.1.${Date.now()}.${attribution.fbclid}`;
  }
  return attribution;
};

const initAttribution = (): Attribution => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return captureAttribution();
  }
  const trackingParams = ["utm_source", "gclid", "fbclid", "gbraid", "wbraid"];
  const url = new URL(window.location.href);
  const hasTrackingParams = trackingParams.some((p) => url.searchParams.has(p));
  if (hasTrackingParams) {
    const attribution = captureAttribution();
    try {
      localStorage.setItem(STORAGE_KEYS.ATTRIBUTION, JSON.stringify(attribution));
    } catch {
      /* noop */
    }
    return attribution;
  }
  const stored = localStorage.getItem(STORAGE_KEYS.ATTRIBUTION);
  if (stored) {
    try {
      return JSON.parse(stored) as Attribution;
    } catch {
      /* fall through */
    }
  }
  const attribution = captureAttribution();
  try {
    localStorage.setItem(STORAGE_KEYS.ATTRIBUTION, JSON.stringify(attribution));
  } catch {
    /* noop */
  }
  return attribution;
};

// ---------------------------------------------------------------------------
// EMAIL VALIDATION — RFC-5322-lite
// ---------------------------------------------------------------------------
// Pragmatic, fleet-standard email validator. Requires:
//   - one or more local-part chars (letters, digits, ._%+-)
//   - an @
//   - one or more domain chars (letters, digits, .-)
//   - a literal dot
//   - a TLD of 2+ letters
// Source: landing-page-forms skill, Hard Rule #4b (email validation).
// HTML5 `pattern` attr applies its own ^…$ anchors and does NOT accept
// inline `^`/`$` literals — so we expose two forms:
//   EMAIL_PATTERN — un-anchored, for use in <input pattern={...}>
//   EMAIL_REGEX   — anchored, for use in JS isValidEmail() checks
export const EMAIL_PATTERN = "[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}";
export const EMAIL_REGEX = new RegExp(`^${EMAIL_PATTERN}$`);
export const isValidEmail = (value: unknown): boolean =>
  typeof value === "string" && EMAIL_REGEX.test(value.trim());

export interface UseMegaLeadFormOptions {
  sourceProvider?: string;
  customerId?: string;
  siteId?: string;
}

export interface UseMegaLeadFormReturn {
  submit: (formData: Record<string, unknown>) => Promise<SubmissionResponse>;
  isReady: boolean;
}

export function useMegaLeadForm(
  options: UseMegaLeadFormOptions = {},
): UseMegaLeadFormReturn {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      initAttribution();
      isInitialized.current = true;
    }
  }, []);

  const submit = useCallback(
    async (
      formData: Record<string, unknown>,
    ): Promise<SubmissionResponse> => {
      if (formData.phone) {
        const phoneDigits = String(formData.phone).replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
          throw new Error("Phone must be exactly 10 digits");
        }
        formData.phone = phoneDigits;
      }
      if (!formData.firstName || !formData.email) {
        throw new Error("firstName and email are required");
      }
      if (!isValidEmail(formData.email)) {
        throw new Error("Enter a valid email address");
      }

      const attribution = initAttribution();
      const payload: SubmissionPayload = {
        customer_id: options.customerId ?? DEFAULTS.CUSTOMER_ID,
        site_id: options.siteId ?? DEFAULTS.SITE_ID,
        source_provider: options.sourceProvider ?? "trendcandy-landing",
        form_data: formData,
        url: window.location.href,
        referrer_url: document.referrer || null,
        session_id: getSessionId(),
        visitor_id: getVisitorId(),
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_term: attribution.utm_term,
        utm_content: attribution.utm_content,
        gclid: attribution.gclid,
        gbraid: attribution.gbraid,
        wbraid: attribution.wbraid,
        fbclid: attribution.fbclid,
        fbp: attribution.fbp,
        fbc: attribution.fbc,
      };

      const response = await fetch(DEFAULTS.ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return (await response.json()) as SubmissionResponse;
    },
    [options.customerId, options.siteId, options.sourceProvider],
  );

  return { submit, isReady: typeof window !== "undefined" };
}

export default useMegaLeadForm;
