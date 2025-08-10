import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        
        // Lấy refresh token từ cookie
        const refreshToken = req.cookies.get('refreshToken')?.value;
        
        if (!refreshToken) {
            return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        
        // Kiểm tra xem refresh token có tồn tại trong database không
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        // Tạo access token mới
        const newAccessToken = generateAccessToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        });

        return NextResponse.json({
            accessToken: newAccessToken,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        console.error('[REFRESH_TOKEN_ERROR]', error);
        return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
}
