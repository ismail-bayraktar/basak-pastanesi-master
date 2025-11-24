import { useEffect, useRef, useState, useCallback } from 'react';
import { backendUrl } from '@/App';
import { useToast } from '@/hooks/use-toast';

/**
 * useNotifications Hook
 * Manages SSE connection for real-time order notifications
 */
export function useNotifications() {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const eventSourceRef = useRef(null);
  const audioRef = useRef(null);

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        // Create audio element with notification sound
        audioRef.current = new Audio('/notification.mp3');
        audioRef.current.volume = 0.7;
      }

      audioRef.current.play().catch(error => {
        console.error('Audio play failed:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  /**
   * Handle notification message
   */
  const handleNotification = useCallback((data) => {
    const { type, title, message, order, audio } = data;

    console.log('Notification received:', { type, title, message });

    // Play audio if enabled
    if (audio) {
      playNotificationSound();
    }

    // Show toast notification
    toast({
      title: title || 'Bildirim',
      description: message,
      duration: 5000,
    });

    // Handle different notification types
    switch (type) {
      case 'NEW_ORDER':
        // Set current order and show modal
        setCurrentOrder(order);
        setShowOrderModal(true);
        break;

      case 'ORDER_STATUS_CHANGED':
        // Just show toast (already done above)
        break;

      case 'COURIER_ASSIGNED':
        // Show success toast
        toast({
          title: '✅ Kurye Atandı',
          description: `Sipariş #${order.orderNumber} kuryeye atandı`,
        });
        break;

      default:
        console.log('Unknown notification type:', type);
    }
  }, [toast, playNotificationSound]);

  /**
   * Connect to SSE stream
   * DISABLED: SSE not compatible with Vercel serverless (300s timeout limit)
   */
  const connect = useCallback(() => {
    // TODO: Implement polling-based notification system for production
    console.warn('SSE notifications disabled - incompatible with Vercel serverless');
    return;

    // eslint-disable-next-line no-unreachable
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No auth token found, cannot connect to notifications');
      return;
    }

    try {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new EventSource connection
      // EventSource doesn't support custom headers, so we pass token as query parameter
      const url = `${backendUrl}/api/notifications/stream?token=${encodeURIComponent(token)}`;
      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === 'connected' || data.type === 'ping') {
            // Connection confirmation or keep-alive
            return;
          }

          // Handle notification
          handleNotification(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setConnected(false);

        // Close and retry connection after 5 seconds
        eventSource.close();
        setTimeout(() => {
          console.log('Retrying SSE connection...');
          connect();
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error creating SSE connection:', error);
      setConnected(false);
    }
  }, [handleNotification]);

  /**
   * Disconnect from SSE stream
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnected(false);
      console.log('SSE connection closed');
    }
  }, []);

  /**
   * Close order modal
   */
  const closeOrderModal = useCallback(() => {
    setShowOrderModal(false);
    setCurrentOrder(null);
  }, []);

  /**
   * Connect on mount, disconnect on unmount
   */
  useEffect(() => {
    // Check if notifications are enabled in settings
    const notificationsEnabled = localStorage.getItem('notificationsEnabled');

    if (notificationsEnabled === 'false') {
      console.log('Notifications disabled in settings');
      return;
    }

    // Connect to SSE
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  /**
   * Reconnect when tab becomes visible again
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !connected) {
        console.log('Tab visible, reconnecting SSE...');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connected, connect]);

  return {
    connected,
    currentOrder,
    showOrderModal,
    closeOrderModal,
    connect,
    disconnect,
  };
}

export default useNotifications;
