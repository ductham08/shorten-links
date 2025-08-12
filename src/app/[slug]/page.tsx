import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink, { IShortLink } from '@/models/ShortLink';
import Analytic from '@/models/Analytic';

function extractCountryFromHeaders(headers: Headers): string | null {
    const cfCountry = headers.get('cf-ipcountry');
    const vercelCountry = headers.get('x-vercel-ip-country');
    const country = (cfCountry || vercelCountry || '').toUpperCase();
    return country || null;
}

async function getAndIncrementShortLink(slug: string, reqHeaders?: Headers): Promise<IShortLink | null> {
    await connectDB();
    const session = await (await import('mongoose')).default.startSession();
    let link: IShortLink | null = null;
    try {
        await session.withTransaction(async () => {
            link = await ShortLink.findOneAndUpdate(
                { slug },
                { $inc: { clicks: 1 } },
                { new: true, session }
            );
            if (!link) return;

            const country = reqHeaders ? extractCountryFromHeaders(reqHeaders) : null;

            const update: Record<string, unknown> = { $inc: { totalClicks: 1 } };
            if (country) {
                (update.$inc as any)[`countries.${country}`] = 1;
            }
            await Analytic.findOneAndUpdate(
                { linkId: link._id },
                update,
                { upsert: true, new: true, session }
            );
        });
    } finally {
        await session.endSession();
    }
    return link;
}

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function ShortPage({ params }: Props) {
    const { slug } = await params;
    const link = await getAndIncrementShortLink(slug, (globalThis as any)?.headers);

    if (!link) {
        notFound();
    }

    redirect(link.url);
}