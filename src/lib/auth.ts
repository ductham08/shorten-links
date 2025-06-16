import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ch-236-Uc');

export async function generateToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getTokenData() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function isAuthenticated() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return !!payload;
}

export async function setAuthCookie(token: string) {
  (await cookies()).set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 12 // 12 hours
  });   
}

export async function clearAuthCookie() {
  (await cookies()).delete('token');
}
