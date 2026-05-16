import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCTA } from "@/components/FloatingCTA";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBarSection } from "@/components/sections/TrustBarSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DeliverablesSection } from "@/components/sections/DeliverablesSection";
import { ClientWinsSection } from "@/components/sections/ClientWinsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { BookSection } from "@/components/sections/BookSection";

export const metadata: Metadata = {
  title: "Book a Dream Headlines Session | TrendCandy — B2B Survey Data, Done For You",
  description:
    "Done-for-you B2B survey research that becomes a year of thought-leadership content. Get cited in AI search, the press, and your buyer's inbox. Book a 30-minute Dream Headlines session.",
  openGraph: {
    title: "TrendCandy — B2B Survey Data, Done For You",
    description:
      "Original survey data that becomes your most valuable content and AI-search asset. Book a 30-min Dream Headlines session with Justin Ethington.",
    url: "https://book.trendcandy.io",
    siteName: "TrendCandy",
    locale: "en_US",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustBarSection />
        <ProblemSection />
        <HowItWorksSection />
        <DeliverablesSection />
        <ClientWinsSection />
        <AboutSection />
        <GuaranteeSection />
        <FAQSection />
        <BookSection />
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
