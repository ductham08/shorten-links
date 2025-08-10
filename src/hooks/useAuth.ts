'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getCurrentUser = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else if (response.status === 401) {
        // Token không hợp lệ, thử refresh
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return await getCurrentUser(refreshed);
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include', // Để gửi refresh token cookie
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra xem có đang ở client-side không
        if (typeof window === 'undefined') return;
        
        // Lấy token từ localStorage
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setUser(null);
          setLoading(false);
          router.push('/login');
          return;
        }

        // Lấy thông tin user từ API
        const userData = await getCurrentUser(token);
        
        if (userData) {
          setUser(userData);
          setLoading(false);
        } else {
          // Không thể lấy thông tin user, xóa token và redirect
          localStorage.removeItem('accessToken');
          setUser(null);
          setLoading(false);
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth error:', error);
        // Xóa token và redirect về login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
        }
        setUser(null);
        setLoading(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    setUser(null);
    router.push('/login');
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Để nhận refresh token cookie
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        
        // Lấy thông tin user
        const userData = await getCurrentUser(data.accessToken);
        if (userData) {
          setUser(userData);
          router.push('/dashboard');
          return { success: true };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
    return { success: false, error: 'Login failed' };
  };

  return { user, loading, logout, login };
} 