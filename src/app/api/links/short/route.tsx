import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

interface ShortLinkForm {
    url: string;
    title?: string;
    description?: string;
    suffix?: string;
    thumbnail?: File;
    autoGetMetadata?: boolean;
}

// Function to extract metadata from URL
async function extractMetadata(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; LinkMetadataBot/1.0)'
            }
        });
        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        const description = descMatch ? descMatch[1].trim() : '';

        // Extract og:image
        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        const image = imageMatch ? imageMatch[1].trim() : '';

        return { title, description, image };
    } catch (error) {
        console.error('Failed to extract metadata:', error);
        return { title: '', description: '', image: '' };
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const formData = await req.formData();

        const data: ShortLinkForm = {
            url: formData.get('url') as string,
            title: formData.get('title') as string | undefined,
            description: formData.get('description') as string | undefined,
            suffix: formData.get('suffix') as string | undefined,
            thumbnail: formData.get('thumbnail') as File | undefined,
            autoGetMetadata: formData.get('autoGetMetadata') === 'true',
        };

        // Validate URL
        if (!data.url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }
        if (!validator.isURL(data.url)) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        // Validate suffix if provided
        if (data.suffix && !/^[a-zA-Z0-9_-]+$/.test(data.suffix)) {
            return NextResponse.json({ error: 'Custom suffix can only contain letters, numbers, hyphens, or underscores' }, { status: 400 });
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

        let finalTitle: string;
        let finalDescription: string;
        let finalImage: string;

        if (data.autoGetMetadata) {
            // Auto extract metadata
            const metadata = await extractMetadata(data.url);
            finalTitle = metadata.title || 'No title found';
            finalDescription = metadata.description || 'No description found';
            finalImage = metadata.image || '';
        } else {
            // Manual input validation
            if (!data.title || data.title.length < 3) {
                return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
            }
            if (!data.description || data.description.length < 10) {
                return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
            }
            if (!data.thumbnail) {
                return NextResponse.json({ error: 'Image is required when auto metadata is disabled' }, { status: 400 });
            }

            finalTitle = data.title;
            finalDescription = data.description;

            // Upload thumbnail to Cloudinary
            const arrayBuffer = await data.thumbnail.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const MAX_SIZE_BYTES = 4 * 1024 * 1024;
            if (buffer.byteLength > MAX_SIZE_BYTES) {
                return NextResponse.json({ error: 'Image is too large (max 4MB).' }, { status: 413 });
            }
            const mimeType = data.thumbnail.type || 'image/jpeg';
            const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;

            try {
                const uploadResult = await cloudinary.uploader.upload(base64Image, {
                    folder: 'short-links',
                    public_id: uuidv4(),
                    resource_type: 'image',
                    overwrite: false,
                });
                finalImage = uploadResult.secure_url;
            } catch (error: unknown) {
                console.error('Cloudinary upload error:', error);
                const err = error as UploadApiErrorResponse;
                return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 502 });
            }
        }

        // Save to DB
        const shortLink = new ShortLink({
            slug,
            url: data.url,
            title: finalTitle,
            description: finalDescription,
            image: finalImage,
        });
        await shortLink.save();

        return NextResponse.json(
            {
                message: 'Short link created successfully',
                slug,
                image: finalImage,
                title: finalTitle,
                description: finalDescription,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}