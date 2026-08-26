import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | TrendCandy",
  description:
    "How TrendCandy collects, uses, and protects personal information, including optional SMS consent, originator opt-in data, and STOP/HELP instructions.",
};

export default function PrivacyPolicyPage(): React.ReactElement {
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
        <h1 className="mt-4 text-4xl text-[var(--color-ink)] md:text-5xl">Privacy Policy</h1>

        <div className="mt-10 space-y-8 text-[1rem] leading-8 text-[var(--color-ink-muted)]">
          <p>
            Welcome to TrendCandy (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;,
            &quot;us&quot;)! We are committed to protecting your personal information and your
            right to privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website and use our services, including{" "}
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
            </a>{" "}
            (the &quot;Site&quot;). Using this website does not constitute SMS consent. Providing a
            phone number or submitting a form without checking the optional SMS box does not
            constitute consent to receive text messages.
          </p>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">1. Information We Collect</h2>
            <p>
              We may collect personal information that you voluntarily provide to us when you
              register on the website, participate in our surveys, book a Dream Headlines session,
              or otherwise contact us. This information may include:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company or role details you choose to provide</li>
              <li>Messages and project notes you submit</li>
              <li>Optional SMS consent status, if you check the SMS box</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">
              2. How We Use the Information We Collect
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Respond to inquiries and book Dream Headlines sessions</li>
              <li>Provide, operate, and maintain our website and services</li>
              <li>Deliver survey research, headlines, and related project work</li>
              <li>Communicate about scheduling, confirmations, reminders, and project updates</li>
              <li>Improve and personalize our website and offerings</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">SMS/Text Messaging</h2>
            <p>
              If you affirmatively check the optional SMS consent checkbox on our website form,
              TrendCandy may send you SMS/text messages. These messages may include inquiry
              responses, Dream Headlines session scheduling, appointment confirmations, reminders,
              and project updates. Providing a phone number or submitting the form without checking
              the SMS box does not constitute consent to receive text messages. Using this website
              does not constitute SMS consent.
            </p>
            <p className="mt-4">
              Message frequency may vary. Message and data rates may apply. Consent is not a
              condition of purchase. Reply STOP to opt out. Reply HELP for help or contact us at{" "}
              <a
                href="mailto:justin@trendcandy.io"
                className="font-semibold text-[var(--color-primary)] underline"
              >
                justin@trendcandy.io
              </a>
              .
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
            <p className="mt-4">
              Your phone number is used solely for communicating with you about the session or
              services you requested.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">4. Sharing Your Information</h2>
            <p>
              We do not share your personal information with third parties except as necessary to
              provide our services or as required by law.
            </p>
            <p className="mt-4">
              Your mobile information will not be sold or shared with third parties for promotional
              or marketing purposes. We will not share mobile information with third parties for
              promotional or marketing purposes. All the above categories exclude text messaging
              originator opt-in data and consent; this information will not be shared with any third
              parties. We will not share your opt-in to an SMS campaign with any third party for
              purposes unrelated to providing you with the services of that campaign. We may share
              your Personal Data, including your SMS opt-in or consent status, with third parties
              that help us provide our messaging services, including but not limited to platform
              providers, phone companies, and any other vendors who assist us in the delivery of
              text messages.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">5. Data Retention</h2>
            <p>
              We will retain your personal information only for as long as is necessary for the
              purposes set out in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">
              6. Your Data Protection Rights
            </h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal
              information:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>
                The right to access – You have the right to request copies of your personal data.
              </li>
              <li>
                The right to rectification – You have the right to request that we correct any
                information you believe is inaccurate.
              </li>
              <li>
                The right to erasure – You have the right to request that we erase your personal
                data, under certain conditions.
              </li>
            </ul>
            <p className="mt-4">
              SMS: Reply STOP to opt out of text messages at any time. Reply HELP for help.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">7. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our website
              and hold certain information. You can instruct your browser to refuse all cookies or
              to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">8. Security</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your
              personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">
              9. Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl text-[var(--color-ink)]">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, you can contact us:</p>
            <p className="mt-4">
              By email:{" "}
              <a
                href="mailto:justin@trendcandy.io"
                className="font-semibold text-[var(--color-primary)] underline"
              >
                justin@trendcandy.io
              </a>
            </p>
            <p className="mt-4">
              By visiting this page on our website:{" "}
              <a
                href="https://www.trendcandy.io/contact"
                className="font-semibold text-[var(--color-primary)] underline"
              >
                https://www.trendcandy.io/contact
              </a>
            </p>
            <p className="mt-4">
              Terms and Conditions:{" "}
              <a
                href="https://book.trendcandy.io/terms-and-conditions"
                className="font-semibold text-[var(--color-primary)] underline"
              >
                https://book.trendcandy.io/terms-and-conditions
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
