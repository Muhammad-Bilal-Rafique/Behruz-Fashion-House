import React from "react";

export interface IconProps {
  className?: string;
  strokeWidth?: number;
}

export function InstagramIcon({
  className = "w-4 h-4",
  strokeWidth = 1.5,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function TikTokIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .55.04.81.1V9.41a6.37 6.37 0 0 0-.81-.05A6.33 6.33 0 0 0 3 15.69 6.33 6.33 0 0 0 9.33 22a6.33 6.33 0 0 0 6.34-6.31V8.65a8.28 8.28 0 0 0 4.92 1.6V6.8a4.88 4.88 0 0 1-1-.11z" />
    </svg>
  );
}

export function FacebookIcon({
  className = "w-4 h-4",
  strokeWidth = 1.5,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    handle: "@behruzfashionhouse",
    href: "https://www.instagram.com/behruzfashionhouse/",
    description: "Couture releases, bridal previews & runway looks",
    actionText: "Follow on Instagram",
    Icon: InstagramIcon,
  },
  {
    name: "TikTok",
    handle: "@behruzfashionhouse",
    href: "https://www.tiktok.com/@behruzfashionhouse",
    description: "Styling tips, fabric craftsmanship & studio reels",
    actionText: "Watch on TikTok",
    Icon: TikTokIcon,
  },
  {
    name: "Facebook",
    handle: "Behruzfashionhouse",
    href: "https://www.facebook.com/Behruzfashionhouse",
    description: "Customer community, collections & announcements",
    actionText: "Join on Facebook",
    Icon: FacebookIcon,
  },
];
