"use client";

type Props = {
  photos: string[];
};

export default function Gallery({ photos }: Props) {
  if (!photos || photos.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold text-zinc-50">Fotos</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {photos.map((url) => (
          <figure
            key={url}
            className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="h-40 w-full object-cover transition hover:scale-105"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
