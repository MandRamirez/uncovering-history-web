-- ==========================================
-- Script para convertir usuario en ADMIN
-- ==========================================

-- PASO 1: Ver todos los usuarios actuales
SELECT id, name, surname, email, role 
FROM users;

-- PASO 2: Actualizar un usuario específico a ADMIN
-- Reemplaza 'admin@uncovering.local' con el email del usuario que creaste
UPDATE users 
SET role = 'ROLE_ADMIN' 
WHERE email = 'admin@uncovering.local';

-- PASO 3: Verificar el cambio
SELECT id, name, surname, email, role 
FROM users 
WHERE email = 'admin@uncovering.local';

-- ==========================================
-- NOTAS IMPORTANTES:
-- ==========================================
-- 1. Conecta a tu base de datos PostgreSQL
-- 2. Ejecuta estos comandos en orden
-- 3. El rol 'ROLE_ADMIN' debe coincidir con el que usa tu backend
-- 4. Si el nombre de la tabla es diferente, ajusta la consulta
-- ==========================================
