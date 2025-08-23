import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';

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

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = await response.text();
        const $ = load(html);

        // Get metadata
        const title = $('meta[property="og:title"]').attr('content') ||
                     $('meta[name="twitter:title"]').attr('content') ||
                     $('title').text() ||
                     '';

        const description = $('meta[property="og:description"]').attr('content') ||
                          $('meta[name="twitter:description"]').attr('content') ||
                          $('meta[name="description"]').attr('content') ||
                          '';

        const image = $('meta[property="og:image"]').attr('content') ||
                     $('meta[name="twitter:image"]').attr('content') ||
                     '';

        // Get icons
        const icons = [
            $('link[rel="icon"]').attr('href'),
            $('link[rel="shortcut icon"]').attr('href'),
            $('link[rel="apple-touch-icon"]').attr('href'),
            `${urlObj.origin}/favicon.ico`
        ].filter(Boolean).map(icon => {
            if (icon?.startsWith('/')) {
                return `${urlObj.origin}${icon}`;
            }
            if (icon?.startsWith('http')) {
                return icon;
            }
            return `${urlObj.origin}/${icon}`;
        });

        const siteName = $('title').text();

        return NextResponse.json({
            title: title || siteName,
            description: description || 'No description',
            image: image || '',
            icon: icons[0] || '',
            siteName: siteName || title
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        if (error instanceof Error && error.message.includes('Invalid URL')) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
