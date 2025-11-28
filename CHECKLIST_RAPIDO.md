# ✅ Checklist de Diagnóstico - Error 401 en Proxies

## 🚨 ACCIÓN INMEDIATA

### 1. REINICIAR EL SERVIDOR ⚡ (ESTO RESUELVE EL 90% DE LOS CASOS)

```bash
# En la terminal del servidor:
Ctrl+C

# Espera a que se detenga completamente, luego:
npm run dev
```

**¿Por qué?** Next.js solo carga las variables de entorno al iniciar. Si modificaste `.env.local` después de iniciar el servidor, necesitas reiniciarlo.

---

## 📋 Verificaciones en Orden

### ✅ 1. Verificar `.env.local`
- [ ] El archivo existe en la raíz del proyecto
- [ ] Contiene `NEXT_PUBLIC_API_URL=http://100.125.234.124:8082`
- [ ] Contiene `NEXT_PUBLIC_API_TOKEN=eyJ...`
- [ ] No hay espacios extra ni comillas

### ✅ 2. Verificar que el servidor se reinició
- [ ] Detuviste el servidor con Ctrl+C
- [ ] Esperaste a que terminara completamente
- [ ] Lo reiniciaste con `npm run dev`

### ✅ 3. Revisar logs del servidor
Cuando accedas a la página de edición, busca en la **TERMINAL DEL SERVIDOR**:

**Lo que DEBES ver**:
```
🔍 [API Route /api/types]
  API_BASE: http://100.125.234.124:8082
  API_TOKEN: ***...últimos10
📡 Haciendo fetch a: http://100.125.234.124:8082/api/types
```

**Lo que NO debes ver**:
```
API_BASE: undefined
API_TOKEN: undefined
```

### ✅ 4. Si las variables están cargadas pero sigue fallando
- [ ] Revisa el status de la respuesta en los logs del servidor
- [ ] Ejecuta `test-backend.bat` para probar el backend directamente
- [ ] Verifica que el backend está corriendo en `http://100.125.234.124:8082`

---

## 🎯 Resultado Esperado

Después de reiniciar el servidor, deberías ver en los logs:

```
🔍 [API Route /api/types]
  API_BASE: http://100.125.234.124:8082
  API_TOKEN: ***...últimos10
📡 Haciendo fetch a: http://100.125.234.124:8082/api/types
📋 Headers: { Authorization: 'Bearer ...' }
📥 Respuesta status: 200
✅ Datos recibidos: 5 tipos
```

Y en el navegador **NO** deberías ver errores 401.

---

## 🆘 Si Sigue Sin Funcionar

Ejecuta estos comandos y comparte los resultados:

```bash
# 1. Verificar que el archivo .env.local existe
dir .env.local

# 2. Ver el contenido (sin mostrar el token completo)
type .env.local

# 3. Probar el backend directamente
test-backend.bat
```

---

## 📝 Notas Importantes

- ✅ He agregado logs extensivos en los proxies
- ✅ Los logs aparecen en la **terminal del servidor**, NO en la consola del navegador
- ✅ Cada vez que modificas `.env.local`, DEBES reiniciar el servidor
- ✅ Las variables `NEXT_PUBLIC_*` son especiales en Next.js y requieren reinicio

---

**Última actualización**: Ahora con logs detallados para diagnóstico
