import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink, { IShortLink } from '@/models/ShortLink';

async function getAndIncrementShortLink(slug: string): Promise<IShortLink | null> {
    await connectDB();
    // Atomically increment clicks and return the document
    return await ShortLink.findOneAndUpdate(
        { slug },
        { $inc: { clicks: 1 } },
        { new: true }
    );
}

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function ShortPage({ params }: Props) {
    const { slug } = await params;
    const link = await getAndIncrementShortLink(slug);

    if (!link) {
        notFound();
    }

    redirect(link.url);
}