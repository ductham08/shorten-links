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
                <title>{link.title}</title>
                <meta name="description" content={link.description} />
                <meta property="og:title" content={link.title} />
                <meta property="og:description" content={link.description} />
                <meta property="og:image" content={link.image} />
                <meta property="og:url" content={link.url} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={link.title} />
                <meta name="twitter:description" content={link.description} />
                <meta name="twitter:image" content={link.image} />
            </head>
            <body>
                <div style={{ 
                    fontFamily: 'Arial, sans-serif', 
                    textAlign: 'center', 
                    padding: '50px 20px',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <h1>{link.title}</h1>
                    <p>{link.description}</p>
                    {link.image && (
                        <img 
                            src={link.image} 
                            alt={link.title}
                            style={{ 
                                maxWidth: '100%', 
                                height: 'auto',
                                borderRadius: '8px',
                                margin: '20px 0'
                            }} 
                        />
                    )}
                    <p>Redirecting to <a href={link.url}>{link.url}</a>...</p>
                    <p>If you are not redirected automatically, <a href={link.url}>click here</a>.</p>
                </div>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.location.href = "${link.url}";`,
                    }}
                />
            </body>
        </html>
    );
}
