import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ContactHero from "@/components/contact/contact-hero";
import ContactSection from "@/components/contact/contact-section";

export const metadata: Metadata = {
  title: "Contact Us | Behruz Fashion House",
  description:
    "Get in touch with Behruz Fashion House. Have a question about our collections, orders or bespoke couture? Our team is here to help.",
  openGraph: {
    title: "Contact Us | Behruz Fashion House",
    description:
      "We'd love to hear from you. Inquire about traditional & formal Pakistani couture, order status, and worldwide delivery.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Existing Site Navbar */}
      <Navbar />

      {/* Main Contact Content */}
      <main className="flex-1">
        <ContactHero />
        <ContactSection />
      </main>

      {/* Existing Customer-side Footer */}
      <Footer />
    </div>
  );
}
