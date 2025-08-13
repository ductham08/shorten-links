'use client';

import { useEffect } from 'react';
import { usePageTitle } from '@/components/contexts/page-title-context';
import { LinksTable } from '@/components/links-table';

export default function DashboardPage() {

    const { setTitle } = usePageTitle()

    useEffect(() => {
        setTitle("Admin Dashboard")
    }, [setTitle])

    return (
        <div className='flex flex-col gap-6 p-6'>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Short Links</h1>
                <p className="text-muted-foreground">
                    Manage and monitor your shortened URLs
                </p>
            </div>
            <LinksTable />
        </div>
    );
}