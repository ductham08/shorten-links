'use client';

import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import data from "./data.json"
import { SectionCards } from '@/components/section-cards';
import { useEffect } from 'react';
import { usePageTitle } from '@/components/contexts/page-title-context';

export default function DashboardPage() {

    const { setTitle } = usePageTitle()

    useEffect(() => {
        setTitle("Admin Dashboard")
    }, [setTitle])

    return (
        <div className='flex flex-col gap-4'>
            <SectionCards />
            <ChartAreaInteractive />
            <DataTable data={data} />
        </div>
    );
}