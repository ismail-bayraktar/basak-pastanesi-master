import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Package, Truck, DollarSign, AlertCircle } from "lucide-react"
import { formatCurrency, formatPercentage, calculatePercentageChange } from "@/lib/utils"

export function KPICards({ stats, dailySales, deliveryStatus, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate stats
  const todaySales = dailySales?.totalRevenue || 0
  const todayOrders = dailySales?.totalOrders || 0
  const previousMonthRevenue = stats?.lastMonth?.revenue || 0
  const currentMonthRevenue = stats?.thisMonth?.revenue || 0
  const revenueGrowth = calculatePercentageChange(currentMonthRevenue, previousMonthRevenue)

  // Delivery stats
  const totalDeliveries = deliveryStatus?.total || 0
  const completedDeliveries = deliveryStatus?.completed || 0
  const deliveryRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0

  // Pending orders (from stats)
  const pendingOrders = stats?.pendingOrders || 0
  const lowStockProducts = stats?.lowStockProducts || 0

  const cards = [
    {
      title: "Bugünkü Satışlar",
      value: formatCurrency(todaySales),
      subtitle: `${todayOrders} sipariş`,
      icon: DollarSign,
      trend: revenueGrowth,
      trendLabel: "bu aya göre",
    },
    {
      title: "Aktif Siparişler",
      value: pendingOrders.toString(),
      subtitle: "İşlemde",
      icon: Package,
      badge: pendingOrders > 10 ? { label: "Yoğun", variant: "destructive" } : null,
    },
    {
      title: "Kurye Teslimat",
      value: `${completedDeliveries}/${totalDeliveries}`,
      subtitle: `%${deliveryRate.toFixed(0)} tamamlandı`,
      icon: Truck,
      trend: deliveryRate - 75, // Compare to 75% target
      trendLabel: "hedefe göre",
    },
    {
      title: "Stok Uyarıları",
      value: lowStockProducts.toString(),
      subtitle: "Kritik seviyede",
      icon: AlertCircle,
      badge: lowStockProducts > 0 ? { label: "Dikkat", variant: "destructive" } : null,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        const hasTrend = card.trend !== undefined && card.trend !== null
        const isPositiveTrend = hasTrend && card.trend >= 0

        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                {card.badge && (
                  <Badge variant={card.badge.variant || "default"} className="text-xs">
                    {card.badge.label}
                  </Badge>
                )}
              </div>
              {hasTrend && (
                <div className="flex items-center gap-1 mt-2">
                  {isPositiveTrend ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isPositiveTrend ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatPercentage(card.trend)}
                  </span>
                  <span className="text-xs text-muted-foreground">{card.trendLabel}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
