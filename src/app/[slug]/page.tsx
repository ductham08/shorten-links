import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';

type Props = {
    params: Promise<{ slug: string }>;
};

/**
 * Page to handle short link redirection
 */
export default async function ShortPage({ params }: Props) {
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

    redirect(link.url);
}
