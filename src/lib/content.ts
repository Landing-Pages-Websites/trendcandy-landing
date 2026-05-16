// TrendCandy LP — source of truth for all page content.
// Atlas task: d7531759-43c2-4389-bb00-dcd83c4de4c7 (Build LP — TrendCandy)
// Customer: TrendCandy (a435618c-676f-4db6-ae7e-bf9e0926f28f)
// Director directive 2026-05-15: full rebuild — match brand on https://www.trendcandy.io/.
// Customer comment (Justin, 2026-05-14): "send all leads even if disqualified to keystone!
// no need to qualify or disqualify anything on the landing page this will be done later"
// → form is gateway, every fill posts to Keystone, on success reveal Calendly inline.

export type FAQ = {
  question: string;
  answer: string;
};

export type Deliverable = {
  title: string;
  body: string;
};

export type Result = {
  headline: string;
  context: string;
};

export type ClientLogo = {
  name: string;
  src: string;
};

export const BRAND = {
  name: "TrendCandy",
  fullName: "TrendCandy",
  tagline: "Original B2B survey data your team can publish all year.",
  positioning:
    "TrendCandy creates done-for-you B2B survey research that becomes the headline content marketers publish, journalists cite, and AI search engines surface. One survey, a year of data-backed thought leadership — at a budget young brands can afford.",
  shortPositioning:
    "Done-for-you B2B survey research for content marketing and AI search.",
  email: "info@trendcandy.io",
  calendlyUrl: "https://calendly.com/trendcandy/trendcandy-call-meta",
  parentSite: "https://www.trendcandy.io",
  primaryCtaLabel: "Book a Dream Headlines Session",
  primaryCtaShort: "Book a Call",
  primaryCtaAlt: "Get my survey plan",
  ctaSubLabel: "30 minutes · No commitment · Free survey concepts",
} as const;

// Trust-bar logos — clients TrendCandy has produced survey content for
// (from www.trendcandy.io homepage 2026-05-15). Local copies in /public/images.
export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "Adobe", src: "/images/client-adobe.png" },
  { name: "Deloitte", src: "/images/client-deloitte.png" },
  { name: "SAP", src: "/images/client-sap.png" },
  { name: "RingCentral", src: "/images/client-ringcentral.png" },
  { name: "Audible", src: "/images/client-audible.png" },
  { name: "Keeper", src: "/images/client-keeper.png" },
  { name: "Workvivo", src: "/images/client-workvivo.png" },
  { name: "CareerBuilder", src: "/images/client-careerbuilder.png" },
  { name: "Cart.com", src: "/images/client-cart.png" },
  { name: "HiddenLayer", src: "/images/client-hiddenlayer.png" },
  { name: "Valtix", src: "/images/client-valtix.png" },
];

// Top-of-page big stats — taken from spec messaging hooks
export const HERO_STATS: { value: string; label: string }[] = [
  { value: "71%", label: "of B2B brands are invisible in AI search without original data" },
  { value: "8x", label: "more engagement on data-backed content vs opinion posts" },
  { value: "13", label: "pieces of content the average B2B buyer reads before buying" },
];

export const RESULTS: Result[] = [
  {
    headline: "Covered by Harvard Business Review and CNBC",
    context: "Qualtrics — original survey data turned into tier-1 media wins.",
  },
  {
    headline: "#1 Lead-Generation Campaign of the year",
    context: "Intercom — gated survey insights drove 100K+ MQLs.",
  },
  {
    headline: "#1 Business Unit eBook of the year",
    context: "Adobe — survey-backed eBook out-converted everything else they shipped.",
  },
  {
    headline: "10x content engagement",
    context: "Mid-market SaaS — exclusive stats lifted engagement an order of magnitude.",
  },
  {
    headline: "4x live-demo registrations",
    context: "B2B platform — survey-led demand gen replaced thin gated assets.",
  },
  {
    headline: "Top-performing SEO asset",
    context: "Enterprise client — survey-backed page became the most-trafficked piece on the site.",
  },
];

// "Content Black Hole" / pain points re-framed for the LP audience.
export const PROBLEMS: { title: string; body: string }[] = [
  {
    title: "The Content Black Hole",
    body: "AI summarizers, infinite scroll, and a flood of generic LLM-written posts mean most B2B content disappears the day it's published. Without an original-data hook, your team is creating content nobody links to and nobody cites.",
  },
  {
    title: "71% of B2B brands are invisible in AI search",
    body: "ChatGPT, Perplexity, and Gemini cite the brands behind the data — not the brands rephrasing the data. If you're not publishing original stats, you're not getting cited, recommended, or referenced.",
  },
  {
    title: "Thought leadership built on opinion alone doesn't move buyers",
    body: "B2B buyers consume 13 pieces of content before they buy. Opinion posts blur into noise. Exclusive survey insights are the gravity well that pulls press, links, and pipeline back to your brand.",
  },
];

