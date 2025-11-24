import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/utils"

export function OrderStatusBadge({ status, className }) {
  return (
    <Badge className={`${getStatusColor(status)} ${className}`}>
      {status}
    </Badge>
  )
}

export function CourierStatusBadge({ assigned, courierName, className }) {
  if (!assigned) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        Kurye Atanmadı
      </Badge>
    )
  }

  return (
    <Badge className={`bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-xs ${className}`}>
      {courierName || 'Kuryeye Atandı'}
    </Badge>
  )
}
