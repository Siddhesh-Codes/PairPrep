export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function getAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${cleanUrl}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedListener(listener: () => void) {
  onUnauthorized = listener;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: { error?: string; message?: string; details?: Record<string, string> } = {};
    try {
      body = await response.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      response.status,
      body.error || 'UNKNOWN_ERROR',
      body.message || `Request failed with status ${response.status}`,
      body.details
    );
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // If 401, try silent refresh once
  if (response.status === 401 && !path.includes('/auth/refresh')) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      const retryResponse = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      try {
        return await handleResponse<T>(retryResponse);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized?.();
        }
        throw err;
      }
    }
  }

  try {
    return await handleResponse<T>(response);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      onUnauthorized?.();
    }
    throw err;
  }
}

async function silentRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
