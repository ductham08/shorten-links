import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Đảm bảo thư mục uploads tồn tại
async function ensureUploadDir() {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch { }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const url = formData.get('url') as string;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        let suffix = formData.get('suffix') as string;
        const thumbnail = formData.get('thumbnail') as File | null;

        // Validate input
        if (!url || !title || !description) {
            return NextResponse.json({ error: 'URL, title, and description are required' }, { status: 400 });
        }

        if (!validator.isURL(url)) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        if (title.length < 3) {
            return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
        }

        if (description.length < 10) {
            return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
        }

        if (suffix && !/^[a-zA-Z0-9_-]+$/.test(suffix)) {
            return NextResponse.json({ error: 'Custom suffix can only contain letters, numbers, hyphens, or underscores' }, { status: 400 });
        }

        if (!thumbnail) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        await connectDB();

        // Generate slug if not provided
        let slug = suffix || uuidv4().slice(0, 8);

        // Check if slug exists
        let existingShortLink = await ShortLink.findOne({ slug });
        while (existingShortLink && !suffix) {
            // If auto-generated slug exists, generate a new one
            slug = uuidv4().slice(0, 8);
            existingShortLink = await ShortLink.findOne({ slug });
        }

        if (existingShortLink) {
            return NextResponse.json({ error: 'Custom suffix already exists' }, { status: 409 });
        }

        // Handle image upload
        await ensureUploadDir();
        const fileName = `${uuidv4()}-${thumbnail.name}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        const buffer = Buffer.from(await thumbnail.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        const imageUrl = `/uploads/${fileName}`;

        // Create short link
        const shortLink = new ShortLink({
            slug,
            url,
            title,
            description,
            image: imageUrl,
        });
        await shortLink.save();

        return NextResponse.json({
            message: 'Short link created successfully',
            slug,
        }, { status: 201 });
    } catch (error) {
        console.error('Short link creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}