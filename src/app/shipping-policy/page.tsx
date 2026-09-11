import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import LegalHero from "@/components/legal/legal-hero";
import LegalSection from "@/components/legal/legal-section";
import LegalContactCard from "@/components/legal/legal-contact-card";

export const metadata: Metadata = {
  title: "Shipping Policy | Behruz Fashion House",
  description:
    "Everything you need to know about delivery and shipping with Behruz Fashion House, including domestic rates, worldwide delivery, and order cancellation guidelines.",
  openGraph: {
    title: "Shipping Policy | Behruz Fashion House",
    description:
      "Review shipping rates, domestic delivery across Pakistan, weight-based international shipping, and dispatch guidelines.",
    type: "website",
  },
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Existing Site Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Editorial Hero */}
        <LegalHero
          eyebrow="POLICIES"
          heading="Shipping Policy"
          description="Everything you need to know about delivery and shipping with Behruz Fashion House."
        />

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16">
          <div className="divide-y divide-border/60">
            {/* Section 1: Pakistan Delivery */}
            <LegalSection
              id="pakistan-delivery"
              index={1}
              title="Pakistan Delivery"
            >
              <p>
                We offer delivery across Pakistan. Delivery charges range from PKR 350 to PKR 450 depending on the applicable delivery service and destination.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground/90 italic">
                Please note that delivery timelines may vary based on courier schedules, regional logistics, and destination accessibility.
              </p>
            </LegalSection>

            {/* Section 2: International Delivery */}
            <LegalSection
              id="international-delivery"
              index={2}
              title="International Delivery"
            >
              <p>
                We offer worldwide delivery. International shipping charges are calculated according to the weight of the selected articles.
              </p>
            </LegalSection>

            {/* Section 3: International Shipping Charges */}
            <LegalSection
              id="international-shipping-charges"
              index={3}
              title="International Shipping Charges"
            >
              <p>
                For international orders, the customer first selects the desired articles. We then check the applicable shipping rate based on the package weight and inform the customer of the shipping charges before proceeding with the order.
              </p>
            </LegalSection>

            {/* Section 4: Order Cancellation */}
            <LegalSection
              id="order-cancellation"
              index={4}
              title="Order Cancellation"
            >
              <p>
                An order can be cancelled before it is dispatched. Once an order has been dispatched, cancellation is no longer available.
              </p>
            </LegalSection>

            {/* Section 5: Need Help? */}
            <LegalSection
              id="need-help"
              index={5}
              title="Need Help?"
            >
              <p>
                If you have any questions about delivery or shipping charges, please contact Behruz Fashion House.
              </p>

              <LegalContactCard
                showButton={true}
                buttonText="Contact Us"
                buttonHref="/contact"
                showAddress={false}
              />
            </LegalSection>
          </div>
        </div>
      </main>

      {/* Existing Customer-side Footer */}
      <Footer />
    </div>
  );
}
