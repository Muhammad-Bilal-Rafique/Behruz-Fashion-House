import { Metadata } from "next";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { HeroEditForm } from "@/components/admin/hero-edit-form";

export const metadata: Metadata = {
  title: "Edit Website - Hero Management | Admin | Behruz Fashion House",
  description: "Manage homepage hero section content, call-to-action buttons, and photography.",
};

export default function EditWebsitePage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Top Admin Navigation / Header Bar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Page Title Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-medium mb-2">
            <span>Website Management</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            Edit Website
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Update your storefront homepage configuration. Changes made here
            are immediately reflected across the website.
          </p>
        </div>

        {/* Hero Management Card */}
        <HeroEditForm />
      </main>
    </div>
  );
}
