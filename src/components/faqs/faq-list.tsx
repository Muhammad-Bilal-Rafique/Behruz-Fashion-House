"use client";

import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

const FAQS_DATA: FaqItem[] = [
  {
    id: "faq-1",
    question: "How can I place an order?",
    answer:
      "You can place an order directly through our website. Select your desired article, choose the available size and colour, add it to your cart, and complete the checkout process.",
  },
  {
    id: "faq-2",
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes. Cash on Delivery is available for orders within Pakistan. Delivery charges are paid in advance, while the remaining amount is paid through Cash on Delivery.",
  },
  {
    id: "faq-3",
    question: "Do you offer international delivery?",
    answer:
      "Yes, we offer worldwide delivery. International shipping charges depend on the weight of the selected articles.",
  },
  {
    id: "faq-4",
    question: "How much is delivery within Pakistan?",
    answer:
      "Delivery charges within Pakistan range from PKR 350 to PKR 450.",
  },
  {
    id: "faq-5",
    question: "How are international shipping charges calculated?",
    answer:
      "Once you decide on the articles you would like to order, we check the applicable shipping rate based on the package weight and inform you of the shipping charges accordingly before proceeding with the order.",
  },
  {
    id: "faq-6",
    question: "What sizes are available?",
    answer:
      "Sizes vary depending on the article. Some designs are available in S, M, L, while others are available in S, M, L, XL. Available sizes are shown on each product page.",
  },
  {
    id: "faq-7",
    question: "What fabrics do you use?",
    answer:
      "Our collections include premium-quality fabrics such as Shamoz Silk and Chiffon. Fabric details are mentioned on individual product pages.",
  },
  {
    id: "faq-8",
    question: "Can I choose a different colour?",
    answer:
      "Colour availability depends on the design. Available colours and variants are displayed on the respective product page.",
  },
  {
    id: "faq-9",
    question: "What is your exchange policy?",
    answer:
      "Exchange is available within 2 days of receiving the order for a valid reason. The item must be unused and unwashed and should be returned in the same condition in which it was received.",
  },
  {
    id: "faq-10",
    question: "Do you offer refunds?",
    answer:
      "No. Behruz Fashion House does not offer refunds. Exchanges are available according to our exchange policy.",
  },
  {
    id: "faq-11",
    question: "Can I cancel my order?",
    answer:
      "Yes. An order can be cancelled before dispatch. Once the order has been dispatched, cancellation is no longer available.",
  },
  {
    id: "faq-12",
    question: "How can I contact Behruz Fashion House?",
    answer:
      "You can contact us through WhatsApp or phone at +92 335 462 3733 for product questions, orders, or other assistance.",
  },
  {
    id: "faq-13",
    question: "Where is Behruz Fashion House located?",
    answer: (
      <address className="not-italic leading-relaxed">
        <span className="font-normal text-foreground block">Behruz Fashion House</span>
        City Tower, Shop 3<br />
        Gulshan-e-Ravi, Lahore, Pakistan
      </address>
    ),
  },
];

export function FaqList() {
  return (
    <section
      aria-label="Frequently Asked Questions List"
      className="w-full bg-background py-10 sm:py-16"
    >
      <div className="max-w-[880px] mx-auto px-6 sm:px-8">
        <Accordion type="single" collapsible className="space-y-3.5 sm:space-y-4">
          {FAQS_DATA.map((faq, index) => (
            <AccordionItem key={faq.id} value={faq.id} className="rounded-none">
              <AccordionTrigger>
                <span className="text-[11px] sm:text-xs tracking-[0.2em] font-medium text-primary/75 mr-3 font-mono shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-muted-foreground font-light leading-relaxed">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default FaqList;
