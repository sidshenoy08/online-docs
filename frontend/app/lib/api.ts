import { useAuthStore } from '@/app/store/authStore';

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          useAuthStore.getState().clearAuth();
          return null;
        }

        const data = await response.json();

        useAuthStore.getState().setAccessToken(
          data.accessToken
        );

        return data.accessToken;
      } catch {
        useAuthStore.getState().clearAuth();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const makeRequest = (token: string | null) => {
    const headers = new Headers(options.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  const token = useAuthStore.getState().accessToken;

  let response = await makeRequest(token);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      return response;
    }

    response = await makeRequest(newToken);
  }

  return response;
}