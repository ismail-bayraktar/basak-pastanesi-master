import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  MapPin,
  Phone,
  User,
  CreditCard,
  Printer,
  Truck,
  StickyNote,
  X,
} from 'lucide-react';
import { backendUrl } from '@/App';
import { useToast } from '@/hooks/use-toast';

/**
 * OrderActionModal Component
 * Modal popup for new order notifications with print and courier assignment actions
 */
export function OrderActionModal({ order, open, onClose, onCourierAssign }) {
  const { toast } = useToast();
  const [printing, setPrinting] = useState(false);
  const [assigning, setAssigning] = useState(false);

  if (!order) return null;

  /**
   * Handle print courier receipt
   */
  const handlePrint = async () => {
    try {
      setPrinting(true);

      const token = localStorage.getItem('token');

      // Open print URL in new window
      const printUrl = `${backendUrl}/api/notifications/print/${order.id}`;

      const printWindow = window.open(printUrl, '_blank', 'width=800,height=600');

      if (!printWindow) {
        toast({
          title: 'Hata',
          description: 'Yazdırma penceresi açılamadı. Popup engelleyici kontrol edin.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Yazdırma',
        description: 'Kurye fişi yazdırma penceresi açıldı',
      });
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: 'Hata',
        description: 'Yazdırma sırasında hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setPrinting(false);
    }
  };

  /**
   * Handle assign to courier
   */
  const handleAssignToCourier = async () => {
    try {
      setAssigning(true);

      if (onCourierAssign) {
        await onCourierAssign(order.id);
      }

      toast({
        title: 'Başarılı',
        description: 'Sipariş kuryeye atandı',
      });

      // Close modal after assignment
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Courier assign error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Kurye atama sırasında hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  // Format date
  const orderDate = new Date(order.createdAt).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-600" />
              Yeni Sipariş
            </DialogTitle>
            <Badge variant="default" className="bg-green-500 text-white">
              Yeni
            </Badge>
          </div>
          <DialogDescription>
            Sipariş #{order.orderNumber} - {orderDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Müşteri Bilgileri
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{order.customer?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.customer?.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <span className="flex-1">{order.customer?.address}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Sipariş İçeriği
            </h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Miktar: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.price?.toFixed(2)} TL</p>
                    <p className="text-sm text-muted-foreground">
                      Toplam: {(item.price * item.quantity).toFixed(2)} TL
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Ödeme Bilgileri
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Ödeme Yöntemi:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Toplam Tutar:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {order.total?.toFixed(2)} TL
                </span>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {order.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <StickyNote className="w-5 h-5" />
                  Müşteri Notu
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-900">{order.notes}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              disabled={printing}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Printer className="w-5 h-5 mr-2" />
              {printing ? 'Yazdırılıyor...' : 'Kurye Fişi Yazdır'}
            </Button>

            <Button
              onClick={handleAssignToCourier}
              disabled={assigning}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              <Truck className="w-5 h-5 mr-2" />
              {assigning ? 'Atanıyor...' : 'Kuryeye Ata'}
            </Button>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OrderActionModal;
