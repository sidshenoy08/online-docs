'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';

export default function AuthInitializer() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    async function initializeAuth() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          clearAuth();
          return;
        }

        const data = await response.json();

        setAuth(data.user, data.accessToken);
      } catch {
        clearAuth();
      }
    }

    initializeAuth();
  }, [setAuth, clearAuth]);

  return null;
}