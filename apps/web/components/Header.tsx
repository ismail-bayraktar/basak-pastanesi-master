
import React, { useState } from 'react';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

interface HeaderProps {
  onNavigate: (view: 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'legal' | 'account' | 'orders' | 'order-detail' | 'favorites' | 'loyalty') => void;
  onOpenCart: () => void;
  cartItemCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenCart, cartItemCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const handleNavClick = (view: 'home' | 'category' | 'about') => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    onOpenCart();
    setIsMenuOpen(false);
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      onNavigate('account');
    } else {
      setIsAuthModalOpen(true);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <button onClick={() => handleNavClick('home')} className="flex flex-col text-left">
              <span className="font-heading font-bold text-2xl text-basak-orange tracking-tight">BAŞAK</span>
              <span className="font-heading font-semibold text-xs text-gray-600 tracking-widest uppercase">Pastanesi</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <button onClick={() => handleNavClick('home')} className="text-gray-700 hover:text-basak-orange font-medium transition-colors">Ana Sayfa</button>
            <button onClick={() => handleNavClick('category')} className="text-gray-700 hover:text-basak-orange font-medium transition-colors">Pastalarımız</button>
            <button onClick={() => handleNavClick('category')} className="text-gray-700 hover:text-basak-orange font-medium transition-colors">Tatlılar</button>
            <button onClick={() => handleNavClick('about')} className="text-gray-700 hover:text-basak-orange font-medium transition-colors">Hakkımızda</button>
            
            {/* Action Group */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
              <button 
                onClick={handleAccountClick}
                className={`p-2 ${isAuthenticated ? 'text-basak-orange bg-orange-50' : 'text-gray-500 hover:text-basak-orange hover:bg-orange-50'} rounded-full transition-all flex items-center gap-2`}
                aria-label="Hesabım"
              >
                <User className="w-5 h-5" />
                {isAuthenticated && <span className="text-xs font-bold hidden lg:block">{user?.name?.split(' ')[0]}</span>}
              </button>

              <button 
                onClick={handleCartClick}
                className="inline-flex items-center justify-center px-4 py-2 border border-basak-orange text-basak-orange rounded-full hover:bg-basak-orange hover:text-white transition-colors font-semibold group"
              >
                <ShoppingBag className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Sepetim ({cartItemCount})
              </button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
             <button 
              onClick={handleAccountClick}
              className="p-2 mr-1 text-gray-600 hover:text-basak-orange rounded-full"
            >
              <User className="w-6 h-6" />
            </button>
            <button 
              onClick={handleCartClick}
              className="p-2 mr-1 text-basak-orange hover:bg-orange-50 rounded-full relative"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-basak-orange focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg h-screen">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleNavClick('home')} className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-basak-orange">Ana Sayfa</button>
            <button onClick={() => handleNavClick('category')} className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-basak-orange">Pastalarımız</button>
            <button onClick={() => handleNavClick('category')} className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-basak-orange">Tatlılar</button>
            <button onClick={() => handleNavClick('about')} className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-basak-orange">İletişim</button>
            <button onClick={handleAccountClick} className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-basak-orange border-t border-gray-100">Hesabım</button>
            <button onClick={handleCartClick} className="w-full text-left block px-3 py-4 rounded-md text-base font-bold text-basak-orange bg-orange-50 mt-2">
              Sepetim ({cartItemCount} Ürün)
            </button>
          </div>
        </div>
      )}
    </header>
    </>
  );
};

export default Header;
