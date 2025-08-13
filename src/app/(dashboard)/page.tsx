'use client';

import { useEffect } from 'react';
import { usePageTitle } from '@/components/contexts/page-title-context';

export default function DashboardPage() {

    const { setTitle } = usePageTitle()

    useEffect(() => {
        setTitle("Admin Dashboard")
    }, [setTitle])

    return (
        <div className='flex flex-col gap-4'>
        </div>
    );
}