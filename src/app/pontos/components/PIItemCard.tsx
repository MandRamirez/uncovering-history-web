"use client";

import Link from "next/link";

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
};

type Props = {
  point: InterestPoint;
};

export default function PIItemCard({ point }: Props) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm hover:border-emerald-400/70 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-50">
            {point.name}
          </h3>
          {point.type && (
            <p className="mt-0.5 text-xs text-emerald-300">
              {point.type.name}
            </p>
          )}
          {point.neighborhood && (
            <p className="mt-0.5 text-xs text-zinc-400">
              Bairro: {point.neighborhood}
            </p>
          )}
          {point.address && (
            <p className="mt-0.5 text-xs text-zinc-500 text-ellipsis overflow-hidden">
              {point.address}
            </p>
          )}
        </div>
      </div>

      {point.description && (
        <p className="mt-2 line-clamp-3 text-xs text-zinc-400">
          {point.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
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
    </article>
  );
}
