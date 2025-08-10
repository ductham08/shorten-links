import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, generateAccessToken, generateRefreshToken } from "@/lib/auth";
import validator from "validator";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        if (!validator.isEmail(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Email not found" }, { status: 401 });
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
        }

        const accessToken = generateAccessToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        });
        const refreshToken = generateRefreshToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        });

        user.refreshToken = refreshToken;
        await user.save();

        const response = NextResponse.json({
            message: "Login successful",
            accessToken,
        }, { status: 200 });

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error("[LOGIN_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}