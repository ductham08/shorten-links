import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
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
    const sortBy = (searchParams.get('sortBy') ?? 'createdAt') as keyof typeof User;
    const sortDir = (searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

    const skip = (page - 1) * pageSize;
    const sort = { [sortBy]: (sortDir === 'asc' ? 1 : -1) as 1 | -1 };

    // Lấy danh sách users và tổng số users
    const [users, total] = await Promise.all([
      User.find()
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .select('-password -refreshToken') // Loại bỏ các trường nhạy cảm
        .lean(),
      User.countDocuments(),
    ]);

    return NextResponse.json({
      items: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[ADMIN_GET_USERS_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}