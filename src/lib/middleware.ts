import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';

interface AuthenticatedRequest extends NextRequest {
    user?: unknown;
}

export async function authMiddleware(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = verifyAccessToken(token);
        (req as AuthenticatedRequest).user = decoded;
        return NextResponse.next();
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}