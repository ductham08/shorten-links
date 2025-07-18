import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (user: { id: string; email: string; role: string }) => {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
        expiresIn: '60m',
    });
};

export const generateRefreshToken = (user: { id: string; email: string; role: string }) => {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string; email: string; role: string };
};