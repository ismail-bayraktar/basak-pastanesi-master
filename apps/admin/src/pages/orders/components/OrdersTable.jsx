import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  Package,
  Send,
  Loader2,
} from "lucide-react"
import { formatCurrency, formatRelativeTime, getStatusColor } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { orderAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function OrdersTable({ orders, loading, onStatusUpdate, onViewDetails }) {
  const [selectedOrders, setSelectedOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState({}) // Track loading state per order
  const { toast } = useToast()
  const itemsPerPage = 15

  // Pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage)

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o._id))
    }
  }

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  const isSelected = (orderId) => selectedOrders.includes(orderId)
  const isAllSelected =
    paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length

  // Status update handler
  const handleStatusUpdate = async (orderId, newStatus) => {
    await onStatusUpdate(orderId, newStatus)
  }

  // Handle "Hazırlanıyor" status change
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

  // Handle send to courier - ACTUAL API CALL!
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Sipariş bulunamadı</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Filtrelerinizi değiştirerek tekrar deneyin
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">
            {selectedOrders.length} sipariş seçildi
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              selectedOrders.forEach((orderId) =>
                handleStatusUpdate(orderId, "Hazırlanıyor")
              )
              setSelectedOrders([])
            }}
          >
            <Clock className="h-4 w-4 mr-2" />
            Hazırlanıyor Yap
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              selectedOrders.forEach((orderId) =>
                handleStatusUpdate(orderId, "Kuryeye Verildi")
              )
              setSelectedOrders([])
            }}
          >
            <Truck className="h-4 w-4 mr-2" />
            Kuryeye Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedOrders([])}
          >
            İptal
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Sipariş No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Ürünler</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Kurye</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => {
              const isCourierAssigned = order.courierIntegration?.syncStatus === 'synced'

              return (
                <TableRow key={order._id} className={isSelected(order._id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected(order._id)}
                      onCheckedChange={() => toggleSelectOrder(order._id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    #{order._id?.slice(-8) || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {order.address?.firstName || ""} {order.address?.lastName || ""}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.address?.phone || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items?.length || 0} ürün
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(order.amount || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status || "Bilinmiyor")}>
                      {order.status || "Bilinmiyor"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isCourierAssigned ? (
                      <Badge variant="outline" className="bg-purple-50">
                        <Truck className="h-3 w-3 mr-1" />
                        Atandı
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50">
                        Bekliyor
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(order.date)}
                  </TableCell>

                  {/* INLINE ACTION BUTTONS + DROPDOWN */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Show "Hazırlanıyor" button if status is "Siparişiniz Alındı" */}
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

                      {/* Show "Kuryeye Gönder" if status is "Hazırlanıyor" and NOT assigned */}
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

                      {/* Dropdown for all other actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onViewDetails(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detayları Gör
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order._id, "Teslim Edildi")}
                            disabled={order.status === "Teslim Edildi"}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Teslim Edildi
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
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
