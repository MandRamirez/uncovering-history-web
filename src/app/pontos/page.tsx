"use client";

import { useEffect, useMemo, useState } from "react";
import PIItemCard, { InterestPoint as CardPoint } from "./components/PIItemCard";
import PIFilterBar from "./components/PIFilterBar";

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

export default function PontosPage() {
  const [data, setData] = useState<CardPoint[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeId, setTypeId] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

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

        const pontos: CardPoint[] = raw
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
          .filter((p): p is CardPoint => p !== null);

        setData(pontos);
      } catch (e: any) {
        console.error(e);
        setErro(e.message || "Erro ao carregar pontos");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const tipos = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((p) => {
      if (p.type) {
        map.set(p.type.id, p.type.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  const bairros = useMemo(() => {
    const set = new Set<string>();
    data.forEach((p) => {
      if (p.neighborhood) {
        set.add(p.neighborhood);
      }
    });
    return Array.from(set.values()).sort();
  }, [data]);

  const filtrados = useMemo(() => {
    return data.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (typeId && p.type?.id !== typeId) {
        return false;
      }
      if (neighborhood && p.neighborhood !== neighborhood) {
        return false;
      }
      return true;
    });
  }, [data, search, typeId, neighborhood]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-zinc-50">
        Carregando pontos de interesse...
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
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
            Uncovering History
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Lista de Pontos de Interesse
          </h1>
          <p className="text-xs text-zinc-400">
            Total: {data.length} • Exibindo: {filtrados.length}
          </p>
        </header>

        <PIFilterBar
          types={tipos}
          neighborhoods={bairros}
          search={search}
          typeId={typeId}
          neighborhood={neighborhood}
          onSearchChange={setSearch}
          onTypeChange={setTypeId}
          onNeighborhoodChange={setNeighborhood}
        />

        <section className="grid gap-3 md:grid-cols-2">
          {filtrados.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Nenhum ponto encontrado com os filtros atuais.
            </p>
          ) : (
            filtrados.map((p) => <PIItemCard key={p.objectId} point={p} />)
          )}
        </section>
      </div>
    </main>
  );
}
