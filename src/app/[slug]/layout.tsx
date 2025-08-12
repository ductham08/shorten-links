import { Metadata } from 'next';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';

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
            };
        }

        return {
            title: link.title,
            description: link.description,
            openGraph: {
                title: link.title,
                description: link.description,
                images: [link.image],
                url: link.url,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: link.title,
                description: link.description,
                images: [link.image],
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Error',
            description: 'An error occurred while loading the link.',
        };
    }
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                {/* Additional meta tags for better social media support */}
                <meta name="robots" content="noindex, nofollow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
