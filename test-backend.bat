@echo off
echo ========================================
echo Probando conexion con el backend
echo ========================================
echo.

set API_URL=http://100.125.234.124:8082
set TOKEN=eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJ0ZXN0MkB1bmNvdmVyaW5nLmxvY2FsIiwibmFtZSI6IlRlc3QyIiwic3VybmFtZSI6IlVzZXIiLCJpYXQiOjE3NjM3Nzk1MzQsImV4cCI6MjA3OTEzOTUzNH0.8DVFwJ01qF2YOtIWTvgM-vImuqEDB5noM2R41FmaGjADELFaLNFirX_dLtvggRQW

echo Probando GET /api/types (requiere autenticacion)...
curl -H "Authorization: Bearer %TOKEN%" %API_URL%/api/types
echo.
echo.

echo Probando GET /api/interest-points (sin autenticacion)...
curl %API_URL%/api/interest-points
echo.
echo.

echo ========================================
echo Pruebas completadas
echo ========================================
pause
