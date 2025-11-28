import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  console.log('🔍 [API Route /api/interest-points/:id] GET');
  console.log('  ID:', id);
  console.log('  API_BASE:', API_BASE);
  console.log('  API_TOKEN:', API_TOKEN ? '***' + API_TOKEN.slice(-10) : 'undefined');
  
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

    const url = `${API_BASE}/api/interest-points/${id}`;
    console.log('📡 Haciendo fetch a:', url);

    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    console.log('📥 Respuesta status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del backend:', errorText);
      return NextResponse.json(
        { error: errorText || 'Point not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Punto cargado:', data.name);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  console.log('🔍 [API Route /api/interest-points/:id] PUT');
  console.log('  ID:', id);
  
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'API URL not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('📝 Body recebido:', Object.keys(body));
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const url = `${API_BASE}/api/interest-points/${id}`;
    console.log('📡 Haciendo PUT a:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    console.log('📥 Respuesta status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del backend:', errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Punto actualizado');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  console.log('🔍 [API Route /api/interest-points/:id] DELETE');
  console.log('  ID:', id);
  
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

    const url = `${API_BASE}/api/interest-points/${id}`;
    console.log('📡 Haciendo DELETE a:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    console.log('📥 Respuesta status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del backend:', errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Punto eliminado');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
