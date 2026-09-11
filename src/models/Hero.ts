import mongoose, { Schema } from "mongoose";

const HeroSchema = new Schema(
  {
    heading: {
      type: String,
      required: true,
      default: "Elegance, Redefined.",
    },
    description: {
      type: String,
      required: true,
      default: "Timeless Pakistani fashion crafted for every occasion.",
    },
    buttonText: {
      type: String,
      required: true,
      default: "Shop Collection",
    },
    button2Text: {
      type: String,
      default: "Explore New Arrivals",
    },
    imageUrl: {
      type: String,
      required: true,
      default: "/hero-desktop.jpg",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, strict: false }
);

// In development, clear cached model so schema changes are picked up immediately
if (mongoose.models && mongoose.models.Hero) {
  delete mongoose.models.Hero;
}

export const Hero = mongoose.model("Hero", HeroSchema);
export default Hero;
