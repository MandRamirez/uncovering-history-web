// src/app/mapa/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";

// ==== Leaflet (só no client) para corrigir ícones padrão ====
let L: any = null;
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  L = require("leaflet");

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

// ==== React-Leaflet dinâmico ====
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
  photoUrls?: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function MapaPage() {
  const [pontos, setPontos] = useState<InterestPoint[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!API_BASE) {
        setErro("NEXT_PUBLIC_API_URL não configurada.");
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(`${API_BASE}/api/interest-points`);
        if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`);

        const data = await resp.json();
        const normalizados: InterestPoint[] = data
          .map((p: any) => {
            const lat =
              typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
            const lon =
              typeof p.lon === "string" ? parseFloat(p.lon) : p.lon;
            if (!isFinite(lat) || !isFinite(lon)) return null;
            return { ...p, lat, lon };
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

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-zinc-50">
        Carregando mapa...
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-red-400">
        Erro: {erro}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="h-screen w-full">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {pontos.map((p) => (
            <Marker key={p.objectId} position={[p.lat, p.lon]}>
              <Popup>
                <strong>{p.name}</strong>
                {p.photoUrls && p.photoUrls.length > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photoUrls[0]}
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
          ))}
        </MapContainer>
      </section>
    </main>
  );
}
