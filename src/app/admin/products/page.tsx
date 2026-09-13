import { Metadata } from "next";
import Link from "next/link";
import { Plus, Package, PackagePlus, AlertCircle } from "lucide-react";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { Button } from "@/components/ui/button";
import { ProductSearchFilter } from "@/components/admin/products/product-search-filter";
import { ProductRow, SerializedProduct } from "@/components/admin/products/product-row";
import { ProductPagination } from "@/components/admin/products/product-pagination";

export const metadata: Metadata = {
  title: "Products Management | Admin | Behruz Fashion House",
  description: "Manage your products, pricing, inventory and availability.",
};

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

// Helper to escape regex special characters
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const search = (resolvedParams.search || "").trim();
  const statusFilter = resolvedParams.status || "all";

  let dbError: string | null = null;
  let totalProductsCount = 0;
  let activeProductsCount = 0;
  let draftProductsCount = 0;
  let matchingCount = 0;
  let products: SerializedProduct[] = [];

  try {
    await connectDB();

    // 1. Fetch live metrics across entire database in parallel
    const [total, active, draft] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "draft" }),
    ]);

    totalProductsCount = total;
    activeProductsCount = active;
    draftProductsCount = draft;

    // 2. Build filtered query for list display
    const query: Record<string, any> = {};

    if (statusFilter === "active" || statusFilter === "draft") {
      query.status = statusFilter;
    }

    if (search) {
      query.name = { $regex: escapeRegex(search), $options: "i" };
    }

    // 3. Count matching documents for pagination
    matchingCount = await Product.countDocuments(query);

    // 4. Fetch paginated products slice
    const rawProducts = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .select("name originalPrice discountedPrice description sizes sizeStock images status isFeatured createdAt")
      .lean();

    // 5. Serialize safely for Client Component props
    products = rawProducts.map((doc: any) => ({
      _id: String(doc._id),
      name: doc.name || "Untitled Product",
      originalPrice: Number(doc.originalPrice ?? doc.price ?? 0),
      discountedPrice: Number(doc.discountedPrice ?? doc.price ?? doc.originalPrice ?? 0),
      description: doc.description || "",
      sizes: Array.isArray(doc.sizes) ? doc.sizes : [],
      sizeStock: Array.isArray(doc.sizeStock)
        ? doc.sizeStock.map((s: any) => ({ size: String(s.size), stock: Number(s.stock) || 0 }))
        : (doc.sizes || []).map((s: string) => ({ size: s, stock: 0 })),
      images: Array.isArray(doc.images)
        ? doc.images.map((img: any) => ({
            url: img.url,
            publicId: img.publicId,
            isCover: Boolean(img.isCover),
          }))
        : [],
      status: doc.status === "draft" ? "draft" : "active",
      isFeatured: Boolean(doc.isFeatured),
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("Error loading products in /admin/products:", error);
    dbError = error.message || "Failed to establish database connection.";
  }

  const totalPages = Math.ceil(matchingCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-muted/20 pb-20 selection:bg-primary/20 selection:text-primary">
      {/* Admin Top Navigation */}
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-medium mb-1">
              <span>CATALOGUE MANAGEMENT</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
              Products
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Manage your products, pricing, inventory and availability.
            </p>
          </div>

          {/* Header Action: Add Product */}
          <div className="flex items-center gap-2">
            <Link href="/admin/add-product">
              <Button
                variant="default"
                size="sm"
                className="gap-2 text-xs h-9 px-4 rounded-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Database Connection Error Notice */}
        {dbError && (
          <div className="p-4 rounded-xs border border-red-200 bg-red-50 text-red-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to connect to database</p>
              <p className="mt-0.5 text-red-700">{dbError}</p>
            </div>
          </div>
        )}

        {/* Product Summary Metric Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Total Products */}
          <div className="p-4 rounded-xs border border-border bg-card shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Total Products
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-foreground block tabular-nums">
                {totalProductsCount}
              </span>
              <span className="text-xs text-muted-foreground">Products</span>
            </div>
          </div>

          {/* Active Products */}
          <div className="p-4 rounded-xs border border-emerald-200/80 bg-emerald-50/40 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
              Active
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-emerald-900 block tabular-nums">
                {activeProductsCount}
              </span>
              <span className="text-xs text-emerald-700">Live in Shop</span>
            </div>
          </div>

          {/* Draft Products */}
          <div className="p-4 rounded-xs border border-amber-200/80 bg-amber-50/40 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">
              Draft
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-amber-900 block tabular-nums">
                {draftProductsCount}
              </span>
              <span className="text-xs text-amber-700">Unpublished</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <ProductSearchFilter
          currentSearch={search}
          currentStatus={statusFilter}
        />

        {/* Product Rows List */}
        <div className="space-y-3">
          {products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <ProductRow key={product._id} product={product} />
              ))}
            </div>
          ) : totalProductsCount === 0 && !search && statusFilter === "all" ? (
            /* Global Empty State: No products in DB yet */
            <div className="py-20 text-center space-y-4 px-4 border border-border rounded-xs bg-card">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <PackagePlus className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif text-lg font-normal text-foreground">
                  No products yet
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add your first product to start building the Behruz Fashion House collection.
                </p>
              </div>
              <Link href="/admin/add-product" className="inline-block pt-2">
                <Button variant="default" size="sm" className="gap-2 text-xs h-9 px-5 rounded-xs">
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </Button>
              </Link>
            </div>
          ) : (
            /* Filter/Search Empty State: No matches found */
            <div className="py-16 text-center space-y-3 px-4 border border-border rounded-xs bg-card">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif text-base font-normal text-foreground">
                  No products found
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Try changing your search or filter criteria.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/admin/products">
                  <Button variant="outline" size="sm" className="text-xs h-8 rounded-xs">
                    Clear Filters
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <ProductPagination
            currentPage={page}
            totalPages={totalPages}
            totalProducts={matchingCount}
            limit={ITEMS_PER_PAGE}
          />
        </div>
      </main>
    </div>
  );
}
