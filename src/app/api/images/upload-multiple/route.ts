// src/app/api/images/upload-multiple/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function POST(request: NextRequest) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'API URL not configured' },
      { status: 500 }
    );
  }

  try {
    // Get the FormData from the request
    const formData = await request.formData();

    // Create headers (don't set Content-Type for multipart/form-data)
    const headers: HeadersInit = {};

    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    // Forward the FormData to the backend
    const response = await fetch(`${API_BASE}/api/images/upload-multiple`, {
      method: 'POST',
      headers,
      body: formData,
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
    console.error('Image upload proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    );
  }
}
