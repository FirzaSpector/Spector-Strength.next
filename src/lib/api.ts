// ─── Auth Token Helpers ──────────────────────────────────────────────────────

const TOKEN_KEY = 'ss_access_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ─── API Base ────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:8000';

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  bodyweight: number | null;
  age_category: string | null;
  division: string | null;
}

export interface ProfileUpdate {
  name: string;
  bodyweight: number | null;
  age_category: string | null;
  division: string | null;
}

export interface LiftLogCreate {
  lift_type: 'squat' | 'bench' | 'deadlift';
  weight: number;
  reps: number;
  rpe: number | null;
}

export interface LiftLogResponse {
  id: string;
  lift_type: string;
  weight: number;
  reps: number;
  rpe: number | null;
  e1rm: number;
  created_at: string;
}

export interface MeetCreate {
  meet_name: string;
  date: string; // ISO string
  federation: string | null;
}

export interface MeetResponse {
  id: string;
  meet_name: string;
  date: string;
  federation: string | null;
  created_at: string;
}

export interface AttemptCreate {
  lift_type: 'squat' | 'bench' | 'deadlift';
  attempt_number: 1 | 2 | 3;
  weight: number;
  status: 'planned' | 'good_lift' | 'no_lift';
}

export interface AttemptResponse {
  id: string;
  meet_id: string;
  lift_type: string;
  attempt_number: number;
  weight: number;
  status: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<TokenResponse>(res);
}

export async function apiRegister(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  await handleResponse<unknown>(res);
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function apiGetProfile(): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/profile`, { headers: authHeaders() });
  return handleResponse<ProfileResponse>(res);
}

export async function apiUpdateProfile(data: ProfileUpdate): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ProfileResponse>(res);
}

// ─── Lifts ───────────────────────────────────────────────────────────────────

export async function apiCreateLift(data: LiftLogCreate): Promise<LiftLogResponse> {
  const res = await fetch(`${API_BASE}/lifts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<LiftLogResponse>(res);
}

export async function apiGetLifts(): Promise<LiftLogResponse[]> {
  const res = await fetch(`${API_BASE}/lifts`, { headers: authHeaders() });
  return handleResponse<LiftLogResponse[]>(res);
}

// ─── Meets ───────────────────────────────────────────────────────────────────

export async function apiCreateMeet(data: MeetCreate): Promise<MeetResponse> {
  const res = await fetch(`${API_BASE}/meets`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<MeetResponse>(res);
}

export async function apiGetMeets(): Promise<MeetResponse[]> {
  const res = await fetch(`${API_BASE}/meets`, { headers: authHeaders() });
  return handleResponse<MeetResponse[]>(res);
}

export async function apiCreateAttempt(
  meetId: string,
  data: AttemptCreate,
): Promise<AttemptResponse> {
  const res = await fetch(`${API_BASE}/meets/${meetId}/attempts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<AttemptResponse>(res);
}

export async function apiGetAttempts(meetId: string): Promise<AttemptResponse[]> {
  const res = await fetch(`${API_BASE}/meets/${meetId}/attempts`, {
    headers: authHeaders(),
  });
  return handleResponse<AttemptResponse[]>(res);
}
