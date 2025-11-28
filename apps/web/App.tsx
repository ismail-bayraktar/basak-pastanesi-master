
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import SpecialOrders from './components/SpecialOrders';
import Corporate from './components/Corporate';
import CategoryPage from './components/CategoryPage';
import ProductDetailPage from './components/ProductDetailPage';
import CartDrawer from './components/CartDrawer';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderSuccess from './components/OrderSuccess';
import AboutPage from './components/AboutPage';
import LegalPage from './components/LegalPage';
import AccountPage from './components/AccountPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import OrderDetailPage from './components/OrderDetailPage';
import FavoritesPage from './components/FavoritesPage';
import LoyaltyPage from './components/LoyaltyPage';

import ProtectedRoute from '@/components/ProtectedRoute';
import AuthModal from './components/AuthModal';

export type ViewState = 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites' | 'loyalty';
export type PolicyType = 'privacy' | 'cookie' | 'kvkk' | 'distance-sales' | 'refund';

export interface CartItem {
  id: number | string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  portion?: string;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType>('privacy');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuth();

  // Check for /admin redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/admin/') {
        // Use environment variable for admin URL, fallback to local port 5173
        const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173';
        window.location.href = adminUrl;
      }
    }
  }, []);

  // Shared Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 101,
      title: "Fıstıklı Çikolatalı Pasta",
      price: 650,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop",
      quantity: 1,
      portion: "6-8 Kişilik"
    }
  ]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number | string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number | string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (target: ViewState) => {
    setView(target);
    scrollToTop();
    setIsCartOpen(false);
  };

  const handlePolicyNavigate = (policy: PolicyType) => {
    setActivePolicy(policy);
    handleNavigate('legal');
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    handleNavigate('order-detail');
  };

  console.log('🎨 Rendering App, view:', view);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-basak-cream">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#2D2D2D',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF7A00',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {view !== 'success' && (
        <Header 
          onNavigate={handleNavigate} 
          onOpenCart={() => setIsCartOpen(true)}
          cartItemCount={cartItemCount}
        />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
      
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <Hero onNavigate={handleNavigate} />
            <Features />
            <FeaturedProducts onNavigate={handleNavigate} onAddToCart={addToCart} />
            <SpecialOrders />
            <Categories onNavigate={handleNavigate} />
            <Corporate />
          </>
        )}
        
        {view === 'category' && (
          <CategoryPage onNavigate={handleNavigate} onAddToCart={addToCart} />
        )}

        {view === 'product' && (
          <ProductDetailPage onNavigate={handleNavigate} onAddToCart={addToCart} />
        )}

        {view === 'cart' && (
          <CartPage 
            onNavigate={handleNavigate} 
            cartItems={cartItems} 
            onUpdateQuantity={updateQuantity} 
            onRemoveItem={removeFromCart} 
          />
        )}

        {view === 'checkout' && (
          <CheckoutPage 
            onNavigate={handleNavigate} 
            cartItems={cartItems} // Pass actual cart items for summary
          />
        )}

        {view === 'success' && (
          <OrderSuccess onNavigate={handleNavigate} />
        )}

        {view === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {view === 'legal' && (
          <LegalPage 
            onNavigate={handleNavigate} 
            policyType={activePolicy} 
            onPolicyChange={handlePolicyNavigate}
          />
        )}

        {view === 'account' && (
          <ProtectedRoute onNavigate={handleNavigate}>
            <AccountPage 
              onNavigate={handleNavigate}
              onAddToCart={addToCart}
              onOrderClick={handleOrderClick}
            />
          </ProtectedRoute>
        )}

        {view === 'orders' && (
          <ProtectedRoute onNavigate={handleNavigate}>
            <OrderHistoryPage 
              onNavigate={handleNavigate}
              onAddToCart={addToCart}
              onOrderClick={handleOrderClick}
            />
          </ProtectedRoute>
        )}

        {view === 'order-detail' && (
          <ProtectedRoute onNavigate={handleNavigate}>
            <OrderDetailPage
              onNavigate={handleNavigate}
              onAddToCart={addToCart}
              orderId={selectedOrderId}
            />
          </ProtectedRoute>
        )}

        {view === 'favorites' && (
          <ProtectedRoute onNavigate={handleNavigate}>
            <FavoritesPage
              onNavigate={handleNavigate}
              onAddToCart={addToCart}
            />
          </ProtectedRoute>
        )}

        {view === 'loyalty' && (
          <ProtectedRoute onNavigate={handleNavigate}>
            <LoyaltyPage
              onNavigate={handleNavigate}
              onAddToCart={addToCart}
            />
          </ProtectedRoute>
        )}
      </main>
      
      {/* Footer - Hide on Success page */}
      {view !== 'success' && (
        <footer className="bg-white py-12 border-t border-gray-100 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
              <div>
                <span className="font-heading font-bold text-2xl text-basak-orange block mb-4">BAŞAK</span>
                <p className="text-gray-500">Burdur'un en taze ve lezzetli pastanesi.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-4">İletişim</h4>
                <p className="text-gray-500">0248 233 30 72</p>
                <p className="text-gray-500">Burdur Merkez</p>
              </div>
              <div>
                 <h4 className="font-bold text-gray-900 mb-4">Hızlı Erişim</h4>
                 <ul className="space-y-2 text-gray-500">
                   <li><button onClick={() => handleNavigate('home')} className="hover:text-basak-orange">Ana Sayfa</button></li>
                   <li><button onClick={() => handleNavigate('category')} className="hover:text-basak-orange">Pastalar</button></li>
                   <li><button onClick={() => handleNavigate('about')} className="hover:text-basak-orange">İletişim</button></li>
                   <li><button onClick={() => handlePolicyNavigate('privacy')} className="hover:text-basak-orange">Gizlilik Politikası</button></li>
                   <li><button onClick={() => handlePolicyNavigate('cookie')} className="hover:text-basak-orange">Çerez Politikası</button></li>
                 </ul>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
              <p>© 2024 Başak Pastanesi, Burdur. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Sticky Mobile Cart Button */}
      {!isCartOpen && !['product', 'cart', 'checkout', 'success', 'about', 'legal', 'account', 'orders', 'order-detail', 'favorites', 'loyalty'].includes(view) && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-40 bg-basak-orange text-white p-4 rounded-full shadow-2xl hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          aria-label="Sepeti Aç"
        >
          <ShoppingBag className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-basak-orange text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-orange-100 shadow-sm animate-bounce">
              {cartItemCount}
            </span>
          )}
        </button>
      )}

      {/* Cart Drawer Overlay */}
      {view !== 'success' && (
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          onNavigate={handleNavigate}
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart} 
        />
      )}

    </div>
  );
};

export default App;
