import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import ShortLink, { IShortLink } from '@/models/ShortLink';
import Analytic from '@/models/Analytic';
import mongoose, { ClientSession } from 'mongoose';
import axios from 'axios';

/**
 * Get the user's public IP address
 */
async function getUserIP(): Promise<string | null> {
    try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        return ipResponse.data?.ip || null;
    } catch (error) {
        console.error('Error getting user IP:', error);
        return null;
    }
}

/**
 * Get the country code based on the given IP address
 */
async function getCountryCodeFromIP(): Promise<string | null> {
    try {
        const ip = await getUserIP();
        if (!ip) return null;

        const response = await axios.get(`https://ipwho.is/${ip}`);
        return response.data?.country_code || null;
    } catch (error) {
        console.error('Error getting country code from IP:', error);
        return null;
    }
}

interface AnalyticUpdate {
    $inc: Record<string, number>;
}

/**
 * Find a short link, increment analytics, and return the link
 */
async function getAndIncrementShortLink(
    slug: string,
    country?: string
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

            const update: AnalyticUpdate = { $inc: { totalClicks: 1 } };
            if (country) {
                update.$inc[`countries.${country}`] = 1;
            }

            await Analytic.findOneAndUpdate(
                { linkId: link._id },
                update,
                { upsert: true, new: true, session }
            );
        });
    } catch (error) {
        console.error('Error updating short link analytics:', error);
    } finally {
        await session.endSession();
    }

    return link;
}

type Props = {
    params: { slug: string };
};

/**
 * Page to handle short link redirection
 */
export default async function ShortPage({ params }: Props) {
    const { slug } = params;

    const country = await getCountryCodeFromIP() || undefined;
    const link = await getAndIncrementShortLink(slug, country);

    if (!link?.url) {
        notFound();
    }

    redirect(link.url);
}
