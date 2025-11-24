import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'

/**
 * Real-time Stats Hook - SSE Connection
 * Connects to backend SSE endpoint for real-time order and stats updates
 */
export function useRealtimeStats({
  onNewOrder,
  onOrderStatusChange,
  onCourierAssigned
} = {}) {
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)
  const [connectionError, setConnectionError] = useState(null)
  const { toast } = useToast()
  const { showNotification } = useNotificationSettings()

  const eventSourceRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const baseReconnectDelay = 2000 // 2 seconds

  /**
   * Calculate exponential backoff delay for reconnection
   */
  const getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttemptsRef.current
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000) // Max 30 seconds
  }, [])

  /**
   * Connect to SSE endpoint
   * DISABLED: SSE not compatible with Vercel serverless (300s timeout limit)
   */
  const connect = useCallback(() => {
    // TODO: Implement polling-based realtime stats for production
    console.warn('SSE realtime stats disabled - incompatible with Vercel serverless')
    return

    // eslint-disable-next-line no-unreachable
    // Cleanup existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token')

      if (!token) {
        console.warn('No auth token found for SSE connection')
        setConnectionError('Authentication required')
        return
      }

      // Create SSE connection with auth header
      // Note: EventSource doesn't support custom headers directly
      // We'll append token as query parameter instead
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const sseUrl = `${apiUrl}/api/notifications/stream?token=${token}`

      const eventSource = new EventSource(sseUrl)
      eventSourceRef.current = eventSource

      // Connection opened
      eventSource.onopen = () => {
        console.log('SSE connection established')
        setConnected(true)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0 // Reset reconnect attempts
      }

      // Message received
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastEvent(data)

          // Handle different event types
          switch (data.type) {
            case 'connected':
              console.log('SSE connected:', data.message)
              break

            case 'ping':
              // Keep-alive ping, no action needed
              break

            case 'NEW_ORDER':
              console.log('New order received:', data.order)
              if (onNewOrder) {
                onNewOrder(data.order)
              }
              // Show browser notification with sound
              showNotification('Yeni Sipariş! 🎉', {
                body: data.message || 'Yeni bir sipariş alındı',
                type: 'newOrder',
                icon: '/icon-192x192.png',
              })
              // Also show toast
              toast({
                title: data.title || 'Yeni Sipariş',
                description: data.message || 'Yeni bir sipariş alındı',
                duration: 5000,
              })
              break

            case 'ORDER_STATUS_CHANGED':
              console.log('Order status changed:', data.order)
              if (onOrderStatusChange) {
                onOrderStatusChange(data.order)
              }
              // Show browser notification with sound
              showNotification('Sipariş Durumu Değişti', {
                body: data.message || 'Bir siparişin durumu güncellendi',
                type: 'statusChange',
                icon: '/icon-192x192.png',
              })
              break

            case 'COURIER_ASSIGNED':
              console.log('Courier assigned:', data.order)
              if (onCourierAssigned) {
                onCourierAssigned(data.order)
              }
              // Show browser notification with sound
              showNotification('Kurye Atandı 🚚', {
                body: data.message || 'Siparişe kurye atandı',
                type: 'courierAssigned',
                icon: '/icon-192x192.png',
              })
              break

            case 'TEST_NOTIFICATION':
              console.log('Test notification:', data.message)
              toast({
                title: data.title,
                description: data.message,
              })
              break

            default:
              console.log('Unknown SSE event type:', data.type)
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      // Connection error
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setConnected(false)

        // Close the connection
        eventSource.close()

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = getReconnectDelay()
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        } else {
          setConnectionError('Maximum reconnection attempts reached')
          toast({
            variant: 'destructive',
            title: 'Bağlantı Hatası',
            description: 'Bildirim sistemi bağlantısı kurulamadı',
          })
        }
      }
    } catch (error) {
      console.error('Error creating SSE connection:', error)
      setConnectionError(error.message)
    }
  }, [onNewOrder, onOrderStatusChange, onCourierAssigned, toast, getReconnectDelay])

  /**
   * Disconnect from SSE endpoint
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('Closing SSE connection')
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setConnected(false)
    reconnectAttemptsRef.current = 0
  }, [])

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect, disconnect])

  // Auto-connect on mount
  useEffect(() => {
    connect()

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Handle page visibility changes (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !connected) {
        console.log('Tab became visible, attempting to reconnect SSE')
        reconnect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [connected, reconnect])

  return {
    connected,
    lastEvent,
    connectionError,
    reconnect,
    disconnect,
  }
}
