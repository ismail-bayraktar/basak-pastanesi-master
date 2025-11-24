/**
 * Browser Notification Manager
 * Handles browser notifications for admin panel
 */

class NotificationManager {
  constructor() {
    this.permission = 'default'
    this.checkPermission()
  }

  /**
   * Check current notification permission
   */
  checkPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }
    this.permission = Notification.permission
    return this.permission === 'granted'
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  /**
   * Send a notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  async sendNotification(title, options = {}) {
    // Check if we have permission
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        console.warn('Notification permission denied')
        return null
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      return null
    }
  }

  /**
   * Send new order notification
   */
  newOrderNotification(orderData) {
    const customerName = `${orderData.address?.firstName || ''} ${orderData.address?.lastName || ''}`.trim()
    const amount = orderData.amount?.toFixed(2) || '0.00'

    return this.sendNotification('Yeni Sipariş!', {
      body: `${customerName || 'Müşteri'} - ₺${amount}`,
      tag: 'new-order',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    })
  }

  /**
   * Send order status change notification
   */
  statusChangeNotification(orderData, newStatus) {
    const orderId = orderData._id?.slice(-8) || 'N/A'

    return this.sendNotification('Sipariş Durumu Güncellendi', {
      body: `Sipariş #${orderId}: ${newStatus}`,
      tag: `order-${orderData._id}`,
    })
  }

  /**
   * Play notification sound
   */
  playSound() {
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(err => console.warn('Could not play sound:', err))
    } catch (error) {
      console.warn('Sound not available')
    }
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager()

// Helper functions
export const requestNotificationPermission = () => notificationManager.requestPermission()
export const sendNewOrderNotification = (orderData) => {
  notificationManager.playSound()
  return notificationManager.newOrderNotification(orderData)
}
export const sendStatusChangeNotification = (orderData, newStatus) =>
  notificationManager.statusChangeNotification(orderData, newStatus)
