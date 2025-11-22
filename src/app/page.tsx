// src/app/page.tsx
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";

// ==== Leaflet só no client + ícone personalizado ====
let L: any = null;
let pinIcon: any = null;

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  L = require("leaflet");

  // corrige ícones padrão do Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });

  // nosso PIN personalizado
  pinIcon = L.icon({
    iconUrl: "/pin.svg",
    iconRetinaUrl: "/pin.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

// React-Leaflet dinâmico
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

type Tipo = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type InterestPoint = {
  objectId: string;
  name: string;
  description?: string;
  lat: number;
  lon: number;
  type?: Tipo;
  neighborhood?: string | null;
  address?: string | null;
  photoUrls?: string[]; // pode ficar para o futuro
  photoIds?: string[];  // aqui estão as imagens dos seeds e dos uploads
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// 👇 Helper centralizado pra descobrir qual imagem usar
function getPointImageUrl(p: InterestPoint): string | undefined {
  // 1) se um dia usarmos photoUrls, elas têm prioridade
  if (p.photoUrls && p.photoUrls.length > 0) {
    const url = p.photoUrls[0];
    if (!url) return undefined;
    
    // Se for URL completa (Unsplash), usa direto
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    
    // Se for caminho relativo, adiciona o prefixo /api/files/
    return `/api/files/${url}`;
  }

  // 2) photoIds:
  if (p.photoIds && p.photoIds.length > 0) {
    const first = p.photoIds[0];
    if (!first) return undefined;

    // caso dos seeds: URLs completas do Unsplash
    if (first.startsWith("http://") || first.startsWith("https://")) {
      return first;
    }

    // caso dos uploads na API: caminho relativo "parentId/filename.jpg"
    // Use the Next.js API proxy instead of calling backend directly
    return `/api/files/${first}`;
  }

  return undefined;
}

export default function HomePage() {
  const [pontos, setPontos] = useState<InterestPoint[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        // Use the Next.js API route instead of calling backend directly
        const resp = await fetch('/api/interest-points');

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          throw new Error(text || `Erro HTTP ${resp.status}`);
        }

        const data = await resp.json();
        const normalizados: InterestPoint[] = data
          .map((p: any) => {
            const lat =
              typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
            const lon =
              typeof p.lon === "string" ? parseFloat(p.lon) : p.lon;
            if (!isFinite(lat) || !isFinite(lon)) return null;
            return { ...p, lat, lon } as InterestPoint;
          })
          .filter((p: any): p is InterestPoint => p !== null);

        setPontos(normalizados);
      } catch (e: any) {
        console.error(e);
        setErro(e.message || "Erro ao carregar pontos");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const defaultCenter: [number, number] = [-30.885, -55.51];

  const center: [number, number] = useMemo(() => {
    if (!pontos.length) return defaultCenter;
    const lat =
      pontos.reduce((sum, p) => sum + p.lat, 0) / pontos.length;
    const lon =
      pontos.reduce((sum, p) => sum + p.lon, 0) / pontos.length;
    return [lat, lon];
  }, [pontos]);

  const ultimos = useMemo(
    () => [...pontos].slice(-6).reverse(),
    [pontos]
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-900/40 backdrop-blur p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
              Uncovering History
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              Painel do Historiador
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/pontos"
              className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-100 hover:border-zinc-500"
            >
              Ver lista de pontos
            </Link>
            <Link
              href="/mapa"
              className="rounded-full border border-sky-400 bg-sky-500 px-4 py-1.5 text-xs font-semibold text-black shadow hover:bg-sky-400"
            >
              Abrir mapa em tela cheia
            </Link>
            <Link
              href="/pontos/novo"
              className="rounded-full border border-emerald-400 bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-black shadow hover:bg-emerald-400"
            >
              + Cadastrar novo ponto
            </Link>
          </div>
        </div>
      </header>

      {/* MAPA COM PINS */}
      <section className="h-[60vh] w-full border-b border-zinc-800">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-200">
            Carregando mapa e pontos de interesse...
          </div>
        ) : erro ? (
          <div className="flex h-full items-center justify-center text-sm text-red-400">
            Erro ao carregar pontos: {erro}
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {pontos.map((p) => {
              const imgUrl = getPointImageUrl(p);
              return (
                <Marker
                  key={p.objectId}
                  position={[p.lat, p.lon]}
                  icon={pinIcon}
                >
                  <Popup>
                    <strong>{p.name}</strong>
                    {imgUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgUrl}
                        alt={p.name}
                        style={{
                          marginTop: 8,
                          width: 160,
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    )}
                    {p.type && (
                      <div className="mt-1 text-xs">{p.type.name}</div>
                    )}
                    {p.neighborhood && (
                      <div className="text-[11px] text-zinc-500">
                        Bairro: {p.neighborhood}
                      </div>
                    )}
                    {p.address && (
                      <div className="text-[11px] text-zinc-500">
                        {p.address}
                      </div>
                    )}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </section>

      {/* ÚLTIMOS PONTOS */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-4 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Últimos pontos cadastrados
            </h2>
            <p className="text-[11px] text-zinc-500">
              Total: {pontos.length} • Mostrando: {ultimos.length}
            </p>
          </div>
          <Link
            href="/pontos"
            className="text-[11px] text-emerald-300 hover:text-emerald-200"
          >
            Ver todos →
          </Link>
        </header>

        {ultimos.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Nenhum ponto cadastrado ainda.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ultimos.map((p) => {
              const imgUrl = getPointImageUrl(p);

              return (
                <Link
                  key={p.objectId}
                  href={`/pontos/${p.objectId}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-emerald-400/70"
                >
                  {imgUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="h-32 w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                  <div className="p-3 space-y-1">
                    <h3 className="text-sm font-semibold">{p.name}</h3>
                    {p.type && (
                      <p className="text-[11px] text-emerald-300">
                        {p.type.name}
                      </p>
                    )}
                    {p.neighborhood && (
                      <p className="text-[11px] text-zinc-500">
                        Bairro: {p.neighborhood}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-600">
                      Lat/Lon: {p.lat.toFixed(4)}, {p.lon.toFixed(4)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
