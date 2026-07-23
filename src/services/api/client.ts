import { API_BASE_URL } from '../../config/env';
import { supabase } from '../supabase/client';

export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly path: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function readErrorMessage(body: string, status: number) {
  try {
    const parsed = JSON.parse(body) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) {
      return parsed.message.join(', ');
    }
    if (parsed.message) {
      return parsed.message;
    }
  } catch {}

  return body || `Request failed with status ${status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authorizedFetch(path, init);

  return response.json() as Promise<T>;
}

async function authorizedFetch(path: string, init?: RequestInit) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(
      response.status,
      readErrorMessage(body, response.status),
      path,
    );
  }

  return response;
}

async function requestBinary(
  path: string,
  init?: RequestInit,
): Promise<ArrayBuffer> {
  const response = await authorizedFetch(path, init);
  return response.arrayBuffer();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  postBinary: (path: string, body?: unknown) =>
    requestBinary(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
