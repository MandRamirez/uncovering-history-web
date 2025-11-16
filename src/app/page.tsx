"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

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
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const [pontos, setPontos] = useState<InterestPoint[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar os pontos ao abrir a Home
  useEffect(() => {
    async function carregar() {
      if (!API_BASE) {
        setErro("NEXT_PUBLIC_API_URL não configurada.");
        return;
      }

      try {
        const resp = await fetch(`${API_BASE}/api/interest-points`);
        if (!resp.ok) throw new Error(`Erro: HTTP ${resp.status}`);

        const data = await resp.json();
        const normalizados = data
          .map((p: any) => {
            const lat = typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
            const lon = typeof p.lon === "string" ? parseFloat(p.lon) : p.lon;
            if (!isFinite(lat) || !isFinite(lon)) return null;
            return { ...p, lat, lon };
          })
          .filter(Boolean);

        setPontos(normalizados);
      } catch (e: any) {
        setErro(e.message || "Erro ao carregar pontos");
      }
    }

    carregar();
  }, []);

  const center: [number, number] = [-30.885, -55.51];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-900/40 backdrop-blur p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            Uncovering History · Historiador
          </h1>

          <Link
            href="/pontos/novo"
            className="rounded-full border border-emerald-400 bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-black shadow hover:bg-emerald-400 transition"
          >
            + Cadastrar novo ponto
          </Link>
        </div>
      </header>

      {/* MAPA GRANDE NA HOME */}
      <section className="h-[60vh] w-full border-b border-zinc-800">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcadores */}
          {pontos.map((p) => (
            <Marker key={p.objectId} position={[p.lat, p.lon]}>
              <Popup>
                <strong>{p.name}</strong>
                {p.type && <div className="mt-1 text-xs">{p.type.name}</div>}
                {p.neighborhood && (
                  <div className="text-xs text-zinc-400">
                    Bairro: {p.neighborhood}
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {/* CONTEÚDO */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Últimos pontos cadastrados
        </h2>

        {erro && (
          <p className="text-red-400 text-sm mb-4">
            Erro ao carregar pontos: {erro}
          </p>
        )}

        {pontos.length === 0 ? (
          <p className="text-zinc-400 text-sm">
            Nenhum ponto cadastrado ainda.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pontos.slice(-6).map((p) => (
              <Link
                key={p.objectId}
                href={`/pontos/${p.objectId}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-emerald-400 transition"
              >
                <h3 className="text-lg font-medium">{p.name}</h3>
                {p.type && (
                  <p className="text-xs text-emerald-300">{p.type.name}</p>
                )}
                {p.neighborhood && (
                  <p className="text-xs text-zinc-500">
                    Bairro: {p.neighborhood}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Link para explorar tudo */}
        <div className="mt-6">
          <Link
            href="/pontos"
            className="text-emerald-400 text-sm underline hover:text-emerald-300"
          >
            Ver todos os pontos cadastrados →
          </Link>
        </div>
      </section>
    </main>
  );
}
