import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Config Cloudinary
cloudinary.v2.config({
    url: process.env.CLOUDINARY_URL,
});

// Interface cho dữ liệu request
interface ShortLinkForm {
    url: string;
    title: string;
    description: string;
    suffix?: string;
    thumbnail: File;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const formData = await req.formData();

        const data: ShortLinkForm = {
            url: formData.get('url') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            suffix: formData.get('suffix') as string | undefined,
            thumbnail: formData.get('thumbnail') as File,
        };

        // Validate input
        if (!data.url || !data.title || !data.description) {
            return NextResponse.json({ error: 'URL, title, and description are required' }, { status: 400 });
        }
        if (!validator.isURL(data.url)) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }
        if (data.title.length < 3) {
            return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
        }
        if (data.description.length < 10) {
            return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
        }
        if (data.suffix && !/^[a-zA-Z0-9_-]+$/.test(data.suffix)) {
            return NextResponse.json({ error: 'Custom suffix can only contain letters, numbers, hyphens, or underscores' }, { status: 400 });
        }
        if (!data.thumbnail) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        // Check Cloudinary config
        if (!process.env.CLOUDINARY_URL) {
            return NextResponse.json({ error: 'Server misconfiguration (Cloudinary).' }, { status: 500 });
        }

        // Connect DB
        if (!process.env.MONGODB_URI) {
            return NextResponse.json({ error: 'Server misconfiguration (Database).' }, { status: 500 });
        }
        await connectDB();

        // Generate slug
        let slug: string = data.suffix || uuidv4().slice(0, 8);
        let existingShortLink = await ShortLink.findOne({ slug });
        while (existingShortLink && !data.suffix) {
            slug = uuidv4().slice(0, 8);
            existingShortLink = await ShortLink.findOne({ slug });
        }
        if (existingShortLink) {
            return NextResponse.json({ error: 'Custom suffix already exists' }, { status: 409 });
        }

        // Convert File to Buffer
        const buffer: Buffer = Buffer.from(await data.thumbnail.arrayBuffer());

        // Limit size 4MB
        const MAX_SIZE_BYTES = 4 * 1024 * 1024;
        if (buffer.byteLength > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: 'Image is too large (max 4MB).' }, { status: 413 });
        }

        // Upload to Cloudinary
        let imageUrl: string;
        try {
            const result: UploadApiResponse = await new Promise((resolve, reject) => {
                const stream = cloudinary.v2.uploader.upload_stream(
                    {
                        folder: 'short-links',
                        resource_type: 'image',
                        format: 'auto',
                    },
                    (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                        if (error) reject(error);
                        else if (!result) reject(new Error('Upload failed - no result'));
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });
            imageUrl = result.secure_url;
        } catch (error) {
            console.error('Cloudinary upload failed:', error);
            return NextResponse.json({ error: 'Image upload error' }, { status: 502 });
        }

        // Save DB
        try {
            const shortLink = new ShortLink({
                slug,
                url: data.url,
                title: data.title,
                description: data.description,
                image: imageUrl,
            });
            await shortLink.save();
        } catch (error) {
            console.error('Database save error:', error);
            return NextResponse.json({ error: 'Database save error' }, { status: 500 });
        }

        return NextResponse.json(
            {
                message: 'Short link created successfully',
                slug,
                image: imageUrl,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
