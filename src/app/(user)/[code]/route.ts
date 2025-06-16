import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Url from "@/models/Url";

// Function to check if the request is from a bot
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /slurp/i,
    /search/i,
    /mediapartners/i,
    /nagios/i,
    /monitoring/i,
    /whatsapp/i,
    /facebook/i,
    /twitter/i,
    /linkedin/i,
    /telegram/i,
    /discord/i,
    /slack/i,
    /google/i,
    /bing/i,
    /yandex/i,
    /duckduckgo/i,
    /baidu/i
  ];

  return botPatterns.some(pattern => pattern.test(userAgent));
}

export async function GET(request: NextRequest) {
  // Lấy code từ URL
  const urlParts = request.nextUrl.pathname.split("/");
  const code = urlParts[urlParts.length - 1];
  const userAgent = request.headers.get('user-agent');

  try {
    await connectDB();
    const url = await Url.findOne({ code });

    if (!url) {
      return NextResponse.json(
        { error: "URL not found" },
        { status: 404 }
      );
    }

    // If it's a bot, redirect to your domain
    if (isBot(userAgent)) {
      return NextResponse.redirect(new URL('/', request.url));
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