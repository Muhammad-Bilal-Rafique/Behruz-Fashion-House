import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { ProductDetailSkeleton } from "@/components/products/product-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#FF3154]/20 selection:text-[#FF3154]">
      {/* Customer-Facing Navbar */}
      <Navbar />

      {/* Main Content: Instant luxury Skeleton layout (zero delay on click) */}
      <main className="flex-1">
        <ProductDetailSkeleton />
      </main>

      {/* Customer-Facing Footer */}
      <Footer />
    </div>
  );
}
