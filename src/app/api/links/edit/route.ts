import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
    try {
        // Kiểm tra authentication
        const authResponse = await authMiddleware(req);
        if (authResponse.status !== 200) return authResponse;
        const user = (req as any).user as { id: string };

        // Lấy ID của link từ URL và dữ liệu cập nhật từ body
        const { searchParams } = new URL(req.url);
        const linkId = searchParams.get('id');
        const data = await req.json();

        if (!linkId) {
            return NextResponse.json(
                { error: 'Link ID is required' },
                { status: 400 }
            );
        }

        if (!data.url || !data.url.trim()) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Tìm và cập nhật link, đảm bảo link thuộc về user hiện tại
        const updatedLink = await ShortLink.findOneAndUpdate(
            {
                _id: linkId,
                userId: user.id
            },
            {
                url: data.url.trim()
            },
            { new: true }
        );

        if (!updatedLink) {
            return NextResponse.json(
                { error: 'Link not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedLink);

    } catch (error) {
        console.error('[EDIT_LINK_ERROR]', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
