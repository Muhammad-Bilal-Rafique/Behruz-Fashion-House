import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold block mb-3">
          404 &mdash; Page Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-foreground mb-4">
          A Moment Outside the Collection
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-light max-w-md mb-8 leading-relaxed">
          The couture piece or page you are looking for does not exist, has been moved, or is currently undergoing preparation.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary/90 transition-colors"
          >
            Explore Collection
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 border border-border text-foreground text-xs uppercase tracking-[0.2em] font-medium hover:border-foreground transition-colors"
          >
            Return Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
