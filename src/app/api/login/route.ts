import { NextResponse } from 'next/server'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Xác định là telegram hay username
    let user: any | null = null
    await connectDB()
    if (identifier.startsWith('@')) {
      // Validate telegram
      if (!/^@[a-zA-Z0-9_]{2,}$/.test(identifier)) {
        return NextResponse.json({ error: 'Invalid Telegram account format' }, { status: 400 })
      }
      user = await User.findOne({ telegram: identifier })
    } else {
      // Validate username
      if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
        return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
      }
      user = await User.findOne({ username: identifier })
    }

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Nếu muốn trả về thông tin user, hãy loại bỏ password trước khi trả về!
    return NextResponse.json({ message: 'Login successful!' })
  } catch (err) {
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 })
  }
}
