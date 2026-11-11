
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const router = useRouter();

    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    const isLoading = useAuthStore(
        (state) => state.isLoading
    );

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/');
        }
    }, [isLoading, isAuthenticated, router]);

    // Wait for AuthInitializer to finish
    if (isLoading) {
        return <div>Checking authentication...</div>;
    }

    // Don't render protected content for unauthenticated users
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}