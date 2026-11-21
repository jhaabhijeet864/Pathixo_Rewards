import type { AdCreative, ImpressionEvent, RemoteSelectorConfig } from '@pathixo/shared';

const API_BASE = (typeof process !== 'undefined' && process.env?.PATHIXO_API_URL)
  ? process.env.PATHIXO_API_URL
  : 'http://localhost:3000/api';

export async function fetchAdBundle(deviceId: string): Promise<AdCreative[]> {
  try {
    const res = await fetch(`${API_BASE}/ads/bundle?device_id=${encodeURIComponent(deviceId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.ads || [];
  } catch (err) {
    console.debug('[Pathixo Rewards] API fetchAdBundle offline fallback:', err);
    return [];
  }
}

export async function sendImpressionEvents(events: ImpressionEvent[]): Promise<boolean> {
  if (events.length === 0) return true;
  try {
    const res = await fetch(`${API_BASE}/events/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
    return res.ok;
  } catch (err) {
    console.debug('[Pathixo Rewards] API sendEvents queued offline:', err);
    return false;
  }
}

export async function fetchRemoteSelectors(): Promise<RemoteSelectorConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/config/selectors`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
