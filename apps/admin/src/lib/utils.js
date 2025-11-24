import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency (Turkish Lira)
export function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format date to Turkish locale
export function formatDate(date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Format relative time (e.g., "5 dakika önce")
export function formatRelativeTime(date) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Şimdi'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  return `${diffDays} gün önce`
}

// Calculate percentage change
export function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Format percentage with sign
export function formatPercentage(value) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// Get status badge color
export function getStatusColor(status) {
  const statusMap = {
    'Siparişiniz Alındı': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Bekliyor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Hazırlanıyor': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'Kuryeye Verildi': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Kuryeye Atandı': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Siparişiniz Yola Çıktı': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'Teslim Edildi': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'İptal': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

// Get courier status color
export function getCourierStatusColor(courierStatus) {
  const statusMap = {
    'hazırlanıyor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'yolda': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'teslim edildi': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'iptal': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }
  return statusMap[courierStatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}
