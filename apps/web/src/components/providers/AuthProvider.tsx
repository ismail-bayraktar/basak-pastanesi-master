'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadTokenFromStorage } = useAuthStore();

  useEffect(() => {
    // Load token on app initialization
    loadTokenFromStorage();
  }, [loadTokenFromStorage]);

  return <>{children}</>;
}
