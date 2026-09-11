import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/connect";
import Hero from "@/models/Hero";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

// GET: Fetch current hero data
export async function GET() {
  try {
    await connectDB();

    let hero = await Hero.findOne();
    if (!hero) {
      hero = await Hero.create({
        heading: "Elegance, Redefined.",
        description: "Timeless Pakistani fashion crafted for every occasion.",
        buttonText: "Shop Collection",
        button2Text: "Explore New Arrivals",
        imageUrl: "/hero-desktop.jpg",
        imagePublicId: "",
      });
    }

    return NextResponse.json({ success: true, hero });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update hero text & replace image
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const heading = formData.get("heading") as string;
    const description = formData.get("description") as string;
    const buttonText = formData.get("buttonText") as string;
    const button2Text = (formData.get("button2Text") as string) || "Explore New Arrivals";
    const imageFile = formData.get("image") as File | null;

    if (!heading || !description || !buttonText) {
      return NextResponse.json(
        { success: false, error: "Heading, description, and primary button text are required." },
        { status: 400 }
      );
    }

    let hero = await Hero.findOne();
    if (!hero) {
      hero = new Hero();
    }

    const oldPublicId = hero.imagePublicId;
    let newImageUrl = hero.imageUrl;
    let newPublicId = hero.imagePublicId;

    // 1. If a new image was selected, upload to Cloudinary first
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await uploadToCloudinary(buffer, "behruz-fashion/hero");
      newImageUrl = uploaded.secure_url;
      newPublicId = uploaded.public_id;
    }

    // 2. Save new data to MongoDB
    hero.heading = heading;
    hero.description = description;
    hero.buttonText = buttonText;
    hero.button2Text = button2Text;
    hero.imageUrl = newImageUrl;
    hero.imagePublicId = newPublicId;
    await hero.save();

    // 3. Only after MongoDB saves successfully, delete the old image
    if (imageFile && imageFile.size > 0 && oldPublicId && oldPublicId !== newPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }

    revalidatePath("/");
    revalidatePath("/admin/edit-website");

    return NextResponse.json({ success: true, hero });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
