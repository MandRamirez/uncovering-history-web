// src/app/api/files/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'API URL not configured' },
      { status: 500 }
    );
  }

  try {
    const params = await context.params;
    const filePath = params.path.join('/');
    const response = await fetch(`${API_BASE}/files/${filePath}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: `File not found: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the content type from the backend response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('File proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch file' },
      { status: 500 }
    );
  }
}
