// src/app/mapa/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// ===============================
//   Imports dinâmicos (client-only)
// ===============================
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

// ===============================
//   Tipos
// ===============================
type Tipo = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

// Versão que vem da API (pode vir string ou number)
type InterestPointApi = {
  objectId: string;
  name: string;
  description?: string;
  lat: number | string;
  lon: number | string;
  address?: string | null;
  neighborhood?: string | null;
  type?: Tipo;
};

// Versão normalizada que o mapa realmente usa
export type InterestPoint = {
  objectId: string;
  name: string;
  description?: string;
  lat: number;
  lon: number;
  address?: string | null;
  neighborhood?: string | null;
  type?: Tipo;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function MapaPage() {
  const [pontos, setPontos] = useState<InterestPoint[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!API_BASE) {
        setErro("NEXT_PUBLIC_API_URL não está configurada.");
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(`${API_BASE}/api/interest-points`);
        if (!resp.ok) {
          throw new Error(`Erro HTTP ${resp.status}`);
        }

        const raw: InterestPointApi[] = await resp.json();

        // Normaliza lat/lon para sempre serem numbers
        const data: InterestPoint[] = raw
          .map((p) => {
            const lat =
              typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
            const lon =
              typeof p.lon === "string" ? parseFloat(p.lon) : p.lon;

            if (!isFinite(lat) || !isFinite(lon)) {
              return null;
            }

            return {
              ...p,
              lat,
              lon,
            };
          })
          .filter((p): p is InterestPoint => p !== null);

        setPontos(data);
      } catch (e: any) {
        console.error("Erro ao carregar pontos:", e);
        setErro(e.message || "Erro ao carregar pontos");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          padding: 24,
          background: "black",
          color: "white",
          minHeight: "100vh",
        }}
      >
        Carregando mapa...
      </main>
    );
  }

  if (erro) {
    return (
      <main
        style={{
          padding: 24,
          background: "black",
          color: "red",
          minHeight: "100vh",
        }}
      >
        Erro: {erro}
      </main>
    );
  }

  // Centro padrão: Santana do Livramento
  const defaultCenter: [number, number] = [-30.885, -55.51];

  // Se houver pontos, usamos a média das coordenadas como centro
  const center: [number, number] =
    pontos.length > 0
      ? [
          pontos.reduce((sum, p) => sum + p.lat, 0) / pontos.length,
          pontos.reduce((sum, p) => sum + p.lon, 0) / pontos.length,
        ]
      : defaultCenter;

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* === Agrupamento de pontos no mesmo local === */}
        {(() => {
          const groups = new Map<string, InterestPoint[]>();

          // Agrupa pontos por lat/lon aproximado (5 casas decimais)
          pontos.forEach((p) => {
            const key = `${p.lat.toFixed(5)}|${p.lon.toFixed(5)}`;
            const arr = groups.get(key) ?? [];
            arr.push(p);
            groups.set(key, arr);
          });

          return Array.from(groups.entries()).map(([key, group]) => {
            const [latStr, lonStr] = key.split("|");
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);

            return (
              <Marker key={key} position={[lat, lon]}>
                <Popup>
                  {group.length === 1 ? (
                    <>
                      <strong>{group[0].name}</strong>
                      {group[0].type && (
                        <div>Tipo: {group[0].type!.name}</div>
                      )}
                      {group[0].description && (
                        <div style={{ marginTop: 4 }}>
                          {group[0].description}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <strong>{group.length} pontos neste local:</strong>
                      <ul
                        style={{
                          marginTop: 4,
                          paddingLeft: 16,
                          listStyle: "disc",
                        }}
                      >
                        {group.map((p) => (
                          <li key={p.objectId}>
                            {p.name}
                            {p.type ? ` (${p.type.name})` : ""}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </Popup>
              </Marker>
            );
          });
        })()}
      </MapContainer>
    </main>
  );
}
