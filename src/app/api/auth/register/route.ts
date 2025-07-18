import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import {
    hashPassword,
    generateAccessToken,
    generateRefreshToken,
} from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, role = 'user' } = await req.json()

        // Validate
        if (!email || !password || !name) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Connect to DB
        await connectDB()

        // Check if email already exists
        const existingUser = await User.findOne({ email })

        console.log("existingUser", existingUser);

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        })

        return NextResponse.json(
            {
                message: 'Successful registration, login to experience features.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('[REGISTER_ERROR]', error)
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        )
    }
}
