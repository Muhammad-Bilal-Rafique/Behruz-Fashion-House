import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AddProductForm } from "@/components/admin/add-product-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Add Product | Product Management | Admin | Behruz Fashion House",
  description: "Create a new product for the Behruz Fashion House store.",
};

export default function AddProductPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Admin Navigation Bar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Page Title Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-medium mb-2">
            <span>PRODUCT MANAGEMENT</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
                Add Product
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Create a new product for the Behruz Fashion House store.
              </p>
            </div>
            <div>
              <Link href="/admin/products">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Products</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Add Product Form Component */}
        <AddProductForm />
      </main>
    </div>
  );
}
