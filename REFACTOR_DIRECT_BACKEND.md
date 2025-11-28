# Solución al Error HTTP 401

## Problema
El error HTTP 401 ocurre porque el frontend intenta acceder al backend pero no está enviando correctamente el token de autenticación.

## Solución Implementada

Se ha refactorizado el código para que el frontend se comunique **directamente con el backend** en lugar de usar proxies de Next.js.

### Cambios realizados:

1. **Creado módulo de configuración** (`src/lib/api-config.ts`):
   - Centraliza la configuración del API
   - Maneja automáticamente los headers de autenticación
   - Construye las URLs del backend correctamente

2. **Actualizado** `src/app/pontos/[id]/editar/page.tsx`:
   - Usa el módulo de configuración para todas las llamadas al API
   - Agregados logs de debug para diagnóstico

## Pasos para aplicar la solución:

### 1. Verificar variables de entorno

Asegúrate de que el archivo `.env.local` contenga:

```env
NEXT_PUBLIC_API_URL=http://100.125.234.124:8082
NEXT_PUBLIC_API_TOKEN=eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJ0ZXN0MkB1bmNvdmVyaW5nLmxvY2FsIiwibmFtZSI6IlRlc3QyIiwic3VybmFtZSI6IlVzZXIiLCJpYXQiOjE3NjM3Nzk1MzQsImV4cCI6MjA3OTEzOTUzNH0.8DVFwJ01qF2YOtIWTvgM-vImuqEDB5noM2R41FmaGjADELFaLNFirX_dLtvggRQW
```

### 2. Reiniciar el servidor de desarrollo

**IMPORTANTE**: Next.js solo carga las variables de entorno al iniciar. Debes reiniciar completamente el servidor:

```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev
```

### 3. Verificar en la consola del navegador

Cuando entres a la página de edición, deberías ver en la consola del navegador:

```
🔍 Carregando tipos de: http://100.125.234.124:8082/api/types
🔑 Headers: {Content-Type: 'application/json', Authorization: 'Bearer eyJ...'}
✅ Tipos carregados: X
```

Si ves `Authorization: 'Bearer eyJ...'`, significa que el token se está cargando correctamente.

## Diagnóstico de problemas

### Si el token no aparece en los headers:

1. Verifica que el archivo `.env.local` esté en la raíz del proyecto
2. Verifica que las variables comiencen con `NEXT_PUBLIC_`
3. Asegúrate de haber reiniciado el servidor después de modificar `.env.local`

### Si sigue mostrando error 401:

1. Verifica que el token no haya expirado
2. Verifica que el backend esté corriendo en `http://100.125.234.124:8082`
3. Prueba la autenticación directamente con curl:

```bash
curl -H "Authorization: Bearer TU_TOKEN" http://100.125.234.124:8082/api/types
```

## Archivos modificados:

- ✅ `src/lib/api-config.ts` (nuevo)
- ✅ `src/app/pontos/[id]/editar/page.tsx` (actualizado)

## Próximos pasos:

Si esta solución funciona correctamente, se deben actualizar las otras páginas que también usan los proxies:

- `src/app/pontos/novo/page.tsx`
- `src/app/pontos/[id]/page.tsx`
- `src/app/mapa/page.tsx`
- `src/app/dashboard/page.tsx`

Y considerar eliminar los proxies de Next.js en `src/app/api/*` si ya no son necesarios.
