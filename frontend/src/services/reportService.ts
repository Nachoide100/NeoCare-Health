import { getToken } from "./authService";

const API_URL = "http://127.0.0.1:8000";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getSummary(boardId: number, week: string) {
  const res = await fetch(`${API_URL}/report/${boardId}/summary?week=${week}`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getHoursByUser(boardId: number, week: string) {
  const res = await fetch(`${API_URL}/report/${boardId}/hours-by-user?week=${week}`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getHoursByCard(boardId: number, week: string) {
  const res = await fetch(`${API_URL}/report/${boardId}/hours-by-card?week=${week}`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getHoursByCardOrdered(boardId: number, week: string, orderDesc: boolean = true) {
  const res = await fetch(`${API_URL}/report/${boardId}/hours-by-card?week=${week}&order_desc=${orderDesc}`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
