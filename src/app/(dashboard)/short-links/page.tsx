'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
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