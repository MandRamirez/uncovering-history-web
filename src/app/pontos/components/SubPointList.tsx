"use client";

type Tipo = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type SubPoint = {
  objectId: string;
  name: string;
  description?: string;
  type?: Tipo;
};

type Props = {
  childrenPoints: SubPoint[];
};

export default function SubPointList({ childrenPoints }: Props) {
  if (!childrenPoints || childrenPoints.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold text-zinc-50">
        Elementos associados / Subpontos
      </h2>
      <ul className="mt-2 space-y-2 text-sm text-zinc-300">
        {childrenPoints.map((c) => (
          <li
            key={c.objectId}
            className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
          >
            <div className="font-medium text-zinc-50">{c.name}</div>
            {c.type && (
              <div className="text-[11px] text-emerald-300">
                {c.type.name}
              </div>
            )}
            {c.description && (
              <p className="mt-1 text-xs text-zinc-400">{c.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
