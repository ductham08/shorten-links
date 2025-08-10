import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import validator from 'validator';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role = 'user' } = await req.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (!validator.isEmail(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        if (name.length < 2) {
            return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
        }

        if (role !== 'user') {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        await connectDB();

        // Check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });
        await user.save();

        // Auto-login: Generate tokens
        const accessToken = generateAccessToken({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        });
        const refreshToken = generateRefreshToken({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        });

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        return NextResponse.json({
            message: 'Registration successful',
            accessToken,
            refreshToken,
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}