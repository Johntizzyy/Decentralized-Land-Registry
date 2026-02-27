// In development, Vite proxies /api to the backend. In production (e.g. Vercel), use env var.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function createParcel(data) {
  const res = await fetch(`${API_BASE}/parcels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit parcel');
  }
  return res.json();
}

export async function getParcels(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/parcels${q ? `?${q}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch parcels');
  return res.json();
}

export async function getParcel(id) {
  const res = await fetch(`${API_BASE}/parcels/${id}`);
  if (!res.ok) throw new Error('Failed to fetch parcel');
  return res.json();
}

export async function approveParcel(id) {
  const res = await fetch(`${API_BASE}/parcels/${id}/approve`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to approve');
  }
  return res.json();
}

export async function deleteParcel(id) {
  const res = await fetch(`${API_BASE}/parcels/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete');
  }
  return res.json();
}

export async function verifyLand(landIdOrHash, byHash = false) {
  const param = byHash ? 'hash' : 'landId';
  const res = await fetch(`${API_BASE}/verify?${param}=${encodeURIComponent(landIdOrHash)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Verification failed');
  }
  return res.json();
}
