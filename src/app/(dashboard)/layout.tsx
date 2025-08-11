'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/components/ui/loading';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { AppSidebar } from '@/components/app-sidebar';
import { PageTitleProvider } from '@/components/contexts/page-title-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    console.log(user);
    

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Hiển thị loading hoặc redirect nếu chưa có user
    if (loading) {
        return <Loading fullScreen />;
    }

    if (!user) {
        return null;
    }

    return (
        <PageTitleProvider>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" user={user} />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <div className="px-4 lg:px-6">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </PageTitleProvider>
    );
}