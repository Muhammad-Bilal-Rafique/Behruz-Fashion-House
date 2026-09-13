import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import LegalHero from "@/components/legal/legal-hero";
import LegalSection from "@/components/legal/legal-section";
import LegalContactCard from "@/components/legal/legal-contact-card";

export const metadata: Metadata = {
  title: "Terms & Conditions | Behruz Fashion House",
  description:
    "Review our terms and conditions, order guidelines, exchange policy, Cash on Delivery procedures, and intellectual property rights at Behruz Fashion House.",
  openGraph: {
    title: "Terms & Conditions | Behruz Fashion House",
    description:
      "Important terms and conditions governing the use of Behruz Fashion House website, orders, exchanges, and customer policies.",
    type: "website",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Existing Site Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Editorial Hero */}
        <LegalHero
          eyebrow="LEGAL"
          heading="Terms & Conditions"
          description="Please review these terms before using the Behruz Fashion House website or placing an order."
        />

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16">
          <div className="divide-y divide-border/60">
            {/* Section 1: General */}
            <LegalSection
              id="general"
              index={1}
              title="General"
            >
              <p>
                By accessing and using this website, browsing our collections, or placing an order with Behruz Fashion House, you agree to comply with and be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use our website.
              </p>
            </LegalSection>

            {/* Section 2: Products & Product Information */}
            <LegalSection
              id="products-and-information"
              index={2}
              title="Products & Product Information"
            >
              <p>
                Behruz Fashion House makes reasonable efforts to present products, images, colours, sizes, fabrics, descriptions, and prices as accurately as possible.
              </p>
              <p>
                Please note that actual product colours and fabric tones may appear slightly different depending on the calibration, display settings, and lighting of your screen or device.
              </p>
            </LegalSection>

            {/* Section 3: Orders */}
            <LegalSection
              id="orders"
              index={3}
              title="Orders"
            >
              <p>
                Customers are responsible for providing complete, accurate, and up-to-date information when placing an order, including contact number, delivery address, and chosen specifications.
              </p>
              <p>
                Behruz reserves the right to contact the customer via phone or WhatsApp to verify or confirm order details prior to processing.
              </p>
            </LegalSection>

            {/* Section 4: Payment Policy & Cash on Delivery */}
            <LegalSection
              id="cash-on-delivery"
              index={4}
              title="Payment Policy & Cash on Delivery"
            >
              <p>
                A PKR 1,000 advance payment is mandatory to confirm every order. After placing an order, payment instructions are provided to the customer to submit the advance payment. For orders within Pakistan, the remaining balance is paid through Cash on Delivery upon receipt of the parcel. Orders are processed and dispatched only after the PKR 1,000 advance payment is manually verified.
              </p>
            </LegalSection>

            {/* Section 5: Delivery */}
            <LegalSection
              id="delivery"
              index={5}
              title="Delivery"
            >
              <p>
                Pakistan delivery charges range from PKR 350 to PKR 450 depending on the delivery service and destination.
              </p>
              <p>
                For international orders, shipping charges are calculated according to the weight of the selected articles and communicated to the customer before proceeding with the order.
              </p>
            </LegalSection>

            {/* Section 6: Order Cancellation */}
            <LegalSection
              id="order-cancellation"
              index={6}
              title="Order Cancellation"
            >
              <p>
                Orders may be cancelled before dispatch. Once an order has been dispatched, cancellation is no longer available.
              </p>
            </LegalSection>

            {/* Section 7: Exchange Policy */}
            <LegalSection
              id="exchange-policy"
              index={7}
              title="Exchange Policy"
            >
              <div className="p-4 sm:p-5 bg-secondary/40 border border-primary/20 rounded-none mb-3">
                <p className="font-medium text-foreground text-sm sm:text-base">
                  Exchanges are available within 2 days of receiving the order for a valid reason.
                </p>
              </div>
              <p>
                Items must be unused and unwashed and must be returned in the same condition in which they were received, with all original tags and packaging intact.
              </p>
            </LegalSection>

            {/* Section 8: Refund Policy */}
            <LegalSection
              id="refund-policy"
              index={8}
              title="Refund Policy"
            >
              <div className="p-4 sm:p-5 bg-muted/40 border border-border rounded-none">
                <p className="font-medium text-foreground text-sm sm:text-base">
                  Behruz Fashion House does not offer refunds.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-light">
                  All sales are final once concluded, subject only to our 2-day exchange policy for valid reasons.
                </p>
              </div>
            </LegalSection>

            {/* Section 9: Website Use */}
            <LegalSection
              id="website-use"
              index={9}
              title="Website Use"
            >
              <p>
                Users agree to use the website solely for lawful purposes. You must not misuse, disrupt, impair, or attempt to interfere with the proper working or security of this website, its servers, or its connected networks.
              </p>
            </LegalSection>

            {/* Section 10: Intellectual Property */}
            <LegalSection
              id="intellectual-property"
              index={10}
              title="Intellectual Property"
            >
              <p>
                All content appearing on this website—including but not limited to the brand name &ldquo;Behruz Fashion House&rdquo;, logo, product designs, photographs, graphics, text, and visual identity—is the exclusive property of Behruz Fashion House or is used under proper authorization.
              </p>
              <p>
                No material or content from this website may be copied, reproduced, republished, downloaded, posted, transmitted, or distributed in any manner without prior written consent from Behruz Fashion House.
              </p>
            </LegalSection>

            {/* Section 11: Changes to These Terms */}
            <LegalSection
              id="changes-to-terms"
              index={11}
              title="Changes to These Terms"
            >
              <p>
                Behruz Fashion House reserves the right to update or modify these Terms &amp; Conditions when necessary. Any revisions will take effect immediately upon being posted on this page.
              </p>
            </LegalSection>

            {/* Section 12: Contact */}
            <LegalSection
              id="contact"
              index={12}
              title="Contact"
            >
              <p>
                If you have any questions or require clarification regarding these Terms &amp; Conditions, please contact us:
              </p>

              <LegalContactCard
                showButton={false}
                showAddress={true}
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
