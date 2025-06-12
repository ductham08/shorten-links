import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import connectDB from "@/lib/mongodb";
import Url from "@/models/Url";

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

        await connectDB();

        // Tạo short code
        const shortCode = nanoid(6);
        
        // Lưu vào database
        await Url.create({
            code: shortCode,
            longUrl: longUrl,
        });

        // Tạo short URL
        const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortCode}`;

        return NextResponse.json({ shortUrl });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 