import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://behruzfashionhouse.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/products/*", "/about", "/contact", "/track-order", "/faqs"],
        disallow: ["/admin", "/admin/*", "/api/*", "/checkout", "/order-success/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
