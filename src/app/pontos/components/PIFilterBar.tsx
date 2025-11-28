"use client";

type Props = {
  types: { id: string; name: string }[];
  neighborhoods: string[];
  countries: string[];
  search: string;
  typeId: string;
  neighborhood: string;
  country: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onCountryChange: (value: string) => void;
};

export default function PIFilterBar({
  types,
  neighborhoods,
  countries,
  search,
  typeId,
  neighborhood,
  country,
  onSearchChange,
  onTypeChange,
  onNeighborhoodChange,
  onCountryChange,
}: Props) {
  return (
    <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex flex-col gap-3">
        {/* Búsqueda */}
        <div className="w-full">
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

        {/* Filtros en grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
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

          <div>
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

          <div>
            <label className="block text-[11px] uppercase tracking-wide text-zinc-400">
              País
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
            >
              <option value="">Todos os países</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
