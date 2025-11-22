// src/app/api/interest-points/parent/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'API URL not configured' },
      { status: 500 }
    );
  }

  try {
    const params = await context.params;
    const { id } = params;
    const response = await fetch(`${API_BASE}/api/interest-points/parent/${id}/with-depth`);

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
