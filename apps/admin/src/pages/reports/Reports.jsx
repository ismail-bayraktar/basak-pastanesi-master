import { useState, useEffect } from "react"
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
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  Truck,
  RefreshCw,
  Calendar,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { backendUrl } from "@/App"

export default function Reports() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState(null)

  // Sales Reports
  const [dailySales, setDailySales] = useState(null)
  const [weeklySales, setWeeklySales] = useState(null)
  const [monthlySales, setMonthlySales] = useState(null)

  // Product Analytics
  const [productAnalytics, setProductAnalytics] = useState(null)

  // User Behavior
  const [userBehavior, setUserBehavior] = useState(null)

  // Delivery Status
  const [deliveryStatus, setDeliveryStatus] = useState(null)

  useEffect(() => {
    fetchAllReports()
  }, [])

  const fetchAllReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const [
        dashboardRes,
        dailyRes,
        weeklyRes,
        monthlyRes,
        productRes,
        userRes,
        deliveryRes,
      ] = await Promise.all([
        axios.get(`${backendUrl}/api/report/dashboard`, { headers: { token } }),
        axios.get(`${backendUrl}/api/report/daily-sales`, { headers: { token } }),
        axios.get(`${backendUrl}/api/report/weekly-sales`, { headers: { token } }),
        axios.get(`${backendUrl}/api/report/monthly-sales`, { headers: { token } }),
        axios.get(`${backendUrl}/api/report/product-analytics`, { headers: { token } }),
        axios.get(`${backendUrl}/api/report/user-behavior`, { headers: { token } }),
        axios.get(`${backendUrl}/api/report/delivery-status`, { headers: { token } }),
      ])

      if (dashboardRes.data.success) setDashboardStats(dashboardRes.data.dashboard)
      if (dailyRes.data.success) setDailySales(dailyRes.data.report)
      if (weeklyRes.data.success) setWeeklySales(weeklyRes.data.report)
      if (monthlyRes.data.success) setMonthlySales(monthlyRes.data.report)
      if (productRes.data.success) setProductAnalytics(productRes.data.analytics)
      if (userRes.data.success) setUserBehavior(userRes.data.behavior)
      if (deliveryRes.data.success) setDeliveryStatus(deliveryRes.data.delivery)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Hata",
        description: "Raporlar yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount)
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
              {trendValue}
            </span>
            {description && <span className="ml-1">{description}</span>}
          </div>
        )}
        {description && !trend && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Tulumbak Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Raporlar</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Button onClick={fetchAllReports} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">İşletme Raporları</h1>
            <p className="text-muted-foreground">
              Satış, ürün ve müşteri analizleri
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger value="sales">
                <DollarSign className="w-4 h-4 mr-2" />
                Satışlar
              </TabsTrigger>
              <TabsTrigger value="products">
                <Package className="w-4 h-4 mr-2" />
                Ürünler
              </TabsTrigger>
              <TabsTrigger value="customers">
                <Users className="w-4 h-4 mr-2" />
                Müşteriler
              </TabsTrigger>
              <TabsTrigger value="delivery">
                <Truck className="w-4 h-4 mr-2" />
                Teslimat
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {dashboardStats && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Bu Ay Gelir"
                      value={formatCurrency(dashboardStats.thisMonth.revenue)}
                      icon={DollarSign}
                      trend={parseFloat(dashboardStats.growth.revenue) >= 0 ? "up" : "down"}
                      trendValue={dashboardStats.growth.revenue}
                      description="geçen aya göre"
                    />
                    <StatCard
                      title="Bu Ay Siparişler"
                      value={dashboardStats.thisMonth.orders}
                      icon={ShoppingCart}
                      trend={parseFloat(dashboardStats.growth.orders) >= 0 ? "up" : "down"}
                      trendValue={dashboardStats.growth.orders}
                      description="geçen aya göre"
                    />
                    <StatCard
                      title="Bekleyen Siparişler"
                      value={dashboardStats.pendingOrders}
                      icon={Truck}
                      description="işlem bekliyor"
                    />
                    <StatCard
                      title="Düşük Stok Ürünler"
                      value={dashboardStats.lowStockProducts}
                      icon={Package}
                      description={`toplam ${dashboardStats.totalProducts} üründen`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Geçen Ay Karşılaştırması</CardTitle>
                        <CardDescription>Aylık performans özeti</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Bu Ay</p>
                              <p className="text-2xl font-bold">
                                {formatCurrency(dashboardStats.thisMonth.revenue)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {dashboardStats.thisMonth.orders} sipariş
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Geçen Ay</p>
                              <p className="text-2xl font-bold">
                                {formatCurrency(dashboardStats.lastMonth.revenue)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {dashboardStats.lastMonth.orders} sipariş
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Sistem Özeti</CardTitle>
                        <CardDescription>Platform istatistikleri</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Toplam Ürün</span>
                            <Badge variant="secondary">{dashboardStats.totalProducts}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Toplam Kullanıcı</span>
                            <Badge variant="secondary">{dashboardStats.totalUsers}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Düşük Stok</span>
                            <Badge variant="destructive">{dashboardStats.lowStockProducts}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Bekleyen Siparişler</span>
                            <Badge variant="outline">{dashboardStats.pendingOrders}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Sales Tab */}
            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dailySales && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Bugünün Satışları</CardTitle>
                      <CardDescription>{dailySales.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(dailySales.totalRevenue)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dailySales.totalOrders} sipariş
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ort: {formatCurrency(dailySales.averageOrderValue)}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {weeklySales && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Haftalık Satışlar</CardTitle>
                      <CardDescription>Son 7 gün</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(weeklySales.totalRevenue)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {weeklySales.totalOrders} sipariş
                      </p>
                    </CardContent>
                  </Card>
                )}

                {monthlySales && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Aylık Satışlar</CardTitle>
                      <CardDescription>Son 30 gün</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(monthlySales.totalRevenue)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {monthlySales.totalOrders} sipariş
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ort: {formatCurrency(monthlySales.averageOrderValue)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {weeklySales && Object.keys(weeklySales.dailyBreakdown).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Günlük Satış Dağılımı</CardTitle>
                    <CardDescription>Son 7 günün detaylı analizi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(weeklySales.dailyBreakdown).map(([date, data]) => (
                        <div key={date} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{date}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatCurrency(data.revenue)}</p>
                            <p className="text-xs text-muted-foreground">{data.orders} sipariş</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              {productAnalytics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>En Çok Satan Ürünler</CardTitle>
                        <CardDescription>İlk 10 ürün</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {productAnalytics.topProducts.slice(0, 10).map((product, index) => (
                            <div key={product.productId} className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                                  {index + 1}
                                </Badge>
                                <div>
                                  <p className="text-sm font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.totalSold} adet satıldı
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{formatCurrency(product.revenue)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Ürün İstatistikleri</CardTitle>
                        <CardDescription>Genel ürün özeti</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <StatCard
                            title="Satışı Yapılan Ürün Çeşidi"
                            value={productAnalytics.totalProducts}
                            icon={Package}
                          />
                          {productAnalytics.topProducts[0] && (
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-2">En Çok Satan</p>
                              <p className="text-lg font-bold">{productAnalytics.topProducts[0].name}</p>
                              <p className="text-sm text-muted-foreground">
                                {productAnalytics.topProducts[0].totalSold} adet - {" "}
                                {formatCurrency(productAnalytics.topProducts[0].revenue)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-6">
              {userBehavior && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Toplam Kullanıcı"
                    value={userBehavior.totalUsers}
                    icon={Users}
                  />
                  <StatCard
                    title="Sipariş Veren Kullanıcı"
                    value={userBehavior.usersWithOrders}
                    icon={ShoppingCart}
                    description={`%${userBehavior.repeatCustomerRate} oran`}
                  />
                  <StatCard
                    title="Kullanıcı Başına Ort. Sipariş"
                    value={userBehavior.averageOrdersPerUser.toFixed(2)}
                    icon={BarChart3}
                  />
                </div>
              )}

              {userBehavior && userBehavior.topCustomers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>En Değerli Müşteriler</CardTitle>
                    <CardDescription>En çok sipariş veren müşteriler</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userBehavior.topCustomers.map((customer, index) => (
                        <div key={customer.userId} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">
                                {customer.user?.name || "Kullanıcı Bulunamadı"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {customer.user?.email || ""}
                              </p>
                            </div>
                          </div>
                          <Badge>{customer.orderCount} sipariş</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-6">
              {deliveryStatus && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sipariş Durumu</CardTitle>
                        <CardDescription>Sipariş durum dağılımı</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(deliveryStatus.statusCount).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                              <span className="text-sm">{status}</span>
                              <Badge variant="secondary">{count} sipariş</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Kurye Durumu</CardTitle>
                        <CardDescription>Kargo takip durumları</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(deliveryStatus.courierStatusCount).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                              <span className="text-sm">{status}</span>
                              <Badge variant="outline">{count} sipariş</Badge>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Ortalama Teslimat Süresi</span>
                          <Badge variant="secondary">{deliveryStatus.averageDeliveryTime.toFixed(1)} saat</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
