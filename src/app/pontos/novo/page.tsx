// src/app/pontos/novo/page.tsx
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMapEvents } from "react-leaflet";
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

type Tipo = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function MapaClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return null;
}

export default function NovoPontoPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [description, setDescription] = useState("");

  const [existingPoints, setExistingPoints] = useState<InterestPointApi[]>(
    []
  );
  const [loadingInit, setLoadingInit] = useState(true);
  const [erroInit, setErroInit] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [erroSave, setErroSave] = useState<string | null>(null);

  // 👇 Ícone do pin (carregado só no client)
  const [pinIcon, setPinIcon] = useState<any | null>(null);

  useEffect(() => {
    async function carregar() {
      if (!API_BASE) {
        setErroInit("NEXT_PUBLIC_API_URL não está configurada.");
        setLoadingInit(false);
        return;
      }

      try {
        const resp = await fetch(`${API_BASE}/api/interest-points`);
        if (!resp.ok) {
          throw new Error(`Erro HTTP ${resp.status}`);
        }
        const raw: InterestPointApi[] = await resp.json();
        setExistingPoints(raw);
      } catch (e: any) {
        console.error(e);
        setErroInit(e.message || "Erro ao carregar pontos existentes");
      } finally {
        setLoadingInit(false);
      }
    }

    carregar();
  }, []);

  // Carrega Leaflet e cria o ícone personalizado
  useEffect(() => {
    async function loadIcon() {
      const L = await import("leaflet");

      const icon = L.icon({
        iconUrl: "/pin.svg",
        iconRetinaUrl: "/pin.svg",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      setPinIcon(icon);
    }

    loadIcon();
  }, []);

  const tipos = useMemo(() => {
    const map = new Map<string, string>();
    existingPoints.forEach((p) => {
      if (p.type) {
        map.set(p.type.id, p.type.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [existingPoints]);

  const bairros = useMemo(() => {
    const set = new Set<string>();
    existingPoints.forEach((p) => {
      if (p.neighborhood) {
        set.add(p.neighborhood);
      }
    });
    return Array.from(set.values()).sort();
  }, [existingPoints]);

  function getLatLonNums() {
    if (!lat.trim() || !lon.trim()) return { latNum: null, lonNum: null };
    const latNum = Number(lat.replace(",", "."));
    const lonNum = Number(lon.replace(",", "."));
    if (!isFinite(latNum) || !isFinite(lonNum)) {
      return { latNum: null, lonNum: null };
    }
    return { latNum, lonNum };
  }

  function updateLatLon(newLat: number, newLon: number) {
    setLat(String(newLat));
    setLon(String(newLon));
  }

  function validar(): string | null {
    if (!name.trim()) return "O nome do ponto é obrigatório.";
    if (!lat.trim() || !lon.trim())
      return "Latitude e longitude são obrigatórias.";

    const { latNum, lonNum } = getLatLonNums();
    if (latNum === null || lonNum === null) {
      return "Coordenadas inválidas. Use números (ex: -30.885, -55.510).";
    }

    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroSave(null);

    const erro = validar();
    if (erro) {
      setErroSave(erro);
      return;
    }

    if (!API_BASE) {
      setErroSave("NEXT_PUBLIC_API_URL não está configurada.");
      return;
    }

    const { latNum, lonNum } = getLatLonNums();
    if (latNum === null || lonNum === null) {
      setErroSave("Coordenadas inválidas.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      lat: latNum,
      lon: lonNum,
      address: address.trim() || null,
      neighborhood: neighborhood.trim() || null,
      typeId: typeId || null,
      parentId: null,
    };

    try {
      setSaving(true);

      const resp = await fetch(`${API_BASE}/api/interest-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(
          text || `Erro ao salvar ponto (HTTP ${resp.status})`
        );
      }

      let createdId: string | null = null;
      try {
        const body = await resp.json();
        if (body && body.objectId) {
          createdId = body.objectId as string;
        }
      } catch {
        // se a API não devolver JSON, tudo bem
      }

      if (createdId) {
        router.push(`/pontos/${createdId}`);
      } else {
        router.push("/pontos");
      }
    } catch (e: any) {
      console.error(e);
      setErroSave(e.message || "Erro ao salvar ponto de interesse");
    } finally {
      setSaving(false);
    }
  }

  async function usarMinhaLocalizacao() {
    setErroSave(null);
    if (!navigator.geolocation) {
      setErroSave("Geolocalização não suportada neste navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLatLon(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error(err);
        setErroSave("Não foi possível obter sua localização.");
      },
      {
        enableHighAccuracy: true,
      }
    );
  }

  const { latNum, lonNum } = getLatLonNums();
  const defaultCenter: [number, number] = [-30.885, -55.51];
  const mapCenter: [number, number] =
    latNum !== null && lonNum !== null
      ? [latNum, lonNum]
      : defaultCenter;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
            Uncovering History · Cadastro
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Cadastrar novo ponto de interesse
          </h1>
          <p className="text-xs text-zinc-400">
            Clique no mapa para definir o local, ajuste o marcador se
            necessário e preencha os dados históricos.
          </p>
        </header>

        {erroInit && (
          <p className="rounded-xl border border-red-600 bg-red-950/40 px-4 py-2 text-xs text-red-200">
            {erroInit}
          </p>
        )}

        {/* MAPA INTERATIVO */}
        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between px-4 py-2 text-[11px] text-zinc-400">
            <span>Mapa de localização do ponto</span>
            <span>
              Clique no mapa para posicionar • Arraste o marcador para
              ajustar
            </span>
          </div>
          <div className="h-[320px] w-full">
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapaClickHandler onSelect={updateLatLon} />

              {latNum !== null &&
                lonNum !== null &&
                pinIcon && (
                  <Marker
                    position={[latNum, lonNum]}
                    draggable={true}
                    icon={pinIcon} // 👈 agora usa o pin
                    eventHandlers={{
                      dragend: (e: any) => {
                        const pos = e.target.getLatLng();
                        updateLatLon(pos.lat, pos.lng);
                      },
                    }}
                  />
                )}
            </MapContainer>
          </div>
        </section>

        {/* FORMULÁRIO */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-200">
              Nome do ponto *
            </label>
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Palácio Moysés Vianna"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-200">
                Tipo
              </label>
              <select
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
              >
                <option value="">Selecione um tipo (opcional)</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {tipos.length === 0 && !loadingInit && (
                <p className="text-[11px] text-zinc-500">
                  Nenhum tipo detectado ainda. Cadastre pontos ou configure
                  tipos na API.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-200">
                Bairro
              </label>
              <input
                list="bairros-list"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Centro, Jardim Europa..."
              />
              <datalist id="bairros-list">
                {bairros.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-200">
              Endereço
            </label>
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua / Praça, número..."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-200">
                Latitude *
              </label>
              <input
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-30.885"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-200">
                Longitude *
              </label>
              <input
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="-55.510"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={usarMinhaLocalizacao}
                className="w-full rounded-xl border border-emerald-500 bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-black shadow-sm transition hover:bg-emerald-500 hover:shadow-md"
              >
                Usar minha localização
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-200">
              Descrição / contexto histórico
            </label>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do local, importância histórica, curiosidades..."
            />
          </div>

          {erroSave && (
            <p className="rounded-xl border border-red-600 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {erroSave}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full border border-emerald-400 bg-emerald-500 px-5 py-1.5 text-xs font-medium text-black shadow-sm transition hover:bg-emerald-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar ponto"}
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-100 hover:border-zinc-500"
              onClick={() => router.push("/pontos")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
