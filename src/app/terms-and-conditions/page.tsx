import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | TrendCandy",
  description:
    "Terms for using the TrendCandy website and booking a Dream Headlines session, including optional SMS messaging and STOP/HELP instructions.",
};

export default function TermsAndConditionsPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[var(--color-surface-alt)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-line)] bg-[var(--color-surface-dark)]">
        <div className="h-1 bg-[var(--color-primary)]" />
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-white">
            Trend<span className="text-[var(--color-primary)]">Candy</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-white underline underline-offset-4"
          >
            Back to site
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-4xl text-[var(--color-ink)] md:text-5xl">
          Terms and Conditions
        </h1>

        <div className="mt-10 space-y-8 text-[1rem] leading-8 text-[var(--color-ink-muted)]">
          <p>
            By accessing and using the TrendCandy website, including{" "}
            <a
              href="https://book.trendcandy.io/"
              className="font-semibold text-[var(--color-primary)] underline"
            >
              book.trendcandy.io
            </a>{" "}
            and{" "}
            <a
              href="https://www.trendcandy.io/"
              className="font-semibold text-[var(--color-primary)] underline"
            >
              www.trendcandy.io
            </a>
            , you agree to comply with and be bound by these Terms and Conditions. If you do not
            agree to these terms, please do not use our website. Using this website does not
            constitute SMS consent. Providing a phone number or submitting a form without checking
            the optional SMS box does not constitute consent to receive text messages.
          </p>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">1. Use of the Website</h2>
            <p>
              You are responsible for your use of the Site and for any information you submit,
              including quote or booking details. You agree to provide accurate information and not
              to misuse the Site, interfere with its operation, or attempt unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">2. Services</h2>
            <p>
              TrendCandy provides done-for-you B2B survey research and related content services.
              Booking a Dream Headlines session through the Site is a request for a consultation and
              does not by itself create a paid project engagement. Project scope, pricing, and
              deliverables are confirmed separately.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">3. Communications</h2>
            <p>
              You may receive email communications related to your inquiry, Dream Headlines session,
              or project. SMS and text messages are sent only if you check the optional SMS consent
              checkbox. Using this Site or providing a phone number does not constitute consent to
              receive text messages.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">SMS/Text Messaging</h2>
            <p>
              TrendCandy may send you SMS/text messages only if you affirmatively check the optional
              SMS consent checkbox. Providing a phone number or submitting a form without checking
              that box does not constitute consent. Using this website does not constitute SMS
              consent. Messages may include inquiry responses, Dream Headlines session scheduling,
              appointment confirmations, reminders, and project updates.
            </p>
            <p className="mt-4">
              <strong className="text-[var(--color-ink)]">HELP instructions:</strong> Reply HELP for
              help, or email{" "}
              <a
                href="mailto:justin@trendcandy.io"
                className="font-semibold text-[var(--color-primary)] underline"
              >
                justin@trendcandy.io
              </a>
              .
            </p>
            <p className="mt-4">
              <strong className="text-[var(--color-ink)]">STOP instructions:</strong> Reply STOP to
              opt out of SMS messages at any time.
            </p>
            <p className="mt-4">
              Message frequency may vary. Message and data rates may apply. Carriers are not liable
              for delayed or undelivered messages. Consent is not a condition of purchase.
            </p>
            <p className="mt-4">
              Your mobile information will not be sold or shared with third parties for promotional
              or marketing purposes. We will not share mobile information with third parties for
              promotional or marketing purposes.
            </p>
            <p className="mt-4">
              All the above categories exclude text messaging originator opt-in data and consent;
              this information will not be shared with any third parties. We will not share your
              opt-in to an SMS campaign with any third party for purposes unrelated to providing you
              with the services of that campaign. We may share your Personal Data, including your
              SMS opt-in or consent status, with third parties that help us provide our messaging
              services, including but not limited to platform providers, phone companies, and any
              other vendors who assist us in the delivery of text messages.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">5. Intellectual Property</h2>
            <p>
              Site content is owned by or licensed to TrendCandy. You may not copy, reproduce,
              modify, or distribute Site content without prior written permission, except for
              personal, non-commercial use.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">6. Privacy Policy</h2>
            <p>
              Your use of our website is also governed by our Privacy Policy, which can be found at{" "}
              <a
                href="https://book.trendcandy.io/privacy-policy"
                className="font-semibold text-[var(--color-primary)] underline"
              >
                https://book.trendcandy.io/privacy-policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">7. Disclaimer</h2>
            <p>
              The Site is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We
              make no warranties of any kind, express or implied, regarding the Site, including
              warranties of accuracy, reliability, or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">8. Changes</h2>
            <p>
              We may update these Terms and Conditions at any time by posting the revised terms on
              this page. Continued use of the Site after changes are posted constitutes acceptance
              of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">9. Contact Us</h2>
            <p>
              If you have questions about these Terms, email{" "}
              <a
                href="mailto:justin@trendcandy.io"
                className="font-semibold text-[var(--color-primary)] underline"
              >
                justin@trendcandy.io
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
