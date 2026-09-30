// Post-submit Calendly hand-off for the dedicated Google Ads landing page
// (/google). Unlike the root page, /google always routes to the Google booking
// page (CALENDLY_URL_GOOGLE, passed in by the caller) and forwards the visit's
// ad attribution (utm_* plus Google click IDs) so Calendly bookings can be tied
// back to the originating campaign.

const GOOGLE_LANDING_PATH = "/google";

// Storage keys written elsewhere (QueryParamPersistence / useMegaLeadForm).
// Read-only here: this module never writes to either store.
const LANDING_PARAMS_KEY = "landing_params";
const MEGA_ATTRIBUTION_KEY = "_mega_attr";

const GOOGLE_CLICK_ID_PARAMS = ["gclid", "gbraid", "wbraid"] as const;
const UTM_KEY_PATTERN = /^utm_[a-z0-9_]+$/i;

type StoredAttribution = {
  landingParams: string | null;
  megaAttribution: string | null;
};

function isAttributionKey(key: string): boolean {
  return (
    UTM_KEY_PATTERN.test(key) ||
    (GOOGLE_CLICK_ID_PARAMS as readonly string[]).includes(key)
  );
}

/** Allow-listed attribution pairs from a query (first value per key, non-empty only). */
function pickAttribution(params: URLSearchParams): [string, string][] {
  const picked = new Map<string, string>();
  params.forEach((value, key) => {
    if (!isAttributionKey(key) || picked.has(key) || value === "") return;
    picked.set(key, value);
  });
  return [...picked];
}

function parseMegaAttribution(raw: string | null): URLSearchParams {
  const params = new URLSearchParams();
  if (!raw) return params;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return params;
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") params.append(key, value);
    }
  } catch {
    // corrupt stored value: treat as no stored attribution
  }
  return params;
}

/**
 * Build the Google Calendly URL with forwarded attribution. Sources are used
 * whole, never mixed: the current URL wins when it carries any attribution,
 * then the session's landing_params, then the persisted _mega_attr record.
 */
export function buildGoogleCalendlyUrl(
  baseUrl: string,
  current: URLSearchParams,
  stored: StoredAttribution,
): string {
  const sources = [
    current,
    new URLSearchParams(stored.landingParams ?? ""),
    parseMegaAttribution(stored.megaAttribution),
  ];
  const pairs =
    sources.map(pickAttribution).find((found) => found.length > 0) ?? [];
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(pairs).toString();
  return url.toString();
}

function readStorageItem(
  getStorage: () => Storage | undefined,
  key: string,
): string | null {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null; // storage can throw in privacy modes or sandboxed frames
  }
}

/** Defensive, read-only snapshot of previously persisted attribution. */
export function readStoredAttribution(): StoredAttribution {
  return {
    landingParams: readStorageItem(() => globalThis.sessionStorage, LANDING_PARAMS_KEY),
    megaAttribution: readStorageItem(() => globalThis.localStorage, MEGA_ATTRIBUTION_KEY),
  };
}

export function isGoogleLandingPath(pathname: string): boolean {
  return pathname.replace(/\/+$/, "") === GOOGLE_LANDING_PATH;
}

/** Destination for a successful /google submit, from the live location. */
export function resolveGoogleCalendlyUrl(baseUrl: string): string {
  return buildGoogleCalendlyUrl(
    baseUrl,
    new URLSearchParams(window.location.search),
    readStoredAttribution(),
  );
}
