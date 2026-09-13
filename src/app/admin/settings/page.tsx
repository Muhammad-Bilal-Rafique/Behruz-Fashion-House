import { Metadata } from "next";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import { AdminSecurityCard } from "@/components/admin/settings/admin-security-card";
import { getSettingsAction } from "./actions";

export const metadata: Metadata = {
  title: "Store Settings | Admin | Behruz Fashion House",
  description: "Configure payment accounts, advance fees, shipping charges, and store contacts.",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettingsAction();

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Top Admin Navigation Bar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
        {/* Page Title Header */}
        <div className="border-b border-border/60 pb-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-medium mb-1.5">
            <span>STORE MANAGEMENT</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            Store Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Configure advance payment requirements, mobile wallets, bank transfer details, delivery charges, and customer support contacts.
          </p>
        </div>

        {/* Store Operations & Payment Settings Form */}
        <SettingsForm initialSettings={settings} />

        {/* Admin Security & Password Change Card */}
        <AdminSecurityCard />
      </main>
    </div>
  );
}
