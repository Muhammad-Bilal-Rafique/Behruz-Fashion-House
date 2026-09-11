import React from "react";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export function ShopBenefits() {
  return (
    <section
      aria-label="Brand Guarantees and Services"
      className="w-full mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-border/70"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {/* Benefit 1: Delivery */}
        <div className="flex items-start gap-4 p-5 rounded-xs bg-muted/20 border border-border/60">
          <div className="w-10 h-10 rounded-full bg-secondary/80 text-primary flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="font-serif text-base font-normal text-foreground tracking-tight mb-1">
              Nationwide & International Delivery
            </h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Express courier delivery across Pakistan within 3–5 business days. International delivery within 10 business days (charges calculated based on package weight).
            </p>
          </div>
        </div>

        {/* Benefit 2: Quality & Design */}
        <div className="flex items-start gap-4 p-5 rounded-xs bg-muted/20 border border-border/60">
          <div className="w-10 h-10 rounded-full bg-secondary/80 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="font-serif text-base font-normal text-foreground tracking-tight mb-1">
              Premium Pakistani Fashion
            </h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Thoughtfully designed pieces made for modern Pakistani style.
            </p>
          </div>
        </div>

        {/* Benefit 3: Exchange Policy */}
        <div className="flex items-start gap-4 p-5 rounded-xs bg-muted/20 border border-border/60">
          <div className="w-10 h-10 rounded-full bg-secondary/80 text-primary flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="font-serif text-base font-normal text-foreground tracking-tight mb-1">
              Hassle-Free Exchange Policy
            </h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Exchange available within 2 days for valid reasons on unused and unwashed articles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopBenefits;
