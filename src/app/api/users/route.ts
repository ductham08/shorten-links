import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { authMiddleware } from '@/lib/middleware';

export async function GET(req: NextRequest) {
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const user = (req as any).user;
    if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find().select('-password -refreshToken');
    return NextResponse.json(users);
}