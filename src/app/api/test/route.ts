import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://100.125.234.124:8082';

export async function GET() {
  console.log('🧪 Testing all endpoints...');

  const tests = [
    {
      name: 'GET /api/interest-points (sin auth)',
      url: `${API_BASE}/api/interest-points`,
      headers: {}
    },
    {
      name: 'GET /api/types (sin auth)',
      url: `${API_BASE}/api/types`,
      headers: {}
    },
    {
      name: 'POST /api/auth/login (test credentials)',
      url: `${API_BASE}/api/auth/login`,
      method: 'POST',
      body: { email: 'admin@example.com', password: 'test123' }
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`\n📤 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);

      const options: RequestInit = {
        method: test.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...test.headers
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);

      results.push({
        test: test.name,
        status: response.status,
        success: response.ok,
        data: typeof data === 'string' ? data.substring(0, 200) : data
      });
    } catch (error: any) {
      console.error(`   ❌ Error:`, error.message);
      results.push({
        test: test.name,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    }
  }

  return NextResponse.json({
    apiBase: API_BASE,
    results,
    summary: {
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  });
}
