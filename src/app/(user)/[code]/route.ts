import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Url from "@/models/Url";
import Analytics from "@/models/Analytics";

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
  const urlParts = request.nextUrl.pathname.split("/");
  const code = urlParts[urlParts.length - 1];
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const country = request.headers.get("cf-ipcountry") || process.env.DEV_COUNTRY || "Unknown";
  const referrer = request.headers.get("referer")
    ? new URL(request.headers.get("referer") || "").hostname
    : "direct";

  try {
    await connectDB();

    const url = await Url.findOne({ code });
    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    if (isBot(userAgent)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Cập nhật lượt click trong Url
    await Url.findOneAndUpdate(
      { code },
      {
        $inc: { clicks: 1 },
        $push: {
          visits: {
            $each: [{ country, lastVisit: new Date() }],
            $position: 0
          }
        }
      }
    );

    // Lấy ngày hôm nay (00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tìm bản ghi thống kê hôm nay
    const analytics = await Analytics.findOne({
      urlId: url._id,
      date: today
    });

    if (!analytics) {
      await Analytics.create({
        urlId: url._id,
        date: today,
        clicks: 1,
        countries: [{ country, count: 1 }],
        devices: [{ userAgent, count: 1 }],
        referrers: [{ domain: referrer, count: 1 }]
      });
    } else {
      analytics.clicks += 1;

      // Cập nhật country
      const c = analytics.countries.find((c: { country: string }) => c.country === country);
      if (c) c.count += 1;
      else analytics.countries.push({ country, count: 1 });

      // Cập nhật device
      const d = analytics.devices.find((d: { userAgent: string }) => d.userAgent === userAgent);
      if (d) d.count += 1;
      else analytics.devices.push({ userAgent, count: 1 });

      // Cập nhật referrer
      const r = analytics.referrers.find((r: { domain: string }) => r.domain === referrer);
      if (r) r.count += 1;
      else analytics.referrers.push({ domain: referrer, count: 1 });

      await analytics.save();
    }

    return NextResponse.redirect(url.longUrl);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
