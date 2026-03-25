import { NextResponse } from 'next/server';

const API_BASE = process.env.API_URL;

export async function POST(request: Request) {
  if (!API_BASE) {
    return NextResponse.json(
      { error: 'API URL not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, surname, email, password } = body;

    console.log('📝 Admin registration request:', { name, surname, email, password: '***' });

    if (!email || !password || !name || !surname) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // IMPORTANTE: Usar el endpoint público /api/auth/register
    // Este NO requiere autenticación, a diferencia de /api/users
    const registerBody = {
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      password: password,
    };

    console.log('📤 Sending to PUBLIC endpoint:', `${API_BASE}/api/auth/register`);
    console.log('📤 Body:', { ...registerBody, password: '***' });

    // Usar el endpoint PÚBLICO de registro
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerBody),
    });

    console.log('📥 Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin registration failed:', errorText);
      
      // Si el error es 409, el usuario ya existe
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: errorText || 'Registration failed', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ User registration successful:', { email: data.email });
    
    // NOTA: El usuario se crea como ROLE_USER por defecto
    // Para convertirlo en ADMIN, necesitas cambiar su rol manualmente en la base de datos
    // O usar un endpoint de backend que permita crear admins sin autenticación (desarrollo)
    
    // Retornar la respuesta del backend
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('💥 Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
