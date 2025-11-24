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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { RefreshCw, Wifi, WifiOff, Truck } from "lucide-react"
import { useState } from "react"
import { KPICards } from "./components/KPICards"
import { OrdersTable } from "./components/OrdersTable"
import { CourierWidgets } from "./components/CourierWidgets"
import { OrderOffcanvas } from "@/components/OrderOffcanvas"
import { NotificationSettingsModal } from "@/components/NotificationSettingsModal"
import { useDashboardStats } from "./hooks/useDashboardStats"
import { useOrders } from "./hooks/useOrders"
import { useCourierData } from "./hooks/useCourierData"
import { usePolling } from "./hooks/usePolling"
import { useRealtimeStats } from "./hooks/useRealtimeStats"
import { useToast } from "@/hooks/use-toast"
import { useNotificationSettings } from "@/hooks/useNotificationSettings"

export default function Dashboard() {
  const { stats, dailySales, deliveryStatus, loading: statsLoading, fetchStats } = useDashboardStats()
  const { orders, loading: ordersLoading, fetchOrders, updateOrderStatus } = useOrders()
  const { courierData, loading: courierLoading, fetchCourierData } = useCourierData()
  const { toast } = useToast()
  const { isEnabled: notificationsEnabled } = useNotificationSettings()

  // Order details offcanvas state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [offcanvasOpen, setOffcanvasOpen] = useState(false)

  // Notification settings modal state
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)

  // Real-time SSE connection
  const { connected: realtimeConnected, reconnect: reconnectRealtime } = useRealtimeStats({
    onNewOrder: (order) => {
      // Refresh all data when new order arrives
      fetchOrders(true)
      fetchStats(true)
      fetchCourierData(true)
    },
    onOrderStatusChange: (order) => {
      // Refresh orders and stats on status change
      fetchOrders(true)
      fetchStats(true)
    },
    onCourierAssigned: (order) => {
      // Refresh orders and courier data on assignment
      fetchOrders(true)
      fetchCourierData(true)
    }
  })

  // Fallback polling (reduced frequency since we have SSE)
  // Only poll every 60 seconds as backup
  usePolling(() => {
    if (!realtimeConnected) {
      // Only poll if SSE is disconnected
      fetchOrders(true)
      fetchStats(true)
      fetchCourierData(true)
    }
  }, 60000)

  const handleManualRefresh = () => {
    fetchOrders()
    fetchStats()
    fetchCourierData()
    toast({
      title: "Yenilendi",
      description: "Veriler güncellendi",
    })
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setOffcanvasOpen(true)
  }

  const handleOffcanvasClose = () => {
    setOffcanvasOpen(false)
    setSelectedOrder(null)
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus)
    // Refresh the order in selectedOrder if it's currently open
    if (selectedOrder?._id === orderId) {
      const updatedOrder = orders.find(o => o._id === orderId)
      setSelectedOrder(updatedOrder)
    }
  }

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
                    <BreadcrumbLink href="#">
                      Tulumbak Admin
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {/* Mobil-first Yenile Butonu */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={statsLoading || ordersLoading}
              className="h-8 px-2 sm:px-3"
            >
              <RefreshCw className={`h-4 w-4 ${(statsLoading || ordersLoading) ? 'animate-spin' : ''} sm:mr-2`} />
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
          {/* KPI Cards */}
          <KPICards
            stats={stats}
            dailySales={dailySales}
            deliveryStatus={deliveryStatus}
            loading={statsLoading}
          />

          {/* Courier Widgets */}
          <CourierWidgets
            courierData={courierData}
            loading={courierLoading}
            onRefresh={() => {
              fetchCourierData(true)
              fetchOrders(true)
              fetchStats(true)
            }}
          />

          {/* Orders Table */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Son Siparişler</h2>
              <p className="text-sm text-muted-foreground">
                Sipariş yönetimi ve durum güncellemeleri
              </p>
            </div>
            <OrdersTable
              orders={orders}
              loading={ordersLoading}
              onStatusUpdate={updateOrderStatus}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>

        {/* Order Details Offcanvas */}
        <OrderOffcanvas
          order={selectedOrder}
          open={offcanvasOpen}
          onOpenChange={handleOffcanvasClose}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Notification Settings Modal */}
        <NotificationSettingsModal
          open={notificationSettingsOpen}
          onOpenChange={setNotificationSettingsOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
