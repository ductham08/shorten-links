import { Metadata } from 'next';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import SlugLayout from '@/components/slug-layout';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
    const { slug } = await params;
    
    try {
        await connectDB();
        const link = await ShortLink.findOne({ slug });
        
        if (!link) {
            return {
                title: 'Link Not Found',
                description: 'The requested link could not be found.',
                robots: 'noindex, nofollow',
                viewport: 'width=device-width, initial-scale=1.0',
            };
        }

        // Only return metadata if isIframe is true
        if (link.isIframe) {
            return {
                title: link.title,
                description: link.description,
                robots: 'noindex, nofollow',
                viewport: 'width=device-width, initial-scale=1.0',
                openGraph: {
                    title: link.title,
                    description: link.description,
                    images: [link.image],
                },
                twitter: {
                    card: 'summary_large_image',
                    title: link.title,
                    description: link.description,
                    images: [link.image],
                },
            };
        }

        // If isIframe is false, return minimal metadata
        return {
            title: 'Redirecting...',
            description: 'Please wait while we redirect you to your destination.',
            robots: 'noindex, nofollow',
            viewport: 'width=device-width, initial-scale=1.0',
        };

    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Error',
            description: 'An error occurred while loading the link.',
            robots: 'noindex, nofollow',
            viewport: 'width=device-width, initial-scale=1.0',
        };
    }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <SlugLayout>{children}</SlugLayout>;
}
