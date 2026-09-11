import { NextResponse } from "next/server";
import connectDB from "@/lib/connect";
import Hero from "@/models/Hero";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const hero = await Hero.findOne().lean();
    return NextResponse.json({ success: true, hero });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
