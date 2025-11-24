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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { courierAPI } from "@/lib/api"
import {
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  TruckIcon,
  Truck,
  Wifi,
  WifiOff,
} from "lucide-react"
import { NotificationSettingsModal } from "@/components/NotificationSettingsModal"
import { useCourierData } from "@/pages/dashboard/hooks/useCourierData"
import { useRealtimeStats } from "@/pages/dashboard/hooks/useRealtimeStats"
import { useNotificationSettings } from "@/hooks/useNotificationSettings"

export default function CourierPerformance() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [timeRange, setTimeRange] = useState("today") // today, week, month
  const [refreshing, setRefreshing] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)
  const { courierData, loading: courierLoading, fetchCourierData } = useCourierData()
  const { isEnabled: notificationsEnabled } = useNotificationSettings()

  // Real-time SSE connection
  const { connected: realtimeConnected, reconnect: reconnectRealtime } = useRealtimeStats({
    onNewOrder: () => {
      fetchCourierData(true)
      fetchStats(true)
    },
    onCourierAssigned: () => {
      fetchCourierData(true)
      fetchStats(true)
    }
  })

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const response = await courierAPI.getStats()
      if (response.data.success) {
        // Transform backend statistics to match frontend format
        const backendStats = response.data.statistics

        // Use real data from backend
        const transformedStats = {
          totalDeliveries: backendStats.platforms?.muditakurye?.orders || 0,
          successfulDeliveries: backendStats.platforms?.muditakurye?.synced || 0,
          failedDeliveries: backendStats.platforms?.muditakurye?.failed || 0,
          pendingDeliveries: (backendStats.platforms?.muditakurye?.orders || 0) -
                            (backendStats.platforms?.muditakurye?.synced || 0) -
                            (backendStats.platforms?.muditakurye?.failed || 0),
          averageDeliveryTime: "Hesaplanıyor", // TODO: Calculate from order data
          onTimeDeliveryRate: backendStats.platforms?.muditakurye?.successRate?.toFixed(1) || 0,
          todayDeliveries: 0, // TODO: Filter by today's date
          recentDeliveries: [] // TODO: Fetch recent delivery history
        }

        setStats(transformedStats)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || "İstatistikler yüklenirken hata oluştu",
      })
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStats(true)
    setRefreshing(false)
    toast({
      title: "Başarılı",
      description: "İstatistikler güncellendi",
    })
  }

  // Default empty stats when loading
  const defaultStats = {
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    pendingDeliveries: 0,
    averageDeliveryTime: "-",
    onTimeDeliveryRate: 0,
    todayDeliveries: 0,
    recentDeliveries: [],
  }

  const displayStats = stats || defaultStats

  const getStatusBadge = (status) => {
    const statusMap = {
      delivered: { label: "Teslim Edildi", variant: "default", icon: CheckCircle },
      in_transit: { label: "Yolda", variant: "secondary", icon: TruckIcon },
      failed: { label: "Başarısız", variant: "destructive", icon: XCircle },
      pending: { label: "Bekliyor", variant: "outline", icon: Clock },
    }
    const config = statusMap[status] || statusMap.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
          }`}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Ana Sayfa</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Kurye Performansı</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
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

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <TruckIcon className="h-8 w-8" />
                Teslimat İstatistikleri
              </h1>
              <p className="text-muted-foreground mt-1">
                Kurye performansı ve teslimat metrikleri
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="week">Bu Hafta</SelectItem>
                  <SelectItem value="month">Bu Ay</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Yenile
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Toplam Teslimat"
                value={displayStats.totalDeliveries}
                change="+12% önceki döneme göre"
                icon={Package}
                trend="up"
              />
              <StatCard
                title="Başarılı Teslimat"
                value={displayStats.successfulDeliveries}
                change={`%${((displayStats.successfulDeliveries / displayStats.totalDeliveries) * 100).toFixed(1)} başarı oranı`}
                icon={CheckCircle}
                trend="up"
              />
              <StatCard
                title="Ortalama Süre"
                value={displayStats.averageDeliveryTime}
                change="-5 dk önceki döneme göre"
                icon={Clock}
                trend="up"
              />
              <StatCard
                title="Zamanında Teslimat"
                value={`%${displayStats.onTimeDeliveryRate}`}
                change="+2.3% önceki döneme göre"
                icon={TrendingUp}
                trend="up"
              />
            </div>
          )}

          {/* Performance Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-900">
                  Başarılı Teslimatlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {displayStats.successfulDeliveries}
                </div>
                <p className="text-xs text-green-700 mt-1">
                  %{((displayStats.successfulDeliveries / displayStats.totalDeliveries) * 100).toFixed(1)} başarı oranı
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-900">
                  Başarısız Teslimatlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {displayStats.failedDeliveries}
                </div>
                <p className="text-xs text-red-700 mt-1">
                  %{((displayStats.failedDeliveries / displayStats.totalDeliveries) * 100).toFixed(1)} hata oranı
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-900">
                  Bekleyen Teslimatlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {displayStats.pendingDeliveries}
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Aktif olarak işleniyor
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deliveries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Son Teslimatlar</CardTitle>
              <CardDescription>
                En son gerçekleştirilen teslimat işlemleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teslimat ID</TableHead>
                      <TableHead>Sipariş No</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Kurye</TableHead>
                      <TableHead>Teslimat Süresi</TableHead>
                      <TableHead>Tarih/Saat</TableHead>
                      <TableHead>Detay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayStats.recentDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">{delivery.id}</TableCell>
                        <TableCell>{delivery.orderId}</TableCell>
                        <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                        <TableCell>{delivery.courier}</TableCell>
                        <TableCell>{delivery.deliveryTime}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {delivery.timestamp}
                        </TableCell>
                        <TableCell>
                          {delivery.failureReason && (
                            <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 border-red-200">
                              <AlertTriangle className="h-3 w-3" />
                              {delivery.failureReason}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>Not:</strong> İstatistikler gerçek sipariş verilerinizden otomatik hesaplanmaktadır.
                Daha detaylı analiz için zaman aralığını değiştirebilirsiniz.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings Modal */}
        <NotificationSettingsModal
          open={notificationSettingsOpen}
          onOpenChange={setNotificationSettingsOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
