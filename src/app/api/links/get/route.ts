import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;
    const user = (req as any).user as { id: string };

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '10');
    const sortBy = (searchParams.get('sortBy') ?? 'createdAt') as 'createdAt' | 'slug' | 'clicks' | 'title';
    const sortDir = (searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

    const skip = (page - 1) * pageSize;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      ShortLink.find({ userId: user.id })
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .select('slug url title description image clicks createdAt updatedAt')
        .lean(),
      ShortLink.countDocuments({ userId: user.id }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[GET_SHORT_LINKS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


