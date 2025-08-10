import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const authResponse = await authMiddleware(req);
        if (authResponse.status !== 200) return authResponse;

        const user = (req as any).user;
        
        await connectDB();
        const userDoc = await User.findById(user.id).select('-password -refreshToken');
        
        if (!userDoc) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: userDoc._id.toString(),
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
        });
    } catch (error) {
        console.error('[GET_USER_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 