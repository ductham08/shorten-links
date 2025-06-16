import { NextResponse } from 'next/server'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { generateToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    
    // Find user by username or telegram
    let user = null
    if (identifier.startsWith('@')) {
      if (!/^@[a-zA-Z0-9_]{2,}$/.test(identifier)) {
        return NextResponse.json({ error: 'Invalid Telegram account format' }, { status: 400 })
      }
      user = await User.findOne({ telegram: identifier })
    } else {
      if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
        return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
      }
      user = await User.findOne({ username: identifier })
    }

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Generate token
    const token = await generateToken({
      userId: user._id,
      username: user.username,
      role: user.role
    })

    // Get return URL from searchParams or default to home
    const url = new URL(req.url)
    const returnTo = url.searchParams.get('from') || '/'

    // Create response
    const response = NextResponse.json({
      message: 'Login successful!',
      user: {
        username: user.username,
        telegram: user.telegram,
        role: user.role
      },
      redirectTo: returnTo
    })

    // Set cookie in response
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 12 // 12 hours
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
