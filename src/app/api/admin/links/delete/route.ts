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
    const user = (req as any).user as { id: string; role: string };

    // Kiểm tra quyền admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('id');

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    const deletedLink = await ShortLink.findByIdAndDelete(linkId);

    if (!deletedLink) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('[ADMIN_DELETE_SHORT_LINK_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
