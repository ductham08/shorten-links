import { Metadata } from 'next';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string; path: string[] }>;
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
            title: link.title || 'Redirecting...',
            description: link.description || `Redirecting to ${link.url}`,
            openGraph: {
                title: link.title || 'Redirecting...',
                description: link.description || `Redirecting to ${link.url}`,
                images: link.image ? [link.image] : [],
                url: link.url,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: link.title || 'Redirecting...',
                description: link.description || `Redirecting to ${link.url}`,
                images: link.image ? [link.image] : [],
            },
            robots: {
                index: false,
                follow: true,
            },
            alternates: {
                canonical: `/${slug}`,
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Error',
            description: 'An error occurred while loading the link.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }
}

export default function CatchAllLayout({ children }: { children: React.ReactNode }) {
    return children;
}
