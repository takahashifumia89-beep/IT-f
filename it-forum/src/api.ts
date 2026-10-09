import type { AllData } from './types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function req<T = any>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error || `Сервер қатесі (${res.status})`, res.status);
  return data as T;
}

/** Деректер өзгергенде App-ты қайта жүктеуге мәжбүрлейді */
export const notifyChange = () => window.dispatchEvent(new Event('data-changed'));

export const api = {
  getAll: () => req<AllData>('GET', '/api/data'),

  // ---- Админ (cookie-сессия қажет) ----
  login: (password: string) => req('POST', '/api/admin/login', { password }),
  logout: () => req('POST', '/api/admin/logout', {}),
  me: () => req('GET', '/api/admin/me'),
  create: async (table: string, data: object) => {
    const r = await req('POST', `/api/admin/${table}`, data);
    notifyChange();
    return r;
  },
  update: async (table: string, id: number, data: object) => {
    const r = await req('PUT', `/api/admin/${table}/${id}`, data);
    notifyChange();
    return r;
  },
  remove: async (table: string, id: number) => {
    const r = await req('DELETE', `/api/admin/${table}/${id}`);
    notifyChange();
    return r;
  },

  // ---- Форум (ашық) ----
  createPost: async (data: { author: string; title: string; content: string }) => {
    const r = await req('POST', '/api/forum/posts', data);
    notifyChange();
    return r;
  },
  addReply: async (postId: number, data: { author?: string; content: string }) => {
    const r = await req('POST', `/api/forum/posts/${postId}/replies`, data);
    notifyChange();
    return r;
  },
  like: async (postId: number) => {
    const r = await req('POST', `/api/forum/posts/${postId}/like`, {});
    notifyChange();
    return r;
  },
};
