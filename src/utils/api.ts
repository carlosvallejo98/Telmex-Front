// src/utils/api.ts

// ✅ API_BASE robusto sin usar import.meta (evita errores en CRA y TS)
const API_BASE: string =
  (process.env.REACT_APP_API_URL as string) ||
  // opcional: inyectable desde index.html si quieres (no requerido)
  ((typeof window !== 'undefined' && (window as any).__API_BASE__) as string) ||
  // fallback local (ajusta si tu backend corre en otro host/puerto)
  'http://localhost:5001';

/** ===== Helpers de auth/usuario en localStorage ===== */
export type UserDTO = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

const TOKEN_KEY = 'token';
const USER_KEY = 'user';         // clave canónica que ya estás leyendo en el front
const USER_FALLBACK = 'profile'; // compat por si en algún lado quedó 'profile'

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser(): UserDTO | null {
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      localStorage.getItem(USER_FALLBACK) ||
      '';
    return raw ? (JSON.parse(raw) as UserDTO) : null;
  } catch {
    return null;
  }
}

function setStoredUser(u: UserDTO | null) {
  if (!u) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(u));
  // Mantén sincronizado el fallback si existía
  if (localStorage.getItem(USER_FALLBACK)) {
    localStorage.setItem(USER_FALLBACK, JSON.stringify(u));
  }
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const t = getToken();
  const headers: Record<string, string> = { ...extra };
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return headers;
}

async function handleResponse(res: Response): Promise<any> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText || 'Error en la petición';
    throw new Error(msg);
  }
  return data;
}

/* ===== AUTH ===== */
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse(res);
  // Guarda token
  if (data?.token) localStorage.setItem(TOKEN_KEY, data.token);
  // Guarda perfil para que Header/ReportView puedan leer name/avatar
  if (data?.user) {
    const u = data.user as { id?: string; _id?: string; name: string; email: string; avatarUrl?: string };
    setStoredUser({
      id: u.id || u._id || '',
      _id: u._id || u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl
    });
  }
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ===== USER / AVATAR ===== */
export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  const res = await fetch(`${API_BASE}/api/user/avatar`, {
    method: 'POST',
    headers: authHeaders(), // NO pongas Content-Type manual para FormData
    body: form
  });
  const data = await handleResponse(res);
  // Actualiza el user guardado con el nuevo avatarUrl
  if (data?.user) {
    const prev = getStoredUser();
    const u = data.user as { id?: string; _id?: string; name?: string; email?: string; avatarUrl?: string };
    setStoredUser({
      id: u.id || u._id || prev?.id || prev?._id || '',
      _id: u._id || u.id || prev?._id,
      name: u.name || prev?.name || '',
      email: u.email || prev?.email || '',
      avatarUrl: u.avatarUrl || prev?.avatarUrl
    });
  }
  return data;
}

/* ===== TICKETS ===== */
export type TicketDTO = {
  _id: string;
  title: string;
  description: string;
  priority: 'normal' | 'urgent';
  // ✅ incluye todos los estados que puede devolver tu backend
  status: 'open' | 'closed' | 'in_progress' | 'reported';
  createdAt?: string;
  closedAt?: string;
};

export async function createTicket(input: { title: string; description?: string; priority: 'normal' | 'urgent' }) {
  const res = await fetch(`${API_BASE}/api/tickets`, {
    method: 'POST',
    headers: { ...authHeaders({ 'Content-Type': 'application/json' }) },
    body: JSON.stringify(input)
  });
  return handleResponse(res) as Promise<TicketDTO>;
}

export async function listOpenTickets(): Promise<TicketDTO[]> {
  const res = await fetch(`${API_BASE}/api/tickets?status=open`, {
    headers: authHeaders()
  });
  const data = await handleResponse(res);
  // ✅ el backend responde { items: [...] }
  const items = (data && (data.items as TicketDTO[])) || [];
  return Array.isArray(items) ? items : [];
}

/* ===== REPORTS ===== */
export type ReportDTO = {
  _id: string;
  ticketId: { _id: string; title: string; priority: 'normal'|'urgent'; status: 'open'|'closed'|'in_progress'|'reported'; createdAt?: string; };
  reporterId: { _id: string; name: string; email: string; avatarUrl?: string; };
  content: string;
  excelPath?: string;
  createdAt?: string;
};

export async function sendReport(ticketId: string, content: string, files?: File[]) {
  const form = new FormData();
  form.append('content', content);
  (files || []).forEach((f) => form.append('attachments', f));
  const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/report`, {
    method: 'POST',
    headers: authHeaders(),
    body: form
  });
  return handleResponse(res);
}

export async function listMyReports(): Promise<ReportDTO[]> {
  const res = await fetch(`${API_BASE}/api/reports?mine=true`, {
    headers: authHeaders()
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? (data as ReportDTO[]) : [];
}
