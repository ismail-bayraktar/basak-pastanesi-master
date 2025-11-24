import { useState, useEffect, useCallback } from 'react'

const NOTIFICATION_SOUNDS = [
  { id: 'default', name: 'Varsayılan', file: '/sounds/notification-default.mp3' },
  { id: 'bell', name: 'Zil', file: '/sounds/notification-bell.mp3' },
  { id: 'chime', name: 'Melodi', file: '/sounds/notification-chime.mp3' },
  { id: 'ping', name: 'Ping', file: '/sounds/notification-ping.mp3' },
  { id: 'none', name: 'Sessiz', file: null },
]

const NOTIFICATION_TYPES = [
  { id: 'newOrder', name: 'Yeni Sipariş', description: 'Yeni sipariş geldiğinde bildirim al' },
  { id: 'statusChange', name: 'Durum Değişikliği', description: 'Sipariş durumu değiştiğinde bildirim al' },
  { id: 'courierAssigned', name: 'Kurye Ataması', description: 'Siparişe kurye atandığında bildirim al' },
  { id: 'lowStock', name: 'Düşük Stok', description: 'Ürün stoğu azaldığında bildirim al' },
]

const STORAGE_KEY = 'tulumbak_notification_settings'

export function useNotificationSettings() {
  const [permission, setPermission] = useState('default')
  const [settings, setSettings] = useState({
    enabled: false,
    sound: 'default',
    enabledTypes: ['newOrder', 'statusChange', 'courierAssigned'],
  })
  const [audioContext, setAudioContext] = useState(null)

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings(parsed)
      } catch (error) {
        console.error('Failed to parse notification settings:', error)
      }
    }

    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Bu tarayıcı bildirimleri desteklemiyor')
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        saveSettings({ ...settings, enabled: true })
        return true
      } else {
        saveSettings({ ...settings, enabled: false })
        return false
      }
    } catch (error) {
      console.error('Notification permission request failed:', error)
      throw error
    }
  }, [settings, saveSettings])

  // Play notification sound
  const playSound = useCallback((soundId = settings.sound) => {
    const sound = NOTIFICATION_SOUNDS.find(s => s.id === soundId)
    if (!sound || !sound.file || soundId === 'none') return

    try {
      // Web Audio API ile basit bildirim sesi oluştur
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Ses tipine göre frekans ayarla
      const frequencies = {
        'default': [800, 1000], // İki tonlu
        'bell': [1200, 800, 600], // Zil sesi
        'chime': [523, 659, 784], // C-E-G akordu
        'ping': [1000] // Tek ton
      }

      const freq = frequencies[soundId] || [800]

      oscillator.type = 'sine'
      oscillator.frequency.value = freq[0]

      // Ses seviyesi ayarla
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)

      // Çok tonlu sesler için
      if (freq.length > 1) {
        freq.slice(1).forEach((f, i) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator()
            const gain = audioContext.createGain()
            osc.connect(gain)
            gain.connect(audioContext.destination)
            osc.type = 'sine'
            osc.frequency.value = f
            gain.gain.setValueAtTime(0.3, audioContext.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
            osc.start(audioContext.currentTime)
            osc.stop(audioContext.currentTime + 0.3)
          }, (i + 1) * 200)
        })
      }
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }, [settings.sound])

  // Show notification
  const showNotification = useCallback((title, options = {}) => {
    if (!settings.enabled || permission !== 'granted') return

    const notificationType = options.type || 'newOrder'

    // Check if this notification type is enabled
    if (!settings.enabledTypes.includes(notificationType)) return

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      })

      // Play sound if enabled
      if (settings.sound !== 'none') {
        playSound()
      }

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000)

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }, [settings, permission, playSound])

  // Toggle notification type
  const toggleNotificationType = useCallback((typeId) => {
    const newEnabledTypes = settings.enabledTypes.includes(typeId)
      ? settings.enabledTypes.filter(id => id !== typeId)
      : [...settings.enabledTypes, typeId]

    saveSettings({ ...settings, enabledTypes: newEnabledTypes })
  }, [settings, saveSettings])

  // Change sound
  const changeSound = useCallback((soundId) => {
    saveSettings({ ...settings, sound: soundId })
    // Play preview
    playSound(soundId)
  }, [settings, saveSettings, playSound])

  // Toggle notifications on/off
  const toggleNotifications = useCallback(async (enabled) => {
    if (enabled && permission !== 'granted') {
      // Need to request permission first
      const granted = await requestPermission()
      return granted
    } else {
      saveSettings({ ...settings, enabled })
      return true
    }
  }, [permission, settings, saveSettings, requestPermission])

  return {
    // State
    permission,
    settings,
    sounds: NOTIFICATION_SOUNDS,
    types: NOTIFICATION_TYPES,

    // Actions
    requestPermission,
    toggleNotifications,
    toggleNotificationType,
    changeSound,
    playSound,
    showNotification,

    // Computed
    isEnabled: settings.enabled && permission === 'granted',
    canEnable: 'Notification' in window,
  }
}
