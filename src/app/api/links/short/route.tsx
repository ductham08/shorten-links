import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ShortLinkForm {
    url: string;
    suffix?: string;
    icon?: string;
    siteName?: string;
    title?: string;
    description?: string;
    image?: string;
    isIframe?: boolean;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const authResponse = await authMiddleware(req);
        if (authResponse.status !== 200) return authResponse;
        const user = (req as any).user as { id: string };

        const formData = await req.formData();

        const data: ShortLinkForm = {
            url: formData.get('url') as string,
            suffix: formData.get('suffix') as string | undefined,
            icon: formData.get('icon') as string | undefined,
            siteName: formData.get('siteName') as string | undefined,
            title: formData.get('title') as string | undefined,
            description: formData.get('description') as string | undefined,
            image: formData.get('image') as string | undefined,
            isIframe: formData.get('isIframe') as unknown as boolean | undefined,
        };

        if (!data.url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }
        if (!validator.isURL(data.url)) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }
        if (data.suffix && !/^[a-zA-Z0-9_-]+$/.test(data.suffix)) {
            return NextResponse.json({ error: 'Custom suffix can only contain letters, numbers, hyphens, or underscores' }, { status: 400 });
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

        const shortLink = new ShortLink({
            userId: user.id,
            slug,
            url: data.url,
            clicks: 0,
            icon: data.icon || '',
            siteName: data.siteName || '',
            title: data.title || '',
            description: data.description || '',
            image: data.image || '',
            isIframe: data.isIframe || false,
        });

        await shortLink.save();

        return NextResponse.json(
            {
                message: 'Shorten link created successfully',
                slug,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
