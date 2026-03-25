// src/lib/api-config.ts
// Configuración centralizada para comunicación con el backend

// IMPORTANTE: Las variables NEXT_PUBLIC_* solo están disponibles 
// después de que el componente se monta en el cliente

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // En el cliente, las variables de entorno están embebidas en el bundle
    return process.env.API_URL || 'http://100.125.234.124:8082';
  }
  return 'http://100.125.234.124:8082';
};

const getToken = () => {
  if (typeof window !== 'undefined') {
    return process.env.API_TOKEN || '';
  }
  return '';
};

export const API_CONFIG = {
  get baseUrl() {
    return getBaseUrl();
  },
  get token() {
    return getToken();
  },
};

export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = API_CONFIG.token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export function getApiUrl(endpoint: string): string {
  // Asegurar que el endpoint comience con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.baseUrl}${cleanEndpoint}`;
}

export function getAuthHeadersForUpload(): HeadersInit {
  const headers: HeadersInit = {};
  
  const token = API_CONFIG.token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}
