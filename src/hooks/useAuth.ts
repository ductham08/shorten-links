'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    role: string;
}

const isBrowser = typeof window !== 'undefined';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = async (email: string, password: string) => {
        const res = await axios.post('/api/auth/login', { email, password });
        const { accessToken, refreshToken } = res.data;
        if (isBrowser) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        }
        setUser(jwtDecode(accessToken));
    };

    const refreshAccessToken = async () => {
        if (!isBrowser) return;
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return;
        try {
            const res = await axios.post('/api/auth/refresh-token', { refreshToken });
            const { accessToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            setUser(jwtDecode(accessToken));
        } catch (error) {
            console.error('Failed to refresh token:', error);
            setUser(null);
        }
    };

    useEffect(() => {
        if (!isBrowser) return;
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                setUser(jwtDecode(token));
            } catch (error) {
                refreshAccessToken();
            }
        }
        setLoading(false);
    }, []);

    return { user, login, refreshAccessToken, loading };
};

function jwtDecode(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}