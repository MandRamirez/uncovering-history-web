@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Obteniendo nuevo token del backend
echo ========================================
echo.

REM Hacer login y guardar la respuesta
echo Intentando login con admin@uncovering.local...
curl -s -X POST http://100.125.234.124:8082/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"hashed_password\"}" > temp_response.json

echo.
echo Respuesta del servidor:
type temp_response.json
echo.
echo.

REM Extraer el token (esto es básico, solo para Windows)
echo ========================================
echo INSTRUCCIONES MANUALES:
echo ========================================
echo.
echo 1. Copia el valor del "token" de arriba (sin comillas)
echo 2. Abre el archivo .env.local
echo 3. Actualiza esta linea:
echo    NEXT_PUBLIC_API_TOKEN=PEGA_EL_TOKEN_AQUI
echo 4. Guarda el archivo
echo 5. Reinicia el servidor: npm run dev
echo.

REM Limpiar
del temp_response.json

pause
