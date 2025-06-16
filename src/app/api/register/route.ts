import { NextResponse } from 'next/server'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'

export async function POST(req: Request) {
    try {
        const { telegram, username, password } = await req.json()

        // Validate input
        if (!telegram || !username || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate telegram: must start with @, only a-zA-Z0-9_ after @, at least 2 chars after @
        if (!/^@[a-zA-Z0-9_]{2,}$/.test(telegram)) {
            return NextResponse.json({ error: 'Invalid Telegram account format' }, { status: 400 })
        }

        // Validate username: only a-zA-Z0-9_
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
        }

        await connectDB()

        // Check if username exists
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
        }

        // Check if telegram exists
        const existingTelegram = await User.findOne({ telegram })
        if (existingTelegram) {
            return NextResponse.json({ error: 'Telegram account already exists' }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = new User({
            telegram,
            username,
            password: hashedPassword,
            role: 'user',
            plan: {
                type: 'basic',
                totalLinks: 70,
                usedLinks: 0,
                registeredAt: new Date(),
                updatedAt: new Date(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        await user.save()

        return NextResponse.json({ message: 'User registered successfully!' }, { status: 201 })
    } catch (err) {
        return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 })
    }
}