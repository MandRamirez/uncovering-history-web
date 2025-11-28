@echo off
echo ========================================
echo Testing Login Credentials
echo ========================================
echo.

set API_URL=http://100.125.234.124:8082

echo Testing admin@uncovering.local with admin123...
curl -X POST %API_URL%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@uncovering.local\",\"password\":\"admin123\"}"
echo.
echo.

echo Testing admin@example.com with various passwords...
curl -X POST %API_URL%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin\"}"
echo.
echo.

echo ========================================
echo Test Complete
echo ========================================
echo.
echo If you see a token in the response above, those credentials work!
echo Copy the email and password that worked.
echo.
pause
