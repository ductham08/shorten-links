import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { headers } from 'next/headers';

type PageProps = {
    params: {
        slug: string;
    };
};

export async function generateMetadata({ params }: PageProps) {
    await connectDB();
    const data = await ShortLink.findOne({ slug: params.slug });
    if (!data) return {};

    const headersList = await headers();
    const host = headersList.get('host') || '';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const fullUrl = `${protocol}://${host}/${params.slug}`;

    return {
        title: data.title,
        description: data.description,
        openGraph: {
            title: data.title,
            description: data.description,
            images: [{ url: data.image }],
            url: fullUrl,
        },
        twitter: {
            card: 'summary_large_image',
            title: data.title,
            description: data.description,
            images: [data.image],
        },
    };
}

export default async function ShortLinkPage({ params }: PageProps) {
    await connectDB();
    const data = await ShortLink.findOne({ slug: params.slug });

    if (!data) {
        return <h1>Not found</h1>;
    }

    // Meta refresh để redirect người dùng thật
    return (
        <html>
            <head>
                <meta httpEquiv="refresh" content={`0;url=${data.url}`} />
            </head>
            <body>
            </body>
        </html>
    );
}
