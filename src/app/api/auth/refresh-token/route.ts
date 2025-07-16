import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await connectDB();
    const { refreshToken } = await req.json();

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        const accessToken = generateAccessToken({ id: user._id, email: user.email, role: user.role });
        return NextResponse.json({ accessToken });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
}