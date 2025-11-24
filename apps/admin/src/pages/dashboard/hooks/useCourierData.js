import { useState, useCallback, useEffect } from 'react'
import { courierAPI } from '@/lib/api'

export function useCourierData() {
  const [courierData, setCourierData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCourierData = useCallback(async (silent = false) => {
    try {
      // Check if token exists before making API calls
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('useCourierData: No token available, skipping fetch')
        setLoading(false)
        return
      }

      if (!silent) setLoading(true)

      // Fetch courier dashboard data
      const response = await courierAPI.getDashboard()

      if (response.data.success) {
        const apiData = response.data.data

        // Map order statuses to delivery statuses
        const getDeliveryStatus = (orderStatus, syncStatus) => {
          if (syncStatus === 'synced' && (orderStatus === 'Kuryeye Atandı' || orderStatus === 'Yolda')) {
            return 'in_transit'
          }
          if (orderStatus === 'Hazırlanıyor') {
            return 'preparing'
          }
          if (orderStatus === 'Teslim Edildi') {
            return 'delivered'
          }
          return 'preparing'
        }

        // Transform backend data to widget format
        const transformedData = {
          // Active Deliveries: Orders that are synced with courier (status = "Kuryeye Atandı")
          activeDeliveries: apiData.recentOrders?.filter(o =>
            o.status === 'synced' && o.orderStatus === 'Kuryeye Atandı'
          ).slice(0, 5).map(o => ({
            id: o.externalId || o.id,
            orderId: o.orderNumber || `#${o.id.slice(-6)}`,
            status: getDeliveryStatus(o.orderStatus, o.status),
            estimatedTime: 'Hesaplanıyor',
            address: o.address || 'Adres bilgisi yok'
          })) || [],

          todaySummary: {
            totalDeliveries: apiData.metrics?.totalOrders || 0,
            successful: apiData.metrics?.syncedOrders || 0,
            inProgress: apiData.status?.retryQueue?.activeRetries || 0,
            failed: apiData.status?.dlqPending || 0,
          },

          // Pending Assignments: Orders not yet sent to courier (no externalId)
          pendingAssignments: apiData.recentOrders?.filter(o =>
            !o.externalId && o.orderStatus === 'Hazırlanıyor'
          ).slice(0, 2).map(o => {
            const timeAgo = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000) // minutes
            return {
              id: o.orderNumber || `#${o.id.slice(-6)}`,
              mongoId: o.id, // Add MongoDB ID for API calls
              customerName: o.customerName || 'Müşteri',
              address: o.address || 'Adres bilgisi yok',
              waitTime: `${timeAgo} dk`
            }
          }) || [],

          // Problematic Deliveries: Failed syncs from DLQ
          problematicDeliveries: [] // TODO: Implement DLQ query when needed
        }

        setCourierData(transformedData)
      }
    } catch (error) {
      console.error('Courier data fetch error:', error)
      // Fail silently for dashboard - widgets will show empty state
      setCourierData(null)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Auto-fetch on mount - retry if token becomes available
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchCourierData()
    } else {
      // Retry after a short delay in case token is being written
      const retryTimeout = setTimeout(() => {
        const retryToken = localStorage.getItem('token')
        if (retryToken) {
          fetchCourierData()
        }
      }, 100)
      return () => clearTimeout(retryTimeout)
    }
  }, [fetchCourierData])

  return {
    courierData,
    loading,
    fetchCourierData,
  }
}
