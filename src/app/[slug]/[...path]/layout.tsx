import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string; path: string[] }>;
}

export async function generateMetadata({ params }: LayoutProps) {
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
