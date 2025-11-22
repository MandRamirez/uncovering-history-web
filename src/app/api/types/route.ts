// src/app/api/types/route.ts
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function GET() {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'API URL not configured' },
      { status: 500 }
    );
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const response = await fetch(`${API_BASE}/api/types`, {
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}
