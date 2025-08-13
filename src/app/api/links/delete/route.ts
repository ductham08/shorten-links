import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
    try {
        // Kiểm tra authentication
        const authResponse = await authMiddleware(req);
        if (authResponse.status !== 200) return authResponse;
        const user = (req as any).user as { id: string };

        // Lấy ID của link từ URL
        const { searchParams } = new URL(req.url);
        const linkId = searchParams.get('id');

        if (!linkId) {
            return NextResponse.json(
                { error: 'Link ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Tìm và xóa link, đảm bảo link thuộc về user hiện tại
        const deletedLink = await ShortLink.findOneAndDelete({
            _id: linkId,
            userId: user.id
        });

        if (!deletedLink) {
            return NextResponse.json(
                { error: 'Link not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Link deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('[DELETE_LINK_ERROR]', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
