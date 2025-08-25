import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        // Validate URL
        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL is required and must be a string' },
                { status: 400 }
            );
        }

        let urlObj: URL;
        try {
            urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return NextResponse.json(
                    { error: 'Invalid URL protocol. Only HTTP and HTTPS are supported.' },
                    { status: 400 }
                );
            }
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Fetch website content
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(10000) // 10s timeout
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch website: HTTP ${response.status}` },
                { status: response.status }
            );
        }

        const html = await response.text();
        const $ = load(html);

        // Initialize metadata object
        const metadata: Record<string, string | string[] | null> = {};

        // Helper function to clean text
        const cleanText = (text: string | undefined | null): string => {
            return text?.trim().replace(/\s+/g, ' ') || '';
        };

        // Extract standard meta tags
        $('meta').each((_, element) => {
            const name = $(element).attr('name') || $(element).attr('property') || $(element).attr('itemprop');
            const content = $(element).attr('content');
            if (name && content) {
                metadata[name.toLowerCase()] = cleanText(content);
            }
        });

        // Extract specific metadata
        metadata['title'] = cleanText(
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text() ||
            ''
        );

        metadata['description'] = cleanText(
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            ''
        );

        metadata['image'] = cleanText(
            $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            ''
        );

        metadata['site_name'] = cleanText(
            $('meta[property="og:site_name"]').attr('content') ||
            $('meta[name="twitter:site"]').attr('content') ||
            $('title').text() ||
            ''
        );

        // Extract icons
        const icons: string[] = [];
        const iconSelectors = [
            'link[rel="icon"]',
            'link[rel="shortcut icon"]',
            'link[rel="apple-touch-icon"]',
            'link[rel="apple-touch-icon-precomposed"]',
            'link[rel="mask-icon"]'
        ];

        iconSelectors.forEach(selector => {
            $(selector).each((_, element) => {
                let href = $(element).attr('href');
                if (href) {
                    if (href.startsWith('/')) {
                        href = `${urlObj.origin}${href}`;
                    } else if (!href.startsWith('http')) {
                        href = `${urlObj.origin}/${href}`;
                    }
                    if (!icons.includes(href)) {
                        icons.push(href);
                    }
                }
            });
        });

        // Add default favicon
        const defaultFavicon = `${urlObj.origin}/favicon.ico`;
        if (!icons.includes(defaultFavicon)) {
            icons.push(defaultFavicon);
        }

        metadata['icons'] = icons;

        // Additional useful metadata
        metadata['url'] = cleanText(urlObj.href);
        metadata['canonical'] = cleanText($('link[rel="canonical"]').attr('href') || '');
        metadata['charset'] = cleanText($('meta[charset]').attr('charset') || '');
        metadata['language'] = cleanText(
            $('html').attr('lang') ||
            $('meta[http-equiv="content-language"]').attr('content') ||
            ''
        );

        // Extract structured data (JSON-LD)
        const jsonLd: any[] = [];
        $('script[type="application/ld+json"]').each((_, element) => {
            try {
                const content = $(element).html();
                if (content) {
                    jsonLd.push(JSON.parse(content));
                }
            } catch (e) {
                console.warn('Failed to parse JSON-LD:', e);
            }
        });
        metadata['json-ld'] = jsonLd.length > 0 ? jsonLd : null;

        return NextResponse.json({
            success: true,
            metadata,
            extractedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching metadata:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('Invalid URL') || errorMessage.includes('URL is required')) {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }
        if (errorMessage.includes('timeout')) {
            return NextResponse.json(
                { error: 'Request timed out' },
                { status: 504 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch metadata', details: errorMessage },
            { status: 500 }
        );
    }
}