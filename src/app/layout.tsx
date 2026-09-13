import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import TopProgressBar from "@/components/shared/top-progress-bar";
import { getStoreSettings } from "@/lib/store-settings-server";
import { StoreSettingsProvider } from "@/components/providers/store-settings-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Behruz Fashion House | Luxury Pakistani Couture",
  description:
    "Timeless Pakistani fashion crafted for every occasion. Discover handcrafted bridal, luxury festive, and contemporary pret collections.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreSettingsProvider initialSettings={settings}>
          <TopProgressBar />
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </StoreSettingsProvider>
      </body>
    </html>
  );
}

