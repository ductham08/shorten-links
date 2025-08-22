import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import UrlIframe from '@/components/url-iframe';

type Props = {
    params: Promise<{ slug: string; path: string[] }>;
};

export default async function CatchAllPage({ params }: Props) {
    const { slug } = await params;

    await connectDB();
    const link = await ShortLink.findOneAndUpdate(
        { slug },
        { $inc: { clicks: 1 } },
        { new: true }
    );

    if (!link?.url) {
        notFound();
    }

    // If isIframe is true, render the page in an iframe
    if (link.isIframe) {
        return <UrlIframe url={link.url} />;
    }

    // Otherwise, redirect to the original URL
    redirect(link.url);
}
