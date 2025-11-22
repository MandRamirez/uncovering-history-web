import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

    console.log('📝 Register request body:', { name, surname, email, password: '***' });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!name || !surname) {
      return NextResponse.json(
        { error: 'Name and surname are required' },
        { status: 400 }
      );
    }

    // Preparar el body exactamente como lo espera el backend
    const registerBody = {
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      password: password
    };

    console.log('📤 Sending to backend:', `${API_BASE}/api/auth/register`);
    console.log('📤 Body:', { ...registerBody, password: '***' });

    // Llamar al endpoint de registro del backend
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
      console.error('❌ Registration failed:', errorText);
      
      // Intentar parsear el error como JSON
      let errorMessage = 'Registration failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch {
        errorMessage = errorText;
      }
      
      // Si el email ya existe
      if (response.status === 409 || errorMessage.includes('already exists') || errorMessage.includes('já existe')) {
        return NextResponse.json(
          { error: 'Email already exists', details: errorMessage },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Registration successful:', { email: data.email, hasToken: !!data.token });
    
    // Retornar la respuesta del backend (email + token)
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('💥 Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
