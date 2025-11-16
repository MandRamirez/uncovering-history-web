"use client";

type Props = {
  types: { id: string; name: string }[];
  neighborhoods: string[];
  search: string;
  typeId: string;
  neighborhood: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
};

export default function PIFilterBar({
  types,
  neighborhoods,
  search,
  typeId,
  neighborhood,
  onSearchChange,
  onTypeChange,
  onNeighborhoodChange,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 md:flex-row md:items-end md:justify-between">
      <div className="flex-1">
        <label className="block text-[11px] uppercase tracking-wide text-zinc-400">
          Buscar por nome
        </label>
        <input
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
          placeholder="Ex: Catedral, Praça Internacional..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex-1 md:max-w-[220px]">
        <label className="block text-[11px] uppercase tracking-wide text-zinc-400">
          Tipo
        </label>
        <select
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
          value={typeId}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 md:max-w-[220px]">
        <label className="block text-[11px] uppercase tracking-wide text-zinc-400">
          Bairro
        </label>
        <select
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
          value={neighborhood}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
        >
          <option value="">Todos os bairros</option>
          {neighborhoods.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
