# Calendly Routing Forms

Both booking pages embed a native Calendly Routing Form that gates on a business
email before showing the calendar.

## Live forms

Hosted in TrendCandy's own Calendly account (Teams plan, verified). Both are published.

| Page | Routing form ID | URL | Routes to (existing event) |
| --- | --- | --- | --- |
| Meta (`/`) | 414098 | https://calendly.com/d/dwqf-y9m-tcg | https://calendly.com/trendcandy/trendcandy-call-meta |
| Google (`/google`) | 414099 | https://calendly.com/d/dt8q-7c7-9vm | https://calendly.com/trendcandy/trendcandy-google |

## Questions

Exactly two, both required:

1. **Business email**: Email address type
2. **Company name**: Short answer type

## Routes

- **Blocking route**: Business email *includes domain*, any of these 17 domains:
  gmail.com, googlemail.com, yahoo.com, ymail.com, hotmail.com, outlook.com,
  live.com, msn.com, aol.com, icloud.com, me.com, mac.com, comcast.net,
  protonmail.com, proton.me, gmx.com, mail.com.
  Shows exactly `Please use your business email address to book a call.`
  No body text and no calendar.
- **Fallback (business) route**: goes to the channel's existing event type in the
  table above. Host Justin Ethington, 30 min. Event settings and questions are
  unchanged. The email is prefilled into the event. Visitors type their name on
  the event-details step, which is also unchanged.

## Clarification

In Atlas comment `898fbd99-16fd-509a-a6ac-59cdf63cf960` (2026-11-16 20:09 UTC),
Sam confirmed that the two routing questions take priority. The name is entered
on the event-details step. Company name is **not** mapped to the person's name,
and no third routing question is added. This supersedes the brief's
name-prefill wording.

## Site wiring

- The only behavioral change is the destination URLs in the `DESTINATIONS` map of
  `src/components/CalendlyEmbed.tsx` (now named routing-form constants; the unused
  `@/lib/content` import was removed). The inline widget and the new-tab fallback link both use the routing URLs, so
  a slow load or a failed load cannot skip the gate.
- Google forwards only the existing allowlist (`utm_*`, `gclid`, `gbraid`,
  `wbraid`) through `resolveGoogleCalendlyUrl`. Meta ignores attribution.

## Protected contracts (unchanged)

- Meta Pixel `447773674733262`: live optimization on `invitee_meeting_scheduled`
  from book.trendcandy.io.
- Google booking conversion and attribution transfer.
- Authentic iframe message validation: origin `https://calendly.com` and the
  embedded iframe as the message source.
- Scheduled bookings only: the MegaTag `calendly_booked` relay and the
  `calendly_booking_confirmed` dataLayer push.
- One-shot `/thanks` redirect.
- No `form_submit` for routing-form responses.
- Dormant legacy FormCard post-submit URLs in `src/lib/content.ts`
  (`BRAND.calendlyUrl`, `CALENDLY_URL_GOOGLE`) are intentionally left unchanged.

## Verification ownership

The controller owns verification of:

- how the provider routes submissions
- live bookings
- ads and pixel transport

Repo tests use network-inert fixtures only (`tests/google-direct-booking.test.mjs`).

## Privacy Policy links (QA follow-up, 2026-11-16)

QA asked for a Privacy Policy link beside the Calendly embeds and in each page
footer. Both links reuse the site's existing policy at `/privacy-policy`
(book.trendcandy.io). No policy, Terms, or SMS language was written or changed.

- `CalendlyEmbed`: one underlined "Privacy Policy" link sits above the widget,
  inside the booking card, so it is visible before a visitor enters details. A
  plain `relative` wrapper keeps the existing loading note over the widget and
  clear of the link. Widget heights, URLs, handlers and tracking are unchanged.
- `Footer`: one "Privacy Policy" link under the existing copyright line. The
  footer's existing words, logo and main-site link are unchanged.
- Both links open in a new tab with `rel="noopener noreferrer"`, use 14px text
  with a 44px touch target, and have hover and focus-visible states.
- No form controls were added. `tests/privacy-links.test.mjs` covers the links
  and the preserved widget/footer markup.

## Demand-loaded widget and VSL poster hint (performance follow-up, 2026-11-17)

QA attempt 2 (2026-11-16) passed the privacy repair but failed the mandatory
Pass 5 mobile floor, measured as the median of two VALID Google-hosted runs per
route. Meta scored LCP 27.42 s / TBT 1047.75 ms. Google scored LCP 4.73 s /
TBT 1307.25 ms.

**Diagnosis.** In both VALID runs the longest main-thread tasks were Calendly's
booking bundle (735–789 ms), Calendly's `pxwebj3qd.js`, and the Stripe frames
Calendly loads. Required tracking was not the cause. All of it started on the
first hero view, because `next/script` with `afterInteractive` emits
`<link rel="preload" as="script">` for `widget.js` into the server HTML. The
widget stylesheet was also in the initial HTML. The booking card sits about
12,000 px below the fold on mobile and 7,000 px on desktop. Meta's LCP element
is the existing VSL poster, reported with `priorityHinted=false`.

**Change.** This is a resource-timing change only:

- `CalendlyEmbed` renders the same `<Script>` (same id, src, strategy, and
  `onLoad`/`onReady` init) and the same stylesheet only after booking intent.
  `watchBookingIntent` decides when intent has happened:
  - the card comes within 1200 px of the viewport;
  - a pointer or keyboard click lands on an in-page `a[href="#book"]` CTA
    (passive capture listener; it never prevents navigation);
  - the page has a `#book` hash, on arrival or later.

  The observer and listeners are removed on activation or unmount. A missing
  or failing IntersectionObserver activates at once. There is no timer and no
  user-agent check.
- Everything else is unchanged: the card, its reserved 1000 px / 720 px host,
  the loading note, the new-tab fallback, the Privacy Policy link, the message
  listener, origin/source checks, relays, and the `/thanks` redirect. The
  widget URL, including Google's allow-listed attribution, is still resolved
  when the widget initializes.
- On Meta only, `HeroSection` calls React's `preload()` for the existing poster
  with `fetchPriority: "high"`. The video keeps `preload="none"`, its source,
  and native controls, and the MP4 still loads only on play.

GTM, CTM, MegaTag, and Meta Pixel loading is untouched.

**Verification.** `tests/performance-loading.test.mjs` uses network-inert
fixtures. Local fixture-browser evidence is outside the repo. Public PSI after
deployment is owned by the controller; this change makes no claim of a PSI pass.
