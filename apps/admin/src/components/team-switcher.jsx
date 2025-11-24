import * as React from "react"
import logo from "@/assets/logo.png"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({ teams }) {
  const activeTeam = teams[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-default h-14"
        >
          <div className="flex size-12 items-center justify-center rounded-lg overflow-hidden">
            <img src={logo} alt="Tulumbak Logo" className="w-full h-full object-contain" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {activeTeam.name}
            </span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
