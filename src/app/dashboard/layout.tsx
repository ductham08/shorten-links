import { AppSidebar } from "@/components/layout/app-sidebar"
import NavTopbar from "@/components/layout/nav-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ReactNode } from "react"

type DashboardLayoutProps = {
    children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div>
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}
