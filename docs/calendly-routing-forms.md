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
