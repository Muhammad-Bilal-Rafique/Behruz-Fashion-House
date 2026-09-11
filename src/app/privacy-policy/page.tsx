import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import LegalHero from "@/components/legal/legal-hero";
import LegalSection from "@/components/legal/legal-section";
import LegalContactCard from "@/components/legal/legal-contact-card";

export const metadata: Metadata = {
  title: "Privacy Policy | Behruz Fashion House",
  description:
    "Learn how Behruz Fashion House collects, uses, and safeguards your personal details and order information with transparency and care.",
  openGraph: {
    title: "Privacy Policy | Behruz Fashion House",
    description:
      "Transparency regarding customer privacy, order information, communication, and website operations at Behruz Fashion House.",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Existing Site Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Editorial Hero */}
        <LegalHero
          eyebrow="LEGAL"
          heading="Privacy Policy"
          description="Your privacy matters to us. This policy explains how Behruz Fashion House handles information provided through our website."
        />

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16">
          <div className="divide-y divide-border/60">
            {/* Section 1: Information We Collect */}
            <LegalSection
              id="information-we-collect"
              index={1}
              title="Information We Collect"
            >
              <p>
                We may collect personal information that you provide when interacting with our website, including when you:
              </p>
              <ul className="space-y-2 pl-1 sm:pl-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Place an order for our fashion collections</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Contact or reach out to our team with inquiries</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Submit information through website forms</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Communicate with Behruz Fashion House regarding products, bespoke designs, or existing orders</span>
                </li>
              </ul>
              <p className="pt-2">
                The information collected may include your:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1 sm:pl-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
                  <span>Full name</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
                  <span>Contact number and WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
                  <span>Email address</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
                  <span>Delivery address &amp; destination details</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
                  <span>Order and article selections</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" aria-hidden="true" />
                  <span>Messages submitted through contact forms</span>
                </li>
              </ul>
            </LegalSection>

            {/* Section 2: How We Use Your Information */}
            <LegalSection
              id="how-we-use-your-information"
              index={2}
              title="How We Use Your Information"
            >
              <p>
                The information collected is used solely to provide and maintain our services to you, including:
              </p>
              <ul className="space-y-2 pl-1 sm:pl-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Processing, fulfilling, and managing your orders</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Communicating with you regarding order confirmations, shipping rates, and updates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Responding to your inquiries and product questions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Providing helpful and responsive customer support</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Improving our website experience, navigation, and usability</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                  <span>Managing general website operations and security</span>
                </li>
              </ul>
            </LegalSection>

            {/* Section 3: Order Information */}
            <LegalSection
              id="order-information"
              index={3}
              title="Order Information"
            >
              <p>
                Information provided during checkout is used specifically to process, verify, and fulfill your order, coordinate delivery through appropriate courier channels, and communicate directly with you regarding the progress and status of your purchase.
              </p>
            </LegalSection>

            {/* Section 4: Communication */}
            <LegalSection
              id="communication"
              index={4}
              title="Communication"
            >
              <p>
                You may contact Behruz Fashion House directly through the contact numbers, WhatsApp, email address, or contact forms provided on our website. We use these channels exclusively to answer questions, provide design guidance, clarify measurements, or assist with order-related inquiries.
              </p>
            </LegalSection>

            {/* Section 5: Third-Party Services */}
            <LegalSection
              id="third-party-services"
              index={5}
              title="Third-Party Services"
            >
              <p>
                To provide you with a reliable online experience, certain website functions may rely on trusted third-party service providers. These providers help us operate the website, manage electronic communications, host infrastructure, or deliver technical services necessary for smooth digital operations. These parties only have access to information required to perform their specific functions on our behalf.
              </p>
            </LegalSection>

            {/* Section 6: Data Security */}
            <LegalSection
              id="data-security"
              index={6}
              title="Data Security"
            >
              <p>
                We take reasonable measures to protect information handled through our website. However, no online system can be guaranteed to be completely secure, and we encourage you to protect your personal communication channels accordingly.
              </p>
            </LegalSection>

            {/* Section 7: Policy Updates */}
            <LegalSection
              id="policy-updates"
              index={7}
              title="Policy Updates"
            >
              <p>
                Behruz Fashion House may update this Privacy Policy from time to time when necessary to reflect changes in our practices or website operations. Any revised version will be published directly on this page with immediate effect.
              </p>
            </LegalSection>

            {/* Section 8: Contact Us */}
            <LegalSection
              id="contact-us"
              index={8}
              title="Contact Us"
            >
              <p>
                If you have questions about this Privacy Policy or how your information is handled, please reach out to us:
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
