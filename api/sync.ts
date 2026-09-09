// Vercel Serverless Function for Cloud Sync
import type { IncomingMessage, ServerResponse } from 'http';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

interface ExtendedRequest extends IncomingMessage {
  query?: Record<string, string>;
  body?: any;
  method?: string;
  url?: string;
}

// Global serverless cache
const globalSyncStore: Record<string, { data: any; updatedAt: number }> = {};

export default async function handler(req: ExtendedRequest, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  // Extract key from URL or query
  const parts = url.split('/');
  const key = parts[parts.length - 1]?.split('?')[0] || req.query?.key;

  if (!key || key === 'sync') {
    return res.status(400).json({ error: 'Missing sync key' });
  }

  if (req.method === 'GET') {
    const entry = globalSyncStore[key];
    if (!entry) {
      return res.status(404).json({ error: 'No data found for this key' });
    }
    return res.status(200).json({ success: true, key, data: entry.data, updatedAt: entry.updatedAt });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // ignore
      }
    }
    const data = body?.data;
    const updatedAt = body?.timestamp || Date.now();
    if (!data) {
      return res.status(400).json({ error: 'Missing data payload' });
    }
    globalSyncStore[key] = { data, updatedAt };
    return res.status(200).json({ success: true, key, updatedAt });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
