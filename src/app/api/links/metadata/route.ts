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

        // Function to perform fetch with retry logic
        const fetchWithRetry = async (url: string, maxRetries = 3, retryDelay = 1000) => {
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
                'Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'
            ];

            let lastError: Error | null = null;

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': userAgents[attempt % userAgents.length],
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.5',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Connection': 'keep-alive',
                            'Referer': urlObj.origin
                        },
                        redirect: 'follow',
                        signal: AbortSignal.timeout(15000) // 15s timeout
                    });

                    if (response.ok) {
                        return response;
                    }

                    lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    if (response.status === 429 || response.status >= 500) {
                        // Retry on rate limit or server errors
                        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
                        continue;
                    }
                    throw lastError;
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error('Unknown fetch error');
                    if (attempt < maxRetries - 1) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
                    }
                }
            }
            throw lastError || new Error('Failed to fetch after retries');
        };

        // Fetch website content
        const response = await fetchWithRetry(url);
        const html = await response.text();
        const $ = load(html);

        // Initialize metadata object
        const metadata: Record<string, string | string[] | null> = {};

        // Helper function to clean text
        const cleanText = (text: string | undefined | null): string => {
            return text?.trim().replace(/\s+/g, ' ') || '';
        };

        // Extract all meta tags
        $('meta').each((_, element) => {
            const name = $(element).attr('name') || $(element).attr('property') || $(element).attr('itemprop');
            const content = $(element).attr('content');
            if (name && content) {
                metadata[name.toLowerCase()] = cleanText(content);
            }
        });

        // Extract specific metadata with fallbacks for social media
        metadata['title'] = cleanText(
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('meta[name="title"]').attr('content') ||
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
            $('meta[property="og:image:secure_url"]').attr('content') ||
            ''
        );

        metadata['site_name'] = cleanText(
            $('meta[property="og:site_name"]').attr('content') ||
            $('meta[name="twitter:site"]').attr('content') ||
            $('title').text() ||
            ''
        );

        // Extract social media specific metadata
        metadata['twitter:card'] = cleanText($('meta[name="twitter:card"]').attr('content') || '');
        metadata['twitter:creator'] = cleanText($('meta[name="twitter:creator"]').attr('content') || '');
        metadata['fb:app_id'] = cleanText($('meta[property="fb:app_id"]').attr('content') || '');
        metadata['og:type'] = cleanText($('meta[property="og:type"]').attr('content') || '');

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
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
            return NextResponse.json(
                { error: 'Access forbidden by the server. This may be due to bot detection or restricted access.' },
                { status: 403 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch metadata', details: errorMessage },
            { status: 500 }
        );
    }
}