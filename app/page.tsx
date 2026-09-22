import { About } from "@/components/sections/about";
import { Faq } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Insights } from "@/components/sections/insights";
import { Invest } from "@/components/sections/invest";
import { Overview } from "@/components/sections/overview";
import { faq, mintoMeta } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: mintoMeta.name,
    description: mintoMeta.description,
    url: siteUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "iOS, Android",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", bestRating: "5", ratingCount: "50000" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

export default function MintoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <About />
      <Overview />
      <Invest />
      <Insights />
      <Faq />
      <Footer />
    </>
  );
}
