import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, RefreshCw, Calendar, Truck, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useOrders } from "@/pages/dashboard/hooks/useOrders"
import { usePolling } from "@/pages/dashboard/hooks/usePolling"
import { useCourierData } from "@/pages/dashboard/hooks/useCourierData"
import { useRealtimeStats } from "@/pages/dashboard/hooks/useRealtimeStats"
import { useToast } from "@/hooks/use-toast"
import { useNotificationSettings } from "@/hooks/useNotificationSettings"
import { OrdersTable } from "./components/OrdersTable"
import { OrderOffcanvas } from "@/components/OrderOffcanvas"
import { NotificationSettingsModal } from "@/components/NotificationSettingsModal"

export default function Orders() {
  const { orders, loading, fetchOrders, updateOrderStatus } = useOrders()
  const { courierData, loading: courierLoading, fetchCourierData } = useCourierData()
  const { toast } = useToast()
  const { isEnabled: notificationsEnabled } = useNotificationSettings()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [offcanvasOpen, setOffcanvasOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)

  // Real-time SSE connection
  const { connected: realtimeConnected, reconnect: reconnectRealtime } = useRealtimeStats({
    onNewOrder: () => {
      fetchOrders(true)
      fetchCourierData(true)
    },
    onOrderStatusChange: () => {
      fetchOrders(true)
    },
    onCourierAssigned: () => {
      fetchOrders(true)
      fetchCourierData(true)
    }
  })

  // Fallback polling (reduced frequency since we have SSE)
  usePolling(() => {
    if (!realtimeConnected) {
      fetchOrders(true)
      fetchCourierData(true)
    }
  }, 60000)

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    await fetchCourierData()
    setRefreshing(false)
    toast({
      title: "Yenilendi",
      description: "Veriler güncellendi",
    })
  }

  const handleExport = () => {
    // Prepare CSV data
    const csvData = filteredOrders.map((order) => ({
      "Sipariş No": order._id?.slice(-8) || "N/A",
      "Müşteri": `${order.address?.firstName || ""} ${order.address?.lastName || ""}`,
      "Tutar": `₺${order.amount?.toFixed(2) || "0.00"}`,
      "Durum": order.status || "Bilinmiyor",
      "Tarih": new Date(order.date).toLocaleDateString("tr-TR"),
      "Adres": `${order.address?.street || ""}, ${order.address?.city || ""}`,
      "Telefon": order.address?.phone || "",
    }))

    // Convert to CSV
    const headers = Object.keys(csvData[0]).join(",")
    const rows = csvData.map((row) => Object.values(row).join(","))
    const csv = [headers, ...rows].join("\n")

    // Download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `siparisler_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  // Filter orders based on search, status, and date
  const filteredOrders = orders.filter((order) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      order._id?.toLowerCase().includes(searchLower) ||
      order.address?.firstName?.toLowerCase().includes(searchLower) ||
      order.address?.lastName?.toLowerCase().includes(searchLower) ||
      order.address?.phone?.includes(searchQuery)

    // Status filter
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    // Date filter
    let matchesDate = true
    if (dateFilter !== "all") {
      const orderDate = new Date(order.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      switch (dateFilter) {
        case "today":
          matchesDate = orderDate >= today
          break
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          matchesDate = orderDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          matchesDate = orderDate >= monthAgo
          break
        default:
          matchesDate = true
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Main Header - Clean and Simple */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Tulumbak Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Siparişler</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {/* Mobil-first Yenile Butonu */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 px-2 sm:px-3"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''} sm:mr-2`} />
              <span className="hidden sm:inline">Yenile</span>
            </Button>
          </div>
        </header>

        {/* Status Bar - Desktop Only */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-b">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Sistem Durumu:</span>
          </div>
          <Badge
            variant={courierData?.todaySummary?.totalDeliveries > 0 ? "default" : "secondary"}
            className="cursor-pointer"
            title={courierData?.todaySummary?.totalDeliveries > 0
              ? `Kurye Entegrasyonu Aktif - ${courierData.todaySummary.totalDeliveries} sipariş`
              : "Kurye entegrasyonu bağlantısı bekleniyor"}
          >
            <Truck className="h-3 w-3 mr-1" />
            {courierData?.todaySummary?.totalDeliveries > 0 ? "Kurye Bağlı" : "Kurye Bekliyor"}
          </Badge>
          <Badge
            variant={notificationsEnabled ? "outline" : "secondary"}
            className="cursor-pointer hover:bg-accent"
            onClick={() => setNotificationSettingsOpen(true)}
            title="Bildirim ayarlarını aç"
          >
            {notificationsEnabled ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Bildirim Aktif
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Bildirim Kapalı
              </>
            )}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
          {/* Page Header - Mobile Responsive */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Siparişler</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Tüm siparişleri görüntüleyin ve yönetin
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredOrders.length === 0}
              className="self-start sm:self-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sipariş no, müşteri adı veya telefon ile ara..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Durum Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="Siparişiniz Alındı">Sipariş Alındı</SelectItem>
                <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                <SelectItem value="Hazırlanıyor">Hazırlanıyor</SelectItem>
                <SelectItem value="Kuryeye Verildi">Kuryeye Verildi</SelectItem>
                <SelectItem value="Teslim Edildi">Teslim Edildi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tarih Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Son 7 Gün</SelectItem>
                <SelectItem value="month">Son 30 Gün</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredOrders.length} sipariş bulundu
              {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                ? ` (${orders.length} toplam)`
                : ""}
            </p>
          </div>

          {/* Orders Table */}
          <OrdersTable
            orders={filteredOrders}
            loading={loading}
            onStatusUpdate={updateOrderStatus}
            onViewDetails={(order) => {
              setSelectedOrder(order)
              setOffcanvasOpen(true)
            }}
          />

          {/* Order Details Offcanvas */}
          <OrderOffcanvas
            order={selectedOrder}
            open={offcanvasOpen}
            onOpenChange={(open) => {
              setOffcanvasOpen(open)
              if (!open) setSelectedOrder(null)
            }}
            onStatusUpdate={async (orderId, newStatus) => {
              await updateOrderStatus(orderId, newStatus)
              // Refresh the order in selectedOrder if it's currently open
              if (selectedOrder?._id === orderId) {
                const updatedOrder = orders.find(o => o._id === orderId)
                setSelectedOrder(updatedOrder)
              }
            }}
          />

          {/* Notification Settings Modal */}
          <NotificationSettingsModal
            open={notificationSettingsOpen}
            onOpenChange={setNotificationSettingsOpen}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
