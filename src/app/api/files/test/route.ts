// Test route to verify files proxy works
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  return NextResponse.json({ 
    message: 'Files proxy is working',
    apiBase: API_BASE,
    testUrl: `${API_BASE}/files/691d1643c297620d80b8c48f/c87ef13b-a1e4-4f49-93a8-0a469a9fdb5b.jpg`
  });
}
