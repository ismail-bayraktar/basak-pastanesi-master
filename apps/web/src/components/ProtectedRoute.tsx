import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ViewState } from '../App';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (view: ViewState) => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onNavigate }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to home or login page
      // Since we don't have a dedicated login page yet, we might want to open a login modal
      // or redirect to a page where login is available.
      // For now, let's redirect to home and show a toast (handled in parent or context)
      onNavigate('home');
    }
  }, [isAuthenticated, isLoading, onNavigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-basak-cream">
        <Loader2 className="w-8 h-8 text-basak-orange animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

