import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink, { IShortLink } from '@/models/ShortLink';

async function getShortLink(slug: string): Promise<IShortLink | null> {
    await connectDB();
    return await ShortLink.findOne({ slug });
}

// Giữ params là object đồng bộ
type Props = {
    params: { slug: string };
};

export async function generateMetadata(
    { params }: { params: { slug: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = params.slug;
    const link = await getShortLink(slug);

    if (!link) {
        return {
            title: 'Not Found',
        };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: link.title,
        description: link.description,
        openGraph: {
            title: link.title,
            description: link.description,
            images: [link.image, ...previousImages],
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
}

export default async function ShortPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
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
