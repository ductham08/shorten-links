"use client"

import * as React from "react"
import {
  IconDashboard,
  IconImageInPicture,
  IconUnlink,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Shorten Url",
      url: "/shorten-url",
      icon: IconUnlink,
    },
    // {
    //   title: "Branded",
    //   url: "/branded",
    //   icon: IconImageInPicture,
    // }
  ]
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    email: string
    id: string
    name: string
    role: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#" className="flex items-center gap-2">
                <img src="/icons/favicon.png" className="w-[24px]" alt="" />
                <span className="text-base font-semibold">Shorten Url</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
