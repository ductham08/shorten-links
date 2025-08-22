import { NextRequest, NextResponse } from 'next/server';
import getMetadata from 'metadata-scraper';

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

        const metadata = await getMetadata(url);

        return NextResponse.json({
            title: metadata.title || metadata.og?.title || metadata.twitter?.title,
            description: metadata.description || metadata.og?.description || metadata.twitter?.description,
            image: metadata.image || metadata.og?.image || metadata.twitter?.image
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        if (error instanceof Error && error.message.includes('Invalid URL')) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
