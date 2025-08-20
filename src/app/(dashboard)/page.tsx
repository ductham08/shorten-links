'use client';

import { useEffect } from 'react';
import { usePageTitle } from '@/components/contexts/page-title-context';
import { LinksTable } from '@/components/links-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InfoClient from '@/components/info-client';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/loading';
import { AdminLinksTable } from '@/components/admin-links-table';
import { AdminUsersTable } from '@/components/admin-users-table';

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
                <div className='w-full flex flex-col gap-6'>

                    <Card className='w-full'>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                Manage and monitor all users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminUsersTable />
                        </CardContent>
                    </Card>

                    <Card className='w-full'>
                        <CardHeader>
                            <CardTitle>All Links</CardTitle>
                            <CardDescription>
                                Manage and monitor all shortened URLs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminLinksTable />
                        </CardContent>
                    </Card>
                </div>
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