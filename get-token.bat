@echo off
REM Login script to get a new JWT token
REM This token will now last 10 years (after backend restart)

echo Logging in to get a new JWT token...
echo.

curl -X POST http://100.125.234.124:8082/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@uncovering.local\",\"password\":\"Admin123!\"}"

echo.
echo.
echo Copy the token value and update NEXT_PUBLIC_API_TOKEN in .env.local
echo Then restart your Next.js dev server (npm run dev)
pause
