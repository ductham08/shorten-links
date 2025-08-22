import { NextRequest, NextResponse } from 'next/server';
import getMetadata from 'metadata-scraper';
import { MetaData } from 'metadata-scraper/lib/types';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        // Validate URL format
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return NextResponse.json(
                { error: 'Invalid URL protocol. Only HTTP and HTTPS are supported.' },
                { status: 400 }
            );
        }

        const metadata = await getMetadata(url) as any;
        
        const icons = [
            metadata.favicon,
            metadata.icon,
            ...(metadata.icons || []),
        ].filter(Boolean);

        const siteName = metadata.siteName || metadata.og?.siteName || '';
        const title = metadata.title || metadata.og?.title || metadata.twitter?.title;
        const description = metadata.description || metadata.og?.description || metadata.twitter?.description;
        const image = metadata.image || metadata.og?.image || metadata.twitter?.image;

        return NextResponse.json({
            title: title,
            description: description,
            image: image,
            icon: icons[0], // Use first available icon
            siteName: siteName
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        if (error instanceof Error && error.message.includes('Invalid URL')) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
