import { useState, useEffect, useCallback, useRef } from 'react'
import { orderAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { sendNewOrderNotification } from '@/lib/notifications'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const previousOrderCount = useRef(0)

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      // Check if token exists before making API calls
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('useOrders: No token available, skipping fetch')
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }
      setError(null)

      const response = await orderAPI.getAll()

      if (response.data.success) {
        const newOrders = response.data.orders || []

        // Check for new orders (only if we have previous data)
        if (previousOrderCount.current > 0 && newOrders.length > previousOrderCount.current) {
          // New order detected!
          const latestOrder = newOrders[0] // Assuming newest is first
          sendNewOrderNotification(latestOrder)

          // Show toast notification too
          toast({
            title: 'Yeni Sipariş!',
            description: `${latestOrder.address?.firstName || 'Müşteri'} - ₺${latestOrder.amount?.toFixed(2) || '0.00'}`,
            duration: 5000,
          })
        }

        previousOrderCount.current = newOrders.length
        setOrders(newOrders)
      } else {
        throw new Error(response.data.message || 'Siparişler alınamadı')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Siparişler yüklenirken hata oluştu'
      setError(errorMessage)

      if (!silent) {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: errorMessage,
        })
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [toast])

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await orderAPI.updateStatus(orderId, newStatus)

      if (response.data.success) {
        // Update local state optimistically
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        )

        toast({
          title: 'Başarılı',
          description: 'Sipariş durumu güncellendi',
        })

        return true
      } else {
        throw new Error(response.data.message || 'Durum güncellenemedi')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Durum güncellenirken hata oluştu'
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: errorMessage,
      })
      return false
    }
  }

  // Initial fetch - retry if token becomes available
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchOrders()
    } else {
      // Retry after a short delay in case token is being written
      const retryTimeout = setTimeout(() => {
        const retryToken = localStorage.getItem('token')
        if (retryToken) {
          fetchOrders()
        }
      }, 100)
      return () => clearTimeout(retryTimeout)
    }
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
  }
}
