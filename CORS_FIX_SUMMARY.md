# CORS Fix Summary - Uncovering History Web App

## Problem
The frontend application was getting "Failed to fetch" errors when trying to call the backend API at `http://100.125.234.124:8082`. This was caused by **CORS (Cross-Origin Resource Sharing)** restrictions - browsers block requests from `localhost:3000` to a different origin.

## Solution
Created **Next.js API proxy routes** that act as a middleware layer between the frontend and backend:

```
Browser (localhost:3000) 
  ↓ (no CORS, same origin)
Next.js API Routes (localhost:3000/api/*)
  ↓ (no CORS, server-to-server)
Backend API (100.125.234.124:8082)
```

## Files Created

### 1. `/src/app/api/interest-points/route.ts`
- **GET**: Fetch all interest points
- **POST**: Create new interest point
- Forwards requests to `${API_BASE}/api/interest-points`
- Includes JWT token from `NEXT_PUBLIC_API_TOKEN`

### 2. `/src/app/api/interest-points/[id]/route.ts`
- **GET**: Fetch single interest point by ID
- Forwards to `${API_BASE}/api/interest-points/${id}`

### 3. `/src/app/api/interest-points/parent/[id]/route.ts`
- **GET**: Fetch children/sub-points of a point
- Forwards to `${API_BASE}/api/interest-points/parent/${id}/with-depth`

### 4. `/src/app/api/types/route.ts`
- **GET**: Fetch all types
- Forwards to `${API_BASE}/api/types`

### 5. `/src/app/api/files/[...path]/route.ts`
- **GET**: Proxy for file/image downloads
- Forwards to `${API_BASE}/files/${path}`
- Handles images and other file uploads

### 6. `/src/app/api/images/upload-multiple/route.ts`
- **POST**: Upload multiple images
- Forwards FormData to `${API_BASE}/api/images/upload-multiple`

## Files Modified

### 1. `/src/app/page.tsx` (Homepage)
- Changed: `fetch(\`\${API_BASE}/api/interest-points\`)` → `fetch('/api/interest-points')`
- Updated `getPointImageUrl()` to use `/api/files/` instead of `${API_BASE}/files/`

### 2. `/src/app/pontos/page.tsx` (List page)
- Changed: `fetch(\`\${API_BASE}/api/interest-points\`)` → `fetch('/api/interest-points')`

### 3. `/src/app/pontos/[id]/page.tsx` (Detail page)
- Changed: `fetch(\`\${API_BASE}/api/interest-points/\${id}\`)` → `fetch(\`/api/interest-points/\${id}\`)`
- Changed: `fetch(\`\${API_BASE}/api/interest-points/parent/\${id}/with-depth\`)` → `fetch(\`/api/interest-points/parent/\${id}\`)`
- Updated `buildImageUrls()` to use `/api/files/` instead of `${API_BASE}/files/`

### 4. `/src/app/mapa/page.tsx` (Map page)
- Changed: `fetch(\`\${API_BASE}/api/interest-points\`)` → `fetch('/api/interest-points')`

### 5. `/src/app/pontos/novo/page.tsx` (New point page)
- Changed all API calls to use local proxy routes:
  - `fetch(\`\${API_BASE}/api/interest-points\`)` → `fetch('/api/interest-points')`
  - `fetch(\`\${API_BASE}/api/types\`)` → `fetch('/api/types')`
  - POST to `/api/interest-points` and `/api/images/upload-multiple`
- Removed `authHeaders()` helper function (JWT now handled in proxy)
- Removed `API_BASE` and `API_TOKEN` constants

## How It Works

1. **Frontend makes request** to `/api/interest-points` (same origin, no CORS)
2. **Next.js API route** receives the request on the server side
3. **API route forwards** request to `http://100.125.234.124:8082/api/interest-points`
   - Adds `Authorization: Bearer ${API_TOKEN}` header
   - No CORS issue (server-to-server communication)
4. **Backend responds** to Next.js
5. **Next.js forwards** response back to frontend

## Environment Variables Used

Both variables in `.env.local` are still used:
- `NEXT_PUBLIC_API_URL=http://100.125.234.124:8082` - Used by API routes to know where to proxy
- `NEXT_PUBLIC_API_TOKEN=eyJhbGc...` - Used by API routes for authentication

## Testing

After restarting the Next.js dev server, all pages should work:
- ✅ Homepage with map and recent points
- ✅ Points list page
- ✅ Point detail pages
- ✅ Full-screen map
- ✅ New point creation with image uploads

## Benefits

1. **No CORS errors** - Browser only talks to same origin
2. **Security** - API token never exposed to browser
3. **Centralized auth** - JWT token managed in one place
4. **Backend unchanged** - Your meshnet API stays the same
5. **Easy debugging** - Can add logging in proxy routes

## Next Steps

If you get any errors, check:
1. Next.js dev server is restarted (`npm run dev`)
2. Backend API is running on `100.125.234.124:8082`
3. Meshnet/Tailscale connection is active
4. `.env.local` file has correct values
