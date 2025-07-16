'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user || user.role !== 'admin') {
        router.push('/dashboard');
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Admin-only content: Manage users, settings, etc.</p>
            </CardContent>
        </Card>
    );
}