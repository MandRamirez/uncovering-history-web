// src/app/pontos/components/PIItemCard.tsx
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const MiniMapCard = dynamic(() => import("./MiniMapCard"), {
  ssr: false,
});

type Tipo = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type InterestPoint = {
  objectId: string;
  name: string;
  description?: string;
  lat: number;
  lon: number;
  address?: string | null;
  neighborhood?: string | null;
  type?: Tipo;
  photoUrls?: string[];
};

type Props = {
  point: InterestPoint;
};

export default function PIItemCard({ point }: Props) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-sm transition hover:border-emerald-400/70">
      {/* Foto principal (se existir) */}
      {point.photoUrls && point.photoUrls.length > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={point.photoUrls[0]}
          alt={point.name}
          className="h-32 w-full object-cover"
        />
      )}

      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-50">
              {point.name}
            </h3>
            {point.type && (
              <p className="mt-0.5 text-[11px] text-emerald-300">
                {point.type.name}
              </p>
            )}
            {point.neighborhood && (
              <p className="mt-0.5 text-[11px] text-zinc-400">
                Bairro: {point.neighborhood}
              </p>
            )}
            {point.address && (
              <p className="mt-0.5 text-[11px] text-zinc-500">
                {point.address}
              </p>
            )}
          </div>
        </div>

        {point.description && (
          <p className="line-clamp-3 text-xs text-zinc-400">
            {point.description}
          </p>
        )}

        {/* Mini-mapa */}
        <div className="mt-2 h-28 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
          <MiniMapCard lat={point.lat} lon={point.lon} />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-zinc-500">
            Lat/Lon: {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
          </p>
          <Link
            href={`/pontos/${point.objectId}`}
            className="text-[11px] font-medium text-emerald-300 hover:text-emerald-200"
          >
            Ver detalhes →
          </Link>
        </div>
      </div>
    </article>
  );
}
