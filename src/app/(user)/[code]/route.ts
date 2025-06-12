import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Url from "@/models/Url";

export async function GET(request: NextRequest) {
  // Lấy code từ URL
  const urlParts = request.nextUrl.pathname.split("/");
  const code = urlParts[urlParts.length - 1];

  try {
    await connectDB();
    const url = await Url.findOne({ code });

    if (!url) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    return NextResponse.redirect(url.longUrl);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}