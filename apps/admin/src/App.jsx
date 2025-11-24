import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Orders from './pages/orders/Orders'
import ProductAdd from './pages/products/ProductAdd'
import ProductList from './pages/products/ProductList'
import Categories from './pages/products/Categories'
import CourierSettings from './pages/courier/CourierSettings'
import CourierPerformance from './pages/courier/CourierPerformance'
import SliderManagement from './pages/slider/SliderManagement'
import MediaLibrary from './pages/media/MediaLibrary'
import GeneralSettings from './pages/settings/GeneralSettings'
import Reports from './pages/reports/Reports'
import Customers from './pages/customers/Customers'
import Coupons from './pages/coupons/Coupons'
import DeliveryZones from './pages/delivery/DeliveryZones'
import TimeSlots from './pages/delivery/TimeSlots'
import EmailSettings from './pages/email/EmailSettings'
import EmailLogs from './pages/email/EmailLogs'
import { useNotifications } from './hooks/useNotifications'
import { OrderActionModal } from './components/OrderActionModal'
import { useToast } from './hooks/use-toast'

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const { toast } = useToast()

  // Initialize notification system only when logged in
  const { connected, currentOrder, showOrderModal, closeOrderModal } = useNotifications()

  // Wrapper to ensure localStorage is always updated before state
  // This prevents race conditions where API calls read from localStorage
  // before useEffect has a chance to update it
  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
    setToken(newToken)
  }

  /**
   * Handle courier assignment for new orders
   */
  const handleCourierAssign = async (orderId) => {
    try {
      const response = await fetch(`${backendUrl}/api/order/send-to-courier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Kurye atama başarısız')
      }

      toast({
        title: 'Başarılı',
        description: 'Sipariş başarıyla kuryeye atandı',
      })
    } catch (error) {
      console.error('Courier assignment error:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen">
      {token === '' ? (
        <Login setToken={updateToken} />
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/add" element={<ProductAdd />} />
            <Route path="/list" element={<ProductList />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/courier-settings" element={<CourierSettings />} />
            <Route path="/courier-performance" element={<CourierPerformance />} />
            <Route path="/slider" element={<SliderManagement />} />
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/settings" element={<GeneralSettings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/delivery-zones" element={<DeliveryZones />} />
            <Route path="/time-slots" element={<TimeSlots />} />
            <Route path="/email/settings" element={<EmailSettings />} />
            <Route path="/email/logs" element={<EmailLogs />} />
            {/* Legacy route redirect */}
            <Route path="/email-settings" element={<Navigate to="/email/settings" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Order notification modal - global across all pages */}
          <OrderActionModal
            order={currentOrder}
            open={showOrderModal}
            onClose={closeOrderModal}
            onCourierAssign={handleCourierAssign}
          />
        </>
      )}
    </div>
  )
}

export default App
