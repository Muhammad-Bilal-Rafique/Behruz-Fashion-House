"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Globe, ArrowRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStoreSettings } from "@/components/providers/store-settings-provider";
import { submitContactAction } from "@/app/contact/actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  SOCIAL_LINKS,
} from "@/components/shared/social-icons";

export function ContactSection() {
  const settings = useStoreSettings();
  const contactEmail = settings.supportEmail || "behruzfashionhouse@gmail.com";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", message: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
      isValid = false;
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await submitContactAction(formData);
      if (res.success) {
        toast.success("Thank you for reaching out! Your message has been sent to our team.");
        setFormData({ name: "", email: "", message: "" });
        setErrors({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to send message", {
          description: res.error || "Please try again or contact us directly on WhatsApp.",
        });
      }
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error("An error occurred. Please contact us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Contact Details and Form"
      className="relative w-full bg-background py-16 sm:py-24"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ============================================================ */}
          {/* LEFT COLUMN: Contact Information                             */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col space-y-8"
          >
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-2">
                REACH OUT
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground mb-4">
                Contact Information
              </h2>
              <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-md">
                Whether you need styling consultations, sizing advice, or assistance with
                an existing order, reach out directly or send us a message.
              </p>
            </div>

            {/* Direct Contact List */}
            <div className="pt-6 border-t border-border/80 space-y-5">
              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0 text-primary mt-0.5 bg-muted/20">
                  <Phone className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-0.5">
                    Phone / WhatsApp
                  </span>
                  <a
                    href="tel:+923354623733"
                    className="text-sm sm:text-base font-normal text-foreground hover:text-primary transition-colors duration-200"
                    aria-label="Call +92 335 462 3733"
                  >
                    +92 335 462 3733
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0 text-primary mt-0.5 bg-muted/20">
                  <Mail className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-0.5">
                    Email Inquiries
                  </span>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm sm:text-base font-normal text-foreground hover:text-primary transition-colors duration-200"
                    aria-label={`Email ${contactEmail}`}
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>

              {/* Store Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0 text-primary mt-0.5 bg-muted/20">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-0.5">
                    Store Address
                  </span>
                  <p className="text-sm sm:text-base font-normal text-foreground leading-snug">
                    Behruz Fashion House<br />
                    City Tower Shop 3<br />
                    Gulshan E Ravi Lahore
                  </p>
                </div>
              </div>

              {/* Delivery */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0 text-primary mt-0.5 bg-muted/20">
                  <Globe className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-0.5">
                    Shipping
                  </span>
                  <p className="text-sm sm:text-base font-normal text-foreground">
                    Worldwide Delivery
                  </p>
                </div>
              </div>

              {/* Quick Social Channels */}
              <div className="pt-4 border-t border-border/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-0.5">
                    Social Channels
                  </span>
                  <p className="text-xs text-muted-foreground font-light">
                    Follow @behruzfashionhouse
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.instagram.com/behruzfashionhouse/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow on Instagram"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    <InstagramIcon className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@behruzfashionhouse"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow on TikTok"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    <TikTokIcon className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://www.facebook.com/Behruzfashionhouse"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow on Facebook"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    <FacebookIcon className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Contact Form                                   */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-7 bg-background border border-border/80 p-6 sm:p-10"
          >
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground mb-2">
              Send a Message
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-light mb-8">
              Fill out the form below and we will be delighted to assist you.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-[11px] uppercase tracking-[0.2em]">
                  Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="Your full name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`h-11 text-xs sm:text-sm ${errors.name ? "border-primary focus-visible:border-primary" : ""}`}
                />
                {errors.name && (
                  <p id="name-error" className="text-xs text-primary font-light">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-[11px] uppercase tracking-[0.2em]">
                  Email Address <span className="text-primary">*</span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="your.email@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`h-11 text-xs sm:text-sm ${errors.email ? "border-primary focus-visible:border-primary" : ""}`}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-primary font-light">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-[11px] uppercase tracking-[0.2em]">
                  Message <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: "" });
                  }}
                  placeholder="Tell us how we can assist you..."
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={`resize-y text-xs sm:text-sm ${errors.message ? "border-primary focus-visible:border-primary" : ""}`}
                />
                {errors.message && (
                  <p id="message-error" className="text-xs text-primary font-light">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 h-auto text-xs uppercase tracking-[0.22em] font-medium bg-primary text-white hover:bg-primary/95 transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </div>

              {/* 4. Support Note */}
              <div className="pt-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  For order-related questions, please include your order details so we can
                  assist you more quickly.
                </p>
              </div>
            </form>
          </motion.div>
        </div>

        {/* ============================================================ */}
        {/* DEDICATED SOCIAL MEDIA SECTION                                */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-border/80"
        >
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-2">
              CONNECT WITH US
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
              Follow Us on Social Media
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-light mt-2 leading-relaxed">
              Stay connected with Behruz Fashion House for seasonal collections, craftsmanship videos, and exclusive previews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {SOCIAL_LINKS.map((social) => {
              const IconComponent = social.Icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Behruz Fashion House on ${social.name}`}
                  className="group relative p-6 bg-background border border-border/80 hover:border-primary/60 transition-all duration-300 hover:shadow-xs flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-primary mb-4 bg-muted/20 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <IconComponent className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                    {social.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-light mb-2.5">
                    {social.handle}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 font-light leading-relaxed mb-5 line-clamp-2">
                    {social.description}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium tracking-wide mt-auto group-hover:translate-x-0.5 transition-transform">
                    <span>{social.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactSection;
