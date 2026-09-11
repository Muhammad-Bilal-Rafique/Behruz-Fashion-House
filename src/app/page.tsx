import Navbar from "@/components/shared/navbar";
import Hero from "@/components/home/hero";
import TrustBar from "@/components/home/trust-bar";
import FeaturedSection from "@/components/home/featured-section";
import NewArrivalsSection from "@/components/home/new-arrivals-section";
import Footer from "@/components/shared/footer";
import connectDB from "@/lib/connect";
import HeroModel from "@/models/Hero";
import ProductModel from "@/models/Product";

export const dynamic = "force-dynamic";

async function getHeroData() {
  try {
    await connectDB();
    const hero = await HeroModel.findOne().sort({ updatedAt: -1 }).lean();
    if (hero) {
      return {
        heading: hero.heading as string,
        description: hero.description as string,
        buttonText: (hero.buttonText as string) || "Shop Collection",
        button2Text: (hero.button2Text as string) || "Explore New Arrivals",
        imageUrl: hero.imageUrl as string,
      };
    }
  } catch (error) {
    console.error("Failed to load hero data on server:", error);
  }
  return null;
}

async function getHomeProducts() {
  try {
    await connectDB();

    // 1. Featured Products: strictly active products with isFeatured === true
    const featuredDocs = await ProductModel.find({
      status: "active",
      isFeatured: true,
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(8)
      .lean();

    const featured = JSON.parse(JSON.stringify(featuredDocs));

    // 2. New Arrivals: newest active products sorted by createdAt desc
    const newArrivalsDocs = await ProductModel.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const newArrivals = JSON.parse(JSON.stringify(newArrivalsDocs));

    return {
      featuredProducts: featured,
      newArrivals: newArrivals,
    };
  } catch (error) {
    console.error("Failed to load home products on server:", error);
    return { featuredProducts: [], newArrivals: [] };
  }
}

export default async function Home() {
  const [heroData, productsData] = await Promise.all([
    getHeroData(),
    getHomeProducts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1">
        <Hero data={heroData} />
        <TrustBar />
        <FeaturedSection products={productsData.featuredProducts} />
        <NewArrivalsSection products={productsData.newArrivals} />
      </main>
      <Footer />
    </div>
  );
}