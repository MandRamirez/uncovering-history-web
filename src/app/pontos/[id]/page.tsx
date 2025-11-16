"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// -----------------------
// Tipagens básicas
// -----------------------
type TipoBruto =
  | string
  | {
      id: string;
      name: string;
      icon?: string;
      color?: string;
    };

type ChildPoint = {
  objectId: string;
  name: string;
  description?: string | null;
  lat?: number;
  lon?: number;
  type?: TipoBruto;
  photoUrls?: string[];
};

type InterestPoint = {
  objectId: string;
  name: string;
  description?: string | null;
  lat: number;
  lon: number;
  type: TipoBruto;
  address?: string | null;
  neighborhood?: string | null;
  contact?: string | null;
  children?: ChildPoint[];
  photoUrls?: string[];
  photoIds?: string[]; // no teu JSON isso já são URLs
};

// Helper pra pegar o nome do tipo, seja string ou objeto
function getTypeName(t?: TipoBruto): string {
  if (!t) return "";
  return typeof t === "string" ? t : t.name ?? "";
}

export default function InterestPointPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [ponto, setPonto] = useState<InterestPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/interest-points/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: InterestPoint = await res.json();
        setPonto(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Erro ao carregar ponto");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (!id) {
    return <p style={{ color: "red" }}>ID não informado na rota.</p>;
  }

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: "red" }}>Erro: {error}</p>;
  if (!ponto) return <p>Nenhum ponto encontrado.</p>;

  const tipoPrincipal = getTypeName(ponto.type);
  const fotos = ponto.photoUrls ?? ponto.photoIds ?? [];

  return (
    <main
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1>{ponto.name}</h1>

      {tipoPrincipal && (
        <p>
          <strong>Tipo:</strong> {tipoPrincipal}
        </p>
      )}

      <p>
        <strong>Lat/Lon:</strong> {ponto.lat}, {ponto.lon}
      </p>

      {ponto.neighborhood && (
        <p>
          <strong>Bairro:</strong> {ponto.neighborhood}
        </p>
      )}

      {ponto.address && (
        <p>
          <strong>Endereço:</strong> {ponto.address}
        </p>
      )}

      {ponto.contact && (
        <p>
          <strong>Contato:</strong> {ponto.contact}
        </p>
      )}

      {ponto.description && (
        <>
          <h2>Descrição</h2>
          <p>{ponto.description}</p>
        </>
      )}

      {fotos.length > 0 && (
        <>
          <h2>Fotos</h2>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            {fotos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={ponto.name}
                style={{
                  width: "240px",
                  height: "160px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            ))}
          </div>
        </>
      )}

      {ponto.children && ponto.children.length > 0 && (
        <>
          <h2>Elementos relacionados</h2>
          <ul>
            {ponto.children.map((child) => (
              <li key={child.objectId} style={{ marginBottom: "1rem" }}>
                <strong>{child.name}</strong>{" "}
                {getTypeName(child.type) && `(${getTypeName(child.type)})`}
                {child.lat != null && child.lon != null && (
                  <div>
                    <small>
                      Lat/Lon: {child.lat}, {child.lon}
                    </small>
                  </div>
                )}
                {child.description && <div>{child.description}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
