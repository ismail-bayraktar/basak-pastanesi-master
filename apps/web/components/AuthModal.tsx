import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        });
      }
      onClose();
    } catch (error) {
      // Error is handled in context
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header Image */}
        <div className="h-32 bg-gradient-to-r from-basak-orange to-orange-600 relative flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <h2 className="text-3xl font-heading font-bold text-white relative z-10">
             {mode === 'login' ? 'Hoş Geldiniz' : 'Aramıza Katılın'}
           </h2>
           <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required
                    placeholder="Adınız Soyadınız"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-basak-orange focus:bg-white transition-all outline-none font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  placeholder="ornek@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-basak-orange focus:bg-white transition-all outline-none font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-basak-orange focus:bg-white transition-all outline-none font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-basak-orange focus:bg-white transition-all outline-none font-medium"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-basak-orange text-white font-bold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-orange-200 mt-6"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 font-medium">
              {mode === 'login' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-basak-orange font-bold ml-2 hover:underline"
              >
                {mode === 'login' ? 'Hemen Kayıt Olun' : 'Giriş Yapın'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