// "Done for You" deliverables — what TrendCandy actually ships.
export const DELIVERABLES: Deliverable[] = [
  {
    title: "Survey strategy & research questions",
    body: "We start with your category, your buyer, and the headlines you wish you owned — then design the survey to produce them. Every question is built backward from a publishable stat.",
  },
  {
    title: "Professional survey writing & programming",
    body: "Our team writes and programs the survey for engagement and statistical validity. No boring grids, no abandonment, no garbage data. Built for storytelling, not academic publication.",
  },
  {
    title: "Qualified-respondent recruiting",
    body: "We recruit hundreds of real, verified B2B respondents in your target audience — by role, company size, industry, geography, or buying authority. Panel quality you can defend on a press call.",
  },
  {
    title: "High-engagement survey delivery",
    body: "Tight, mobile-friendly experiences with completion rates that produce real numbers — not the noise you get from low-cost panels.",
  },
  {
    title: "Data analysis & headline mining",
    body: "We comb the dataset for the angles a content marketer can actually use: counter-intuitive findings, generational splits, regional surprises, the contrarian quote your CEO will love.",
  },
  {
    title: "Headline writing & content creation",
    body: "Every project ends with a list of plug-and-play headlines, charts, social hooks, and short-form copy. One survey delivers a year of campaigns — without you starting from a blank page.",
  },
];

// How it works — 3-step process.
export const HOW_IT_WORKS: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Discovery & survey strategy",
    body: "We meet, learn your goals, your audience, and the headlines you wish you owned. We come back with 2–3 survey concepts and the exact stats each one is built to produce.",
  },
  {
    step: "02",
    title: "Fielding & analysis",
    body: "We write, program, and field the survey to verified B2B respondents in your target segment. Then we comb the data for publishable angles, contrarian findings, and ready-to-publish headlines.",
  },
  {
    step: "03",
    title: "A year of content, ready to ship",
    body: "You receive a headline bank, chart-ready data, social hooks, and short-form copy — enough to fuel a year of eBooks, blog posts, press pitches, infographics, and AI-search-friendly assets.",
  },
];

// Justin Ethington — about block.
export const AUTHORITY = {
  name: "Justin Ethington",
  title: "Founder, TrendCandy",
  bullets: [
    "Built and ran in-house survey research and content marketing programs at Qualtrics — the team behind the original-data engine that won HBR + CNBC coverage.",
    "Has shipped survey-backed content for Intercom, Adobe, Deloitte, SAP, Zoom, RingCentral, Audible, and a long list of B2B SaaS leaders.",
    "Obsessed with one question: what's the headline a journalist would actually pick up? Every TrendCandy survey is built backward from there.",
  ],
  cta: "Talk to Justin directly",
};

// Satisfaction-guarantee callout — from spec.
export const GUARANTEE = {
  title: "The Dream Headlines Guarantee",
  body:
    "If your TrendCandy survey doesn't double the engagement of comparable content on your channels, we keep working the data until it does — or we work for free. It's that simple.",
};

// "Who this is for" — explicit qualifier copy, on-page only (no form gating).
export const WHO_FOR = {
  yes: [
    "B2B companies who want to PUBLISH survey data externally — press, content, lead-gen, AI-search visibility.",
    "Content marketing, demand-gen, PR, and brand teams at SaaS, services, and B2B platforms.",
    "Brands tired of thin AI-generated content and ready to own a data narrative competitors can't copy.",
  ],
  no: [
    "Internal-only research projects — product naming, pricing tests, employee surveys, internal NPS.",
    "Academic, white-paper-only studies where the data won't be turned into public content.",
  ],
};

export const FAQS: FAQ[] = [
  {
    question: "Who is this for?",
    answer:
      "B2B companies that want to publish original survey data externally — as press, content, gated assets, AI-search citations, or sales enablement. TrendCandy is NOT a fit for internal-only research like product naming, pricing tests, or employee surveys. If you want a data narrative competitors can't copy, you're in the right place.",
  },
  {
    question: "What does a typical TrendCandy survey cost?",
    answer:
      "Most custom B2B surveys start at $5,000 all in — strategy, writing, programming, recruiting, analysis, and a headline bank. The investment scales with audience size, segmentation depth, and how many publishable angles you need. We'll quote yours on the discovery call.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most surveys are fielded and analyzed in 2–3 weeks from kickoff. Headline-ready data, charts, and copy follow within a week of fielding wrap. That's faster than a typical content-marketing sprint and 10x faster than a traditional research firm.",
  },
  {
    question: "Will the data be exclusive to my brand?",
    answer:
      "Yes. Every survey is custom-built for one client and never resold, repackaged, or syndicated. The headlines, the dataset, the charts — all yours, all exclusive, ready to publish under your brand.",
  },
  {
    question: "Do you write the content too, or just deliver the data?",
    answer:
      "Both. Every project ends with a headline bank, chart-ready visuals, social hooks, and short-form copy your team can use immediately. If you want help shaping the final eBook or press pitch, we partner with content teams to take the data to publication.",
  },
  {
    question: "What's the Dream Headlines Guarantee?",
    answer:
      "If your TrendCandy survey doesn't double the engagement of comparable content on your channels, we keep working the data — pulling new angles, re-cutting the dataset — until it does. If it still hasn't moved the needle, we work for free until it does. We've never had to.",
  },
];
