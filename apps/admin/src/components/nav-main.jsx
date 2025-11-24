import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({ items }) {
  const location = useLocation()
  const [openItems, setOpenItems] = useState(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('sidebar-open-items')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return {}
      }
    }
    // Set default open items
    const defaults = {}
    items.forEach(item => {
      defaults[item.title] = item.isActive || false
    })
    return defaults
  })

  // Find which item contains current route and open it
  useEffect(() => {
    const currentPath = location.pathname
    const newOpenItems = { ...openItems }

    items.forEach(item => {
      const hasActiveChild = item.items?.some(subItem =>
        currentPath === subItem.url || currentPath.startsWith(subItem.url + '/')
      )
      if (hasActiveChild) {
        newOpenItems[item.title] = true
      }
    })

    setOpenItems(newOpenItems)
  }, [location.pathname])

  // Save to localStorage whenever openItems changes
  useEffect(() => {
    localStorage.setItem('sidebar-open-items', JSON.stringify(openItems))
  }, [openItems])

  const handleToggle = (title) => {
    setOpenItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={openItems[item.title] || false}
            onOpenChange={() => handleToggle(item.title)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link to={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
