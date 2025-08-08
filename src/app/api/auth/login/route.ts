import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import validator from 'validator';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        // Kiểm tra input
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        if (!validator.isEmail(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Tìm user
        const user = await User.findOne({ email });
        if (!user || !(await verifyPassword(password, user.password))) {
            return NextResponse.json({ error: 'Incorrect login information' }, { status: 401 });
        }

        // Tạo token
        const accessToken = generateAccessToken({ id: user._id.toString(), email: user.email, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id.toString(), email: user.email, role: user.role });

        // Lưu refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Trả về token
        return NextResponse.json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}