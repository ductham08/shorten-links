import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    // Kiểm tra authentication
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;
    const currentUser = (req as any).user as { id: string; role: string };

    // Kiểm tra quyền admin
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.email || !data.role) {
      return NextResponse.json(
        { error: 'Name, email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'user'].includes(data.role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Không cho phép thay đổi role của chính mình
    if (userId === currentUser.id && data.role !== currentUser.role) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa (nếu thay đổi email)
    const existingUser = await User.findOne({ 
      email: data.email,
      _id: { $ne: userId } // Không tính user hiện tại
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Cập nhật user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: data.name,
          email: data.email,
          role: data.role
        }
      },
      { 
        new: true,
        select: '-password -refreshToken' // Loại bỏ các trường nhạy cảm
      }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[ADMIN_UPDATE_USER_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}