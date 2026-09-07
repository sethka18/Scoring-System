/**
 * Cloud Sync Utility for Multi-Device Synchronization
 * Supports both local backend (/api/sync) and resilient cloud storage fallback.
 * Allows teachers to seamlessly sync data across laptops, tablets, and phones on Vercel.
 */
import QRCode from 'qrcode';

export interface SyncPayload {
  version: number;
  updatedAt: number;
  schoolProfile: any;
  classes: any[];
  students: any[];
  scores: any[];
  monthlyExams: any[];
  annualRankings: any[];
  attendanceRecords: any[];
  homeworkAssignments: any[];
  fluencyTests: any[];
  timetableSlots: any[];
  curriculumPrograms: any[];
  questionBank: any[];
  examPapers: any[];
}

export interface SyncStatusInfo {
  state: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  lastSyncedAt: number | null;
  syncKey: string;
  errorMessage?: string;
}

const SYNC_KEY_STORAGE = 'gradebook_cloud_sync_key';
const SYNC_AUTO_STORAGE = 'gradebook_auto_sync_enabled';
const SYNC_FALLBACK_URL = 'https://api.restful-api.dev/objects';

// Generate a random clean human-friendly sync key
export function generateRandomSyncKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SCH-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get or initialize the active sync key
export function getSavedSyncKey(): string {
  try {
    const saved = localStorage.getItem(SYNC_KEY_STORAGE);
    if (saved && saved.trim()) {
      return saved.trim().toUpperCase();
    }
    const newKey = generateRandomSyncKey();
    localStorage.setItem(SYNC_KEY_STORAGE, newKey);
    return newKey;
  } catch (e) {
    return 'SCH-PRIMARY';
  }
}

export function saveSyncKey(key: string): void {
  const cleanKey = key.trim().toUpperCase();
  localStorage.setItem(SYNC_KEY_STORAGE, cleanKey);
}

export function isAutoSyncEnabled(): boolean {
  try {
    const val = localStorage.getItem(SYNC_AUTO_STORAGE);
    return val !== 'false'; // Default to true
  } catch (e) {
    return true;
  }
}

export function setAutoSyncEnabled(enabled: boolean): void {
  localStorage.setItem(SYNC_AUTO_STORAGE, enabled ? 'true' : 'false');
}

/**
 * Generate pairing URL with sync key embedded
 */
export function getPairingUrl(syncKey: string): string {
  const origin = window.location.origin;
  const path = window.location.pathname;
  return `${origin}${path}?syncKey=${encodeURIComponent(syncKey)}`;
}

/**
 * Generate QR code data URL for instant mobile phone pairing
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1e1b4b', // Indigo 950
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

/**
 * Map sync key to a persistent cloud object identifier for restful-api fallback
 */
function getCloudObjectIdKey(syncKey: string): string {
  return `gradebook_cloud_obj_${syncKey}`;
}

/**
 * Push data to Cloud (tries local API first, then falls back to public KV store)
 */
export async function pushDataToCloud(syncKey: string, payload: SyncPayload): Promise<{ success: boolean; updatedAt: number }> {
  const cleanKey = syncKey.trim().toUpperCase();
  const timestamp = payload.updatedAt || Date.now();
  payload.updatedAt = timestamp;

  // 1. Try local /api/sync endpoint
  try {
    const res = await fetch(`/api/sync/${cleanKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload, timestamp })
    });
    if (res.ok) {
      return { success: true, updatedAt: timestamp };
    }
  } catch (e) {
    // API endpoint unreachable, fallback to cloud storage
  }

  // 2. Fallback to resilient cloud store
  try {
    const localObjId = localStorage.getItem(getCloudObjectIdKey(cleanKey));
    if (localObjId) {
      // Try updating existing object
      const updateRes = await fetch(`${SYNC_FALLBACK_URL}/${localObjId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `gradebook_${cleanKey}`,
          data: payload
        })
      });
      if (updateRes.ok) {
        return { success: true, updatedAt: timestamp };
      }
    }

    // Otherwise create new cloud object
    const createRes = await fetch(SYNC_FALLBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `gradebook_${cleanKey}`,
        data: payload
      })
    });
    if (createRes.ok) {
      const result = await createRes.json();
      if (result && result.id) {
        localStorage.setItem(getCloudObjectIdKey(cleanKey), result.id);
      }
      return { success: true, updatedAt: timestamp };
    }
  } catch (err) {
    console.error('Cloud push failed:', err);
    throw new Error('ពុំអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីន Cloud បានទេ សូមពិនិត្យមើលអ៊ីនធឺណិតរបស់អ្នក');
  }

  return { success: false, updatedAt: timestamp };
}

/**
 * Pull latest data from Cloud
 */
export async function pullDataFromCloud(syncKey: string): Promise<{ success: boolean; data?: SyncPayload; updatedAt?: number }> {
  const cleanKey = syncKey.trim().toUpperCase();

  // 1. Try local /api/sync endpoint
  try {
    const res = await fetch(`/api/sync/${cleanKey}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return { success: true, data: json.data, updatedAt: json.updatedAt };
      }
    }
  } catch (e) {
    // Fallback to cloud store
  }

  // 2. Fallback to resilient cloud store
  try {
    const localObjId = localStorage.getItem(getCloudObjectIdKey(cleanKey));
    if (localObjId) {
      const getRes = await fetch(`${SYNC_FALLBACK_URL}/${localObjId}`);
      if (getRes.ok) {
        const json = await getRes.json();
        if (json && json.data) {
          return { success: true, data: json.data, updatedAt: json.data.updatedAt || json.updatedAt };
        }
      }
    }
  } catch (err) {
    console.error('Cloud pull failed:', err);
  }

  return { success: false };
}
