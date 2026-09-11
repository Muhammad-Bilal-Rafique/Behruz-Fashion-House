import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import FaqHero from "@/components/faqs/faq-hero";
import FaqList from "@/components/faqs/faq-list";
import FaqCTA from "@/components/faqs/faq-cta";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Behruz Fashion House",
  description:
    "Find answers to common questions about orders, Cash on Delivery, worldwide shipping, 2-day exchanges, sizing, and fabrics at Behruz Fashion House.",
  openGraph: {
    title: "Frequently Asked Questions | Behruz Fashion House",
    description:
      "Everything you need to know about ordering, delivery charges, exchange policy, and customer care at Behruz Fashion House.",
    type: "website",
  },
};

export default function FaqsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Existing Site Navbar */}
      <Navbar />

      {/* Main FAQ Content */}
      <main className="flex-1">
        {/* 1. FAQ Hero Section */}
        <FaqHero />

        {/* 2. FAQ Accordion Section */}
        <FaqList />

        {/* 3. Bottom CTA Section */}
        <FaqCTA />
      </main>

      {/* Existing Customer-side Footer */}
      <Footer />
    </div>
  );
}
