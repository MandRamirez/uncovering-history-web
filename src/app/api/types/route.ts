// src/app/api/types/route.ts
import { NextResponse } from 'next/server';

// IMPORTANTE: En API Routes (server-side), las variables NEXT_PUBLIC_* 
// SÍ están disponibles, pero también podemos usar variables sin el prefijo
const API_BASE = process.env.API_URL;
const API_TOKEN = process.env.API_TOKEN;

export async function GET() {
  // Debug logs para ver qué está pasando
  console.log('🔍 [API Route /api/types]');
  console.log('  API_BASE:', API_BASE);
  console.log('  API_TOKEN:', API_TOKEN ? '***' + API_TOKEN.slice(-10) : 'undefined');

  if (!API_BASE) {
    console.error('❌ API_BASE no está configurado');
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
    } else {
      console.warn('⚠️ No se encontró API_TOKEN');
    }

    console.log('📡 Haciendo fetch a:', `${API_BASE}/api/types`);
    console.log('📋 Headers:', headers);

    const response = await fetch(`${API_BASE}/api/types`, {
      headers,
      cache: 'no-store', // Evitar cache
    });

    console.log('📥 Respuesta status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Error del backend:', text);
      return NextResponse.json(
        { error: text || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Datos recibidos:', data.length, 'tipos');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}
