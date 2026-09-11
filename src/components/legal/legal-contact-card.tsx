import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

interface LegalContactCardProps {
  showButton?: boolean;
  buttonText?: string;
  buttonHref?: string;
  className?: string;
  showAddress?: boolean;
}

export function LegalContactCard({
  showButton = false,
  buttonText = "Contact Us",
  buttonHref = "/contact",
  className = "",
  showAddress = true,
}: LegalContactCardProps) {
  return (
    <div
      className={`mt-6 p-6 sm:p-8 bg-muted/30 border border-border/80 rounded-none ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Phone / WhatsApp */}
        <div className="space-y-1.5">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-primary font-medium block">
            PHONE / WHATSAPP
          </span>
          <a
            href="tel:+923354623733"
            className="inline-flex items-center gap-2 text-sm font-normal text-foreground hover:text-primary transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.5} />
            <span>+92 335 462 3733</span>
          </a>
          <p className="text-xs text-muted-foreground font-light">
            Available for inquiries and order assistance.
          </p>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-primary font-medium block">
            EMAIL
          </span>
          <a
            href="mailto:fahadmalik8689@gmail.com"
            className="inline-flex items-center gap-2 text-sm font-normal text-foreground hover:text-primary transition-colors break-all"
          >
            <Mail className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.5} />
            <span>fahadmalik8689@gmail.com</span>
          </a>
          <p className="text-xs text-muted-foreground font-light">
            We respond to written inquiries promptly.
          </p>
        </div>

        {/* Studio Address */}
        {showAddress && (
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-primary font-medium block">
              STUDIO LOCATION
            </span>
            <div className="flex items-start gap-2 text-sm text-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
              <address className="not-italic text-xs leading-relaxed text-muted-foreground font-light">
                <span className="font-normal text-foreground block">Behruz Fashion House</span>
                City Tower, Shop 3<br />
                Gulshan-e-Ravi, Lahore, Pakistan
              </address>
            </div>
          </div>
        )}
      </div>

      {showButton && (
        <div className="mt-6 sm:mt-8 pt-6 border-t border-border/60 flex items-center justify-start">
          <Link
            href={buttonHref}
            className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-primary text-white text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 ease-out hover:opacity-95 hover:shadow-xs hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span>{buttonText}</span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Link>
        </div>
      )}
    </div>
  );
}

export default LegalContactCard;
