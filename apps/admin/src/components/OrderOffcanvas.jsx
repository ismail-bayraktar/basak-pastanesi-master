import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Phone,
  Mail,
  Package,
  Truck,
  Clock,
  CreditCard,
  User,
  Send,
  AlertCircle,
  ExternalLink,
  Trash2,
} from "lucide-react"
import { formatCurrency, getStatusColor } from "@/lib/utils"
import { useState } from "react"
import { orderAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function OrderOffcanvas({ order, open, onOpenChange, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(order?.status || "")
  const [updating, setUpdating] = useState(false)
  const [sendingToCourier, setSendingToCourier] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async () => {
    setUpdating(true)
    await onStatusUpdate(order._id, newStatus)
    setUpdating(false)
  }

  const handleSendToCourier = async () => {
    try {
      setSendingToCourier(true)
      const response = await orderAPI.sendToCourier(order._id)

      if (response.data.success) {
        toast({
          title: 'Başarılı',
          description: 'Sipariş kuryeye gönderildi',
        })
        // Refresh the order
        await onStatusUpdate(order._id, order.status)
      } else {
        throw new Error(response.data.message || 'Kurye gönderilemedi')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.response?.data?.message || error.message || 'Kurye gönderilirken hata oluştu',
      })
    } finally {
      setSendingToCourier(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      setDeleting(true)
      const response = await orderAPI.deleteOrder(order._id)

      if (response.data.success) {
        toast({
          title: 'Başarılı',
          description: 'Sipariş başarıyla silindi',
        })
        // Close the offcanvas and trigger parent refresh
        onOpenChange(false)
        // Trigger a status update to refresh the order list
        window.location.reload()
      } else {
        throw new Error(response.data.message || 'Sipariş silinemedi')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.response?.data?.message || error.message || 'Sipariş silinirken hata oluştu',
      })
    } finally {
      setDeleting(false)
    }
  }

  if (!order) return null

  const orderDate = new Date(order.date)
  const statusOptions = [
    "Siparişiniz Alındı",
    "Bekliyor",
    "Hazırlanıyor",
    "Kuryeye Verildi",
    "Teslim Edildi",
  ]

  // Check courier integration status
  const courierAssigned = order.courierIntegration?.syncStatus === 'synced'
  const courierPlatform = order.courierIntegration?.platform
  const externalOrderId = order.courierIntegration?.externalOrderId

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Sipariş Detayları</span>
            <Badge className={getStatusColor(order.status || "Bilinmiyor")}>
              {order.status || "Bilinmiyor"}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Sipariş No: #{order._id?.slice(-8) || "N/A"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Sipariş Tarihi</span>
              </div>
              <p className="font-medium text-sm">
                {orderDate.toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Ödeme Yöntemi</span>
              </div>
              <p className="font-medium text-sm">{order.payment ? "Kapıda Ödeme" : "Online Ödeme"}</p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Müşteri Bilgileri
            </h3>
            <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">
                    {order.address?.firstName || ""} {order.address?.lastName || ""}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm">{order.address?.phone || "N/A"}</p>
                </div>
              </div>
              {order.address?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{order.address.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm">
                    {order.address?.street || ""}
                    <br />
                    {order.address?.zipcode || ""} {order.address?.city || ""}
                    <br />
                    {order.address?.country || "Türkiye"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              Sipariş Ürünleri
            </h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image[0]}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size && `Boyut: ${item.size}`}
                        {item.category && ` • ${item.category}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(item.price)}</p>
                    <p className="text-xs text-muted-foreground">Adet: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ara Toplam</span>
              <span className="font-medium">{formatCurrency(order.amount || 0)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Teslimat Ücreti</span>
                <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Toplam</span>
              <span className="text-orange-600">{formatCurrency(order.amount + (order.deliveryFee || 0))}</span>
            </div>
          </div>

          <Separator />

          {/* Courier Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4" />
              Kurye Durumu
            </h3>
            <div className="bg-muted/50 p-3 rounded-lg space-y-3">
              {courierAssigned ? (
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Truck className="h-3 w-3 mr-1" />
                    Kuryeye Atandı - {courierPlatform === 'muditakurye' ? 'MuditaKurye' : courierPlatform}
                  </Badge>
                  {externalOrderId && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      <span>Kurye Sipariş ID: {externalOrderId}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mb-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Kuryeye Atanmadı
                    </Badge>
                    <p className="text-xs">Bu sipariş henüz kuryeye atanmamış</p>
                  </div>

                  {order.status === "Hazırlanıyor" && (
                    <>
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-xs text-blue-900">
                          Sipariş hazır olduğunda aşağıdaki butona tıklayarak kuryeye gönderin.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleSendToCourier}
                        disabled={sendingToCourier}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendingToCourier ? "Gönderiliyor..." : "Kuryeye Gönder"}
                      </Button>
                    </>
                  )}

                  {order.status !== "Hazırlanıyor" && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-xs text-yellow-900">
                        <strong>Dikkat!</strong> Siparişi kuryeye göndermek için önce durumu "Hazırlanıyor" olarak değiştirmelisiniz.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status Update */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Durum Güncelle</h3>
            <div className="space-y-2">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status} className="text-sm">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={newStatus === order.status || updating}
                size="sm"
                className="w-full"
              >
                {updating ? "Güncelleniyor..." : "Durumu Güncelle"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Delete Order */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-red-600">Tehlikeli Bölge</h3>
            <Button
              onClick={handleDeleteOrder}
              disabled={deleting}
              size="sm"
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Siliniyor..." : "Siparişi Sil"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Bu işlem geri alınamaz. Sipariş kalıcı olarak silinecektir.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
