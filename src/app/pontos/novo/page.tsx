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
  country?: string | null;
  type?: Tipo | string;
};

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

  // Campos básicos
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [contact, setContact] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [description, setDescription] = useState("");

  // Novos campos categóricos
  const [quimica, setQuimica] = useState<string[]>([]);
  const [biologica, setBiologica] = useState<string[]>([]);
  const [arte, setArte] = useState<string[]>([]);
  const [historica, setHistorica] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);

  // Campo para parentId (ponto pai)
  const [parentId, setParentId] = useState("");

  // Custom fields (campos personalizados)
  const [customFieldKey, setCustomFieldKey] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  const [existingPoints, setExistingPoints] = useState<InterestPointApi[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);

  const [loadingInit, setLoadingInit] = useState(true);
  const [erroInit, setErroInit] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [erroSave, setErroSave] = useState<string | null>(null);

  const [pinIcon, setPinIcon] = useState<any | null>(null);
  const [autoCountryLoading, setAutoCountryLoading] = useState(false);
  const [countryTouched, setCountryTouched] = useState(false);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  // Carregar pontos existentes
  useEffect(() => {
    async function carregarPontos() {
      try {
        const resp = await fetch("/api/interest-points");
        if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`);
        const raw: InterestPointApi[] = await resp.json();
        setExistingPoints(raw);
      } catch (e: any) {
        console.error(e);
        setErroInit(e.message || "Erro ao carregar pontos existentes");
      } finally {
        setLoadingInit(false);
      }
    }
    carregarPontos();
  }, []);

  // Carregar tipos
  useEffect(() => {
    async function carregarTipos() {
      try {
        const resp = await fetch("/api/types");
        if (!resp.ok) throw new Error(`Erro ao carregar tipos (HTTP ${resp.status})`);
        const data: Tipo[] = await resp.json();
        setTipos(data);
      } catch (e) {
        console.error(e);
      }
    }
    carregarTipos();
  }, []);

  // Carrega ícone do Leaflet
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

  const bairros = useMemo(() => {
    const set = new Set<string>();
    existingPoints.forEach((p) => {
      if (p.neighborhood) set.add(p.neighborhood);
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

  // Detectar país automaticamente
  useEffect(() => {
    async function detectarPais() {
      const { latNum, lonNum } = getLatLonNums();
      if (latNum === null || lonNum === null) return;
      if (countryTouched) return;

      try {
        setAutoCountryLoading(true);
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latNum}&lon=${lonNum}&accept-language=pt-BR`;
        const resp = await fetch(url);
        if (!resp.ok) {
          console.warn("Falha ao detectar país", resp.status);
          return;
        }
        const data: any = await resp.json();
        const countryName: string | undefined = data?.address?.country;
        if (countryName) setCountry(countryName);
      } catch (e) {
        console.error("Erro ao detectar país:", e);
      } finally {
        setAutoCountryLoading(false);
      }
    }
    detectarPais();
  }, [lat, lon, countryTouched]);

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

  // Funções auxiliares para arrays categóricos
  function toggleArrayValue(
    arr: string[],
    value: string,
    setter: (arr: string[]) => void
  ) {
    if (arr.includes(value)) {
      setter(arr.filter((v) => v !== value));
    } else {
      setter([...arr, value]);
    }
  }

  function addCustomField() {
    if (!customFieldKey.trim()) return;
    setCustomFields({
      ...customFields,
      [customFieldKey]: customFieldValue,
    });
    setCustomFieldKey("");
    setCustomFieldValue("");
  }

  function removeCustomField(key: string) {
    const newFields = { ...customFields };
    delete newFields[key];
    setCustomFields(newFields);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroSave(null);

    const erro = validar();
    if (erro) {
      setErroSave(erro);
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
      country: country.trim() || null,
      contact: contact.trim() || null,
      typeId: typeId || null,
      parentId: parentId || null,
      customFields:
        Object.keys(customFields).length > 0 ? customFields : null,
      quimica: quimica.length > 0 ? quimica : null,
      biologica: biologica.length > 0 ? biologica : null,
      arte: arte.length > 0 ? arte : null,
      historica: historica.length > 0 ? historica : null,
      status: status.length > 0 ? status : null,
    };

    try {
      setSaving(true);

      const resp = await fetch("/api/interest-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || `Erro ao salvar ponto (HTTP ${resp.status})`);
      }

      let createdId: string | null = null;
      try {
        const body = await resp.json();
        if (body && body.objectId) {
          createdId = body.objectId as string;
        }
      } catch {
        // OK se não retornar JSON
      }

      // Upload de imagens
      if (createdId && imageFiles && imageFiles.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append("files", imageFiles[i]);
        }
        formData.append("parentObjectId", createdId);

        try {
          const uploadResp = await fetch("/api/images/upload-multiple", {
            method: "POST",
            body: formData,
          });

          if (!uploadResp.ok) {
            const text = await uploadResp.text().catch(() => "");
            console.error("Erro ao enviar imagens:", text || uploadResp.status);
            setErroSave(
              "Ponto criado, mas ocorreu um erro ao enviar as imagens."
            );
          }
        } catch (err) {
          console.error("Falha na requisição de upload de imagens:", err);
          setErroSave(
            "Ponto criado, mas ocorreu um erro ao enviar as imagens."
          );
        }
      }

      // Redireciona
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
      { enableHighAccuracy: true }
    );
  }

  const { latNum, lonNum } = getLatLonNums();
  const defaultCenter: [number, number] = [-30.885, -55.51];
  const mapCenter: [number, number] =
    latNum !== null && lonNum !== null ? [latNum, lonNum] : defaultCenter;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
            Uncovering History · Cadastro Completo
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Cadastrar novo ponto de interesse
          </h1>
          <p className="text-xs text-zinc-400">
            Preencha todos os campos disponíveis para documentar completamente o
            ponto histórico
          </p>
        </header>

        {erroInit && (
          <p className="rounded-xl border border-red-600 bg-red-950/40 px-4 py-2 text-xs text-red-200">
            {erroInit}
          </p>
        )}

        {/* MAPA */}
        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between px-4 py-2 text-[11px] text-zinc-400">
            <span>Mapa de localização do ponto</span>
            <span>
              Clique no mapa para posicionar • Arraste o marcador para ajustar
            </span>
          </div>
          <div className="h-[320px] w-full">
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapaClickHandler onSelect={updateLatLon} />
              {latNum !== null && lonNum !== null && pinIcon && (
                <Marker
                  position={[latNum, lonNum]}
                  draggable={true}
                  icon={pinIcon}
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
          className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6"
        >
          {/* Seção: Informações Básicas */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
              Informações Básicas
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-200">
                Nome do ponto *
              </label>
              <input
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Palácio Moysés Vianna"
                required
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
                  <option key="tipo-empty" value="">
                    Selecione um tipo (opcional)
                  </option>
                  {tipos.map((t, index) => (
                    <option
                      key={`tipo-${t.id ?? "sem-id"}-${index}`}
                      value={t.id}
                    >
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-200">
                  Ponto Pai (opcional)
                </label>
                <select
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option key="parent-empty" value="">
                    Nenhum (ponto independente)
                  </option>
                  {existingPoints.map((p, index) => (
                    <option
                      key={`parent-${p.objectId ?? "sem-id"}-${index}`}
                      value={p.objectId}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-500">
                  Selecione se este ponto faz parte de outro maior
                </p>
              </div>
            </div>
          </div>

          {/* Seção: Localização */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
              Localização
            </h2>

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
                  required
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
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={usarMinhaLocalizacao}
                  className="w-full whitespace-nowrap rounded-xl border border-emerald-500 bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-black shadow-sm transition hover:bg-emerald-500"
                >
                  📍 Minha localização
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
                  {bairros.map((b, index) => (
                    <option
                      key={`bairro-${index}`}
                      value={b}
                    />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-200">
                  País{" "}
                  {autoCountryLoading && (
                    <span className="text-[10px]">(detectando...)</span>
                  )}
                </label>
                <input
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCountryTouched(true);
                  }}
                  placeholder="Ex: Brasil, Uruguay..."
                />
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
          </div>

          {/* Seção: Descrição */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
              Descrição e Contexto
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-200">
                Descrição histórica
              </label>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do local, importância histórica, curiosidades, eventos relevantes..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-200">
                Contato (e-mail ou telefone)
              </label>
              <input
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Ex: contato@exemplo.org, (55) 99999-9999"
              />
            </div>
          </div>

          {/* Seção: Categorias */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
              Categorias e Classificações
            </h2>
            <p className="text-xs text-zinc-400">
              Selecione as categorias que se aplicam a este ponto (deixe em
              branco se não aplicável)
            </p>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-200">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Preservado",
                  "Em restauração",
                  "Deteriorado",
                  "Demolido",
                  "Tombado",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayValue(status, item, setStatus)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      status.includes(item)
                        ? "bg-emerald-500 text-black"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Histórica */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-200">
                Relevância Histórica
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Colonial",
                  "Imperial",
                  "Republicana",
                  "Guerra",
                  "Revolução",
                  "Cultura",
                  "Política",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      toggleArrayValue(historica, item, setHistorica)
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      historica.includes(item)
                        ? "bg-sky-500 text-black"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Arte */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-200">
                Arte e Arquitetura
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Barroco",
                  "Neoclássico",
                  "Modernista",
                  "Art Déco",
                  "Contemporâneo",
                  "Indígena",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayValue(arte, item, setArte)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      arte.includes(item)
                        ? "bg-purple-500 text-black"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Biológica */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-200">
                Relevância Biológica/Natural
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Árvore centenária",
                  "Jardim histórico",
                  "Biodiversidade",
                  "Espécie nativa",
                  "Reserva",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      toggleArrayValue(biologica, item, setBiologica)
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      biologica.includes(item)
                        ? "bg-green-500 text-black"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Química */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-200">
                Relevância Química/Industrial
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Indústria histórica",
                  "Mineração",
                  "Farmacêutica",
                  "Química",
                  "Produção artesanal",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayValue(quimica, item, setQuimica)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      quimica.includes(item)
                        ? "bg-orange-500 text-black"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seção: Campos Personalizados */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
              Campos Personalizados (Opcional)
            </h2>

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={customFieldKey}
                onChange={(e) => setCustomFieldKey(e.target.value)}
                placeholder="Nome do campo"
              />
              <input
                type="text"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                value={customFieldValue}
                onChange={(e) => setCustomFieldValue(e.target.value)}
                placeholder="Valor"
              />
              <button
                type="button"
                onClick={addCustomField}
                className="rounded-xl border border-emerald-500 bg-emerald-600 px-4 py-1.5 text-xs font-medium text-black hover:bg-emerald-500"
              >
                + Adicionar
              </button>
            </div>

            {Object.entries(customFields).length > 0 && (
              <div className="space-y-2">
                {Object.entries(customFields).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                  >
                    <span className="text-zinc-100">
                      <span className="font-medium text-emerald-400">
                        {key}:
                      </span>{" "}
                      {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCustomField(key)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção: Imagens */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
              Imagens
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-200">
                Selecionar imagens
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="block w-full text-xs text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-xs file:font-medium file:text-black hover:file:bg-emerald-500"
                onChange={(e) => setImageFiles(e.target.files)}
              />
              <p className="text-[11px] text-zinc-500">
                Formatos aceitos: JPEG, PNG, GIF, WebP. As imagens serão
                associadas ao ponto após criação.
              </p>
            </div>
          </div>

          {erroSave && (
            <p className="rounded-xl border border-red-600 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              ⚠️ {erroSave}
            </p>
          )}

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full border border-emerald-400 bg-emerald-500 px-6 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-emerald-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "💾 Salvando..." : "✓ Salvar ponto completo"}
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 px-6 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
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
