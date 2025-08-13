import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink, { IShortLink } from '@/models/ShortLink';
import mongoose, { ClientSession } from 'mongoose';

interface AnalyticUpdate {
    $inc: Record<string, number>;
}

/**
 * Find a short link, increment analytics, and return the link
 */
async function getAndIncrementShortLink(
    slug: string,
): Promise<IShortLink | null> {
    await connectDB();
    const session: ClientSession = await mongoose.startSession();
    let link: IShortLink | null = null;

    try {
        await session.withTransaction(async () => {
            link = await ShortLink.findOneAndUpdate(
                { slug },
                { $inc: { clicks: 1 } },
                { new: true, session }
            );

            if (!link) return;
        });
    } catch (error) {
        console.error('Error updating short link analytics:', error);
    } finally {
        await session.endSession();
    }

    return link;
}

type Props = {
    params: Promise<{ slug: string }>;
};

/**
 * Page to handle short link redirection
 */
export default async function ShortPage({ params }: Props) {
    const { slug } = await params;

    const link = await getAndIncrementShortLink(slug);

    if (!link?.url) {
        notFound();
    }

    redirect(link.url);
}
