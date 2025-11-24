import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Send, CheckCircle, Loader2 } from "lucide-react"
import { OrderStatusBadge, CourierStatusBadge } from "./OrderStatusBadge"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { orderAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function OrdersTable({ orders, loading, onStatusUpdate, onViewDetails }) {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState({}) // Track loading state per order
  const { toast } = useToast()
  const itemsPerPage = 10

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  // Filter orders by status
  const filteredOrders = selectedStatus === "all"
    ? orders
    : orders.filter((order) => order.status === selectedStatus)

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  // Status filter options
  const statusOptions = [
    { value: "all", label: "Tümü" },
    { value: "Siparişiniz Alındı", label: "Bekliyor" },
    { value: "Hazırlanıyor", label: "Hazırlanıyor" },
    { value: "Kuryeye Atandı", label: "Kuryeye Atandı" },
    { value: "Teslim Edildi", label: "Teslim Edildi" },
  ]

  const handleStatusChange = async (orderId, newStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(orderId, newStatus)
    }
  }

  // NEW: Handle "Hazırlanıyor" status change
  const handlePrepareOrder = async (orderId) => {
    setActionLoading(prev => ({ ...prev, [`prepare-${orderId}`]: true }))
    try {
      await onStatusUpdate(orderId, "Hazırlanıyor")
      toast({
        title: "Başarılı",
        description: "Sipariş hazırlanıyor olarak işaretlendi",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Durum güncellenirken hata oluştu",
      })
    } finally {
      setActionLoading(prev => ({ ...prev, [`prepare-${orderId}`]: false }))
    }
  }

  // NEW: Handle send to courier - FIXED!
  const handleSendToCourier = async (orderId) => {
    setActionLoading(prev => ({ ...prev, [`courier-${orderId}`]: true }))
    try {
      const response = await orderAPI.sendToCourier(orderId)

      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Sipariş kuryeye gönderildi",
        })
        // Refresh order data
        await onStatusUpdate(orderId, null) // null means refresh without status change
      } else {
        throw new Error(response.data.message || "Kurye gönderilemedi")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.response?.data?.message || error.message || "Kurye gönderilirken hata oluştu",
      })
    } finally {
      setActionLoading(prev => ({ ...prev, [`courier-${orderId}`]: false }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter - Mobile Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrele:</span>
          <div className="flex items-center gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedStatus === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedStatus(option.value)
                  setCurrentPage(1)
                }}
                className="whitespace-nowrap"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto">
          {filteredOrders.length} sipariş
        </Badge>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sipariş No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Kurye</TableHead>
              <TableHead>Zaman</TableHead>
              <TableHead className="text-right">Hızlı İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Sipariş bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => {
                const isCourierAssigned = order.courierIntegration?.syncStatus === 'synced'
                const courierName = order.courierIntegration?.platform === 'muditakurye' ? 'MuditaKurye' : null

                return (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      #{order.trackingId || order._id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{order.address?.name || 'Bilinmiyor'}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {order.address?.street || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <CourierStatusBadge
                        assigned={isCourierAssigned}
                        courierName={courierName}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(order.date)}
                    </TableCell>

                    {/* INLINE QUICK ACTION BUTTONS */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Hazırlanıyor button - Show if status is "Siparişiniz Alındı" */}
                        {order.status === "Siparişiniz Alındı" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrepareOrder(order._id)}
                            disabled={actionLoading[`prepare-${order._id}`]}
                            className="h-8 text-xs"
                          >
                            {actionLoading[`prepare-${order._id}`] ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            Hazırlanıyor
                          </Button>
                        )}

                        {/* Kuryeye Gönder button - Show if status is "Hazırlanıyor" and NOT assigned */}
                        {order.status === "Hazırlanıyor" && !isCourierAssigned && (
                          <Button
                            size="sm"
                            onClick={() => handleSendToCourier(order._id)}
                            disabled={actionLoading[`courier-${order._id}`]}
                            className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {actionLoading[`courier-${order._id}`] ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3 mr-1" />
                            )}
                            Kuryeye Gönder
                          </Button>
                        )}

                        {/* More options dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Detayları Gör
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(order._id, "Teslim Edildi")}
                              disabled={order.status === "Teslim Edildi"}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Teslim Edildi
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sayfa {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
