import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink, { IShortLink } from '@/models/ShortLink';

async function getShortLink(slug: string): Promise<IShortLink | null> {
    await connectDB();
    return await ShortLink.findOne({ slug });
}

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const link = await getShortLink(slug);

    if (!link) {
        return { title: 'Not Found' };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: link.title,
        description: link.description,
        openGraph: {
            title: link.title,
            description: link.description,
            images: link.image ? [link.image, ...previousImages] : previousImages,
            url: link.url,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: link.title,
            description: link.description,
            images: link.image ? [link.image] : [],
        },
    };
}

export default async function ShortPage({ params }: Props) {
    const { slug } = await params;
    const link = await getShortLink(slug);

    if (!link) {
        notFound();
    }

    return (
        <html>
            <head>
                <meta httpEquiv="refresh" content={`0; url=${link.url}`} />
            </head>
            <body>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.location.href = "${link.url}";`,
                    }}
                />
            </body>
        </html>
    );
}