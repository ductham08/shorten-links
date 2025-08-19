'use client';

import { useEffect } from 'react';
import { usePageTitle } from '@/components/contexts/page-title-context';
import { LinksTable } from '@/components/links-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InfoClient from '@/components/info-client';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/loading';

export default function DashboardPage() {

    const { setTitle } = usePageTitle()
    const { loading, isAdmin } = useAuth();

    useEffect(() => {
        setTitle("Admin Dashboard")
    }, [setTitle])

    return (
        <div className='flex gap-6'>
            {loading ? (
                <Loading fullScreen />
            ) : isAdmin ? (
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Admin Dashboard</CardTitle>
                    </CardHeader>
                </Card>
            ) : (
                <>
                    <InfoClient />
                    <Card className='w-full'>
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
                </>
            )}
        </div>
    );
}