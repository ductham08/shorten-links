import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import connectDB from "@/lib/mongodb";
import Url from "@/models/Url";
import * as cheerio from "cheerio";

// Lưu trữ tạm thời trong memory (trong thực tế nên dùng database)
const urlMap = new Map<string, string>();

export async function POST(request: Request) {
    try {
        const { longUrl } = await request.json();

        if (!longUrl) {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        // Kiểm tra URL hợp lệ
        try {
            new URL(longUrl);
        } catch {
            return NextResponse.json(
                { error: "Invalid URL" },
                { status: 400 }
            );
        }

        let title = "";
        let description = "";
        let thumbnail = "";
        try {
            const res = await fetch(longUrl, { method: "GET" });
            const html = await res.text();
            const $ = cheerio.load(html);

            title = $("title").text();
            description = $('meta[name="description"]').attr("content") || "";
            thumbnail = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content") || "";
        } catch (err) {
            console.log("Không lấy được meta:", err);
        }

        await connectDB();

        // Tạo short code
        const shortCode = nanoid(6);
        
        // Lưu vào database
        await Url.create({
            code: shortCode,
            longUrl: longUrl,
            title,
            description,
            thumbnail,
        });

        // Tạo short URL
        const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortCode}`;

        return NextResponse.json({ shortUrl, title, description, thumbnail });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 