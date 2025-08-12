import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Config Cloudinary (lấy từ env thay vì hardcode)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

interface ShortLinkForm {
    url: string;
    title: string;
    description: string;
    suffix?: string;
    thumbnail: File;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function buildRedirectHtml(params: { title: string; description: string; imageUrl: string; targetUrl: string; shortPath: string; }): string {
    const title = escapeHtml(params.title);
    const description = escapeHtml(params.description);
    const imageUrl = params.imageUrl;
    const targetUrl = params.targetUrl;
    const shortUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${params.shortPath}`.replace(/\/$/, '')

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${shortUrl}" />
  <meta http-equiv="refresh" content="0; url=${targetUrl}" />
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${targetUrl}" />
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
  <style>html,body{height:100%;margin:0}body{display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:#fff;color:#111}</style>
</head>
<body>
  <noscript>
    <a href="${targetUrl}">Continue to ${escapeHtml(targetUrl)}</a>
  </noscript>
</body>
</html>`;
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

        // Validate
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

        // DB connect
        await connectDB();

        // Slug
        let slug: string = data.suffix || uuidv4().slice(0, 8);
        let existingShortLink = await ShortLink.findOne({ slug });
        while (existingShortLink && !data.suffix) {
            slug = uuidv4().slice(0, 8);
            existingShortLink = await ShortLink.findOne({ slug });
        }
        if (existingShortLink) {
            return NextResponse.json({ error: 'Custom suffix already exists' }, { status: 409 });
        }

        // Convert File to base64
        const arrayBuffer = await data.thumbnail.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const MAX_SIZE_BYTES = 4 * 1024 * 1024;
        if (buffer.byteLength > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: 'Image is too large (max 4MB).' }, { status: 413 });
        }
        const mimeType = data.thumbnail.type || 'image/jpeg';
        const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        let uploadResult: UploadApiResponse;
        try {
            uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: 'short-links',
                public_id: uuidv4(),
                resource_type: 'image',
                overwrite: false,
            });
        } catch (error: unknown) {
            console.error('Cloudinary upload error:', error);
            const err = error as UploadApiErrorResponse;
            return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 502 });
        }

        // Save DB
        const shortLink = new ShortLink({
            slug,
            url: data.url,
            title: data.title,
            description: data.description,
            image: uploadResult.secure_url,
        });
        await shortLink.save();

        // Write static HTML file into public/[slug]/index.html
        try {
            const publicDir = path.join(process.cwd(), 'public');
            const slugDir = path.join(publicDir, slug);
            const filePath = path.join(slugDir, 'index.html');
            await fs.mkdir(slugDir, { recursive: true });
            const html = buildRedirectHtml({
                title: data.title,
                description: data.description,
                imageUrl: uploadResult.secure_url,
                targetUrl: data.url,
                shortPath: slug,
            });
            await fs.writeFile(filePath, html, 'utf8');
        } catch (err) {
            console.error('Error writing static HTML file:', err);
            // Do not fail the whole request; return success but with a warning
        }

        return NextResponse.json(
            {
                message: 'Short link created successfully',
                slug,
                image: uploadResult.secure_url,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
