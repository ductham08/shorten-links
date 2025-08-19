import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import User from '@/models/User';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '10');
    const sortBy = (searchParams.get('sortBy') ?? 'createdAt') as keyof typeof ShortLink;
    const sortDir = (searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

    const skip = (page - 1) * pageSize;
    const sort = { [sortBy]: (sortDir === 'asc' ? 1 : -1) as 1 | -1 };

    // Lấy danh sách links và tổng số links
    const [links, total] = await Promise.all([
      ShortLink.find()
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .select('slug url title description image clicks createdAt updatedAt userId')
        .lean(),
      ShortLink.countDocuments(),
    ]);

    // Lấy thông tin user cho mỗi link
    const userIds = [...new Set(links.map(link => link.userId))];
    const users = await User.find({ _id: { $in: userIds } })
      .select('email name')
      .lean();

    // Map user emails vào links
    const userMap = users.reduce((acc, user: any) => {
      acc[user._id.toString()] = {
        email: user.email,
        name: user.name
      };
      return acc;
    }, {} as Record<string, { email: string; name: string }>);

    const itemsWithUserInfo = links.map(link => {
      const userInfo = userMap[link.userId.toString()] || { email: 'Unknown', name: 'Unknown User' };
      return {
        ...link,
        userEmail: userInfo.email,
        userName: userInfo.name
      };
    });

    return NextResponse.json({
      items: itemsWithUserInfo,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[ADMIN_GET_SHORT_LINKS_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
