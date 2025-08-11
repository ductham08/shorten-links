import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import cloudinary from 'cloudinary';

// Ensure this route runs on the Node.js runtime (required for fs, cloudinary SDK)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

cloudinary.v2.config({
    url: process.env.CLOUDINARY_URL,
});

const isVercel = process.env.VERCEL === '1';
const UPLOAD_DIR = isVercel
    ? path.join('/tmp', 'uploads')
    : path.join(process.cwd(), 'public/uploads');

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

        // On Vercel, we require Cloudinary envs to be present
        if (isVercel && !process.env.CLOUDINARY_URL) {
            console.error('[SHORT_LINK] Missing CLOUDINARY_URL env variable')
            return NextResponse.json({ error: 'Server misconfiguration (Cloudinary).' }, { status: 500 })
        }

        // Validate DB env before trying to connect
        if (!process.env.MONGODB_URI) {
            console.error('[SHORT_LINK] Missing MONGODB_URI')
            return NextResponse.json({ error: 'Server misconfiguration (Database).' }, { status: 500 })
        }
        try {
            await connectDB();
        } catch (e: any) {
            console.error('[SHORT_LINK] DB connection failed:', e?.message ?? e)
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
        }

        // Generate slug
        let slug = suffix || uuidv4().slice(0, 8);
        let existingShortLink = await ShortLink.findOne({ slug });
        while (existingShortLink && !suffix) {
            slug = uuidv4().slice(0, 8);
            existingShortLink = await ShortLink.findOne({ slug });
        }
        if (existingShortLink) {
            return NextResponse.json({ error: 'Custom suffix already exists' }, { status: 409 });
        }

        // Save image
        let imageUrl: string;
        const arrayBuffer = await thumbnail.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Enforce a safe size limit for serverless (e.g., 4 MB)
        const MAX_SIZE_BYTES = 4 * 1024 * 1024
        if (isVercel && buffer.byteLength > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: 'Image is too large (max 4MB on serverless).' }, { status: 413 })
        }

        if (isVercel) {
            // Upload directly to Cloudinary without writing temp file
            try {
                console.log('[SHORT_LINK] Starting Cloudinary upload, buffer size:', buffer.byteLength)
                console.log('[SHORT_LINK] Cloudinary config check:', {
                    hasUrl: !!process.env.CLOUDINARY_URL,
                    urlLength: process.env.CLOUDINARY_URL?.length
                })
                
                const result = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
                    const stream = cloudinary.v2.uploader.upload_stream(
                        { 
                            folder: 'short-links',
                            resource_type: 'image',
                            format: 'auto'
                        },
                        (error, result) => {
                            if (error) {
                                console.error('[SHORT_LINK] Cloudinary stream error:', error)
                                reject(error)
                                return
                            }
                            if (!result) {
                                console.error('[SHORT_LINK] Cloudinary no result')
                                reject(new Error('Upload failed - no result'))
                                return
                            }
                            console.log('[SHORT_LINK] Cloudinary upload success:', result.secure_url)
                            resolve(result)
                        }
                    )
                    stream.end(buffer)
                })
                imageUrl = result.secure_url
            } catch (e: any) {
                console.error('[SHORT_LINK] Cloudinary upload failed:', e?.message ?? e)
                console.error('[SHORT_LINK] Full error object:', e)
                return NextResponse.json({ error: 'Image upload error' }, { status: 502 })
            }
        } else {
            // Local filesystem (development)
            await ensureUploadDir();
            const fileName = `${uuidv4()}-${thumbnail.name}`;
            const filePath = path.join(UPLOAD_DIR, fileName);
            try {
                await fs.writeFile(filePath, buffer);
            } catch (e: any) {
                console.error('[SHORT_LINK] Write file failed:', e?.message ?? e)
                return NextResponse.json({ error: 'Image write error' }, { status: 500 })
            }
            imageUrl = `/uploads/${fileName}`;
        }

        // Save DB
        try {
            const shortLink = new ShortLink({
                slug,
                url,
                title,
                description,
                image: imageUrl,
            });
            await shortLink.save();
        } catch (e: any) {
            console.error('[SHORT_LINK] Save document failed:', e?.message ?? e)
            return NextResponse.json({ error: 'Database save error' }, { status: 500 })
        }

        return NextResponse.json({
            message: 'Short link created successfully',
            slug,
            image: imageUrl,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Short link creation error (unexpected):', error?.message ?? error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
