import * as React from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MapPin,
  Clock,
  Settings,
  Truck,
  BarChart3,
  GitBranch,
  ShoppingBag,
  Image,
  Mail,
  FileText,
  Palette,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Basak Pastanesi Admin menu data
// RULE: NO EMOJIS! ONLY LUCIDE ICONS!
const data = {
  user: {
    name: "Admin User",
    email: "admin@basakpastanesi.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Başak Pastanesi",
      logo: ShoppingBag,
      plan: "E-Ticaret Admin",
    },
  ],
  navMain: [
    {
      title: "Ana Menü",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Siparişler",
          url: "/orders",
        },
      ],
    },
    {
      title: "Ürün Yönetimi",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Ürün Ekle",
          url: "/add",
        },
        {
          title: "Ürün Listesi",
          url: "/list",
        },
        {
          title: "Kategoriler",
          url: "/categories",
        },
      ],
    },
    {
      title: "İçerik Yönetimi",
      url: "#",
      icon: Image,
      items: [
        {
          title: "Slider Yönetimi",
          url: "/slider",
        },
        {
          title: "Medya Kütüphanesi",
          url: "/media",
        },
      ],
    },
    {
      title: "Teslimat Yönetimi",
      url: "#",
      icon: MapPin,
      items: [
        {
          title: "Teslimat Bölgeleri",
          url: "/delivery-zones",
        },
        {
          title: "Zaman Dilimleri",
          url: "/time-slots",
        },
      ],
    },
    {
      title: "Kurye Entegrasyonu",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "MuditaKurye Ayarları",
          url: "/courier-settings",
        },
        {
          title: "Kurye Performansı",
          url: "/courier-performance",
        },
      ],
    },
    {
      title: "Email Yönetimi",
      url: "#",
      icon: Mail,
      items: [
        {
          title: "Email Ayarları",
          url: "/email/settings",
        },
        {
          title: "Email Logları",
          url: "/email/logs",
        },
      ],
    },
    {
      title: "Sistem",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Genel Ayarlar",
          url: "/settings",
        },
        {
          title: "Raporlar",
          url: "/reports",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Müşteriler",
      url: "/customers",
      icon: Users,
    },
    {
      name: "Kuponlar",
      url: "/coupons",
      icon: BarChart3,
    },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
