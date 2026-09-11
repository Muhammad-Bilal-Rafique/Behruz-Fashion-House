import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import AboutHero from "@/components/about/about-hero";
import BrandIntro from "@/components/about/brand-intro";
import Philosophy from "@/components/about/philosophy";
import WhyBehruz from "@/components/about/why-behruz";
import AboutCTA from "@/components/about/about-cta";
import Footer from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "About Us | Behruz Fashion House",
  description:
    "Discover timeless Pakistani fashion crafted with elegance, detail and a modern sense of style at Behruz Fashion House.",
  openGraph: {
    title: "About Us | Behruz Fashion House",
    description:
      "Where fashion defines you. Discover timeless Pakistani couture, thoughtful fabrics, and contemporary elegance.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Existing Site Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* 1. About Hero Section */}
        <AboutHero />

        {/* 2. Brand Introduction */}
        <BrandIntro />

        {/* 3. Our Philosophy */}
        <Philosophy />

        {/* 4. Why Behruz */}
        <WhyBehruz />

        {/* 6. Final CTA */}
        <AboutCTA />
      </main>

      {/* Customer-side Footer */}
      <Footer />
    </div>
  );
}
