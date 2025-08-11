'use client';

import { usePageTitle } from '@/components/contexts/page-title-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

export default function AdminPage() {

    const { setTitle } = usePageTitle()

    useEffect(() => {
        setTitle("Short links")
    }, [setTitle])

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