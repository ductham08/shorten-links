import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';

type Props = {
    params: Promise<{ slug: string; path: string[] }>;
};

export default async function CatchAllPage({ params }: Props) {
    const { slug } = await params;

    await connectDB();
    const link = await ShortLink.findOne({ slug });

    if (!link?.url) {
        notFound();
    }

    redirect(link.url);
}
