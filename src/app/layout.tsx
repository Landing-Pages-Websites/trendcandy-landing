import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { QueryParamPersistence } from "@/components/QueryParamPersistence";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

// TrendCandy tracking IDs — sourced from Atlas task input_data
// (d7531759-43c2-4389-bb00-dcd83c4de4c7) plus Mega Admin site registration
// already created for this customer. Reuse site_key / site_id; do not
// create a new Mega site record (director scope note 2026-05-15).
const SITE_ID = "673c7de2-4564-4233-aed5-8c8c836a5ab1";
const SITE_KEY = "sk_mp4xe28w_25n8kg1u4cl";
const GTM_ID = "GTM-PD2L7FJC";
const META_PIXEL_ID = "447773674733262";

export const metadata: Metadata = {
  metadataBase: new URL("https://book.trendcandy.io"),
  title: {
    default: "Book a Dream Headlines Session | TrendCandy",
    template: "%s | TrendCandy",
  },
  description:
    "Done-for-you B2B survey research that becomes a year of thought-leadership content. Get cited in AI search, the press, and your buyer's inbox. Book a 30-minute Dream Headlines session.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        {/* MegaTag — siteId + endpoints + meta tag required for form_submit events */}
        <meta name="mega-site-id" content={SITE_ID} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.MEGA_TAG_CONFIG={siteKey:"${SITE_KEY}",siteId:"${SITE_ID}",gtmId:"${GTM_ID}",pixelId:"${META_PIXEL_ID}"};window.API_ENDPOINT="https://optimizer.gomega.ai";window.TRACKING_API_ENDPOINT="https://events-api.gomega.ai";`,
          }}
        />
        <script
          id="optimizer-script"
          src="https://cdn.gomega.ai/scripts/optimizer.min.js"
          data-site-id={SITE_ID}
          async
        />
        {/* GTM container — customer-specific (TrendCandy: GTM-PD2L7FJC) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-surface)] text-[var(--color-ink)]">
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* CallTrackingMetrics — required on every MEGA LP per AGENTS.md Build R4 */}
        <Script
          id="ctm-script"
          src="//572388.tctm.co/t.js"
          strategy="afterInteractive"
          async
        />
        <QueryParamPersistence />
        {children}
      </body>
    </html>
  );
}
