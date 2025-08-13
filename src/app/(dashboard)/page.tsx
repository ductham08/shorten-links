'use client';

import { useEffect } from 'react';
import { usePageTitle } from '@/components/contexts/page-title-context';
import { LinksTable } from '@/components/links-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {

    const { setTitle } = usePageTitle()

    useEffect(() => {
        setTitle("Admin Dashboard")
    }, [setTitle])

    return (
        <div className='flex flex-col gap-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Links</CardTitle>
                    <CardDescription>
                    Manage and monitor your shortened URLs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LinksTable />
                </CardContent>
            </Card>
        </div>
    );
}