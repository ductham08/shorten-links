import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import data from "./data.json"
import { SectionCards } from '@/components/section-cards';

export default function DashboardPage() {
    return (
        <div className='flex flex-col gap-4'>
            <SectionCards />
            <ChartAreaInteractive />
            <DataTable data={data} />
        </div>
    );
}