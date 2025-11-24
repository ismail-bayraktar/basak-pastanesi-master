import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
} from "lucide-react"
import { formatCurrency, getStatusColor } from "@/lib/utils"
import { useState } from "react"
import { orderAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function OrderDetailModal({ order, open, onOpenChange, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(order.status)
  const [updating, setUpdating] = useState(false)
  const [sendingToCourier, setSendingToCourier] = useState(false)
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
        await onStatusUpdate(order._id, order.status) // Refresh without changing status
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

  if (!order) return null

  const orderDate = new Date(order.date)
  const statusOptions = [
    "Siparişiniz Alındı",
    "Bekliyor",
    "Hazırlanıyor",
    "Kuryeye Verildi",
    "Teslim Edildi",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Sipariş Detayları</span>
            <Badge className={getStatusColor(order.status || "Bilinmiyor")}>
              {order.status || "Bilinmiyor"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Sipariş No: #{order._id?.slice(-8) || "N/A"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Sipariş Tarihi</span>
              </div>
              <p className="font-medium">
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
              <p className="font-medium">{order.payment ? "Kapıda Ödeme" : "Online Ödeme"}</p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Müşteri Bilgileri
            </h3>
            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {order.address?.firstName || ""} {order.address?.lastName || ""}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm">{order.address?.phone || "N/A"}</p>
                </div>
              </div>
              {order.address?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{order.address.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
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
            <h3 className="font-semibold mb-3 flex items-center gap-2">
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
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size && `Boyut: ${item.size}`}
                        {item.category && ` • ${item.category}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-muted-foreground">Adet: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
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
            <div className="flex justify-between text-lg font-bold">
              <span>Toplam</span>
              <span>{formatCurrency(order.amount + (order.deliveryFee || 0))}</span>
            </div>
          </div>

          <Separator />

          {/* Courier Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Kurye Durumu
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              {order.courierAssigned ? (
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Truck className="h-3 w-3 mr-1" />
                    Kuryeye Atandı
                  </Badge>
                  {order.courierInfo && (
                    <div className="text-sm space-y-1">
                      <p>Kurye: {order.courierInfo.name || "Bilinmiyor"}</p>
                      <p>Telefon: {order.courierInfo.phone || "N/A"}</p>
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
                    <p>Bu sipariş henüz kuryeye atanmamış</p>
                  </div>

                  {order.status === "Hazırlanıyor" && (
                    <>
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-900">
                          Sipariş hazır olduğunda aşağıdaki butona tıklayarak kuryeye gönderin.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleSendToCourier}
                        disabled={sendingToCourier}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendingToCourier ? "Gönderiliyor..." : "Kuryeye Gönder"}
                      </Button>
                    </>
                  )}

                  {order.status !== "Hazırlanıyor" && (
                    <p className="text-xs text-muted-foreground">
                      Siparişi kuryeye göndermek için durumu "Hazırlanıyor" olarak değiştirin.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status Update */}
          <div>
            <h3 className="font-semibold mb-3">Durum Güncelle</h3>
            <div className="flex gap-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={newStatus === order.status || updating}
              >
                {updating ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
