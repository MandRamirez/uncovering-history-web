// src/app/pontos/[id]/page.tsx
"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Gallery from "../components/Gallery";
import SubPointList, { SubPoint } from "../components/SubPointList";
import MiniMapCard from "../components/MiniMapCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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
  lat: number | string;
  lon: number | string;
  type?: Tipo;
  neighborhood?: string | null;
  address?: string | null;
  country?: string | null;
  contact?: string | null;
  photoUrls?: string[];
  photoIds?: string[];
  parentId?: string | null;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function buildImageUrls(point: InterestPoint): string[] {
  const urls: string[] = [];

  // 1) photoUrls (se algum dia vier pronto da API)
  if (point.photoUrls && point.photoUrls.length > 0) {
    for (const u of point.photoUrls) {
      if (!u) continue;
      
      // Se for URL completa (Unsplash), usa direto
      if (u.startsWith("http://") || u.startsWith("https://")) {
        urls.push(u);
      } else {
        // Se for caminho relativo, adiciona o prefixo /api/files/
        urls.push(`/api/files/${u}`);
      }
    }
  }

  // 2) photoIds (semente Unsplash OU uploads da API)
  if (point.photoIds && point.photoIds.length > 0) {
    for (const id of point.photoIds) {
      if (!id) continue;

      // seeds: URL completa
      if (id.startsWith("http://") || id.startsWith("https://")) {
        urls.push(id);
      } else {
        // uploads: "parentId/arquivo.jpg" → /api/files/{id}
        urls.push(`/api/files/${id}`);
      }
    }
  }

  // remove duplicados simples
  return Array.from(new Set(urls));
}

export default function InterestPointDetailsPage({ params }: PageProps) {
  const { id } = use(params);

  const [ponto, setPonto] = useState<InterestPoint | null>(null);
  const [children, setChildren] = useState<SubPoint[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setErro(null);
        setLoading(true);

        // 1) ponto principal - use Next.js API proxy
        const resp = await fetch(`/api/interest-points/${id}`);
        if (!resp.ok) {
          throw new Error(`Erro HTTP ${resp.status}`);
        }
        const data: InterestPoint = await resp.json();
        setPonto(data);

        // 2) filhos (opcional) - use Next.js API proxy
        try {
          const childResp = await fetch(
            `/api/interest-points/parent/${id}`
          );

          if (childResp.ok) {
            const childData = await childResp.json();
            if (Array.isArray(childData)) {
              setChildren(
                childData.map((c: any) => ({
                  objectId: c.objectId,
                  name: c.name,
                  description: c.description,
                  type: c.type,
                }))
              );
            }
          }
        } catch (e) {
          console.warn("Falha ao carregar subpontos", e);
        }
      } catch (e: any) {
        console.error(e);
        setErro(e.message || "Erro ao carregar ponto de interesse");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  const { latNum, lonNum } = useMemo(() => {
    if (!ponto) {
      return {
        latNum: null as number | null,
        lonNum: null as number | null,
      };
    }

    const lat =
      typeof ponto.lat === "string" ? parseFloat(ponto.lat) : ponto.lat;
    const lon =
      typeof ponto.lon === "string" ? parseFloat(ponto.lon) : ponto.lon;

    if (!isFinite(lat as number) || !isFinite(lon as number)) {
      return { latNum: null, lonNum: null };
    }
    return { latNum: lat as number, lonNum: lon as number };
  }, [ponto]);

  const imageUrls = useMemo(
    () => (ponto ? buildImageUrls(ponto) : []),
    [ponto]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <p className="text-sm text-zinc-200">Carregando ponto de interesse...</p>
      </main>
    );
  }

  if (erro || !ponto) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <div className="space-y-2 text-center">
          <p className="text-sm text-red-400">
            {erro || "Ponto de interesse não encontrado."}
          </p>
          <Link
            href="/pontos"
            className="text-[11px] text-emerald-300 hover:text-emerald-200"
          >
            Voltar para lista de pontos →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900/40 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
              Uncovering History · Detalhes
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              {ponto.name}
            </h1>
            {ponto.type && (
              <p className="text-[11px] text-emerald-300 mt-0.5">
                {ponto.type.name}
              </p>
            )}
          </div>

          <Link
            href="/pontos"
            className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-100 hover:border-zinc-500"
          >
            ← Voltar para lista
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Imagem destaque + mini mapa */}
        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
            {imageUrls.length > 0 ? (
              <img
                src={imageUrls[0]}
                alt={ponto.name}
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center text-xs text-zinc-500">
                Nenhuma imagem cadastrada para este ponto.
              </div>
            )}
          </div>

          <div className="space-y-3">
            {latNum !== null && lonNum !== null && (
              <MiniMapCard lat={latNum} lon={lonNum} />
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs space-y-1">
              {ponto.neighborhood && (
                <p className="text-zinc-200">
                  <span className="font-medium">Bairro:</span>{" "}
                  {ponto.neighborhood}
                </p>
              )}
              {ponto.address && (
                <p className="text-zinc-200">
                  <span className="font-medium">Endereço:</span>{" "}
                  {ponto.address}
                </p>
              )}
              {ponto.country && (
                <p className="text-zinc-200">
                  <span className="font-medium">País:</span>{" "}
                  {ponto.country}
                </p>
              )}
              {ponto.contact && (
                <p className="text-zinc-200">
                  <span className="font-medium">Contato:</span>{" "}
                  {ponto.contact}
                </p>
              )}
              {latNum !== null && lonNum !== null && (
                <p className="text-zinc-400">
                  <span className="font-medium">Coordenadas:</span>{" "}
                  {latNum.toFixed(4)}, {lonNum.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Descrição */}
        {ponto.description && (
          <section>
            <h2 className="text-sm font-semibold text-zinc-50">
              Descrição histórica
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-200">
              {ponto.description}
            </p>
          </section>
        )}

        {/* Galeria de fotos (se tiver mais de 1) */}
        {imageUrls.length > 1 && (
          <Gallery photos={imageUrls} />
        )}

        {/* Subpontos / elementos filhos */}
        {children && children.length > 0 && (
          <SubPointList childrenPoints={children} />
        )}
      </section>
    </main>
  );
}
