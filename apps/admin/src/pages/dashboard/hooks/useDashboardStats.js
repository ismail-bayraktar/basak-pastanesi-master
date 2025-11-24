import { useState, useEffect, useCallback } from 'react'
import { dashboardAPI, courierAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [dailySales, setDailySales] = useState(null)
  const [deliveryStatus, setDeliveryStatus] = useState(null)
  const [courierStats, setCourierStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const fetchStats = useCallback(async (silent = false) => {
    try {
      // Check if token exists before making API calls
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('useDashboardStats: No token available, skipping fetch')
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }
      setError(null)

      // Fetch all stats in parallel
      const [dashboardRes, dailySalesRes, deliveryRes, courierRes] = await Promise.allSettled([
        dashboardAPI.getStats(),
        dashboardAPI.getDailySales(new Date().toISOString().split('T')[0]),
        dashboardAPI.getDeliveryStatus(),
        courierAPI.getStats(),
      ])

      // Process dashboard stats
      if (dashboardRes.status === 'fulfilled' && dashboardRes.value.data.success) {
        setStats(dashboardRes.value.data.dashboard)
      }

      // Process daily sales
      if (dailySalesRes.status === 'fulfilled' && dailySalesRes.value.data.success) {
        setDailySales(dailySalesRes.value.data.report)
      }

      // Process delivery status
      if (deliveryRes.status === 'fulfilled' && deliveryRes.value.data.success) {
        setDeliveryStatus(deliveryRes.value.data)
      }

      // Process courier stats
      if (courierRes.status === 'fulfilled' && courierRes.value.data.success) {
        setCourierStats(courierRes.value.data.stats)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'İstatistikler yüklenirken hata oluştu'
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

  // Initial fetch - retry if token becomes available
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchStats()
    } else {
      // Retry after a short delay in case token is being written
      const retryTimeout = setTimeout(() => {
        const retryToken = localStorage.getItem('token')
        if (retryToken) {
          fetchStats()
        }
      }, 100)
      return () => clearTimeout(retryTimeout)
    }
  }, [fetchStats])

  return {
    stats,
    dailySales,
    deliveryStatus,
    courierStats,
    loading,
    error,
    fetchStats,
  }
}
