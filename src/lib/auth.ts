import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface UserPayload {
    id: string;
    email: string;
    role: string;
    name: string;
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
    if (!password) throw new Error("Password is required");
    return await bcrypt.hash(password, 10);
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    if (!password || !hashedPassword) throw new Error("Invalid password or hashed password");
    return await bcrypt.compare(password, hashedPassword);
};

// Generate access token (4 hours expiration)
export const generateAccessToken = (user: UserPayload): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        {
            expiresIn: "4h", // 4 hours as requested
            algorithm: "HS256",
        }
    );
};

// Generate refresh token (7 days expiration)
export const generateRefreshToken = (user: UserPayload): string => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
    }
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
            algorithm: "HS256",
        }
    );
};

// Verify access token
export const verifyAccessToken = (token: string): UserPayload => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
        if (!decoded.id || !decoded.email || !decoded.role || !decoded.name) {
            throw new Error("Invalid token payload");
        }
        return decoded;
    } catch (error) {
        throw new Error("Invalid or expired access token");
    }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): UserPayload => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET) as UserPayload;
        if (!decoded.id || !decoded.email || !decoded.role || !decoded.name) {
            throw new Error("Invalid token payload");
        }
        return decoded;
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
}