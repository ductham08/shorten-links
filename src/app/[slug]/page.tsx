import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink, { IShortLink } from '@/models/ShortLink';

async function getShortLink(slug: string): Promise<IShortLink | null> {
    await connectDB();
    return await ShortLink.findOne({ slug });
}

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function ShortPage({ params }: Props) {
    const { slug } = await params;
    const link = await getShortLink(slug);

    if (!link) {
        notFound();
    }

    redirect(link.url);
}