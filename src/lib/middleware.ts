import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';

export async function authMiddleware(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = verifyAccessToken(token);
        (req as any).user = decoded; // Attach user to request
        return NextResponse.next();
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}