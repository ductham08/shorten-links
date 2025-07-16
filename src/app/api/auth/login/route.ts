import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword, generateAccessToken, generateRefreshToken, verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user.password))) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const accessToken = generateAccessToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, email: user.email, role: user.role });

    user.refreshToken = refreshToken;
    await user.save();

    return NextResponse.json({ accessToken, refreshToken });
}